---
id: 2026-09-07-024
data: 2026-09-07
titulo: "Autocomplete de catálogo e sugestão de valor de referência na Cotação Prévia"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Usuário trouxe 3 links (catálogo CATMAT/CATSER do Compras.gov.br, a
ferramenta oficial "Pesquisa de Preços Lite" e um wrapper comunitário em
Streamlit) apontando o problema real da Cotação Prévia: o usuário digita a
descrição do item e o "Val. Ref/Un" de cabeça, sem saber o código oficial
do material/serviço nem ter uma referência de preço real.

## O que foi feito

Testadas ao vivo as APIs reais antes de escrever qualquer código (nunca
fabricar integração por suposição). Achado técnico que mudou o desenho
inicial: a API pública **não aceita busca por texto livre** — só código
exato ou navegação hierárquica. A busca "digite e sugere" da ferramenta
oficial roda no cliente deles, com lista pré-carregada. Solução adotada:
sincronizar localmente os PDMs de material (15.030) e itens de serviço
(3.018) do catálogo — pequeno o bastante pra um sync completo, ao
contrário dos 249 mil itens completos com especificação técnica.

**Migration** (`supabase/migrations/003_catalogo_compras.sql`): duas
tabelas novas, `catalogo_pdm_material` e `catalogo_item_servico`, com
índice GIN de busca textual em português (mesmo padrão de
`osc_cadastro.razao_social`), RLS habilitado com leitura pública pra
usuários autenticados (é catálogo de dados abertos do governo, não dado
sensível).

**`src/lib/catalogoCompras.ts`** (novo, mesmo padrão de `ipea.ts`):
`syncPdmMaterial()`/`syncItemServico()` baixam e fazem upsert em lote;
`consultarPrecoPdmMaterial()`/`consultarPrecoItemServico()` consultam ao
vivo a API de Pesquisa de Preços (`modulo-pesquisa-preco`) dos últimos 12
meses e calculam média/mediana/mínimo/máximo no próprio servidor (a API
só devolve os registros de compra brutos, não estatísticas prontas).

**`server.ts`**: 3 endpoints novos — `POST /api/sync/catalogo-compras`
(protegido por `SYNC_SECRET`, mesmo padrão do sync do Mapa OSC),
`GET /api/catalogo/buscar` (busca textual local, material ou serviço),
`GET /api/catalogo/preco` (estatística de preço ao vivo pro item
selecionado).

**`CotacaoPrevia.tsx`**: campo "Descrição" ganhou autocomplete (debounce
de 400ms, busca material+serviço em paralelo, resultado com badge
Material/Serviço); ao selecionar um item, se "Val. Ref/Un" estiver vazio,
busca o preço de referência e pré-preenche com a mediana, mostrando nota
de transparência ("sugerido com base em N compras públicas reais dos
últimos 12 meses") — nunca sobrescreve um valor já digitado pelo usuário,
e a falha de qualquer chamada auxiliar nunca trava o preenchimento manual.

**Assimetria documentada**: pra materiais, a sugestão de preço funciona no
nível do PDM (genérico, ex: "Notebook", "Cadeira Desenhista") — suficiente
pra uma OSC pequena. Pra serviços, a API de preço exige o código exato do
item (`codigoItemCatalogo`), sem nível agregado — quando não há dado
suficiente, a sugestão simplesmente não aparece, sem bloquear nada.

## Decisões tomadas

- Sync feito a partir do servidor de desenvolvimento local, não do Cloud
  Run — mesmo motivo já registrado nos syncs anteriores (risco de
  throttling pausar processos em segundo plano).
- Mediana escolhida em vez de média para a sugestão — mais robusta a
  outliers num conjunto pequeno de compras reais.
- Sugestão de preço só é buscada quando o usuário **seleciona** um item da
  lista (nunca em texto livre não vinculado ao catálogo) — evita chamar a
  API pública sem um código válido.

## Arquivos afetados

- `supabase/migrations/003_catalogo_compras.sql` (novo)
- `src/lib/catalogoCompras.ts` (novo)
- `server.ts` — import + 3 endpoints novos
- `src/pages/CotacaoPrevia.tsx` — autocomplete, badge de catálogo, sugestão
  de valor de referência com nota de transparência
- `src/pages/Roadmap.tsx` — 2 tarefas da Fase 2 marcadas concluídas
  (autocomplete de catálogo, sugestão de valor de referência) + 1 nova
  tarefa pendente (resync periódico do catálogo)

## Pendências / próximos passos

- Verificação pré-commit rodada (skill `verificacao-pre-commit`):
  type-check OK, testado de ponta a ponta em produção local (login
  demonstração real, não bypass de dev) — busca "cadeira" retornou 3
  sugestões reais, seleção preencheu descrição + badge "Material" + valor
  de referência R$ 890 com nota "5 compras públicas reais dos últimos 12
  meses". Sem overflow horizontal em mobile (375px).
- Migration já rodada em produção pelo usuário; sync do catálogo (15.030
  PDMs de material + 3.018 itens de serviço) já rodado localmente contra
  o banco de produção — não precisa rodar de novo no deploy.
- Requer novo deploy pra o código (`server.ts`, `CotacaoPrevia.tsx`,
  `Roadmap.tsx`) chegar à URL pública — lembrar `git pull` no Cloud Shell
  antes de `gcloud builds submit`.
- Resync periódico do catálogo registrado como tarefa nova no Roadmap
  (Fase 2), não implementado agora.
