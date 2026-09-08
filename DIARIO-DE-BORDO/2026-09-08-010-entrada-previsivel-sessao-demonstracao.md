---
id: 2026-09-08-010
data: 2026-09-08
titulo: "Entrada previsível pra sessão de demonstração — 2º clique sempre escolhe perfil"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário pediu um mapeamento completo do fluxo de entrada do app (do
primeiro contato até a tela "Quem é você nesta parceria?"). Ao revisar
as condições do pedido, registrou uma exigência de UX explícita: o
protótipo existe pra ser apresentado à alta gestão do MGI, então o
caminho de acesso precisa ser fácil e coerente — no 2º clique ("Entrar
como visitante" → escolher OSC/Setorial), a pessoa deve sempre estar na
tela de escolha de perfil, não só na primeira vez que alguém usa aquele
navegador. Pediu pra reanalisar as condições e refazer o planejamento
(rodado em Plan Mode).

## O que foi feito

Exploração de código (via subagente) confirmou o mapa completo de rotas
(`App.tsx`), a página `Landing.tsx` (100% pública, sem lógica de auth),
os 3 caminhos de login em `Login.tsx`, a restauração automática de
sessão em `AuthContext.tsx`, e um 5º mecanismo de entrada até então não
documentado: o gate `PerfilChooser` (`PrivateRoute.tsx`), que aparece
pra conta real sem `perfil` definido, distinto do Passo 1 do
`Inicio.tsx`.

Confirmado que, numa aba totalmente nova, o fluxo já entrega exatamente
o pedido (2º clique = escolha de perfil). O problema estava em
revisitas: como `siact_jornada` é uma chave de `localStorage` (não por
sessão), uma escolha feita em qualquer visita anterior — inclusive dias
atrás, inclusive de outra pessoa no mesmo dispositivo — fazia `Inicio.tsx`
pular direto pro Passo 3 em qualquer visita seguinte, mesmo pra sessões
de demonstração novas. Foi exatamente esse comportamento (já registrado
como intencional, não bug) que gerou o print do diretor interpretado
como bug mais cedo no mesmo dia.

**Correção**: novo controle por aba, usando `sessionStorage` (que zera a
cada aba/reabertura de navegador, ao contrário de `localStorage`) — só
aplicado a sessões de demonstração (`isDemo`):
- `src/lib/jornada.ts`: novas funções `jornadaAtivaNestaAba()` /
  `marcarJornadaAtivaNestaAba()`.
- `src/pages/Inicio.tsx`: a retomada pro Passo 3 agora exige
  `jornadaSalva && (!isDemo || jornadaAtivaNestaAba())` — sessão demo só
  retoma se a escolha foi feita nesta mesma aba. Marca o flag no momento
  da escolha da fase (transição Passo 2 → Passo 3).
- `src/components/Layout/Sidebar.tsx`: o indicador "Sua Jornada" e a
  priorização do menu por perfil da jornada (ambos adicionados hoje mais
  cedo) passam a usar a mesma condição — não mostram/priorizam por uma
  jornada "esquecida" de visita anterior antes da pessoa escolher de
  novo nesta sessão.

Usuário real (não demo) mantém o comportamento original — continua
lembrando entre visitas, conveniência legítima pra quando o login gov.br
estiver disponível.

## Decisões tomadas

- Optou-se por diferenciar "escolhido nesta aba" via `sessionStorage`
  em vez de simplesmente desligar a retomada por completo pra sessões
  demo — preserva o atalho "Sua Jornada" na sidebar funcionando
  normalmente durante uma mesma exploração (navegar pra outra
  ferramenta e voltar não reinicia o wizard), só reseta em visitas
  genuinamente novas.
- `handleDemoLogin` continua limpando `siact_jornada` no clique do
  botão — redundante com esta correção, mas inofensivo, e cobre o caso
  de alguém clicar no botão de novo com uma sessão anônima ainda ativa.

## Arquivos afetados

- `src/lib/jornada.ts` — `jornadaAtivaNestaAba()`, `marcarJornadaAtivaNestaAba()`
- `src/pages/Inicio.tsx` — retomada condicionada a `isDemo`/`sessionStorage`
- `src/components/Layout/Sidebar.tsx` — pill e priorização de menu usando a mesma condição
- `Notas/Contrato de Comportamento — Entrada no App.md` (cofre Obsidian) — mapa completo de rotas, 5º mecanismo (`PerfilChooser`), diagrama Mermaid, duas sequências completas, achados de gaps (sem catch-all, sem preservar rota original, etc.)
- `DIARIO-DE-BORDO/REGISTRO-DE-SOLICITACOES.md` — nova entrada + atualização da entrada anterior

## Pendências / próximos passos

- Verificação pré-commit rodada: type-check OK, console limpo (só ruído
  de HMR já documentado), testado ao vivo em desktop e mobile — sessão
  demo nova mostra Passo 1 mesmo com jornada antiga salva; atalho "Sua
  Jornada" continua funcionando dentro da mesma aba.
- Requer novo deploy pra chegar à URL pública.
- Os 4 gaps documentados no Contrato de Comportamento (sem preservar
  rota original ao redirecionar pro login, sem catch-all/404, etc.)
  ficam registrados como fato — não fazem parte do escopo desta correção.
