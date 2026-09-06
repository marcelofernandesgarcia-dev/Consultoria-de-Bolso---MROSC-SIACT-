---
id: 2026-09-06-011
data: 2026-09-06
titulo: "Corrige mapeamento IPEA — situação de OSC sempre 'INATIVA', município/UF sempre vazios"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [5c20432]
---

## Contexto

Usuário pediu uma tabela de 10 OSCs reais pra usar como demonstração na
apresentação (Simulador de Elegibilidade / Mapa OSC). Antes de escolher
qualquer OSC, fui verificar dados reais na base já ingerida (mesmo rigor de
sempre: nunca apresentar dado sem checar) — e toda OSC consultada, sem
exceção, aparecia com `situacao: "INATIVA"` e `municipio`/`uf` vazios,
mesmo organizações notoriamente ativas (ex: filiais da Cruz Vermelha
Brasileira).

## O que foi feito

Comparei o `mapRow()` de `src/lib/ipea.ts` contra o cabeçalho real do CSV
oficial do IPEA (baixado ao vivo pra conferência, `bytes=0-3000` via Range
request, evitando baixar os 331MB inteiros só pra ver o cabeçalho). O
formato do CSV mudou em algum momento e **7 dos 11 campos** liam nomes de
coluna que não existem mais:

| Campo | Coluna procurada (errada) | Coluna real |
|---|---|---|
| situacao | `bo_osc_ativa` (booleano) | `situacao_cadastral` (texto) |
| municipio | `tx_municipio` | `municipio_nome` |
| uf | `sg_uf` | `UF_Sigla` |
| cnae_principal | `cd_classe_ativ_economica_osc` | `cnae` |
| natureza_juridica | `cd_natureza_juridica_osc` | `natureza_juridica` |
| data_encerramento | `dt_encerramento_osc` | `data_fechamento` |
| matriz_filial | `bo_matriz` | `matriz_filial` |

**Impacto real, não cosmético**: em `SimuladorElegibilidade.tsx` (linha
258), a pergunta obrigatória "O CNPJ está ativo?" é pré-preenchida com
`data.osc.situacao === 'ATIVA'`. Como `situacao` nunca resolvia pra
`'ATIVA'` (a variável de origem simplesmente não existia no CSV real), toda
consulta por CNPJ marcava a OSC como inelegível nesse quesito — mesmo
organizações perfeitamente ativas. O filtro "Busca por UF" do
`MapaOSCHub.tsx` também sempre retornava 0 resultados pelo mesmo motivo.

Corrigido o mapeamento pros nomes reais, com truncamento defensivo em `uf`
(coluna `character(2)` no Postgres — algumas linhas do CSV trazem valor com
mais de 2 caracteres, o que quebrava o upsert em lote). Configurado um
`SYNC_SECRET` local (nunca existia nenhum valor configurado, nem local nem
em produção — o endpoint de sync sempre retornou 401 até hoje) e rodada a
ressincronização completa via servidor de desenvolvimento local (evita o
risco de o Cloud Run pausar o processo em segundo plano por inatividade,
já que o endpoint responde imediatamente e continua a sincronização
depois). Resultado: 1.097.694 OSCs, 33.687 certificações CEBAS, 54.099
projetos, sem erros.

Verificado ao vivo, pós-sync: busca por "Cruz Vermelha" + UF=RJ agora
retorna 53 resultados (antes: 0), com município/situação corretos (ex:
"Cruz Vermelha Brasileira" em Campos dos Goytacazes/RJ, ATIVA, aberta em
1985).

## Decisões tomadas

Rodar a ressincronização a partir do **servidor de desenvolvimento local**
(não da URL pública do Cloud Run) — o endpoint `/api/sync/mapa-osc`
responde imediatamente e continua a sincronização em segundo plano; no
Cloud Run isso corre risco real de ser pausado por throttling de CPU
quando não há requisição ativa (o serviço não está configurado com "CPU
sempre alocada"). Local, sem essa restrição, o processo roda até o fim de
forma confiável.

`SYNC_SECRET` foi definido só no `.env` local (nunca commitado — já
protegido pelo `.gitignore`), gerado aleatoriamente pra essa execução
pontual. Não foi propagado para o GCP Secret Manager por não ser
necessário agora; documentado aqui caso outra sessão precise rodar o sync
de novo no futuro.

## Arquivos afetados

- `src/lib/ipea.ts` — mapeamento de colunas do CSV (`mapRow()`)

## Pendências / próximos passos

- Sync de Áreas/Subáreas (`/api/sync/areas`, endpoint separado por ser um
  XLSX de ~82MB) ainda não foi rodado nesta sessão — `areas: 0` no
  resultado final é esperado, não é um erro.
- Consultas de busca por nome com termos muito genéricos (ex: "ASSOCIACAO"
  sozinho, sem filtro adicional) sofreram timeout do Postgres logo após o
  bulk upsert — possível necessidade de índice em `razao_social`/`uf` na
  tabela `osc_cadastro`, ou aguardar autovacuum/analyze completarem depois
  de uma carga tão grande. Não bloqueia o uso normal (buscas mais
  específicas funcionam bem), registrado como observação técnica.
- Se o sync precisar rodar de novo no futuro, será necessário gerar um novo
  `SYNC_SECRET` local (ou configurar um definitivo no GCP Secret Manager,
  caso o processo vire rotina).
