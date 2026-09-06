---
id: 2026-09-06-001
data: 2026-09-06
titulo: "Corrige Dockerfile — imagem de produção não incluía src/lib"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [5b8b30c]
---

## Contexto

Início de uma sessão dedicada a colocar o app publicado no Cloud Run
(`https://siact-mrosc-927353480907.southamerica-east1.run.app`) funcionando de
ponta a ponta antes de uma apresentação a interessados da Presidência da
República e a um diretor, que decidirão se o projeto avança para produção em
escala. O primeiro `gcloud builds submit` bem-sucedido (build + push +
deploy) resultou em um container que subia e imediatamente travava.

## O que foi feito

Diagnóstico via logs do Cloud Run (`Registros` do serviço) revelou:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/src/lib/ipea.js'
imported from /app/server.ts
```

O `server.ts` importa `./src/lib/ipea.js` e `./src/lib/normativos.js`, mas o
estágio de produção do `Dockerfile` só copiava `package*.json`, `dist/` e
`server.ts` — nunca a pasta `src/lib`. Corrigido com uma linha adicional de
`COPY src/lib ./src/lib`.

## Decisões tomadas

Copiar só `src/lib` (não `src/` inteiro) — é a única subpasta que o backend
realmente usa; manter o restante do frontend fora da imagem de produção
mantém a imagem menor.

## Arquivos afetados

- `Dockerfile` — adiciona `COPY src/lib ./src/lib` no estágio `runner`

## Pendências / próximos passos

Corrigido este erro, o deploy avançou mas revelou um novo problema (variáveis
`VITE_*` ausentes em build-time) — ver [2026-09-06-002](2026-09-06-002-fix-vite-build-args.md).
