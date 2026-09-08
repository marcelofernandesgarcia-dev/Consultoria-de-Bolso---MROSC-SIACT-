---
id: 2026-09-08-001
data: 2026-09-08
titulo: "Salvar/abrir/excluir cotações prévias — tela sempre pronta pra nova consulta"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário apontou um problema real de UX na Cotação Prévia: só existia um
rascunho único (`localStorage`), que se autosalvava a cada tecla e
recarregava sozinho toda vez que a tela abria — nunca ficava "zerada" pra
uma nova consulta a menos que o usuário lembrasse de clicar em "Nova
cotação" manualmente. Pedido: um botão de salvar, e a tela sempre pronta
pra nova consulta ao entrar. Confirmado que a solução vale igualmente
pra OSC e Setorial (ferramenta já compartilhada nos dois perfis).

Apresentado plano com duas opções de onde persistir as cotações salvas
(Supabase vs. localStorage) — usuário escolheu localStorage, mesmo
mecanismo já usado hoje, sem mudança de backend.

## O que foi feito

`CotacaoPrevia.tsx`:
- Removido o rascunho único autosalvo (`siact_cotacao_rascunho`). A tela
  agora **sempre** abre com um item em branco — sem autocarregamento.
- Novo modelo: `siact_cotacoes_salvas` no localStorage, uma lista de
  `{ id, titulo, criadoEm, atualizadoEm, itens }`.
- Botão **"Salvar Cotação"** — nomeia automaticamente ("Cotação de
  DD/MM/AAAA, N itens") e grava. Se a cotação atual já tinha sido
  salva/aberta antes, salvar de novo **atualiza** a mesma entrada em vez
  de criar uma duplicata (rastreado por `cotacaoAtualId`).
- Botão **"Cotações Salvas (N)"** — dropdown com as cotações já salvas
  (nome + data + nº de itens), permite abrir uma (substitui os itens da
  tela atual) ou excluir.
- Legenda abaixo do título "Itens Orçamentários" indica se a cotação
  atual está vinculada a uma salva ("vinculada a...") ou ainda não
  ("ainda não salva").

## Decisões tomadas

- localStorage (não Supabase) — decisão explícita do usuário, trade-off
  aceito: cotações salvas ficam só naquele navegador/computador, não
  atravessam dispositivos. Mais rápido de entregar, consistente com o
  mecanismo já usado no projeto.
- Nomeação automática da cotação salva (sem pedir título ao usuário) —
  evita um modal/prompt extra; título pode ganhar edição manual depois,
  se fizer falta.
- "Nova cotação" e a troca de tela **não perguntam** se o usuário quer
  salvar antes de perder o que não foi salvo — troca consciente pedida
  pelo usuário (tela sempre pronta), sem aviso de confirmação nesta
  rodada.

## Arquivos afetados

- `src/pages/CotacaoPrevia.tsx` — estado/lógica de cotações salvas, novos
  botões "Salvar Cotação" e "Cotações Salvas", remoção do rascunho único

## Pendências / próximos passos

- Verificação pré-commit rodada (skill `verificacao-pre-commit`):
  type-check OK, console limpo em aba nova, testado ao vivo o ciclo
  completo (salvar → nova cotação zera → lista mostra salva → reabrir
  restaura os itens → excluir remove da lista), confirmado que recarregar
  a tela sempre abre em branco mesmo com cotação salva existente. Sem
  overflow mobile (375px), botões bem organizados em coluna.
- Fora do escopo desta rodada (registrado explicitamente com o usuário):
  renomear uma cotação já salva, indicador de "alterações não salvas", e
  aviso ao tentar sair da página sem salvar.
- Requer novo deploy pra chegar à URL pública.
