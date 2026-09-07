---
id: 2026-09-07-017
data: 2026-09-07
titulo: "Corrige cloudbuild.yaml — $SHORT_SHA vazio quebrava todo deploy manual"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Deploy do log de auditoria de IA ([2026-09-07-016](2026-09-07-016-log-auditoria-ia.md))
via `gcloud builds submit --config cloudbuild.yaml` no Cloud Shell falhou no
primeiro step (build Docker), com o erro:

```
invalid argument "southamerica-east1-docker.pkg.dev/gen-lang-client-0565048097/siact/siact-mrosc:"
for "-t, --tag" flag: invalid reference format
```

## O que foi feito

Diagnóstico via `gcloud builds log <BUILD_ID>`: a tag da imagem
(`substitutions._IMAGE` em `cloudbuild.yaml`) terminava em `$SHORT_SHA` —
uma variável **embutida** do Cloud Build, preenchida automaticamente só em
builds disparados por um gatilho conectado ao repositório GitHub. Como o
deploy deste projeto é sempre manual (`gcloud builds submit`, sem
CI/CD — ver [[project_claude_md_e_skills_dtpar]] e a nota já registrada de
"manual only, no CI/CD"), essa variável nunca tinha valor, e a tag virava
`...siact-mrosc:` (vazia depois dos dois-pontos) — inválida para o Docker.

Tentativa de contornar passando `--substitutions=SHORT_SHA=$(git rev-parse
--short HEAD)` também falhou: o Cloud Build rejeita sobrescrever variáveis
embutidas (só aceita variáveis próprias, com prefixo `_`).

Corrigido substituindo `$SHORT_SHA` por uma variável própria `_TAG`
(default `latest`), documentando no próprio `cloudbuild.yaml` o comando
opcional para usar o hash do commit como tag quando quiser rastreabilidade
por versão: `--substitutions=_TAG=$(git rev-parse --short HEAD)`.

## Decisões tomadas

- Default `latest` em vez de forçar sempre um hash de commit — mantém
  `gcloud builds submit --config cloudbuild.yaml` funcionando sem
  parâmetros extras, que é como o deploy é rodado na prática hoje.
- Não investiguei se deploys manuais anteriores desta sessão sofreram o
  mesmo problema silenciosamente (ex.: usando uma imagem em cache) — o
  importante é que o comando documentado no README/CLAUDE.md volta a
  funcionar de forma confiável a partir de agora.

## Arquivos afetados

- `cloudbuild.yaml` — `substitutions._IMAGE` trocado de `$SHORT_SHA` (embutida)
  para `$_TAG` (própria, default `latest`), com comentário explicando o porquê.

## Pendências / próximos passos

- Rodar `git pull` + `gcloud builds submit --config cloudbuild.yaml` de
  novo no Cloud Shell para concluir o deploy do log de auditoria de IA.
