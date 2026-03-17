import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gavel, Loader2, AlertTriangle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { AIAnalysisResult } from '../types';

export function RadarNormativo() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'radar_normativo',
          textContent: text
        })
      });

      if (!response.ok) throw new Error('Falha na análise');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao analisar o texto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Radar Normativo</h1>
        <p className="text-slate-500 mt-2">Análise de editais e estatutos com base no Decreto 11.948/2024.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">Cole o trecho do Edital ou Estatuto</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          placeholder="Ex: 'A OSC deverá apresentar certidão negativa de débitos trabalhistas...'"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !text}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gavel className="w-5 h-5" />}
            Analisar Conformidade
          </button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={`p-6 rounded-2xl border flex items-start gap-4 ${
            result.status === 'CONFORME' ? 'bg-emerald-50 border-emerald-200' :
            result.status === 'ATENCAO' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            {result.status === 'CONFORME' ? <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" /> :
             result.status === 'ATENCAO' ? <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" /> :
             <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />}
            <div>
              <h2 className={`text-xl font-bold ${
                result.status === 'CONFORME' ? 'text-emerald-900' :
                result.status === 'ATENCAO' ? 'text-amber-900' :
                'text-red-900'
              }`}>
                {result.status}
              </h2>
              <p className={`mt-2 ${
                result.status === 'CONFORME' ? 'text-emerald-700' :
                result.status === 'ATENCAO' ? 'text-amber-700' :
                'text-red-700'
              }`}>
                {result.alertaTransicao || result.message || 'Análise concluída.'}
              </p>
            </div>
          </div>

          {Array.isArray(result.documentosDispensados) && result.documentosDispensados.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" /> Documentos Dispensados (Dec 11.948)
              </h3>
              <ul className="space-y-2">
                {result.documentosDispensados.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(result.pontosAtencao) && result.pontosAtencao.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Pontos de Atenção</h3>
              <div className="space-y-4">
                {result.pontosAtencao.map((ponto, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-800">{ponto.titulo}</h4>
                    <p className="text-sm text-slate-600 mt-1">{ponto.descricao}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                      <ArrowRight className="w-4 h-4" />
                      {ponto.acaoRecomendada}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
