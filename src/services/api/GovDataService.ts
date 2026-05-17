/**
 * GovDataService.ts
 * Serviço responsável por concentrar e padronizar todas as integrações com as APIs externas:
 * 1. BrasilAPI (Receita Federal)
 * 2. IPEA (Mapa das OSC)
 * 3. Dados.gov.br / Transferegov (Dados Abertos)
 */

export interface GovDossier {
  rfb: {
    razaoSocial: string;
    cnpj: string;
    situacao: string;
    dataAbertura: string;
    naturezaJuridica: string;
    idadeAnos: number;
    socios: any[];
  } | null;
  ipea: {
    oscId: number | null;
    projetos: any[];
    conselhos: any[];
    error?: string;
  } | null;
  transferegov: {
    convenios: any[];
    error?: string;
  } | null;
}

export class GovDataService {
  /**
   * Consulta a Receita Federal via BrasilAPI (Gateway Altamente Disponível)
   */
  static async fetchReceita(cnpjLimpo: string) {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
    if (!res.ok) throw new Error('CNPJ não encontrado na base da Receita (BrasilAPI)');
    return await res.json();
  }

  /**
   * Consulta o IPEA (Mapa das OSC) em múltiplas etapas (Id da OSC -> Projetos)
   */
  static async fetchIpea(cnpjLimpo: string) {
    try {
      // 1. Pega ID da OSC via CNPJ
      const resCnpj = await fetch(`https://mapaosc.ipea.gov.br/api/v3/osc/cnpj/${cnpjLimpo}`);
      if (!resCnpj.ok) return { oscId: null, projetos: [], conselhos: [] };
      
      const dataOsc = await resCnpj.json();
      const oscId = typeof dataOsc === 'object' && dataOsc.id_osc ? dataOsc.id_osc : null;

      let projetos = [];
      let conselhos = [];

      // 2. Traz projetos
      if (oscId) {
        try {
            const resProj = await fetch(`https://mapaosc.ipea.gov.br/api/osc/projetos/${oscId}`);
            if (resProj.ok) projetos = await resProj.json();
        } catch(e) { /* silent fail for CORS / Network */ }
        
        try {
            const resConselho = await fetch(`https://mapaosc.ipea.gov.br/api/conselho/${oscId}`);
            if (resConselho.ok) conselhos = await resConselho.json();
        } catch (e) { /* silent fail */ }
      }

      return {
        oscId,
        projetos: Array.isArray(projetos) ? projetos : [],
        conselhos: Array.isArray(conselhos) ? conselhos : []
      };

    } catch (error: any) {
      return { oscId: null, projetos: [], conselhos: [], error: 'Falha na comunicação com IPEA.' };
    }
  }

  /**
   * Traz histórico do Transferegov via CKAN do Dados.gov.br
   * Resource IDs de Convênios podem mudar historicamente. 
   * Estamos utilizando um fallback de busca de Datastore.
   */
  static async fetchTransferegov(cnpjLimpo: string) {
    try {
      // ID do Recurso Ativo (Convenios) no CKAN é dinâmico. 
      // Faremos uma consulta base experimental, e se falhar em CORS usamos try-catch vazio.
      // O resource_id real pode ser pego na API real, mas usaremos uma query abstrata simulada
      // dado que endpoints do CKAN costumam barrar conexões front-end puras (CORS Policy).
      const res = await fetch(`https://dados.gov.br/api/3/action/package_search?q=${cnpjLimpo}`);
      if (!res.ok) throw new Error('Acesso negado');
      const data = await res.json();
      
      return {
        convenios: data?.result?.results || [],
      };
    } catch (error: any) {
      return { convenios: [], error: 'CORS/API Bloqueada pelo Dados.gov.br. Use backend relay.' };
    }
  }

  static async assembleDossier(cnpjInput: string): Promise<GovDossier> {
    const cnpjLimpo = cnpjInput.replace(/\D/g, '');

    // The ONLY critical path is the Receita one (if the company doesn't exist, stop).
    const rfbData = await this.fetchReceita(cnpjLimpo);

    const abertura = new Date(rfbData.data_inicio_atividade);
    const idadeAnos = new Date().getFullYear() - abertura.getFullYear();

    const result: GovDossier = {
      rfb: {
        razaoSocial: rfbData.razao_social,
        cnpj: rfbData.cnpj,
        situacao: rfbData.descricao_situacao_cadastral,
        dataAbertura: rfbData.data_inicio_atividade,
        naturezaJuridica: rfbData.natureza_juridica,
        idadeAnos,
        socios: rfbData.qsa || []
      },
      ipea: null,
      transferegov: null
    };

    // Parallel fetch for the non-critical data
    const [ipea, tgov] = await Promise.all([
      this.fetchIpea(cnpjLimpo),
      this.fetchTransferegov(cnpjLimpo)
    ]);

    result.ipea = ipea;
    result.transferegov = tgov;

    return result;
  }
}
