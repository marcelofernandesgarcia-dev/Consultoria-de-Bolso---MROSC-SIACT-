-- ── Catálogo de Preços Compras.gov.br — Schema ─────────────────────────────
-- Execute no SQL Editor do Supabase Dashboard
--
-- Sincroniza localmente os PDMs de material (~15.030) e itens de serviço
-- (~3.018) do catálogo oficial CATMAT/CATSER (dadosabertos.compras.gov.br),
-- pra permitir busca por texto na Cotação Prévia — a API pública não aceita
-- busca por descrição livre, só código exato ou navegação hierárquica, então
-- a busca por nome precisa ser feita localmente contra esta cópia sincronizada
-- (mesmo padrão já usado para osc_cadastro/Mapa OSC).
--
-- 1. PDMs de material (Padrão Descritivo de Material) — nível genérico do
--    catálogo (ex: "NOTEBOOK", "CADEIRA ESCRITÓRIO"), suficiente para sugerir
--    valor de referência sem exigir a especificação técnica completa.
CREATE TABLE IF NOT EXISTS public.catalogo_pdm_material (
  codigo_pdm     INTEGER     PRIMARY KEY,
  nome_pdm       TEXT        NOT NULL,
  codigo_grupo   INTEGER,
  nome_grupo     TEXT,
  codigo_classe  INTEGER,
  nome_classe    TEXT,
  status_pdm     BOOLEAN     NOT NULL DEFAULT TRUE,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogo_pdm_busca
  ON public.catalogo_pdm_material USING gin (to_tsvector('portuguese', coalesce(nome_pdm,'')));
CREATE INDEX IF NOT EXISTS idx_catalogo_pdm_status ON public.catalogo_pdm_material (status_pdm);

-- 2. Itens de serviço (CATSER) — aqui não existe nível "genérico" como o PDM
--    de material, o item já é a unidade de busca/preço.
CREATE TABLE IF NOT EXISTS public.catalogo_item_servico (
  codigo_servico  INTEGER     PRIMARY KEY,
  nome_servico    TEXT        NOT NULL,
  codigo_classe   INTEGER,
  nome_classe     TEXT,
  codigo_grupo    INTEGER,
  nome_grupo      TEXT,
  status_servico  BOOLEAN     NOT NULL DEFAULT TRUE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogo_servico_busca
  ON public.catalogo_item_servico USING gin (to_tsvector('portuguese', coalesce(nome_servico,'')));
CREATE INDEX IF NOT EXISTS idx_catalogo_servico_status ON public.catalogo_item_servico (status_servico);

-- Grants para o service_role (backend) poder escrever
GRANT ALL ON TABLE public.catalogo_pdm_material  TO service_role;
GRANT ALL ON TABLE public.catalogo_item_servico  TO service_role;

-- RLS: leitura pública (é catálogo de dados abertos do governo, não dado sensível)
ALTER TABLE public.catalogo_pdm_material  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_item_servico  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_catalogo_pdm"     ON public.catalogo_pdm_material;
DROP POLICY IF EXISTS "authenticated_read_catalogo_servico" ON public.catalogo_item_servico;

CREATE POLICY "authenticated_read_catalogo_pdm"     ON public.catalogo_pdm_material  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_catalogo_servico" ON public.catalogo_item_servico  FOR SELECT TO authenticated USING (true);
