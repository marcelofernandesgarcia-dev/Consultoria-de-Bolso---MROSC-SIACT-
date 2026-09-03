/**
 * Fase 0 de RAG (grounding por prompt-stuffing): texto oficial verbatim dos dispositivos
 * legais que os prompts de IA do server.ts já citam — copiado direto das fontes primárias
 * (planalto.gov.br para Lei/Decreto; gov.br/compras para a IN SEGES/ME) em 03/09/2026,
 * comparando a redação original de 2014/2016 com as redações mais recentes dadas por leis
 * e decretos posteriores, para garantir que só o texto VIGENTE seja usado.
 *
 * Objetivo: parar de depender da memória do modelo pra número de artigo/inciso — ponto mais
 * frágil de qualquer citação jurídica feita por IA. Essa investigação já encontrou e corrigiu
 * várias citações desatualizadas ou erradas que estavam nos prompts (ver commit que introduziu
 * este arquivo).
 *
 * Escopo deliberadamente restrito aos dispositivos já citados hoje — não é o texto completo
 * das leis (decisão explícita: full-law stuffing infla custo/latência de toda chamada de IA
 * sem necessidade, já que a aplicação prática está concentrada nesses artigos).
 */

export const LEI_13019_ARTIGOS = `
LEI Nº 13.019/2014 (MROSC) — redação vigente (com as alterações da Lei nº 13.204/2015)

Art. 2º, VII - termo de colaboração: instrumento por meio do qual são formalizadas as parcerias
estabelecidas pela administração pública com organizações da sociedade civil para a consecução
de finalidades de interesse público e recíproco propostas pela administração pública que
envolvam a transferência de recursos financeiros.

Art. 2º, VIII - termo de fomento: instrumento por meio do qual são formalizadas as parcerias
estabelecidas pela administração pública com organizações da sociedade civil para a consecução
de finalidades de interesse público e recíproco propostas pelas organizações da sociedade civil,
que envolvam a transferência de recursos financeiros.

Art. 2º, VIII-A - acordo de cooperação: instrumento por meio do qual são formalizadas as
parcerias estabelecidas pela administração pública com organizações da sociedade civil para a
consecução de finalidades de interesse público e recíproco que NÃO envolvam a transferência de
recursos financeiros.

Art. 26. O edital deverá ser amplamente divulgado em página do sítio oficial da administração
pública na internet, com antecedência mínima de trinta dias.

Art. 27. O grau de adequação da proposta aos objetivos específicos do programa ou da ação em que
se insere o objeto da parceria e, quando for o caso, ao valor de referência constante do
chamamento constitui critério obrigatório de julgamento.
§ 5º Será obrigatoriamente justificada a seleção de proposta que não for a mais adequada ao
valor de referência constante do chamamento público.

Art. 33. Para celebrar as parcerias previstas nesta Lei, as organizações da sociedade civil
deverão ser regidas por normas de organização interna que prevejam, expressamente:
I - objetivos voltados à promoção de atividades e finalidades de relevância pública e social;
III - que, em caso de dissolução da entidade, o respectivo patrimônio líquido seja transferido
a outra pessoa jurídica de igual natureza que preencha os requisitos desta Lei;
IV - escrituração de acordo com os princípios fundamentais de contabilidade e com as Normas
Brasileiras de Contabilidade;
V - possuir:
  a) no mínimo, um, dois ou três anos de existência, com cadastro ativo, comprovados por meio de
     documentação emitida pela Receita Federal (CNPJ), conforme, respectivamente, a parceria seja
     celebrada no âmbito dos Municípios, do Distrito Federal ou dos Estados e da União, admitida
     a redução desses prazos por ato específico de cada ente na hipótese de nenhuma organização
     atingi-los;
  b) experiência prévia na realização, com efetividade, do objeto da parceria ou de natureza
     semelhante;
  c) instalações, condições materiais e capacidade técnica e operacional para o desenvolvimento
     das atividades ou projetos previstos na parceria e o cumprimento das metas estabelecidas.
§ 1º Na celebração de acordos de cooperação, somente será exigido o requisito previsto no
inciso I.
§ 2º Serão dispensadas do atendimento ao disposto nos incisos I e III as organizações religiosas.
IMPORTANTE: o requisito de tempo mínimo de existência é o inciso V, alínea a — NÃO o inciso I —
e não é um número fixo de "3 anos": varia por esfera federativa (1/2/3 anos).

Art. 34. Para celebração das parcerias previstas nesta Lei, as organizações da sociedade civil
deverão apresentar:
II - certidões de regularidade fiscal, previdenciária, tributária, de contribuições e de dívida
ativa, de acordo com a legislação aplicável de cada ente federado;
III - certidão de existência jurídica expedida pelo cartório de registro civil ou cópia do
estatuto registrado e de eventuais alterações ou, tratando-se de sociedade cooperativa,
certidão simplificada emitida por junta comercial;
V - cópia da ata de eleição do quadro dirigente atual;
VI - relação nominal atualizada dos dirigentes da entidade, com endereço, RG e CPF de cada um;
VII - comprovação de que a organização da sociedade civil funciona no endereço por ela declarado.
IMPORTANTE: o inciso III trata de existência jurídica (não é sobre regularidade trabalhista); os
incisos I, IV e VIII deste artigo foram revogados pela Lei nº 13.204/2015.

Art. 39. Ficará impedida de celebrar qualquer modalidade de parceria a organização da sociedade
civil que:
I - não esteja regularmente constituída ou, se estrangeira, não esteja autorizada a funcionar no
território nacional;
II - esteja omissa no dever de prestar contas de parceria anteriormente celebrada;
III - tenha como dirigente membro de Poder ou do Ministério Público, ou dirigente de órgão ou
entidade da administração pública da mesma esfera governamental na qual será celebrado o termo,
estendendo-se a vedação aos respectivos cônjuges/companheiros e parentes até o 2º grau;
IV - tenha tido as contas rejeitadas pela administração pública nos últimos cinco anos, exceto se
sanada a irregularidade e quitados os débitos, se reconsiderada/revista a decisão, ou se a
apreciação estiver pendente de recurso com efeito suspensivo;
V - tenha sido punida com suspensão de participação em licitação, declaração de inidoneidade, ou
as sanções previstas no art. 73, II e III desta Lei, pelo período que durar a penalidade;
VI - tenha tido contas de parceria julgadas irregulares ou rejeitadas por Tribunal/Conselho de
Contas, em decisão irrecorrível, nos últimos 8 anos;
VII - tenha entre seus dirigentes pessoa cujas contas de parcerias tenham sido julgadas
irregulares/rejeitadas (últimos 8 anos), julgada responsável por falta grave e inabilitada para
cargo em comissão, ou responsável por ato de improbidade (art. 12, I/II/III da Lei 8.429/1992).
§ 1º É igualmente vedada, nessas hipóteses, a transferência de novos recursos em parcerias já em
execução, salvo serviços essenciais que não podem ser adiados, com autorização fundamentada.
§ 2º Persiste o impedimento enquanto não houver ressarcimento do dano ao erário.

Art. 42. As parcerias serão formalizadas mediante termo de colaboração, termo de fomento ou
acordo de cooperação, que terá como cláusulas essenciais:
I - a descrição do objeto pactuado;
II - as obrigações das partes;
III - quando for o caso, o valor total e o cronograma de desembolso;
V - a contrapartida, quando for o caso, observado o disposto no § 1º do art. 35;
VI - a vigência e as hipóteses de prorrogação;
VII - a obrigação de prestar contas com definição de forma, metodologia e prazos;
X - a definição da titularidade dos bens e direitos remanescentes;
XVI - a faculdade dos partícipes rescindirem o instrumento a qualquer tempo, com antecedência
mínima de 60 dias para a publicidade dessa intenção;
XIX - a responsabilidade exclusiva da organização da sociedade civil pelo gerenciamento
administrativo e financeiro dos recursos recebidos;
XX - a responsabilidade exclusiva da organização da sociedade civil pelos encargos trabalhistas,
previdenciários, fiscais e comerciais, sem responsabilidade solidária/subsidiária da
administração pública.
IMPORTANTE: identidade do objeto = inciso I; VIGÊNCIA é o inciso VI (não o II); CONTRAPARTIDA é
o inciso V (não o III) — a numeração pré-2015 usada em versões antigas de material de apoio não
bate mais com o texto vigente.

Art. 45. As despesas relacionadas à execução da parceria serão executadas nos termos dos
incisos XIX e XX do art. 42, sendo vedado:
I - utilizar recursos para finalidade alheia ao objeto da parceria;
II - pagar, a qualquer título, servidor ou empregado público com recursos vinculados à parceria,
salvo nas hipóteses previstas em lei específica e na lei de diretrizes orçamentárias.
IMPORTANTE: os incisos III a IX do texto original de 2014 (que vedavam expressamente despesas com
taxa de administração, multas/juros, publicidade com promoção pessoal, obras de ampliação etc.)
foram REVOGADOS pela Lei nº 13.204/2015. A vedação a multas/juros/correção monetária, por
exemplo, hoje está regulada no nível de decreto — ver Decreto 8.726/2016, Art. 39, § 1º abaixo,
que a reintroduz de forma condicionada.

Art. 46. Poderão ser pagas, entre outras despesas, com recursos vinculados à parceria:
I - remuneração da equipe encarregada da execução do plano de trabalho, inclusive de pessoal
próprio da organização, compreendendo impostos, contribuições sociais, FGTS, férias, décimo
terceiro, salários proporcionais, verbas rescisórias e demais encargos sociais/trabalhistas;
II - diárias referentes a deslocamento, hospedagem e alimentação, quando a execução do objeto
assim o exigir;
III - custos indiretos necessários à execução do objeto, seja qual for a proporção em relação
ao valor total da parceria;
IV - aquisição de equipamentos e materiais permanentes essenciais à consecução do objeto e
serviços de adequação de espaço físico necessários à instalação desses equipamentos.

Art. 51. Os recursos recebidos serão depositados em conta corrente específica isenta de tarifa
bancária em instituição financeira pública indicada pela administração pública.
Parágrafo único. Os rendimentos de ativos financeiros serão aplicados no objeto da parceria,
sujeitos às mesmas condições de prestação de contas exigidas para os recursos transferidos.

Art. 52. Por ocasião da conclusão, denúncia, rescisão ou extinção da parceria, os saldos
financeiros remanescentes, inclusive rendimentos de aplicações financeiras, serão devolvidos à
administração pública no prazo IMPRORROGÁVEL de 30 dias, sob pena de imediata instauração de
Tomada de Contas Especial do responsável.

Art. 64. A prestação de contas deverá conter elementos que permitam avaliar se o objeto foi
executado conforme pactuado, com descrição das atividades realizadas e comprovação do alcance
das metas — é a base geral para exigir notas fiscais e documentos comprobatórios de despesa.

Art. 66. A prestação de contas dá-se mediante a análise de:
I - Relatório de Execução do Objeto — atividades desenvolvidas e comparativo de metas propostas
    com resultados alcançados;
II - Relatório de Execução Financeira — descrição das despesas e receitas efetivamente
    realizadas, com vinculação à execução do objeto (exigido quando há descumprimento de metas).

Art. 69. A organização da sociedade civil prestará contas no prazo de até 90 dias a partir do
término da vigência da parceria (ou ao final de cada exercício, se a parceria exceder 1 ano),
prorrogável por até 30 dias. IMPORTANTE: esse é o prazo GERAL da lei — no âmbito federal, o
Decreto 8.726/2016 (Art. 62 c/c Art. 65, I) e o Manual MROSC reduzem o prazo para a entrega do
Relatório Final de Execução do Objeto especificamente para até 30 dias (+15 de prorrogação).

Art. 71. A administração pública apreciará a prestação final de contas no prazo de até 150 dias,
contado do recebimento ou do cumprimento de diligência, prorrogável justificadamente por igual
período.
`.trim();

export const DECRETO_8726_2016_ARTIGOS = `
DECRETO Nº 8.726/2016 — regulamenta a Lei 13.019/2014 para a esfera federal, com a redação
vigente dada pelo Decreto nº 11.948/2024 (a "atualização de 2024" citada nos prompts refere-se
a essas mudanças no Decreto 8.726/2016, não a um decreto autônomo separado).

Art. 12. A administração pública federal poderá optar pela exigência de contrapartida em bens e
serviços SOMENTE na hipótese de celebração de parceria com valor global SUPERIOR a
R$ 1.000.000,00 (um milhão de reais), mediante justificativa técnica.
Parágrafo único. A expressão monetária de contrapartida será identificada no termo, não podendo
ser exigido o depósito do valor correspondente.
IMPORTANTE: este artigo trata exclusivamente de CONTRAPARTIDA — não contém nenhuma regra sobre
"mínimo de 3 propostas de fornecedores" nem qualquer menção a R$ 120.000,00. Essa combinação, se
usada em algum material de apoio, não corresponde ao texto oficial deste artigo.

Art. 39, §1º (redação dada pelo Decreto nº 11.948/2024). As multas, os juros ou as correções
monetárias referentes a pagamentos ou a recolhimentos realizados fora dos prazos pela
organização da sociedade civil poderão ser pagos com recursos da parceria, DESDE QUE decorrentes
de atraso da administração pública federal na liberação de parcelas de recursos financeiros.

Art. 25, §1º (redação dada pelo Decreto nº 11.948/2024) — a comprovação de compatibilidade de
custos com os preços de mercado pode ser feita por QUALQUER UM dos seguintes elementos, sem
prejuízo de outros (não é uma lista de requisitos cumulativos, é um "ou"):
I - contratação similar ou parceria da mesma natureza concluída nos últimos três anos ou em
    execução;
II - ata de registro de preços em vigência adotada por órgãos públicos da região;
III - tabela de preços de associações profissionais;
IV - tabela de preços referenciais da política pública setorial local;
V - pesquisa publicada em mídia especializada;
VI - sítio eletrônico especializado ou de domínio amplo, com data e hora de acesso;
VII - Portal de Compras do Governo Federal - Compras.gov.br;
VIII - Portal Nacional de Contratações Públicas - PNCP;
IX - cotação com três fornecedores ou prestadores de serviço (item ou agrupamento de despesas);
X - pesquisa de remuneração para atividades similares na região;
XI - acordos e convenções coletivas de trabalho.
IMPORTANTE: "cotação com 3 fornecedores" é o inciso IX — UM entre onze métodos aceitos, não uma
exigência isolada nem cumulativa com os demais. A OSC segue regras de contratação de direito
privado, não o regime de licitação pública — exigir cotação rígida de 3 fornecedores em toda
situação, sem considerar os outros 10 métodos igualmente válidos, é rigor além do que a norma
pede.
`.trim();

export const IN_SEGES_ME_65_2021_ARTIGOS = `
INSTRUÇÃO NORMATIVA SEGES/ME Nº 65, DE 7 DE JULHO DE 2021 — pesquisa de preços para aquisição de
bens e contratação de serviços na administração pública federal (aplicável também quando entes
subnacionais executam recursos da União por transferência voluntária, conforme seu Art. 1º, §2º).
Texto integral tem apenas 11 artigos — NÃO existe "Art. 34" nesta norma.

Art. 2º, II - sobrepreço: preço orçado para licitação ou contratado em valor EXPRESSIVAMENTE
SUPERIOR aos preços referenciais de mercado. IMPORTANTE: a norma não define sobrepreço por um
percentual fixo (não há "25%" no texto oficial) — é um conceito qualitativo. Qualquer limiar
numérico de sobrepreço usado pelo sistema é critério de negócio próprio, não uma exigência
literal desta IN, e deve ser apresentado como tal, não como citação legal.

Art. 5º, IV - um dos parâmetros aceitos para pesquisa de preços é a "pesquisa direta com, no
mínimo, 3 (três) fornecedores, mediante solicitação formal de cotação, por meio de ofício ou
e-mail, desde que seja apresentada justificativa da escolha desses fornecedores e que não
tenham sido obtidos os orçamentos com mais de 6 (seis) meses de antecedência da data de
divulgação do edital". IMPORTANTE: esta é a fonte real do "mínimo de 3 propostas" — é o
Art. 5º, IV, não o Art. 34, e não está condicionada a nenhum valor de R$ 120.000.

Art. 6º, §5º. Excepcionalmente, será admitida a determinação de preço estimado com base em
menos de três preços, desde que devidamente justificada nos autos e aprovada pela autoridade
competente.
`.trim();

export const TCU_NORMATIVOS_RESUMO = `
NORMATIVOS DO TCU (Resolução-TCU 344/2022 e Instrução Normativa TCU 98/2024) — resumo verificado
via portal oficial do TCU em 03/09/2026. O app não cita artigos específicos destas normas, só o
número/ano, então aqui vai o escopo confirmado (não é transcrição literal de artigo):

Resolução-TCU nº 344, de 11/10/2022: regulamenta a prescrição das pretensões punitiva e de
ressarcimento no âmbito do TCU, estabelecendo prazo de 5 (cinco) anos e os critérios de
interrupção e contagem desse prazo, com base na Lei nº 9.873/1999.

Instrução Normativa TCU nº 98, de 27/11/2024: dispõe sobre a instauração, organização e
encaminhamento dos processos de Tomada de Contas Especial (TCE) ao TCU, substituindo a IN TCU
71/2012. Confirma o limite de R$ 120.000,00: a instauração de TCE NÃO é dispensada se o valor do
débito for igual ou superior a esse valor (abaixo dele, e sobretudo abaixo de R$ 20.000,00 para
fins de somatório de débitos do mesmo responsável, a instauração pode ser dispensada).
IMPORTANTE: este limite de R$ 120.000 é especificamente sobre instauração de TCE — não é, por si
só, um limite de "requisitos simplificados" genéricos de toda e qualquer parceria MROSC; usar
esse número fora do contexto de TCE deve deixar claro que é uma analogia, não citação direta.

Súmula TCU nº 254: trata da NÃO inclusão do IRPJ e da CSLL na taxa de BDI (Bonificações e
Despesas Indiretas) de orçamentos de licitação — é sobre tributos em orçamento de obra/licitação,
SEM relação com pesquisa de preços de OSCs nem com exigência de número mínimo de propostas. Se
algum material de apoio citar a Súmula 254 como base para "pesquisa de preços com 3 propostas",
essa citação está incorreta — a base real para "3 propostas" é o Art. 5º, IV da IN SEGES/ME
65/2021 (ver IN_SEGES_ME_65_2021_ARTIGOS).
`.trim();

/** Bloco único, pronto pra ser injetado nos prompts que citam dispositivos legais específicos. */
export const BASE_NORMATIVA_MROSC = `
# BASE NORMATIVA VERIFICADA (use estes textos como fonte — não "lembre" de artigo/inciso de cor)

${LEI_13019_ARTIGOS}

${DECRETO_8726_2016_ARTIGOS}

${IN_SEGES_ME_65_2021_ARTIGOS}

${TCU_NORMATIVOS_RESUMO}
`.trim();
