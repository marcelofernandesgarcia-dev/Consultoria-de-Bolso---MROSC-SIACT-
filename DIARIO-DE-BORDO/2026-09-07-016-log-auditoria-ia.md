---
id: 2026-09-07-016
data: 2026-09-07
titulo: "Log de auditoria de IA — grupo 'ajustável agora' do plano de ajustes de conformidade"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Primeiro item implementado do grupo "ajustável agora, por conta própria" do
plano de ajustes de conformidade (ver
[2026-09-07-015](2026-09-07-015-marco-conformidade-aie-plano-ajustes.md)):
log completo de auditoria por análise de IA — o item que fecha a lacuna de
"Responsabilização e Reparação" e "Ciclo de Vida da IA" na autoavaliação
AIE, e dá ao canal de contestação da página `/privacidade` (M.14) algo
concreto para consultar quando uma contestação chegar.

## O que foi feito

Levantamento prévio mostrou que já existia uma tabela `analysis_history`
que o endpoint `/api/analyze-mrosc` (as 15 análises com veredito
CONFORME/RESSALVA/NAO_CONFORME) já grava — e que essa mesma tabela
alimenta o Dashboard (score de conformidade, gráfico de pizza) e o
`/api/admin/stats`. Os outros 3 endpoints que também chamam a IA
(`/api/mrosc/edital-explicar`, `/api/analyze`, `/api/chat`) não gravavam
nada.

Decisão de não gravar esses 3 direto em `analysis_history`: eles não têm
veredito de 3 vias, e misturá-los quebraria a matemática do score de
conformidade do Dashboard (o `total` deixaria de bater com a soma de
CONFORME + RESSALVA + NAO_CONFORME) — métrica visível na apresentação ao
MGI.

Criada tabela nova e independente, `ai_audit_log`
(`supabase/migrations/002_ai_audit_log.sql`), com RLS habilitado e sem
policy pra nenhum papel além de `service_role` — só o backend grava, e
nenhum cliente autenticado direto no Supabase consegue ler. Colunas:
`endpoint`, `analysis_type`, `user_id`, `input_excerpt` e `output_excerpt`
(ambos truncados a ~4.000 caracteres via `truncateForAudit()`), `created_at`.

`server.ts` ganhou a função `logAiInteraction()` (não-bloqueante — falha no
log nunca derruba a resposta já concluída ao usuário, só vira
`console.error`, mesmo padrão já usado pra `analysis_history`), chamada
nos 4 endpoints que usam a IA: `/api/analyze-mrosc`, `/api/analyze`,
`/api/mrosc/edital-explicar` e `/api/chat` — um único lugar canônico com
toda interação de IA do sistema, mesmo as que já eram gravadas em
`analysis_history` por outro motivo.

`Privacidade.tsx` atualizada: seção "Retenção e compartilhamento" agora
cita o log de auditoria explicitamente (o que ele grava, e por quê), e a
seção "Contestar uma análise de IA" referencia esse log como o que permite
cruzar uma contestação com o que a IA realmente recebeu e respondeu.

## Decisões tomadas

- Tabela separada (`ai_audit_log`) em vez de estender `analysis_history` —
  evita contaminar uma métrica já exibida no Dashboard/apresentação.
- Trechos truncados a ~4.000 caracteres (não o conteúdo completo) — mantém
  o log útil para investigar uma contestação sem deixar a tabela crescer
  sem controle; para `/api/analyze` com imagens (upload de PDF convertido
  em imagem), o log registra só a contagem de imagens, não o binário.
- Nenhuma tela nova de visualização do log — fora do escopo "ajustável
  agora, baixo esforço" definido no plano de ajustes. Consulta é via SQL
  Editor/Table Editor do Supabase, que o usuário já acessa como
  desenvolvedor do projeto.
- `analysis_history` não foi tocada — Dashboard, gráfico de conformidade e
  `/api/admin/stats` continuam exatamente como estavam.

## Arquivos afetados

- `supabase/migrations/002_ai_audit_log.sql` (novo) — schema da tabela, a
  ser executado manualmente no SQL Editor do Supabase (pendência abaixo).
- `server.ts` — funções `truncateForAudit()` e `logAiInteraction()`; chamada
  adicionada nos 4 endpoints de IA.
- `src/pages/Privacidade.tsx` — menção ao log de auditoria nas seções
  "Retenção e compartilhamento" e "Contestar uma análise de IA".

## Pendências / próximos passos

- **Executar `supabase/migrations/002_ai_audit_log.sql` no Supabase antes
  do próximo deploy** — sem a tabela existir, `logAiInteraction()` vai
  falhar silenciosamente (só `console.error`, não derruba a resposta ao
  usuário, mas o log fica vazio até a migration rodar).
- Deploy pendente — a mudança só chega à URL pública depois de
  `gcloud builds submit`.
- Demais itens do grupo "ajustável agora" do plano de ajustes (documentar
  formalmente a postura de segurança já existente, nota informal de
  riscos e mitigações) seguem como próximos passos, não implementados
  nesta entrada.
