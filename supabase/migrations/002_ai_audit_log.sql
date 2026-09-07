-- ── Log de auditoria de IA — Schema ────────────────────────────────────────
-- Execute no SQL Editor do Supabase Dashboard
--
-- Registra toda chamada real à IA (Claude) feita pelo sistema, num único lugar
-- canônico e independente de `analysis_history`. `analysis_history` alimenta o
-- Dashboard e o /api/admin/stats com um veredito de 3 vias (CONFORME/RESSALVA/
-- NAO_CONFORME) — este log é mais amplo: cobre também o Assistente flutuante
-- (/api/chat), o "Explicar Edital" (/api/mrosc/edital-explicar) e a análise de
-- processo/TCE (/api/analyze), que não têm esse veredito e por isso nunca
-- foram gravados. Existe para dar ao canal de contestação de análise de IA
-- (página /privacidade) algo concreto para consultar quando uma contestação
-- chegar — ver DIARIO-DE-BORDO/2026-09-07-015-marco-conformidade-aie-plano-ajustes.md.

CREATE TABLE IF NOT EXISTS public.ai_audit_log (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id         UUID,                    -- sem FK: inclui usuários anônimos de demonstração
  endpoint        TEXT        NOT NULL,    -- ex: '/api/analyze-mrosc', '/api/chat'
  analysis_type   TEXT        NOT NULL,    -- ex: 'requirements_eligibility', 'chat_assistente'
  input_excerpt   TEXT,                    -- entrada enviada à IA, truncada (~4000 caracteres)
  output_excerpt  TEXT                     -- resposta da IA, truncada (~4000 caracteres)
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_user_id     ON public.ai_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_created_at  ON public.ai_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_audit_endpoint    ON public.ai_audit_log (endpoint);

-- Grant para o service_role (backend) poder escrever
GRANT ALL ON TABLE public.ai_audit_log TO service_role;

-- RLS habilitado, sem policy para nenhum papel além de service_role — o
-- service_role sempre contorna RLS, então o log fica gravável só pelo
-- backend e ilegível por qualquer cliente autenticado direto no Supabase.
ALTER TABLE public.ai_audit_log ENABLE ROW LEVEL SECURITY;
