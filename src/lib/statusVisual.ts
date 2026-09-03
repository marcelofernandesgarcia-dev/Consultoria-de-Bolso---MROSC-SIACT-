// Fonte única de rótulos e cores para o status_final retornado pela IA
// ('CONFORME' | 'RESSALVA' | 'NAO_CONFORME' — mais 'REJEITADO' usado em alguns fluxos
// específicos). Antes desta fonte, cada tela reimplementava seu próprio mapa de cores.

export type StatusFinal = 'CONFORME' | 'RESSALVA' | 'NAO_CONFORME' | 'REJEITADO' | 'INCONCLUSIVO';

export const STATUS_LABEL: Record<StatusFinal, string> = {
  CONFORME: 'Conforme',
  RESSALVA: 'Ressalva',
  NAO_CONFORME: 'Não Conforme',
  REJEITADO: 'Rejeitado',
  INCONCLUSIVO: 'Inconclusivo',
};

/** Badge para fundo escuro (dashboards, cabeçalhos escuros) — fundo com opacidade baixa. */
export const STATUS_BADGE_DARK: Record<StatusFinal, string> = {
  CONFORME: 'bg-emerald-500/10 text-emerald-400',
  RESSALVA: 'bg-amber-500/10 text-amber-400',
  NAO_CONFORME: 'bg-red-500/10 text-red-400',
  REJEITADO: 'bg-red-500/10 text-red-400',
  INCONCLUSIVO: 'bg-slate-500/10 text-slate-400',
};

/** Cor hex — para contextos que não aceitam classes Tailwind (ex: HTML de PDF exportado). */
export const STATUS_HEX: Record<StatusFinal, string> = {
  CONFORME: '#059669',
  RESSALVA: '#D97706',
  NAO_CONFORME: '#DC2626',
  REJEITADO: '#DC2626',
  INCONCLUSIVO: '#6B7280',
};
