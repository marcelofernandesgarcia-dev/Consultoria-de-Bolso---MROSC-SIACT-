export type TipoAula = 'texto' | 'quiz' | 'visual';

export interface Aula {
  id: string;
  titulo: string;
  duracao: string;
  tipo: TipoAula;
  conteudo: string; // markdown
}

export interface Modulo {
  id: string;
  titulo: string;
  aulas: Aula[];
}

export interface Curso {
  id: number;
  titulo: string;
  descricao: string;
  modulos: Modulo[];
}

export const CURSOS: Curso[] = [
  {
    id: 1,
    titulo: 'Introdução ao MROSC',
    descricao: 'Fundamentos da Lei 13.019/2014 e Decreto 11.948/2024.',
    modulos: [
      {
        id: 'm1',
        titulo: '1. Introdução e Marco Regulatório',
        aulas: [
          {
            id: 'a1-1',
            titulo: 'ONG vs OSC: A Diferença Jurídica',
            duracao: '15:00',
            tipo: 'texto',
            conteudo: `## ONG vs OSC: A Diferença Jurídica

ONG e OSC são termos frequentemente usados como sinônimos, mas juridicamente há distinções importantes.

**ONG (Organização Não Governamental)** é um termo popular e genérico para entidades privadas sem fins lucrativos. Não possui definição legal precisa no ordenamento jurídico brasileiro — é um conceito sociológico e midiático, não jurídico.

**OSC (Organização da Sociedade Civil)** é a nomenclatura legal oficial adotada no Brasil pela Lei 13.019/2014. A OSC define a entidade pelo que ela é (uma organização estruturada da sociedade) e sua função, garantindo maior transparência. Na prática, "OSC" é o termo técnico formal exigido pelo Estado para receber recursos públicos.

A Lei 13.019/2014 estabelece o regime jurídico das parcerias entre a administração pública e as organizações da sociedade civil, em regime de mútua cooperação, para a consecução de finalidades de interesse público e recíproco.

### Quais entidades são consideradas OSC pela lei?

De acordo com o Art. 2º, I da Lei 13.019/2014, são OSCs:

- **Entidades privadas sem fins lucrativos** — associações e fundações que não distribuem resultados entre sócios ou dirigentes
- **Sociedades cooperativas** — desde que integradas por pessoas em situação de vulnerabilidade e sem fins econômicos
- **Organizações religiosas** — que se dediquem a atividades ou projetos de interesse público e de cunho social

### Por que a distinção importa?

O uso do termo correto não é mero formalismo. Somente entidades qualificadas como OSC nos termos da Lei 13.019/2014 podem celebrar **Termos de Fomento**, **Termos de Colaboração** e **Acordos de Cooperação** com o poder público.

> **Fundamento legal:** Art. 2º, I, Lei 13.019/2014`,
          },
          {
            id: 'a1-2',
            titulo: 'O que é a Agenda MROSC?',
            duracao: '15:00',
            tipo: 'texto',
            conteudo: `## O que é a Agenda MROSC?

O **Marco Regulatório das Organizações da Sociedade Civil (MROSC)** é o conjunto de normas que regulamentam a relação entre o Estado e as OSCs no Brasil. Ele representa uma mudança de paradigma: da lógica da desconfiança para a lógica da colaboração.

### Histórico e Motivação

Antes do MROSC, as OSCs sofriam com:
- Exigências documentais excessivas e não padronizadas
- Insegurança jurídica nos convênios
- Foco em procedimentos em vez de resultados
- Ausência de regras claras para prestação de contas

A **Lei 13.019/2014** (Marco Regulatório) surgiu após amplo diálogo social e foi aprimorada pela **Lei 13.204/2015**. Em 2024, o **Decreto 11.948** modernizou e simplificou as regras, especialmente para parcerias de menor porte.

### Os 3 instrumentos do MROSC

| Instrumento | Quando usar | Recursos |
|-------------|-------------|----------|
| **Termo de Colaboração** | Política pública definida pelo governo | Sim |
| **Termo de Fomento** | Proposta de iniciativa da OSC | Sim |
| **Acordo de Cooperação** | Sem transferência de recursos | Não |

### Princípios da Agenda MROSC

1. **Transparência** — publicidade das parcerias e prestações de contas
2. **Efetividade** — foco em resultados, não apenas em procedimentos
3. **Simplicidade** — redução de burocracia, especialmente para OSCs pequenas
4. **Segurança jurídica** — regras claras e uniformes

> **Fundamento legal:** Lei 13.019/2014, Arts. 5º e 6º; Decreto 11.948/2024`,
          },
          {
            id: 'a1-3',
            titulo: 'Regime Jurídico de Parcerias',
            duracao: '20:00',
            tipo: 'texto',
            conteudo: `## Regime Jurídico de Parcerias

O regime jurídico instituído pela Lei 13.019/2014 define as regras que governam toda a relação entre administração pública e OSCs — desde o chamamento até a prestação de contas final.

### Âmbito de aplicação

A lei se aplica às parcerias celebradas pela **União, Estados, Distrito Federal e Municípios** com OSCs. Há algumas exclusões expressas:

- Entidades filantrópicas e sem fins lucrativos no campo da saúde (regidas por lei específica)
- Serviços sociais autônomos (SESI, SENAI, SESC)
- Organizações Sociais (OS) e OSCIPs com contratos de gestão

### Fases do ciclo de parcerias

> PLANEJAMENTO → CHAMAMENTO → SELEÇÃO → CELEBRAÇÃO → EXECUÇÃO → PRESTAÇÃO DE CONTAS

**1. Planejamento** — O órgão define o objeto, valor estimado e requisitos. Obrigatório elaborar Plano de Trabalho e publicar edital.

**2. Chamamento Público** — Processo seletivo aberto, garantindo isonomia. Prazo mínimo de 30 dias para inscrições (Art. 26).

**3. Seleção** — Comissão avalia propostas com critérios objetivos previstos no edital.

**4. Celebração** — Assinatura do instrumento após aprovação do Plano de Trabalho.

**5. Execução** — Realização das atividades, com acompanhamento do fiscal.

**6. Prestação de Contas** — Relatório de execução e financeiro entregue em até 90 dias após o término.

### Instrumentos e suas características

**Termo de Fomento** — Usado quando a OSC toma a iniciativa de propor a parceria. Ideal para inovação social.

**Termo de Colaboração** — Usado quando o governo propõe o objeto e seleciona a OSC que vai executar.

**Acordo de Cooperação** — Sem transferência de recursos. Para cooperação técnica, compartilhamento de estrutura, etc.

> **Fundamento legal:** Arts. 2º, 16 e 42, Lei 13.019/2014`,
          },
          {
            id: 'a1-4',
            titulo: 'Quem são consideradas OSC?',
            duracao: '25:00',
            tipo: 'texto',
            conteudo: `## Quem são consideradas OSC?

A Lei 13.019/2014 define com precisão quais entidades podem ser parceiras da administração pública sob o regime do MROSC.

### Definição legal (Art. 2º, I)

São organizações da sociedade civil:

**a) Entidades privadas sem fins lucrativos**
- Associações civis, fundações e organizações religiosas
- Não distribuem resultados, sobras, excedentes ou parcelas do patrimônio
- Não remuneram dirigentes pela função associativa
- Aplicam integralmente os recursos na consecução do objeto social

**b) Sociedades cooperativas**
- Integradas por pessoas em situação de vulnerabilidade social e econômica
- Dedicadas à execução de atividades de interesse público
- Sem finalidade econômica principal

**c) Organizações religiosas**
- Que se dediquem a atividades ou projetos de interesse público e de cunho social
- Distintas das atividades de culto religioso
- Sujeitas às mesmas regras das demais OSCs

### O que NÃO pode ser OSC parceira

- Partidos políticos
- Entidades de classe e associações patronais e sindicais
- Clubes beneficentes de servidores públicos
- Entidades criadas pelo próprio poder público

### Requisitos de elegibilidade (Art. 33)

Para participar de um chamamento, a OSC deve comprovar:

| Requisito | Fundamento | Prazo/Validade |
|-----------|------------|----------------|
| Existência há pelo menos **3 anos** | Art. 33, V, §1º | Data de abertura no CNPJ |
| **CNPJ ativo** e regular | Art. 33, III | Verificar na Receita Federal |
| **Estatuto** compatível com o objeto | Art. 33, I | Vigente |
| **CNDT** — Certidão Negativa de Débitos Trabalhistas | Art. 33, VII | 180 dias |
| **CND** — Certidão Negativa Federal | Art. 33, V | 60 dias |
| Ausência de **impedimentos** do Art. 39 | Art. 39 | — |

> **Dica prática:** Use o Simulador de Elegibilidade do sistema para verificar se sua OSC atende todos os requisitos antes de inscrever no chamamento.

> **Fundamento legal:** Art. 2º, I e Art. 33, Lei 13.019/2014`,
          },
          {
            id: 'a1-5',
            titulo: 'Diretrizes Fundamentais',
            duracao: '30:00',
            tipo: 'texto',
            conteudo: `## Diretrizes Fundamentais do MROSC

A Lei 13.019/2014 estabelece um conjunto de diretrizes que orientam toda a relação entre administração pública e OSCs. Conhecê-las é essencial para entender a lógica do sistema.

### As 12 Diretrizes (Art. 5º e 6º)

**1. Gestão pública democrática**
As parcerias devem promover a participação social e o controle público das ações governamentais.

**2. Participação social**
OSCs são reconhecidas como agentes fundamentais no desenvolvimento de políticas públicas.

**3. Fortalecimento da sociedade civil**
O Estado deve apoiar o desenvolvimento institucional das OSCs, não apenas utilizá-las para prestação de serviços.

**4. Transparência e controle social**
Todas as parcerias devem ser publicadas, com informações acessíveis ao cidadão.

**5. Integração e capilaridade**
OSCs têm papel na execução de políticas onde o Estado tem dificuldade de chegar.

**6. Sinergia entre parcerias e políticas públicas**
As parcerias devem estar alinhadas com as políticas públicas vigentes.

### Princípios práticos que decorrem das diretrizes

**Proporcionalidade** — O Decreto 11.948/2024 criou regras simplificadas para parcerias de até R$ 120 mil, reconhecendo que OSCs menores não podem cumprir as mesmas exigências que grandes entidades.

**Resultado** — O foco da análise é se as metas foram atingidas, não apenas se os procedimentos foram seguidos. Uma OSC que atingiu 100% das metas com pequenas irregularidades procedimentais deve ser tratada diferente de uma que não atingiu os resultados.

**Boa-fé** — A lei presume a boa-fé das OSCs. Irregularidades formais, sem dano ao erário, devem ser sanadas e não puníveis.

### O papel do fiscal da parceria

Um dos elementos mais importantes do MROSC é a figura do **fiscal** (Art. 67). Ele é o servidor público designado para:
- Acompanhar a execução in loco
- Emitir relatórios periódicos
- Alertar sobre desvios ou dificuldades
- Intermediar a relação entre a OSC e o gestor

> O fiscal não é auditor. Seu papel é de acompanhamento e apoio, não de fiscalização punitiva.

> **Fundamento legal:** Arts. 5º, 6º e 67, Lei 13.019/2014; Decreto 11.948/2024`,
          },
          {
            id: 'a1-6',
            titulo: 'Mapa Mental: Regime Jurídico MROSC',
            duracao: '15:00',
            tipo: 'visual',
            conteudo: `## Mapa Mental: Regime Jurídico MROSC

Este mapa sintetiza a estrutura normativa do Marco Regulatório das OSCs.

\`\`\`
MROSC — Marco Regulatório das OSCs
│
├── LEGISLAÇÃO BASE
│   ├── Lei 13.019/2014 (Lei Principal)
│   ├── Lei 13.204/2015 (Alterações)
│   └── Decreto 11.948/2024 (Modernização)
│
├── INSTRUMENTOS
│   ├── Termo de Fomento (iniciativa da OSC)
│   ├── Termo de Colaboração (iniciativa do governo)
│   └── Acordo de Cooperação (sem recursos)
│
├── FASES DO CICLO
│   ├── 1. Planejamento
│   ├── 2. Chamamento Público (≥30 dias)
│   ├── 3. Seleção (critérios objetivos)
│   ├── 4. Celebração
│   ├── 5. Execução + Fiscalização
│   └── 6. Prestação de Contas (90 dias)
│
├── ATORES
│   ├── Administração Pública (concedente)
│   ├── OSC (convenente)
│   └── Fiscal (servidor designado)
│
└── CONTROLE
    ├── TCU (União)
    ├── TCE (Estados)
    └── CGU (controle interno)
\`\`\`

### Hierarquia normativa aplicada

| Norma | Âmbito | Hierarquia |
|-------|--------|-----------|
| Lei 13.019/2014 | Federal, Estadual, Municipal | Lei Ordinária |
| Decreto 11.948/2024 | Federal | Decreto Regulamentador |
| Portaria MGI/2024 | Federal | Portaria Ministerial |
| Decreto Estadual/Municipal | Subnacional | Regulamento local |

> **Atenção:** Estados e Municípios devem editar seus próprios regulamentos respeitando os limites da Lei 13.019/2014.`,
          },
          {
            id: 'a1-7',
            titulo: 'Guia Visual: O Ciclo das Parcerias MROSC',
            duracao: '15:00',
            tipo: 'visual',
            conteudo: `## Guia Visual: O Ciclo Completo das Parcerias MROSC

### Fase 1 — Planejamento (Responsabilidade do Órgão)

> O órgão identifica a necessidade, define o objeto e elabora o Plano de Trabalho modelo.

**Documentos produzidos:**
- Estudo Técnico Preliminar (ETP)
- Minuta do Edital
- Minuta do Plano de Trabalho

---

### Fase 2 — Chamamento Público

> Publicação do edital com prazo mínimo de **30 dias** para inscrições.

**Checklist do chamamento:**
- ☐ Publicado no Diário Oficial
- ☐ Publicado no Portal de Transferências
- ☐ Prazo ≥ 30 dias
- ☐ Critérios de seleção objetivos
- ☐ Requisitos de elegibilidade informados

---

### Fase 3 — Seleção

> Comissão avalia as propostas. A OSC com melhor pontuação é convocada.

**Critérios típicos:**
1. Mérito da proposta (adequação ao objeto)
2. Capacidade técnica da equipe
3. Experiência anterior comprovada
4. Custo-benefício

---

### Fase 4 — Celebração

> Assinatura do instrumento e abertura da conta bancária específica.

**Obrigações:**
- ☐ Conta bancária exclusiva para a parceria
- ☐ Plano de Trabalho aprovado
- ☐ Certidões negativas válidas
- ☐ Portaria de designação do fiscal

---

### Fase 5 — Execução

> A OSC executa as atividades conforme o Plano de Trabalho aprovado.

**Obrigações periódicas:**
- Relatórios de execução (mensal ou trimestral)
- Manutenção da documentação das despesas
- Comunicação imediata de impedimentos

---

### Fase 6 — Prestação de Contas

> **Prazo:** 90 dias após o término da vigência.

**Documentos obrigatórios:**
- Relatório de execução do objeto (metas x resultados)
- Relatório de execução financeira
- Extratos bancários completos
- Notas fiscais e recibos
- Comprovante de devolução do saldo (se houver)

> **Após a prestação de contas:** O órgão tem até **150 dias** para emitir o parecer técnico-financeiro.`,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    titulo: 'Fase de Seleção e Edital',
    descricao: 'Como elaborar e analisar editais de chamamento público.',
    modulos: [
      {
        id: 'm2',
        titulo: '2. O Chamamento Público',
        aulas: [
          {
            id: 'a2-1',
            titulo: 'Estrutura do Edital de Chamamento',
            duracao: '20:00',
            tipo: 'texto',
            conteudo: `## Estrutura do Edital de Chamamento Público

O edital de chamamento é o instrumento que convida as OSCs a participar do processo seletivo. Sua estrutura é padronizada pela Lei 13.019/2014 e deve conter elementos obrigatórios.

### Elementos obrigatórios do edital (Art. 24)

**1. Objeto da parceria**
Descrição clara e objetiva do que será executado. Deve ser específico o suficiente para que a OSC saiba exatamente o que é esperado, mas sem restringir indevidamente a participação.

**2. Critérios de seleção e julgamento das propostas**
Devem ser objetivos, mensuráveis e divulgados antes da seleção. Não podem ser alterados após a publicação.

**3. Requisitos de elegibilidade**
Documentos e condições mínimas para participar. Devem observar os requisitos do Art. 33 (existência há 3 anos, certidões negativas, etc.).

**4. Prazo para apresentação das propostas**
Mínimo de **30 dias** corridos a partir da publicação no Diário Oficial.

**5. Condições para celebração da parceria**
O que a OSC selecionada precisará apresentar para formalizar a parceria.

**6. Prazo de vigência**
Duração prevista para a execução da parceria.

**7. Valor máximo a ser concedido**
Ou a metodologia de cálculo, quando não for possível fixar valor exato.

### Causas de desclassificação automática

- Proposta de OSC inelegível (não atende requisitos do Art. 33)
- Proposta em desacordo com o objeto
- Proposta com irregularidades formais insanáveis

> **Fundamento legal:** Art. 24, Lei 13.019/2014; Art. 26, Decreto 11.948/2024`,
          },
          {
            id: 'a2-2',
            titulo: 'Prazo e Publicidade do Chamamento',
            duracao: '15:00',
            tipo: 'texto',
            conteudo: `## Prazo e Publicidade do Chamamento

### Prazo mínimo de 30 dias

O Art. 26 da Lei 13.019/2014 estabelece prazo mínimo de **30 (trinta) dias** corridos para apresentação de propostas a partir da publicação do chamamento.

Este prazo pode ser ampliado pelo órgão concedente, mas não reduzido. A contagem inicia no dia seguinte à publicação no Diário Oficial.

**Exceção:** Para chamamentos de emergência (Art. 30), o prazo pode ser reduzido, mas deve ser justificado.

### Onde deve ser publicado

A publicidade do chamamento é obrigatória e deve ocorrer simultaneamente em:

1. **Diário Oficial** (da União, Estado ou Município, conforme o ente federativo)
2. **Portal de Transferências do Governo Federal** (transferegov.gov.br) — para entes federais
3. **Sítio eletrônico oficial** do órgão concedente

### Erros comuns que invalidam o chamamento

| Erro | Consequência |
|------|-------------|
| Prazo inferior a 30 dias | Nulidade do chamamento |
| Publicação apenas no site (sem Diário Oficial) | Invalidade formal |
| Alteração dos critérios após publicação | Nulidade dos atos subsequentes |
| Critérios subjetivos de seleção | Impugnação |

### Impugnação do edital

Qualquer interessado pode impugnar o edital dentro do prazo previsto. O órgão tem obrigação de responder e, se procedente, corrigir o edital e reiniciar o prazo de 30 dias.

> **Fundamento legal:** Art. 26, Lei 13.019/2014`,
          },
          {
            id: 'a2-3',
            titulo: 'Hipóteses de Dispensa e Inexigibilidade',
            duracao: '20:00',
            tipo: 'texto',
            conteudo: `## Hipóteses de Dispensa e Inexigibilidade de Chamamento

A regra é que toda parceria seja precedida de chamamento público. Mas a lei prevê exceções.

### Dispensa de chamamento (Art. 30)

O chamamento pode ser **dispensado** (a administração pode contratar diretamente) nas seguintes situações:

**a) Urgência decorrente de situação emergencial**
Desastres naturais, epidemias, situações de calamidade. O prazo e os procedimentos podem ser simplificados.

**b) Programas de proteção a pessoas ameaçadas**
Proteção de vítimas de violência, crianças em situação de risco, testemunhas.

**c) Atividades voltadas a populações em situação de rua**
Serviços de abrigo, alimentação, higiene para pessoas sem moradia.

**d) Parcerias de pequeno valor (Decreto 11.948/2024)**
Parcerias de valor total até R$ 120.000,00 podem ter chamamento simplificado, conforme regulamento do ente federativo.

### Inexigibilidade (Art. 31)

O chamamento é **inexigível** quando houver inviabilidade de competição, em especial:

- OSC que detenha **exclusividade** no atendimento da demanda (ex.: única entidade que atende determinada comunidade isolada)
- OSC que celebre parceria decorrente de **cláusula ou condição prevista em acordo internacional**

### Importante: documentação obrigatória

Mesmo nos casos de dispensa ou inexigibilidade, o órgão deve:
1. Publicar aviso no Diário Oficial
2. Justificar formalmente a dispensa/inexigibilidade
3. Verificar a regularidade da OSC (certidões, CNPJ, impedimentos)

> **Fundamento legal:** Arts. 30 e 31, Lei 13.019/2014`,
          },
          {
            id: 'a2-4',
            titulo: 'Análise de Elegibilidade da OSC',
            duracao: '25:00',
            tipo: 'texto',
            conteudo: `## Análise de Elegibilidade da OSC

A elegibilidade é a verificação dos requisitos mínimos para que a OSC possa participar de um chamamento e celebrar uma parceria.

### Requisitos obrigatórios (Art. 33)

**1. Existência há pelo menos 3 anos (Art. 33, V, §1º)**

A data de abertura registrada no CNPJ deve ser anterior em pelo menos 3 anos à data do chamamento. Não basta a existência do estatuto — é preciso que o CNPJ esteja ativo há esse período.

> Exceção: O órgão pode dispensar esse requisito quando a OSC comprova capacidade técnica por outros meios.

**2. CNPJ ativo e regular**

O status na Receita Federal deve ser "ATIVO". CNPJs inaptos, suspensos ou baixados são inelegíveis.

**3. Estatuto compatível com o objeto**

O objeto social descrito no estatuto deve ter relação direta com o objeto do chamamento. Uma OSC voltada para educação ambiental não pode se candidatar a um chamamento de saúde pública.

**4. Certidão Negativa de Débitos Trabalhistas (CNDT)**

Emitida gratuitamente em tst.jus.br. Validade de 180 dias. Deve estar válida na data de inscrição E na data de celebração.

**5. Certidões fiscais federais**

Certidão Conjunta de Débitos relativos a Tributos Federais e à Dívida Ativa da União. Emitida em receita.fazenda.gov.br.

**6. Certidões estaduais e municipais**

Conforme exigido pelo edital específico.

### Impedimentos (Art. 39) — causas de inelegibilidade absoluta

- Dirigente cônjuge/companheiro/parente até 2º grau de autoridade do órgão concedente
- Dirigente que seja agente público com poder de supervisão da parceria
- OSC punida com suspensão ou declaração de inidoneidade
- OSC com contas reprovadas e com débito não regularizado

### Ferramenta prática

Use o **Simulador de Elegibilidade** no menu lateral para verificar automaticamente todos os requisitos antes de inscrever sua OSC.

> **Fundamento legal:** Art. 33, 34 e 39, Lei 13.019/2014`,
          },
          {
            id: 'a2-5',
            titulo: 'Plano de Trabalho: Estrutura e Requisitos',
            duracao: '30:00',
            tipo: 'texto',
            conteudo: `## Plano de Trabalho: Estrutura e Requisitos

O Plano de Trabalho é o documento mais importante da parceria. Ele define o QUÊ, COMO, QUANDO e QUANTO será executado.

### Elementos obrigatórios (Art. 22)

**1. Descrição do objeto**
O que será feito. Deve ser preciso, mensurável e limitado ao escopo da parceria.

**2. Justificativa**
Por que esta parceria é necessária? Qual problema social ela resolve? Dados e diagnósticos que fundamentam a necessidade.

**3. Descrição das metas**
Resultados quantitativos e qualitativos esperados. Cada meta deve ser:
- **Específica** — o que exatamente será alcançado
- **Mensurável** — como será medida
- **Alcançável** — realista com os recursos disponíveis
- **Relevante** — conectada ao objeto
- **Temporal** — com prazo definido

**4. Previsão de receitas e despesas**
Orçamento detalhado com cada rubrica de gasto e a fonte dos recursos.

**5. Forma de execução das atividades**
Metodologia, cronograma de atividades e equipe responsável.

**6. Definição dos parâmetros para aferição do cumprimento das metas**
Como o fiscal saberá que a meta foi atingida? Indicadores objetivos.

### Diferença entre atividade, meta e indicador

| Conceito | Exemplo |
|----------|---------|
| **Atividade** | Realizar oficinas de formação |
| **Meta** | Capacitar 150 jovens em 6 meses |
| **Indicador** | Número de certificados emitidos |

### Erros mais comuns no Plano de Trabalho

- Metas vagas ("fortalecer a comunidade", "promover a cidadania")
- Orçamento sem detalhamento (rubrica genérica "serviços")
- Cronograma inconsistente com o valor disponível
- Ausência de indicadores verificáveis

> **Fundamento legal:** Art. 22, Lei 13.019/2014; Art. 15, Decreto 11.948/2024`,
          },
          {
            id: 'a2-6',
            titulo: 'Critérios de Julgamento e Pontuação',
            duracao: '20:00',
            tipo: 'texto',
            conteudo: `## Critérios de Julgamento e Pontuação das Propostas

### Como funciona o processo de seleção

A comissão de seleção avalia cada proposta com base nos critérios definidos no edital. A pontuação máxima e os pesos de cada critério devem estar claramente especificados antes do chamamento.

### Critérios típicos (Art. 27, Decreto 11.948/2024)

**1. Mérito da proposta (peso maior)**
- Clareza e adequação do objeto proposto
- Qualidade das metas e indicadores
- Inovação e impacto social esperado

**2. Capacidade técnica e operacional**
- Experiência prévia em projetos similares
- Qualificação da equipe técnica
- Estrutura física e tecnológica disponível

**3. Economicidade**
- Relação custo-benefício do orçamento
- Compatibilidade dos valores com o mercado
- Adequação dos recursos às metas propostas

### Exemplo de tabela de pontuação

| Critério | Peso | Pontuação Máx. |
|----------|------|----------------|
| Mérito da proposta | 40% | 40 pts |
| Capacidade técnica | 30% | 30 pts |
| Economicidade | 20% | 20 pts |
| Experiência anterior | 10% | 10 pts |
| **Total** | **100%** | **100 pts** |

### Desempate

Em caso de empate na pontuação, a lei estabelece preferência para:
1. OSC com maior tempo de existência
2. OSC que já tenha parceria anterior bem avaliada com o mesmo órgão
3. OSC com maior número de beneficiários atendidos

> **Fundamento legal:** Art. 27, Decreto 11.948/2024; Art. 28, Lei 13.019/2014`,
          },
          {
            id: 'a2-7',
            titulo: 'Recursos e Impugnações',
            duracao: '15:00',
            tipo: 'texto',
            conteudo: `## Recursos e Impugnações no Processo Seletivo

### Impugnação do edital

Qualquer interessado pode impugnar o edital por motivo de ilegalidade ou irregularidade. A impugnação deve ser:
- **Tempestiva** — dentro do prazo fixado no edital
- **Fundamentada** — indicar o dispositivo legal violado
- **Formal** — apresentada por escrito

**Efeito:** A impugnação suspende o processo até que seja respondida. Se procedente, o órgão deve corrigir o edital e reiniciar o prazo de 30 dias.

### Recurso contra a decisão de seleção

A OSC que não for selecionada tem direito a recurso administrativo. O edital deve prever:
- Prazo para interposição do recurso
- Prazo para contrarrazões
- Prazo para decisão

**Efeito:** O recurso tem efeito suspensivo — a parceria não pode ser celebrada enquanto o prazo recursal não esgotar ou o recurso não for julgado.

### Motivos mais comuns de impugnação e recurso

| Motivo | Base legal |
|--------|-----------|
| Critério subjetivo de seleção | Art. 24, IV, Lei 13.019/2014 |
| Prazo inferior a 30 dias | Art. 26, Lei 13.019/2014 |
| Requisito que restringe competição | Art. 24, Lei 13.019/2014 |
| Desclassificação sem fundamentação | Princípio da motivação (Lei 9.784/1999) |

> **Dica:** Guarde todos os protocolos de entrega de documentos. Em caso de impugnação, a prova de tempestividade é essencial.

> **Fundamento legal:** Art. 26, Lei 13.019/2014; Lei 9.784/1999`,
          },
          {
            id: 'a2-8',
            titulo: 'Simulado: Fase de Seleção',
            duracao: '20:00',
            tipo: 'quiz',
            conteudo: `## Simulado: Fase de Seleção e Edital

Teste seus conhecimentos com estas questões práticas sobre chamamentos públicos.

---

**Questão 1**
Uma OSC foi fundada há 2 anos e 8 meses. Ela pode participar de um chamamento público?

✗ **Não.** O requisito mínimo é de **3 anos** de existência comprovada pela data de abertura no CNPJ (Art. 33, V, §1º, Lei 13.019/2014). Mesmo que a OSC tenha grande capacidade técnica, este requisito é bloqueante.

---

**Questão 2**
Um edital foi publicado com prazo de 25 dias para inscrições. Isso é válido?

✗ **Não.** O prazo mínimo legal é de **30 dias** corridos a partir da publicação (Art. 26, Lei 13.019/2014). Um edital com prazo inferior é formalmente inválido e pode ser impugnado por qualquer interessado.

---

**Questão 3**
O presidente de uma OSC é irmão de um servidor do órgão concedente que vai assinar o termo de parceria. Há impedimento?

✓ **Sim.** O Art. 39, I da Lei 13.019/2014 veda a participação de OSC cujo dirigente seja parente até o **2º grau** de autoridade do órgão concedente. Irmão é parente de 2º grau.

---

**Questão 4**
Uma OSC com CNPJ ativo há 5 anos, mas com CNDT vencida há 30 dias, pode se inscrever no chamamento?

✗ **Não.** A CNDT (Certidão Negativa de Débitos Trabalhistas) deve estar **válida** na data de inscrição. Com CNDT vencida, a OSC é inelegível. Solução: emitir nova CNDT gratuitamente em tst.jus.br antes de inscrever.

---

**Questão 5**
Em caso de empate entre duas propostas, qual critério de desempate a lei prevê?

A lei prevê, nesta ordem: (1) OSC com maior tempo de existência; (2) OSC com histórico de parcerias bem avaliadas com o mesmo órgão; (3) critérios definidos no próprio edital.`,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    titulo: 'Plano de Trabalho',
    descricao: 'Metodologia para construção de metas, indicadores e orçamento.',
    modulos: [
      {
        id: 'm3',
        titulo: '3. Elaboração do Plano de Trabalho',
        aulas: [
          {
            id: 'a3-1',
            titulo: 'Metodologia de Construção de Metas',
            duracao: '25:00',
            tipo: 'texto',
            conteudo: `## Metodologia de Construção de Metas

Metas bem construídas são o coração do Plano de Trabalho. Elas garantem que a parceria tenha clareza sobre o que deve ser alcançado e como o sucesso será medido.

### A metodologia SMART aplicada ao MROSC

**S — Específica (Specific)**
A meta deve descrever com precisão o resultado esperado. Evite termos vagos como "melhorar", "fortalecer", "promover" sem quantificação.

❌ "Fortalecer a educação ambiental na comunidade"
✓ "Capacitar 200 moradores do bairro X em gestão de resíduos sólidos"

**M — Mensurável (Measurable)**
Deve ser possível medir numericamente o atingimento da meta.

❌ "Realizar muitas oficinas"
✓ "Realizar 12 oficinas com mínimo de 20 participantes cada"

**A — Alcançável (Achievable)**
A meta deve ser realista com os recursos disponíveis. Uma meta impossível de atingir prejudica a OSC na prestação de contas.

**R — Relevante (Relevant)**
A meta deve contribuir diretamente para o objeto da parceria e para o problema social que justifica a parceria.

**T — Temporal (Time-bound)**
Cada meta deve ter um prazo definido. Use meses ou datas específicas.

### Hierarquia de metas

\`\`\`
OBJETIVO GERAL
└── META 1 (resultado principal)
    ├── Atividade 1.1
    ├── Atividade 1.2
    └── Indicador: [como medir]
└── META 2
    ├── Atividade 2.1
    └── Indicador: [como medir]
\`\`\`

### Indicadores de resultado vs. indicadores de produto

| Tipo | O que mede | Exemplo |
|------|-----------|---------|
| **Produto** | O que foi feito | Número de oficinas realizadas |
| **Resultado** | O que mudou | % de participantes que alteraram comportamento |
| **Impacto** | Mudança de longo prazo | Redução de 15% no descarte irregular em 2 anos |

> **Fundamento legal:** Art. 22, II, Lei 13.019/2014`,
          },
          {
            id: 'a3-2',
            titulo: 'Orçamento e Rubricas Permitidas',
            duracao: '30:00',
            tipo: 'texto',
            conteudo: `## Orçamento: Rubricas Permitidas e Vedações

### Despesas permitidas (Art. 46)

O Plano de Trabalho pode prever despesas com:

**Recursos humanos**
- Salários e encargos de pessoal contratado exclusivamente para a parceria
- Horas de trabalho de pessoal próprio da OSC (com cálculo proporcional)
- Consultores e prestadores de serviço especializados

**Bens e materiais**
- Material de consumo (papel, caneta, material pedagógico)
- Equipamentos — podem ser adquiridos se previstos no plano e necessários à execução

**Serviços**
- Aluguel de espaço (se a OSC não tem sede própria adequada)
- Serviços de comunicação, transporte, utilities
- Contratação de terceiros para serviços específicos

**Custos indiretos (overhead)**
- Permitidos em percentual razoável (geralmente até 15% do valor total)
- Devem ser proporcionais à parceria e justificados

### Despesas VEDADAS (Art. 45)

❌ Taxa de administração, gerência ou similar
❌ Pagamento de despesas realizadas antes ou após a vigência
❌ Publicidade pessoal de agentes públicos
❌ Pagamento de servidor ativo do órgão concedente (salvo casos específicos)
❌ Despesas com fins eleitorais
❌ Multas, juros e correção monetária por inadimplemento da própria OSC

### Cotação prévia de preços (Art. 45, §2º)

Para compras acima de **R$ 2.000,00**, a OSC deve obter no mínimo **3 cotações** de fornecedores diferentes. O processo deve ser documentado e a escolha justificada (menor preço ou melhor custo-benefício).

> Use o módulo **Cotação Prévia** do sistema para analisar se os preços estão compatíveis com o mercado.

> **Fundamento legal:** Arts. 45 e 46, Lei 13.019/2014`,
          },
          {
            id: 'a3-3',
            titulo: 'Cronograma de Desembolso',
            duracao: '20:00',
            tipo: 'texto',
            conteudo: `## Cronograma de Desembolso

O cronograma de desembolso define quando os recursos serão transferidos da administração pública para a OSC e como serão utilizados ao longo da vigência.

### Por que o cronograma é importante

O Tribunal de Contas exige que haja nexo temporal entre o desembolso e a execução das atividades. Recursos transferidos muito antes de serem necessários — ou utilizados muito depois de recebidos — geram questionamentos na prestação de contas.

### Vinculação entre cronograma e metas

Cada desembolso deve estar vinculado a metas específicas do Plano de Trabalho:

\`\`\`
Mês 1-2:  Contratação de equipe + aquisição de materiais → R$ 15.000
Mês 3-4:  Execução das oficinas (fase 1) → R$ 20.000
Mês 5-6:  Execução das oficinas (fase 2) + avaliação → R$ 18.000
Mês 7:    Elaboração do relatório final + sistematização → R$ 7.000
TOTAL:     R$ 60.000
\`\`\`

### Rendimentos das aplicações financeiras

Os recursos enquanto não utilizados devem ser mantidos em **aplicação financeira** vinculada à conta da parceria. Os rendimentos pertencem à parceria e devem ser aplicados no objeto — não devolvidos ao órgão automaticamente.

### Remanejamento entre rubricas

Após a celebração, alterações de até **20% do valor de cada rubrica** geralmente podem ser feitas com autorização do gestor. Alterações maiores exigem **termo aditivo**.

> **Fundamento legal:** Arts. 51, 53 e 57, Lei 13.019/2014`,
          },
          {
            id: 'a3-4',
            titulo: 'Monitoramento e Nexo Causal',
            duracao: '25:00',
            tipo: 'texto',
            conteudo: `## Monitoramento e Nexo Causal

### O que é o nexo causal?

O **nexo causal** é a relação direta entre uma despesa realizada e uma meta prevista no Plano de Trabalho. É o elemento central que o fiscal e o órgão verificam na prestação de contas.

**Pergunta-chave:** Esta despesa contribui diretamente para o atingimento desta meta?

### Exemplos práticos

✅ **Nexo causal presente:**
- Meta: Capacitar 100 jovens em informática
- Despesa: R$ 8.000 em aluguel de laboratório de informática
- → Relação direta e evidente

❌ **Nexo causal ausente:**
- Meta: Capacitar 100 jovens em informática
- Despesa: R$ 3.000 em material de limpeza do escritório da OSC
- → Despesa administrativa geral, sem vinculação à meta

### Como documentar o nexo causal

Cada nota fiscal deve estar acompanhada de:
1. Identificação da meta à qual se vincula
2. Justificativa se a relação não for óbvia
3. Relatório de atividade que comprova a execução

### Ferramenta do sistema

Use o módulo **Nexo Causal** do sistema para cruzar despesas com metas automaticamente. A IA analisa se há relação direta e aponta riscos antes que você entregue a prestação de contas.

### Despesas contestadas por ausência de nexo causal

Se o órgão ou o TCU entender que uma despesa não tem nexo causal com o objeto:
1. A despesa é **glosada** (não reconhecida)
2. O valor deve ser **devolvido ao erário**
3. Em caso de má-fé comprovada, pode gerar **Tomada de Contas Especial (TCE)**

> **Fundamento legal:** Art. 69, IV, Lei 13.019/2014`,
          },
          {
            id: 'a3-5',
            titulo: 'Alterações e Aditivos',
            duracao: '20:00',
            tipo: 'texto',
            conteudo: `## Alterações e Termos Aditivos

Imprevistos acontecem durante a execução de qualquer projeto. O MROSC prevê mecanismos para que a parceria seja ajustada sem causar irregularidade.

### Tipos de alteração

**Alteração simples (sem aditivo)**
- Remanejamento de até 20% entre rubricas
- Ajustes no cronograma de atividades sem impacto nas metas
- Substituição de membro da equipe por profissional equivalente
- **Requer:** autorização do gestor público, com registro

**Termo Aditivo (obrigatório)**
- Prorrogação do prazo de vigência
- Aumento ou redução do valor total
- Alteração do objeto
- Remanejamento superior a 20% de qualquer rubrica
- Mudança nas metas pactuadas

### Procedimento para solicitar aditivo

1. **Comunicação formal** ao fiscal da parceria (com antecedência mínima de 30 dias antes do término da vigência, para prorrogações)
2. **Justificativa fundamentada** explicando o motivo da alteração
3. **Nova versão do Plano de Trabalho** com as alterações destacadas
4. **Análise e aprovação** pelo órgão concedente
5. **Publicação** do aditivo no Diário Oficial

### Prorrogação de ofício

Quando houver atraso por culpa da administração pública (ex.: demora na liberação de parcela de recursos), o prazo deve ser prorrogado de **ofício** pelo órgão, sem necessidade de solicitação da OSC.

> **Atenção:** Nunca realize despesas após o término da vigência, mesmo que a solicitação de prorrogação esteja pendente de análise.

> **Fundamento legal:** Art. 57, Lei 13.019/2014`,
          },
          {
            id: 'a3-6',
            titulo: 'Boas Práticas no Plano de Trabalho',
            duracao: '15:00',
            tipo: 'visual',
            conteudo: `## Boas Práticas no Plano de Trabalho

### Checklist do Plano de Trabalho bem elaborado

**Objeto**
- ☐ Objeto claramente descrito, sem ambiguidade
- ☐ Compatível com o estatuto social da OSC
- ☐ Compatível com o edital do chamamento

**Metas**
- ☐ Todas as metas são SMART (específicas, mensuráveis, etc.)
- ☐ Cada meta tem indicador verificável
- ☐ Metas realistas para o prazo e orçamento disponíveis

**Orçamento**
- ☐ Todas as rubricas são permitidas (verificar vedações do Art. 45)
- ☐ Valores compatíveis com pesquisa de mercado
- ☐ Cronograma de desembolso vinculado às metas

**Equipe**
- ☐ Qualificação da equipe compatível com as atividades
- ☐ Carga horária factível
- ☐ Prestadores de serviço identificados com CNPJ/CPF

**Riscos e mitigação**
- ☐ Principais riscos identificados
- ☐ Plano de contingência para riscos críticos

---

### Erros mais custosos (que levam à reprovação de contas)

| Erro | Consequência |
|------|-------------|
| Meta sem indicador verificável | Impossível atestar o cumprimento |
| Despesa sem nexo causal | Glosa e devolução do valor |
| Remanejamento sem autorização | Irregularidade na prestação de contas |
| Despesa após o término da vigência | Devolução obrigatória |
| Ausência de cotação prévia | Glosa dos valores pagos acima do mercado |

> **Dica final:** Antes de assinar o instrumento de parceria, releia o Plano de Trabalho com o questionamento: "Serei capaz de comprovar 100% do que está escrito aqui?" Se a resposta for não, revise antes de celebrar.`,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    titulo: 'Prestação de Contas',
    descricao: 'Monitoramento, avaliação de resultados e análise financeira.',
    modulos: [
      {
        id: 'm4',
        titulo: '4. Prestação de Contas e Encerramento',
        aulas: [
          { id: 'a4-1', titulo: 'Tipos de Prestação de Contas', duracao: '20:00', tipo: 'texto', conteudo: `## Tipos de Prestação de Contas\n\nA Lei 13.019/2014 prevê dois tipos de prestação de contas:\n\n### Prestação de Contas Anual (Art. 69, §3º)\n\nObrigatória apenas para parcerias com vigência **superior a 12 meses**. Deve ser entregue em até **30 dias após completar cada 12 meses** de execução.\n\nNão encerra a parceria — é uma prestação intermediária, enquanto a parceria ainda está em execução.\n\n### Prestação de Contas Final (Art. 69)\n\nObrigatória para **todas as parcerias**. Deve ser entregue em até **90 dias após o término da vigência**.\n\nEsse prazo é peremptório — o descumprimento caracteriza inadimplência e pode resultar em:\n- Inclusão em cadastros restritivos (CADIN, CADIP)\n- Impossibilidade de celebrar novas parcerias\n- Instauração de Tomada de Contas Especial\n\n### Documentos obrigatórios (Art. 69)\n\n1. Relatório de execução do objeto (metas x resultados)\n2. Relatório de execução financeira (receitas x despesas)\n3. Extrato bancário completo do período\n4. Notas fiscais e recibos de todas as despesas\n5. Comprovante de devolução do saldo remanescente\n6. Comprovante de publicação (parcerias > R$ 600k)\n\n> **Use o Calendário de Prazos** do sistema para calcular automaticamente as datas de prestação de contas com base na data de início e prazo de vigência.\n\n> **Fundamento legal:** Arts. 69 e 73, Lei 13.019/2014` },
          { id: 'a4-2', titulo: 'Saldo Remanescente e Devolução', duracao: '15:00', tipo: 'texto', conteudo: `## Saldo Remanescente e Devolução\n\nO saldo financeiro não utilizado ao final da parceria deve ser devolvido ao erário.\n\n### Prazo para devolução (Art. 73)\n\nO saldo deve ser devolvido em até **30 dias** após o término da vigência — **antes** da entrega da prestação de contas final.\n\n### O que é considerado saldo remanescente\n\n- Recursos não utilizados na conta corrente\n- Rendimentos das aplicações financeiras não utilizados\n- Valores recebidos que não foram aplicados no objeto\n\n### Como devolver\n\n1. Emitir Guia de Recolhimento da União (GRU) ou instrumento equivalente do ente\n2. Depositar o valor na conta indicada pelo órgão concedente\n3. Guardar o comprovante — é documento obrigatório da prestação de contas\n\n### E se a OSC não devolver no prazo?\n\n- Correção monetária + juros de mora\n- Caracterização de inadimplência\n- Possível abertura de Tomada de Contas Especial\n\n> **Atenção:** Rendimentos de aplicação financeira pertencem à parceria — se não utilizados no objeto, devem ser devolvidos junto com o saldo.\n\n> **Fundamento legal:** Art. 73, Lei 13.019/2014` },
          { id: 'a4-3', titulo: 'Análise do Órgão Concedente', duracao: '20:00', tipo: 'texto', conteudo: `## Análise pelo Órgão Concedente\n\nApós o recebimento da prestação de contas, o órgão concedente tem **150 dias** para analisar e emitir parecer.\n\n### O que o órgão verifica\n\n**1. Execução do objeto**\n- As metas previstas foram atingidas?\n- Há documentação comprobatória das atividades?\n- O público beneficiário declarado é real e verificável?\n\n**2. Execução financeira**\n- As despesas têm nexo causal com as metas?\n- Os valores pagos são compatíveis com o mercado?\n- Houve cotação prévia quando exigido?\n\n**3. Regularidade formal**\n- Os documentos estão completos?\n- O saldo foi devolvido?\n- A conta foi encerrada após o término?\n\n### Resultados possíveis da análise\n\n| Resultado | Significado |\n|-----------|------------|\n| **Aprovada** | Prestação de contas regular, parceria encerrada |\n| **Aprovada com ressalvas** | Irregularidades formais sem dano ao erário |\n| **Reprovada** | Dano ao erário ou irregularidade grave |\n| **Reprovada com débito** | OSC deve devolver valores específicos |\n\n### Direito de defesa\n\nAntes de emitir parecer desfavorável, o órgão deve:\n1. Notificar a OSC\n2. Conceder prazo para manifestação (mínimo 30 dias)\n3. Analisar a defesa apresentada\n\n> **Fundamento legal:** Arts. 71 e 72, Lei 13.019/2014` },
          { id: 'a4-4', titulo: 'Tomada de Contas Especial (TCE)', duracao: '30:00', tipo: 'texto', conteudo: `## Tomada de Contas Especial (TCE)\n\nA TCE é o instrumento mais severo de controle. É instaurada quando há indício de irregularidade com dano ao erário que não foi sanado por via ordinária.\n\n### Quando é instaurada (Art. 80)\n\n- OSC não apresentou prestação de contas no prazo\n- Prestação de contas foi reprovada com devolução de recursos\n- Constatado desvio, fraude ou malversação\n- Irregularidade não sanada após notificação e prazo de defesa\n\n### Fases da TCE\n\n**1. Instauração** — O órgão concedente notifica a OSC e inicia o processo administrativo.\n\n**2. Contraditório** — A OSC tem prazo para apresentar defesa, documentos e justificativas.\n\n**3. Julgamento pelo Tribunal de Contas** — O TCU/TCE analisa o processo e julga.\n\n**4. Condenação** (se procedente) — Imputação de débito e/ou multa.\n\n### Consequências da TCE julgada procedente\n\n- Devolução integral do valor com correção monetária e juros\n- Multa de até 100% do valor do débito\n- Inscrição no SIAFI como irregular\n- Inclusão em cadastros restritivos (CADIN)\n- Impedimento de novas parcerias com o poder público\n\n### Como EVITAR a TCE\n\n✓ Manter documentação organizada durante toda a execução\n✓ Entregar relatórios periódicos no prazo\n✓ Devolver o saldo em até 30 dias após o término\n✓ Entregar a prestação de contas final em até 90 dias\n✓ Guardar notas fiscais, extratos e registros fotográficos\n\n> **Use o Assistente SIACT** para orientação se receber notificação de TCE.\n\n> **Fundamento legal:** Art. 80, Lei 13.019/2014; IN TCU 71/2012` },
          { id: 'a4-5', titulo: 'Boas Práticas de Documentação', duracao: '20:00', tipo: 'texto', conteudo: `## Boas Práticas de Documentação durante a Execução\n\nA prestação de contas começa no primeiro dia de execução. A organização dos documentos durante a execução é o que diferencia uma OSC que aprova das contas das que têm problemas.\n\n### Organização física e digital\n\n**Para cada despesa, mantenha:**\n- Nota fiscal ou recibo original\n- Comprovante de pagamento (transferência, depósito)\n- Relatório ou ata da atividade vinculada\n- Fotografia ou evidência da execução\n\n**Organize por:**\n- Mês de competência\n- Meta à qual se vincula\n- Tipo de despesa (RH, material, serviço)\n\n### Documentação de pessoal\n\nSe a parceria prevê pagamento de pessoal:\n- Contrato de trabalho ou de prestação de serviço\n- Folha de pagamento assinada\n- Controle de ponto ou equivalente\n- Comprovante de recolhimento dos encargos\n\n### Registro fotográfico\n\nRecomendado (e exigido por muitos órgãos):\n- Fotos das atividades realizadas com data e localização\n- Listas de presença com assinaturas\n- Registro das entregas de materiais (com recibo dos beneficiários)\n\n### Sistema de controle interno\n\nIdeal para OSCs maiores:\n- Planilha de controle financeiro por rubrica e meta\n- Conciliação bancária mensal\n- Revisão periódica do atingimento das metas\n\n> **Dica:** Use o módulo de **Checklist de Documentos** do sistema para não esquecer nenhum item obrigatório em cada fase da parceria.` },
          { id: 'a4-6', titulo: 'Publicidade e Transparência', duracao: '15:00', tipo: 'texto', conteudo: `## Publicidade e Transparência na Parceria\n\n### Obrigações de publicidade (Art. 11)\n\n**Para todas as parcerias:**\n- O instrumento firmado deve ser publicado no Diário Oficial\n- Informações básicas devem estar disponíveis no Portal de Transparência\n\n**Para parcerias acima de R$ 600.000,00:**\n- Publicação do relatório de execução em sítio eletrônico oficial\n- Publicação da prestação de contas no Portal de Transferências\n- Identificação visual obrigatória nas ações (banners, publicações, redes sociais)\n\n### Identificação das ações da parceria\n\nA OSC deve identificar visualmente que as ações são realizadas com recursos públicos:\n- "Realizado com recursos do [Nome do Órgão] — [Nome do Programa]"\n- Logotipo do órgão concedente nas publicações\n- Referência ao instrumento nos documentos da parceria\n\n### O que não pode na publicidade\n\n❌ Usar a parceria para publicidade pessoal de candidatos ou dirigentes\n❌ Associar o nome de agentes políticos às ações da parceria\n❌ Usar imagens de autoridades políticas no material da parceria\n\n> **Fundamento legal:** Art. 11, Lei 13.019/2014` },
          { id: 'a4-7', titulo: 'Encerramento da Conta Bancária', duracao: '10:00', tipo: 'texto', conteudo: `## Encerramento da Conta Bancária da Parceria\n\nApós o término da vigência e a devolução do saldo, a conta bancária específica deve ser encerrada.\n\n### Procedimento de encerramento\n\n1. Verificar se há saldo — se houver, devolver antes de encerrar\n2. Solicitar extrato final completo (será documento da prestação de contas)\n3. Encerrar a conta no banco\n4. Guardar o comprovante de encerramento\n\n### Por que manter conta aberta é um problema\n\nManter a conta ativa após o encerramento da parceria pode:\n- Gerar tarifas bancárias sem fonte de pagamento\n- Complicar a conciliação do extrato final\n- Gerar questionamentos na prestação de contas sobre movimentações pós-término\n\n### Documentos bancários a guardar\n\n- Extrato completo de toda a vigência\n- Comprovantes de aplicação financeira\n- Comprovante de devolução do saldo (GRU)\n- Comprovante de encerramento da conta\n\n> **Fundamento legal:** Art. 51, Lei 13.019/2014` },
          { id: 'a4-8', titulo: 'Simulado Final: Prestação de Contas', duracao: '25:00', tipo: 'quiz', conteudo: `## Simulado Final: Prestação de Contas\n\nTestando os conhecimentos do módulo completo de prestação de contas.\n\n---\n\n**Questão 1**\nUma parceria tem vigência de 18 meses. Quantas prestações de contas a OSC deve entregar?\n\n✓ **Duas.** Uma prestação de contas anual (30 dias após completar 12 meses de execução) e uma prestação de contas final (90 dias após o término da vigência).\n\n---\n\n**Questão 2**\nA parceria terminou em 30 de junho. Quando é o prazo máximo para devolver o saldo remanescente?\n\n✓ **30 de julho** (30 dias após o término). O prazo para a prestação de contas final é **28 de setembro** (90 dias após o término).\n\n---\n\n**Questão 3**\nOs rendimentos da aplicação financeira vinculada à conta da parceria pertencem a quem?\n\n✓ **À parceria.** Os rendimentos devem ser utilizados no objeto da parceria. Se não utilizados, são devolvidos junto com o saldo remanescente.\n\n---\n\n**Questão 4**\nUma despesa de R$ 4.500 em material esportivo foi realizada em uma parceria que tem como objeto a capacitação profissional de jovens. Há nexo causal?\n\n✗ **Provavelmente não.** Material esportivo em uma parceria de capacitação profissional não tem relação direta evidente. A OSC precisaria justificar detalhadamente a vinculação à meta de capacitação para que a despesa seja aceita.\n\n---\n\n**Questão 5**\nO órgão concedente reprovará a prestação de contas sem antes notificar a OSC?\n\n✗ **Não.** Antes de emitir parecer desfavorável, o órgão deve notificar a OSC e conceder prazo mínimo de 30 dias para manifestação e apresentação de defesa (princípio do contraditório e ampla defesa, Art. 5º, LV, CF/88).` },
          { id: 'a4-9', titulo: 'Revisão Final e Próximos Passos', duracao: '15:00', tipo: 'texto', conteudo: `## Revisão Final e Próximos Passos\n\nParabéns por concluir o módulo de Prestação de Contas!\n\n### O que você aprendeu\n\n✓ Diferença entre prestação de contas anual e final\n✓ Prazos obrigatórios e suas consequências\n✓ Procedimento de devolução do saldo remanescente\n✓ Como o órgão analisa a prestação de contas\n✓ O que é a Tomada de Contas Especial e como evitá-la\n✓ Boas práticas de documentação durante a execução\n✓ Obrigações de publicidade e transparência\n\n### Ferramentas do sistema para usar agora\n\n- **Calendário de Prazos** — calcule automaticamente todas as datas da sua parceria\n- **Checklist de Documentos** — selecione "Prestação de Contas" para ver todos os documentos necessários\n- **Nexo Causal** — verifique se suas despesas têm vinculação com as metas antes de fechar a prestação de contas\n- **Assistente SIACT** — tire dúvidas específicas sobre sua situação\n\n### Próximos módulos recomendados\n\nSe você é **OSC**, volte para o módulo **Plano de Trabalho** para aprofundar o tema de metas e orçamento.\n\nSe você é **Gestor Público**, use o módulo de **Fase de Seleção e Edital** para entender como estruturar chamamentos conformes.\n\n> **Lembre-se:** A melhor prestação de contas começa no primeiro dia de execução. Documente tudo.` },
          { id: 'a4-10', titulo: 'Recursos Adicionais e Legislação', duracao: '10:00', tipo: 'visual', conteudo: `## Recursos Adicionais e Legislação de Referência\n\n### Base Legal Completa\n\n| Norma | Ementa |\n|-------|--------|\n| Lei 13.019/2014 | Marco Regulatório das OSCs |\n| Lei 13.204/2015 | Alterações ao MROSC |\n| Decreto 11.948/2024 | Regulamentação federal modernizada |\n| IN TCU 71/2012 | Tomada de Contas Especial |\n| IN TCU 98/2024 | Atualização das normas de TCE |\n| Lei 9.784/1999 | Processo administrativo federal |\n\n### Portais e sistemas úteis\n\n- **transferegov.gov.br** — Sistema federal de transferências\n- **plataformaosc.org.br** — Plataforma de editais e oportunidades\n- **mapaosc.ipea.gov.br** — Mapa das Organizações da Sociedade Civil\n- **tst.jus.br** — Emissão gratuita da CNDT\n- **receita.fazenda.gov.br** — Consulta CNPJ e certidões federais\n\n### Funcionalidades do SIACT-MROSC\n\n| Módulo | Finalidade |\n|--------|------------|\n| Simulador de Elegibilidade | Verificar requisitos do Art. 33 |\n| Checklist de Documentos | Documentos por fase da parceria |\n| Calendário de Prazos | Calcular datas obrigatórias |\n| Radar Normativo | Analisar conformidade de editais |\n| Nexo Causal | Cruzar despesas com metas |\n| Assistente SIACT | Dúvidas em linguagem simples ou técnica |\n| FAQ | Perguntas frequentes por fase |` },
        ],
      },
    ],
  },
];
