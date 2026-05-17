import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  Gavel, 
  ClipboardList, 
  Activity, 
  GraduationCap, 
  MessageSquare,
  LayoutTemplate,
  Route
} from 'lucide-react';
import { clsx } from 'clsx';

const NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'integracao', label: 'Integração (Mapa OSC)', icon: Search, path: '/integracao' },
  { id: 'governanca', label: 'Governança', icon: ShieldCheck, path: '/governanca' },
  { id: 'normas', label: 'Normas (Radar)', icon: Gavel, path: '/normas' },
  { id: 'planejamento', label: 'Planejamento', icon: ClipboardList, path: '/planejamento' },
  { id: 'monitoramento', label: 'Monitoramento', icon: Activity, path: '/monitoramento' },
  { id: 'capacitacao', label: 'Capacitação', icon: GraduationCap, path: '/capacitacao' },
  { id: 'assistente', label: 'Assistente SIACT', icon: MessageSquare, path: '/assistente' },
  { id: 'arquitetura', label: 'Arquitetura', icon: LayoutTemplate, path: '/arquitetura' },
  { id: 'roadmap', label: 'Roadmap', icon: Route, path: '/roadmap' },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col border-r border-slate-800 fixed left-0 top-0">
      <div className="p-6 bg-transparent flex items-center gap-2 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-xs">SIACT</span>
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight text-glow">SIACT</p>
          <p className="text-[10px] text-slate-400 leading-tight">MROSC • AUDITOR IA</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAVIGATION.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 bg-slate-950/50 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-300">GP</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-white">Gestor Público</p>
            <p className="text-[10px] text-slate-500">SIACT v3.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
