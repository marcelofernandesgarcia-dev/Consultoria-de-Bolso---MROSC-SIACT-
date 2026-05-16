import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, CheckCircle2, Clock, Trophy, RotateCcw, Star } from 'lucide-react';
import { CURSOS } from '../data/cursos';

const TRILHA_KEY = 'siact_capacitacao_progresso';
const AULAS_KEY = 'siact_aulas_concluidas';

const CURSO_THEMES = [
  {
    gradient: 'linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #7C3AED 100%)',
    shadow: 'rgba(79,70,229,0.35)',
    pill: 'bg-indigo-100 text-indigo-700',
    bar: '#6366F1',
    badge: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    tag: 'Módulo 1',
  },
  {
    gradient: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 55%, #0891B2 100%)',
    shadow: 'rgba(2,132,199,0.35)',
    pill: 'bg-sky-100 text-sky-700',
    bar: '#0EA5E9',
    badge: 'bg-sky-50 border-sky-200 text-sky-700',
    tag: 'Módulo 2',
  },
  {
    gradient: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #0D9488 100%)',
    shadow: 'rgba(5,150,105,0.35)',
    pill: 'bg-emerald-100 text-emerald-700',
    bar: '#10B981',
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    tag: 'Módulo 3',
  },
  {
    gradient: 'linear-gradient(135deg, #881337 0%, #E11D48 50%, #DB2777 100%)',
    shadow: 'rgba(225,29,72,0.35)',
    pill: 'bg-rose-100 text-rose-700',
    bar: '#F43F5E',
    badge: 'bg-rose-50 border-rose-200 text-rose-700',
    tag: 'Módulo 4',
  },
];

function loadTrilhaProgresso(): Record<number, number> {
  try {
    const raw = localStorage.getItem(TRILHA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadConcluidas(): Set<string> {
  try {
    const raw = localStorage.getItem(AULAS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function CapacitacaoTecnica() {
  const navigate = useNavigate();
  const [progresso, setProgresso] = useState<Record<number, number>>(loadTrilhaProgresso);

  useEffect(() => {
    const concluidas = loadConcluidas();
    const updated: Record<number, number> = {};
    for (const curso of CURSOS) {
      const total = curso.modulos.reduce((acc, m) => acc + m.aulas.length, 0);
      const count = Array.from(concluidas).filter(k => k.startsWith(`${curso.id}-`)).length;
      updated[curso.id] = total > 0 ? Math.round((count / total) * 100) : 0;
    }
    setProgresso(updated);
    localStorage.setItem(TRILHA_KEY, JSON.stringify(updated));
  }, []);

  const reiniciar = (cursoId: number) => {
    const concluidas = loadConcluidas();
    const filtered = new Set(Array.from(concluidas).filter(k => !k.startsWith(`${cursoId}-`)));
    localStorage.setItem(AULAS_KEY, JSON.stringify(Array.from(filtered)));
    setProgresso(prev => ({ ...prev, [cursoId]: 0 }));
    localStorage.setItem(TRILHA_KEY, JSON.stringify({ ...progresso, [cursoId]: 0 }));
  };

  const cursoMeta = useMemo(() =>
    CURSOS.map(c => ({
      ...c,
      totalAulas: c.modulos.reduce((acc, m) => acc + m.aulas.length, 0),
      duracao: c.modulos.reduce((acc, m) => {
        return acc + m.aulas.reduce((s, a) => {
          const [min] = a.duracao.split(':').map(Number);
          return s + min;
        }, 0);
      }, 0),
    })), []
  );

  const totalConcluidas = Object.values(progresso).filter(v => v >= 100).length;

  const handleIniciar = (cursoId: number, pct: number) => {
    const curso = CURSOS.find(c => c.id === cursoId);
    if (!curso) return;
    if (pct > 0 && pct < 100) {
      const concluidas = loadConcluidas();
      for (const modulo of curso.modulos) {
        for (const aula of modulo.aulas) {
          if (!concluidas.has(`${cursoId}-${aula.id}`)) {
            navigate(`/capacitacao/${cursoId}/${aula.id}`);
            return;
          }
        }
      }
    }
    const primeiraAula = curso.modulos[0]?.aulas[0];
    if (primeiraAula) navigate(`/capacitacao/${cursoId}/${primeiraAula.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 40%, #4F46E5 70%, #6D28D9 100%)' }}>
        <div className="px-8 py-6 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Star className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Capacitação Técnica</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Trilhas de aprendizagem sobre o Marco Regulatório das OSCs — Lei 13.019/2014 e Decreto 11.948/2024
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-white">{totalConcluidas}/{CURSOS.length}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>trilhas concluídas</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-8 pb-6">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(totalConcluidas / CURSOS.length) * 100}%`, background: 'rgba(255,255,255,0.8)' }}
            />
          </div>
        </div>
      </div>

      {totalConcluidas === CURSOS.length && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <Trophy className="w-6 h-6 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">Parabéns! Você concluiu todas as trilhas de capacitação.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cursoMeta.map((curso, idx) => {
          const theme = CURSO_THEMES[idx % CURSO_THEMES.length];
          const pct = progresso[curso.id] ?? 0;
          const concluida = pct >= 100;
          const horas = Math.floor(curso.duracao / 60);
          const mins = curso.duracao % 60;
          const duracaoLabel = horas > 0 ? `${horas}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;

          return (
            <div key={curso.id} className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col">
              {/* Gradient card header */}
              <div style={{ background: theme.gradient }} className="relative p-6 pb-5">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{theme.tag}</span>
                    <h3 className="text-lg font-bold text-white mt-1 leading-snug">{curso.titulo}</h3>
                  </div>
                  {concluida && (
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                    </div>
                  )}
                </div>

                <p className="relative text-sm mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {curso.descricao}
                </p>

                {/* Stats */}
                <div className="relative flex items-center gap-4 mt-4">
                  <span className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                    <BookOpen className="w-3.5 h-3.5" /> {curso.totalAulas} aulas
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {duracaoLabel}
                  </span>
                </div>
              </div>

              {/* Progress + actions */}
              <div className="bg-white flex-1 p-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-500">Progresso</span>
                    <span style={{ color: concluida ? '#059669' : theme.bar }}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: concluida ? '#10B981' : theme.bar }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleIniciar(curso.id, pct)}
                    style={!concluida ? { background: theme.gradient, boxShadow: `0 4px 12px ${theme.shadow}` } : undefined}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 ${
                      concluida
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'text-white'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    {concluida ? 'Rever Conteúdo' : pct > 0 ? 'Continuar' : 'Iniciar Trilha'}
                  </button>
                  {pct > 0 && (
                    <button
                      onClick={() => reiniciar(curso.id)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                      title="Reiniciar trilha"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
