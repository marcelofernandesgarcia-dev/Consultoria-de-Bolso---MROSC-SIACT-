import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileDown } from 'lucide-react';
import { STATUS_LABEL } from '../lib/statusVisual';

// 'ATENCAO' é aceito por compatibilidade — o valor real que a IA retorna é 'RESSALVA'
// (ver status_final em server.ts). Ambos apontam pro mesmo visual.
type Nivel = 'CONFORME' | 'RESSALVA' | 'ATENCAO' | 'NAO_CONFORME' | 'REJEITADO';

interface Props {
  status: Nivel | string;
  titulo?: string;
  mensagem?: string;
  onExport?: () => void;
}

const CONFIG: Record<string, {
  bar: string;
  iconBg: string;
  icon: React.ReactNode;
  badgeText: string;
  badgeClass: string;
}> = {
  CONFORME: {
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    badgeText: STATUS_LABEL.CONFORME,
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  RESSALVA: {
    bar: 'bg-amber-400',
    iconBg: 'bg-amber-50',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    badgeText: STATUS_LABEL.RESSALVA,
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  NAO_CONFORME: {
    bar: 'bg-red-500',
    iconBg: 'bg-red-50',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    badgeText: STATUS_LABEL.NAO_CONFORME,
    badgeClass: 'bg-red-100 text-red-700',
  },
  REJEITADO: {
    bar: 'bg-red-500',
    iconBg: 'bg-red-50',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    badgeText: STATUS_LABEL.REJEITADO,
    badgeClass: 'bg-red-100 text-red-700',
  },
};
// Aliases de compatibilidade — mesmas telas ainda podem passar o vocabulário antigo.
CONFIG.ATENCAO = CONFIG.RESSALVA;

export function SemaforoRisco({ status, titulo, mensagem, onExport }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.ATENCAO;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`h-[3px] w-full ${cfg.bar}`} />
      <div className="px-5 py-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.badgeClass}`}>
              {cfg.badgeText}
            </span>
            {titulo && (
              <span className="text-sm font-semibold text-slate-800">{titulo}</span>
            )}
          </div>
          {mensagem && (
            <p className="text-sm text-slate-600 leading-relaxed mt-0.5">{mensagem}</p>
          )}
        </div>
        <button
          onClick={onExport ?? (() => window.print())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors print:hidden shrink-0"
        >
          <FileDown className="w-3.5 h-3.5" />
          PDF
        </button>
      </div>
    </div>
  );
}
