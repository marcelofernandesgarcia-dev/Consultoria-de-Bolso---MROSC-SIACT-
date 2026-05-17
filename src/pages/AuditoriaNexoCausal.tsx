import React, { useState } from 'react';
import { Activity, Loader2, CheckCircle2, AlertTriangle, ShieldAlert, Link2, Upload } from 'lucide-react';
import { AIAnalysisResult } from '../types';
import { SemaforoRisco } from '../components/SemaforoRisco';

export function AuditoriaNexoCausal() {
  const [despesa, setDespesa] = useState('');
  const [meta, setMeta] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState<'despesa' | 'meta' | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [erro, setErro] = useState('');

  const handlePdf = async (campo: 'despesa' | 'meta', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(campo);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.text) {
        const txt = data.text.slice(0, 40000);
        campo === 'despesa' ? setDespesa(txt) : setMeta(txt);
      }
    } catch {
      setErro('Erro ao extrair texto do PDF.');
    } finally {
      setPdfLoading(null);
      e.target.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!despesa || !meta) return;
    setLoading(true);
    setResult(null);
    setErro('');

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'auditoria_nexo_causal',
          textContent: JSON.stringify({ despesa, meta }),
        }),
      });

      if (!response.ok) throw new Error('Falha na análise');
      setResult(await response.json());
    } catch (err) {
      setErro('Erro ao realizar a auditoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 55%, #0891B2 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Link2 className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Nexo Causal</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Cruzamento de despesas realizadas com as metas do Plano de Trabalho
            </p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100" style={{ background: 'linear-gradient(to right, #F0F9FF, #E0F2FE)' }}>
          <h2 className="text-sm font-bold text-slate-800">Dados para Auditoria</h2>
          <p className="text-xs text-slate-500 mt-0.5">Informe a despesa e a meta correspondente para verificar o nexo causal</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Descrição da Despesa / Nota Fiscal
              </label>
              <label className={`flex items-center gap-1 text-[10px] font-semibold cursor-pointer px-2 py-1 rounded-lg border transition-colors ${pdfLoading === 'despesa' ? 'text-slate-400 border-slate-200' : 'text-slate-500 border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200'}`}>
                {pdfLoading === 'despesa' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                PDF
                <input type="file" accept="application/pdf" className="hidden" onChange={e => handlePdf('despesa', e)} disabled={!!pdfLoading} />
              </label>
            </div>
            <textarea
              value={despesa}
              onChange={(e) => setDespesa(e.target.value)}
              rows={6}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none resize-none transition-all placeholder:text-slate-400"
              placeholder="Ex: Pagamento de R$ 5.000,00 referente a serviços de consultoria técnica..."
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Meta do Plano de Trabalho
              </label>
              <label className={`flex items-center gap-1 text-[10px] font-semibold cursor-pointer px-2 py-1 rounded-lg border transition-colors ${pdfLoading === 'meta' ? 'text-slate-400 border-slate-200' : 'text-slate-500 border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200'}`}>
                {pdfLoading === 'meta' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                PDF
                <input type="file" accept="application/pdf" className="hidden" onChange={e => handlePdf('meta', e)} disabled={!!pdfLoading} />
              </label>
            </div>
            <textarea
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              rows={6}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none resize-none transition-all placeholder:text-slate-400"
              placeholder="Ex: Meta 1: Capacitar 50 jovens em programação básica..."
            />
          </div>
        </div>

        {erro && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !despesa || !meta}
            style={{
              background: loading || !despesa || !meta ? undefined : 'linear-gradient(135deg, #0284C7, #0891B2)',
              boxShadow: loading || !despesa || !meta ? undefined : '0 4px 14px rgba(2,132,199,0.35)',
            }}
            className="px-6 py-3 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            {loading ? 'Auditando...' : 'Auditar Nexo Causal'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-5">
          <SemaforoRisco
            status={result.status || 'ATENCAO'}
            mensagem={result.analise || 'Análise concluída.'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.isArray(result.evidenciasValidadas) && result.evidenciasValidadas.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Evidências Validadas</h3>
                </div>
                <ul className="space-y-2">
                  {result.evidenciasValidadas.map((evidencia, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="text-sm leading-relaxed">{evidencia}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(result.riscosIdentificados) && result.riscosIdentificados.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}>
                    <ShieldAlert className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Riscos Identificados</h3>
                </div>
                <ul className="space-y-2">
                  {result.riscosIdentificados.map((risco, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 bg-red-50 p-3 rounded-xl border border-red-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <span className="text-sm leading-relaxed">{risco}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {Array.isArray(result.recomendacoes) && result.recomendacoes.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Recomendações</h3>
              </div>
              <ul className="space-y-3">
                {result.recomendacoes.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="leading-relaxed text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
