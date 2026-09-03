import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from './Sidebar';
import { AssistenteFlutuante } from '../AssistenteFlutuante';
import { useAuth } from '../../contexts/AuthContext';
import { perfilDaRota, homePathForPerfil } from '../../lib/nav';

const SIDEBAR_PIN_KEY = 'siact_sidebar_pinned';

/* ─── Layout ──────────────────────────────────────────────────── */
export function Layout() {
  const { pathname } = useLocation();
  const { perfilVisivel } = useAuth();

  // Bloqueia acesso direto (por URL) a rotas fora do perfil visível no momento.
  // Para admin sem preview ativo, perfilVisivel é null e nada é bloqueado (vê tudo).
  // Com um preview escolhido (OSC/Setorial), o bloqueio vale igual pra demonstrar a restrição real.
  const rotaPerfil = perfilDaRota(pathname);
  if (perfilVisivel && rotaPerfil && rotaPerfil !== 'ambos' && rotaPerfil !== perfilVisivel) {
    return <Navigate to={homePathForPerfil(perfilVisivel)} replace />;
  }

  /* Sidebar expanded state — persiste no localStorage */
  const [isExpanded, setIsExpanded] = useState<boolean>(() =>
    localStorage.getItem(SIDEBAR_PIN_KEY) !== 'false'
  );

  const toggleSidebar = () => {
    setIsExpanded(p => {
      const next = !p;
      localStorage.setItem(SIDEBAR_PIN_KEY, String(next));
      return next;
    });
  };

  /* Largura total ocupada pelo sidebar (só se aplica em telas ≥768px — ver className do wrapper abaixo) */
  const sidebarWidth = isExpanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED;

  /* Drawer mobile — fechado por padrão, fecha sozinho ao trocar de rota */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F4F8' }}>

      <Sidebar
        isExpanded={isExpanded}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Conteúdo principal — em mobile ocupa 100% (sidebar vira drawer por cima); em desktop reserva a largura da sidebar */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200 ml-0 md:!ml-[var(--sbw)] print:!ml-0"
        style={{ '--sbw': `${sidebarWidth}px` } as React.CSSProperties}
      >
        {/* Hambúrguer flutuante — só mobile, já que a barra superior foi removida */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-20 w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 bg-white/90 shadow-sm border border-slate-200 print:hidden"
          style={{ backdropFilter: 'blur(12px)' }}
          title="Abrir menu"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <main className="flex-1 p-4 pb-24 md:p-7">
          <Outlet />
        </main>
      </div>

      <AssistenteFlutuante />
    </div>
  );
}
