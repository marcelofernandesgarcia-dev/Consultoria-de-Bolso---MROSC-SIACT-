import React, { useState } from 'react';
import { RequirementsAnalysis } from './RequirementsAnalysis';
import { MROSCRouter } from './MROSCRouter';
import { RankingSimulator } from './RankingSimulator';
import { CelebraçãoAnalysis } from './CelebraçãoAnalysis';
import { ConcedenteDashboard } from './ConcedenteDashboard'; // This covers phases 4, 5, 6 mostly
import { LayoutDashboard, CheckSquare, GitMerge, FileText, Users, PenTool } from 'lucide-react';
import { clsx } from 'clsx';

export function ConcedenteHub({ onBack }: { onBack: () => void }) {
  const [activePhase, setActivePhase] = useState<number>(1);

  const phases = [
    { id: 1, label: "1. Análise de Requisitos", icon: CheckSquare },
    { id: 2, label: "2. Roteador MROSC", icon: GitMerge },
    { id: 4, label: "4. Planejamento (Interna)", icon: FileText }, // Skipping 3 as it's external (OSC)
    { id: 5, label: "5. Seleção", icon: Users },
    { id: 6, label: "6. Celebração", icon: PenTool },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 text-sm flex items-center gap-1">
        ← Voltar
      </button>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-3 space-y-2">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                activePhase === phase.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <phase.icon className="w-4 h-4" />
              {phase.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="col-span-9">
          {activePhase === 1 && <RequirementsAnalysis />}
          {activePhase === 2 && <MROSCRouter />}
          {activePhase === 4 && <ConcedenteDashboard onBack={() => {}} />} {/* Reusing existing dashboard for phases 4-6 logic */}
          {activePhase === 5 && <RankingSimulator />}
          {activePhase === 6 && <CelebraçãoAnalysis />}
        </div>
      </div>
    </div>
  );
}
