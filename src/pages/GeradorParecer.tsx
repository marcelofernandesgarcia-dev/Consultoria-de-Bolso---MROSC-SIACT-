import React, { useState } from 'react';
import { Scale, Loader2, FileOutput, Copy, Check, AlertTriangle, BookOpen, Lightbulb, Download } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';

const TEMAS_RAPIDOS = [
  'Uma OSC com 2 anos de existência pode firmar Acordo de Cooperação?',
  'Quais documentos de habilitação foram dispensados pelo Decreto 11.948/2024?',
  'Como calcular o percentual máximo de pagamento de pessoal com recursos da parceria?',
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

function buildPdfHtml(pergunta: string, result: ParecerResult): string {
  const agora = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const numero = `PT-${Date.now().toString().slice(-6)}`;

  const statusColor: Record<string, string> = {
    CONFORME: '#059669',
    RESSALVA: '#D97706',
    NAO_CONFORME: '#DC2626',
    INCONCLUSIVO: '#6B7280',
  };
  const statusLabel: Record<string, string> = {
    CONFORME: 'CONFORME',
    RESSALVA: 'RESSALVA',
    NAO_CONFORME: 'NÃO CONFORME',
    INCONCLUSIVO: 'INCONCLUSIVO',
  };
  const cor = statusColor[result.status_final ?? ''] ?? '#4F46E5';
  const label = statusLabel[result.status_final ?? ''] ?? (result.status_final ?? '');

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
    Parecer gerado pelo SIACT-MROSC · Parte do conteúdo produzida com auxílio de Inteligência Artificial (Gemini 2.5 Flash).<br/>
    Este documento é consultivo e orientativo. O servidor público permanece responsável pela revisão, autoria e assinatura do ato administrativo.<br/>
    Portaria SGD/MGI nº 473/2026 — Classificação AIE: Risco Baixo.
  </div>
</body>
</html>`;
}

export function GeradorParecer() {
  const [pergunta, setPergunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParecerResult | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState('');

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
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    result.status_final === 'CONFORME' ? 'bg-emerald-500/10 text-emerald-400' :
                    result.status_final === 'RESSALVA' ? 'bg-amber-500/10 text-amber-400' :
                    result.status_final === 'NAO_CONFORME' ? 'bg-red-500/10 text-red-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {result.status_final === 'NAO_CONFORME' ? 'NÃO CONFORME' : result.status_final}
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
    </div>
  );
}
