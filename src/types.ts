export interface IPEAInsights {
  isEligible: boolean;
  ageInYears: number;
  hasIpeaRecord: boolean;
  projetos: any[];
  dirigentes: any[];
}

export interface OSCProfile {
  nome: string;
  cnpj: string;
  situacao: string;
  dataAbertura: string;
  naturezaJuridica: string;
  certificacoes: string[];
  projetosRecentes: any[];
  ipeaInsights: IPEAInsights;
}

export interface AIAnalysisResult {
  status: 'CONFORME' | 'ATENCAO' | 'INCONFORME' | 'RESSALVA' | 'REJEITADO' | 'aprovado' | 'rejeitado' | 'atencao';
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
  baseLegal?: string[];
}
