---
id: 2026-09-07-021
data: 2026-09-07
titulo: "Marca no Roadmap a tarefa da AIE, já executada duas vezes, como concluída"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário pediu pra voltar a olhar o Roadmap geral do app e acessou o sistema como
visitante de demonstração pra revisar. Ao inspecionar a Fase 1 (Governança da
Inteligência Artificial), a tarefa "Executar o Framework de Autoavaliação de
Impacto Ético em IA (AIE) do Núcleo de IA/SGD" ainda aparecia como pendente
(`done: false`, selo de dificuldade "Baixa" visível) — mesmo já tendo sido
executada duas vezes nesta mesma semana (resultado real: 34,6% → 46,9%,
documentado no dossiê "Conformidade de IA — SIACT-MROSC" e no Diário de Bordo,
ver [2026-09-07-015](2026-09-07-015-marco-conformidade-aie-plano-ajustes.md)).

## O que foi feito

`src/pages/Roadmap.tsx` — trocado `done: false` para `done: true` na tarefa da
AIE (Fase 1, item 8/8 do checklist). Nenhuma outra mudança de texto ou estrutura.

## Decisões tomadas

Nenhuma alternativa considerada — correção pontual de um dado que já estava
desatualizado em relação ao estado real do projeto, mesma classe de cuidado já
aplicada a outras correções de precisão do Arquitetura/Roadmap.

## Arquivos afetados

- `src/pages/Roadmap.tsx` — campo `done` da tarefa de execução da AIE (Fase 1)

## Pendências / próximos passos

- Requer novo deploy pra chegar à URL pública (só está em `main` no GitHub até
  aqui) — lembrar `git pull` no Cloud Shell antes de `gcloud builds submit`.
- Verificação pré-commit rodada (skill `verificacao-pre-commit`): type-check OK,
  console limpo em aba nova, sem regressão mobile causada por esta mudança —
  achado um overflow horizontal de 41px pré-existente no cabeçalho hero do
  Roadmap (`px-8` fixo), não relacionado a esta correção, registrado aqui como
  observação técnica pra uma próxima entrada, não corrigido nesta.
