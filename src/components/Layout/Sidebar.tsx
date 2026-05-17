import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, ShieldCheck, Gavel, ClipboardList,
  Activity, GraduationCap, MessageSquare, LayoutTemplate, Route,
  Compass, FileCheck, CalendarDays, Sparkles, BookOpen, Scale,
  LogOut, ChevronsLeft, ChevronsRight, CreditCard, UserCircle, ShieldAlert,
} from 'lucide-react';

const ADMIN_EMAILS = ['marcelofernandesgarcia@gmail.com'];
import { useAuth } from '../../contexts/AuthContext';

/* ─── Constantes exportadas para Layout ───────────────────────── */
export const SIDEBAR_W_EXPANDED  = 240;
export const SIDEBAR_W_COLLAPSED = 68;

/* ─── Progresso capacitação ───────────────────────────────────── */
const TRILHA_KEY = 'siact_capacitacao_progresso';
function loadCapacitacaoPct(): number {
  try {
    const raw = localStorage.getItem(TRILHA_KEY);
    if (!raw) return 0;
    const obj: Record<number, number> = JSON.parse(raw);
    const vals = Object.values(obj);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  } catch { return 0; }
}

/* ─── Tipos ────────────────────────────────────────────────────── */
type SectionColor = 'indigo' | 'violet' | 'amber' | 'slate';
interface NavItem { id: string; label: string; icon: React.ElementType; path: string; }
interface NavGroup { group: string; color: SectionColor; groupIcon: React.ElementType; items: NavItem[]; }

export interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

/* ─── Navegação ────────────────────────────────────────────────── */
const NAVIGATION: NavGroup[] = [
  {
    group: 'Principal', color: 'indigo', groupIcon: LayoutDashboard,
    items: [
      { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard, path: '/' },
      { id: 'inicio',     label: 'Por onde começar', icon: Compass,         path: '/inicio' },
      { id: 'assistente', label: 'Assistente SIACT', icon: MessageSquare,   path: '/assistente' },
    ],
  },
  {
    group: 'Ferramentas OSC', color: 'violet', groupIcon: Sparkles,
    items: [
      { id: 'simulador',   label: 'Simulador de Elegibilidade', icon: Sparkles,     path: '/simulador' },
      { id: 'checklist',   label: 'Checklist de Documentos',   icon: FileCheck,    path: '/checklist' },
      { id: 'calendario',  label: 'Calendário de Prazos',      icon: CalendarDays, path: '/calendario' },
      { id: 'faq',         label: 'Perguntas Frequentes',      icon: BookOpen,     path: '/faq' },
      { id: 'capacitacao', label: 'Capacitação',               icon: GraduationCap,path: '/capacitacao' },
    ],
  },
  {
    group: 'Auditoria e Gestão', color: 'amber', groupIcon: Gavel,
    items: [
      { id: 'integracao',   label: 'Mapa OSC',        icon: Search,       path: '/integracao' },
      { id: 'governanca',   label: 'Governança',       icon: ShieldCheck,  path: '/governanca' },
      { id: 'normas',       label: 'Radar Normativo',  icon: Gavel,        path: '/normas' },
      { id: 'planejamento', label: 'Cotação Prévia',   icon: ClipboardList,path: '/planejamento' },
      { id: 'monitoramento',label: 'Nexo Causal',      icon: Activity,     path: '/monitoramento' },
      { id: 'parecer',      label: 'Parecer Técnico',  icon: Scale,        path: '/parecer' },
    ],
  },
  {
    group: 'Sistema', color: 'slate', groupIcon: LayoutTemplate,
    items: [
      { id: 'planos',      label: 'Planos',      icon: CreditCard,    path: '/planos' },
      { id: 'arquitetura', label: 'Arquitetura', icon: LayoutTemplate, path: '/arquitetura' },
      { id: 'roadmap',     label: 'Roadmap',     icon: Route,          path: '/roadmap' },
    ],
  },
];

/* ─── Cores por seção ─────────────────────────────────────────── */
const C: Record<SectionColor, {
  dot: string; groupLabel: string; groupBg: string; groupText: string;
  activeIcon: string; activeBg: string; activeDot: string;
}> = {
  indigo: { dot:'bg-indigo-500/30', groupLabel:'text-indigo-400/80', groupBg:'hover:bg-indigo-500/10', groupText:'hover:text-indigo-300', activeIcon:'text-indigo-300', activeBg:'bg-indigo-500/[0.18]', activeDot:'bg-indigo-400' },
  violet: { dot:'bg-violet-500/30', groupLabel:'text-violet-400/80', groupBg:'hover:bg-violet-500/10', groupText:'hover:text-violet-300', activeIcon:'text-violet-300', activeBg:'bg-violet-500/[0.18]', activeDot:'bg-violet-400' },
  amber:  { dot:'bg-amber-500/30',  groupLabel:'text-amber-400/80',  groupBg:'hover:bg-amber-500/10',  groupText:'hover:text-amber-300',  activeIcon:'text-amber-300',  activeBg:'bg-amber-500/[0.18]',  activeDot:'bg-amber-400'  },
  slate:  { dot:'bg-slate-500/30',  groupLabel:'text-slate-400/70',  groupBg:'hover:bg-slate-500/10',  groupText:'hover:text-slate-300',  activeIcon:'text-slate-300',  activeBg:'bg-slate-500/[0.18]',  activeDot:'bg-slate-400'  },
};

/* ─── Componente ──────────────────────────────────────────────── */
export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  /* grupo pinado = clicado (persiste ao tirar o mouse) */
  const [pinnedGroup, setPinnedGroup] = useState<string | null>(null);
  /* grupo hovado = temporário */
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [capacPct, setCapacPct] = useState(loadCapacitacaoPct);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'GP';
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário';

  /* Auto-pinar grupo pela rota atual */
  useEffect(() => {
    for (const g of NAVIGATION) {
      const match = g.items.some(item =>
        item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
      );
      if (match) { setPinnedGroup(g.group); return; }
    }
  }, [location.pathname]);

  /* Progresso capacitação */
  useEffect(() => {
    const sync = () => setCapacPct(loadCapacitacaoPct());
    window.addEventListener('storage', sync);
    const t = setInterval(sync, 3000);
    return () => { window.removeEventListener('storage', sync); clearInterval(t); };
  }, []);

  /* Hover com debounce para evitar flickering ao mover entre ícone e items */
  const onEnter = (group: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHoveredGroup(group);
  };
  const onLeave = () => {
    leaveTimer.current = setTimeout(() => setHoveredGroup(null), 150);
  };

  /* Grupo visível = hover (temporário) ou pinado (permanente) */
  const openGroup = hoveredGroup ?? pinnedGroup;

  return (
    <aside
      className="h-screen fixed left-0 top-0 z-30 flex flex-col overflow-hidden print:hidden"
      style={{
        width: isExpanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
        background: 'linear-gradient(180deg, #0D1117 0%, #0B0F1A 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transition: 'width 220ms cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* ── BRAND ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 shrink-0 overflow-hidden"
        style={{ height: 56, padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="relative shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/60"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)' }}
          >
            <ShieldCheck className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: '#0D1117' }} />
        </div>
        {isExpanded && (
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-white tracking-tight leading-none whitespace-nowrap">SIACT-MROSC</p>
            <p className="text-[8.5px] text-slate-500 mt-0.5 font-medium leading-tight whitespace-nowrap">Consultoria de Bolso</p>
          </div>
        )}
      </div>

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 overflow-x-hidden"
           style={{ padding: isExpanded ? '12px 8px' : '12px 10px' }}>
        {NAVIGATION.map((group) => {
          const c = C[group.color];
          const isOpen = openGroup === group.group;
          const GroupIcon = group.groupIcon;

          return (
            <div key={group.group}>
              {/* ── Cabeçalho da seção ── */}
              <button
                onMouseEnter={() => onEnter(group.group)}
                onMouseLeave={onLeave}
                onClick={() => setPinnedGroup(group.group)}
                title={!isExpanded ? group.group : undefined}
                className={`w-full flex items-center rounded-lg transition-all duration-150 ${c.groupBg} ${c.groupText} ${
                  isOpen ? 'text-white' : 'text-slate-600'
                }`}
                style={{ padding: isExpanded ? '6px 10px' : '9px', justifyContent: isExpanded ? 'flex-start' : 'center', gap: isExpanded ? 8 : 0 }}
              >
                <GroupIcon
                  className={`shrink-0 transition-colors ${isOpen ? c.activeIcon : ''}`}
                  style={{ width: 16, height: 16 }}
                  strokeWidth={isOpen ? 2.2 : 1.7}
                />
                {isExpanded && (
                  <span className={`text-[10px] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap ${isOpen ? c.groupLabel : 'text-slate-600'}`}>
                    {group.group}
                  </span>
                )}
              </button>

              {/* ── Items (accordion) — só aparece no modo expandido ── */}
              {isExpanded && (
                <div
                  style={{
                    overflow: 'hidden',
                    maxHeight: isOpen ? `${group.items.length * 40}px` : '0px',
                    transition: 'max-height 200ms ease',
                  }}
                  onMouseEnter={() => onEnter(group.group)}
                  onMouseLeave={onLeave}
                >
                  <div className="pl-2 pb-1 space-y-px">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={() => setPinnedGroup(group.group)}
                        className={({ isActive }) =>
                          `flex flex-col px-3 py-[6px] rounded-lg text-[12.5px] font-medium transition-all duration-100 ${
                            isActive
                              ? `${c.activeBg} text-white`
                              : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2.5">
                              <item.icon
                                className={`w-[14px] h-[14px] shrink-0 ${isActive ? c.activeIcon : 'text-slate-600'}`}
                                strokeWidth={isActive ? 2.2 : 1.75}
                              />
                              <span className="truncate flex-1">{item.label}</span>
                              {item.id === 'capacitacao' && capacPct > 0 ? (
                                <span className={`text-[9px] font-bold shrink-0 ${isActive ? 'text-white/60' : 'text-slate-600'}`}>
                                  {capacPct}%
                                </span>
                              ) : (
                                isActive && <span className={`w-1.5 h-1.5 rounded-full ${c.activeDot} shrink-0`} />
                              )}
                            </div>
                            {item.id === 'capacitacao' && capacPct > 0 && (
                              <div className="mt-1 ml-[22px] h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${capacPct}%`, background: isActive ? 'rgba(255,255,255,0.4)' : '#6366F1' }}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── TOGGLE retrair/expandir ──────────────────────────── */}
      <div
        className="flex shrink-0"
        style={{
          padding: isExpanded ? '8px 8px' : '8px 10px',
          justifyContent: isExpanded ? 'flex-end' : 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={onToggle}
          title={isExpanded ? 'Recolher menu' : 'Expandir menu'}
          className={`rounded-xl flex items-center justify-center transition-all duration-150 ${
            isExpanded
              ? 'w-8 h-8 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]'
              : 'w-11 h-9 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]'
          }`}
        >
          {isExpanded
            ? <ChevronsLeft  className="w-4 h-4" />
            : <ChevronsRight className="w-4 h-4" />
          }
        </button>
      </div>

      {/* ── FOOTER usuário ───────────────────────────────────── */}
      <div
        className="shrink-0 overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Admin link — só para admins */}
        {isExpanded && user?.email && ADMIN_EMAILS.includes(user.email) && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 mx-2 mt-2 rounded-lg text-[11.5px] font-medium transition-colors ${
                isActive ? 'bg-amber-500/10 text-amber-300' : 'text-slate-500 hover:text-amber-300 hover:bg-amber-500/10'
              }`
            }
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Admin</span>
          </NavLink>
        )}

        {/* Perfil do usuário */}
        <div
          className="flex items-center overflow-hidden"
          style={{
            padding: isExpanded ? '10px 12px' : '10px',
            gap: isExpanded ? 10 : 0,
            justifyContent: isExpanded ? 'flex-start' : 'center',
          }}
        >
          <NavLink
            to="/conta"
            title={!isExpanded ? `${displayName} — Minha conta` : undefined}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 hover:ring-2 hover:ring-indigo-500/40 transition-all"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          >
            <span className="text-[11px] font-bold text-white">{initials}</span>
          </NavLink>
          {isExpanded && (
            <>
              <NavLink to="/conta" className="flex-1 min-w-0 group">
                <p className="text-[11.5px] font-semibold text-slate-300 leading-none truncate group-hover:text-white transition-colors">{displayName}</p>
                <p className="text-[9px] text-slate-600 mt-0.5 truncate">{user?.email ?? ''}</p>
              </NavLink>
              <button
                onClick={signOut}
                title="Sair"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-white/[0.04] transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
