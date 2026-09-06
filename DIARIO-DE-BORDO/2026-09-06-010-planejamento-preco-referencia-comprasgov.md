---
id: 2026-09-06-010
data: 2026-09-06
titulo: "Registra no Roadmap — sugestão automática de preço de referência via Compras.gov.br"
tipo: planejamento
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Após validar que a "Cotação Prévia" funciona corretamente de ponta a ponta
([2026-09-06-009](2026-09-06-009-fix-cotacao-previa-totais-prematuros.md)),
o usuário testou o fluxo completo e levantou uma limitação real de
usabilidade: a funcionalidade exige que o próprio usuário informe um "valor
de referência" de mercado, mas boa parte do público-alvo (OSCs de pequeno
porte, servidores sem capacitação específica em pesquisa de preços) não
sabe fazer essa pesquisa por conta própria. Pedido: o sistema deveria
consultar automaticamente uma fonte oficial (Compras.gov.br) e sugerir o
valor, com justificativa.

## O que foi feito

Investigação (antes de propor qualquer solução, mesmo rigor de verificação
usado nas correções jurídicas de sessões anteriores) confirmou que existe
uma **API pública oficial e ativa**, mantida pela Seges/MGI, própria pra
isso: **`dadosabertos.compras.gov.br/modulo-pesquisa-preco`** — módulo de
Pesquisa de Preços do Compras.gov.br, que recebe o código do material no
catálogo (CATMAT) e devolve os preços praticados nos últimos 12 meses
(média, mediana, menor valor). Confirmado também que o antigo "Painel de
Preços" (`paineldeprecos.planejamento.gov.br`) está **descontinuado** desde
04/07/2025 — não deve ser usado como fonte.

Registrada a ideia formalmente:
- **Roadmap** (`src/pages/Roadmap.tsx`, Fase 2 — Integrações Oficiais): nova
  tarefa "Sugerir valor de referência na Cotação Prévia via API de Pesquisa
  de Preços do Compras.gov.br".
- Esta entrada do Diário de Bordo, documentando a fonte técnica já
  verificada, pra não precisar re-investigar do zero na sessão que for
  implementar.

## Decisões tomadas

**Não implementado agora** — decisão explícita, dado que a apresentação a
interessados da Presidência da República e a um diretor é iminente, e essa
é uma integração de escopo real (busca de material por descrição livre →
correspondência de CATMAT → chamada à API externa → tratamento de erro
quando não há correspondência ou histórico de preço → UI de sugestão com
justificativa transparente), não um ajuste de baixo impacto.

## Arquivos afetados

- `src/pages/Roadmap.tsx` — nova tarefa na Fase 2 (Integrações Oficiais)

## Pendências / próximos passos

Detalhar plano técnico completo numa sessão dedicada:
- Buscar/confirmar o endpoint de correspondência material↔descrição (a API
  de preço praticado busca por código CATMAT, não texto livre — falta
  mapear o passo intermediário de busca no catálogo).
- Novo endpoint em `server.ts` orquestrando a chamada externa.
- UI mostrando a sugestão com fonte e cálculo (média/mediana/menor preço)
  visíveis — importante não virar "caixa preta" numa decisão de compra
  pública.
- Tratamento de indisponibilidade da API/material sem histórico (o sistema
  deve permitir preenchimento manual como fallback, nunca travar o fluxo).
