import { createClient } from '@supabase/supabase-js';

// API pública de dados abertos do Compras.gov.br — sem autenticação, sem busca
// por texto livre (só código exato ou navegação hierárquica grupo→classe→pdm).
// Por isso sincronizamos localmente os PDMs de material e itens de serviço,
// que são pequenos (~15k e ~3k respectivamente) e permitem busca por nome.
const CATALOGO_API_BASE = 'https://dadosabertos.compras.gov.br';

const BATCH_SIZE = 500;
const PAGE_SIZE = 500; // máximo aceito pela API (mínimo 10, máximo 500)

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface PdmMaterialApi {
  codigoPdm: number;
  nomePdm: string;
  codigoGrupo: number | null;
  nomeGrupo: string | null;
  codigoClasse: number | null;
  nomeClasse: string | null;
  statusPdm: boolean;
}

interface ItemServicoApi {
  codigoServico: number;
  nomeServico: string;
  codigoClasse: number | null;
  nomeClasse: string | null;
  codigoGrupo: number | null;
  nomeGrupo: string | null;
  statusServico: boolean;
}

// Busca todas as páginas de um endpoint paginado da API de dados abertos.
async function fetchAllPages<T>(path: string, extraParams: Record<string, string> = {}): Promise<T[]> {
  const all: T[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    const params = new URLSearchParams({ pagina: String(pagina), tamanhoPagina: String(PAGE_SIZE), ...extraParams });
    const res = await fetch(`${CATALOGO_API_BASE}${path}?${params}`, {
      headers: { 'User-Agent': 'SIACT-MROSC/4.0 (gov.br)', Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Falha ao consultar ${path} (página ${pagina}): HTTP ${res.status}`);
    const json = await res.json();
    all.push(...(json.resultado ?? []));
    totalPaginas = json.totalPaginas ?? 1;
    pagina++;
  } while (pagina <= totalPaginas);

  return all;
}

async function upsertBatches<T extends object>(
  supabase: ReturnType<typeof getSupabase>,
  table: string,
  rows: T[],
  onConflict: string
): Promise<number> {
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`Upsert ${table} batch ${i}: ${error.message}`);
    total += batch.length;
  }
  return total;
}

// ── Sincroniza os PDMs de material (nível genérico do CATMAT) ─────────────
export async function syncPdmMaterial(
  supabase: ReturnType<typeof getSupabase>,
  log: (msg: string) => void
): Promise<number> {
  log('Baixando PDMs de material do catálogo Compras.gov.br...');
  const rows = await fetchAllPages<PdmMaterialApi>('/modulo-material/3_consultarPdmMaterial', { statusPdm: 'true' });

  const mapped = rows.map(r => ({
    codigo_pdm: r.codigoPdm,
    nome_pdm: r.nomePdm,
    codigo_grupo: r.codigoGrupo,
    nome_grupo: r.nomeGrupo,
    codigo_classe: r.codigoClasse,
    nome_classe: r.nomeClasse,
    status_pdm: r.statusPdm,
    updated_at: new Date().toISOString(),
  }));

  log(`Upserting ${mapped.length} PDMs de material...`);
  return upsertBatches(supabase, 'catalogo_pdm_material', mapped, 'codigo_pdm');
}

// ── Sincroniza os itens de serviço (CATSER) ────────────────────────────────
export async function syncItemServico(
  supabase: ReturnType<typeof getSupabase>,
  log: (msg: string) => void
): Promise<number> {
  log('Baixando itens de serviço do catálogo Compras.gov.br...');
  const rows = await fetchAllPages<ItemServicoApi>('/modulo-servico/6_consultarItemServico', { statusServico: 'true' });

  const mapped = rows.map(r => ({
    codigo_servico: r.codigoServico,
    nome_servico: r.nomeServico,
    codigo_classe: r.codigoClasse,
    nome_classe: r.nomeClasse,
    codigo_grupo: r.codigoGrupo,
    nome_grupo: r.nomeGrupo,
    status_servico: r.statusServico,
    updated_at: new Date().toISOString(),
  }));

  log(`Upserting ${mapped.length} itens de serviço...`);
  return upsertBatches(supabase, 'catalogo_item_servico', mapped, 'codigo_servico');
}

// ── Sync completo (chamado pelo endpoint /api/sync/catalogo-compras) ──────
export async function syncCatalogoCompras(log: (msg: string) => void): Promise<{ pdmMaterial: number; itemServico: number }> {
  const supabase = getSupabase();
  const pdmMaterial = await syncPdmMaterial(supabase, log);
  const itemServico = await syncItemServico(supabase, log);
  return { pdmMaterial, itemServico };
}

// ── Preço praticado — consulta ao vivo na API de Pesquisa de Preços ───────
// Materiais: pode consultar por código de PDM (nível genérico, agregando todas
// as especificações técnicas variantes) — suficiente pra sugerir referência.
// Serviços: a API só aceita o código exato do item de serviço (codigoItemCatalogo),
// não tem nível agregado — se o item não tiver esse código, não há sugestão.
interface PrecoPraticadoApi {
  precoUnitario: number;
  quantidade: number;
  dataCompra: string;
  nomeFornecedor: string;
  nomeOrgao: string;
  estado: string;
}

export interface EstatisticaPreco {
  amostras: number;
  media: number;
  mediana: number;
  minimo: number;
  maximo: number;
  periodoInicio: string;
  periodoFim: string;
}

function calcularEstatisticas(precos: number[], periodoInicio: string, periodoFim: string): EstatisticaPreco | null {
  if (precos.length === 0) return null;
  const ordenados = [...precos].sort((a, b) => a - b);
  const media = ordenados.reduce((s, v) => s + v, 0) / ordenados.length;
  const meio = Math.floor(ordenados.length / 2);
  const mediana = ordenados.length % 2 === 0
    ? (ordenados[meio - 1] + ordenados[meio]) / 2
    : ordenados[meio];

  return {
    amostras: ordenados.length,
    media: Math.round(media * 100) / 100,
    mediana: Math.round(mediana * 100) / 100,
    minimo: ordenados[0],
    maximo: ordenados[ordenados.length - 1],
    periodoInicio,
    periodoFim,
  };
}

export async function consultarPrecoPdmMaterial(codigoPdm: number): Promise<EstatisticaPreco | null> {
  const fim = new Date();
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - 12);
  const periodoInicio = inicio.toISOString().slice(0, 10);
  const periodoFim = fim.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    tipo: 'codigoPdm',
    codigo: String(codigoPdm),
    pagina: '1',
    tamanhoPagina: '500',
    dataCompraInicio: periodoInicio,
    dataCompraFim: periodoFim,
  });

  const res = await fetch(`${CATALOGO_API_BASE}/modulo-pesquisa-preco/1_consultarMaterial?${params}`, {
    headers: { 'User-Agent': 'SIACT-MROSC/4.0 (gov.br)', Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Falha ao consultar preço (PDM ${codigoPdm}): HTTP ${res.status}`);
  const json = await res.json();
  const resultado: PrecoPraticadoApi[] = json.resultado ?? [];
  const precos = resultado.map(r => Number(r.precoUnitario)).filter(v => Number.isFinite(v) && v > 0);

  return calcularEstatisticas(precos, periodoInicio, periodoFim);
}

export async function consultarPrecoItemServico(codigoServico: number): Promise<EstatisticaPreco | null> {
  const fim = new Date();
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - 12);
  const periodoInicio = inicio.toISOString().slice(0, 10);
  const periodoFim = fim.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    codigoItemCatalogo: String(codigoServico),
    pagina: '1',
    tamanhoPagina: '500',
    dataCompraInicio: periodoInicio,
    dataCompraFim: periodoFim,
  });

  const res = await fetch(`${CATALOGO_API_BASE}/modulo-pesquisa-preco/3_consultarServico?${params}`, {
    headers: { 'User-Agent': 'SIACT-MROSC/4.0 (gov.br)', Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Falha ao consultar preço (serviço ${codigoServico}): HTTP ${res.status}`);
  const json = await res.json();
  const resultado: PrecoPraticadoApi[] = json.resultado ?? [];
  const precos = resultado.map(r => Number(r.precoUnitario)).filter(v => Number.isFinite(v) && v > 0);

  return calcularEstatisticas(precos, periodoInicio, periodoFim);
}
