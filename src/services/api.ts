import type { AIAnalysisResult, ItemCotacaoAnalise } from '../types';

export interface AnalysisResult {
  metadados: {
    numero_processo: string;
    numero_tce: string | null;
    instrumento_siafi: string | null;
    concedente: string | null;
    convenente: string | null;
    valor_atualizado: string;
  };
  diagnostico: {
    fase: string;
    aptidao: 'Apto' | 'Inapto';
    resumo: string;
  };
  prescricao: {
    status: 'Regular' | 'Prescrito' | 'Risco';
    analise_detalhada: string;
    atos_interruptivos: Array<{ data: string; descricao: string; pagina: number | string }>;
    atos_mero_seguimento: Array<{ data: string; descricao: string; pagina: number | string }>;
  };
  conclusao_final: string;
}

export type MROSCAnalysisResult = AIAnalysisResult & {
  summary?: string;
  requirements?: string[];
  risks?: string[];
  recommendations?: string[];
  analise_por_item?: ItemCotacaoAnalise[];
  status_final?: string;
};

export interface MROSCAnalysisRequest {
  type:
    | 'requirements_eligibility'
    | 'requirements_docs'
    | 'requirements_budget'
    | 'mrosc_router'
    | 'osc_edital_explainer'
    | 'osc_proposal_precheck'
    | 'internal_planning_etp'
    | 'internal_planning_edital'
    | 'selection_ranking'
    | 'selection_minutes'
    | 'celebration_term'
    | 'celebration_workplan'
    | 'celebration_validation'
    | 'radar_normativo'
    | 'cotacao_previa'
    | 'auditoria_nexo_causal'
    | 'papeis_impedimentos'
    | 'gerador_parecer'
    | 'osc_edital_analysis'
    | 'concedente_planning'
    | 'concedente_selection'
    | 'concedente_celebration';
  textContent: string;
  context?: Record<string, unknown>;
  documentName?: string;
}

export async function analyzeProcess(
  textContent: string,
  images: { data: string; mimeType: string }[] = [],
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textContent, images }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Falha na análise do processo');
  }

  return response.json();
}

export async function analyzeMROSC(request: MROSCAnalysisRequest): Promise<MROSCAnalysisResult> {
  const response = await fetch('/api/analyze-mrosc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Falha na análise MROSC');
  }

  return response.json();
}
