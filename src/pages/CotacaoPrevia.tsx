import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Loader2, Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface ItemCotacao {
  id: string;
  descricao: string;
  valorReferencia: string;
  valorCotado: string;
}

export function CotacaoPrevia() {
  const [items, setItems] = useState<ItemCotacao[]>([
    { id: '1', descricao: '', valorReferencia: '', valorCotado: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), descricao: '', valorReferencia: '', valorCotado: '' }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemCotacao, value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleAnalyze = async () => {
    if (items.length === 0 || items.some(i => !i.descricao || !i.valorReferencia || !i.valorCotado)) {
      alert('Preencha todos os campos antes de analisar.');
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cotacao_previa',
          textContent: JSON.stringify(items)
        })
      });

      if (!response.ok) throw new Error('Falha na análise');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao analisar a cotação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cotação Prévia</h1>
        <p className="text-slate-500 mt-2">Análise de orçamentos com IA para evitar sobrepreço.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Itens Orçamentários</h2>
          <button
            onClick={addItem}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Descrição do Item</label>
                <input
                  type="text"
                  value={item.descricao}
                  onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                  placeholder="Ex: Notebook Core i5 8GB"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Valor Ref. (R$)</label>
                <input
                  type="number"
                  value={item.valorReferencia}
                  onChange={(e) => updateItem(item.id, 'valorReferencia', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Valor Cotado (R$)</label>
                <input
                  type="number"
                  value={item.valorCotado}
                  onChange={(e) => updateItem(item.id, 'valorCotado', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="mt-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
            Analisar Preços com IA
          </button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={`p-6 rounded-2xl border flex items-start gap-4 ${
            result.status === 'CONFORME' ? 'bg-emerald-50 border-emerald-200' :
            result.status === 'RESSALVA' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            {result.status === 'CONFORME' ? <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" /> :
             result.status === 'RESSALVA' ? <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" /> :
             <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />}
            <div>
              <h2 className={`text-xl font-bold ${
                result.status === 'CONFORME' ? 'text-emerald-900' :
                result.status === 'RESSALVA' ? 'text-amber-900' :
                'text-red-900'
              }`}>
                {result.status}
              </h2>
              <p className={`mt-2 ${
                result.status === 'CONFORME' ? 'text-emerald-700' :
                result.status === 'RESSALVA' ? 'text-amber-700' :
                'text-red-700'
              }`}>
                {result.message || 'Análise concluída.'}
              </p>
            </div>
          </div>

          {Array.isArray(result.details) && result.details.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Detalhamento</h3>
              <ul className="space-y-3">
                {result.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{detail}</span>
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
