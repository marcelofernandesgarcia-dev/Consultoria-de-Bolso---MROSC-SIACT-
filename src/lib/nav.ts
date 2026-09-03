import React from 'react';
import {
  LayoutDashboard, Search, ShieldCheck, Gavel, ClipboardList,
  Activity, GraduationCap, LayoutTemplate, Route,
  Compass, FileCheck, CalendarDays, Sparkles, BookOpen, Scale, Radar,
  Users, Building2,
} from 'lucide-react';

export type Perfil = 'osc' | 'setorial';
export type GrupoPerfil = Perfil | 'ambos';
export type SectionColor = 'indigo' | 'violet' | 'amber' | 'slate' | 'teal' | 'emerald';

/** `perfil` no item é opcional — quando ausente, herda o perfil (fixo) do grupo. */
export interface NavItem { id: string; label: string; icon: React.ElementType; path: string; perfil?: GrupoPerfil; }
export interface NavGroup {
  id: string;
  /** Rótulo curto exibido no cabeçalho da gaveta (ex: "OSC"). */
  group: string;
  /** Rótulo completo — usado como tooltip quando a sidebar está recolhida. */
  fullLabel: string;
  color: SectionColor;
  groupIcon: React.ElementType;
  perfil: GrupoPerfil;
  items: NavItem[];
}

/**
 * Menu lateral organizado por PERFIL: uma gaveta única "OSC" e outra "Setorial",
 * cada uma com a lista completa e achatada de ferramentas daquele perfil — espelhando
 * exatamente o card "Disponível para você" da tela "Por onde começar". Um usuário comum
 * só enxerga a própria gaveta; o admin sem preview enxerga as duas por completo.
 */
export const NAVIGATION: NavGroup[] = [
  {
    id: 'osc',
    group: 'OSC',
    fullLabel: 'Organização da Sociedade Civil (OSC)',
    color: 'indigo',
    groupIcon: Users,
    perfil: 'osc',
    items: [
      { id: 'inicio',        label: 'Por onde começar',           icon: Compass,         path: '/inicio' },
      { id: 'chamamentos',   label: 'Chamamentos Abertos',        icon: Radar,           path: '/chamamentos' },
      { id: 'simulador',     label: 'Simulador de Elegibilidade', icon: Sparkles,        path: '/simulador' },
      { id: 'checklist',     label: 'Checklist de Documentos',    icon: FileCheck,       path: '/checklist' },
      { id: 'calendario',    label: 'Calendário de Prazos',       icon: CalendarDays,    path: '/calendario' },
      { id: 'integracao',    label: 'Mapa OSC',                   icon: Search,          path: '/integracao' },
      { id: 'governanca',    label: 'Governança',                 icon: ShieldCheck,     path: '/governanca' },
      { id: 'normas',        label: 'Radar Normativo',            icon: Gavel,           path: '/normas' },
      { id: 'planejamento',  label: 'Cotação Prévia',             icon: ClipboardList,   path: '/planejamento' },
      { id: 'monitoramento', label: 'Nexo Causal',                icon: Activity,        path: '/monitoramento' },
      { id: 'faq',           label: 'Perguntas Frequentes',       icon: BookOpen,        path: '/faq' },
      { id: 'capacitacao',   label: 'Capacitação',                icon: GraduationCap,   path: '/capacitacao' },
      { id: 'arquitetura',   label: 'Arquitetura',                icon: LayoutTemplate,  path: '/arquitetura' },
      { id: 'roadmap',       label: 'Roadmap',                    icon: Route,           path: '/roadmap' },
    ],
  },
  {
    id: 'setorial',
    group: 'Setorial',
    fullLabel: 'Servidor Público / Setorial',
    color: 'emerald',
    groupIcon: Building2,
    perfil: 'setorial',
    items: [
      { id: 'dashboard',     label: 'Dashboard',                  icon: LayoutDashboard, path: '/' },
      { id: 'inicio',        label: 'Por onde começar',           icon: Compass,         path: '/inicio' },
      { id: 'integracao',    label: 'Mapa OSC',                   icon: Search,          path: '/integracao' },
      { id: 'governanca',    label: 'Governança',                 icon: ShieldCheck,     path: '/governanca' },
      { id: 'normas',        label: 'Radar Normativo',            icon: Gavel,           path: '/normas' },
      { id: 'planejamento',  label: 'Cotação Prévia',             icon: ClipboardList,   path: '/planejamento' },
      { id: 'monitoramento', label: 'Nexo Causal',                icon: Activity,        path: '/monitoramento' },
      { id: 'parecer',       label: 'Parecer Técnico',            icon: Scale,           path: '/parecer' },
      { id: 'faq',           label: 'Perguntas Frequentes',       icon: BookOpen,        path: '/faq' },
      { id: 'capacitacao',   label: 'Capacitação',                icon: GraduationCap,   path: '/capacitacao' },
      { id: 'arquitetura',   label: 'Arquitetura',                icon: LayoutTemplate,  path: '/arquitetura' },
      { id: 'roadmap',       label: 'Roadmap',                    icon: Route,           path: '/roadmap' },
    ],
  },
];

/** Itens que são navegação/meta (não "ferramentas" propriamente ditas) — usados para
 *  excluir da lista de checklist mostrada nos cards de "Por onde começar". */
export const NAV_META_IDS = ['dashboard', 'inicio', 'faq', 'capacitacao', 'arquitetura', 'roadmap'];

/** Perfil efetivo do item — o dele próprio, ou o do grupo se não houver exceção. */
export function itemPerfil(group: NavGroup, item: NavItem): GrupoPerfil {
  return item.perfil ?? group.perfil;
}

export function itemVisivel(group: NavGroup, item: NavItem, perfil: Perfil | null): boolean {
  const p = itemPerfil(group, item);
  return p === 'ambos' || perfil === null || p === perfil;
}

export function itensVisiveis(group: NavGroup, perfil: Perfil | null): NavItem[] {
  return group.items.filter(item => itemVisivel(group, item, perfil));
}

/** Uma gaveta só aparece pro perfil dono dela (ou pra todo mundo, se 'ambos'/admin sem preview). */
export function grupoVisivel(g: NavGroup, perfil: Perfil | null): boolean {
  return g.perfil === 'ambos' || perfil === null || g.perfil === perfil;
}

/**
 * Perfil dono da rota. Uma rota que aparece em só uma gaveta pertence àquele perfil;
 * se aparecer em ambas (ex: Mapa OSC, Governança), é considerada compartilhada ('ambos').
 */
export function perfilDaRota(pathname: string): GrupoPerfil | null {
  const donos = new Set<GrupoPerfil>();
  for (const g of NAVIGATION) {
    for (const item of g.items) {
      if (pathname === item.path || pathname.startsWith(item.path + '/')) {
        donos.add(itemPerfil(g, item));
      }
    }
  }
  if (donos.size === 0) return null;
  if (donos.size > 1 || donos.has('ambos')) return 'ambos';
  return [...donos][0];
}

/** Rota inicial segura para cada perfil — evita mandar OSC pro Dashboard (setorial-only). */
export function homePathForPerfil(perfil: Perfil | null): string {
  return perfil === 'osc' ? '/inicio' : '/';
}
