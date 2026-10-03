---
id: 2026-10-03-001
data: 2026-10-03
titulo: "Skills diario-de-bordo e verificacao-pre-commit passam a núcleo geral com parâmetros locais"
tipo: documentacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

As skills `diario-de-bordo` e `verificacao-pre-commit` existiam como cópias divergentes em 5 repositórios (SHA-256 todos diferentes). O usuário aprovou a proposta de núcleo comum com parâmetros mantidos em cada projeto ("EXECUTE AS PENDÊNCIAS", "PROSSIGA EM TODAS AS ETAPAS", 03/10/2026).

## O que foi feito

- Núcleo comum (versão 2.0.0, modelo de 6 blocos) instalado em `~/.claude/skills/diario-de-bordo/` e `~/.claude/skills/verificacao-pre-commit/`; versionado no repositório privado `claude-skills-transversais`.
- As cópias locais `SKILL.md` deste repositório foram retiradas (continuam no histórico do Git).
- Tudo que era próprio deste repositório foi para `projeto.md` em cada pasta de skill: índice só `README.md` (sem `indice.json`), numeração por data, servidor `consultoria-de-bolso-mrosc`:3000, `npm run lint`, mobile sempre com viés positivo, conferência de dado real no Supabase/Mapa OSC e o achado do clique travado pelo HMR.

## Decisões tomadas

- Troca em um único passo, para não haver duas versões com o mesmo nome ativas ao mesmo tempo.
- O núcleo para e pergunta se faltar `projeto.md`: parâmetro de um repositório nunca é presumido a partir de outro.
- Lembrete de deploy: o núcleo remete ao `CLAUDE.md`, que é a regra vigente (a cópia antiga ainda falava em `git pull` no Cloud Shell, superado em 07/09/2026).

## Arquivos afetados

- `.claude/skills/diario-de-bordo/SKILL.md` — removido (núcleo geral)
- `.claude/skills/diario-de-bordo/projeto.md` — novo
- `.claude/skills/verificacao-pre-commit/SKILL.md` — removido (núcleo geral)
- `.claude/skills/verificacao-pre-commit/projeto.md` — novo

## Pendências / próximos passos

Na próxima sessão neste repositório, confirmar que as duas skills gerais leem o `projeto.md` daqui.
