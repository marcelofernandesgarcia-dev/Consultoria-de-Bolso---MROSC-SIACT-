---
id: 2026-09-03-001
data: 2026-09-03
titulo: "Auditoria — 5 Pilares do anexo técnico Sinergia SIACT v6 vs. estado real do código"
tipo: planejamento
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [a12c52d, 82ef55f, 1c7caa1, b914e6a, 7b805bb, 8dce03a]
---

## Contexto

O usuário formalizou, nesta sessão, a missão do produto ("MROSC - Guia de
Bolso: Inteligência e Praticidade na Gestão de Parcerias") e um anexo
técnico descrevendo a arquitetura-alvo do sistema — "Sinergia SIACT v6" —
estruturada em 5 pilares. Como o projeto está entrando em etapa de
planejamento, foi pedida uma auditoria real do código para confirmar o que
desse anexo já está implementado e o que é ainda só visão de arquitetura.

## O que foi feito

Auditoria completa do repositório (25 itens, um por sub-item dos 5
pilares), verificando cada afirmação diretamente no código-fonte (grep +
leitura de arquivo, com referência de arquivo:linha), não por suposição.
Resultado publicado como artifact interativo e resumido abaixo.

### Pilar 1 — Propósito e base legal
- **Existe:** Lei 13.019/2014 (uso extenso) e Decreto 11.948/2024 (uso
  extenso, inclusive em prompts de IA e regra de porte do checklist).
- **Parcial:** Decreto 8.726/2016 — citado, mas sem regra de negócio
  própria.
- **Não existe:** prevenção automática de glosa/improbidade/TCE — hoje é
  só conteúdo educativo e análise assistida sob demanda, não um motor que
  bloqueia ações por risco.

### Pilar 2 — Assistente de IA
- **Existe:** motor Claude (`claude-sonnet-5`) em 4 endpoints; parsing de
  PDF; componente Semáforo de Risco (determinístico, usado em 5 páginas).
- **Parcial:** motor de proporcionalidade (porte é escolhido manualmente,
  não detectado do valor real da parceria, e não se propaga a outras
  telas); governança AIE/NIA (só disclaimer textual, sem avaliação de
  impacto ético formalizada).
- **Não existe:** parsing de `.txt/.csv/.json` enviados pelo usuário (só
  PDF é aceito); RAG/banco vetorial/busca semântica (nenhuma ocorrência no
  código); migração para infraestrutura SERPRO (só citada como roadmap).
- **Achado à parte:** duas telas (`GeradorParecer.tsx:165`,
  `Roadmap.tsx:20`) ainda dizem "Gemini" no texto, desatualizado desde a
  migração para Claude — correção de conteúdo pendente, independente de
  qualquer decisão de roadmap.

### Pilar 3 — Integrações
- **Existe:** Mapa das OSCs/IPEA (ingestão real em lote — Base Principal,
  CEBAS, Projetos, Áreas — com upsert no Supabase); Radar de editais via
  API pública da Prosas (fonte real e estável, migrada nesta mesma
  sessão).
- **Parcial:** validação de CNPJ/CNAE (consulta real via BrasilAPI, mas
  sem validação de dígito verificador nem compatibilidade de CNAE como
  regra); APIs do Transferegov (usa CKAN de Dados.gov.br como proxy
  frágil — o próprio código admite a limitação de CORS).
- **Não existe:** validação automática de CNDs (só checkbox manual, sem
  consulta ao órgão emissor).

### Pilar 4 — Jornada da parceria
- **Parcial (os 2 itens):** as 4 fases têm ferramentas reais associadas,
  mas são independentes entre si — "Por onde começar" recomenda por
  perfil+fase, mas sem estado persistido entre etapas nem gate de
  conclusão.

### Pilar 5 — Interface e usabilidade
- **Existe:** dashboard com dado real (não mockado); histórico persistente
  de consultas (Supabase + localStorage).
- **Parcial:** aprovação humana antes de definitivo (disclaimer textual em
  toda tela de parecer, mas sem gate de UI que exija confirmação antes de
  exportar).
- **Não existe:** Score de Risco algorítmico por OSC (o que existe hoje é
  métrica de uso do sistema ou número gerado pontualmente pela IA, não um
  score calculado a partir de histórico/pendências/certificações).

## Decisões tomadas

- O anexo "Sinergia SIACT v6" é tratado como **visão-alvo**, não como
  descrição do estado atual — decisão registrada para evitar que futuras
  sessões assumam por engano que algo como RAG ou migração SERPRO já
  existe.
- Nenhum item foi priorizado nesta entrada — o comparativo é
  deliberadamente só descritivo, para a decisão de prioridade ser tomada
  em conjunto com o usuário numa etapa seguinte.
- Início formal do Diário de Bordo deste projeto — antes desta entrada,
  o histórico da sessão só existia em memória de sessão e na nota do
  Obsidian, sem registro versionado no próprio repositório.

## Arquivos afetados

Nenhum arquivo de código foi alterado nesta etapa — é uma auditoria
somente-leitura. Artefato publicado (não versionado no repo):
comparativo interativo "Auditoria SIACT v6".

## Pendências / próximos passos

- Corrigir o texto residual "Gemini" em `GeradorParecer.tsx` e
  `Roadmap.tsx` (achado nesta auditoria, ainda não tratado).
- Decidir com o usuário quais itens do gap (Pilares 2 e 3 são os mais
  distantes do alvo) entram no próximo ciclo de planejamento.
- Avaliar se as entradas de marcos já ocorridos nesta sessão (pivô SaaS→
  institucional, migração Gemini→Claude, Chamamentos Abertos v2, controle
  de acesso OSC/Setorial, responsividade mobile, migração da fonte de
  editais para Prosas) merecem backfill retroativo neste Diário de Bordo,
  como foi feito no projeto irmão `dashboard DTPAR`.
