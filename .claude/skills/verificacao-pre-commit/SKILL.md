---
name: verificacao-pre-commit
version: 1.0.0
description: Checklist de verificação a rodar antes de commitar qualquer mudança de código neste projeto (pacote único, server.ts + Vite) — type-check e checagem visual em aba nova do navegador. Use sempre que uma mudança de código estiver pronta para revisão final.
---

# SKILL: Verificação Pré-Commit (MROSC - Guia de Bolso / SIACT)

## 1. OBJETIVO
Confirmar, de forma padronizada e imutável, que uma mudança de código
está tecnicamente correta e visualmente verificada antes de ser
commitada — sem depender de julgamento caso a caso sobre o que checar.

## 2. ENTRADAS OBRIGATÓRIAS (INPUTS)
- A mudança é visual/de UI? sim/não (define se a Fase 3 é obrigatória).
  **Viés positivo obrigatório**: qualquer mudança em componente `.tsx`
  que renderiza algo (mesmo mudança de lógica/estado por trás, tipo um
  `useEffect` que altera o que aparece na tela) conta como "sim" — nunca
  decidir "é só lógica, não precisa checar mobile" por conta própria
  (instrução explícita do usuário, 08/09/2026, depois de um caso em que
  isso não foi verificado de saída).
- A mudança envolve edital, prazo, valor de repasse ou qualquer dado
  vindo do Supabase/Mapa OSC exibido na tela? sim/não (define se a Fase 4
  é obrigatória).
- Servidor de dev já está rodando (`consultoria-de-bolso-mrosc`:3000)?
  sim/não.

## 3. PROCESSO DE EXECUÇÃO (PASSO A PASSO OBRIGATÓRIO)

### Fase 1: Type-check
- `npm run lint` (equivale a `tsc --noEmit`, pacote único — não há split
  `api/`+`web/` como no Sistema DTPAR).
- Critério de aprovação: zero erros. Não prosseguir se falhar.

### Fase 2: Checagem visual em aba nova
- Garantir servidor rodando (`preview_start` com a configuração
  `consultoria-de-bolso-mrosc` de `.claude/launch.json` se necessário).
- Abrir **aba nova** do navegador — nunca reaproveitar aba com histórico
  de hot-reload (mesmo cuidado documentado no projeto irmão: erro
  transiente de HMR/cold-start em aba antiga pode não refletir o estado
  real do código).
- `read_console_messages` (`onlyErrors: true`) — deve voltar vazio.
- `get_page_text`/`read_page` para confirmar o conteúdo renderizado.

### Fase 3: Checagem mobile (obrigatória — ver viés positivo acima)
- `resize_window` preset `mobile`, recarregar.
- Confirmar que `document.body.scrollWidth` não excede a largura do
  viewport (sem rolagem horizontal).
- Se a mudança tem comportamento específico do mobile (ex.: drawer do
  menu, hambúrguer), testar a interação de verdade, não só olhar o
  layout estático.
- **Achado operacional**: depois de muito tempo de servidor de dev
  rodando, `computer{action:"left_click"}` pode travar (timeout) — sintoma
  observado: acúmulo de tentativas de reconexão WebSocket do HMR do Vite
  no console. Não indica bug no app. Contorno: disparar o clique via
  `javascript_tool` (`document.querySelector(seletor)?.click()`).

### Fase 4: Conferência de dado real (só se INPUT "envolve dado
Supabase/Mapa OSC" = sim)
- Consultar o Supabase real (projeto `clsuturkoripoingjqpw`) ou rodar os
  endpoints `/api/sync/mapa-osc` / `/api/sync/areas` (exigem
  `SYNC_SECRET` via Bearer) e comparar com o que a tela mostra — nunca
  assumir que o valor exibido está correto sem essa conferência.

## 4. FORMATO DE SAÍDA EXIGIDO (OUTPUT)

**Verificação pré-commit**
- Type-check: OK / FALHOU (detalhe)
- Console (aba nova): limpo / X erro(s) (detalhe)
- Mobile: OK / não se aplica
- Dado real conferido: OK (valor confere) / não se aplica
- Pronto para commit: sim / não (motivo)

## 5. REFERÊNCIAS DO PROJETO
- `.claude/launch.json` — porta do servidor de dev (3000).
- `CLAUDE.md` — regra de não fabricar dado, regras de deploy Cloud Run.
