---
id: 2026-09-08-011
data: 2026-09-08
titulo: "Deploy e verificação (desktop + mobile) da entrada previsível pra sessão de demonstração"
tipo: testes
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [cdaaf2a]
---

## Contexto

Continuação direta da entrada [010](2026-09-08-010-entrada-previsivel-sessao-demonstracao.md):
com o commit `cdaaf2a` já enviado ao repositório remoto, faltava rodar o
deploy e confirmar na URL pública que uma sessão de demonstração numa
aba/visita nova sempre mostra o Passo 1, mesmo com jornada antiga salva
de uma exploração anterior.

## O que foi feito

- Deploy rodado via `gcloud` local — build
  `194f57d2-deac-4943-9ebc-c75439e00ef2`, 5m6s, `SUCCESS`.
- Verificação ao vivo em produção
  (`https://siact-mrosc-927353480907.southamerica-east1.run.app`), em
  desktop **e** mobile: `localStorage`/`sessionStorage` limpos → "Entrar
  como visitante" → escolhida "Gestor Público" → "Chamamento Público"
  (jornada salva) → simulado o fechar/reabrir de aba (`sessionStorage`
  limpo, `localStorage` mantido) → recarregado `/inicio` → **Passo 1
  ("Quem é você nesta parceria?") confirmado nos dois viewports**,
  mesmo com a jornada antiga ainda presente no `localStorage`.

## Decisões tomadas

Nenhuma decisão nova — esta entrada é só o fechamento (deploy +
verificação) do que já foi decidido e implementado na entrada 010.

## Arquivos afetados

Nenhum arquivo de código alterado nesta entrada — só deploy e
verificação do commit `cdaaf2a`, já registrado na entrada 010.

## Pendências / próximos passos

Nenhuma pendência conhecida neste momento para o fluxo de entrada de
sessão de demonstração. Os 4 gaps documentados no Contrato de
Comportamento — Entrada no App (cofre Obsidian) seguem fora do escopo
até que o usuário peça explicitamente.
