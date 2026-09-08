---
id: 2026-09-08-002
data: 2026-09-08
titulo: "Minuta de Nota Informativa ao Gabinete DTPAR apresentando o aplicativo"
tipo: documentacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário forneceu um comando estruturado (persona, objetivo, estrutura formal
em 6 seções I-VI, diretrizes de conteúdo e restrições) pra elaboração de uma
minuta de Nota Informativa institucional, no padrão do Manual de Redação da
Presidência da República, apresentando o aplicativo "MROSC – Guia de Bolso"
a gestores responsáveis pela gestão de parcerias com OSCs — primeiro
documento institucional formal produzido para este projeto (os anteriores
desta sessão foram documentos de conformidade/diagnóstico técnico, não uma
peça de comunicação oficial ao Gabinete).

O próprio comando já trazia a diretriz central deste projeto: nunca
fabricar dado (número de portaria, prazo normativo, dispositivo legal,
métrica de ganho) — usar marcador explícito "[DADO A CONFIRMAR PELO
GESTOR]" onde não houver informação real disponível.

## O que foi feito

Usada a skill `nota-tecnica-dtpar` (Fase 1-5 completas). Antes de escrever,
verificado no código-fonte real do repositório (não por memória) o que a
Seção II do comando exigia: `GeradorParecer.tsx` confirmado com o modo
Anexo VII (bloco de identificação preenchido pelo gestor, 8 seções técnicas
I-VIII, desfecho Aprovação/Aprovação com Ressalvas/Rejeição-TCE, campo
"Relatórios da Parceria", exportação em PDF) e `nav.ts` confirmado com a
segmentação real de funcionalidades por perfil (OSC vs. Setorial).

Minuta redigida seguindo estritamente a estrutura das 6 seções pedidas,
com camada de anonimização/LGPD citada na Seção II (Art. 7º, II e Art. 39
Lei 13.019/2014, mesma base já usada em `/privacidade`), e 3 pendências
reais marcadas explicitamente numa caixa de "Advertência" no topo do
documento: número de protocolo da Nota, métricas quantitativas de ganho
(inexistentes — nenhum piloto formal rodado), e confirmação jurídica
formal da base legal de LGPD.

Publicada como Artifact (design utilitário — documento oficial, sem
flourish, tokens de cor/tipografia próprios, tema claro/escuro) e salva
cópia canônica em Markdown no repositório
(`DOCUMENTOS-INSTITUCIONAIS/2026-09-08-nota-informativa-mrosc-guia-de-bolso.md`
— nova pasta, primeiro documento institucional versionado do projeto).

## Decisões tomadas

- PDF não gerado nesta rodada — a skill instrui gerar só se o usuário
  pedir explicitamente; oferecido, não produzido de ofício.
- Nova pasta `DOCUMENTOS-INSTITUCIONAIS/` criada pra abrigar peças de
  comunicação formal ao Gabinete/outros públicos institucionais — distinta
  do `DIARIO-DE-BORDO/` (rastro técnico de desenvolvimento) e dos
  documentos de conformidade produzidos anteriormente (que ficaram só como
  Artifact/PDF, sem cópia versionada no repo, por serem mais analíticos
  que peças de comunicação oficial).
- Recomendação da Seção VI (adoção-piloto, não institucionalização plena
  imediata) alinhada à regra já registrada no `CLAUDE.md` sobre separar o
  que cabe a uma iniciativa individual do que exige decisão institucional
  — os 3 pontos de deliberação futura citados (SERPRO, RIPD, ponto focal
  de governança) são os mesmos já mapeados no "Grupo 3" do plano de
  ajustes de conformidade de IA.

## Arquivos afetados

- `DOCUMENTOS-INSTITUCIONAIS/2026-09-08-nota-informativa-mrosc-guia-de-bolso.md` (novo)

## Pendências / próximos passos

- Número de protocolo/SEI da Nota — só o Gabinete pode atribuir.
- Nome do servidor signatário — a preencher.
- Métricas quantitativas de ganho — dependem de piloto formal ainda não
  realizado; não estimadas.
- Confirmação formal da base legal de LGPD pela área jurídica do órgão.
- PDF não gerado — oferecido ao usuário, a produzir se solicitado.
