---
id: 2026-05-17-001
data: 2026-05-17
titulo: "cloudbuild.yaml — project ID, secrets e env vars"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [e43f5e4]
---

## Contexto

Entrada de backfill retroativo, registrada em 03/09/2026 a partir do histórico do Git.

## O que foi feito

Correção do `cloudbuild.yaml`: project ID `gen-lang-client-0565048097`, secrets e variáveis de ambiente. **Nota de continuidade**: o `cloudbuild.yaml` segue com uma pendência conhecida — `SUPABASE_URL` incorreta, apontando para um projeto Supabase genérico/pausado em vez do projeto real "MROSC - CONSULTORIA DE BOLSO" (ref `clsuturkoripoingjqpw`), ainda não corrigida até 03/09/2026.

## Arquivos afetados

Ver diff do commit `e43f5e4` no repositório.
