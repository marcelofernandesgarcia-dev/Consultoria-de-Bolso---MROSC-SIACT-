/**
 * Persistência local da posição do usuário no guia "Por onde começar" (perfil + fase).
 * Sem isso, todo retorno à /inicio (botão flutuante, sidebar, F5) resetava o wizard pro
 * passo 1 mesmo com uma escolha já feita — a lacuna registrada como Pilar 4 no Diário de
 * Bordo ("sem estado persistido entre etapas").
 */

export type PerfilJornada = 'osc' | 'gestor';
export type FaseJornada = 'chamamento' | 'plano_trabalho' | 'execucao' | 'prestacao' | 'tce';

export interface Jornada {
  perfil: PerfilJornada;
  fase: FaseJornada;
}

export const JORNADA_KEY = 'siact_jornada';

export const PERFIL_LABEL: Record<PerfilJornada, string> = {
  osc: 'OSC',
  gestor: 'Gestor Público',
};

export const FASE_LABEL: Record<FaseJornada, string> = {
  chamamento: 'Chamamento Público',
  plano_trabalho: 'Plano de Trabalho',
  execucao: 'Execução da Parceria',
  prestacao: 'Prestação de Contas',
  tce: 'Tomada de Contas Especial',
};

export function loadJornada(): Jornada | null {
  try {
    const raw = localStorage.getItem(JORNADA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const perfil = parsed?.perfil as PerfilJornada;
    const fase = parsed?.fase as FaseJornada;
    if (PERFIL_LABEL[perfil] && FASE_LABEL[fase]) return { perfil, fase };
    return null;
  } catch {
    return null;
  }
}

export function saveJornada(perfil: PerfilJornada | null, fase: FaseJornada | null): void {
  try {
    if (perfil && fase) {
      localStorage.setItem(JORNADA_KEY, JSON.stringify({ perfil, fase }));
    } else {
      localStorage.removeItem(JORNADA_KEY);
    }
  } catch {
    // localStorage indisponível (modo privado, quota) — a jornada simplesmente não persiste.
  }
}

/**
 * Controle por ABA (sessionStorage, não localStorage) de "a jornada foi
 * escolhida agora, nesta visita" — usado só pra sessões de demonstração,
 * pra distinguir "acabei de escolher, estou navegando de volta pelo
 * atalho da sidebar" de "esta aba nunca escolheu nada, só herdou uma
 * jornada salva de dias atrás". Sem isso, um visitante de demonstração
 * reabrindo o link (ou a aba) pulava direto pro Passo 3 mesmo sem ter
 * feito nenhuma escolha nesta visita — quebra a previsibilidade exigida
 * pra apresentação à alta gestão do MGI (2º clique = escolha de perfil,
 * sempre).
 */
const JORNADA_ATIVA_ABA_KEY = 'siact_jornada_ativa_nesta_aba';

export function jornadaAtivaNestaAba(): boolean {
  try {
    return sessionStorage.getItem(JORNADA_ATIVA_ABA_KEY) === '1';
  } catch {
    return false;
  }
}

export function marcarJornadaAtivaNestaAba(): void {
  try {
    sessionStorage.setItem(JORNADA_ATIVA_ABA_KEY, '1');
  } catch {
    // sessionStorage indisponível — sem controle por aba, mas não quebra o fluxo.
  }
}
