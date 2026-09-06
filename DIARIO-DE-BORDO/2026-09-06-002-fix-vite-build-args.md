---
id: 2026-09-06-002
data: 2026-09-06
titulo: "Corrige variáveis VITE_* ausentes em build-time (Dockerfile + cloudbuild.yaml)"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [02f8175]
---

## Contexto

Após [2026-09-06-001](2026-09-06-001-fix-dockerfile-src-lib.md), o container
passou a subir, mas o frontend quebrava no navegador com `Uncaught Error:
supabaseUrl is required`.

## O que foi feito

O Vite embute variáveis `import.meta.env.VITE_*` no bundle estático no
momento do `npm run build` — mas o `cloudbuild.yaml` só injetava
`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` como variáveis de ambiente do
Cloud Run em runtime, depois que o build já tinha terminado. O bundle final
ficava com essas variáveis `undefined`.

Corrigido em duas pontas:
- `Dockerfile`: estágio `builder` recebe `ARG`/`ENV` para as duas variáveis
  antes de `RUN npm run build`.
- `cloudbuild.yaml`: passo de `docker build` passa `--build-arg
  VITE_SUPABASE_URL=...` (valor direto, não é segredo) e `--build-arg
  VITE_SUPABASE_ANON_KEY=$$VITE_SUPABASE_ANON_KEY` (via `secretEnv` do
  Secret Manager).

## Decisões tomadas

`VITE_SUPABASE_URL` foi passado como valor literal (é uma URL pública, sem
necessidade de Secret Manager); só a `ANON_KEY` passou por `secretEnv`.

## Arquivos afetados

- `Dockerfile` — `ARG`/`ENV` de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
  no estágio `builder`
- `cloudbuild.yaml` — `--build-arg` no passo de build + bloco
  `availableSecrets`

## Pendências / próximos passos

Essa correção continha um bug sutil (o `$$VAR` não era de fato expandido,
por faltar um shell no passo) — só descoberto e corrigido depois, em
[2026-09-06-005](2026-09-06-005-fix-cloudbuild-bash-entrypoint.md).
