import React, { useState } from 'react';
import { Scale, Loader2, FileOutput, Copy, Check, AlertTriangle, BookOpen, Lightbulb, Download, FileSignature, ListChecks } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';
import { STATUS_LABEL, STATUS_BADGE_DARK, STATUS_HEX, type StatusFinal } from '../lib/statusVisual';

const TEMAS_RAPIDOS = [
  'Uma OSC com 2 anos de existência pode firmar Acordo de Cooperação?',
  'Quais documentos de habilitação foram dispensados pelo Decreto 11.948/2024?',
  'Existe um teto de remuneração para pessoal contratado com recursos da parceria?',
  'Quais são os requisitos mínimos para uma OSC ser considerada elegível?',
  'Em que situações é obrigatório o chamamento público?',
  'O que caracteriza desvio de finalidade no uso dos recursos da parceria?',
];

interface ParecerResult {
  conclusao: string;
  fundamentacao: string;
  baseLegal: string[];
  ressalvas: string[];
  orientacao: string;
  status_final?: string;
}

// Modo "Anexo VII" — segue a estrutura oficial do Manual MROSC (Parecer Técnico Conclusivo
// de Análise de Prestação de Contas Final), mapeada via consulta ao Manual: bloco de
// identificação (preenchido pelo usuário, não pela IA) + 8 seções técnicas I-VIII.
interface DadosIdentificacaoAnexoVII {
  numeroProcesso: string;
  numeroInstrumento: string;
  tipoInstrumento: string;
  objeto: string;
  osc: string;
  gestorResponsavel: string;
}

interface ParecerAnexoVIIResult {
  introducao: string;
  avaliacaoAcoesRealizadas: string;
  avaliacaoCumprimentoMetas: string;
  avaliacaoImpactos: string;
  avaliacaoSatisfacaoPublico: string;
  avaliacaoSustentabilidade: string;
  avaliacaoTransparencia: string;
  conclusao: string;
  desfecho: 'APROVACAO' | 'APROVACAO_RESSALVAS' | 'REJEICAO';
  status_final?: string;
}

const DESFECHO_LABEL: Record<ParecerAnexoVIIResult['desfecho'], string> = {
  APROVACAO: 'Aprovação das Contas',
  APROVACAO_RESSALVAS: 'Aprovação com Ressalvas',
  REJEICAO: 'Rejeição — TCE',
};

const DESFECHO_COR: Record<ParecerAnexoVIIResult['desfecho'], string> = {
  APROVACAO: '#059669',
  APROVACAO_RESSALVAS: '#D97706',
  REJEICAO: '#DC2626',
};

const SECOES_ANEXO_VII: { key: keyof ParecerAnexoVIIResult; numero: string; titulo: string }[] = [
  { key: 'introducao', numero: 'I', titulo: 'Introdução' },
  { key: 'avaliacaoAcoesRealizadas', numero: 'II', titulo: 'Avaliação das Ações Realizadas' },
  { key: 'avaliacaoCumprimentoMetas', numero: 'III', titulo: 'Avaliação do Cumprimento das Metas' },
  { key: 'avaliacaoImpactos', numero: 'IV', titulo: 'Avaliação dos Impactos Econômicos ou Sociais' },
  { key: 'avaliacaoSatisfacaoPublico', numero: 'V', titulo: 'Avaliação do Grau de Satisfação do Público-Alvo' },
  { key: 'avaliacaoSustentabilidade', numero: 'VI', titulo: 'Avaliação sobre a Sustentabilidade das Ações' },
  { key: 'avaliacaoTransparencia', numero: 'VII', titulo: 'Avaliação sobre a Transparência da Parceria' },
  { key: 'conclusao', numero: 'VIII', titulo: 'Conclusão' },
];

function buildPdfHtml(pergunta: string, result: ParecerResult): string {
  const agora = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const numero = `PT-${Date.now().toString().slice(-6)}`;

  const statusKey = result.status_final as StatusFinal | undefined;
  const cor = statusKey ? STATUS_HEX[statusKey] : '#4F46E5';
  const label = statusKey ? STATUS_LABEL[statusKey].toUpperCase() : (result.status_final ?? '');

  const baseLegalHtml = (result.baseLegal ?? [])
    .map(b => `<li>${b}</li>`).join('');
  const ressalvasHtml = (result.ressalvas ?? [])
    .map(r => `<li>${r}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Parecer Técnico MROSC — ${numero}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Georgia', serif; font-size: 11pt; color: #1e293b; background: #fff; padding: 0; }
    @page { margin: 2.5cm 2cm; size: A4; }

    /* Topo */
    .header { border-bottom: 3px solid #4F46E5; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .header-brand { font-family: 'Arial', sans-serif; }
    .header-brand .nome { font-size: 16pt; font-weight: 900; color: #4F46E5; letter-spacing: -0.5px; }
    .header-brand .sub  { font-size: 8pt; color: #64748b; margin-top: 2px; }
    .header-meta { text-align: right; font-family: 'Arial', sans-serif; font-size: 8pt; color: #64748b; }
    .header-meta strong { display: block; font-size: 9pt; color: #1e293b; }

    /* Título do documento */
    .doc-title { text-align: center; margin-bottom: 20px; font-family: 'Arial', sans-serif; }
    .doc-title h1 { font-size: 13pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
    .doc-title .numero { font-size: 9pt; color: #64748b; margin-top: 4px; }

    /* Status badge */
    .status-badge { display: inline-block; padding: 6px 18px; border-radius: 20px; font-family: 'Arial', sans-serif; font-size: 9pt; font-weight: 700; color: white; background: ${cor}; margin: 0 auto 20px; }
    .status-center { text-align: center; }

    /* Seção */
    .section { margin-bottom: 18px; }
    .section-title { font-family: 'Arial', sans-serif; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
    p { line-height: 1.7; text-align: justify; margin-bottom: 8px; }

    /* Destaque conclusão */
    .conclusao-box { background: #EEF2FF; border-left: 4px solid #4F46E5; padding: 12px 16px; border-radius: 4px; margin-bottom: 8px; }
    .conclusao-box p { font-weight: 600; color: #1e1b4b; margin: 0; }

    /* Pergunta */
    .pergunta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 14px; font-style: italic; color: #475569; font-size: 10pt; line-height: 1.6; }

    /* Listas */
    ul { padding-left: 18px; }
    ul li { line-height: 1.7; margin-bottom: 4px; }
    ul.base-legal li { list-style: none; padding-left: 0; position: relative; }
    ul.base-legal li::before { content: "▪"; color: #4F46E5; font-size: 10pt; position: absolute; left: -14px; }
    ul.ressalvas li { list-style: none; padding-left: 0; position: relative; }
    ul.ressalvas li::before { content: "!"; color: #D97706; font-weight: 700; position: absolute; left: -14px; }

    /* Orientação */
    .orientacao-box { background: #F0FDF4; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 4px; }

    /* Rodapé */
    .footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-family: 'Arial', sans-serif; font-size: 7.5pt; color: #94a3b8; text-align: center; line-height: 1.5; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      <div class="nome">SIACT-MROSC</div>
      <div class="sub">Sistema Inteligente de Análise e Controle de Transferências da União</div>
    </div>
    <div class="header-meta">
      <strong>PARECER TÉCNICO</strong>
      Nº ${numero}<br/>
      Emitido em ${agora}
    </div>
  </div>

  <div class="doc-title">
    <h1>Parecer Técnico Orientativo</h1>
    <div class="numero">Lei 13.019/2014 &nbsp;·&nbsp; Decreto 11.948/2024 &nbsp;·&nbsp; Marco Regulatório das OSCs</div>
  </div>

  <div class="status-center">
    <span class="status-badge">${label}</span>
  </div>

  <div class="section">
    <div class="section-title">Matéria Consultada</div>
    <div class="pergunta-box">${pergunta}</div>
  </div>

  <div class="section">
    <div class="section-title">Conclusão</div>
    <div class="conclusao-box"><p>${result.conclusao}</p></div>
  </div>

  <div class="section">
    <div class="section-title">Fundamentação Jurídica</div>
    <p>${result.fundamentacao}</p>
  </div>

  ${baseLegalHtml ? `
  <div class="section">
    <div class="section-title">Base Legal Aplicável</div>
    <ul class="base-legal">${baseLegalHtml}</ul>
  </div>` : ''}

  ${ressalvasHtml ? `
  <div class="section">
    <div class="section-title">Ressalvas e Limitações</div>
    <ul class="ressalvas">${ressalvasHtml}</ul>
  </div>` : ''}

  ${result.orientacao ? `
  <div class="section">
    <div class="section-title">Orientação Final</div>
    <div class="orientacao-box"><p>${result.orientacao}</p></div>
  </div>` : ''}

  <div class="footer">
    Parecer gerado pelo SIACT-MROSC · Parte do conteúdo produzida com auxílio de Inteligência Artificial (Claude, Anthropic).<br/>
    Este documento é consultivo e orientativo. O servidor público permanece responsável pela revisão, autoria e assinatura do ato administrativo.<br/>
    Portaria SGD/MGI nº 473/2026 — Classificação AIE: Risco Baixo.
  </div>
</body>
</html>`;
}

function buildPdfHtmlAnexoVII(dados: DadosIdentificacaoAnexoVII, result: ParecerAnexoVIIResult): string {
  const agora = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const numero = `PTC-${Date.now().toString().slice(-6)}`;
  const cor = DESFECHO_COR[result.desfecho];
  const label = DESFECHO_LABEL[result.desfecho].toUpperCase();

  const secoesHtml = SECOES_ANEXO_VII
    .map(s => `
    <div class="section">
      <div class="section-title">${s.numero}. ${s.titulo}</div>
      <p>${result[s.key] as string}</p>
    </div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Parecer Técnico Conclusivo — ${numero}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Georgia', serif; font-size: 11pt; color: #1e293b; background: #fff; padding: 0; }
    @page { margin: 2.5cm 2cm; size: A4; }

    .header { border-bottom: 3px solid #4F46E5; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .header-brand { font-family: 'Arial', sans-serif; }
    .header-brand .nome { font-size: 16pt; font-weight: 900; color: #4F46E5; letter-spacing: -0.5px; }
    .header-brand .sub  { font-size: 8pt; color: #64748b; margin-top: 2px; }
    .header-meta { text-align: right; font-family: 'Arial', sans-serif; font-size: 8pt; color: #64748b; }
    .header-meta strong { display: block; font-size: 9pt; color: #1e293b; }

    .doc-title { text-align: center; margin-bottom: 20px; font-family: 'Arial', sans-serif; }
    .doc-title h1 { font-size: 13pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
    .doc-title .numero { font-size: 9pt; color: #64748b; margin-top: 4px; }

    .status-badge { display: inline-block; padding: 6px 18px; border-radius: 20px; font-family: 'Arial', sans-serif; font-size: 9pt; font-weight: 700; color: white; background: ${cor}; margin: 0 auto 20px; }
    .status-center { text-align: center; }

    .identificacao { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin-bottom: 22px; font-family: 'Arial', sans-serif; font-size: 9pt; }
    .identificacao .linha { display: flex; padding: 4px 0; border-bottom: 1px dashed #e2e8f0; }
    .identificacao .linha:last-child { border-bottom: none; }
    .identificacao .rotulo { width: 180px; font-weight: 700; color: #64748b; flex-shrink: 0; }
    .identificacao .valor { color: #1e293b; }

    .section { margin-bottom: 18px; }
    .section-title { font-family: 'Arial', sans-serif; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
    p { line-height: 1.7; text-align: justify; margin-bottom: 8px; }

    .assinatura { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-family: 'Arial', sans-serif; text-align: center; }
    .assinatura .linha-assinatura { margin: 40px auto 6px; width: 320px; border-bottom: 1px solid #1e293b; }
    .assinatura .nome { font-size: 9pt; font-weight: 700; color: #1e293b; }
    .assinatura .cargo { font-size: 8pt; color: #64748b; }
    .assinatura .local-data { font-size: 8pt; color: #64748b; margin-top: 24px; }

    .footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-family: 'Arial', sans-serif; font-size: 7.5pt; color: #94a3b8; text-align: center; line-height: 1.5; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      <div class="nome">SIACT-MROSC</div>
      <div class="sub">Sistema Inteligente de Análise e Controle de Transferências da União</div>
    </div>
    <div class="header-meta">
      <strong>PARECER TÉCNICO CONCLUSIVO</strong>
      Nº ${numero}<br/>
      Emitido em ${agora}
    </div>
  </div>

  <div class="doc-title">
    <h1>Parecer Técnico Conclusivo de Análise de Prestação de Contas Final</h1>
    <div class="numero">Modelo Anexo VII — Manual MROSC · Lei 13.019/2014, Art. 61, IV e Art. 67</div>
  </div>

  <div class="status-center">
    <span class="status-badge">${label}</span>
  </div>

  <div class="identificacao">
    <div class="linha"><span class="rotulo">Nº do Processo</span><span class="valor">${dados.numeroProcesso || '—'}</span></div>
    <div class="linha"><span class="rotulo">Nº do Instrumento</span><span class="valor">${dados.numeroInstrumento || '—'}</span></div>
    <div class="linha"><span class="rotulo">Tipo de Instrumento</span><span class="valor">${dados.tipoInstrumento || '—'}</span></div>
    <div class="linha"><span class="rotulo">Objeto da Parceria</span><span class="valor">${dados.objeto || '—'}</span></div>
    <div class="linha"><span class="rotulo">OSC Parceira</span><span class="valor">${dados.osc || '—'}</span></div>
    <div class="linha"><span class="rotulo">Gestor Responsável</span><span class="valor">${dados.gestorResponsavel || '—'}</span></div>
  </div>

  ${secoesHtml}

  <div class="assinatura">
    <div class="linha-assinatura"></div>
    <div class="nome">${dados.gestorResponsavel || 'Gestor da Parceria'}</div>
    <div class="cargo">Gestor da Parceria</div>
    <div class="local-data">___________________, ____ de ______________ de ______</div>
  </div>

  <div class="footer">
    Parecer gerado pelo SIACT-MROSC · Parte do conteúdo produzida com auxílio de Inteligência Artificial (Claude, Anthropic).<br/>
    Este documento é consultivo e orientativo. O gestor permanece responsável pela revisão, autoria e assinatura do ato administrativo.<br/>
    Portaria SGD/MGI nº 473/2026 — Classificação AIE: Risco Baixo.
  </div>
</body>
</html>`;
}

const DADOS_ANEXO_VII_VAZIO: DadosIdentificacaoAnexoVII = {
  numeroProcesso: '', numeroInstrumento: '', tipoInstrumento: '', objeto: '', osc: '', gestorResponsavel: '',
};

export function GeradorParecer() {
  const [modo, setModo] = useState<'geral' | 'anexo_vii'>('geral');

  const [pergunta, setPergunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParecerResult | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState('');

  // Modo Anexo VII — identificação preenchida pelo usuário (não pela IA) + relatórios colados
  const [dadosAnexo, setDadosAnexo] = useState<DadosIdentificacaoAnexoVII>(DADOS_ANEXO_VII_VAZIO);
  const [relatorios, setRelatorios] = useState('');
  const [loadingAnexo, setLoadingAnexo] = useState(false);
  const [resultAnexo, setResultAnexo] = useState<ParecerAnexoVIIResult | null>(null);
  const [erroAnexo, setErroAnexo] = useState('');

  const handleGerarAnexoVII = async () => {
    if (!relatorios.trim()) return;
    setLoadingAnexo(true);
    setResultAnexo(null);
    setErroAnexo('');

    try {
      const contexto = [
        `Nº do Processo: ${dadosAnexo.numeroProcesso || 'não informado'}`,
        `Nº do Instrumento: ${dadosAnexo.numeroInstrumento || 'não informado'}`,
        `Tipo de Instrumento: ${dadosAnexo.tipoInstrumento || 'não informado'}`,
        `Objeto da Parceria: ${dadosAnexo.objeto || 'não informado'}`,
        `OSC Parceira: ${dadosAnexo.osc || 'não informado'}`,
        '',
        'RELATÓRIOS DA PARCERIA:',
        relatorios,
      ].join('\n');

      const response = await apiFetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'parecer_anexo_vii',
          textContent: contexto,
          documentName: `Parecer Anexo VII: ${dadosAnexo.objeto?.slice(0, 60) || dadosAnexo.numeroProcesso || 'Prestação de Contas'}`,
        }),
      });

      if (!response.ok) throw new Error('Falha ao gerar o parecer.');
      const data = await response.json();
      setResultAnexo(data);
    } catch {
      setErroAnexo('Erro ao gerar o parecer. Verifique a conexão e tente novamente.');
    } finally {
      setLoadingAnexo(false);
    }
  };

  const exportarPDFAnexoVII = () => {
    if (!resultAnexo) return;
    const html = buildPdfHtmlAnexoVII(dadosAnexo, resultAnexo);
    const janela = window.open('', '_blank', 'width=900,height=700');
    if (!janela) return;
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    setTimeout(() => {
      janela.print();
    }, 400);
  };

  const handleGerar = async () => {
    if (!pergunta.trim()) return;
    setLoading(true);
    setResult(null);
    setErro('');

    try {
      const response = await apiFetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gerador_parecer', textContent: pergunta, documentName: `Parecer: ${pergunta.slice(0, 60)}...` }),
      });

      if (!response.ok) throw new Error('Falha ao gerar o parecer.');
      const data = await response.json();
      setResult(data);
    } catch {
      setErro('Erro ao gerar o parecer. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copiarParecer = () => {
    if (!result) return;
    const texto = [
      'PARECER TÉCNICO — SIACT-MROSC',
      '='.repeat(60),
      `\nMATÉRIA: ${pergunta}`,
      `\nCONCLUSÃO:\n${result.conclusao}`,
      `\nFUNDAMENTAÇÃO:\n${result.fundamentacao}`,
      result.baseLegal?.length ? `\nBASE LEGAL:\n${result.baseLegal.map(b => `• ${b}`).join('\n')}` : '',
      result.ressalvas?.length ? `\nRESSALVAS:\n${result.ressalvas.map(r => `• ${r}`).join('\n')}` : '',
      result.orientacao ? `\nORIENTAÇÃO FINAL:\n${result.orientacao}` : '',
      '\n—\nGerado por SIACT-MROSC. Documento consultivo — o servidor permanece responsável pela revisão e autoria.',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  const exportarPDF = () => {
    if (!result) return;
    const html = buildPdfHtml(pergunta, result);
    const janela = window.open('', '_blank', 'width=900,height=700');
    if (!janela) return;
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    setTimeout(() => {
      janela.print();
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 40%, #4F46E5 70%, #7C3AED 100%)' }}>
        <div className="px-7 py-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Scale className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Gerador de Pareceres Técnicos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Opiniões jurídicas fundamentadas na Lei 13.019/2014 e Decreto 11.948/2024, geradas por IA e exportáveis em PDF
            </p>
          </div>
          <div className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            BETA
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200 leading-relaxed">
          <strong>Uso consultivo:</strong> Os pareceres são orientativos e baseados na legislação vigente. Não substituem orientação jurídica formal para casos de alta complexidade. O servidor permanece responsável pela revisão e autoria.
        </p>
      </div>

      {/* Toggle de modo */}
      <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setModo('geral')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            modo === 'geral' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Parecer Geral
        </button>
        <button
          onClick={() => setModo('anexo_vii')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            modo === 'anexo_vii' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSignature className="w-3.5 h-3.5" />
          Prestação de Contas Final (Anexo VII)
        </button>
      </div>

      {modo === 'geral' ? (
      <>
      {/* Input */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5" style={{ background: 'linear-gradient(to right, rgba(79,70,229,0.15), rgba(124,58,237,0.1))' }}>
          <h2 className="text-sm font-bold text-white">Sua Dúvida Jurídica</h2>
          <p className="text-xs text-slate-400 mt-0.5">Descreva a situação ou pergunta para receber uma análise fundamentada</p>
        </div>
        <div className="p-6">
          <textarea
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            rows={4}
            className="w-full p-4 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none resize-none transition-all"
            placeholder="Ex: Uma OSC com 2 anos de existência pode firmar parceria com o Município para execução de atividades de assistência social?"
          />

          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Perguntas frequentes</p>
            <div className="flex flex-wrap gap-2">
              {TEMAS_RAPIDOS.map((tema, i) => (
                <button
                  key={i}
                  onClick={() => setPergunta(tema)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 text-slate-400 text-xs font-medium rounded-lg border border-white/5 transition-colors text-left"
                >
                  {tema}
                </button>
              ))}
            </div>
          </div>

          {erro && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {erro}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleGerar}
              disabled={loading || !pergunta.trim()}
              className="px-6 py-3 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loading || !pergunta.trim() ? undefined : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: loading || !pergunta.trim() ? undefined : '0 4px 14px rgba(79,70,229,0.35)',
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              {loading ? 'Gerando Parecer...' : 'Gerar Parecer Técnico'}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-5">
          {/* Conclusão + ações */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between" style={{ background: 'linear-gradient(to right, rgba(79,70,229,0.15), rgba(124,58,237,0.1))' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  <Scale className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">Parecer Técnico</h3>
                {result.status_final && (
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE_DARK[result.status_final as StatusFinal]}`}>
                    {STATUS_LABEL[result.status_final as StatusFinal].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportarPDF}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors border border-indigo-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar PDF
                </button>
                <button
                  onClick={copiarParecer}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors border border-white/10"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4">
                <p className="text-sm font-semibold text-indigo-200 leading-relaxed">{result.conclusao}</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.fundamentacao}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Base legal */}
            {result.baseLegal?.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0284C7, #0891B2)' }}>
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Base Legal</h3>
                </div>
                <ul className="space-y-2">
                  {result.baseLegal.map((base, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 bg-sky-500/10 rounded-xl border border-sky-500/10 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{base}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ressalvas */}
            {result.ressalvas?.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Ressalvas</h3>
                </div>
                <ul className="space-y-2">
                  {result.ressalvas.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 bg-amber-500/10 rounded-xl border border-amber-500/10 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Orientação final */}
          {result.orientacao && (
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                  <Lightbulb className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">Orientação Final</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.orientacao}</p>
            </div>
          )}

          {/* Nota de rodapé */}
          <p className="text-xs text-slate-600 text-center pb-2">
            Parte do conteúdo gerado com auxílio de IA · O servidor permanece responsável pela revisão e autoria plena · Portaria SGD/MGI nº 473/2026 — Risco Baixo
          </p>
        </div>
      )}
      </>
      ) : (
      <>
      {/* Input — Anexo VII */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5" style={{ background: 'linear-gradient(to right, rgba(79,70,229,0.15), rgba(124,58,237,0.1))' }}>
          <h2 className="text-sm font-bold text-white">Identificação da Parceria</h2>
          <p className="text-xs text-slate-400 mt-0.5">Preencha os dados — não são gerados por IA, aparecem exatamente como digitados no parecer final</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nº do Processo</label>
              <input
                type="text"
                value={dadosAnexo.numeroProcesso}
                onChange={(e) => setDadosAnexo(d => ({ ...d, numeroProcesso: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
                placeholder="Ex: 00000.000000/2026-00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nº do Instrumento</label>
              <input
                type="text"
                value={dadosAnexo.numeroInstrumento}
                onChange={(e) => setDadosAnexo(d => ({ ...d, numeroInstrumento: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
                placeholder="Ex: TF 001/2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tipo de Instrumento</label>
              <select
                value={dadosAnexo.tipoInstrumento}
                onChange={(e) => setDadosAnexo(d => ({ ...d, tipoInstrumento: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
              >
                <option value="">Selecione...</option>
                <option value="Termo de Fomento">Termo de Fomento</option>
                <option value="Termo de Colaboração">Termo de Colaboração</option>
                <option value="Acordo de Cooperação">Acordo de Cooperação</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Gestor Responsável</label>
              <input
                type="text"
                value={dadosAnexo.gestorResponsavel}
                onChange={(e) => setDadosAnexo(d => ({ ...d, gestorResponsavel: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
                placeholder="Nome do gestor da parceria"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">OSC Parceira</label>
              <input
                type="text"
                value={dadosAnexo.osc}
                onChange={(e) => setDadosAnexo(d => ({ ...d, osc: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
                placeholder="Razão social da organização"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Objeto da Parceria</label>
              <input
                type="text"
                value={dadosAnexo.objeto}
                onChange={(e) => setDadosAnexo(d => ({ ...d, objeto: e.target.value }))}
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
                placeholder="Descrição do objeto pactuado"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Relatórios da Parceria</label>
            <p className="text-xs text-slate-500 mb-2">Cole o conteúdo disponível: relatório de execução do objeto, relatório financeiro, visita técnica in loco, pesquisa de satisfação, monitoramento. Quanto mais completo, mais precisas as 8 seções.</p>
            <textarea
              value={relatorios}
              onChange={(e) => setRelatorios(e.target.value)}
              rows={10}
              className="w-full p-4 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none resize-none transition-all font-mono"
              placeholder="Cole aqui o texto dos relatórios da parceria..."
            />
          </div>

          {erroAnexo && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {erroAnexo}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleGerarAnexoVII}
              disabled={loadingAnexo || !relatorios.trim()}
              className="px-6 py-3 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loadingAnexo || !relatorios.trim() ? undefined : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: loadingAnexo || !relatorios.trim() ? undefined : '0 4px 14px rgba(79,70,229,0.35)',
              }}
            >
              {loadingAnexo ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
              {loadingAnexo ? 'Gerando Parecer...' : 'Gerar Parecer Conclusivo'}
            </button>
          </div>
        </div>
      </div>

      {/* Resultado — Anexo VII */}
      {resultAnexo && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-2" style={{ background: 'linear-gradient(to right, rgba(79,70,229,0.15), rgba(124,58,237,0.1))' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  <ListChecks className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">Parecer Técnico Conclusivo</h3>
                <span
                  className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: DESFECHO_COR[resultAnexo.desfecho] }}
                >
                  {DESFECHO_LABEL[resultAnexo.desfecho].toUpperCase()}
                </span>
              </div>
              <button
                onClick={exportarPDFAnexoVII}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors border border-indigo-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar PDF
              </button>
            </div>
            <div className="p-6 space-y-6">
              {SECOES_ANEXO_VII.map(s => (
                <div key={s.key}>
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{s.numero}. {s.titulo}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{resultAnexo[s.key] as string}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center pb-2">
            Parte do conteúdo gerado com auxílio de IA · O gestor permanece responsável pela revisão e autoria plena · Portaria SGD/MGI nº 473/2026 — Risco Baixo
          </p>
        </div>
      )}
      </>
      )}
    </div>
  );
}
