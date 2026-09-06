---
id: 2026-09-06-005
data: 2026-09-06
titulo: "Corrige cloudbuild.yaml — entrypoint bash necessário para expandir secretEnv"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [bc11836]
---

## Contexto

Após corrigir a CSP ([2026-09-06-004](2026-09-06-004-fix-csp-connect-src-supabase.md)),
o login anônimo passou a chegar ao Supabase, mas retornava `401 Invalid API
key`. Investigação revelou que o projeto Supabase havia migrado pro novo
formato de chaves (`sb_publishable_...`/`sb_secret_...`) e as chaves legadas
(`anon`/`service_role`, formato JWT) já não validavam de verdade — mesmo
continuando visíveis na aba "legada" do painel. Os secrets
`VITE_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` foram atualizados com
as chaves novas, mas o erro persistiu.

## O que foi feito

Investigação mais profunda (interceptando `fetch` no navegador e inspecionando
o bundle JS publicado) revelou que o cabeçalho `apikey` enviado era
literalmente a string `"$VITE_SUPABASE_ANON_KEY"` — a variável nunca tinha
sido substituída pelo valor real, em nenhum dos builds anteriores desde
[2026-09-06-002](2026-09-06-002-fix-vite-build-args.md).

Causa raiz: o passo de `docker build` no `cloudbuild.yaml` roda a imagem
`gcr.io/cloud-builders/docker` com seu entrypoint padrão (`docker`
diretamente, sem shell). A sintaxe `$$VITE_SUPABASE_ANON_KEY` só é expandida
para o valor real de uma variável de ambiente quando processada por um
shell — sem ele, o Cloud Build converte `$$VAR` em `$VAR` (sua própria regra
de escape) e para por aí, entregando esse texto literal ao `docker build`.

Corrigido trocando o passo para `entrypoint: bash`, `args: ['-c', '...']`,
de forma que a expansão de `$VITE_SUPABASE_ANON_KEY` aconteça de fato dentro
do script de shell.

## Decisões tomadas

Nenhuma alternativa considerada — é a forma documentada pelo próprio Cloud
Build de usar `secretEnv` dentro de `args`.

## Arquivos afetados

- `cloudbuild.yaml` — passo de `docker build` reescrito com
  `entrypoint: bash` e `args: ['-c', '<script>']`

## Pendências / próximos passos

Com essa correção, o login anônimo finalmente funcionou de ponta a ponta.
O teste do "Explicar Edital" (o bug original que motivou toda a
investigação desta sessão) ainda falhou uma vez — motivo documentado à
parte, sem commit associado, pois a causa era um secret desatualizado
(`ANTHROPIC_API_KEY` com a chave antiga, revogada em sessão anterior após
exposição acidental no chat) e não uma mudança de código.
