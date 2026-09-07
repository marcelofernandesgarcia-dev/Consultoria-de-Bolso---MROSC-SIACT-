---
id: 2026-09-07-019
data: 2026-09-07
titulo: "Teste E2E — log de auditoria de IA gravando em produção"
tipo: testes
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Depois do deploy do log de auditoria de IA
([2026-09-07-016](2026-09-07-016-log-auditoria-ia.md)) e das duas correções
de `cloudbuild.yaml` que ele exigiu
([2026-09-07-017](2026-09-07-017-fix-cloudbuild-short-sha.md),
[2026-09-07-018](2026-09-07-018-fix-cloudbuild-substituicao-aninhada.md)),
faltava confirmar que `logAiInteraction()` realmente grava uma linha em
produção — até aqui só se sabia que o build tinha sucesso e que
`/api/health` respondia.

## O que foi feito

Teste de ponta a ponta na URL pública
(`https://siact-mrosc-927353480907.southamerica-east1.run.app`):

1. `/api/health` — confirmado `{"status":"ok", "version":"4.0.0",
   "env":"production"}`.
2. `/privacidade` — confirmado que o texto novo sobre o log de auditoria
   (adicionado nas seções "Retenção e compartilhamento" e "Contestar uma
   análise de IA") já está no ar.
3. Aberto o Assistente flutuante (`/inicio`, sessão de demonstração) e
   enviada a mensagem "Teste do log de auditoria de IA — 2026-09-07".
   `POST /api/chat` retornou `200`, com resposta real do assistente.
4. Confirmado via Supabase Table Editor (projeto "MROSC - CONSULTORIA DE
   BOLSO", produção): a tabela `ai_audit_log` recebeu 1 linha nova —
   `endpoint = /api/chat`, `analysis_type = chat_assistente`, `user_id`
   preenchido, `input_excerpt` com o texto exato enviado, `output_excerpt`
   com a resposta real do assistente.

## Decisões tomadas

- Nenhuma — teste de verificação, sem mudança de código.
- Confirmação feita direto no Table Editor do Supabase (não por uma tela
  no app) porque, por desenho, `ai_audit_log` tem RLS habilitado sem
  policy pra nenhum papel além de `service_role` — só o backend grava, e
  só quem acessa o Supabase diretamente consegue ler.

## Arquivos afetados

Nenhum — só verificação em produção.

## Pendências / próximos passos

- Log de auditoria de IA está funcionando de ponta a ponta e verificado
  com interação real — item concluído do grupo "ajustável agora" do plano
  de ajustes de conformidade
  ([2026-09-07-015](2026-09-07-015-marco-conformidade-aie-plano-ajustes.md)).
- Ainda pendentes do mesmo grupo: documentação formal da postura de
  segurança já existente, e nota informal de riscos e mitigações — não
  implementadas nesta entrada.
