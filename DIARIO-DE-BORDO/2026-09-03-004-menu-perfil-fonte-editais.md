---
id: 2026-09-03-004
data: 2026-09-03
titulo: "Menu lateral por perfil (OSC/Setorial) e nova fonte oficial de editais"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [1c7caa1]
---

## Contexto

Entrada de backfill retroativo, registrada mais tarde na mesma sessão (03/09/2026).

## O que foi feito

1. Reestruturação da sidebar: os 4 grupos anteriores (Principal/Ferramentas/Capacitação/Sistema) substituídos por 2 gavetas únicas — "OSC" e "Setorial" — cada uma espelhando a lista completa de ferramentas daquele perfil.
2. Migração da fonte de dados do Radar de Oportunidades de `plataformaosc.org.br` (mural de ONG, não oficial) para a API pública JSON da Prosas, a mesma que alimenta o widget oficial embutido em `mapaosc.ipea.gov.br/editais` — resultado: 131 editais reais, ordenados por prazo mais próximo.

## Decisões tomadas

`perfilDaRota()` reescrito para detectar automaticamente uma rota compartilhada quando ela existe em mais de uma gaveta, evitando bloqueios indevidos.

## Arquivos afetados

Ver diff do commit `1c7caa1` no repositório.
