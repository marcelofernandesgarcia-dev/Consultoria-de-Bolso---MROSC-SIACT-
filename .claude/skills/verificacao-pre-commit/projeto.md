# Parâmetros da Verificação Pré-Commit — MROSC - Guia de Bolso (SIACT)

Lido pela skill geral `verificacao-pre-commit` (núcleo comum, `~/.claude/skills/`). Só vale neste repositório.

- **Build/type-check:** `npm run lint` (equivale a `tsc --noEmit`; pacote único — não há split `api/`+`web/`). Zero erros.
- **Testes:** não declarados.
- **Servir:** `preview_start` com a configuração `consultoria-de-bolso-mrosc` de `.claude/launch.json` (porta 3000).
- **Mobile:** **sempre** para qualquer mudança de UI, com **viés positivo**: qualquer mudança em componente `.tsx` que renderiza algo (mesmo lógica/estado por trás, ex.: `useEffect` que altera a tela) conta como UI (instrução do usuário, 08/09/2026).
- **Conferências específicas:**
  - *Dado real* — gatilho: a mudança envolve edital, prazo, valor de repasse ou dado vindo do Supabase/Mapa OSC exibido na tela? Conferir no Supabase real (projeto `clsuturkoripoingjqpw`) ou pelos endpoints `/api/sync/mapa-osc` / `/api/sync/areas` (exigem `SYNC_SECRET` via Bearer) e comparar com a tela.
- **Achados operacionais:** com o servidor de dev rodando por muito tempo, `computer{action:"left_click"}` pode travar (acúmulo de reconexões WebSocket do HMR do Vite); não é bug do app. Contorno: clicar via `javascript_tool` (`document.querySelector(seletor)?.click()`).
