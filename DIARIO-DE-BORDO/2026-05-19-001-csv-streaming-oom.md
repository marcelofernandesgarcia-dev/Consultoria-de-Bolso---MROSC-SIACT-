---
id: 2026-05-19-001
data: 2026-05-19
titulo: "CSV streaming para evitar OOM, correções de permissão e datas IPEA"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [e6bf29b]
---

## Contexto

Entrada de backfill retroativo, registrada em 03/09/2026 a partir do histórico do Git.

## O que foi feito

Correção de estouro de memória (OOM) na ingestão do CSV da Base Principal do IPEA, passando a processar em streaming linha-a-linha. Também corrigidas permissões e tratamento de datas na sincronização.

## Arquivos afetados

Ver diff do commit `e6bf29b` no repositório.
