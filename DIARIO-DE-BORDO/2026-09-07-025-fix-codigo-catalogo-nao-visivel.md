---
id: 2026-09-07-025
data: 2026-09-07
titulo: "Corrige código do catálogo escondido no autocomplete da Cotação Prévia"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário comparou a Cotação Prévia com a tela da ferramenta oficial
"Pesquisa de Preços" (Compras.gov.br), que mostra o código do catálogo
como coluna visível — e perguntou se o número do código tinha ficado de
fora da nossa implementação ([2026-09-07-024](2026-09-07-024-catalogo-precos-cotacao-previa.md)).

Confirmado: sim. O `codigoCatalogo` já era capturado internamente (usado
pra buscar o preço de referência), mas só aparecia escondido num `title`
de tooltip no badge "Material"/"Serviço" — nunca como texto visível, nem
na lista de sugestões nem depois de selecionado.

## O que foi feito

`CotacaoPrevia.tsx`:
- Lista de sugestões do autocomplete: cada item agora mostra o código
  logo abaixo do nome (`PDM {código}` para material, `Código {código}`
  para serviço), não só o nome.
- Depois de selecionado: nova linha de legenda abaixo da linha do item,
  sempre visível quando há vínculo com o catálogo — "Catálogo
  Compras.gov.br — PDM {código} (categoria genérica — cobre várias
  especificações técnicas)" para material, "Catálogo Compras.gov.br —
  código {código}" para serviço.

**Distinção documentada explicitamente** (para não parecer inconsistente
com a tela oficial): o código mostrado para material é o do **PDM**
(Padrão Descritivo de Material — categoria genérica, ex.: "Notebook" =
PDM 8435), não o código de item específico com especificação técnica
completa que a ferramenta oficial exibe (ex.: 641052) — a sincronização
local cobre só PDMs (15.030 registros), não os 249 mil itens completos
(ver [[2026-09-07-024]] pro porquê dessa escolha). Para serviço, o código
mostrado já é o do item exato (`codigo_servico`), sem essa diferença de
granularidade.

## Decisões tomadas

- Legenda como linha de texto separada (não dentro do badge já existente
  no campo) — o badge é muito estreito pra caber "Material · PDM 8435"
  sem quebrar o layout da linha.
- Texto explicativo "(categoria genérica — cobre várias especificações
  técnicas)" só aparece para material, nunca para serviço — evita alarme
  falso de "código errado" quando o usuário comparar com o código de item
  específico que veria na ferramenta oficial.

## Arquivos afetados

- `src/pages/CotacaoPrevia.tsx` — dropdown de sugestões e legenda do item
  selecionado

## Pendências / próximos passos

- Verificação pré-commit rodada (skill `verificacao-pre-commit`):
  type-check OK, console limpo em aba nova, testado ao vivo (login
  demonstração real) — busca "notebook" mostrou "NOTEBOOK — PDM 8435" e
  "MALETA NOTEBOOK — PDM 9045" no dropdown; selecionado, mostrou "Catálogo
  Compras.gov.br — PDM 8435 (categoria genérica...)" e valor de
  referência R$ 4.699,60 sugerido com base em 500 compras reais.
- Requer novo deploy pra chegar à URL pública.
