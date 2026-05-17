export interface Projeto {
  titulo: string;
  orgao: string;
  valor: string;
  situacao: string;
}

export interface Dirigente {
  nome: string;
  cargo: string;
  cpf?: string;
}

export interface IPEAInsights {
  isEligible: boolean;
  ageInYears: number;
  hasIpeaRecord: boolean;
  projetos: Projeto[];
  dirigentes: Dirigente[];
}

export interface OSCProfile {
  nome: string;
  cnpj: string;
  situacao: string;
  dataAbertura: string;
  naturezaJuridica: string;
  certificacoes: string[];
  projetosRecentes: Projeto[];
  ipeaInsights: IPEAInsights;
}

export type StatusAnalise =
  | 'CONFORME'
  | 'ATENCAO'
  | 'RESSALVA'
  | 'REJEITADO'
  | 'INCONFORME'
  | 'NAO_CONFORME'
  | 'INCONCLUSIVO';

export interface AIAnalysisResult {
  status: StatusAnalise;
  status_final?: StatusAnalise;
  message?: string;
  details?: string[];
  documentosDispensados?: string[];
  alertaTransicao?: string;
  sugestaoReajuste?: string;
  pontosAtencao?: Array<{ titulo: string; descricao: string; acaoRecomendada: string }>;
  analise?: string;
  evidenciasValidadas?: string[];
  riscosIdentificados?: string[];
  recomendacoes?: string[];
  titulo?: string;
  conteudo?: string;
  conclusao?: string;
  fundamentacao?: string;
  baseLegal?: string[];
  ressalvas?: string[];
  orientacao?: string;
  fundamentacao_legal_especifica?: string;
}

export interface ItemCotacaoAnalise {
  descricao: string;
  variacao_pct: number;
  status_item: 'CONFORME' | 'RESSALVA' | 'REJEITADO';
  observacao: string;
}

export interface CotacaoPreviaResult extends AIAnalysisResult {
  status: 'CONFORME' | 'RESSALVA' | 'REJEITADO';
  analise_por_item?: ItemCotacaoAnalise[];
}
