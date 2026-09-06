---
id: 2026-09-06-009
data: 2026-09-06
titulo: "Corrige cartões de totais da Cotação Prévia aparecendo antes do valor cotado"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [7ee8e38]
---

## Contexto

Usuário testando a funcionalidade "Cotação Prévia" na URL publicada
encontrou um resultado aparentemente incoerente: preencheu só o valor de
referência de um item (R$ 2.500,00), deixou o valor cotado zerado, e a tela
já mostrava um cartão "Variação Global: -100.00%" em **verde**, com o texto
"Dentro da faixa aceitável" — antes mesmo de tentar rodar a análise.

## O que foi feito

`CotacaoPrevia.tsx`: os cartões de totais (Total Referência / Total Cotado /
Variação Global) eram exibidos sempre que `totalRef > 0 OU totalCotado > 0`
— bastava o valor de referência estar preenchido pra aparecerem, mesmo sem
nenhum valor cotado real. Como a fórmula de cor só marca vermelho/amarelo
pra variação positiva (sobrepreço >10%/>25%), uma variação de -100%
(cotado = 0) caía no caso "verde", produzindo uma mensagem enganosa de
"aceitável".

A validação que impede rodar a análise sem valor cotado (`"valor cotado
inválido ou zero"`) já estava correta e não foi alterada — o problema era
só a exibição prematura do resumo antes dela.

Corrigido trocando a condição para `totalCotado > 0` — os cartões só
aparecem depois que houver pelo menos um valor cotado real preenchido.

## Decisões tomadas

Fix mínimo e cirúrgico (uma condição, três linhas) — não foi necessário
mexer na lógica de cálculo de variação nem na validação do botão "Analisar
Preços com IA", que já funcionavam corretamente.

## Arquivos afetados

- `src/pages/CotacaoPrevia.tsx` — condição de exibição dos cartões de totais

## Pendências / próximos passos

Nenhuma.
