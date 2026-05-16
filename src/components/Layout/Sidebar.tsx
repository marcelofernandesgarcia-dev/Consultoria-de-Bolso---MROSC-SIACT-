import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, ShieldCheck, Gavel, ClipboardList,
  Activity, GraduationCap, MessageSquare, LayoutTemplate, Route,
  Compass, FileCheck, CalendarDays, Sparkles, BookOpen, Scale, LogOut,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Progresso capacitação ──────────────────────────────────── */
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

/* ─── Tipos ───────────────────────────────────────────────────── */
type SectionColor = 'indigo' | 'violet' | 'amber' | 'slate';
interface NavItem { id: string; label: string; icon: React.ElementType; path: string; }
interface NavGroup { group: string; color: SectionColor; groupIcon: React.ElementType; items: NavItem[]; }

export interface SidebarProps {
  isPinned: boolean;
  onTogglePin: () => void;
}

/* ─── Dados de navegação ──────────────────────────────────────── */
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
      { id: 'arquitetura', label: 'Arquitetura', icon: LayoutTemplate, path: '/arquitetura' },
      { id: 'roadmap',     label: 'Roadmap',     icon: Route,          path: '/roadmap' },
    ],
  },
];

/* ─── Paleta ──────────────────────────────────────────────────── */
const COLORS: Record<SectionColor, {
  rail: string; railActive: string;
  flyoutLabel: string; flyoutBorder: string;
  activeIcon: string; activeBg: string; activeDot: string;
}> = {
  indigo: { rail:'text-slate-600 hover:text-indigo-300 hover:bg-indigo-500/10', railActive:'text-indigo-300 bg-indigo-500/20', flyoutLabel:'text-indigo-400/80', flyoutBorder:'rgba(99,102,241,0.18)', activeIcon:'text-indigo-300', activeBg:'bg-indigo-500/[0.18]', activeDot:'bg-indigo-400' },
  violet: { rail:'text-slate-600 hover:text-violet-300 hover:bg-violet-500/10', railActive:'text-violet-300 bg-violet-500/20', flyoutLabel:'text-violet-400/80', flyoutBorder:'rgba(139,92,246,0.18)', activeIcon:'text-violet-300', activeBg:'bg-violet-500/[0.18]', activeDot:'bg-violet-400' },
  amber:  { rail:'text-slate-600 hover:text-amber-300 hover:bg-amber-500/10',   railActive:'text-amber-300 bg-amber-500/20',   flyoutLabel:'text-amber-400/80',  flyoutBorder:'rgba(245,158,11,0.18)',  activeIcon:'text-amber-300',  activeBg:'bg-amber-500/[0.18]',  activeDot:'bg-amber-400' },
  slate:  { rail:'text-slate-600 hover:text-slate-300 hover:bg-slate-500/10',   railActive:'text-slate-300 bg-slate-500/20',   flyoutLabel:'text-slate-400/70',  flyoutBorder:'rgba(148,163,184,0.12)', activeIcon:'text-slate-300',  activeBg:'bg-slate-500/[0.18]',  activeDot:'bg-slate-400' },
};

export const RAIL_W  = 68;
export const FLYOUT_W = 210;

/* ─── Componente ──────────────────────────────────────────────── */
export function Sidebar({ isPinned, onTogglePin }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [pinnedGroup, setPinnedGroup] = useState<string | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [capacPct, setCapacPct] = useState(loadCapacitacaoPct);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'GP';
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário';

  /* Auto-pin do grupo pela rota */
  useEffect(() => {
    for (const group of NAVIGATION) {
      const match = group.items.some(item =>
        item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
      );
      if (match) { setPinnedGroup(group.group); return; }
    }
  }, [location.pathname]);

  /* Progresso capacitação */
  useEffect(() => {
    const sync = () => setCapacPct(loadCapacitacaoPct());
    window.addEventListener('storage', sync);
    const t = setInterval(sync, 3000);
    return () => { window.removeEventListener('storage', sync); clearInterval(t); };
  }, []);

  /* Hover com debounce */
  const onEnterIcon = (group: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHoveredGroup(group);
  };
  const onLeave = () => {
    leaveTimer.current = setTimeout(() => setHoveredGroup(null), 130);
  };
  const onEnterFlyout = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  const visibleGroup = hoveredGroup ?? pinnedGroup;
  const flyoutData = NAVIGATION.find(g => g.group === visibleGroup);

  return (
    <>
      {/* ══ RAIL ════════════════════════════════════════════════ */}
      <aside
        className="h-screen fixed left-0 top-0 z-30 flex flex-col"
        style={{
          width: RAIL_W,
          background: 'linear-gradient(180deg, #0D1117 0%, #0B0F1A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center shrink-0" style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/60"
                 style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)' }}>
              <ShieldCheck className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: '#0D1117' }} />
          </div>
        </div>

        {/* Ícones dos grupos */}
        <nav className="flex-1 flex flex-col items-center gap-1 py-3 px-2">
          {NAVIGATION.map((group) => {
            const c = COLORS[group.color];
            const isActive = visibleGroup === group.group;
            const GroupIcon = group.groupIcon;
            return (
              <button
                key={group.group}
                title={group.group}
                onMouseEnter={() => onEnterIcon(group.group)}
                onMouseLeave={onLeave}
                onClick={() => setPinnedGroup(group.group)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${isActive ? c.railActive : c.rail}`}
              >
                <GroupIcon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.2 : 1.7} />
              </button>
            );
          })}
        </nav>

        {/* Botão retrair/expandir — sempre visível no rail */}
        <div className="flex justify-center px-2 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onTogglePin}
            title={isPinned ? 'Recolher menu (←)' : 'Expandir menu (→)'}
            className={`w-11 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
              isPinned
                ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
          >
            {isPinned
              ? <ChevronsLeft  className="w-4 h-4" />
              : <ChevronsRight className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Avatar + logout */}
        <div className="p-2 shrink-0 flex flex-col items-center gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center shadow-sm cursor-default"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
            title={`${displayName}\n${user?.email ?? ''}`}
          >
            <span className="text-[11px] font-bold text-white">{initials}</span>
          </div>
          <button
            onClick={signOut}
            title="Sair"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ══ FLYOUT ══════════════════════════════════════════════ */}
      {flyoutData && (
        <div
          className="fixed top-0 h-screen z-20 flex flex-col"
          style={{
            left: RAIL_W,
            width: FLYOUT_W,
            background: 'linear-gradient(180deg, #0E1320 0%, #0B0F1A 100%)',
            borderRight: `1px solid ${COLORS[flyoutData.color].flyoutBorder}`,
            boxShadow: isPinned ? 'none' : '6px 0 24px rgba(0,0,0,0.4)',
            animation: 'flyout-in 140ms ease-out',
          }}
          onMouseEnter={onEnterFlyout}
          onMouseLeave={isPinned ? undefined : onLeave}
        >
          {/* Cabeçalho do flyout */}
          <div
            className="flex items-center px-4 shrink-0"
            style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className={`text-[9.5px] font-extrabold uppercase tracking-[0.18em] ${COLORS[flyoutData.color].flyoutLabel}`}>
              {flyoutData.group}
            </p>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-px">
            {flyoutData.items.map((item) => {
              const c = COLORS[flyoutData.color];
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setPinnedGroup(flyoutData.group)}
                  className={({ isActive }) =>
                    `flex flex-col px-3 py-[7px] rounded-lg text-[12.5px] font-medium transition-all duration-100 ${
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
                          className={`w-[14px] h-[14px] shrink-0 transition-colors ${isActive ? c.activeIcon : 'text-slate-600'}`}
                          strokeWidth={isActive ? 2.25 : 1.75}
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
                        <div className="mt-1.5 ml-[22px] h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${capacPct}%`, background: isActive ? 'rgba(255,255,255,0.45)' : '#6366F1' }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Rodapé */}
          <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[8.5px] text-slate-700 leading-snug font-medium">
              SIACT · Sistema Inteligente de<br />Análise e Controle de<br />Transferências da União
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flyout-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
