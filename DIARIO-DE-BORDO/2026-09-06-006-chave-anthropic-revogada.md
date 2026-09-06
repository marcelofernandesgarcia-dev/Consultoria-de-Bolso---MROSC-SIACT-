---
id: 2026-09-06-006
data: 2026-09-06
titulo: "Renova secret ANTHROPIC_API_KEY — chave revogada bloqueava toda análise de IA"
tipo: testes
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Sem entrada de código associada — correção de configuração (secret do GCP
Secret Manager), não de código-fonte. Registrada aqui por ser parte
essencial do mesmo esforço de tornar o app publicado utilizável para a
apresentação a interessados da Presidência da República e a um diretor.

Com [2026-09-06-005](2026-09-06-005-fix-cloudbuild-bash-entrypoint.md)
resolvido, o login anônimo e a navegação pelo app funcionavam, mas o teste
final — "Explicar Edital" em `ChamamentosAbertos.tsx`, o bug original que
motivou toda a investigação desta sessão — retornava "Falha ao analisar
este edital" (HTTP 500).

## O que foi feito

Log do Cloud Run mostrou a causa real:

```
Edital explicar error: AuthenticationError: 401
{"error":{"type":"authentication_error","message":"invalid x-api-key"}}
```

O secret `ANTHROPIC_API_KEY` no GCP continha uma chave inválida. Em sessão
anterior deste mesmo projeto, uma chave real da Anthropic havia sido colada
por acidente no chat e imediatamente revogada por precaução — é provável que
o secret tenha sido criado com essa chave já comprometida/revogada, em vez
da chave de substituição. Gerada uma chave nova no Console da Anthropic
(`platform.claude.com/settings/keys`, escopo "Espaço de trabalho padrão") e
atualizado o secret via nova versão no Secret Manager.

## Decisões tomadas

Optado por gerar uma chave nova em vez de tentar recuperar/confirmar o
status das duas chaves já existentes na conta — a Anthropic só exibe o valor
completo de uma chave uma única vez, no momento da criação, então não havia
como confirmar o valor das chaves antigas sem já ter esse dado salvo.

## Arquivos afetados

Nenhum — mudança feita inteiramente no GCP Secret Manager (nova versão do
secret `ANTHROPIC_API_KEY`).

## Pendências / próximos passos

Com essa correção, "Explicar Edital" passou a funcionar de ponta a ponta em
produção (visitante anônimo → análise de IA real). Validação registrada em
[2026-09-06-007](2026-09-06-007-marco-validacao-e2e-demonstracao.md).
