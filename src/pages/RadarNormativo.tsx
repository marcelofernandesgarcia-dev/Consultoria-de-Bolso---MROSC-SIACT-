import React, { useState } from 'react';
import { Gavel, Loader2, CheckCircle2, FileText, ArrowRight, Upload } from 'lucide-react';
import { AIAnalysisResult } from '../types';
import { SemaforoRisco } from '../components/SemaforoRisco';

export function RadarNormativo() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Erro ao processar PDF');
      const data = await res.json();
      if (data.text) setText(data.text.slice(0, 80000));
    } catch (err) {
      console.error(err);
    } finally {
      setPdfLoading(false);
      e.target.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'radar_normativo', textContent: text }),
      });

      if (!response.ok) throw new Error('Falha na análise');
      setResult(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #7C3AED 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Gavel className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Radar Normativo</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Análise de editais e estatutos com base no Decreto 11.948/2024
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #F5F3FF, #EFF6FF)' }}>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Trecho para Análise</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cole o texto ou envie um PDF do edital/estatuto</p>
          </div>
          <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold cursor-pointer transition-colors ${pdfLoading ? 'text-slate-400' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'}`}>
            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {pdfLoading ? 'Extraindo...' : 'Enviar PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={handlePdf} disabled={pdfLoading} />
          </label>
        </div>
        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-400"
            placeholder="Ex: 'A OSC deverá apresentar certidão negativa de débitos trabalhistas...'"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !text}
              style={{
                background: loading || !text ? undefined : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: loading || !text ? undefined : '0 4px 14px rgba(79,70,229,0.35)',
              }}
              className="px-6 py-3 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
              {loading ? 'Analisando...' : 'Analisar Conformidade'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-5">
          <SemaforoRisco
            status={result.status}
            mensagem={result.alertaTransicao || result.message || 'Análise concluída.'}
          />

          {Array.isArray(result.documentosDispensados) && result.documentosDispensados.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Documentos Dispensados (Dec 11.948)</h3>
              </div>
              <ul className="space-y-2">
                {result.documentosDispensados.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(result.pontosAtencao) && result.pontosAtencao.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Pontos de Atenção</h3>
              </div>
              <div className="space-y-4">
                {result.pontosAtencao.map((ponto, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 text-sm">{ponto.titulo}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{ponto.descricao}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      {ponto.acaoRecomendada}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
