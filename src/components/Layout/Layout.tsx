import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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

function getPageTitle(pathname: string): string {
  for (const [path, title] of PAGE_TITLES) {
    if (pathname === path || pathname.startsWith(path + '/')) return title;
  }
  return 'Dashboard';
}

export function Layout() {
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F4F8' }}>
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-20 shrink-0 h-12 flex items-center px-7 gap-2" style={{ background: 'rgba(242,244,248,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <span className="text-[11px] text-slate-400 font-medium" title="Sistema Inteligente de Análise e Controle de Transferências da União">SIACT-MROSC</span>
          <span className="text-[11px] text-slate-300 mx-0.5">/</span>
          <span className="text-[11px] text-slate-700 font-semibold">{pageTitle}</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">Online</span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Decreto 11.948/2024</span>
          </div>
        </header>

        <main className="flex-1 p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
