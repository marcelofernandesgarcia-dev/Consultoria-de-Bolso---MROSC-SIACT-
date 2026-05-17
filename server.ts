import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import multer from "multer";
import { createRequire } from "module";
import path from "path";

const _require = createRequire(import.meta.url);
const pdfParse = _require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

// Initialize Supabase
const supabase = createSupabaseClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Initialize Gemini
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const ai = new GoogleGenAI({ apiKey });
  return ai.models;
};

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

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

  // Security headers
  app.use(helmet({ contentSecurityPolicy: false }));

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
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: "4.0.0", env: process.env.NODE_ENV ?? "development" });
  });

  // --- PDF PARSING API ---
  app.post("/api/parse-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }
      const data = await pdfParse(req.file.buffer);
      res.json({ text: data.text });
    } catch (error: any) {
      console.error("PDF parsing error:", error);
      res.status(500).json({ error: "Erro ao processar o PDF. " + error.message });
    }
  });

  // --- DASHBOARD API ---
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = await getAuthUser(req);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base = (q: any) => userId ? q.eq('user_id', userId) : q;

      const [
        { count: total },
        { count: approved },
        { count: warning },
        { count: rejected },
        { data: recent }
      ] = await Promise.all([
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })),
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })).eq('status', 'CONFORME'),
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })).eq('status', 'RESSALVA'),
        base(supabase.from('analysis_history').select('*', { count: 'exact', head: true })).eq('status', 'NAO_CONFORME'),
        base(supabase.from('analysis_history').select('id, document_name, status, date, type')).order('date', { ascending: false }).limit(5),
      ]);

      const growth = { total: 0, approved: 0, warning: 0, rejected: 0 };
      res.json({ stats: { total: total ?? 0, approved: approved ?? 0, warning: warning ?? 0, rejected: rejected ?? 0, growth }, recent: recent ?? [] });
    } catch (error: any) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- MROSC ANALYSIS API ---
  app.post("/api/analyze-mrosc", async (req, res) => {
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

      const models = getGeminiModel();

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
      `;

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
        - Tempo de existência: Mínimo 3 anos (Art. 33, I, a).
        - Regularidade fiscal e trabalhista (Art. 34, II, III, IV).
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
        - Vigência compatível (Art. 42, II).
        - Contrapartida (se houver) (Art. 42, III).
        - Nexo Causal Orçamentário (Art. 45).
        
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
      else if (type === 'osc_edital_explainer') { // Prompt 3.2
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
      } else if (type === 'osc_proposal_precheck') { // Prompt 3.3
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
        - Art. 45, Lei 13.019/2014: vedações de despesa (taxas bancárias, multas, despesas pessoais, pagamentos a dirigentes)
        - IN SEGES/ME nº 65/2021, Art. 34: sobrepreço configurado quando preço supera 25% do benchmark de mercado
        - Decreto 11.948/2024, Art. 12: para parcerias até R$ 120.000, exige-se mínimo de 3 propostas de fornecedores distintos
        - TCU Súmula 254: necessidade de documentar pesquisa de preços com pelo menos 3 propostas válidas

        ETAPAS DE ANÁLISE OBRIGATÓRIAS:
        1. Para CADA item, calcule a variação: ((valorUnitarioCotado - valorUnitarioReferencia) / valorUnitarioReferencia) × 100
           - Até +10%: CONFORME (variação de mercado aceitável)
           - +10% a +25%: RESSALVA (variação significativa — exige justificativa documental)
           - Acima de +25%: REJEITADO (indício forte de sobrepreço — Art. 46 + IN 65/2021)
           - Negativo: CONFORME (economia para a parceria — verifique sustentabilidade do fornecedor)
        2. Avalie a coerência entre descrição e valor unitário (ex: notebook por R$ 300 é implausível; serviço por R$ 5.000.000 merece ressalva)
        3. Identifique itens vedados pelo Art. 45: taxas bancárias, pagamentos de multas, despesas pessoais, condução, refeições sem previsão
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

      const response = await models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            role: "user",
            parts: [{ text: `Analise o seguinte conteúdo:\n${textContent}` }]
        },
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.1, // Alta precisão para compliance
            responseMimeType: "application/json"
        }
      });

      const jsonResponse = response.text;
      let parsedData;
      try {
        parsedData = JSON.parse(jsonResponse);
      } catch (e) {
        const match = jsonResponse.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
            parsedData = JSON.parse(match[1]);
        } else {
            parsedData = { 
              status_final: "RESSALVA", 
              summary: "Erro ao processar resposta da IA", 
              error: "Non-JSON response" 
            };
        }
      }

      // Normalise status field — AI returns status_final, frontend reads status
      if (!parsedData.status && parsedData.status_final) {
        parsedData.status = parsedData.status_final;
      }

      // Persist to Supabase — user_id verificado via JWT (nunca confia no cliente)
      const userId = await getAuthUser(req);
      await supabase.from('analysis_history').insert({
        type,
        document_name: documentName,
        status: parsedData.status_final || 'RESSALVA',
        summary: parsedData.summary || parsedData.message || 'Sem resumo',
        details: parsedData,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      
      res.json(parsedData);

    } catch (error: any) {
      console.error("Error in MROSC analysis:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // --- OPPORTUNITIES RADAR API ---
  app.get("/api/mrosc/opportunities", async (req, res) => {
    try {
      const models = getGeminiModel();
      
      const systemInstruction = `
      # PERSONA E AUTORIDADE TÉCNICA
      - Você é o SIACT — Sistema Inteligente de Análise e Controle de Transferências da União, integrado à plataforma MROSC Consultoria de Bolso.
      - Atua como o braço direito do Coordenador de Análise Financeira, com 15 anos de experiência e doutorado em IA e Governança Pública.

      Sua tarefa é analisar a página de editais da Plataforma OSC (https://plataformaosc.org.br/editais/) e extrair todos os editais de chamamento público (MROSC - Lei 13.019/2014) ATIVOS e ABERTOS.
      
      REQUISITOS:
      - Use a ferramenta urlContext para acessar e ler o conteúdo de https://plataformaosc.org.br/editais/
      - Identifique o título de cada edital.
      - Identifique a data limite para adesão/submissão.
      - Se disponível, extraia o ministério/órgão responsável, valor e link direto.
      - Retorne uma lista de oportunidades reais encontradas na página.
      - Utilize a primeira pessoa do singular: "informo" em vez de "informamos".
      - Utilize o termo "pactuar" em vez de "balizar".
      - Toda saída documental deve conter a nota: "Parte do conteúdo gerado com o auxílio de IA".
      
      SAÍDA JSON: {
        "opportunities": [
          {
            "id": number,
            "title": string,
            "ministry": string,
            "deadline": string,
            "value": string,
            "link": string,
            "description": string,
            "fundamentacao_legal_especifica": "string"
          }
        ]
      }
      `;

      const response = await models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Analise a página https://plataformaosc.org.br/editais/ e liste todos os editais abertos encontrados, incluindo título e data limite.",
        config: {
          systemInstruction: systemInstruction,
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json"
        }
      });

      const jsonResponse = response.text;
      let parsedData;
      try {
        parsedData = JSON.parse(jsonResponse);
      } catch (e) {
        const match = jsonResponse.match(/```json\n([\s\S]*?)\n```/);
        parsedData = match ? JSON.parse(match[1]) : { opportunities: [] };
      }

      res.json(parsedData);
    } catch (error: any) {
      console.error("Opportunities Radar error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { textContent, images } = req.body;

      if (!textContent && (!images || images.length === 0)) {
        return res.status(400).json({ error: "No content provided for analysis" });
      }

      const models = getGeminiModel();
      
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
`;

      const parts = [];
      
      if (textContent) {
        parts.push({ text: `Conteúdo textual do processo:\n${textContent}` });
      }

      if (images && Array.isArray(images)) {
        for (const img of images) {
            // img should be { data: base64String, mimeType: "image/png" }
            parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
        }
      }

      const response = await models.generateContent({
        model: "gemini-2.5-flash", // Using Flash for large context window
        contents: {
            role: "user",
            parts: parts
        },
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2, // Low temperature for extraction precision
            responseMimeType: "application/json"
        }
      });

      const jsonResponse = response.text;
      // Ensure we parse the JSON correctly even if the model wraps it in markdown (though system instruction says not to)
      let parsedData;
      try {
        parsedData = JSON.parse(jsonResponse);
      } catch (e) {
        // Fallback: try to extract JSON from markdown block
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
  app.get("/api/health", async (_req, res) => {
    try {
      const { error } = await supabase.from('analysis_history').select('id').limit(1);
      if (error) throw error;
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(503).json({ status: 'down', error: err.message });
    }
  });

  // --- CHAT API ---
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, systemPrompt: clientSystemPrompt } = req.body;
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Mensagem não pode estar vazia.' });
      }
      if (message.length > 10000) {
        return res.status(400).json({ error: 'Mensagem muito longa. Máximo 10.000 caracteres.' });
      }
      const models = getGeminiModel();

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
- **Fundamentação Legal:** Art. 33, inciso I da Lei 13.019/2014 (exigência mínima de 3 anos).
- **RESULTADO:** ELEGÍVEL.

**EXEMPLO 2: Análise de Edital (APROVADA)**
- **Critério:** Prazo de Inscrição.
- **Evidência:** Chamamento Público nº 001/2024 estabelece 45 dias.
- **Fundamentação Legal:** Art. 26 da Lei 13.019/2014 (mínimo de 30 dias).
- **RESULTADO:** CONFORME.

**EXEMPLO 3: Análise de Despesa (REJEITADA)**
- **Critério:** Pagamento de taxa de administração.
- **Evidência:** Plano de Trabalho prevê 5% para "taxa de administração".
- **Fundamentação Legal:** Art. 45, inciso I da Lei 13.019/2014 (vedação expressa).
- **RESULTADO:** NÃO CONFORME.

# INSTRUÇÕES DE ITERAÇÃO E CONTROLE DE ERROS
- Se o documento fornecido estiver incompleto, **NÃO presuma informações**. Retorne o status "INCONCLUSIVO" e liste exatamente quais documentos ou dados faltam, citando a exigência legal.
- Em caso de conflito normativo, priorize a regra mais recente e específica (ex: inovações do Decreto 11.948/2024 sobre regras antigas).
- Mantenha a taxa de erro de análise abaixo de 1% atendo-se estritamente ao texto da lei.
      `;

      const systemInstruction = (typeof clientSystemPrompt === 'string' && clientSystemPrompt.trim().length > 0)
        ? clientSystemPrompt.trim().substring(0, 5000)
        : defaultSystemInstruction;

      const response = await models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV === "production") {
    // Serve static build output
    const distPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "dist");
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
