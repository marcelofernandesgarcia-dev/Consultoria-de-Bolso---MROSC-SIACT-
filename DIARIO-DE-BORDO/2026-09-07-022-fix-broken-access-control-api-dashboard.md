---
id: 2026-09-07-022
data: 2026-09-07
titulo: "Corrige broken access control em /api/dashboard — vazava dado entre usuários"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: ["cf928ef"]
---

## Contexto

Item 7 do "Dossiê Claude DTPAR" (rodar `security-review` antes de deploy de
produção). Ao revisar as mudanças não commitadas do repositório (novos
componentes React em `src/components/`), o security-review não encontrou
vulnerabilidade nos arquivos novos, mas identificou — como achado colateral,
ao investigar por que um dos componentes novos chamava a API sem o wrapper de
autenticação — que o endpoint já existente `GET /api/dashboard`
(`server.ts`) tinha uma falha real e ativa em produção.

## O que foi feito

Confirmado por leitura direta de `server.ts`: `getAuthUser(req)` retorna
`null` (não lança erro) quando não há token ou o token é inválido, e o
endpoint `/api/dashboard` montava o filtro de consulta como `userId ?
q.eq('user_id', userId) : q` — sem `userId`, nenhum filtro era aplicado,
e a consulta rodava sem restrição sobre toda a tabela `analysis_history`.
Diferente de **todos os outros 8 endpoints autenticados** do arquivo, que
já retornavam `401` quando `userId` é nulo, só este não fazia essa checagem.

Corrigido movendo a checagem `if (!userId) return res.status(401)...` para
antes do `try`, no mesmo padrão dos outros 8 endpoints, e simplificando
`base(q)` para sempre aplicar `.eq('user_id', userId)` (já não precisa mais
do caminho sem filtro).

## Decisões tomadas

Reportado ao usuário mesmo estando fora do escopo estrito do diff revisado
(o arquivo `server.ts` já estava commitado, não fazia parte das mudanças
pendentes) — decisão de priorizar severidade real sobre escopo técnico da
revisão, dado que o endpoint está ativo em produção e exposto pelo
componente já roteado `src/pages/Dashboard.tsx`.

## Verificação

- `npm run lint` (`tsc --noEmit`): zero erros.
- `curl http://localhost:3000/api/dashboard` sem token: antes retornava
  `200` com estatísticas agregadas e os 5 registros mais recentes de
  **todos os usuários**; depois da correção retorna `401 {"error":"Não
  autenticado"}`.
- Aba nova do navegador, app carregando normalmente, console limpo — sem
  regressão visual (mudança é só backend).

## Arquivos afetados

- `server.ts` — endpoint `GET /api/dashboard` (linhas ~245-249)

## Pendências / próximos passos

Nenhuma nova. As mudanças não commitadas de `src/components/` (novos
componentes de dashboard/help/MROSC) seguem como estavam — não fazem parte
deste marco, revisão delas mostrou nenhuma vulnerabilidade nova.
