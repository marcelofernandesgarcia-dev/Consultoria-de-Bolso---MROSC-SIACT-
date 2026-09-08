---
id: 2026-09-08-007
data: 2026-09-08
titulo: "Deploy em produção e verificação (desktop + mobile) do fix visitante/menu"
tipo: testes
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [c708674, 017afb2]
---

## Contexto

Antes de rodar o deploy pendente dos commits `c708674` (fix jornada/perfil
sujos do visitante + menu desvinculado da rota) e `017afb2` (governança:
Fase 3 mobile da skill `verificacao-pre-commit` sempre obrigatória), o
usuário reforçou uma instrução: **toda alteração de UI deve ser sempre
verificada também em acesso mobile**, não só quando "pareceu necessário"
caso a caso — decisores avaliando o sistema (ex.: o diretor que recebeu
o link) podem abrir em celular. Essa regra já foi registrada em
`CLAUDE.md`, na skill `verificacao-pre-commit` e em memória de sessão.
Após o commit de governança, o próximo passo natural era concluir o
deploy que estava em andamento.

## O que foi feito

- Deploy rodado via `gcloud` local (`gcloud builds submit --config
  cloudbuild.yaml`, padrão em vigor desde 07/09/2026) — build
  `f883e303-4694-465a-815c-c7365dc8627b`, 4m24s, `SUCCESS`.
- Verificação ao vivo em produção
  (`https://siact-mrosc-927353480907.southamerica-east1.run.app`), em
  desktop e mobile (375px), cobrindo as duas correções do commit
  `c708674`:
  - **Reset do visitante**: simulado `localStorage` sujo
    (`siact_jornada` com fase 3, `siact_admin_preview_perfil=setorial`)
    direto na URL de produção; clique em "Entrar como visitante"
    aterrissou limpo em `/inicio`, com as duas chaves confirmadas como
    `null` via `localStorage.getItem` após o login.
  - **Menu vinculado à rota**: navegação direta para `/normas` (abriu e
    destacou o grupo "OSC" → "Radar Normativo") e para `/parecer` (abriu
    e destacou o grupo "Setorial" → "Parecer Técnico"), testado primeiro
    em desktop e depois repetido em viewport mobile (375×812) com o
    drawer do menu — mesmo resultado, grupo "Setorial" expandido e
    "Parecer Técnico" destacado dentro do drawer.
  - Layout mobile sem rolagem horizontal em nenhuma tela testada.

## Decisões tomadas

- Confirmado neste teste um achado operacional já documentado na skill:
  cliques via `computer{action:"left_click"}` no botão do drawer mobile
  deram timeout (30s) mesmo em produção (não é exclusivo de sessão longa
  de dev server com HMR). O clique de fato havia sido registrado pelo
  navegador (o botão alternava para "Fechar menu"/"Abrir menu" nas
  checagens seguintes) — só a resposta da ferramenta que não voltava a
  tempo. Contorno usado: disparar o clique via `javascript_tool`
  (`document.querySelector(...)?.click()`) e ler o estado por
  `read_page`/screenshot em vez de depender do retorno do `computer`.
  Isso amplia o escopo do achado registrado em
  `feedback_siact_mrosc_verificar_mobile_sempre`: o timeout pode ocorrer
  mesmo fora de sessões de dev.

## Arquivos afetados

Nenhum arquivo de código alterado nesta entrada — é só deploy e
verificação dos commits `c708674` e `017afb2`, já registrados nas
entradas `2026-09-08-006` e na governança de `CLAUDE.md`/skill.

## Pendências / próximos passos

- Nenhuma pendência técnica conhecida neste momento para o fluxo de
  login do visitante e sincronização do menu.
- Link de acesso a compartilhar continua
  `https://siact-mrosc-927353480907.southamerica-east1.run.app/inicio`
  (regra permanente: sempre com `/inicio`, nunca a raiz ou `/landing`).
