---
id: 2026-09-03-003
data: 2026-09-03
titulo: "Assistente flutuante com destaque neon e responsividade mobile completa"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [82ef55f]
---

## Contexto

Entrada de backfill retroativo, registrada mais tarde na mesma sessão (03/09/2026).

## O que foi feito

1. Conversão do Assistente SIACT (antes página cheia) em robozinho flutuante (`AssistenteFlutuante.tsx`), disponível para os dois perfis, com destaque neon pulsante via `@keyframes` CSS.
2. Execução completa de um plano de 3 fases de responsividade mobile: (1) drawer lateral no menu, (2) assistente em tela cheia no mobile, (3) auditoria página a página em 375px.

## Decisões tomadas

Corrigidos durante a auditoria mobile: sobreposição do botão flutuante sobre o botão de enviar do chat; botões "Explicar Edital"/"Pré-Análise" espremidos em telas estreitas; padding insuficiente no rodapé das páginas (adicionado `pb-24` no `<main>` para nunca ficar atrás do FAB).

## Arquivos afetados

Ver diff do commit `82ef55f` no repositório — 6 arquivos alterados, incluindo novo `AssistenteFlutuante.tsx` e `useIsMobile.ts`.
