---
id: 2026-09-06-013
data: 2026-09-06
titulo: "Adiciona alerta e selos de roadmap nas perguntas manuais do Simulador"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [42bfc28]
---

## Contexto

Continuação direta de [2026-09-06-012](2026-09-06-012-planejamento-automacao-simulador-elegibilidade.md).
Depois de registrar o plano de automação só no Roadmap (decisão anterior),
o usuário reconsiderou e pediu explicitamente a implementação do pedido
original: alertas visíveis na própria tela do Simulador informando que o
sistema está em evolução, com selos "Em breve" nas perguntas ainda
manuais.

## O que foi feito

Implementado exatamente o que a análise de viabilidade da entrada anterior
recomendava — sem "Em breve" genérico em tudo, calibrado por pergunta:

- Um alerta (`amber`, ícone de ampulheta) inserido entre as perguntas 2 e 3,
  explicando que 1 e 2 já são automáticas e o resto ainda é manual.
- Selo por pergunta (3 a 8), ao lado do fundamento legal:
  - **"Em breve"** (roxo) nas perguntas 3 (comparação de estatuto — IA),
    4 (CNDT — TST), 5 (certidões fiscais — Receita/PGFN) e 8 (capacidade
    técnica — IA): viabilidade alta ou média já confirmada.
  - **"Depende de integração institucional futura (Conecta.gov.br) — sem
    prazo definido"** (cinza, sem tom de "Em breve") nas perguntas 6 e 7
    (parentesco/poder de supervisão de dirigentes): viabilidade baixa,
    evita prometer prazo que não temos como cumprir.

Verificado localmente (`npm run dev`): `tsc` limpo, texto e ordem
confirmados via extração de conteúdo da página, interação funcional
(cliques em "Sim" nas perguntas 1 e 2 avançando o contador
"2 de 8 perguntas respondidas" normalmente).

## Decisões tomadas

Manter a diferenciação de selo por viabilidade, em vez do "Em breve"
único genérico que o usuário tinha pedido originalmente — trade-off aceito
pelo usuário na sessão anterior e reafirmado aqui: melhor comunicar com
precisão o que é realista do que prometer igual pra tudo.

## Arquivos afetados

- `src/pages/SimuladorElegibilidade.tsx` — campo `statusFutura` na
  interface `Pergunta`, populado em p3-p8; alerta geral inserido antes da
  pergunta 3; renderização do selo ao lado do fundamento legal

## Pendências / próximos passos

Nenhuma pendência de código — a implementação real de qualquer automação
(TST, Receita/PGFN, IA assistida, Conecta.gov.br) continua registrada só
como tarefa no Roadmap, sem data prevista.
