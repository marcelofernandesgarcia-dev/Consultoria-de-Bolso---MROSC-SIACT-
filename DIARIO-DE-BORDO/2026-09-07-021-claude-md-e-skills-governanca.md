---
id: 2026-09-07-021
data: 2026-09-07
titulo: "CLAUDE.md e Skills de governança (diário de bordo + verificação pré-commit)"
tipo: documentacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: ["1c73feb"]
---

## Contexto

Auditoria da configuração do Claude ("Dossiê Claude DTPAR", publicado como
Artifact) identificou que este projeto era o único fora da dupla
`SISTEMA-CONTROLE-OS-ORCAMENTO-DTPAR`/`dashboard DTPAR` com produção real e
diário de bordo já maduro (36+ entradas), mas sem nenhuma governança
versionada em arquivo — regras de comportamento (não fabricar dado,
`adminOnly` cosmético, Claude como motor temporário/destino SERPRO,
lembrete de `git pull` no Cloud Shell) existiam só na memória de sessão do
Claude, não visíveis a quem mais abrisse o repositório.

## O que foi feito

Criado `CLAUDE.md` na raiz do repositório e duas Skills em
`.claude/skills/`, replicando o padrão já em uso nos repositórios irmãos
DTPAR (criado lá em 10/08/2026), adaptado à realidade deste projeto:

- `CLAUDE.md`: regra de não fabricar dado, diário de bordo obrigatório,
  checklist pré-commit, ações que exigem confirmação explícita (deploy via
  Cloud Shell, RLS do Supabase, `adminOnly`, "finalizar" a integração
  Claude), separação de conformidade IA individual vs. institucional,
  referência à vulnerabilidade `xlsx` já triada, e ponteiro para o cofre
  Obsidian "Cerebro" como fonte de estado do projeto.
- Skill `diario-de-bordo` (v1.0.0): mesmo processo de 5 fases do projeto
  irmão, sem a fase de referência cruzada (este projeto é independente,
  sem repositório irmão) e sem `indice.json` (só `README.md`).
- Skill `verificacao-pre-commit` (v1.0.0): adaptada para pacote único
  (`npm run lint` em vez de type-check separado de `api/`+`web/`), com
  fase de conferência de dado real contra Supabase/endpoints de sync
  (`/api/sync/mapa-osc`, `/api/sync/areas`) em vez do banco Prisma do
  Sistema DTPAR.

## Decisões tomadas

Não recriar do zero — todas as regras novas já estavam documentadas em
memória de sessão (`project_siact_mrosc_consultoria_bolso`,
`project_siact_mrosc_xlsx_vuln_triagem`) ou no cofre Obsidian; o trabalho
foi formalizar o que já era prática real, não inventar processo novo.

## Arquivos afetados

- `CLAUDE.md` — novo
- `.claude/skills/diario-de-bordo/SKILL.md` — novo
- `.claude/skills/verificacao-pre-commit/SKILL.md` — novo

## Pendências / próximos passos

Recomendação 05 do dossiê: aplicar o mesmo padrão a `tcu-bap-landing`
(SIACT Analisador) e `GESTAO-DE-PARCERIAS-TRANSFEREGOV` — ambos processam
dado sensível e hoje não têm nenhuma governança versionada.
