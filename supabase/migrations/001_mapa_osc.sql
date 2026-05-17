-- ── Mapa OSC / IPEA — Schema completo ─────────────────────────────────────
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Cadastro principal das OSCs (Base Principal CSV ~331 MB)
CREATE TABLE IF NOT EXISTS public.osc_cadastro (
  cnpj              TEXT        PRIMARY KEY,
  razao_social      TEXT,
  nome_fantasia     TEXT,
  natureza_juridica TEXT,
  cnae_principal    TEXT,
  cnaes_secundarios TEXT[],
  municipio         TEXT,
  uf                CHAR(2),
  cep               TEXT,
  situacao          TEXT,        -- 'ATIVA' | 'INATIVA'
  data_abertura     DATE,
  data_encerramento DATE,
  matriz_filial     TEXT,
  porte             TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osc_uf         ON public.osc_cadastro (uf);
CREATE INDEX IF NOT EXISTS idx_osc_municipio  ON public.osc_cadastro (municipio);
CREATE INDEX IF NOT EXISTS idx_osc_situacao   ON public.osc_cadastro (situacao);
CREATE INDEX IF NOT EXISTS idx_osc_razao      ON public.osc_cadastro USING gin (to_tsvector('portuguese', coalesce(razao_social,'')));

-- 2. Certificações CEBAS (Saúde, Educação, Assistência Social)
CREATE TABLE IF NOT EXISTS public.osc_certificacoes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj        TEXT        NOT NULL REFERENCES public.osc_cadastro(cnpj) ON DELETE CASCADE,
  tipo        TEXT        NOT NULL, -- 'SAUDE' | 'EDUCACAO' | 'ASSISTENCIA_SOCIAL'
  status      TEXT,
  validade    DATE,
  portaria    TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cebas_cnpj ON public.osc_certificacoes (cnpj);
CREATE INDEX IF NOT EXISTS idx_cebas_tipo ON public.osc_certificacoes (tipo);

-- 3. Projetos e parcerias históricas
CREATE TABLE IF NOT EXISTS public.osc_projetos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj        TEXT        REFERENCES public.osc_cadastro(cnpj) ON DELETE CASCADE,
  titulo      TEXT,
  area        TEXT,
  subarea     TEXT,
  valor       NUMERIC,
  inicio      DATE,
  termino     DATE,
  situacao    TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projetos_cnpj ON public.osc_projetos (cnpj);

-- 4. Áreas e subáreas de atuação
CREATE TABLE IF NOT EXISTS public.osc_areas (
  cnpj        TEXT    NOT NULL REFERENCES public.osc_cadastro(cnpj) ON DELETE CASCADE,
  area        TEXT    NOT NULL,
  subarea     TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (cnpj, area, subarea)
);

CREATE INDEX IF NOT EXISTS idx_areas_area ON public.osc_areas (area);

-- 5. Log de sincronizações semanais
CREATE TABLE IF NOT EXISTS public.osc_sync_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at  TIMESTAMPTZ,
  status       TEXT        NOT NULL DEFAULT 'RUNNING', -- 'RUNNING' | 'SUCCESS' | 'ERROR'
  registros    INTEGER,
  detalhes     JSONB
);

-- RLS: tabelas OSC são leitura pública (dados abertos IPEA)
ALTER TABLE public.osc_cadastro       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osc_certificacoes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osc_projetos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osc_areas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.osc_sync_log       ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ler todos os dados OSC (dados públicos IPEA)
CREATE POLICY "authenticated_read_osc"       ON public.osc_cadastro      FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_cebas"     ON public.osc_certificacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_projetos"  ON public.osc_projetos      FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_areas"     ON public.osc_areas         FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_sync_log"  ON public.osc_sync_log      FOR SELECT TO authenticated USING (true);
