import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// URLs oficiais IPEA — Mapa das OSCs
export const IPEA_URLS = {
  basePrincipal:       'https://mapaosc.ipea.gov.br/download/20260310_MOSC_baseresumida.csv',
  dicionario:          'https://mapaosc.ipea.gov.br/arquivos/subitems/4038-dicionario-de-dados-mapa-oscs.xlsx',
  estrangeiras:        'https://mapaosc.ipea.gov.br/arquivos/subitems/1754-20250718analiseoscinternacionais3204.xlsx',
  projetos:            'https://mapaosc.ipea.gov.br/arquivos/subitems/4168-baseprojetososcantiga.xlsx',
  areaSubarea:         'https://mapaosc.ipea.gov.br/download/area_subarea.xlsx',
  cebasEducacao:       'https://mapaosc.ipea.gov.br/arquivos/subitems/8420-cebaseducacao.xlsx',
  cebasSaude:          'https://mapaosc.ipea.gov.br/arquivos/subitems/1434-cebassaude.xlsx',
  cebasSuas:           'https://mapaosc.ipea.gov.br/arquivos/subitems/7684-cebassuas.xlsx',
  conselhos:           'https://mapaosc.ipea.gov.br/arquivos/subitems/4600-conselhoconferencia.xls',
  recursos:            'https://mapaosc.ipea.gov.br/arquivos/subitems/4786-recursososc.xls',
};

const BATCH_SIZE = 500;

// ── Supabase admin client (service role) ──────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── Normaliza CNPJ para 14 dígitos sem formatação ──────────────────────────
function normalizeCnpj(raw: string): string {
  return (raw ?? '').replace(/\D/g, '').padStart(14, '0');
}

// ── Download de arquivo como Buffer ───────────────────────────────────────
async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { 'User-Agent': 'SIACT-MROSC/4.0 (gov.br)' } });
  if (!res.ok) throw new Error(`Download falhou ${url}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Parse XLSX/XLS → array de objetos ────────────────────────────────────
function parseXlsx(buf: Buffer): Record<string, any>[] {
  const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: null });
}

// ── Upsert em batches ─────────────────────────────────────────────────────
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

// ── 1. Sincroniza Base Principal CSV (modo streaming — evita OOM) ─────────
export async function syncBasePrincipal(
  supabase: ReturnType<typeof getSupabase>,
  log: (msg: string) => void
): Promise<number> {
  log('Baixando Base Principal CSV (~331 MB) em modo streaming...');

  const res = await fetch(IPEA_URLS.basePrincipal, {
    headers: { 'User-Agent': 'SIACT-MROSC/4.0 (gov.br)' },
  });
  if (!res.ok) throw new Error(`Download falhou: HTTP ${res.status}`);
  if (!res.body) throw new Error('Response body is null');

  const decoder = new TextDecoder('utf-8');
  const reader  = res.body.getReader();

  let headers: string[]            = [];
  let leftover                     = '';
  let batch: Record<string, any>[] = [];
  let total                        = 0;
  let isFirstLine                  = true;

  const toDate = (v: any): string | null => {
    const s = String(v ?? '').trim();
    if (!s) return null;
    // YYYY-MM-DD já é aceito pelo Postgres
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    // DD/MM/YYYY → YYYY-MM-DD
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return null;
  };

  const str = (v: any): string | null => { const s = String(v ?? '').trim(); return s || null; };

  const mapRow = (r: Record<string, any>) => ({
    cnpj:              normalizeCnpj(r['cd_identificador_osc'] ?? r['cnpj'] ?? r['CNPJ'] ?? ''),
    razao_social:      str(r['tx_razao_social_osc']    ?? r['razao_social']),
    nome_fantasia:     str(r['tx_nome_fantasia_osc']   ?? r['nome_fantasia']),
    natureza_juridica: str(r['cd_natureza_juridica_osc']),
    cnae_principal:    str(r['cd_classe_ativ_economica_osc']),
    municipio:         str(r['tx_municipio'] ?? r['municipio']),
    uf:                str(r['sg_uf']        ?? r['uf']),
    situacao:          r['bo_osc_ativa'] === '1' || r['bo_osc_ativa'] === 'true' ? 'ATIVA' : 'INATIVA',
    data_abertura:     toDate(r['dt_fundacao_osc']),
    data_encerramento: toDate(r['dt_encerramento_osc']),
    matriz_filial:     str(r['bo_matriz']),
    updated_at:        new Date().toISOString(),
  });

  const processLine = (line: string) => {
    if (!line.trim()) return;
    const cols = line.split(';').map(c => c.replace(/^"|"$/g, '').trim());
    if (isFirstLine) {
      headers = cols.map(h => h.trim());
      isFirstLine = false;
      return;
    }
    const r: Record<string, any> = {};
    headers.forEach((h, idx) => { r[h] = cols[idx] ?? null; });
    const mapped = mapRow(r);
    if (mapped.cnpj.length === 14) batch.push(mapped);
  };

  const flushBatch = async () => {
    if (batch.length === 0) return;
    const chunk = batch.splice(0, BATCH_SIZE);
    const { error } = await supabase.from('osc_cadastro').upsert(chunk, { onConflict: 'cnpj' });
    if (error) throw new Error(`Upsert osc_cadastro: ${error.message}`);
    total += chunk.length;
    if (total % 10000 === 0) log(`${total} registros inseridos...`);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (leftover) processLine(leftover);
      break;
    }
    const text  = leftover + decoder.decode(value, { stream: true });
    const lines = text.split('\n');
    leftover    = lines.pop() ?? '';
    for (const line of lines) processLine(line);

    while (batch.length >= BATCH_SIZE) await flushBatch();
  }

  // Flush restante
  while (batch.length > 0) await flushBatch();

  log(`Base Principal concluída: ${total} OSCs inseridas.`);
  return total;
}

// ── 2. Sincroniza CEBAS ───────────────────────────────────────────────────
export async function syncCebas(
  supabase: ReturnType<typeof getSupabase>,
  log: (msg: string) => void
): Promise<number> {
  const fontes = [
    { url: IPEA_URLS.cebasEducacao, tipo: 'EDUCACAO' },
    { url: IPEA_URLS.cebasSaude,    tipo: 'SAUDE' },
    { url: IPEA_URLS.cebasSuas,     tipo: 'ASSISTENCIA_SOCIAL' },
  ] as const;

  let total = 0;
  for (const { url, tipo } of fontes) {
    log(`Baixando CEBAS ${tipo}...`);
    const buf = await downloadBuffer(url);
    const rows = parseXlsx(buf);

    const mapped = rows.map(r => ({
      cnpj:       normalizeCnpj(String(r['CNPJ'] ?? r['cnpj'] ?? '')),
      tipo,
      status:     String(r['Situação'] ?? r['situacao'] ?? r['STATUS'] ?? ''),
      validade:   r['Validade'] ?? r['validade'] ?? null,
      portaria:   String(r['Portaria'] ?? r['portaria'] ?? ''),
      updated_at: new Date().toISOString(),
    })).filter(r => r.cnpj.length === 14);

    const n = await upsertBatches(supabase, 'osc_certificacoes', mapped, 'id');
    total += n;
    log(`CEBAS ${tipo}: ${n} registros processados.`);
  }
  return total;
}

// ── 3. Sincroniza Projetos ────────────────────────────────────────────────
export async function syncProjetos(
  supabase: ReturnType<typeof getSupabase>,
  log: (msg: string) => void
): Promise<number> {
  log('Baixando base de Projetos (~14 MB)...');
  const buf = await downloadBuffer(IPEA_URLS.projetos);
  const rows = parseXlsx(buf);

  const mapped = rows.map(r => ({
    cnpj:       normalizeCnpj(String(r['CNPJ'] ?? r['cnpj'] ?? '')),
    titulo:     String(r['Título'] ?? r['titulo'] ?? r['TITULO'] ?? ''),
    area:       String(r['Área'] ?? r['area'] ?? ''),
    subarea:    String(r['Subárea'] ?? r['subarea'] ?? ''),
    valor:      Number(r['Valor'] ?? r['valor'] ?? 0) || null,
    inicio:     r['Data Início'] ?? r['inicio'] ?? null,
    termino:    r['Data Término'] ?? r['termino'] ?? null,
    situacao:   String(r['Situação'] ?? r['situacao'] ?? ''),
    updated_at: new Date().toISOString(),
  })).filter(r => r.cnpj.length === 14);

  log(`Upserting ${mapped.length} projetos...`);
  return upsertBatches(supabase, 'osc_projetos', mapped, 'id');
}

// ── 4. Sincroniza Áreas e Subáreas ────────────────────────────────────────
export async function syncAreas(
  supabase: ReturnType<typeof getSupabase>,
  log: (msg: string) => void
): Promise<number> {
  log('Baixando Áreas e Subáreas (~82 MB)...');
  const buf = await downloadBuffer(IPEA_URLS.areaSubarea);
  const rows = parseXlsx(buf);

  const mapped = rows.map(r => ({
    cnpj:    normalizeCnpj(String(r['CNPJ'] ?? r['cnpj'] ?? '')),
    area:    String(r['Área'] ?? r['area'] ?? ''),
    subarea: String(r['Subárea'] ?? r['subarea'] ?? ''),
  })).filter(r => r.cnpj.length === 14 && r.area);

  log(`Upserting ${mapped.length} áreas...`);
  return upsertBatches(supabase, 'osc_areas', mapped, 'cnpj,area,subarea');
}

// ── Sync completo (chamado pelo endpoint /api/sync/mapa-osc) ──────────────
// Áreas NÃO está incluída aqui — use /api/sync/areas separadamente (XLSX 82 MB)
export async function syncMapaOsc(log: (msg: string) => void): Promise<{
  osc: number; cebas: number; projetos: number; areas: number;
}> {
  const supabase = getSupabase();

  const osc      = await syncBasePrincipal(supabase, log);
  const cebas    = await syncCebas(supabase, log);
  const projetos = await syncProjetos(supabase, log);

  return { osc, cebas, projetos, areas: 0 };
}

// ── Sync só de Áreas (endpoint dedicado para XLSX pesado) ─────────────────
export async function syncSoAreas(log: (msg: string) => void): Promise<number> {
  const supabase = getSupabase();
  return syncAreas(supabase, log);
}
