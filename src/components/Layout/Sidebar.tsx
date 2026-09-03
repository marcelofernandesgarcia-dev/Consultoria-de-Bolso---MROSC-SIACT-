import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShieldCheck, LogOut, ChevronsLeft, ChevronsRight, ShieldAlert, X,
} from 'lucide-react';
import { NAVIGATION, grupoVisivel, itensVisiveis, type SectionColor, type Perfil } from '../../lib/nav';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../lib/useIsMobile';

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

export interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  /** Drawer mobile aberto (ignorado em telas ≥768px, onde a sidebar segue o fluxo normal). */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/* ─── Cores por seção ─────────────────────────────────────────── */
const C: Record<SectionColor, {
  dot: string; groupLabel: string; groupBg: string; groupText: string;
  activeIcon: string; activeBg: string; activeDot: string;
}> = {
  indigo:  { dot:'bg-indigo-500/30',  groupLabel:'text-indigo-400/80',  groupBg:'hover:bg-indigo-500/10',  groupText:'hover:text-indigo-300',  activeIcon:'text-indigo-300',  activeBg:'bg-indigo-500/[0.18]',  activeDot:'bg-indigo-400'  },
  violet:  { dot:'bg-violet-500/30',  groupLabel:'text-violet-400/80',  groupBg:'hover:bg-violet-500/10',  groupText:'hover:text-violet-300',  activeIcon:'text-violet-300',  activeBg:'bg-violet-500/[0.18]',  activeDot:'bg-violet-400'  },
  amber:   { dot:'bg-amber-500/30',   groupLabel:'text-amber-400/80',   groupBg:'hover:bg-amber-500/10',   groupText:'hover:text-amber-300',   activeIcon:'text-amber-300',   activeBg:'bg-amber-500/[0.18]',   activeDot:'bg-amber-400'   },
  slate:   { dot:'bg-slate-500/30',   groupLabel:'text-slate-400/70',   groupBg:'hover:bg-slate-500/10',   groupText:'hover:text-slate-300',   activeIcon:'text-slate-300',   activeBg:'bg-slate-500/[0.18]',   activeDot:'bg-slate-400'   },
  teal:    { dot:'bg-teal-500/30',    groupLabel:'text-teal-400/80',    groupBg:'hover:bg-teal-500/10',    groupText:'hover:text-teal-300',    activeIcon:'text-teal-300',    activeBg:'bg-teal-500/[0.18]',    activeDot:'bg-teal-400'    },
  emerald: { dot:'bg-emerald-500/30', groupLabel:'text-emerald-400/80', groupBg:'hover:bg-emerald-500/10', groupText:'hover:text-emerald-300', activeIcon:'text-emerald-300', activeBg:'bg-emerald-500/[0.18]', activeDot:'bg-emerald-400' },
};

/* ─── Componente ──────────────────────────────────────────────── */
export function Sidebar({ isExpanded, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { user, isAdmin, perfilVisivel, previewPerfil, setPreviewPerfil, signOut } = useAuth();
  const navegacaoVisivel = NAVIGATION.filter(g => grupoVisivel(g, perfilVisivel));
  const isMobile = useIsMobile();
  // No mobile o drawer é sempre "expandido" (mostra labels) — só a visibilidade (translate) muda.
  const expanded = isMobile ? true : isExpanded;

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
    for (const g of navegacaoVisivel) {
      const match = g.items.some(item =>
        item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
      );
      if (match) { setPinnedGroup(g.id); return; }
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

  const irParaItem = (groupId: string) => {
    setPinnedGroup(groupId);
    if (isMobile) onMobileClose();
  };

  return (
    <>
      {/* ── Overlay do drawer mobile ── */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className="h-screen fixed left-0 top-0 z-40 flex flex-col overflow-hidden print:hidden"
        style={{
          width: expanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: 'linear-gradient(180deg, #0D1117 0%, #0B0F1A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          transition: 'width 220ms cubic-bezier(.4,0,.2,1), transform 260ms cubic-bezier(.4,0,.2,1)',
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
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold text-white tracking-tight leading-none whitespace-nowrap">SIACT-MROSC</p>
              <p className="text-[8.5px] text-slate-500 mt-0.5 font-medium leading-tight whitespace-nowrap">Consultoria de Bolso</p>
            </div>
          )}
          {isMobile && (
            <button onClick={onMobileClose} className="shrink-0 text-slate-500 hover:text-white transition-colors p-1" title="Fechar menu">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── SELETOR DE VISUALIZAÇÃO (só admin) — para apresentar a viabilidade sob as duas óticas ── */}
        {expanded && isAdmin && (
          <div className="px-3 py-2.5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Visualizar como</p>
            <div className="flex gap-1 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {([
                { key: null, label: 'Admin (tudo)' },
                { key: 'osc' as Perfil, label: 'OSC' },
                { key: 'setorial' as Perfil, label: 'Setorial' },
              ]).map(opt => {
                const active = previewPerfil === opt.key;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setPreviewPerfil(opt.key)}
                    className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-colors ${
                      active ? 'bg-indigo-500/25 text-indigo-200' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NAV ───────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 overflow-x-hidden"
             style={{ padding: expanded ? '12px 8px' : '12px 10px' }}>
          {navegacaoVisivel.map((group) => {
            const c = C[group.color];
            const isOpen = openGroup === group.id;
            const GroupIcon = group.groupIcon;
            const items = itensVisiveis(group, perfilVisivel);
            const label = group.group;

            return (
              <div key={group.id}>
                {/* ── Cabeçalho da seção ── */}
                <button
                  onMouseEnter={() => onEnter(group.id)}
                  onMouseLeave={onLeave}
                  onClick={() => setPinnedGroup(group.id)}
                  title={!expanded ? group.fullLabel : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-150 ${c.groupBg} ${c.groupText} ${
                    isOpen ? 'text-white' : 'text-slate-600'
                  }`}
                  style={{ padding: expanded ? '6px 10px' : '9px', justifyContent: expanded ? 'flex-start' : 'center', gap: expanded ? 8 : 0 }}
                >
                  <GroupIcon
                    className={`shrink-0 transition-colors ${isOpen ? c.activeIcon : ''}`}
                    style={{ width: 16, height: 16 }}
                    strokeWidth={isOpen ? 2.2 : 1.7}
                  />
                  {expanded && (
                    <span className={`text-[10px] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap ${isOpen ? c.groupLabel : 'text-slate-600'}`}>
                      {label}
                    </span>
                  )}
                </button>

                {/* ── Items (accordion) — só aparece no modo expandido ── */}
                {expanded && (
                  <div
                    style={{
                      overflow: 'hidden',
                      maxHeight: isOpen ? `${items.length * 40}px` : '0px',
                      transition: 'max-height 200ms ease',
                    }}
                    onMouseEnter={() => onEnter(group.id)}
                    onMouseLeave={onLeave}
                  >
                    <div className="pl-2 pb-1 space-y-px">
                      {items.map((item) => (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          end={item.path === '/'}
                          onClick={() => irParaItem(group.id)}
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

        {/* ── TOGGLE retrair/expandir — só faz sentido em desktop ─── */}
        {!isMobile && (
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
        )}

        {/* ── FOOTER usuário ───────────────────────────────────── */}
        <div
          className="shrink-0 overflow-hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Admin link — só para admins */}
          {expanded && isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => isMobile && onMobileClose()}
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
              padding: expanded ? '10px 12px' : '10px',
              gap: expanded ? 10 : 0,
              justifyContent: expanded ? 'flex-start' : 'center',
            }}
          >
            <NavLink
              to="/conta"
              onClick={() => isMobile && onMobileClose()}
              title={!expanded ? `${displayName} — Minha conta` : undefined}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 hover:ring-2 hover:ring-indigo-500/40 transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
            >
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </NavLink>
            {expanded && (
              <>
                <NavLink to="/conta" onClick={() => isMobile && onMobileClose()} className="flex-1 min-w-0 group">
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
    </>
  );
}
