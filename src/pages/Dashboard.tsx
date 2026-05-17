import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Search, Activity, GraduationCap } from 'lucide-react';
import { OSCProfile } from '../types';

export function Dashboard() {
  const [recentOSCs, setRecentOSCs] = useState<OSCProfile[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('siact_recent_oscs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentOSCs(parsed);
        }
      }
    } catch (e) {
      console.error('Error parsing recent oscs', e);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white text-glow tracking-tight">Painel de Controle</h1>
        <p className="text-slate-400 mt-2">Visão geral do sistema SIACT-MROSC.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-400">Score de Confiabilidade</h3>
          <p className="text-2xl font-bold text-white text-glow mt-1">98.5%</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-400">Consultas Realizadas</h3>
          <p className="text-2xl font-bold text-white text-glow mt-1">{recentOSCs.length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-400">Análises Pendentes</h3>
          <p className="text-2xl font-bold text-white text-glow mt-1">3</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-400">Trilhas Concluídas</h3>
          <p className="text-2xl font-bold text-white text-glow mt-1">12</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white text-glow mb-4">OSCs Consultadas Recentemente</h2>
        {recentOSCs.length > 0 ? (
          <div className="space-y-4">
            {recentOSCs.map((osc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-medium text-white">{osc.nome}</h4>
                  <p className="text-sm text-slate-400">CNPJ: {osc.cnpj}</p>
                </div>
                <div>
                  {osc.ipeaInsights?.isEligible ? (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">Elegível</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full">Atenção</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Nenhuma consulta recente encontrada.</p>
        )}
      </div>
    </div>
  );
}

