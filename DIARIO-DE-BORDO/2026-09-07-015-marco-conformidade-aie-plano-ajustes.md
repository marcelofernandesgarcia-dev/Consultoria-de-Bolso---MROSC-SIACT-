---
id: 2026-09-07-015
data: 2026-09-07
titulo: "Marco — autoavaliação AIE oficial (34,6% → 46,9%) e plano de ajustes de conformidade"
tipo: marco
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [8c517f2]
---

## Contexto

Preparação para a apresentação do SIACT-MROSC a interessados da Presidência
da República / alta cúpula do MGI, que vão decidir sobre colocar (ou não) o
sistema em produção. Como parte da instrução dessa apresentação, rodei a
ferramenta oficial de Autoavaliação de Impacto Ético em IA (AIE-BR v2.40) do
Núcleo de IA/SGD contra o sistema real, corrigi os achados críticos, e
depois reenquadrei o resultado à luz do estágio atual do projeto.

## O que foi feito

1. **1ª rodada da AIE (resultado real, não estimado)**: risco do produto
   confirmado como **Médio**; maturidade de governança **Nível 1/5 —
   "Aderência Muito Baixa" (34,6%, 28,0 pontos)**. Três gatilhos críticos
   derrubavam a nota: M.7 (nenhuma base legal LGPD documentada para dado
   pessoal em texto livre, ex. nomes de dirigentes na tela de Governança),
   M.8 (nenhum canal para o titular exercer direitos LGPD), M.14 (nenhum
   mecanismo de contestação/reparação de uma análise de IA).
2. **Correção dos 3 gatilhos (commit `8c517f2`)**: nova página `/privacidade`
   (rota compartilhada OSC + Setorial) publica a base legal (Art. 7º, II da
   LGPD, ancorada no Art. 39 da Lei 13.019/2014), os direitos do Art. 18 da
   LGPD com canal de e-mail dedicado, e um canal de contestação de análises
   de IA. Esse mesmo commit também atualizou o Roadmap com 4 achados do
   catálogo de APIs do Conecta.gov.br (API oficial de CND muda a dificuldade
   da pergunta 5 do Simulador de Alta para Média; novas tarefas para
   substituir a BrasilAPI pela API oficial de CNPJ e para reforçar
   Governança com CADIN/Portal da Transparência).
3. **2ª rodada da AIE, no mesmo dia**: pontuação subiu para **46,9%
   (38,0 pontos)** — ainda Nível 1, mas de "Aderência Muito Baixa" para
   "Aderência Baixa". Os 3 gatilhos críticos não aparecem mais como fatores
   críticos. Maiores saltos: "Responsabilização e Reparação" 0%→67%,
   "Privacidade e Proteção de Dados" 10%→31%.
4. **Reenquadramento do plano de ajustes (07/09/2026)**: o usuário corrigiu
   explicitamente a moldura de qualquer recomendação futura — o SIACT-MROSC
   é hoje uma iniciativa individual de um servidor, autofinanciada, testada
   com dado público/fictício, **não** um sistema institucionalizado com
   orçamento, equipe ou mandato formal do MGI. O documento "Conformidade de
   IA — SIACT-MROSC" (Artifact, atualizado nesta data) ganhou uma seção
   "Contexto institucional atual" e teve o "Plano de migração" reescrito
   como "Plano de ajustes", separando cada item pendente em dois grupos: o
   que é ajustável agora por conta própria (log de auditoria, documentar
   postura de segurança já existente, nota informal de riscos) vs. o que só
   faz sentido pós-institucionalização e deve ser apresentado à liderança
   como decisão a tomar, não como pendência do desenvolvedor (RIPD formal,
   comitê/ponto focal de governança, políticas internas aprovadas, consulta
   a especialistas externos, RACI, testes de carga em escala, credenciamento
   institucional em APIs do Conecta.gov.br, candidatura formal à Iniciativa
   6.9 do PBIA).

## Decisões tomadas

- E-mail de contato usado na página `/privacidade`:
  `marcelo.garcia@gestao.gov.br` (institucional, informado pelo usuário —
  substituí "gestão" por "gestao" porque domínio de e-mail não aceita
  acento, flagueado explicitamente ao usuário).
- Base legal escolhida para o tratamento de nomes/vínculos de dirigentes:
  Art. 7º, II da LGPD (cumprimento de obrigação legal), ancorada no Art. 39
  da Lei 13.019/2014 (que exige a checagem de impedimentos) — documentada
  como "sujeita à confirmação formal pela área jurídica do órgão", não como
  fato consumado.
- **Regra permanente adotada para qualquer análise futura de governança
  deste projeto**: nunca tratar item de governança formal (RIPD, comitê,
  RACI, consulta externa, credenciamento institucional) como TODO do
  desenvolvedor — sempre como decisão de institucionalização pendente da
  gestão. Registrada em memória de longo prazo, fora do repositório.
- O documento de conformidade e seu PDF vivem fora do repositório (Artifact
  publicado + entregue em PDF) — decisão de manter como material de
  apresentação separado do código-fonte, não como documentação versionada
  no repo.

## Arquivos afetados

- `src/pages/Privacidade.tsx` (novo, no commit `8c517f2`)
- `src/lib/nav.ts`, `src/data/manual.ts`, `src/App.tsx`, `src/pages/Roadmap.tsx` (no commit `8c517f2`)
- Nenhum arquivo do repositório alterado nesta entrada — o reenquadramento do
  plano de ajustes (item 4) ficou só no Artifact externo "Conformidade de IA
  — SIACT-MROSC" e na memória de longo prazo.

## Pendências / próximos passos

- Grupo "ajustável agora" do plano de ajustes (log técnico de auditoria por
  análise de IA, documentação formal da postura de segurança já existente,
  nota informal de riscos e mitigações) ainda não implementado — candidato a
  próxima entrada.
- Grupo "pós-institucionalização" (RIPD formal, comitê de governança, RACI,
  testes de carga em escala, credenciamento Conecta.gov.br, candidatura à
  Iniciativa 6.9) permanece como pauta de decisão para a alta cúpula, não
  como trabalho a executar agora.
