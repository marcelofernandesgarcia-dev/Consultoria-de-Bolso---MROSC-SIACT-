---
id: 2026-09-07-018
data: 2026-09-07
titulo: "Corrige cloudbuild.yaml — substituição aninhada ($_TAG dentro de $_IMAGE) não era validada"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

A correção da entrada anterior ([2026-09-07-017](2026-09-07-017-fix-cloudbuild-short-sha.md))
trocou a variável embutida `$SHORT_SHA` por uma variável própria `_TAG`
(default `latest`), referenciada dentro de outra substituição, `_IMAGE`.
Rodado de novo no Cloud Shell, o build falhou com um erro diferente, mas
da mesma família:

```
ERROR: (gcloud.builds.submit) INVALID_ARGUMENT: invalid argument: key "_TAG"
in the substitution data is not matched in the template
```

## O que foi feito

Diagnóstico: o Cloud Build não reconhece uma substituição usada **só
dentro do valor padrão de outra substituição** (`_IMAGE:
.../siact-mrosc:$_TAG`) como "usada no template" — ele escaneia os `steps`
em busca de referências literais a cada chave declarada em
`substitutions`, e `$_TAG` só aparecia dentro de `$_IMAGE`, nunca
diretamente num step. Resultado: tanto `$SHORT_SHA` (entrada 017) quanto
`$_TAG` por trás de `$_IMAGE` falharam pelo mesmo motivo de fundo —
substituição aninhada não é validada corretamente pelo Cloud Build.

Corrigido removendo a indireção `_IMAGE` por completo: os 3 lugares que
precisam do caminho da imagem (`docker build -t`, `docker push`,
`--image=` no deploy) agora escrevem
`southamerica-east1-docker.pkg.dev/gen-lang-client-0565048097/siact/siact-mrosc:$_TAG`
por extenso, com `$_TAG` referenciado direto em cada step — sem nenhuma
substituição aninhada.

## Decisões tomadas

- Repetir a string da imagem 3 vezes (em vez de manter um `_IMAGE`
  centralizado) é o preço de contornar essa limitação do Cloud Build —
  aceitável pelo tamanho do arquivo, e comentado no próprio YAML pra não
  ser "corrigido" de volta por engano numa sessão futura.

## Arquivos afetados

- `cloudbuild.yaml` — removida a substituição `_IMAGE`; os 3 steps que a
  usavam agora escrevem o caminho da imagem por extenso com `$_TAG` direto.

## Pendências / próximos passos

- Rodar `git pull` + `gcloud builds submit --config cloudbuild.yaml` de
  novo no Cloud Shell — terceira tentativa de concluir o deploy do log de
  auditoria de IA ([2026-09-07-016](2026-09-07-016-log-auditoria-ia.md)).
