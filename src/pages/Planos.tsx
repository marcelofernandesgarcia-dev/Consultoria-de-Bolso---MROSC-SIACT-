import React, { useState } from 'react';
import { Check, Zap, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: 97,
    icon: Shield,
    color: 'from-slate-500 to-slate-600',
    border: 'border-slate-600/40',
    features: [
      'Até 30 análises MROSC/mês',
      'Gerador de Parecer com PDF',
      'Radar Normativo',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 297,
    icon: Zap,
    color: 'from-indigo-600 to-violet-600',
    border: 'border-indigo-500/50',
    badge: 'MAIS POPULAR',
    features: [
      'Análises ilimitadas',
      'Todos os módulos SIACT',
      'Assistente IA avançado',
      'Histórico completo',
      'Suporte prioritário',
      'Capacitação técnica completa',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    icon: Building2,
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/40',
    features: [
      'Múltiplos usuários / órgão',
      'SSO / LDAP',
      'SLA 99,9 %',
      'Integração SIAFI/Transferegov',
      'Treinamento presencial',
      'Consultoria dedicada',
    ],
  },
];

export function Planos() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);

  const price = (base: number | null) => {
    if (!base) return null;
    return annual ? Math.round(base * 0.8) : base;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white">Planos &amp; Preços</h1>
        <p className="text-slate-400">Escolha o plano ideal para seu órgão ou equipe</p>

        {/* Toggle anual */}
        <div className="inline-flex items-center gap-3 bg-slate-800/60 rounded-full px-4 py-2 mt-2">
          <span className={`text-sm ${!annual ? 'text-white font-medium' : 'text-slate-400'}`}>Mensal</span>
          <button
            onClick={() => setAnnual(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${annual ? 'bg-indigo-600' : 'bg-slate-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${annual ? 'translate-x-5' : ''}`} />
          </button>
          <span className={`text-sm ${annual ? 'text-white font-medium' : 'text-slate-400'}`}>
            Anual <span className="text-emerald-400 font-semibold">-20%</span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const p = price(plan.price);
          const isPro = plan.id === 'pro';

          return (
            <div
              key={plan.id}
              className={`relative glass-card rounded-2xl border ${plan.border} p-6 flex flex-col gap-5 ${isPro ? 'ring-2 ring-indigo-500/40' : ''}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                {p !== null ? (
                  <div className="mt-1">
                    <span className="text-3xl font-extrabold text-white">R$ {p}</span>
                    <span className="text-slate-400 text-sm">/mês</span>
                    {annual && <p className="text-xs text-emerald-400 mt-0.5">Cobrado anualmente</p>}
                  </div>
                ) : (
                  <p className="text-2xl font-extrabold text-white mt-1">Sob consulta</p>
                )}
              </div>

              <ul className="flex-1 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.id === 'enterprise' ? `mailto:contato@siact.app` : '/login'}
                className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isPro
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90'
                    : 'border border-slate-600 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {plan.id === 'enterprise' ? 'Falar com equipe' : 'Assinar agora'}
              </a>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500">
        Planos com emissão de NF. Cancelamento a qualquer momento. Dúvidas: {user?.email ?? 'contato@siact.app'}
      </p>
    </div>
  );
}
