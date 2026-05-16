import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, X, ArrowRight } from 'lucide-react';
import { Sidebar } from './Sidebar';

const PAGE_TITLES: [string, string][] = [
  ['/inicio', 'Por onde começar'],
  ['/assistente', 'Assistente SIACT'],
  ['/simulador', 'Simulador de Elegibilidade'],
  ['/checklist', 'Checklist de Documentos'],
  ['/calendario', 'Calendário de Prazos'],
  ['/faq', 'Perguntas Frequentes'],
  ['/capacitacao', 'Capacitação'],
  ['/integracao', 'Mapa OSC'],
  ['/governanca', 'Governança'],
  ['/normas', 'Radar Normativo'],
  ['/planejamento', 'Cotação Prévia'],
  ['/monitoramento', 'Nexo Causal'],
  ['/parecer', 'Parecer Técnico'],
  ['/arquitetura', 'Arquitetura'],
  ['/roadmap', 'Roadmap'],
];

const AVISOS = [
  { id: 'decreto-11948', titulo: 'Decreto 11.948/2024 em vigor', texto: 'Simplifica exigências para parcerias até R$ 120k. Confira o Checklist atualizado.', link: '/checklist', linkLabel: 'Ver Checklist' },
  { id: 'prestacao-90d', titulo: 'Lembrete de prazo importante', texto: 'Prestação de contas final deve ser entregue em até 90 dias após o término da vigência.', link: '/calendario', linkLabel: 'Ver Calendário' },
  { id: 'simulador-tip', titulo: 'Verifique a elegibilidade da sua OSC', texto: 'Use o Simulador de Elegibilidade para saber se sua OSC está apta antes do chamamento.', link: '/simulador', linkLabel: 'Ir ao Simulador' },
];

const DISMISSED_KEY = 'siact_avisos_dismissed';
function loadDismissed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveDismissed(s: Set<string>) {
  try { localStorage.setItem(DISMISSED_KEY, JSON.stringify([...s])); } catch {}
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of PAGE_TITLES) {
    if (pathname === path || pathname.startsWith(path + '/')) return title;
  }
  return 'Dashboard';
}

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(pathname);

  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const ativos = AVISOS.filter(a => !dismissed.has(a.id));
  const count = ativos.length;

  const dismiss = (id: string) => {
    setDismissed(prev => {
      const next = new Set([...prev, id]);
      saveDismissed(next);
      return next;
    });
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F4F8' }}>
      <Sidebar />
      <div className="flex-1 ml-[68px] flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-20 shrink-0 h-12 flex items-center px-7 gap-2" style={{ background: 'rgba(242,244,248,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <span className="text-[11px] text-slate-400 font-medium" title="Sistema Inteligente de Análise e Controle de Transferências da União">SIACT-MROSC</span>
          <span className="text-[11px] text-slate-300 mx-0.5">/</span>
          <span className="text-[11px] text-slate-700 font-semibold">{pageTitle}</span>

          <div className="ml-auto flex items-center gap-3">
            {/* Online badge */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">Online</span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Decreto 11.948/2024</span>
            <div className="w-px h-3 bg-slate-300" />

            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setOpen(o => !o)}
                className="relative flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-slate-200/70"
                title="Notificações"
              >
                <Bell className="w-4 h-4 text-slate-500" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {count}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {open && (
                <div
                  className="absolute right-0 top-9 w-80 rounded-2xl shadow-xl overflow-hidden"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', zIndex: 50 }}
                >
                  <div className="px-4 py-3 flex items-center justify-between"
                       style={{ background: 'linear-gradient(to right, #F5F3FF, #EEF2FF)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Notificações</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{count > 0 ? `${count} aviso${count > 1 ? 's' : ''} ativo${count > 1 ? 's' : ''}` : 'Tudo em dia'}</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {ativos.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                        <p className="text-xs text-slate-400">Nenhuma notificação pendente</p>
                      </div>
                    ) : (
                      ativos.map(a => (
                        <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 leading-snug">{a.titulo}</p>
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{a.texto}</p>
                              <div className="flex items-center justify-between mt-2">
                                <button
                                  onClick={() => { navigate(a.link); setOpen(false); }}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                  {a.linkLabel} <ArrowRight className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => dismiss(a.id)}
                                  className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  Dispensar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
