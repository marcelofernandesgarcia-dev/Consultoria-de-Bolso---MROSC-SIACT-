---
id: 2026-09-06-003
data: 2026-09-06
titulo: "Acesso de demonstração via login anônimo do Supabase"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [8e5f25d]
---

## Contexto

O produto está em fase de protótipo, aguardando decisão de gestores sobre
adoção em produção e uso em escala. O login real é só-por-convite
(`signInWithOtp({ shouldCreateUser: false })`) e o Supabase gratuito limita a
2 e-mails de autenticação por hora — juntos, isso tornava inviável dar acesso
rápido a quem for avaliar o protótipo (inclusive interessados fora do
cadastro atual). Pedido explícito: acesso deve ser simulado e não
obrigatório enquanto o app estiver em fase de aprovação.

## O que foi feito

Adicionado um botão "Entrar como visitante (demonstração)" na tela de login,
usando `supabase.auth.signInAnonymously()` — gera uma sessão real e assinada
pelo Supabase, sem exigir e-mail nem cadastro prévio. `Layout.tsx` passou a
exibir uma faixa fixa "AMBIENTE DE DEMONSTRAÇÃO — protótipo em construção e
aprovação" sempre que `user.is_anonymous` for verdadeiro.

## Decisões tomadas

Avaliadas duas abordagens:

1. **Login anônimo do Supabase (escolhida)** — sessão real, token JWT válido;
   nenhuma mudança necessária no backend, já que `getAuthUser()` em
   `server.ts` só verifica se o token é válido, sem distinguir usuário
   anônimo de cadastrado. Reversível com um clique (desativar "Anonymous
   Sign-Ins" no painel do Supabase) quando a fase de aprovação terminar.
2. **Bypass direto no `PrivateRoute.tsx`** — descartada. Livraria a
   navegação da UI, mas as chamadas de IA (`/api/mrosc/edital-explicar` e
   afins) continuariam recebendo 401 do backend, já que sem sessão nenhuma o
   `apiFetch.ts` nem envia o cabeçalho `Authorization`. Reproduziria o mesmo
   bug que motivou toda a investigação desta sessão.

## Arquivos afetados

- `src/pages/Login.tsx` — botão de visitante + `handleDemoLogin`
- `src/components/Layout/Layout.tsx` — faixa "AMBIENTE DE DEMONSTRAÇÃO"

## Pendências / próximos passos

Requer habilitar manualmente "Anonymous Sign-Ins" no painel do Supabase
(Authentication → Sign In / Providers) — ação de configuração, não de
código. Ativado nesta mesma sessão. A ativação revelou mais dois problemas
de infraestrutura pré-existentes (CSP e chaves do Supabase desatualizadas),
documentados nas entradas seguintes.
