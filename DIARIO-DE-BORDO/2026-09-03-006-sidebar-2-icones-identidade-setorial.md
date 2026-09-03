---
id: 2026-09-03-006
data: 2026-09-03
titulo: "Sidebar mostra só 2 ícones por padrão e oculta identidade antes do login Setorial"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [7b805bb]
---

## Contexto

Entrada de backfill retroativo, registrada mais tarde na mesma sessão (03/09/2026).

## O que foi feito

Remoção do auto-pin de grupo pela rota atual — a sidebar agora sempre inicia mostrando só os 2 ícones de perfil (OSC/Setorial), expandindo apenas sob clique. Bloco de identidade do usuário ("GP / Usuário") no rodapé passou a só aparecer quando o perfil visível é Setorial (que loga via gov.br) — oculto antes da escolha de perfil e para OSC.

## Arquivos afetados

Ver diff do commit `7b805bb` no repositório.
