---
id: 2026-09-08-009
data: 2026-09-08
titulo: "Deploy e verificação (desktop + mobile) do alinhamento menu/Jornada"
tipo: testes
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [c87b13d]
---

## Contexto

Continuação direta da entrada [008](2026-09-08-008-fix-alinhamento-jornada-reset-visivel.md):
com o commit `c87b13d` já enviado ao repositório remoto, faltava rodar o
deploy e confirmar as duas mudanças (priorização do grupo pelo perfil da
Jornada em rotas compartilhadas + botão de reset sempre visível) na URL
pública, não só no ambiente de dev.

## O que foi feito

- Deploy rodado via `gcloud` local — build
  `ca177ebf-0fc7-4a8f-9650-d4e619479eb7`, 4m12s, `SUCCESS`.
- Verificação ao vivo em produção
  (`https://siact-mrosc-927353480907.southamerica-east1.run.app`),
  repetindo o mesmo roteiro testado em dev na entrada 008, agora em
  desktop **e** mobile (375px, drawer):
  - Visitante novo (`localStorage` limpo) → "Entrar como visitante" →
    escolha "Gestor Público" → "Chamamento Público" → navegação direta
    pra `/normas` (rota compartilhada OSC/Setorial): menu abriu o grupo
    **Setorial** com "Radar Normativo" destacado, alinhado com a
    etiqueta "Sua Jornada: Gestor Público · Chamamento..." — confirmado
    nos dois viewports.
  - Botão de reset (ícone `RotateCcw`, ao lado do indicador "Sua
    Jornada"): clicado em desktop e no drawer mobile, limpou
    `siact_jornada` (`localStorage.getItem` retornando `null`) e
    navegou de volta pra `/inicio`, Passo 1.
  - Sem rolagem horizontal no drawer mobile.

## Decisões tomadas

Nenhuma decisão nova — esta entrada é só o fechamento (deploy +
verificação) do que já foi decidido e implementado na entrada 008.

## Arquivos afetados

Nenhum arquivo de código alterado nesta entrada — só deploy e
verificação do commit `c87b13d`, já registrado na entrada 008.

## Pendências / próximos passos

Nenhuma pendência conhecida neste momento para o fluxo "Sua Jornada" e o
alinhamento do menu em rotas compartilhadas.
