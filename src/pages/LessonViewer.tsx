import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  ArrowLeft,
  PlayCircle,
  FileText,
  Zap,
} from 'lucide-react';
import { CURSOS } from '../data/cursos';

const AULAS_KEY = 'siact_aulas_concluidas';
const TRILHA_KEY = 'siact_capacitacao_progresso';

const CURSO_GRADIENTS = [
  'linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #7C3AED 100%)',
  'linear-gradient(135deg, #0C4A6E 0%, #0284C7 55%, #0891B2 100%)',
  'linear-gradient(135deg, #064E3B 0%, #059669 50%, #0D9488 100%)',
  'linear-gradient(135deg, #881337 0%, #E11D48 50%, #DB2777 100%)',
];

const CURSO_BARS = ['#6366F1', '#0EA5E9', '#10B981', '#F43F5E'];

function loadConcluidas(): Set<string> {
  try {
    const raw = localStorage.getItem(AULAS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveConcluidas(set: Set<string>) {
  localStorage.setItem(AULAS_KEY, JSON.stringify(Array.from(set)));
}

function syncTrilhaProgresso(cursoId: number, concluidas: Set<string>, totalAulas: number) {
  const count = Array.from(concluidas).filter(k => k.startsWith(`${cursoId}-`)).length;
  const pct = totalAulas > 0 ? Math.round((count / totalAulas) * 100) : 0;
  try {
    const raw = localStorage.getItem(TRILHA_KEY);
    const prev: Record<number, number> = raw ? JSON.parse(raw) : {};
    localStorage.setItem(TRILHA_KEY, JSON.stringify({ ...prev, [cursoId]: pct }));
  } catch {}
}

const TIPO_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  texto:  { label: 'Leitura',  bg: '#EEF2FF', color: '#4338CA' },
  quiz:   { label: 'Simulado', bg: '#FFF7ED', color: '#C2410C' },
  visual: { label: 'Visual',   bg: '#F0FDF4', color: '#166534' },
};

export function LessonViewer() {
  const { cursoId, aulaId } = useParams<{ cursoId: string; aulaId: string }>();
  const navigate = useNavigate();

  const cursoIdx = useMemo(() => CURSOS.findIndex(c => c.id === Number(cursoId)), [cursoId]);
  const curso = CURSOS[cursoIdx] ?? null;
  const gradient = CURSO_GRADIENTS[cursoIdx % CURSO_GRADIENTS.length];
  const barColor = CURSO_BARS[cursoIdx % CURSO_BARS.length];

  const todasAulas = useMemo(() => {
    if (!curso) return [];
    return curso.modulos.flatMap(m =>
      m.aulas.map(a => ({ ...a, moduloId: m.id, moduloTitulo: m.titulo }))
    );
  }, [curso]);

  const aulaIndex = todasAulas.findIndex(a => a.id === aulaId);
  const aulaAtual = todasAulas[aulaIndex] ?? null;

  const [concluidas, setConcluidas] = useState<Set<string>>(loadConcluidas);

  const aulaKey = (id: string) => `${cursoId}-${id}`;
  const isConcluida = (id: string) => concluidas.has(aulaKey(id));

  useEffect(() => {
    saveConcluidas(concluidas);
    if (curso) syncTrilhaProgresso(curso.id, concluidas, todasAulas.length);
  }, [concluidas, curso, todasAulas.length]);

  const progresso = useMemo(() => {
    if (!todasAulas.length) return 0;
    const count = todasAulas.filter(a => concluidas.has(aulaKey(a.id))).length;
    return Math.round((count / todasAulas.length) * 100);
  }, [concluidas, todasAulas, cursoId]);

  const marcarConcluida = () => {
    if (!aulaAtual) return;
    setConcluidas(prev => new Set([...prev, aulaKey(aulaAtual.id)]));
    if (aulaIndex < todasAulas.length - 1) {
      navigate(`/capacitacao/${cursoId}/${todasAulas[aulaIndex + 1].id}`);
    }
  };

  if (!curso || !aulaAtual) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <p className="text-slate-500 text-lg">Aula não encontrada.</p>
        <Link to="/capacitacao" className="text-indigo-600 hover:underline text-sm">
          ← Voltar para Capacitação
        </Link>
      </div>
    );
  }

  const aulaAnterior = aulaIndex > 0 ? todasAulas[aulaIndex - 1] : null;
  const proximaAula = aulaIndex < todasAulas.length - 1 ? todasAulas[aulaIndex + 1] : null;
  const jaConcluidaAtual = isConcluida(aulaAtual.id);
  const tipoConfig = TIPO_CONFIG[aulaAtual.tipo] ?? TIPO_CONFIG.texto;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link
          to="/capacitacao"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Capacitação
        </Link>
        <span className="text-slate-300 text-sm">/</span>
        <span className="text-sm text-slate-500 truncate max-w-[200px]">{curso.titulo}</span>
        <span className="text-slate-300 text-sm">/</span>
        <span className="text-sm text-slate-800 font-medium truncate max-w-[200px]">{aulaAtual.titulo}</span>
      </div>

      <div className="flex gap-5 items-start">
        {/* LEFT: lesson content */}
        <div className="flex-1 min-w-0 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Lesson header with gradient */}
            <div style={{ background: gradient }} className="px-8 py-5">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  {tipoConfig.label}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <Clock className="w-3.5 h-3.5" /> {aulaAtual.duracao}
                </span>
                {jaConcluidaAtual && (
                  <span
                    className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Concluída
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white leading-snug">{aulaAtual.titulo}</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Aula {aulaIndex + 1} de {todasAulas.length} · {aulaAtual.moduloTitulo}
              </p>
            </div>

            {/* Markdown content */}
            <div className="px-8 py-7 prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-strong:text-slate-800 prose-li:text-slate-600 prose-p:text-slate-600 prose-p:leading-relaxed prose-code:bg-slate-100 prose-code:px-1.5 prose-code:rounded prose-code:text-slate-700 prose-blockquote:border-l-4 prose-blockquote:border-indigo-300 prose-blockquote:bg-indigo-50/50 prose-blockquote:rounded-r-lg">
              <ReactMarkdown>{aulaAtual.conteudo}</ReactMarkdown>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between gap-4 pb-6">
            <div className="flex-1">
              {aulaAnterior && (
                <button
                  onClick={() => navigate(`/capacitacao/${cursoId}/${aulaAnterior.id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[150px]">{aulaAnterior.titulo}</span>
                </button>
              )}
            </div>

            <button
              onClick={marcarConcluida}
              disabled={jaConcluidaAtual}
              style={!jaConcluidaAtual ? { background: gradient, boxShadow: '0 4px 14px rgba(79,70,229,0.3)' } : undefined}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shrink-0 ${
                jaConcluidaAtual
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                  : 'text-white hover:opacity-90'
              }`}
            >
              {jaConcluidaAtual ? (
                <><CheckCircle2 className="w-4 h-4" /> Concluída</>
              ) : proximaAula ? (
                <>Marcar Concluída <ChevronRight className="w-4 h-4" /></>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Finalizar Curso</>
              )}
            </button>

            <div className="flex-1 flex justify-end">
              {proximaAula && (
                <button
                  onClick={() => navigate(`/capacitacao/${cursoId}/${proximaAula.id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                >
                  <span className="truncate max-w-[150px]">{proximaAula.titulo}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: sidebar */}
        <div className="w-72 shrink-0 sticky top-6 space-y-4">
          {/* Progress card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div style={{ background: gradient }} className="px-4 py-3.5">
              <h2 className="text-xs font-bold text-white truncate">{curso.titulo}</h2>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{todasAulas.length} aulas</p>
            </div>
            <div className="px-4 py-3.5">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-500">Seu progresso</span>
                <span style={{ color: progresso === 100 ? '#059669' : barColor }}>{progresso}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progresso}%`, background: progresso === 100 ? '#10B981' : barColor }}
                />
              </div>
              {progresso === 100 && (
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Curso concluído!
                </p>
              )}
            </div>
          </div>

          {/* Lesson list */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-800">Conteúdo</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[58vh] overflow-y-auto">
              {curso.modulos.map(modulo => (
                <div key={modulo.id}>
                  <div className="px-4 py-2 bg-slate-50 sticky top-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{modulo.titulo}</p>
                  </div>
                  {modulo.aulas.map(aula => {
                    const isAtual = aula.id === aulaId;
                    const concluida = isConcluida(aula.id);
                    return (
                      <button
                        key={aula.id}
                        onClick={() => navigate(`/capacitacao/${cursoId}/${aula.id}`)}
                        className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors border-l-2 ${
                          isAtual
                            ? 'bg-indigo-50 border-indigo-500'
                            : 'hover:bg-slate-50 border-transparent'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {concluida ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : isAtual ? (
                            <PlayCircle className="w-3.5 h-3.5 text-indigo-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug truncate ${
                            isAtual ? 'font-semibold text-indigo-700' : concluida ? 'text-slate-400' : 'text-slate-700'
                          }`}>
                            {aula.titulo}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">{aula.duracao}</span>
                            {isAtual && (
                              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                                Em andamento
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
