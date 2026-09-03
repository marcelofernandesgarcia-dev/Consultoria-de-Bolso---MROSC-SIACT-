import 'dotenv/config';
import ws from 'ws';
// @ts-ignore
if (!globalThis.WebSocket) globalThis.WebSocket = ws;
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import multer from "multer";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import { syncMapaOsc, syncSoAreas } from "./src/lib/ipea.js";
import { BASE_NORMATIVA_MROSC, TCU_NORMATIVOS_RESUMO } from "./src/lib/normativos.js";

const _require = createRequire(import.meta.url);
// pdf-parse v2 reescreveu a API: não é mais uma função, é a classe PDFParse (new PDFParse({ data }).getText()).
const { PDFParse } = _require("pdf-parse") as {
  PDFParse: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> };
};

// Initialize Supabase
const supabase = createSupabaseClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Initialize Claude (Anthropic) — motor de IA do SIACT-MROSC
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  return new Anthropic({
    apiKey,
    defaultHeaders: workspaceId ? { "anthropic-workspace-id": workspaceId } : undefined,
  });
};

// Extrai o primeiro bloco de texto de uma resposta da Messages API
function claudeText(msg: Anthropic.Message): string {
  const block = msg.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  return block?.text ?? "";
}

// Busca e extrai o texto limpo da página de um edital específico (whitelist de domínio por segurança)
const EDITAL_ALLOWED_HOSTS = ["prosas.com.br"];
async function fetchEditalContent(link: string): Promise<string> {
  const url = new URL(link);
  if (!EDITAL_ALLOWED_HOSTS.includes(url.hostname)) {
    throw new Error("Domínio não permitido para busca de edital.");
  }
  const res = await fetch(link, { headers: { "User-Agent": "SIACT-MROSC/4.0 (gov.br)" } });
  if (!res.ok) throw new Error(`Falha ao acessar o edital: HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const descricao = $(".summernote_description").first();
  const text = (descricao.length ? descricao.text() : $("body").text())
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40000);
  if (!text) throw new Error("Não foi possível extrair conteúdo do edital.");
  return text;
}

// Nome do incentivador (organização promotora) a partir do array "included" do JSON:API da Prosas
function nomeIncentivador(item: any, included: any[]): string {
  const relId = item.relationships?.incentivador?.data?.id;
  const found = relId ? included.find((inc) => inc.type === "incentivador" && inc.id === relId) : null;
  return found?.attributes?.nome_fantasia ?? item.attributes?.nome_empresa ?? "";
}

// Bloco de governança compartilhado por todo prompt de IA do SIACT — limitações reais do estágio
// atual (MVP), proibição de alucinação e prioridade às regras da administração pública federal.
const GOVERNANCA_IA_PROMPT = `
# GOVERNANÇA E LIMITAÇÕES DO ESTÁGIO ATUAL (MVP)
- Este projeto está em fase de validação (MVP) junto à alta gestão (DTPAR). A integração nativa com a infraestrutura e APIs do SERPRO ocorrerá apenas após a institucionalização do projeto.
- Seu motor de busca hoje baseia-se ESTRITAMENTE no consumo de Dados Abertos Governamentais (Portal Transferegov, Mapa das OSCs/IPEA e Portal da Transparência) — nunca prometa ou simule integrações diretas com sistemas restritos (como InfoConv ou Datavalid) neste momento.
- PROIBIDO ALUCINAR: baseie toda resposta exclusivamente nos normativos legais e no conteúdo fornecido no contexto da conversa — nunca invente dispositivo legal, dado ou fato que não esteja explicitamente disponível.
- PRIORIDADE: as regras da administração pública federal (Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência) têm prioridade sobre qualquer outra consideração de estilo ou conveniência.
- CITAÇÃO OBRIGATÓRIA: toda afirmação normativa deve vir acompanhada do Artigo e da Lei/Decreto correspondente.
- VALIDAÇÃO CRUZADA: sempre oriente o usuário a cruzar informações processuais com as bases de Dados Abertos disponíveis.
- SUBORDINAÇÃO: você é um assistente tecnológico (copiloto) — a decisão final, a assinatura de pareceres e a aprovação de contas permanecem sob a exclusiva competência e responsabilidade do gestor público humano.
`;

// Faz parsing robusto de uma resposta JSON do Claude (com fallback para bloco ```json)
function parseAiJson<T = any>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch { /* cai no fallback */ }
    }
    return fallback;
  }
}

// Configure multer for memory storage — limite de 10MB (mesmo teto já anunciado no frontend)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const VALID_ANALYSIS_TYPES = [
  'requirements_eligibility', 'requirements_docs', 'requirements_budget',
  'mrosc_router', 'celebration_validation', 'celebration_term',
  'celebration_workplan', 'radar_normativo', 'cotacao_previa',
  'auditoria_nexo_causal', 'papeis_impedimentos', 'osc_edital', 'osc_proposal',
  'gerador_parecer'
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Security headers — CSP só em produção: em dev o cliente do Vite (HMR) precisa de
  // liberdade que uma CSP estrita quebraria (WebSocket em porta variável, module scripts
  // injetados). O app não usa <img> (todos os ícones são SVG via lucide-react) e só carrega
  // recurso externo do Google Fonts (fonte Public Sans) — daí as duas exceções abaixo.
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // estilos inline (style={{...}}) + folha de estilo do Google Fonts
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
      },
    } : false,
  }));

  // CORS — permite apenas origens conhecidas
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  }));

  // Rate limiting — 60 req/min por IP nos endpoints de IA
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
  });
  app.use('/api/', aiLimiter);

  // Payload reduzido (era 50mb — vulnerabilidade de DoS)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- AUTH MIDDLEWARE ---
  // Verifica o JWT Supabase e anexa user_id verificado ao request
  async function getAuthUser(req: express.Request): Promise<string | null> {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    const token = auth.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  }

  // --- HEALTH CHECK ---
  app.get("/api/health", async (_req, res) => {
    const base = { version: "4.0.0", env: process.env.NODE_ENV ?? "development", timestamp: new Date().toISOString() };
    try {
      const { error } = await supabase.from('analysis_history').select('id').limit(1);
      if (error) throw error;
      res.json({ status: "ok", ...base });
    } catch (err: any) {
      res.status(503).json({ status: "down", ...base, error: err.message });
    }
  });

  // --- PDF PARSING API ---
  app.post("/api/parse-pdf", (req, res) => {
    upload.single("file")(req, res, async (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "Arquivo muito grande. O limite é 10MB." });
        }
        return res.status(400).json({ error: "Erro ao processar o upload: " + err.message });
      }
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Nenhum arquivo enviado." });
        }
        const parser = new PDFParse({ data: req.file.buffer });
        const data = await parser.getText();
        await parser.destroy();
        res.json({ text: data.text });
      } catch (error: any) {
        console.error("PDF parsing error:", error);
        res.status(500).json({ error: "Erro ao processar o PDF. " + error.message });
      }
    });
  });

  // --- DASHBOARD API ---
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = await getAuthUser(req);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base = (q: any) => userId ? q.eq('user_id', userId) : q;

      const [totalRes, approvedRes, warningRes, rejectedRes, recentRes] = await Promise.all([
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })),
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })).eq('status', 'CONFORME'),
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })).eq('status', 'RESSALVA'),
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })).eq('status', 'NAO_CONFORME'),
        base(supabase.from('analysis_history').select('id, document_name, status, date, type')).order('date', { ascending: false }).limit(5),
      ]);

      // Cada resposta do Supabase carrega seu próprio `error` — sem checar, uma falha
      // de permissão vira silenciosamente "0 análises" em vez de aparecer como erro real.
      const firstError = [totalRes, approvedRes, warningRes, rejectedRes, recentRes].find(r => r.error)?.error;
      if (firstError) throw firstError;

      const growth = { total: 0, approved: 0, warning: 0, rejected: 0 };
      res.json({
        stats: { total: totalRes.count ?? 0, approved: approvedRes.count ?? 0, warning: warningRes.count ?? 0, rejected: rejectedRes.count ?? 0, growth },
        recent: recentRes.data ?? [],
      });
    } catch (error: any) {
      console.error("Dashboard error:", error);
      // Consultas com { head: true } não trazem corpo na resposta do Postgrest —
      // um erro de permissão nelas chega com error.message vazio.
      res.status(500).json({ error: error.message || "Erro ao consultar analysis_history" });
    }
  });

  // --- MROSC ANALYSIS API ---
  app.post("/api/analyze-mrosc", async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
      const { type, textContent, documentName = "Documento Sem Nome", context = {} } = req.body;

      if (!type || !VALID_ANALYSIS_TYPES.includes(type)) {
        return res.status(400).json({ error: `Tipo de análise inválido. Valores aceitos: ${VALID_ANALYSIS_TYPES.join(', ')}` });
      }
      if (!textContent || typeof textContent !== 'string') {
        return res.status(400).json({ error: 'textContent é obrigatório e deve ser uma string.' });
      }
      if (textContent.length > 80000) {
        return res.status(400).json({ error: 'Documento muito extenso. Máximo 80.000 caracteres.' });
      }

      const anthropic = getAnthropicClient();

      let systemInstruction = `
      # PERSONA E AUTORIDADE TÉCNICA
      - Você é o SIACT — Sistema Inteligente de Análise e Controle de Transferências da União, integrado à plataforma MROSC Consultoria de Bolso.
      - Atua como o braço direito do Coordenador de Análise Financeira, com 15 anos de experiência e doutorado em IA e Governança Pública.
      - Sua missão é garantir a eficácia e eficiência nas parcerias, sob o rigor da Lei nº 13.019/2014 e do Decreto nº 11.948/2024.

      # PRINCÍPIOS DA ADMINISTRAÇÃO PÚBLICA (SGD/SERPRO)
      - Obedeça estritamente aos pilares de Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência.
      - Todas as análises devem ser imparciais, baseadas em critérios objetivos e livres de preconceitos (Viés de Representatividade ou Seleção).

      # DIRETRIZES DE CONTROLE, ESTILO E SEGURANÇA (LGPD)
      - ESTILO: Substitua "informamos" por "informo" e utilize sempre "pactuar" em vez de "balizar".
      - SEGURANÇA: Proibido processar dados sensíveis reais (CPF, saúde) sem anonimização (Mascaramento/Tokenização).
      - TRANSPARÊNCIA: Toda saída documental deve conter a nota: "Parte do conteúdo gerado com o auxílio de IA".
      - RESPONSABILIDADE: Inclua o alerta de que o servidor permanece responsável pela revisão e autoria plena do resultado.
      - Saída obrigatória em JSON para o sistema e texto formatado para o usuário, incluindo o campo 'fundamentacao_legal_especifica'.

      # LOGICA DE PENSAMENTO (CHAIN-OF-THOUGHT)
      Antes de cada resposta, você deve:
      1. Validar a conformidade normativa (o que a lei diz).
      2. Verificar o nexo causal (plano de trabalho vs execução).
      3. Apontar o dispositivo legal violado em caso de irregularidade.

      # MÓDULOS LÓGICOS DE EXECUÇÃO
      1. ELEGIBILIDADE (1.1): Valide tempo de existência, CNDs e histórico da OSC (Art. 33 da Lei 13.019).
      2. ORÇAMENTO (1.3): Identifique vedações do Art. 45 e execute análise de economicidade.
      3. ROTEADOR MROSC (2.1): Classifique o instrumento (Fomento/Colaboração) com base no nexo causal e iniciativa.
      4. RANKING DE PROPOSTAS (5.0): Atribua notas conforme critérios do Art. 27 do Decreto 11.948/2024.
      5. VALIDAÇÃO JURÍDICA (6.0): Realize o cruzamento final entre Plano de Trabalho e Minuta para assegurar o que foi pactuado.

      IMPORTANTE: Sua saída JSON deve SEMPRE incluir um campo "status_final" com um dos valores: 'CONFORME', 'RESSALVA', 'NAO_CONFORME' e o campo 'fundamentacao_legal_especifica'.
      ` + GOVERNANCA_IA_PROMPT + "\n\n" + BASE_NORMATIVA_MROSC;

      // --- TELA 1: ANÁLISE DE REQUISITOS ---
      if (type === 'requirements_eligibility') { // Prompt 1.1
        systemInstruction += `
        TAREFA: Verificação de Elegibilidade da OSC (Lei 13.019/2014).
        
        PENSAMENTO (CHAIN OF THOUGHT):
        1. Identifique a data de fundação da OSC e calcule o tempo de existência.
        2. Verifique documentos de regularidade fiscal (CND, FGTS, Trabalhista).
        3. Busque evidências de experiência prévia em projetos similares.
        4. Compare cada item com o Art. 33 e 34 da Lei 13.019/2014.
        
        CRITÉRIOS OBRIGATÓRIOS:
        - Tempo de existência: varia por esfera federativa — 1/2/3 anos conforme Município/Estado-DF/União (Art. 33, V, a).
        - Regularidade fiscal, previdenciária e tributária (Art. 34, II) e existência jurídica comprovada (Art. 34, III).
        - Experiência prévia comprovada (Art. 33, V, b).
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Resumo executivo da elegibilidade...",
          "reasoning": "Explicação passo a passo da análise...",
          "details": [ { "criteria": string, "result": string, "legal_ref": string } ],
          "missing_requirements": ["Lista de pendências com citação legal..."],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'requirements_docs') { // Prompt 1.2
        systemInstruction += `
        TAREFA: Checklist de Documentação Obrigatória (Decreto 11.948/2024).
        
        PENSAMENTO (CHAIN OF THOUGHT):
        1. Liste todos os documentos encontrados no texto.
        2. Verifique a validade e completude de cada um.
        3. Identifique ausências críticas baseadas no Art. 26 do Decreto 11.948/2024.
        
        VERIFICAÇÕES:
        - Estatuto Social registrado.
        - Ata de eleição da diretoria atual.
        - Relação nominal dos dirigentes.
        - Declaração de não impedimento (Art. 39 Lei 13.019).
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Resumo da conferência documental...",
          "reasoning": "Lógica da conferência...",
          "missing_docs": ["Doc 1", "Doc 2"],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'celebration_validation') { // Prompt 6.0
        systemInstruction += `
        TAREFA: Validação de Celebração e Nexo Causal (Módulo 6.0).
        
        PENSAMENTO (CHAIN OF THOUGHT):
        1. Compare as metas e atividades do Plano de Trabalho com as cláusulas da Minuta do Termo.
        2. Verifique se o objeto pactuado está idêntico em ambos os documentos.
        3. Identifique se há nexo causal entre os recursos alocados e as metas estabelecidas.
        4. Verifique a presença das cláusulas obrigatórias do Art. 42 da Lei 13.019/2014.
        
        CRITÉRIOS DE VALIDAÇÃO:
        - Identidade do objeto (Art. 42, I).
        - Vigência compatível (Art. 42, VI).
        - Contrapartida, se houver (Art. 42, V).
        - Nexo Causal Orçamentário — finalidade alheia ao objeto é vedada (Art. 45, I).
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Resumo da validação de nexo causal...",
          "reasoning": "Lógica do cruzamento documental...",
          "details": [ { "criteria": string, "result": string, "legal_ref": string } ],
          "missing_requirements": ["Inconsistências encontradas..."],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'requirements_budget') { // Prompt 1.3
        systemInstruction += `
        TAREFA: Validação de Itens de Despesa (Lei 13.019, Art. 46).
        
        PENSAMENTO (CHAIN OF THOUGHT):
        1. Extraia cada item de despesa e valor.
        2. Classifique a natureza da despesa (RH, Bens, Serviços).
        3. Verifique se há vedação legal para cada natureza (Art. 45).
        4. Avalie a compatibilidade de preços (se houver referência).
        
        VERIFICAÇÕES:
        - Itens permitidos: RH, diárias, bens, serviços, custos indiretos.
        - Vedações: Pagamento de servidor público (salvo exceções), despesas fora da vigência.
        - Coerência: Os valores são compatíveis com mercado?
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Parecer orçamentário...",
          "reasoning": "Análise detalhada dos itens...",
          "approved_items": ["Item A", "Item B"], 
          "rejected_items": ["Item C (Motivo: Art. X)"], 
          "notes": "Observações gerais",
          "fundamentacao_legal_especifica": "string"
        }
        `;
      }

      // --- TELA 2: ROTEADOR MROSC ---
      else if (type === 'mrosc_router') { // Prompt 2.1
        systemInstruction += `
        TAREFA: Classificar o tipo de instrumento (Fomento, Colaboração ou Acordo).
        
        PENSAMENTO (CHAIN OF THOUGHT):
        1. Analise se há transferência de recursos financeiros da Administração para a OSC.
           - SE NÃO: Classifique como Acordo de Cooperação (Art. 2º, VIII-A).
           - SE SIM: Vá para o passo 2.
        2. Identifique a origem da iniciativa (quem propôs o plano?).
           - SE ADMINISTRAÇÃO (com parâmetros pré-definidos): Termo de Colaboração (Art. 2º, VII).
           - SE OSC (inovação/proposta própria): Termo de Fomento (Art. 2º, VIII).
        
        SAÍDA JSON: { 
          "status_final": "CONFORME",
          "summary": "Classificação sugerida...",
          "reasoning": "Explicação da árvore de decisão...",
          "instrument_type": "Termo de Fomento" | "Termo de Colaboração" | "Acordo de Cooperação", 
          "justification": "Justificativa legal...", 
          "required_clauses": ["Cláusula 1", "Cláusula 2"],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      }

      // --- TELA 3: ASSISTENTE OSC ---
      else if (type === 'osc_edital') { // Prompt 3.2
        systemInstruction += `
        TAREFA: Explicar o Edital em linguagem simples para a OSC.
        AÇÃO: Resuma o objeto, prazos, critérios de seleção e documentos necessários.
        TOM: Educativo, claro e encorajador.
        
        SAÍDA JSON: { 
          "status_final": "CONFORME",
          "summary": "Resumo do edital...",
          "deadlines": string[], 
          "checklist": string[], 
          "tips": string[],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'osc_proposal') { // Prompt 3.3
        systemInstruction += `
        TAREFA: Pré-análise preventiva da proposta da OSC.
        AÇÃO: Simule o papel da comissão de seleção. Identifique erros que levariam à desclassificação.
        VERIFICAÇÕES: Adequação ao objeto, clareza das metas, coerência orçamentária.
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Avaliação da proposta...",
          "score_prediction": number, 
          "weak_points": string[], 
          "suggestions": string[],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      }

      // --- TELA 4: FASE INTERNA (PLANEJAMENTO) ---
      else if (type === 'internal_planning_etp') { // Prompt 4.1
        systemInstruction += `
        TAREFA: Análise do Estudo Técnico Preliminar (ETP).
        VERIFICAÇÕES:
        - Justificativa da parceria está clara?
        - Avaliação de alternativas foi feita?
        - Estimativa de custos está fundamentada?
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Análise do ETP...",
          "viability": "VIÁVEL" | "INVIÁVEL", 
          "gaps": string[],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'internal_planning_edital') { // Prompt 4.2
        systemInstruction += `
        TAREFA: Validação da Minuta do Edital.
        VERIFICAÇÕES:
        - Critérios de seleção são objetivos? (Lei 13.019, Art. 27).
        - Previsão de acessibilidade/cotas?
        - Clareza sobre recursos e prazos.
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Análise da minuta do edital...",
          "compliance_score": number, 
          "legal_risks": string[],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      }

      // --- TELA 5: FASE DE SELEÇÃO ---
      else if (type === 'selection_ranking') { // Prompt 5.1
        systemInstruction += `
        TAREFA: Ranqueamento de Propostas.
        AÇÃO: Atribua notas baseadas nos critérios do edital fornecido no contexto.
        CRITÉRIOS TÍPICOS: Mérito da proposta, capacidade técnica, custo-benefício.
        
        SAÍDA JSON: { 
          "status_final": "CONFORME",
          "summary": "Ranking da proposta...",
          "score": number, 
          "breakdown": object, 
          "rank_position": number,
          "fundamentacao_legal_especifica": "string"
        }
        `;
      }

      // --- TELA 6: FASE DE CELEBRAÇÃO ---
      else if (type === 'celebration_term') { // Prompt 6.1
        systemInstruction += `
        TAREFA: Validação do Termo Final de Parceria.
        VERIFICAÇÕES:
        - Cláusulas essenciais (Art. 42 Lei 13.019): Objeto, vigência, valor, prestação de contas.
        - Direitos e deveres das partes.
        - Titularidade de bens remanescentes.
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Análise do termo final...",
          "is_ready_to_sign": boolean, 
          "missing_clauses": string[],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'celebration_workplan') { // Prompt 6.2
        systemInstruction += `
        TAREFA: Validação Final do Plano de Trabalho.
        VERIFICAÇÕES:
        - Metas claras e mensuráveis?
        - Cronograma de desembolso compatível com execução?
        - Aprovação técnica prévia existe?
        
        SAÍDA JSON: { 
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "summary": "Análise do plano de trabalho final...",
          "status": "APROVADO" | "AJUSTES NECESSÁRIOS", 
          "comments": string,
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'radar_normativo') {
        systemInstruction += `
        TAREFA: Análise de Editais e Estatutos (Radar Normativo).
        PENSAMENTO:
        1. Verifique a conformidade do texto com o Decreto 11.948/2024.
        2. Identifique documentos que podem ser dispensados.
        3. Aponte alertas de transição e sugestões de reajuste.
        
        SAÍDA JSON: {
          "status_final": "CONFORME" | "ATENCAO" | "INCONFORME",
          "documentosDispensados": ["doc1", "doc2"],
          "alertaTransicao": "string",
          "sugestaoReajuste": "string",
          "pontosAtencao": [{ "titulo": "string", "descricao": "string", "acaoRecomendada": "string" }],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'cotacao_previa') {
        systemInstruction += `
        TAREFA: Análise de Cotação Prévia de Preços — MROSC / Lei 13.019/2014

        BASE LEGAL VINCULANTE:
        - Art. 46, Lei 13.019/2014: compatibilidade dos preços com os praticados no mercado é obrigatória
        - Art. 45, I, Lei 13.019/2014: vedado usar recursos para finalidade alheia ao objeto da parceria
        - Decreto 8.726/2016, Art. 39, §1º (redação do Decreto 11.948/2024): multas, juros ou correção monetária só podem ser pagos com recursos da parceria quando decorrerem de atraso da ADMINISTRAÇÃO PÚBLICA em liberar parcelas — nunca por atraso da própria OSC
        - IN SEGES/ME nº 65/2021, Art. 5º, IV: pesquisa direta com no mínimo 3 fornecedores é um dos parâmetros aceitos de pesquisa de preços
        - IN SEGES/ME nº 65/2021, Art. 2º, II: sobrepreço é definido de forma qualitativa (preço "expressivamente superior" ao de mercado) — a norma não fixa percentual; os limiares de +10%/+25% abaixo são critério operacional deste sistema, não citação literal da IN

        ETAPAS DE ANÁLISE OBRIGATÓRIAS:
        1. Para CADA item, calcule a variação: ((valorUnitarioCotado - valorUnitarioReferencia) / valorUnitarioReferencia) × 100
           - Até +10%: CONFORME (variação de mercado aceitável)
           - +10% a +25%: RESSALVA (variação significativa — exige justificativa documental)
           - Acima de +25%: REJEITADO (indício forte de sobrepreço, por critério operacional deste sistema — a exigência legal de fundo é a compatibilidade de mercado do Art. 46 da Lei 13.019/2014)
           - Negativo: CONFORME (economia para a parceria — verifique sustentabilidade do fornecedor)
        2. Avalie a coerência entre descrição e valor unitário (ex: notebook por R$ 300 é implausível; serviço por R$ 5.000.000 merece ressalva)
        3. Identifique itens vedados: finalidade alheia ao objeto da parceria (Art. 45, I, Lei 13.019/2014); multas/juros só se decorrentes de atraso da administração pública (Decreto 8.726/2016, Art. 39, §1º)
        4. Determine status_final pela regra do item mais crítico presente na cotação

        REGRAS DE STATUS GLOBAL:
        - CONFORME: todos os itens dentro de +10%, sem itens vedados
        - RESSALVA: ao menos um item entre +10% e +25%, nenhum acima de +25%, sem itens vedados
        - REJEITADO: qualquer item acima de +25% OU item vedado identificado OU incoerência grave de valor

        SAÍDA JSON OBRIGATÓRIA (sem campos extras fora deste schema):
        {
          "status_final": "CONFORME" | "RESSALVA" | "REJEITADO",
          "message": "Resumo executivo objetivo com diagnóstico global em 2-3 frases diretas",
          "details": [
            "Fundamentação técnica ou recomendação prática 1",
            "Fundamentação técnica ou recomendação prática 2"
          ],
          "analise_por_item": [
            {
              "descricao": "nome do item exatamente como enviado",
              "variacao_pct": 12.5,
              "status_item": "CONFORME" | "RESSALVA" | "REJEITADO",
              "observacao": "comentário técnico específico e objetivo sobre este item"
            }
          ],
          "fundamentacao_legal_especifica": "Artigos e dispositivos legais aplicáveis com breve explicação"
        }
        `;
      } else if (type === 'auditoria_nexo_causal') {
        systemInstruction += `
        TAREFA: Auditoria de Nexo Causal.
        PENSAMENTO:
        1. Cruze a descrição da despesa com a meta do plano de trabalho.
        2. Verifique se a despesa contribui diretamente para a meta.
        
        SAÍDA JSON: {
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME",
          "analise": "string",
          "evidenciasValidadas": ["evidencia 1"],
          "riscosIdentificados": ["risco 1"],
          "recomendacoes": ["recomendacao 1"],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'papeis_impedimentos') {
        systemInstruction += `
        TAREFA: Análise de Papéis e Impedimentos (Art. 39 da Lei 13.019).
        PENSAMENTO:
        1. Analise os dirigentes listados.
        2. Identifique possíveis conflitos de interesse ou nepotismo.

        SAÍDA JSON: {
          "status_final": "aprovado" | "atencao" | "rejeitado",
          "titulo": "string",
          "conteudo": "string",
          "recomendacoes": ["recomendacao 1"],
          "baseLegal": ["Art. 39..."],
          "fundamentacao_legal_especifica": "string"
        }
        `;
      } else if (type === 'gerador_parecer') {
        systemInstruction += `
        TAREFA: Geração de Parecer Técnico Jurídico (MROSC).
        PENSAMENTO:
        1. Identifique a natureza da dúvida ou situação jurídica apresentada.
        2. Analise com base na Lei 13.019/2014, Decreto 11.948/2024 e demais normas aplicáveis.
        3. Formule uma conclusão objetiva, com fundamentação e citação dos dispositivos legais.
        4. Aponte ressalvas e limitações da análise quando pertinente.
        5. Forneça uma orientação prática final para o usuário.

        REGRAS:
        - Seja preciso e objetivo. Nunca presuma fatos não informados.
        - Cite sempre o artigo, inciso e lei/decreto que fundamenta cada afirmação.
        - Se a situação for inconclusiva por falta de dados, indique quais informações adicionais são necessárias.
        - O parecer é orientativo e consultivo — inclua isso na orientação final.

        SAÍDA JSON: {
          "status_final": "CONFORME" | "RESSALVA" | "NAO_CONFORME" | "INCONCLUSIVO",
          "conclusao": "Texto objetivo da conclusão jurídica, em 1-3 frases",
          "fundamentacao": "Fundamentação jurídica detalhada, passo a passo",
          "baseLegal": ["Art. X, Lei Y — descrição", "Art. Z, Decreto W — descrição"],
          "ressalvas": ["Ressalva ou limitação 1", "Ressalva ou limitação 2"],
          "orientacao": "Orientação prática final para o usuário — próximos passos concretos",
          "fundamentacao_legal_especifica": "string"
        }
        `;
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 8192,
        system: systemInstruction + "\n\nIMPORTANTE: Responda APENAS com o objeto JSON solicitado, sem texto antes ou depois, sem blocos de código markdown.",
        messages: [{ role: "user", content: `Analise o seguinte conteúdo:\n${textContent}` }],
      });

      // A IA pode devolver "status" e/ou "message" além dos campos padrão, dependendo do
      // tipo de análise — o índice extra reflete que o JSON real varia por `type`.
      const parsedData = parseAiJson<{
        status_final: string;
        summary: string;
        error: string;
        status?: string;
        message?: string;
        [key: string]: unknown;
      }>(claudeText(response), {
        status_final: "RESSALVA",
        summary: "Erro ao processar resposta da IA",
        error: "Non-JSON response",
      });

      // Normalise status field — AI returns status_final, frontend reads status
      if (!parsedData.status && parsedData.status_final) {
        parsedData.status = parsedData.status_final;
      }

      // Persist to Supabase — user_id já verificado via JWT no topo do handler.
      // Falha aqui não deve derrubar a resposta (a análise em si já foi concluída),
      // mas precisa ficar visível no log — antes era descartada em silêncio.
      const { error: historyError } = await supabase.from('analysis_history').insert({
        type,
        document_name: documentName,
        status: parsedData.status_final || 'RESSALVA',
        summary: parsedData.summary || parsedData.message || 'Sem resumo',
        details: parsedData,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      if (historyError) {
        console.error("Falha ao salvar histórico da análise (analysis_history):", historyError.message);
      }

      res.json(parsedData);

    } catch (error: any) {
      console.error("Error in MROSC analysis:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // --- OPPORTUNITIES RADAR API — consulta a API pública da Prosas (via widget do Mapa das OSC/IPEA), sem IA ---
  app.get("/api/mrosc/opportunities", async (req, res) => {
    try {
      const PAGE_SIZE = 100;
      const MAX_PAGES = 5; // trava de segurança — hoje bastam 2 páginas pros ~131 editais
      let page = 1;
      let totalPages = 1;
      const rawItems: any[] = [];
      const included: any[] = [];

      do {
        const apiRes = await fetch(
          `https://prosas.com.br/selecao/api/v2/publics/oportunidades?page[page]=${page}&page[size]=${PAGE_SIZE}&include=area_interesses,incentivador`,
          { headers: { "User-Agent": "SIACT-MROSC/4.0 (gov.br)" } }
        );
        if (!apiRes.ok) throw new Error(`Falha ao acessar a API da Prosas: HTTP ${apiRes.status}`);
        const json = await apiRes.json();
        rawItems.push(...(json.data ?? []));
        included.push(...(json.included ?? []));
        totalPages = json.links?.last ?? 1;
        page++;
      } while (page <= totalPages && page <= MAX_PAGES);

      const opportunities = rawItems
        .map((item) => {
          const attrs = item.attributes ?? {};
          const prazoContinuo = attrs.prazo === "continuo" || !attrs.data_final_inscricoes;
          const deadlineIso: string | null = prazoContinuo ? null : attrs.data_final_inscricoes;
          const date = deadlineIso
            ? new Date(deadlineIso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
            : "Inscrições contínuas";
          const org = nomeIncentivador(item, included);
          return {
            id: String(item.id),
            title: attrs.nome ?? "",
            link: `https://prosas.com.br/editais/${item.id}`,
            description: org,
            date,
            deadlineIso,
          };
        })
        .filter((op) => op.title && op.link)
        .sort((a, b) => {
          if (!a.deadlineIso && !b.deadlineIso) return 0;
          if (!a.deadlineIso) return 1; // contínuos vão pro fim
          if (!b.deadlineIso) return -1;
          return a.deadlineIso.localeCompare(b.deadlineIso); // prazo mais próximo primeiro
        })
        .map(({ deadlineIso, ...op }) => op);

      res.json({ opportunities, source: "https://mapaosc.ipea.gov.br/editais", total: opportunities.length });
    } catch (error: any) {
      console.error("Opportunities Radar error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Busca + explica um edital específico (link vindo do Radar) — automação ponta a ponta ---
  app.post("/api/mrosc/edital-explicar", async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
      const { link, title } = req.body;
      if (!link || typeof link !== "string") {
        return res.status(400).json({ error: "link é obrigatório." });
      }

      const editalText = await fetchEditalContent(link);
      const anthropic = getAnthropicClient();

      const systemInstruction = `
      # PERSONA E AUTORIDADE TÉCNICA
      - Você é o SIACT — Sistema Inteligente de Análise e Controle de Transferências da União, integrado à plataforma MROSC Consultoria de Bolso.
      - Atua como o braço direito do Coordenador de Análise Financeira, com 15 anos de experiência e doutorado em IA e Governança Pública.

      TAREFA: Explicar o edital abaixo em linguagem simples para uma OSC de pequeno/médio porte.
      AÇÃO: Resuma o objeto, prazos, critérios de seleção e documentos necessários.
      TOM: Educativo, claro e encorajador.
      IMPORTANTE: Se o conteúdo indicar que o edital já tem RESULTADO PRELIMINAR ou RESULTADO FINAL publicado, ou qualquer sinal de que o prazo já passou, avise isso claramente no campo "summary" — não trate como oportunidade aberta se já foi encerrado.

      Responda APENAS com o objeto JSON abaixo, sem texto antes ou depois, sem blocos de código markdown.

      SAÍDA JSON: {
        "status_final": "CONFORME",
        "summary": "Resumo do edital, incluindo alerta se já encerrado...",
        "deadlines": string[],
        "checklist": string[],
        "tips": string[]
      }
      ` + GOVERNANCA_IA_PROMPT;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 4096,
        system: systemInstruction,
        messages: [{ role: "user", content: `Título: ${title ?? ""}\nURL: ${link}\n\nConteúdo extraído da página do edital:\n${editalText}` }],
      });

      const parsedData = parseAiJson(claudeText(response), { summary: "Não foi possível analisar este edital." });
      res.json(parsedData);
    } catch (error: any) {
      console.error("Edital explicar error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Busca só o texto de um edital (sem IA) — usado para contextualizar a Pré-Análise da Proposta ---
  app.get("/api/mrosc/edital-texto", async (req, res) => {
    try {
      const link = req.query.link as string;
      if (!link) return res.status(400).json({ error: "link é obrigatório." });
      const text = await fetchEditalContent(link);
      res.json({ text });
    } catch (error: any) {
      console.error("Edital texto error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
      const { textContent, images } = req.body;

      if (!textContent && (!images || images.length === 0)) {
        return res.status(400).json({ error: "No content provided for analysis" });
      }

      const anthropic = getAnthropicClient();

      const systemInstruction = `
# PERSONA E AUTORIDADE TÉCNICA
- Você é o SIACT — Sistema Inteligente de Análise e Controle de Transferências da União, integrado à plataforma MROSC Consultoria de Bolso.
- Atua como o braço direito do Coordenador de Análise Financeira, com 15 anos de experiência e doutorado em IA e Governança Pública.
- Sua missão é garantir a eficácia e eficiência nas parcerias, sob o rigor da Lei nº 13.019/2014 e do Decreto nº 11.948/2024.

# TAREFA
Sua especialidade é o processamento de processos administrativos (PDF) para análise de admissibilidade e prescrição (IN 98/2024, Resolução 344/2022).

# DIRETRIZES DE CONTROLE, ESTILO E SEGURANÇA (LGPD)
- ESTILO: Substitua "informamos" por "informo" e utilize sempre "pactuar" em vez de "balizar".
- SEGURANÇA: Proibido processar dados sensíveis reais (CPF, saúde) sem anonimização (Mascaramento/Tokenização).
- TRANSPARÊNCIA: Toda saída documental deve conter a nota: "Parte do conteúdo gerado com o auxílio de IA".
- RESPONSABILIDADE: Inclua o alerta de que o servidor permanece responsável pela revisão e autoria plena do resultado.
- Saída obrigatória em JSON para o sistema e texto formatado para o usuário, incluindo o campo 'fundamentacao_legal_especifica'.

OBRIGATÓRIO: Retorne APENAS um objeto JSON válido. Não use blocos de código markdown.

OBJETIVOS DE EXTRAÇÃO:
Realize uma análise minuciosa do conteúdo fornecido para preencher os seguintes campos:
- numero_processo: Número do Processo (SEI) e Número da TCE (se houver).
- instrumento_siafi: Instrumento SIAFI (6 dígitos).
- concedente: Nome do órgão concedente.
- convenente: Nome da entidade convenente.
- valor_atualizado: Valor total. Se fato gerador < 01/01/2024, indique que deve ser aplicado atualização monetária. Se posterior, use valor original.
- fase_diagnostico: Identifique se é "Prestação de Contas" (Estágio I/II) ou "TCE Instaurada" (Estágio III).
- aptidao: "Apto" ou "Inapto" (se ilegível ou não for processo de contas).
- status_prescricao: "Regular" ou "Prescrito" (ou "Risco de Prescrição").
- analise_prescricao: Detalhe a análise de prescrição (Intercorrente 3 anos / Principal 5 anos).
- atos_interruptivos: Lista de atos interruptivos encontrados (Notificações, Notas Técnicas, Relatórios de Auditoria, Instauração de TCE).
- atos_ignorados: Lista de atos de mero seguimento ignorados.
- conclusao: Texto conclusivo. Se regular, informe: "O PROCESSO CONTINUA EM ANÁLISE REGULAR".

Para cada campo extraído, tente identificar a página de origem (se fornecida no contexto) e inclua no campo "evidencia_paginas".

ESTRUTURA JSON ESPERADA:
{
  "metadados": {
    "numero_processo": "string",
    "numero_tce": "string | null",
    "instrumento_siafi": "string | null",
    "concedente": "string | null",
    "convenente": "string | null",
    "valor_atualizado": "string"
  },
  "diagnostico": {
    "fase": "string",
    "aptidao": "Apto | Inapto",
    "resumo": "string"
  },
  "prescricao": {
    "status": "Regular | Prescrito | Risco",
    "analise_detalhada": "string",
    "atos_interruptivos": [{ "data": "string", "descricao": "string", "pagina": "number | string" }],
    "atos_mero_seguimento": [{ "data": "string", "descricao": "string", "pagina": "number | string" }]
  },
  "conclusao_final": "string",
  "fundamentacao_legal_especifica": "string"
}
` + GOVERNANCA_IA_PROMPT + "\n\n# BASE NORMATIVA VERIFICADA (prescrição e TCE)\n" + TCU_NORMATIVOS_RESUMO;

      const content: Anthropic.ContentBlockParam[] = [];

      if (textContent) {
        content.push({ type: "text", text: `Conteúdo textual do processo:\n${textContent}` });
      }

      if (images && Array.isArray(images)) {
        for (const img of images) {
            // img deve ser { data: base64String, mimeType: "image/png" }
            content.push({ type: "image", source: { type: "base64", media_type: img.mimeType, data: img.data } });
        }
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 8192,
        system: systemInstruction,
        messages: [{ role: "user", content }],
      });

      const jsonResponse = claudeText(response);
      let parsedData;
      try {
        parsedData = JSON.parse(jsonResponse);
      } catch (e) {
        const match = jsonResponse.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
            parsedData = JSON.parse(match[1]);
        } else {
            throw new Error("Failed to parse JSON response");
        }
      }

      res.json(parsedData);

    } catch (error: any) {
      console.error("Error in analysis:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // --- HEALTH CHECK ---
  // --- CHAT API ---
  app.post("/api/chat", async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });
    try {
      const { message, systemPrompt: clientSystemPrompt } = req.body;
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Mensagem não pode estar vazia.' });
      }
      if (message.length > 10000) {
        return res.status(400).json({ error: 'Mensagem muito longa. Máximo 10.000 caracteres.' });
      }
      const anthropic = getAnthropicClient();

      const defaultSystemInstruction = `
# IDENTIDADE DO SISTEMA
Nome: SIACT — Sistema Inteligente de Análise e Controle de Transferências da União
Plataforma: MROSC Consultoria de Bolso
Versão: 1.0
Papel: Atue como um Coordenador de Transferências Voluntárias e Auditor Especialista no Marco Regulatório das Organizações da Sociedade Civil (MROSC).
Objetivo: Realizar análise automatizada, rigorosa e imparcial de documentos de parcerias entre a Administração Pública Federal e OSCs, garantindo 100% de conformidade legal.
Tom: Profissional, objetivo, fundamentado juridicamente, claro e didático. Sem ambiguidades.

# CONTEXTO INSTITUCIONAL E LEGAL
Órgão: Secretaria-Geral da Presidência da República / Ministério da Gestão e Inovação em Serviços Públicos (MGI).
Desafio: Reduzir o tempo de análise, eliminar a subjetividade e aplicar o princípio da proporcionalidade para OSCs pequenas.

## Base de Conhecimento Obrigatória (Repositório de Dados):
1. Lei 13.019/2014 (MROSC) e Lei 13.204/2015.
2. Decreto 11.948/2024 (Foco em modernização e simplificação).
3. Decreto 8.726/2016 (Regulamentação federal).
4. IN TCU 98/2024 (Tomada de Contas Especial e limites de materialidade).
5. Portaria Interministerial 197/2025 (Manual MROSC).
6. Lei Complementar 101/2000 (LRF).

# INSTRUÇÕES OPERACIONAIS E REGRAS DE GOVERNANÇA
Ao processar qualquer entrada, você DEVE obedecer estritamente às seguintes regras:

1. **Citação Obrigatória (Slow Intern Rule):** NUNCA faça afirmações genéricas. Toda exigência, aprovação ou rejeição DEVE citar o Artigo, Inciso e a Lei/Decreto específico que a fundamenta.
2. **Restrições Positivas:** Forneça análises específicas e objetivas. Se um critério for atendido, explique o *porquê* com base nos dados do documento.
3. **Proporcionalidade:** Aplique os requisitos simplificados do Decreto 11.948/2024 sempre que a parceria envolver OSCs de pequeno porte ou valores abaixo do limite de materialidade (R$ 120 mil, conforme IN TCU 98/2024).
4. **Chain of Thought (CoT):** Para análises complexas (orçamentos, elegibilidade, nexo causal), inicie seu processamento interno com "THINK STEP-BY-STEP": (1) Verificar dados, (2) Analisar categorias, (3) Comparar com legislação, (4) Identificar desvios, (5) Gerar parecer.
5. **Delimitadores:** Respeite os delimitadores enviados pelo usuário (\`### INSTRUÇÕES ###\`, \`### LEGISLAÇÃO ###\`, \`### DOCUMENTO ###\`) para isolar o contexto.

# FORMATO DE SAÍDA OBRIGATÓRIO (MARKDOWN ESTRUTURADO)
Sua resposta deve SEMPRE seguir a estrutura de Parecer Técnico abaixo quando analisar um documento:

### 📋 PARECER TÉCNICO — SIACT
### Sistema Inteligente de Análise e Controle de Transferências da União
**Documento Analisado:** [Tipo do Documento]
**Data da Análise:** [Data Atual]

#### 1. Verificação de Conformidade (Passo a Passo)
*Liste os critérios analisados de forma objetiva e mensurável.*
- **[Critério Analisado]:** [Status: Atende / Não Atende]
  - **Evidência no Documento:** [Trecho ou dado encontrado]
  - **Fundamentação Legal:** [Artigo e Lei correspondente]

#### 2. Identificação de Não Conformidades e Riscos
*Se houver falhas, liste-as aqui. Se não houver, declare "Nenhuma não conformidade identificada".*
- **Risco/Falha:** [Descrição clara da falha]
- **Base Legal Violada:** [Artigo e Lei]

#### 3. Conclusão e Veredito
- **RESULTADO:** [ELEGÍVEL / CONFORME / NÃO CONFORME / CONFORME COM RESSALVAS]
- **Justificativa:** [Resumo claro, rastreável e sem ambiguidades da decisão]

#### 4. Recomendações (Próximos Passos)
- [Ação corretiva para a OSC ou recomendação de aprovação para o Gestor Público]

# EXEMPLOS DE APLICAÇÃO (FEW-SHOT PROMPTING)

**EXEMPLO 1: Análise de Elegibilidade (APROVADA)**
- **Critério:** Tempo de existência da OSC.
- **Evidência:** CNPJ 12.345.678/0001-90 comprova fundação em 2019 (5 anos).
- **Fundamentação Legal:** Art. 33, inciso V, alínea "a" da Lei 13.019/2014 (exigência varia por esfera: 1/2/3 anos conforme Município/Estado-DF/União).
- **RESULTADO:** ELEGÍVEL.

**EXEMPLO 2: Análise de Edital (APROVADA)**
- **Critério:** Prazo de Inscrição.
- **Evidência:** Chamamento Público nº 001/2024 estabelece 45 dias.
- **Fundamentação Legal:** Art. 26 da Lei 13.019/2014 (mínimo de 30 dias).
- **RESULTADO:** CONFORME.

**EXEMPLO 3: Análise de Despesa (REJEITADA)**
- **Critério:** Pagamento de taxa de administração.
- **Evidência:** Plano de Trabalho prevê 5% para "taxa de administração".
- **Fundamentação Legal:** Art. 45, inciso I da Lei 13.019/2014 (despesa não vinculada à execução do objeto pactuado — finalidade alheia à parceria).
- **RESULTADO:** NÃO CONFORME.

# INSTRUÇÕES DE ITERAÇÃO E CONTROLE DE ERROS
- Se o documento fornecido estiver incompleto, **NÃO presuma informações**. Retorne o status "INCONCLUSIVO" e liste exatamente quais documentos ou dados faltam, citando a exigência legal.
- Em caso de conflito normativo, priorize a regra mais recente e específica (ex: inovações do Decreto 11.948/2024 sobre regras antigas).
- Mantenha a taxa de erro de análise abaixo de 1% atendo-se estritamente ao texto da lei.

      ` + BASE_NORMATIVA_MROSC;

      // Base normativa é sempre anexada, mesmo quando o cliente envia seu próprio systemPrompt
      // (AssistenteFlutuante/AssistenteSiact) — senão o grounding contra citação incorreta só
      // valeria pro prompt padrão, nunca pro assistente flutuante que é o mais usado.
      const systemInstruction = (typeof clientSystemPrompt === 'string' && clientSystemPrompt.trim().length > 0)
        ? clientSystemPrompt.trim().substring(0, 5000) + "\n\n" + BASE_NORMATIVA_MROSC
        : defaultSystemInstruction;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 4096,
        system: systemInstruction,
        messages: [{ role: "user", content: message }],
      });

      res.json({ reply: claudeText(response) });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── Lock global para evitar syncs concorrentes ───────────────────────────────
  let syncRunning = false;

  // ── Sync Mapa OSC / IPEA ─────────────────────────────────────────────────────
  app.post('/api/sync/mapa-osc', async (req, res) => {
    const auth = req.headers.authorization ?? '';
    const secret = process.env.SYNC_SECRET;
    if (!secret || auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    if (syncRunning) {
      return res.status(409).json({ error: 'Sync já em execução' });
    }

    // Registra início no log
    const { data: logRow } = await supabase
      .from('osc_sync_log')
      .insert({ status: 'RUNNING' })
      .select('id')
      .single();

    const logId = logRow?.id;
    const msgs: string[] = [];
    const log = (msg: string) => { msgs.push(msg); console.log(`[IPEA sync] ${msg}`); };

    // Responde imediatamente — sync roda em background
    syncRunning = true;
    res.json({ ok: true, logId, message: 'Sync iniciado em background' });

    try {
      const totais = await syncMapaOsc(log);
      if (logId) {
        await supabase.from('osc_sync_log').update({
          status:      'SUCCESS',
          finished_at: new Date().toISOString(),
          registros:   totais.osc,
          detalhes:    { ...totais, log: msgs },
        }).eq('id', logId);
      }
      console.log('[IPEA sync] Concluído:', totais);
    } catch (err: any) {
      console.error('[IPEA sync] Erro:', err.message);
      if (logId) {
        await supabase.from('osc_sync_log').update({
          status:      'ERROR',
          finished_at: new Date().toISOString(),
          detalhes:    { error: err.message, log: msgs },
        }).eq('id', logId);
      }
    } finally {
      syncRunning = false;
    }
  });

  // ── Busca OSC por CNPJ ────────────────────────────────────────────────────────
  app.get('/api/osc/:cnpj', async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });

    const cnpj = req.params.cnpj.replace(/\D/g, '').padStart(14, '0');

    const [{ data: osc }, { data: cebas }, { data: areas }, { data: projetos }] =
      await Promise.all([
        supabase.from('osc_cadastro').select('*').eq('cnpj', cnpj).single(),
        supabase.from('osc_certificacoes').select('*').eq('cnpj', cnpj),
        supabase.from('osc_areas').select('area, subarea').eq('cnpj', cnpj),
        supabase.from('osc_projetos').select('titulo, area, valor, inicio, termino, situacao')
          .eq('cnpj', cnpj).limit(10),
      ]);

    if (!osc) return res.status(404).json({ error: 'OSC não encontrada na base IPEA' });
    res.json({ osc, cebas: cebas ?? [], areas: areas ?? [], projetos: projetos ?? [] });
  });

  // ── Busca OSCs por nome/UF ────────────────────────────────────────────────────
  app.get('/api/osc', async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });

    const { q, uf, situacao, limit = '20', offset = '0' } = req.query as Record<string, string>;
    let query = supabase.from('osc_cadastro').select('cnpj, razao_social, municipio, uf, situacao, cnae_principal', { count: 'exact' });

    if (q)        query = query.ilike('razao_social', `%${q}%`);
    if (uf)       query = query.eq('uf', uf.toUpperCase());
    if (situacao) query = query.eq('situacao', situacao.toUpperCase());

    const { data, count, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order('razao_social');

    if (error) return res.status(500).json({ error: error.message });
    res.json({ data: data ?? [], total: count ?? 0 });
  });

  // ── Sync só de Áreas e Subáreas (XLSX pesado — roda isolado) ────────────────
  app.post('/api/sync/areas', async (req, res) => {
    const auth = req.headers.authorization ?? '';
    const secret = process.env.SYNC_SECRET;
    if (!secret || auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    const msgs: string[] = [];
    const log = (msg: string) => { msgs.push(msg); console.log(`[IPEA areas] ${msg}`); };
    res.json({ ok: true, message: 'Sync de Áreas iniciado em background' });
    try {
      const total = await syncSoAreas(log);
      console.log(`[IPEA areas] Concluído: ${total} registros`);
    } catch (err: any) {
      console.error('[IPEA areas] Erro:', err.message);
    }
  });

  // ── Status da última sincronização ───────────────────────────────────────────
  app.get('/api/sync/status', async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });

    const { data } = await supabase
      .from('osc_sync_log')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    res.json(data ?? []);
  });

  // ── Admin stats (acesso restrito por e-mail) ────────────────────────────────
  const ADMIN_EMAILS = ['marcelofernandesgarcia@gmail.com'];

  app.get('/api/admin/stats', async (req, res) => {
    const userId = await getAuthUser(req);
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });

    // Verifica se o e-mail do usuário é admin
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (!userData?.user?.email || !ADMIN_EMAILS.includes(userData.user.email)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [total, conforme, ressalva, naoConforme, last7] = await Promise.all([
      supabase.from('analysis_history').select('id', { count: 'exact', head: true }),
      supabase.from('analysis_history').select('id', { count: 'exact', head: true }).eq('status', 'CONFORME'),
      supabase.from('analysis_history').select('id', { count: 'exact', head: true }).eq('status', 'RESSALVA'),
      supabase.from('analysis_history').select('id', { count: 'exact', head: true }).eq('status', 'NAO_CONFORME'),
      supabase.from('analysis_history').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Conta usuários distintos
    const { data: users, error: usersError } = await supabase
      .from('analysis_history')
      .select('user_id')
      .not('user_id', 'is', null);

    // Sem essa checagem, uma falha de permissão vira "0 análises, 0 usuários" em vez de um erro visível.
    const statsError = [total, conforme, ressalva, naoConforme, last7].find(r => r.error)?.error ?? usersError;
    if (statsError) {
      console.error("Erro ao consultar analysis_history (admin/stats):", statsError.message);
      return res.status(500).json({ error: statsError.message || "Erro ao consultar analysis_history" });
    }

    const uniqueUsers = new Set((users ?? []).map((r: any) => r.user_id)).size;

    res.json({
      total_analyses: total.count ?? 0,
      conforme: conforme.count ?? 0,
      ressalva: ressalva.count ?? 0,
      nao_conforme: naoConforme.count ?? 0,
      last_7_days: last7.count ?? 0,
      total_users: uniqueUsers,
    });
  });

  if (process.env.NODE_ENV === "production") {
    // Serve static build output
    const distPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist");
    app.use(express.static(distPath));
    // SPA fallback — tudo que não for /api/* retorna o index.html
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ SIACT-MROSC rodando em http://0.0.0.0:${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
  });
}

startServer();
