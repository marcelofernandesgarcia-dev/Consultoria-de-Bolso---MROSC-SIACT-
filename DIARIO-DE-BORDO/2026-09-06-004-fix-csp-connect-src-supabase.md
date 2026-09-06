---
id: 2026-09-06-004
data: 2026-09-06
titulo: "Corrige CSP em produção — connect-src bloqueava chamadas ao Supabase"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [1d04a62]
---

## Contexto

Depois de habilitar o login anônimo ([2026-09-06-003](2026-09-06-003-acesso-demonstracao-login-anonimo.md))
e publicar o novo build, o clique em "Entrar como visitante" falhava com
`Failed to fetch` e um erro de CSP no console do navegador.

## O que foi feito

O `Content-Security-Policy` configurado via `helmet` em `server.ts`
restringia `connect-src` a `'self'` — mas o `supabase-js` faz chamadas
diretas do navegador para `https://<projeto>.supabase.co` (auth, REST),
sem passar pelo backend Express. Qualquer chamada real ao Supabase — login
por senha, magic link ou o novo login anônimo — estava bloqueada desde que
essa CSP existe (introduzida em sessão anterior, nunca exercitada de fato
até este teste).

`connectSrc` agora inclui a URL do Supabase, lida em runtime de
`VITE_SUPABASE_URL`/`SUPABASE_URL`.

## Decisões tomadas

Liberar só a origem exata do Supabase (não um wildcard) — mantém a política
restritiva nas demais diretivas, alinhado à prática de segurança já adotada
no restante da CSP.

## Arquivos afetados

- `server.ts` — `connectSrc` no bloco `contentSecurityPolicy`

## Pendências / próximos passos

Corrigido isso, o login anônimo ainda falhou (agora com `Invalid API key`) —
motivo de um problema totalmente diferente, documentado nas entradas
seguintes (chaves do Supabase desatualizadas).
