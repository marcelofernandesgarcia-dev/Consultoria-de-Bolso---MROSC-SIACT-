import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock, Loader2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  total: number;
  approved: number;
  warning: number;
  rejected: number;
}

interface RecentAnalysis {
  id: number;
  document_name: string;
  status: 'CONFORME' | 'RESSALVA' | 'NAO_CONFORME';
  date: string;
  type: string;
}

interface DashboardData {
  stats: DashboardStats & { growth: DashboardStats };
  recent: RecentAnalysis[];
}

const TYPE_LABELS: Record<string, string> = {
  requirements_eligibility: 'Elegibilidade',
  requirements_docs: 'Documentação',
  requirements_budget: 'Orçamento',
  mrosc_router: 'Roteador MROSC',
  celebration_validation: 'Nexo Causal',
  celebration_term: 'Termo Final',
  celebration_workplan: 'Plano de Trabalho',
  radar_normativo: 'Radar Normativo',
  cotacao_previa: 'Cotação Prévia',
  auditoria_nexo_causal: 'Auditoria Nexo',
  papeis_impedimentos: 'Papéis/Impedimentos',
  selection_ranking: 'Ranqueamento',
};

function StatusBadge({ status }: { status: RecentAnalysis['status'] }) {
  const map = {
    CONFORME: 'bg-emerald-500/10 text-emerald-400',
    RESSALVA: 'bg-amber-500/10 text-amber-400',
    NAO_CONFORME: 'bg-red-500/10 text-red-400',
  };
  const labels = { CONFORME: 'Conforme', RESSALVA: 'Ressalva', NAO_CONFORME: 'Não Conforme' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('Falha ao carregar dashboard');
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const score = data && data.stats.total > 0
    ? Math.round((data.stats.approved / data.stats.total) * 100)
    : null;

  const chartData = data
    ? [
        { name: 'Conforme', value: data.stats.approved, color: '#10b981' },
        { name: 'Ressalva', value: data.stats.warning, color: '#f59e0b' },
        { name: 'Não Conforme', value: data.stats.rejected, color: '#ef4444' },
      ]
    : [];

  const firstName = user?.email?.split('@')[0] ?? 'Gestor';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Bom dia, <span className="text-indigo-400">{firstName}</span>
        </h1>
        <p className="text-slate-400 mt-2">Visão geral das análises MROSC realizadas no sistema.</p>
      </header>

      {loading && (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Total de Análises</h3>
              <p className="text-3xl font-bold text-white mt-1">{data.stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">acumulado no sistema</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Conforme</h3>
              <p className="text-3xl font-bold text-white mt-1">{data.stats.approved}</p>
              <p className="text-xs text-emerald-500 mt-1">
                {data.stats.total > 0 ? `${Math.round((data.stats.approved / data.stats.total) * 100)}% do total` : '—'}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Ressalva</h3>
              <p className="text-3xl font-bold text-white mt-1">{data.stats.warning}</p>
              <p className="text-xs text-amber-500 mt-1">requerem atenção</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-400">Não Conforme</h3>
              <p className="text-3xl font-bold text-white mt-1">{data.stats.rejected}</p>
              <p className="text-xs text-red-500 mt-1">reprovadas</p>
            </motion.div>
          </div>

          {/* Chart + Score row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar chart */}
            <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 p-6">
              <h2 className="text-base font-bold text-white mb-6">Distribuição de Resultados</h2>
              {data.stats.total === 0 ? (
                <p className="text-slate-500 text-sm">Nenhuma análise realizada ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Score card */}
            <div className="glass-card rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">Score de Conformidade</h3>
                <p className="text-5xl font-bold text-white">
                  {score !== null ? `${score}%` : '—'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {score !== null
                    ? score >= 80 ? 'Excelente desempenho' : score >= 60 ? 'Bom desempenho' : 'Atenção necessária'
                    : 'Realize análises para ver o score'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent analyses */}
          <div className="glass-card rounded-2xl border border-white/10 p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Análises Recentes
            </h2>
            {data.recent.length === 0 ? (
              <p className="text-slate-500 text-sm">Nenhuma análise encontrada. Utilize o Assistente SIACT para começar.</p>
            ) : (
              <div className="space-y-2">
                {data.recent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-slate-400">
                        {item.id}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.document_name}</p>
                        <p className="text-xs text-slate-500">{TYPE_LABELS[item.type] ?? item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-slate-500 w-10 text-right">{formatDate(item.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
