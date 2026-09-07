---
name: diario-de-bordo
version: 1.0.0
description: Cria uma nova entrada no Diário de Bordo do projeto (registro obrigatório a cada marco de análise, design, codificação, teste ou documentação), sincroniza o índice e, se o conteúdo já foi validado pelo usuário, commita e envia. Use sempre que um marco relevante for concluído neste repositório.
---

# SKILL: Diário de Bordo (Registro de Marco do Projeto)

## 1. OBJETIVO
Registrar de forma padronizada e rastreável todo marco relevante do
projeto no Diário de Bordo, mantendo `README.md` sincronizado, para
sustentar a rastreabilidade do desenvolvimento e o futuro Registro de
Programa de Computador (RPC) no INPI.

## 2. ENTRADAS OBRIGATÓRIAS (INPUTS)
- Descrição do marco (o que foi feito/decidido) **já validada pelo
  usuário** — esta Skill registra, não decide.
- Fase: análise de necessidades | design | codificação | testes |
  documentação | outro.
- Responsável(is) e vínculo (servidor DTPAR | contratado/terceirizado |
  outro).
- Se o conteúdo já pode ser commitado ou fica só como rascunho local.

## 3. PROCESSO DE EXECUÇÃO (PASSO A PASSO OBRIGATÓRIO)

### Fase 1: Preparação
- Ler `DIARIO-DE-BORDO/_TEMPLATE-ENTRADA.md`.
- Listar os arquivos já existentes com a data de hoje e determinar o
  próximo `NNN` sequencial (numeração reinicia a cada data).

### Fase 2: Redação da entrada
- Nomear `AAAA-MM-DD-NNN-titulo-curto.md`.
- Preencher o frontmatter (`fase` em minúsculas, conforme o template).
- Preencher todas as seções com fatos verificáveis — nunca suposição
  (mesma regra do `CLAUDE.md`, "nunca fabricar dado").
- Nunca reescrever ou apagar entrada antiga — decisão que mudou vira
  entrada nova.

### Fase 3: Atualização do índice
- Adicionar uma linha na tabela de `DIARIO-DE-BORDO/README.md` (`fase`
  capitalizada aqui, diferente do frontmatter).
- Este repositório **não tem** `indice.json` — não criar um; a única aba
  Administrador com timeline lida de `indice.json` existe no repositório
  irmão `dashboard DTPAR`, não aqui.

### Fase 4: `FICHA-REGISTRO-INPI.md`
- Só editar se o marco for relevante para autoria/titularidade do
  registro no INPI — diferente das entradas normais, este arquivo é
  cumulativo/editável, não append-only. Autor já registrado: Marcelo
  Fernandes Garcia, servidor público DTPAR/MGI.

### Fase 5: Commit
- Só depois que o usuário já validou o conteúdo da entrada em si.
- `git add` explícito dos arquivos tocados; commit com trailer
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`; `git push`.
- Se o marco incluir deploy real (`gcloud builds submit`), lembrar o
  usuário de `git pull` no Cloud Shell antes — ver `CLAUDE.md`.

## 4. FORMATO DE SAÍDA EXIGIDO (OUTPUT)

**Entrada de Diário de Bordo criada**
- Arquivo: `AAAA-MM-DD-NNN-titulo-curto.md`
- Fase: [fase]
- `README.md` atualizado: sim/não
- `FICHA-REGISTRO-INPI.md` tocada: sim/não se aplica
- Commit: sim (`hash`) / pendente de validação do conteúdo

## 5. REFERÊNCIAS DO PROJETO
- Template: `DIARIO-DE-BORDO/_TEMPLATE-ENTRADA.md`
- Regras completas: `DIARIO-DE-BORDO/README.md`
- Regra de não fabricar dado e regras de deploy: `CLAUDE.md`
