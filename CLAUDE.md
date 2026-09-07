# CLAUDE.md — MROSC - Guia de Bolso (SIACT)

Diretrizes operacionais persistentes para quem (ou qual IA) trabalhar
neste repositório. Isto documenta **como o trabalho é feito aqui**, não
o que o sistema faz (ver `README.md`) nem o histórico do que já foi
feito (ver `DIARIO-DE-BORDO/`).

Criado em 07/09/2026, replicando o padrão já em vigor nos repositórios
irmãos DTPAR (`SISTEMA-CONTROLE-OS-ORCAMENTO-DTPAR/CLAUDE.md`) — este
projeto já seguia as mesmas regras por acordo tácito (diário de bordo com
36+ entradas, decisões documentadas em memória de sessão), só faltava
formalizar num arquivo versionado, visível a qualquer sessão futura.

## Endereço local de acesso

Com o servidor de `.claude/launch.json` (`consultoria-de-bolso-mrosc`)
rodando, o sistema é acessado em `http://localhost:3000/` (`tsx
server.ts`, Express servindo API e frontend Vite juntos — pacote único,
não há split `api/`+`web/` como no Sistema DTPAR).

## Regra de ouro: nunca fabricar dado

Todo indicador, edital, prazo ou valor exibido vem de consulta real ao
Supabase (`clsuturkoripoingjqpw` — não confundir com o projeto Supabase
genérico/pausado de nome parecido) ou de exportação real do Mapa OSC/IPEA
(`src/lib/ipea.ts`). Se falta dado para responder a uma pergunta ou
implementar algo, diga isso explicitamente — nunca invente um valor
plausível.

## Diário de bordo é obrigatório

Todo marco (análise de necessidade, design, codificação, teste,
documentação) combinado com o usuário precisa de uma entrada em
`DIARIO-DE-BORDO/` — não é preciso registrar todo commit pequeno. Regras
completas em `DIARIO-DE-BORDO/README.md`; use a Skill `diario-de-bordo`
para criar a entrada, atualizar o índice e (quando o usuário já validou o
conteúdo) commitar.

## Antes de commitar

Rodar a Skill `verificacao-pre-commit` (type-check + checagem visual em
aba nova do navegador). Nunca commitar com `npm run lint` (`tsc --noEmit`)
quebrado.

## Ações que exigem confirmação explícita separada

Peça validação explícita do usuário antes de, mesmo que pareça óbvio:

- Rodar `gcloud builds submit` — e, ao pedir, **sempre lembrar o usuário
  de fazer `git pull` primeiro no Cloud Shell** (o clone lá não atualiza
  sozinho; execução acontece pelo usuário, via Cloud Shell, nunca por
  `gcloud` local).
- Alterar política de RLS (Row Level Security) do Supabase ou qualquer
  regra de `adminOnly`.
- Tratar `adminOnly` em `nav.ts` como se fosse falha de segurança —
  **é reorganização visual do menu, deliberadamente sem bloqueio de
  rota**; não "corrigir" isso sem confirmar antes com o usuário que a
  intenção mudou.
- Propor "finalizar" a integração com a API da Anthropic (Claude) como se
  fosse permanente — **Claude é motor de IA temporário**; o destino final
  planejado é a stack soberana SERPRO (Dialoga/Serprobots/ConversAÍ
  Studio/Serpro LLM — ver memória `reference_serpro_solucoes_ia_existentes`).
- Qualquer migração destrutiva de schema Supabase (remover coluna/tabela
  com dado real).
- Planos de várias etapas: reportar e pedir "prossiga" a cada etapa, não
  encadear tudo de uma vez, salvo instrução explícita em contrário.

## Governança e conformidade de IA — separar o que é seu do que é institucional

Toda proposta de melhoria de governança/conformidade de IA precisa
separar o que cabe a uma iniciativa individual sem orçamento/mandato do
que exige institucionalização. Itens do "Grupo 3" — RIPD formal, comitê,
RACI, consulta externa, credenciamento institucional — nunca viram TODO
do desenvolvedor; são recomendação para a Diretoria, registrados como
tal. O Framework AIE (Autoavaliação de Impacto Ético em IA, NIA/SGD/MGI)
é a referência para qualquer avaliação desse tipo neste projeto.

## Convenções de commit

- Mensagem objetiva sobre o "porquê", trailer `Co-Authored-By: Claude
  Sonnet 5 <noreply@anthropic.com>`.
- Nunca `--no-verify`, nunca `git add -A`/`git add .` — listar arquivos
  explicitamente.
- Nunca commitar sem o usuário ter validado a mudança em si (o checklist
  técnico não substitui a validação de conteúdo/decisão).

## Stack e infraestrutura (referência rápida)

React 19 + Vite + Express (`server.ts` monolítico) + Supabase + Claude
(Anthropic, `claude-sonnet-5`). Deploy Cloud Run via `cloudbuild.yaml`,
manual (sem CI/CD), região `southamerica-east1`, projeto GCP
`gen-lang-client-0565048097`. Produção:
`https://siact-mrosc-927353480907.southamerica-east1.run.app`.

## Vulnerabilidade conhecida, triada e deliberadamente não corrigida

`xlsx@0.18.5` tem vulnerabilidade alta sem correção disponível no npm
registry — decisão de manter sem correção por ora, risco avaliado como
baixo (uso server-side, fonte fixa gov.br/IPEA, endpoint protegido por
`SYNC_SECRET`). Não reabrir como urgente a menos que o uso do `xlsx`
mude (ex.: passar a aceitar upload de planilha de usuário). Detalhe
completo na memória `project_siact_mrosc_xlsx_vuln_triagem`.

## Cofre Obsidian "Cerebro" — segundo cérebro do projeto

Antes de qualquer trabalho substantivo, ler
`OneDrive - Ministério da Gestão e da Inovação dos Serv. Pub\Cerebro\Projetos\consultoria-bolso-mrosc-siact\01 - Estado Atual.md`
e `02 - Pendências.md` (MCP Obsidian conectado — usar `vault_read`/
`vault_list` em vez de reconstruir contexto do zero). Protocolo de
manutenção do cofre: atualizar nota temática *in place*, nunca duplicar a
narrativa densa aqui na memória do Claude.
