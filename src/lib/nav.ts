import React from 'react';
import {
  LayoutDashboard, Search, ShieldCheck, Gavel, ClipboardList,
  Activity, GraduationCap, LayoutTemplate, Route,
  Compass, FileCheck, CalendarDays, Sparkles, BookOpen, Scale, Radar,
} from 'lucide-react';

export type Perfil = 'osc' | 'setorial';
export type GrupoPerfil = Perfil | 'ambos';
export type SectionColor = 'indigo' | 'violet' | 'amber' | 'slate' | 'teal';

/** `perfil` no item é opcional — quando ausente, herda o perfil do grupo. Use para exceções pontuais. */
export interface NavItem { id: string; label: string; icon: React.ElementType; path: string; perfil?: GrupoPerfil; }
export interface NavGroup {
  id: string;
  /** Rótulo padrão — usado quando não há perfil ativo (admin sem preview, ou dev sem login). */
  group: string;
  /** Rótulo alternativo por perfil — para um grupo que muda de nome conforme quem olha (ex: OSC vê "Ferramentas OSC", Setorial vê "Auditoria e Gestão"). */
  groupPerfil?: Partial<Record<Perfil, string>>;
  color: SectionColor;
  groupIcon: React.ElementType;
  perfil: GrupoPerfil;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    id: 'principal', group: 'Principal', color: 'indigo', groupIcon: LayoutDashboard, perfil: 'ambos',
    items: [
      { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard, path: '/', perfil: 'setorial' },
      { id: 'inicio',     label: 'Por onde começar', icon: Compass,         path: '/inicio' },
    ],
  },
  {
    // Um único grupo — o mesmo conjunto de ferramentas, com título e itens filtrados por quem está olhando,
    // pra sidebar refletir exatamente a lista única mostrada nos cards de "Por onde começar".
    id: 'ferramentas', group: 'Ferramentas', groupPerfil: { osc: 'Ferramentas OSC', setorial: 'Auditoria e Gestão' },
    color: 'violet', groupIcon: Sparkles, perfil: 'ambos',
    items: [
      { id: 'chamamentos',   label: 'Chamamentos Abertos',        icon: Radar,         path: '/chamamentos',   perfil: 'osc' },
      { id: 'simulador',     label: 'Simulador de Elegibilidade', icon: Sparkles,      path: '/simulador',     perfil: 'osc' },
      { id: 'checklist',     label: 'Checklist de Documentos',    icon: FileCheck,     path: '/checklist',     perfil: 'osc' },
      { id: 'calendario',    label: 'Calendário de Prazos',       icon: CalendarDays,  path: '/calendario',    perfil: 'osc' },
      { id: 'integracao',    label: 'Mapa OSC',                   icon: Search,        path: '/integracao',    perfil: 'ambos' },
      { id: 'governanca',    label: 'Governança',                 icon: ShieldCheck,   path: '/governanca',    perfil: 'ambos' },
      { id: 'normas',        label: 'Radar Normativo',            icon: Gavel,         path: '/normas',        perfil: 'ambos' },
      { id: 'planejamento',  label: 'Cotação Prévia',             icon: ClipboardList, path: '/planejamento',  perfil: 'ambos' },
      { id: 'monitoramento', label: 'Nexo Causal',                icon: Activity,      path: '/monitoramento', perfil: 'ambos' },
      { id: 'parecer',       label: 'Parecer Técnico',            icon: Scale,         path: '/parecer',       perfil: 'setorial' },
    ],
  },
  {
    id: 'capacitacao', group: 'Capacitação e Conhecimento', color: 'teal', groupIcon: BookOpen, perfil: 'ambos',
    items: [
      { id: 'faq',         label: 'Perguntas Frequentes', icon: BookOpen,      path: '/faq' },
      { id: 'capacitacao', label: 'Capacitação',          icon: GraduationCap, path: '/capacitacao' },
    ],
  },
  {
    id: 'sistema', group: 'Sistema', color: 'slate', groupIcon: LayoutTemplate, perfil: 'ambos',
    items: [
      { id: 'arquitetura', label: 'Arquitetura', icon: LayoutTemplate, path: '/arquitetura' },
      { id: 'roadmap',     label: 'Roadmap',     icon: Route,          path: '/roadmap' },
    ],
  },
];

/** Rótulo do grupo pro perfil atual — usa o override se existir, senão o padrão. */
export function groupLabel(g: NavGroup, perfil: Perfil | null): string {
  if (perfil && g.groupPerfil?.[perfil]) return g.groupPerfil[perfil]!;
  return g.group;
}

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

/** Um grupo aparece se tiver pelo menos um item visível pro perfil atual. */
export function grupoVisivel(g: NavGroup, perfil: Perfil | null): boolean {
  return itensVisiveis(g, perfil).length > 0;
}

/** Retorna o perfil dono da rota, ou null se a rota é neutra/não mapeada (ex: /conta, /admin). */
export function perfilDaRota(pathname: string): GrupoPerfil | null {
  for (const g of NAVIGATION) {
    for (const item of g.items) {
      if (pathname === item.path || pathname.startsWith(item.path + '/')) return itemPerfil(g, item);
    }
  }
  return null;
}

/** Rota inicial segura para cada perfil — evita mandar OSC pro Dashboard (setorial-only). */
export function homePathForPerfil(perfil: Perfil | null): string {
  return perfil === 'osc' ? '/inicio' : '/';
}
