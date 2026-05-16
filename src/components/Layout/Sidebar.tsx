import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, ShieldCheck, Gavel, ClipboardList,
  Activity, GraduationCap, MessageSquare, LayoutTemplate, Route,
  Compass, FileCheck, CalendarDays, Sparkles, BookOpen, Scale, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type SectionColor = 'indigo' | 'violet' | 'amber' | 'slate';

interface NavItem { id: string; label: string; icon: React.ElementType; path: string; }
interface NavGroup { group: string; color: SectionColor; items: NavItem[]; }

const NAVIGATION: NavGroup[] = [
  {
    group: 'Principal', color: 'indigo',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { id: 'inicio', label: 'Por onde começar', icon: Compass, path: '/inicio' },
      { id: 'assistente', label: 'Assistente SIACT', icon: MessageSquare, path: '/assistente' },
    ],
  },
  {
    group: 'Ferramentas OSC', color: 'violet',
    items: [
      { id: 'simulador', label: 'Simulador de Elegibilidade', icon: Sparkles, path: '/simulador' },
      { id: 'checklist', label: 'Checklist de Documentos', icon: FileCheck, path: '/checklist' },
      { id: 'calendario', label: 'Calendário de Prazos', icon: CalendarDays, path: '/calendario' },
      { id: 'faq', label: 'Perguntas Frequentes', icon: BookOpen, path: '/faq' },
      { id: 'capacitacao', label: 'Capacitação', icon: GraduationCap, path: '/capacitacao' },
    ],
  },
  {
    group: 'Auditoria e Gestão', color: 'amber',
    items: [
      { id: 'integracao', label: 'Mapa OSC', icon: Search, path: '/integracao' },
      { id: 'governanca', label: 'Governança', icon: ShieldCheck, path: '/governanca' },
      { id: 'normas', label: 'Radar Normativo', icon: Gavel, path: '/normas' },
      { id: 'planejamento', label: 'Cotação Prévia', icon: ClipboardList, path: '/planejamento' },
      { id: 'monitoramento', label: 'Nexo Causal', icon: Activity, path: '/monitoramento' },
      { id: 'parecer', label: 'Parecer Técnico', icon: Scale, path: '/parecer' },
    ],
  },
  {
    group: 'Sistema', color: 'slate',
    items: [
      { id: 'arquitetura', label: 'Arquitetura', icon: LayoutTemplate, path: '/arquitetura' },
      { id: 'roadmap', label: 'Roadmap', icon: Route, path: '/roadmap' },
    ],
  },
];

const COLORS: Record<SectionColor, { dot: string; label: string; activeIcon: string; activeBg: string; activeDot: string }> = {
  indigo: { dot: 'bg-indigo-500/30', label: 'text-indigo-400/70', activeIcon: 'text-indigo-300', activeBg: 'bg-indigo-500/[0.18]', activeDot: 'bg-indigo-400' },
  violet: { dot: 'bg-violet-500/30', label: 'text-violet-400/70', activeIcon: 'text-violet-300', activeBg: 'bg-violet-500/[0.18]', activeDot: 'bg-violet-400' },
  amber:  { dot: 'bg-amber-500/30',  label: 'text-amber-400/70',  activeIcon: 'text-amber-300',  activeBg: 'bg-amber-500/[0.18]',  activeDot: 'bg-amber-400' },
  slate:  { dot: 'bg-slate-500/30',  label: 'text-slate-400/60',  activeIcon: 'text-slate-300',  activeBg: 'bg-slate-500/[0.18]',  activeDot: 'bg-slate-400' },
};

export function Sidebar() {
  const { user, signOut } = useAuth();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'GP';

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split('@')[0]
    ?? 'Usuário';

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 z-30 flex flex-col" style={{ background: 'linear-gradient(180deg, #0D1117 0%, #0B0F1A 100%)' }}>

      {/* Brand */}
      <div className="px-4 py-5 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/60" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)' }}>
            <ShieldCheck className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: '#0D1117' }} />
        </div>
        <div>
          <p className="text-[13.5px] font-extrabold text-white tracking-tight leading-none">SIACT-MROSC</p>
          <p className="text-[9px] text-slate-500 mt-0.5 font-medium leading-tight">Sistema Inteligente de Análise e<br />Controle de Transferências da União</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAVIGATION.map((group) => {
          const c = COLORS[group.color];
          return (
            <div key={group.group}>
              <div className="flex items-center gap-2 px-3 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <p className={`text-[9.5px] font-extrabold uppercase tracking-[0.15em] ${c.label}`}>
                  {group.group}
                </p>
              </div>
              <div className="space-y-px">
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12.5px] font-medium transition-all duration-100 ${
                        isActive
                          ? `${c.activeBg} text-white`
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`w-[15px] h-[15px] shrink-0 transition-colors ${isActive ? c.activeIcon : 'text-slate-600'}`}
                          strokeWidth={isActive ? 2.25 : 1.75}
                        />
                        <span className="truncate flex-1">{item.label}</span>
                        {isActive && <span className={`w-1.5 h-1.5 rounded-full ${c.activeDot} shrink-0`} />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11.5px] font-semibold text-slate-300 leading-none truncate">{displayName}</p>
            <p className="text-[9px] text-slate-600 mt-0.5 truncate">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={signOut}
            title="Sair"
            className="text-slate-600 hover:text-red-400 transition-colors shrink-0 p-1 rounded-lg hover:bg-white/[0.04]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
