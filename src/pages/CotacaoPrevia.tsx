import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList, Loader2, Plus, Trash2, TrendingUp,
  RefreshCw, AlertCircle, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import type { CotacaoPreviaResult, ItemCotacaoAnalise } from '../types';
import { SemaforoRisco } from '../components/SemaforoRisco';
import { analyzeMROSC } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RASCUNHO_KEY = 'siact_cotacao_rascunho';

/* ─── Tipos locais ────────────────────────────────────────────── */
interface ItemCotacao {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: string;
  valorReferencia: string;
  valorCotado: string;
}

/* ─── Helpers ─────────────────────────────────────────────────── */
function novoItem(): ItemCotacao {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    descricao: '',
    unidade: 'Un.',
    quantidade: '1',
    valorReferencia: '',
    valorCotado: '',
  };
}

function isNumPositivo(v: string): boolean {
  const n = parseFloat(v);
  return v.trim() !== '' && !isNaN(n) && n > 0;
}

function calcVariacao(ref: string, cotado: string): number | null {
  const r = parseFloat(ref);
  const c = parseFloat(cotado);
  if (!isNaN(r) && !isNaN(c) && r > 0) return ((c - r) / r) * 100;
  return null;
}

function statusDoItem(pct: number | null): 'CONFORME' | 'RESSALVA' | 'REJEITADO' | null {
  if (pct === null) return null;
  if (pct <= 10) return 'CONFORME';
  if (pct <= 25) return 'RESSALVA';
  return 'REJEITADO';
}

/* ─── Config visual dos badges ────────────────────────────────── */
const BADGE: Record<string, { cls: string; icon: React.ReactNode }> = {
  CONFORME:  { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  RESSALVA:  { cls: 'bg-amber-100 text-amber-700',     icon: <AlertTriangle className="w-3 h-3" /> },
  REJEITADO: { cls: 'bg-red-100 text-red-700',         icon: <XCircle className="w-3 h-3" /> },
};

const LABEL: Record<string, string> = {
  CONFORME: 'Conforme', RESSALVA: 'Ressalva', REJEITADO: 'Rejeitado',
};

const UNIDADES = ['Un.', 'Mês', 'Trimestre', 'Semestre', 'Anual', 'Serviço', 'Hora', 'Km', 'M²', 'Kg', 'Outro'];

/* ─── Componente ──────────────────────────────────────────────── */
export function CotacaoPrevia() {
  const { user } = useAuth();

  /* Carrega rascunho do localStorage na montagem */
  const [items, setItems] = useState<ItemCotacao[]>(() => {
    try {
      const raw = localStorage.getItem(RASCUNHO_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [novoItem()];
    } catch { return [novoItem()]; }
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<CotacaoPreviaResult | null>(null);
  const [erro, setErro]       = useState('');

  /* Auto-save rascunho */
  useEffect(() => {
    try { localStorage.setItem(RASCUNHO_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  /* ── Mutações ── */
  const addItem = () => setItems(prev => [...prev, novoItem()]);

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemCotacao, value: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const limparRascunho = () => {
    setItems([novoItem()]);
    setResult(null);
    setErro('');
    try { localStorage.removeItem(RASCUNHO_KEY); } catch {}
  };

  /* ── Totais calculados ── */
  const { totalRef, totalCotado, variacaoGlobal } = useMemo(() => {
    const totalRef = items.reduce(
      (s, i) => s + (parseFloat(i.quantidade) || 0) * (parseFloat(i.valorReferencia) || 0), 0,
    );
    const totalCotado = items.reduce(
      (s, i) => s + (parseFloat(i.quantidade) || 0) * (parseFloat(i.valorCotado) || 0), 0,
    );
    const variacaoGlobal = totalRef > 0 ? ((totalCotado - totalRef) / totalRef) * 100 : 0;
    return { totalRef, totalCotado, variacaoGlobal };
  }, [items]);

  /* ── Análise via IA ── */
  const handleAnalyze = async () => {
    setErro('');
    for (const item of items) {
      if (!item.descricao.trim()) {
        setErro('Preencha a descrição de todos os itens.'); return;
      }
      if (!isNumPositivo(item.quantidade)) {
        setErro(`"${item.descricao}": quantidade deve ser um número positivo.`); return;
      }
      if (!isNumPositivo(item.valorReferencia)) {
        setErro(`"${item.descricao}": valor de referência inválido ou zero.`); return;
      }
      if (!isNumPositivo(item.valorCotado)) {
        setErro(`"${item.descricao}": valor cotado inválido ou zero.`); return;
      }
    }

    setLoading(true);
    setResult(null);

    /* Enriquece payload com totais pré-calculados */
    const payload = items.map(i => {
      const qty  = parseFloat(i.quantidade);
      const vRef = parseFloat(i.valorReferencia);
      const vCot = parseFloat(i.valorCotado);
      return {
        descricao: i.descricao,
        unidade: i.unidade,
        quantidade: qty,
        valorUnitarioReferencia: vRef,
        valorUnitarioCotado: vCot,
        totalReferencia: qty * vRef,
        totalCotado: qty * vCot,
        variacaoPct: calcVariacao(i.valorReferencia, i.valorCotado),
      };
    });

    try {
      const data = await analyzeMROSC({
        type: 'cotacao_previa',
        textContent: JSON.stringify(payload, null, 2),
        context: {
          user_id: user?.id ?? null,
          user_email: user?.email ?? null,
          timestamp: new Date().toISOString(),
          total_referencia: totalRef,
          total_cotado: totalCotado,
          variacao_global_pct: variacaoGlobal,
        },
      });
      setResult(data as CotacaoPreviaResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido.';
      setErro(`Falha na análise: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const statusSemaforo: 'CONFORME' | 'ATENCAO' | 'REJEITADO' =
    result?.status === 'CONFORME'  ? 'CONFORME'  :
    result?.status === 'REJEITADO' ? 'REJEITADO' : 'ATENCAO';

  const corVar = variacaoGlobal > 25 ? '#DC2626' : variacaoGlobal > 10 ? '#D97706' : '#059669';

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #0D9488 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ClipboardList className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Cotação Prévia</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Análise de orçamentos com IA — Art. 46, Lei 13.019/2014 · IN SEGES 65/2021
            </p>
          </div>
          <button
            onClick={limparRascunho}
            title="Iniciar nova cotação (limpa rascunho)"
            className="print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Nova cotação
          </button>
        </div>
      </div>

      {/* ── Cards de totais ─────────────────────────────────── */}
      {(totalRef > 0 || totalCotado > 0) && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Referência</p>
            <p className="text-lg font-bold text-sky-600">
              {totalRef.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cotado</p>
            <p className="text-lg font-bold" style={{ color: corVar }}>
              {totalCotado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Variação Global</p>
            <p className="text-lg font-bold" style={{ color: corVar }}>
              {variacaoGlobal > 0 ? '+' : ''}{variacaoGlobal.toFixed(2)}%
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: corVar }}>
              {variacaoGlobal > 25 ? 'Indício de sobrepreço (>25%)' :
               variacaoGlobal > 10 ? 'Variação significativa (>10%)' :
               'Dentro da faixa aceitável'}
            </p>
          </div>
        </div>
      )}

      {/* ── Legenda de faixas ───────────────────────────────── */}
      <div className="flex items-center gap-5 text-[11px] text-slate-500 flex-wrap print:hidden">
        <span className="font-semibold text-slate-600">Faixas (Art. 46 · IN 65/2021):</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Até +10% — Conforme</span>
        <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> +10% a +25% — Ressalva</span>
        <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-red-500" /> Acima +25% — Sobrepreço</span>
      </div>

      {/* ── Formulário ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cabeçalho */}
        <div
          className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
          style={{ background: 'linear-gradient(to right, #F0FDF4, #F0FDFA)' }}
        >
          <div>
            <h2 className="text-sm font-bold text-slate-800">Itens Orçamentários</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {items.length} item{items.length > 1 ? 's' : ''} · rascunho salvo automaticamente
            </p>
          </div>
          <button
            onClick={addItem}
            className="print:hidden px-3 py-2 bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Item
          </button>
        </div>

        {/* Cabeçalho das colunas */}
        <div
          className="hidden sm:grid px-6 pt-4 pb-1 gap-3 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider"
          style={{ gridTemplateColumns: '28px 1fr 72px 80px 112px 112px 84px 40px' }}
        >
          <span /><span>Descrição</span><span>Unid.</span><span>Qtd.</span>
          <span>Val. Ref/Un (R$)</span><span>Val. Cot/Un (R$)</span>
          <span>Variação</span><span />
        </div>

        {/* Itens */}
        <div className="px-6 pb-4 space-y-2 pt-1">
          {items.map((item, idx) => {
            const pct   = calcVariacao(item.valorReferencia, item.valorCotado);
            const st    = statusDoItem(pct);
            const badge = st ? BADGE[st] : null;

            return (
              <div
                key={item.id}
                className="flex flex-wrap sm:grid gap-2 sm:gap-3 items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                style={{ gridTemplateColumns: '28px 1fr 72px 80px 112px 112px 84px 40px' }}
              >
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={item.descricao}
                  onChange={e => updateItem(item.id, 'descricao', e.target.value)}
                  placeholder="Ex: Notebook Core i5 8GB SSD 256GB"
                  className="w-full sm:w-auto px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all"
                />

                <select
                  value={item.unidade}
                  onChange={e => updateItem(item.id, 'unidade', e.target.value)}
                  className="px-2 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 outline-none"
                >
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantidade}
                  onChange={e => updateItem(item.id, 'quantidade', e.target.value)}
                  className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 outline-none"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.valorReferencia}
                  onChange={e => updateItem(item.id, 'valorReferencia', e.target.value)}
                  placeholder="0,00"
                  className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 outline-none"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.valorCotado}
                  onChange={e => updateItem(item.id, 'valorCotado', e.target.value)}
                  placeholder="0,00"
                  className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400/30 outline-none"
                />

                {/* Variação em tempo real */}
                <div className="flex items-center">
                  {badge && pct !== null ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${badge.cls}`}>
                      {badge.icon}
                      {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="print:hidden p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed justify-self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Erro */}
        {erro && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        {/* Botão analisar */}
        <div className="px-6 pb-6 flex justify-end print:hidden">
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
            {loading ? 'Analisando com IA...' : 'Analisar Preços com IA'}
          </button>
        </div>
      </div>

      {/* ── Resultado ───────────────────────────────────────── */}
      {result && (
        <div className="space-y-4">
          <SemaforoRisco
            status={statusSemaforo}
            titulo="Resultado da Análise de Cotação Prévia"
            mensagem={result.message ?? ''}
          />

          {/* Por item */}
          {Array.isArray(result.analise_por_item) && result.analise_por_item.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Análise por Item</h3>
              </div>
              <div className="space-y-2">
                {result.analise_por_item.map((item: ItemCotacaoAnalise, idx: number) => {
                  const b = BADGE[item.status_item] ?? BADGE.RESSALVA;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${b.cls}`}>
                        {b.icon} {LABEL[item.status_item] ?? item.status_item}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-800">{item.descricao}</span>
                        <span className="text-[10px] text-slate-500 ml-2">
                          ({item.variacao_pct > 0 ? '+' : ''}{Number(item.variacao_pct).toFixed(1)}%)
                        </span>
                        {item.observacao && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.observacao}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fundamentação */}
          {Array.isArray(result.details) && result.details.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Fundamentação e Recomendações</h3>
              </div>
              <ul className="space-y-2">
                {result.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="text-sm leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
              {result.fundamentacao_legal_especifica && (
                <div className="mt-3 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                    {result.fundamentacao_legal_especifica}
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center pb-2">
            Parte do conteúdo gerado com o auxílio de IA. O servidor permanece responsável pela revisão e autoria plena do resultado.
          </p>
        </div>
      )}
    </div>
  );
}
