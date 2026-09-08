---
id: 2026-09-08-008
data: 2026-09-08
titulo: "Alinha menu ao perfil da Jornada em rotas compartilhadas + reset sempre visível"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [c87b13d]
---

## Contexto

Usuário enviou print mostrando o app aberto direto na tela "Ferramentas
recomendadas para você" (Passo 3 do assistente "Por onde começar", perfil
Gestor Público, fase Chamamento Público), perguntando por que a "tela
inicial" não estava sendo apresentada, além de pedir uma checagem mais
ampla do alinhamento entre menu/botões e as telas do aplicativo.

## O que foi feito

Investigação ao vivo em produção, sem mexer em código antes de entender
a causa (testes reproduzidos em `https://siact-mrosc-...run.app`):

- Confirmado que **não é o bug já corrigido nas entradas 006/007**: um
  clique novo em "Entrar como visitante", com `localStorage` limpo,
  ainda abre corretamente no Passo 1 ("Quem é você nesta parceria?").
- A tela do print é a funcionalidade intencional **"Sua Jornada"**
  (`src/pages/Inicio.tsx`, Pilar 4 do produto): uma vez escolhido
  perfil + fase, o app memoriza a escolha (`localStorage: siact_jornada`)
  e qualquer visita seguinte no mesmo navegador — F5, reabrir aba,
  reabrir o link sem clicar de novo em "Entrar como visitante" — pula
  direto pro Passo 3. Reproduzido ao vivo escolhendo "Gestor Público" →
  "Chamamento Público" e recarregando a página: o comportamento é
  determinístico e por design, não um defeito.
- Checagem ampla de alinhamento menu ↔ tela em rotas além das duas
  testadas nas entradas anteriores (`/roadmap`, `/dashboard`, `/normas`)
  confirmou que a correção de vínculo menu-rota (entrada 006) segue
  válida de forma geral.
- **Achado real durante a checagem**: em rotas compartilhadas entre OSC
  e Setorial (Radar Normativo, Mapa OSC, Governança, Cotação Prévia,
  Nexo Causal), com "Visualizar como: Tudo" ativo, o menu sempre abria o
  grupo **OSC** — mesmo com a etiqueta "Sua Jornada" acima indicando
  "Gestor Público". Inconsistência visual real, não notada antes porque
  nunca tinha sido comparada lado a lado com o rótulo da Jornada.

Apresentadas as duas questões ao usuário via pergunta estruturada antes
de alterar código (regra "Plano antes de agir"). Decisões do usuário:
manter a memória da Jornada, mas com reset mais visível; e corrigir o
alinhamento priorizando o perfil da Jornada.

**Correções em `src/components/Layout/Sidebar.tsx`**:
- `useEffect` de vínculo menu↔rota: quando a rota pertence a mais de um
  grupo (`gruposDaRota.length > 1`), prioriza o grupo cujo id corresponde
  ao perfil da Jornada (`gestor` → `setorial`, `osc` → `osc`) antes de
  cair no default (primeiro grupo da lista, ordem do `nav.ts`).
- Indicador "Sua Jornada" (pill) ganhou um botão de reset ao lado
  (ícone `RotateCcw`, `aria-label="Recomeçar jornada"`) — chama
  `saveJornada(null, null)`, atualiza o estado local e navega pra
  `/inicio`, sem precisar entrar em `/inicio` e rolar até o botão
  "Recomeçar o guia" que já existia dentro do Passo 3.

## Decisões tomadas

- A persistência da Jornada em si **não foi alterada** — continua sendo
  a mesma chave global `siact_jornada` por navegador/dispositivo, não
  por sessão de usuário. Só ficou mais fácil de resetar manualmente.
- A priorização por perfil da Jornada só entra em jogo quando a rota é
  ambígua (mais de um grupo visível contém o item) — se só um grupo é
  visível (perfil já filtrado por "Visualizar como" ou por conta real),
  o comportamento não muda.

## Arquivos afetados

- `src/components/Layout/Sidebar.tsx` — `useEffect` de vínculo menu↔rota
  com priorização por perfil da Jornada; botão de reset ao lado do
  indicador "Sua Jornada"; import de `useNavigate`, `RotateCcw` e
  `saveJornada`.

## Pendências / próximos passos

- Verificação pré-commit rodada: type-check OK, console limpo (só ruído
  de HMR já documentado), testado ao vivo em desktop **e** mobile
  (drawer) — reset funcionando nos dois, alinhamento corrigido
  confirmado em `/normas` com Jornada "Gestor Público" abrindo o grupo
  Setorial.
- Commit feito (`c87b13d`), **push ainda pendente** de confirmação
  explícita do usuário.
- Requer novo deploy pra chegar à URL pública.
