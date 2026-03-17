import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { AIAnalysisResult } from '../types';

export function PapeisImpedimentos() {
  const [dirigentes, setDirigentes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!dirigentes) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'papeis_impedimentos',
          textContent: dirigentes
        })
      });

      if (!response.ok) throw new Error('Falha na análise');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao analisar os dirigentes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Papéis e Impedimentos</h1>
        <p className="text-slate-500 mt-2">Análise de dirigentes da OSC para evitar conflito de interesses (Art. 39 da Lei 13.019).</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">Lista de Dirigentes e Vínculos</label>
        <textarea
          value={dirigentes}
          onChange={(e) => setDirigentes(e.target.value)}
          rows={6}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          placeholder="Ex: João da Silva (Presidente) - Cônjuge da Prefeita Municipal..."
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !dirigentes}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            Analisar Impedimentos
          </button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={`p-6 rounded-2xl border flex items-start gap-4 ${
            result.status === 'aprovado' ? 'bg-emerald-50 border-emerald-200' :
            result.status === 'atencao' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            {result.status === 'aprovado' ? <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" /> :
             result.status === 'atencao' ? <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" /> :
             <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />}
            <div>
              <h2 className={`text-xl font-bold ${
                result.status === 'aprovado' ? 'text-emerald-900' :
                result.status === 'atencao' ? 'text-amber-900' :
                'text-red-900'
              }`}>
                {result.titulo || result.status.toUpperCase()}
              </h2>
              <p className={`mt-2 ${
                result.status === 'aprovado' ? 'text-emerald-700' :
                result.status === 'atencao' ? 'text-amber-700' :
                'text-red-700'
              }`}>
                {result.conteudo || 'Análise concluída.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(result.recomendacoes) && result.recomendacoes.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recomendações</h3>
                <ul className="space-y-3">
                  {result.recomendacoes.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(result.baseLegal) && result.baseLegal.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-600" /> Base Legal
                </h3>
                <ul className="space-y-3">
                  {result.baseLegal.map((base, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <span className="text-sm leading-relaxed">{base}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
