---
id: 2026-09-07-020
data: 2026-09-07
titulo: "Conclusão do Grupo 2 do plano de ajustes — postura de segurança e riscos documentadas"
tipo: documentacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Últimos dois itens pendentes do grupo "ajustável agora, por conta própria" do plano de ajustes de conformidade
([2026-09-07-015](2026-09-07-015-marco-conformidade-aie-plano-ajustes.md)): documentar formalmente a postura
de segurança técnica já implementada, e produzir uma nota informal de riscos e mitigações. O log de auditoria
de IA (item 1 do mesmo grupo) já tinha sido concluído em
[2026-09-07-016](2026-09-07-016-log-auditoria-ia.md)/[019](2026-09-07-019-teste-e2e-log-auditoria-ia.md).

## O que foi feito

Levantamento no `server.ts` dos mecanismos de segurança já implementados (sem nenhuma mudança de código,
só formalização em documento): CSP via `helmet`, rate limiting de 60 req/min por IP em `/api/*`, autenticação
JWT obrigatória (`getAuthUser`) nos 4 endpoints de IA e demais rotas sensíveis, limite de payload de 10MB,
proteção dos endpoints de sincronização por `SYNC_SECRET` dedicado, restrição do painel administrativo por
allowlist de e-mail (`ADMIN_EMAILS`), e RLS habilitado na tabela `ai_audit_log` (só `service_role` lê/escreve).

Nota informal de riscos e mitigações escrita com base em tudo já identificado ao longo desta análise inteira:
8 riscos — dependência da BrasilAPI (terceiro), motor de IA não-soberano (Anthropic), vulnerabilidade
`xlsx@0.18.5`, acesso anônimo de demonstração, base legal LGPD sem confirmação jurídica formal, prazo de
retenção da Anthropic não confirmado, ausência de testes automatizados, ausência de RIPD/comitê formal — cada
um com a mitigação real já em vigor hoje.

Nova seção "08 — Postura de segurança e riscos" adicionada ao documento "Conformidade de IA — SIACT-MROSC"
(Artifact + PDF), entre "Plano de ajustes" e "Catálogo de APIs" (seções seguintes renumeradas 9 e 10). Os 2
itens correspondentes no Grupo 2 do plano de ajustes marcados como ✅ concluídos.

## Decisões tomadas

- Documentação vive só no Artifact/dossiê de conformidade — não no código, porque os mecanismos já existiam;
  o pedido explícito do plano era "documentar", não "construir".
- Nota de riscos é explicitamente rotulada como registro informal do próprio desenvolvedor, nunca apresentada
  como equivalente a um RIPD formal — mantém a separação de grupos 2/3 do plano de ajustes.

## Arquivos afetados

Nenhum arquivo do repositório — só o Artifact externo "Conformidade de IA — SIACT-MROSC" e o cofre Obsidian
(`02 - Pendências.md`, `03 - Linha do Tempo.md`, `Notas/Conformidade de IA (AIE).md`).

## Pendências / próximos passos

- **Grupo 2 do plano de ajustes concluído por completo** — os 3 itens ("log de auditoria", "postura de
  segurança", "nota de riscos") estão feitos e documentados.
- Grupo 3 (RIPD formal, comitê de governança, RACI, consulta externa, testes de carga em escala, credenciamento
  Conecta.gov.br, candidatura à Iniciativa 6.9) segue como pauta de decisão institucional, não como próxima
  tarefa de código.
