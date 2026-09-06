---
id: 2026-09-06-008
data: 2026-09-06
titulo: "Amplia painel do Assistente flutuante — legibilidade e acessibilidade"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [cde8072]
---

## Contexto

Feedback de uso real do usuário, testando a URL publicada já com o "Explicar
Edital" funcionando ([2026-09-06-007](2026-09-06-007-marco-validacao-e2e-demonstracao.md)):
a qualidade das respostas do Assistente SIACT (widget flutuante) é excelente,
mas o painel de 360×520px com texto em 12px estava dificultando a leitura —
"um espaço muito pequeno no contexto da tela". Pedido explícito: solução de
baixo impacto de código, sem prejudicar a usabilidade, considerando também
regras de acessibilidade da administração pública e o uso mobile.

## O que foi feito

Levantamento da base normativa de acessibilidade antes de propor a solução
(mesmo rigor de verificação usado nas correções jurídicas de sessões
anteriores): **eMAG 3.1** (Modelo de Acessibilidade em Governo Eletrônico,
mantido pelo próprio MGI, instituído pela Portaria nº 3/2007, baseado no
WCAG 2.0) e a **Lei nº 13.146/2015** (Lei Brasileira de Inclusão).

Ajustes só de dimensão/tipografia/alvo de toque no `AssistenteFlutuante.tsx`,
sem alterar estrutura ou comportamento:

- Painel (desktop): 360×520px → **600×720px**.
- Texto das respostas e do cabeçalho: 10-12px → **12-14px** — critério
  WCAG 1.4.4 (Resize Text).
- Botões de anexar/enviar: área de toque fixada em **40×40px** — mais perto
  do mínimo recomendado por WCAG 2.5.5 (Target Size).
- Limites de segurança (`max-w-[calc(100vw-2.5rem)]`,
  `max-h-[calc(100vh-7rem)]`) mantidos como já estavam — WCAG 1.4.10
  (Reflow), evitam estouro de tela em qualquer janela/zoom.
- Mobile não precisou de mudança de layout — já usa tela cheia (`inset-0`);
  os ganhos de fonte/alvo de toque valem lá também, por serem classes
  compartilhadas.

Verificado visualmente em desktop (1440×900, painel renderizando exatamente
600×720px) e mobile (375×812, tela cheia).

## Decisões tomadas

Escopo deliberadamente contido: uma auditoria completa de acessibilidade
(contraste de cor WCAG AA, navegação 100% por teclado, leitor de tela,
unidades relativas `rem`) foi identificada e discutida, mas descartada desta
rodada por decisão explícita do usuário — fica registrada como pendência
separada, não urgente.

## Arquivos afetados

- `src/components/AssistenteFlutuante.tsx` — dimensões do painel, tamanhos de
  fonte, área de toque dos botões de anexar/enviar

## Pendências / próximos passos

- Rodar o deploy no Cloud Run pra essa melhoria chegar à URL pública usada na
  apresentação (só está em `main` no GitHub até aqui).
- Auditoria de contraste de cor e demais critérios WCAG AA — pendência
  registrada, não priorizada agora.
