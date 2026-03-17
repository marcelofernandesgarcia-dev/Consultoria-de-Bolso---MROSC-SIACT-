import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AIAnalysisResult } from '../types';

export function AuditoriaNexoCausal() {
  const [despesa, setDespesa] = useState('');
  const [meta, setMeta] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!despesa || !meta) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'auditoria_nexo_causal',
          textContent: JSON.stringify({ despesa, meta })
        })
      });

      if (!response.ok) throw new Error('Falha na análise');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao realizar a auditoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Auditoria de Nexo Causal</h1>
        <p className="text-slate-500 mt-2">Cruzamento de despesas realizadas com as metas do Plano de Trabalho.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Descrição da Despesa (Nota Fiscal)</label>
          <textarea
            value={despesa}
            onChange={(e) => setDespesa(e.target.value)}
            rows={5}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Ex: Pagamento de R$ 5.000,00 referente a serviços de consultoria técnica..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Meta do Plano de Trabalho</label>
          <textarea
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            rows={5}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Ex: Meta 1: Capacitar 50 jovens em programação básica..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={loading || !despesa || !meta}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
          Auditar Nexo Causal
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Parecer da Auditoria</h2>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {result.analise || 'Análise concluída.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(result.evidenciasValidadas) && result.evidenciasValidadas.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Evidências Validadas
                </h3>
                <ul className="space-y-3">
                  {result.evidenciasValidadas.map((evidencia, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span className="text-sm leading-relaxed">{evidencia}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(result.riscosIdentificados) && result.riscosIdentificados.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-red-600" /> Riscos Identificados
                </h3>
                <ul className="space-y-3">
                  {result.riscosIdentificados.map((risco, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span className="text-sm leading-relaxed">{risco}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {Array.isArray(result.recomendacoes) && result.recomendacoes.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> Recomendações
              </h3>
              <ul className="space-y-3">
                {result.recomendacoes.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
