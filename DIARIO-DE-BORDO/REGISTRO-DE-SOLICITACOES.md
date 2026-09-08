# Registro de Solicitações × Soluções

> Log pesquisável por sintoma relatado pelo usuário — complementa o
> [Diário de Bordo](README.md) (organizado por marco técnico/commit) e
> a nota "Decisões e Trade-offs" do cofre Obsidian, fora deste
> repositório (organizada por "porquê" durável). **Buscar aqui ANTES de
> investigar qualquer relato de bug/ajuste** — ver skill
> `registro-de-solicitacoes`.

## 2026-09-08 — Link direto ia pra landing de marketing, não pro login

- **Sintoma relatado**: usuário passou o link de acesso a um diretor; o
  diretor reportou (via print) que o link "não abriu na tela indicada
  como principal" — abria a landing de marketing em vez do login.
- **Causa raiz**: `PrivateRoute.tsx` redirecionava usuário sem sessão pra
  `/landing` em vez de `/login`.
- **Correção**: commit `754b771` — troca do destino do redirect.
- **Status**: Resolvido.
- **Como diferenciar de relatos parecidos no futuro**: este caso é
  especificamente sobre **não estar logado** (sessão ausente/expirada)
  caindo no lugar errado. Se o usuário JÁ está logado e a reclamação é
  sobre qual TELA aparece depois do login, ver as duas entradas abaixo
  em vez desta.
- **Palavras-chave**: landing, login, redirect, link direto, sem sessão,
  tela errada, página inicial.

## 2026-09-08 — Visitante herdava jornada/perfil sujos + menu sem sincronia com a rota

- **Sintoma relatado**: print mostrando o app aberto num perfil
  "Setorial" com a jornada já avançada, após clicar em "Entrar como
  visitante" — não a tela inicial esperada. Também relatado: o menu
  lateral não destacava nenhum grupo/item, mesmo com uma página real
  aberta.
- **Causa raiz**: `siact_jornada` e `siact_admin_preview_perfil` são
  chaves de `localStorage` **globais** (não por sessão) — um visitante
  novo herdava resíduo de testes/sessões anteriores no mesmo navegador.
  Separadamente, o accordion do menu (`Sidebar.tsx`) só abria por
  clique/hover manual, sem sincronia com `location.pathname`.
- **Correção**: commit `c708674` — limpa as duas chaves antes de
  `signInAnonymously()` em `Login.tsx`; novo `useEffect` em
  `Sidebar.tsx` sincroniza o grupo aberto com a rota atual. Ver
  [Diário 006](2026-09-08-006-fix-visitante-jornada-e-menu-vinculado.md).
- **Status**: Resolvido.
- **Como diferenciar de relatos parecidos no futuro**: este caso é sobre
  um clique NOVO em "Entrar como visitante" não limpando estado antigo.
  Se o usuário está revisitando o MESMO navegador sem clicar em "Entrar
  como visitante" de novo e cai direto em "Ferramentas recomendadas", ver
  a entrada abaixo — é comportamento intencional (Sua Jornada), não este
  bug.
- **Palavras-chave**: visitante, demonstração, jornada suja, perfil
  errado, menu não destaca, menu desvinculado, tela errada ao logar.

## 2026-09-08 — "Sua Jornada" confundida com o bug acima + menu não priorizava o perfil em rotas compartilhadas

- **Sintoma relatado**: novo print mostrando o app na tela "Ferramentas
  recomendadas para você" (perfil Gestor Público, fase Chamamento
  Público) em vez da "tela inicial"; pedido pra verificar também o
  alinhamento geral de menus/botões com as telas do app.
- **Causa raiz**: **não era o mesmo bug da entrada anterior.** É a
  funcionalidade intencional "Sua Jornada" (Pilar 4, `Inicio.tsx`):
  uma vez escolhido perfil+fase, o app lembra essa escolha por navegador
  e pula direto pro Passo 3 em visitas seguintes — confirmado ao vivo que
  um clique NOVO em "Entrar como visitante" ainda cai limpo no Passo 1.
  Achado real e diferente, encontrado durante a checagem ampla: em rotas
  compartilhadas entre OSC e Setorial, o menu sempre abria o grupo OSC
  primeiro, mesmo com "Sua Jornada" indicando outro perfil.
- **Correção**: commit `c87b13d` — menu passa a priorizar o grupo do
  perfil da Jornada quando a rota é ambígua; botão de reset da Jornada
  sempre visível (não só dentro do Passo 3). Ver
  [Diário 008](2026-09-08-008-fix-alinhamento-jornada-reset-visivel.md).
- **Status**: Resolvido (o alinhamento). A persistência "Sua Jornada" em
  si **não é bug** — é comportamento intencional, documentado no
  Contrato de Comportamento — Entrada no App (cofre Obsidian).
  **Atualização no mesmo dia**: o usuário pediu pra reanalisar essa
  mesma persistência sob a ótica de UX pra apresentação à alta gestão —
  ver entrada abaixo, "Entrada previsível pra sessão de demonstração".
- **Como diferenciar de relatos parecidos no futuro**: antes de investigar
  qualquer novo "não abriu na tela inicial", checar primeiro: (1) foi um
  clique NOVO em "Entrar como visitante"? Se sim e ainda cai errado, é
  regressão do bug da entrada anterior. (2) É o MESMO navegador
  revisitando sem novo clique de login? Então "Sua Jornada" pulando pro
  Passo 3 é esperado — oferecer o botão de reset, não tratar como bug.
- **Palavras-chave**: sua jornada, ferramentas recomendadas, passo 3,
  tela inicial, menu não alinhado, menu errado, perfil errado no menu,
  rota compartilhada.

## 2026-09-08 — Entrada previsível pra sessão de demonstração (2º clique = escolha de perfil, sempre)

- **Sintoma relatado**: não foi um bug reportado — o usuário pediu um
  mapeamento completo do fluxo de entrada e, ao analisar as condições,
  registrou que o protótipo existe pra apresentação à alta gestão do
  MGI e precisa de um caminho **fácil e coerente**: no 2º clique
  ("Entrar como visitante" → escolher OSC/Setorial), a pessoa deve
  sempre estar na tela de escolha — não só na primeira vez que alguém
  usa aquele navegador.
- **Causa raiz**: a entrada anterior deste registro já tinha concluído
  que "Sua Jornada" pulando pro Passo 3 **não é bug**, é intencional —
  o que é verdade pro comportamento em si, mas insuficiente pro
  contexto de uma sessão de demonstração/avaliação: `Inicio.tsx` não
  diferenciava "esta aba já escolheu antes, nesta mesma visita" de
  "este navegador tem uma jornada salva de qualquer momento no
  passado" — pra sessão demo, as duas situações resumiam pro Passo 3
  igual, quebrando a previsibilidade pedida.
- **Correção**: novo controle por aba (`sessionStorage`, não
  `localStorage`) em `src/lib/jornada.ts`
  (`jornadaAtivaNestaAba`/`marcarJornadaAtivaNestaAba`) — sessão de
  demonstração (`isDemo`) só retoma o Passo 3 se a escolha foi feita
  NESTA aba; sessão nova (aba nova, link reaberto) sempre mostra o
  Passo 1, mesmo com jornada antiga no `localStorage`. Usuário real
  (não demo) mantém o comportamento original (lembra entre visitas).
  Mesmo controle aplicado ao indicador "Sua Jornada" e à priorização do
  menu na sidebar, pra não mostrar/priorizar por um perfil "esquecido".
  Ver Diário de Bordo (entrada do commit correspondente).
- **Status**: Resolvido.
- **Como diferenciar de relatos parecidos no futuro**: se uma sessão
  demo, numa aba/visita nova, mostrar direto o Passo 3 sem a pessoa ter
  escolhido nada ainda nesta visita, **isso agora é regressão** desta
  correção — antes de 08/09/2026 (tarde) isso seria "não é bug"; depois
  desta entrada, é.
- **Palavras-chave**: previsibilidade, apresentação alta gestão MGI, 2º
  clique, sessão de demonstração, sessionStorage, jornada por aba,
  passo 1 não aparece, isDemo.
