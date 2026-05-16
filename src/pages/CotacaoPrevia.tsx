import React, { useState } from 'react';
import { ClipboardList, Loader2, Plus, Trash2, TrendingUp } from 'lucide-react';
import { AIAnalysisResult } from '../types';
import { SemaforoRisco } from '../components/SemaforoRisco';

interface ItemCotacao {
  id: string;
  descricao: string;
  valorReferencia: string;
  valorCotado: string;
}

export function CotacaoPrevia() {
  const [items, setItems] = useState<ItemCotacao[]>([
    { id: '1', descricao: '', valorReferencia: '', valorCotado: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [erro, setErro] = useState('');

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), descricao: '', valorReferencia: '', valorCotado: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemCotacao, value: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleAnalyze = async () => {
    if (items.some(i => !i.descricao || !i.valorReferencia || !i.valorCotado)) {
      setErro('Preencha todos os campos antes de analisar.');
      return;
    }
    setLoading(true);
    setResult(null);
    setErro('');

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cotacao_previa', textContent: JSON.stringify(items) }),
      });

      if (!response.ok) throw new Error('Falha na análise');
      setResult(await response.json());
    } catch (err) {
      setErro('Erro ao analisar a cotação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const totalRef = items.reduce((s, i) => s + (parseFloat(i.valorReferencia) || 0), 0);
  const totalCotado = items.reduce((s, i) => s + (parseFloat(i.valorCotado) || 0), 0);
  const variacao = totalRef > 0 ? ((totalCotado - totalRef) / totalRef) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #0D9488 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ClipboardList className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Cotação Prévia</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Análise de orçamentos com IA para evitar sobrepreço (IN 01/2020 — MROSC)
            </p>
          </div>
        </div>
      </div>

      {/* Summary totals */}
      {(totalRef > 0 || totalCotado > 0) && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Valor de Referência', value: totalRef, color: '#0284C7' },
            { label: 'Valor Cotado', value: totalCotado, color: variacao > 10 ? '#DC2626' : '#059669' },
            { label: 'Variação', value: null, pct: variacao, color: variacao > 10 ? '#DC2626' : '#059669' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>
                {s.value !== null
                  ? s.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Items form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #F0FDF4, #F0FDFA)' }}>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Itens Orçamentários</h2>
            <p className="text-xs text-slate-500 mt-0.5">{items.length} item{items.length > 1 ? 's' : ''} na cotação</p>
          </div>
          <button
            onClick={addItem}
            className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Item
          </button>
        </div>

        <div className="p-6 space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-1.5">{idx + 1}</span>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição do Item</label>
                <input
                  type="text"
                  value={item.descricao}
                  onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                  placeholder="Ex: Notebook Core i5 8GB"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all"
                />
              </div>
              <div className="w-36">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor Ref. (R$)</label>
                <input
                  type="number"
                  value={item.valorReferencia}
                  onChange={(e) => updateItem(item.id, 'valorReferencia', e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all"
                />
              </div>
              <div className="w-36">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor Cotado (R$)</label>
                <input
                  type="number"
                  value={item.valorCotado}
                  onChange={(e) => updateItem(item.id, 'valorCotado', e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                className="mt-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {erro && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              background: loading ? undefined : 'linear-gradient(135deg, #059669, #0D9488)',
              boxShadow: loading ? undefined : '0 4px 14px rgba(5,150,105,0.35)',
            }}
            className="px-6 py-3 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {loading ? 'Analisando...' : 'Analisar Preços com IA'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-5">
          <SemaforoRisco
            status={result.status === 'RESSALVA' ? 'ATENCAO' : result.status}
            mensagem={result.message || 'Análise concluída.'}
          />

          {Array.isArray(result.details) && result.details.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Detalhamento da Análise</h3>
              </div>
              <ul className="space-y-3">
                {result.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="leading-relaxed text-sm">{detail}</span>
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
