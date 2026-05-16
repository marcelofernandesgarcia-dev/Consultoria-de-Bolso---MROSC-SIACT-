import React, { useState } from 'react';
import { ShieldCheck, Loader2, FileText, UserX, AlertOctagon } from 'lucide-react';
import { AIAnalysisResult } from '../types';
import { SemaforoRisco } from '../components/SemaforoRisco';

export function PapeisImpedimentos() {
  const [dirigentes, setDirigentes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [erro, setErro] = useState('');

  const handleAnalyze = async () => {
    if (!dirigentes) return;
    setLoading(true);
    setResult(null);
    setErro('');

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'papeis_impedimentos', textContent: dirigentes }),
      });

      if (!response.ok) throw new Error('Falha na análise');
      setResult(await response.json());
    } catch (err) {
      setErro('Erro ao analisar os dirigentes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const statusNormalizado = (s?: string) => {
    if (!s) return 'ATENCAO';
    if (s === 'aprovado') return 'CONFORME';
    if (s === 'atencao') return 'ATENCAO';
    return 'NAO_CONFORME';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #78350F 0%, #D97706 55%, #F59E0B 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <UserX className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Papéis e Impedimentos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Análise de conflito de interesses dos dirigentes (Art. 39, Lei 13.019/2014)
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>Impedimentos legais:</strong> É vedada a celebração de parcerias com OSCs cujos dirigentes sejam cônjuges, companheiros ou parentes até o 2.º grau de agentes públicos (Art. 39, I, Lei 13.019/2014).
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100" style={{ background: 'linear-gradient(to right, #FFFBEB, #FEF3C7)' }}>
          <h2 className="text-sm font-bold text-slate-800">Lista de Dirigentes e Vínculos</h2>
          <p className="text-xs text-slate-500 mt-0.5">Informe nome, cargo e vínculos com a Administração Pública</p>
        </div>
        <div className="p-6">
          <textarea
            value={dirigentes}
            onChange={(e) => setDirigentes(e.target.value)}
            rows={7}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 outline-none resize-none transition-all placeholder:text-slate-400"
            placeholder="Ex: João da Silva (Presidente) - Cônjuge da Prefeita Municipal&#10;Maria Oliveira (Tesoureira) - Sem vínculos identificados&#10;..."
          />
          {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !dirigentes}
              style={{
                background: loading || !dirigentes ? undefined : 'linear-gradient(135deg, #D97706, #F59E0B)',
                boxShadow: loading || !dirigentes ? undefined : '0 4px 14px rgba(217,119,6,0.35)',
              }}
              className="px-6 py-3 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? 'Analisando...' : 'Analisar Impedimentos'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-5">
          <SemaforoRisco
            status={statusNormalizado(result.status)}
            mensagem={result.conteudo || 'Análise concluída.'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.isArray(result.recomendacoes) && result.recomendacoes.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
                    <ShieldCheck className="w-4 h-4 text-white" />
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

            {Array.isArray(result.baseLegal) && result.baseLegal.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Base Legal</h3>
                </div>
                <ul className="space-y-2">
                  {result.baseLegal.map((base, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span className="text-sm leading-relaxed">{base}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
