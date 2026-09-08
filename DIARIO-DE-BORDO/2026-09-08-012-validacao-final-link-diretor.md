---
id: 2026-09-08-012
data: 2026-09-08
titulo: "Validação final do link de acesso antes de reenviar ao diretor"
tipo: testes
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Fechamento do ciclo iniciado com o print do diretor mais cedo hoje
(entrada [006](2026-09-08-006-fix-visitante-jornada-e-menu-vinculado.md))
e continuado nas entradas [007](2026-09-08-007-deploy-e-verificacao-producao-fix-visitante-menu.md),
[008](2026-09-08-008-fix-alinhamento-jornada-reset-visivel.md)–[009](2026-09-08-009-deploy-e-verificacao-alinhamento-jornada.md)
e [010](2026-09-08-010-entrada-previsivel-sessao-demonstracao.md)–[011](2026-09-08-011-deploy-e-verificacao-entrada-previsivel.md).
Usuário pediu validação final usando o próprio link de acesso, exatamente
como o diretor usaria, antes de reenviá-lo.

## O que foi feito

Teste ponta a ponta em produção, simulando um dispositivo que nunca
acessou o app (`localStorage`/`sessionStorage` limpos), usando a URL
real de compartilhamento:

```
https://siact-mrosc-927353480907.southamerica-east1.run.app/inicio
```

1. Abrir o link sem sessão → redireciona sozinho pra `/login` (0 clique).
2. **1º clique** — "Entrar como visitante (demonstração)" → cai direto
   em `/inicio`, Passo 1 ("Quem é você nesta parceria?").
3. **2º clique** (não executado neste teste, já validado nas entradas
   anteriores) — escolher OSC ou Gestor Público completa a seleção de
   perfil.

Resultado: o link continua sendo o mesmo (não mudou — já estava correto
desde a regra registrada em [[feedback_siact_mrosc_link_padrao_inicio]]),
e agora garante esse fluxo de 2 cliques de forma previsível, mesmo que o
diretor (ou qualquer um no mesmo dispositivo) já tenha explorado o app
antes.

## Decisões tomadas

Nenhuma decisão nova — esta entrada é a validação final, não uma
correção. Nenhum código foi alterado.

## Arquivos afetados

Nenhum — teste de ponta a ponta usando o build já em produção
(commit `cdaaf2a`, deploy confirmado na entrada 011).

## Pendências / próximos passos

Nenhuma. Link pronto para reenvio ao diretor:
`https://siact-mrosc-927353480907.southamerica-east1.run.app/inicio`.
