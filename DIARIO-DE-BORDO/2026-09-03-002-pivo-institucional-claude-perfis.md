---
id: 2026-09-03-002
data: 2026-09-03
titulo: "Reposicionamento institucional, migração para Claude e controle de acesso por perfil"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [a12c52d]
---

## Contexto

Entrada de backfill retroativo, registrada mais tarde na mesma sessão (03/09/2026) — o commit em si já ocorreu no início do dia de trabalho.

## O que foi feito

Maior commit da sessão, reunindo três frentes:
1. **Pivô de SaaS comercial para produto institucional MGI/DTPAR** — remoção de todas as páginas/textos de planos, preços, trial; stats fabricadas na Landing trocadas por números reais.
2. **Migração do motor de IA de Gemini para Claude** (Anthropic, `claude-sonnet-5`) — motivada pela descontinuação do `gemini-2.5-flash` pelo Google no meio da sessão.
3. **Controle de acesso por perfil OSC/Setorial** — `src/lib/nav.ts` como fonte única de navegação, `PerfilChooser.tsx`, seletor "Visualizar como" para admin.

## Decisões tomadas

- Claude é solução temporária — destino final continua sendo a stack soberana SERPRO (registrado no Roadmap).
- Login gov.br para Setoriais implementado só como placeholder, pendente de credenciamento institucional real.

## Arquivos afetados

Ver diff do commit `a12c52d` no repositório — 23 arquivos alterados.
