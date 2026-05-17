import React, { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/apiFetch';

const ADMIN_EMAILS = ['marcelofernandesgarcia@gmail.com'];

interface Stats {
  total_analyses: number;
  total_users: number;
  conforme: number;
  ressalva: number;
  nao_conforme: number;
  last_7_days: number;
}

export function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!isAdmin) return;
    apiFetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => setStats(d))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={40} className="text-amber-400" />
        <p className="text-slate-400 text-lg">Acesso restrito a administradores.</p>
      </div>
    );
  }

  const cards = stats
    ? [
        { label: 'Total de análises', value: stats.total_analyses, icon: FileText, color: 'from-indigo-600 to-violet-600' },
        { label: 'Usuários ativos', value: stats.total_users, icon: Users, color: 'from-emerald-600 to-teal-600' },
        { label: 'Últimos 7 dias', value: stats.last_7_days, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
        { label: 'Taxa conformidade', value: `${Math.round((stats.conforme / (stats.total_analyses || 1)) * 100)}%`, icon: TrendingUp, color: 'from-sky-600 to-blue-600' },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
        <p className="text-slate-400 text-sm mt-1">Métricas globais da plataforma SIACT-MROSC</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-16">Carregando métricas…</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="glass-card rounded-2xl border border-slate-700/50 p-5 space-y-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <Icon size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card rounded-2xl border border-slate-700/50 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Distribuição de Status</h2>
            <div className="space-y-2">
              <Bar label="Conforme" value={stats.conforme} total={stats.total_analyses} color="bg-emerald-500" />
              <Bar label="Ressalva" value={stats.ressalva} total={stats.total_analyses} color="bg-amber-500" />
              <Bar label="Não Conforme" value={stats.nao_conforme} total={stats.total_analyses} color="bg-red-500" />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-slate-400 py-16">
          <p>Endpoint <code className="text-slate-300">/api/admin/stats</code> não disponível.</p>
          <p className="text-sm mt-1">Implemente a rota no server.ts para visualizar as métricas.</p>
        </div>
      )}
    </div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-300 w-8 text-right">{pct}%</span>
    </div>
  );
}
