---
id: 2026-09-08-006
data: 2026-09-08
titulo: "Corrige tela errada pro visitante e menu desvinculado da tela atual"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário reportou, depois de passar o link ao diretor e ele mesmo
reconferir, dois problemas: (1) após clicar em "Entrar como visitante",
o app abria numa tela diferente da "tela inicial já determinada" — no
print enviado, aparecia preso em perfil "Setorial" com a jornada já
avançada na fase 3, em vez da tela real de seleção "Quem é você nesta
parceria?"; (2) o menu lateral não corresponde à tela aberta — nenhum
grupo/item aparece destacado, mesmo estando numa página real do sistema.

## O que foi feito

Investigação confirmou duas causas distintas, ambas verificadas ao vivo
antes de corrigir:

**Causa 1** — `siact_jornada` (`src/lib/jornada.ts`) e
`siact_admin_preview_perfil` (`src/contexts/AuthContext.tsx`) são chaves
de `localStorage` globais, não vinculadas a cada sessão/usuário. Um novo
visitante de demonstração herda o que a sessão anterior no mesmo
navegador deixou salvo — no caso relatado, resíduo dos meus próprios
testes anteriores nesta sessão de trabalho.

**Causa 2** — o accordion do menu lateral (`Sidebar.tsx`) só abria por
clique/hover manual (`pinnedGroup`), sem nenhuma sincronização com a
rota atual (`location.pathname`). Testado ao vivo: entrando direto em
`/normas` ou `/parecer`, todos os grupos apareciam fechados, sem item
algum destacado.

**Correções**:
- `JORNADA_KEY` e `PREVIEW_KEY` exportados (antes eram `const` privadas).
- `Login.tsx`, `handleDemoLogin`: limpa as duas chaves antes de chamar
  `signInAnonymously()`, e navega direto para `/inicio` (em vez de `/`,
  evitando um hop de redirecionamento a menos).
- `Sidebar.tsx`: novo `useEffect` que, a cada troca de rota
  (`location.pathname`) ou de `perfilVisivel`, encontra o grupo dono da
  rota atual e chama `setPinnedGroup` — abre e destaca sozinho o item
  certo, não importa por qual caminho o usuário chegou na tela (card,
  link direto, F5, voltar do navegador).

## Decisões tomadas

- Não reiniciei `siact_capacitacao_progresso` (progresso da trilha de
  capacitação) — é o mesmo tipo de chave global, mas não foi reportado
  como problema e o impacto de herdar progresso de curso entre visitantes
  é baixo; mantido fora do escopo desta correção.
- Quando a rota é compartilhada entre grupos (perfil "Tudo", ex. Mapa
  OSC aparece em OSC e Setorial), o `useEffect` destaca o primeiro grupo
  da lista que contém a rota (`OSC`, por ordem de declaração em
  `nav.ts`) — comportamento determinístico, não tratado como bug.

## Arquivos afetados

- `src/lib/jornada.ts` — `JORNADA_KEY` exportada
- `src/contexts/AuthContext.tsx` — `PREVIEW_KEY` exportada
- `src/pages/Login.tsx` — limpeza das duas chaves em `handleDemoLogin`,
  navegação direta pra `/inicio`
- `src/components/Layout/Sidebar.tsx` — novo `useEffect` de sincronização
  menu ↔ rota atual

## Pendências / próximos passos

- Verificação pré-commit rodada (skill `verificacao-pre-commit`):
  type-check OK, console limpo (só ruído de HMR do Vite), testado ao
  vivo: navegação direta em `/normas` e `/parecer` abre e destaca o
  grupo/item certo sozinho; "Entrar como visitante" com jornada/perfil
  sujos simulados via `localStorage` caiu limpo em "Quem é você nesta
  parceria?", confirmado com `localStorage.getItem` retornando `null`
  pras duas chaves.
- Requer novo deploy pra chegar à URL pública.
