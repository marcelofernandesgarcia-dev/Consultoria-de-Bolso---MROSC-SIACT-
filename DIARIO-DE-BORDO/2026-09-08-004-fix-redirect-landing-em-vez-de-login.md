---
id: 2026-09-08-004
data: 2026-09-08
titulo: "Corrige redirecionamento sem sessão — ia para landing de marketing em vez do login"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário ia passar o link de acesso ao aplicativo (`/inicio`, conforme regra
já registrada de sempre usar essa rota) a um diretor, e relatou que a tela
que abriu não era a solicitada como principal. Reproduzido o problema numa
aba com sessão local limpa (`localStorage.clear()` + reload), simulando
exatamente o que um visitante novo veria: o link `/inicio` redirecionava
para `/landing` (a página de marketing institucional), não para `/login`
(a tela de acesso, onde fica "Entrar como visitante").

## O que foi feito

`PrivateRoute.tsx`: o redirecionamento de usuário não-autenticado em
produção (`!user && import.meta.env.PROD`) trocado de `/landing` para
`/login`. Quem clica num link direto pro app sem sessão ativa agora cai
direto na tela de acesso — um passo mais perto do sistema de verdade —
em vez de passar primeiro pela página de apresentação institucional.

## Decisões tomadas

- Nenhuma alternativa considerada — correção pontual e direta do
  destino do redirect, sem mudança de lógica adicional.
- `/landing` continua existindo e acessível por link direto ou pelos
  botões "Acessar o sistema"/"Ver funcionalidades" — só deixou de ser o
  destino automático de quem tenta entrar sem sessão.

## Arquivos afetados

- `src/components/PrivateRoute.tsx` — destino do `<Navigate>` para
  usuário não-autenticado em produção

## Pendências / próximos passos

- Comportamento é `PROD`-only (`import.meta.env.PROD`) — não é
  exercitado pelo servidor de desenvolvimento (`npm run dev`). Type-check
  e console limpo verificados em dev; o redirecionamento real só é
  testável em produção, após o deploy.
- Requer novo deploy pra chegar à URL pública antes de reenviar o link ao
  diretor.
