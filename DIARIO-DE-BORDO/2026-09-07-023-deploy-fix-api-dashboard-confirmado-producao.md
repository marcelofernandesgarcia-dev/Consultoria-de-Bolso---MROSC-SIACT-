---
id: 2026-09-07-023
data: 2026-09-07
titulo: "Deploy da correção de /api/dashboard confirmado em produção"
tipo: testes
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Sequência da entrada 2026-09-07-022 (correção do broken access control em
`GET /api/dashboard`). Correção só fecha o item 7 do Dossiê Claude DTPAR de
fato quando está ativa em produção, não só commitada.

## O que foi feito

Deploy manual via Cloud Shell, seguindo o processo já documentado no
`CLAUDE.md`:
1. `git pull` no clone do Cloud Shell — trouxe os commits `cf928ef` (fix) e
   `5cd4cad` (registro de hash).
2. `gcloud builds submit --config cloudbuild.yaml --substitutions=_TAG=$(git rev-parse --short HEAD)`
   — build `a0eb5210-f15e-4713-bf79-97b6b64e0a82`, `STATUS: SUCCESS`,
   duração 3m58s.
3. Confirmação real contra a URL de produção:
   `curl https://siact-mrosc-927353480907.southamerica-east1.run.app/api/dashboard`
   sem token — retornou `HTTP 401` (antes do deploy, retornava `200` com
   dado de todos os usuários).

## Verificação

- Build do Cloud Build: `SUCCESS`.
- Endpoint de produção testado ao vivo, sem token: `401`, comportamento
  esperado confirmado — não é suposição, é teste real contra a URL pública.

## Arquivos afetados

Nenhum arquivo de código (esta entrada é sobre o deploy em si, não sobre
mudança de código — essa já foi registrada na entrada 022).

## Pendências / próximos passos

Nenhuma. Item 7 do Dossiê Claude DTPAR está fechado de ponta a ponta:
achado → correção → verificação local → commit → deploy → verificação em
produção.
