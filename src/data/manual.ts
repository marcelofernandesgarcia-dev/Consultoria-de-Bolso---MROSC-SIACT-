// Conteúdo do Manual de Uso (/manual) — descreve o que cada tela do app faz de fato,
// escrito a partir da leitura do código real de cada página (não é uma promessa de produto,
// é um espelho do comportamento atual). Serve dois propósitos:
// 1) a página /manual, lida por humanos;
// 2) contexto injetado no Assistente Flutuante pela rota atual (ver getManualContextForPath
//    em AssistenteFlutuante.tsx) — sem isso, o assistente não tem nenhuma noção da interface
//    e responde "não tenho essa informação" quando perguntado sobre uma tela específica.

export type PerfilManual = 'osc' | 'setorial' | 'ambos';

export interface ManualItem {
  id: string;
  /** Rota da tela, quando existir uma — usada pra casar o contexto do Assistente Flutuante
   *  com a página em que o usuário está. Itens sem rota própria (ex: o botão flutuante em
   *  si) ficam sem path. */
  path?: string;
  titulo: string;
  perfil: PerfilManual;
  paraQueServe: string;
  comoUsar: string;
  iaFaz?: string;
  iaNaoFaz?: string;
}

export interface ManualBloco {
  id: string;
  titulo: string;
  itens: ManualItem[];
}

export const MANUAL_DATA: ManualBloco[] = [
  {
    id: 'antes-da-parceria',
    titulo: 'Antes da Parceria (OSC)',
    itens: [
      {
        id: 'chamamentos',
        path: '/chamamentos',
        titulo: 'Chamamentos Abertos',
        perfil: 'osc',
        paraQueServe: 'Encontrar editais abertos, entender o que pedem e testar sua proposta antes de enviar oficialmente.',
        comoUsar: `A tela tem 3 abas.
Radar de Oportunidades — lista automática de editais vindos do Mapa das OSC (IPEA) e da Plataforma Prosas. Clique em "Explicar Edital" num item pra IA resumir prazos, checklist e dicas; clique em "Pré-Análise da Proposta" pra ir direto pra aba 3 já usando aquele edital como referência.
Explicar Edital — cole o texto (ou envie o PDF) de um edital que não apareceu na lista, e a IA devolve o mesmo resumo em linguagem simples.
Pré-Análise da Proposta — cole o texto (ou envie o PDF) da sua proposta. Se você chegou a partir de um edital do Radar, a IA compara a proposta contra o edital selecionado e simula a visão da comissão de seleção, apontando pontos fracos e sugestões antes do envio oficial.`,
        iaFaz: 'Resume editais e avalia propostas com base no texto fornecido.',
        iaNaoFaz: 'Não envia nada em seu nome — a análise é só um apoio antes da submissão real no site do edital.',
      },
      {
        id: 'simulador',
        path: '/simulador',
        titulo: 'Simulador de Elegibilidade',
        perfil: 'osc',
        paraQueServe: 'Descobrir em poucos minutos se sua OSC atende aos 8 requisitos legais pra participar de um chamamento (Lei 13.019/2014).',
        comoUsar: `1. Escolha a esfera da parceria (Municipal, Estadual/Distrital ou Federal) — o tempo mínimo de existência exigido muda conforme a esfera (1, 2 ou 3 anos).
2. Opcional: busque o CNPJ da sua OSC no painel "Consultar OSC na base IPEA" — isso pré-preenche automaticamente as perguntas 1 (tempo de existência) e 2 (CNPJ ativo).
3. Responda Sim / Não / Não sei às 8 perguntas.
4. Ao final, o sistema mostra o resultado: Elegível, Elegível com ressalvas (há "não sei" pendente) ou Inelegível (algum requisito obrigatório reprovado), com os próximos passos recomendados.`,
        iaFaz: 'Só as perguntas 1 e 2 são automáticas (dados reais do IPEA/Receita Federal).',
        iaNaoFaz: 'As perguntas 3 a 8 (compatibilidade de estatuto, CNDT, certidões fiscais, parentesco com agente público, poder de supervisão, capacidade técnica) ainda são manuais — a própria tela mostra um aviso e um selo "Em breve" ou "sem prazo definido" ao lado de cada uma, com o plano de automação futura.',
      },
      {
        id: 'checklist',
        path: '/checklist',
        titulo: 'Checklist de Documentos',
        perfil: 'osc',
        paraQueServe: 'Gerar a lista exata de documentos exigidos, com o artigo de lei correspondente, pra cada fase da parceria.',
        comoUsar: `Escolha a fase (Chamamento, Celebração, Execução ou Prestação de Contas) e o porte da parceria (Pequeno < R$120k com regras simplificadas do Decreto 11.948/2024, Médio ou Grande). Marque os itens já providenciados — a barra de progresso conta só os obrigatórios. Use "Imprimir / Salvar PDF" pra levar a lista impressa.`,
        iaNaoFaz: 'A lista é fixa, baseada na legislação — não é gerada por IA nesta tela.',
      },
      {
        id: 'calendario',
        path: '/calendario',
        titulo: 'Calendário de Prazos',
        perfil: 'osc',
        paraQueServe: 'Calcular automaticamente todos os prazos obrigatórios da parceria a partir da data de início.',
        comoUsar: `Informe a data de início da vigência, o prazo total (em meses) e a periodicidade dos relatórios (mensal/trimestral). Escolha o âmbito (Federal — prestação de contas final em 30+15 dias; ou Estadual/Municipal — regra geral da Lei, 90 dias). O sistema gera a linha do tempo completa: relatórios periódicos, prestação de contas intermediária (se vigência > 12 meses), término da vigência, devolução do saldo (30 dias, prazo improrrogável), prestação de contas final e prazo de análise do órgão (150 dias) — cada um com selo de urgência e artigo de lei. "Exportar PDF" imprime a lista.`,
        iaNaoFaz: 'Cálculo de datas determinístico, sem IA.',
      },
    ],
  },
  {
    id: 'execucao-e-controle',
    titulo: 'Execução e Controle',
    itens: [
      {
        id: 'integracao',
        path: '/integracao',
        titulo: 'Mapa OSC',
        perfil: 'ambos',
        paraQueServe: 'Consultar o perfil oficial de uma OSC, cruzando Receita Federal (via BrasilAPI) com a base local do IPEA (330 mil+ organizações).',
        comoUsar: `Duas abas — Por CNPJ (busca uma OSC específica e mostra natureza jurídica, situação cadastral, data de abertura, elegibilidade por tempo de existência e certificações CEBAS, quando houver) ou Por Nome (busca por nome/parte do nome, com filtro de UF, retornando uma lista).`,
        iaNaoFaz: 'Nada — é busca direta em bases de dados, sem análise de IA.',
      },
      {
        id: 'governanca',
        path: '/governanca',
        titulo: 'Governança',
        perfil: 'ambos',
        paraQueServe: 'Checar se os dirigentes da OSC têm algum impedimento legal pra celebrar a parceria (parentesco ou vínculo com agente público — Art. 39, Lei 13.019/2014).',
        comoUsar: `Informe nome, cargo e vínculos de cada dirigente (texto livre) ou envie o PDF da declaração de dirigentes. Clique em "Analisar Impedimentos" — a IA aponta o status (conforme/atenção/não conforme), recomendações e base legal.`,
        iaFaz: 'Interpreta o texto informado e identifica possíveis impedimentos.',
        iaNaoFaz: 'Não consulta nenhum cadastro público de servidores — depende inteiramente do que for digitado ou enviado.',
      },
      {
        id: 'normas',
        path: '/normas',
        titulo: 'Radar Normativo',
        perfil: 'ambos',
        paraQueServe: 'Verificar se um trecho de edital ou estatuto está em conformidade com o Decreto 11.948/2024 (que simplificou exigências documentais do MROSC).',
        comoUsar: `Cole o texto (ou envie o PDF) do edital/estatuto e clique em "Analisar Conformidade". O resultado mostra documentos que já podem ser dispensados por esse decreto e pontos de atenção com ação recomendada pra cada um.`,
        iaFaz: 'Lê o trecho fornecido e compara com o decreto.',
        iaNaoFaz: 'Não analisa o edital inteiro automaticamente nem busca o texto na internet.',
      },
      {
        id: 'planejamento',
        path: '/planejamento',
        titulo: 'Cotação Prévia',
        perfil: 'ambos',
        paraQueServe: 'Verificar se os preços cotados por fornecedores estão dentro da faixa aceitável em relação ao valor de referência (Art. 46, Lei 13.019/2014).',
        comoUsar: `Adicione quantos itens precisar (descrição, unidade, quantidade, valor de referência e valor cotado) — o rascunho é salvo automaticamente no navegador. Cada item mostra a variação % automaticamente (até 10% = Conforme, até 25% = Ressalva, acima = Rejeitado). Os cartões de total só aparecem depois que pelo menos um valor cotado é preenchido. Clique em "Analisar" pra IA dar um parecer consolidado sobre o conjunto de itens.`,
        iaFaz: 'Interpreta o conjunto de itens e o percentual de variação já calculado, e devolve um parecer textual.',
        iaNaoFaz: 'O cálculo de variação em si (%) é feito pelo sistema, não pela IA.',
      },
      {
        id: 'monitoramento',
        path: '/monitoramento',
        titulo: 'Nexo Causal',
        perfil: 'ambos',
        paraQueServe: 'Verificar se uma despesa realizada realmente se conecta com uma meta prevista no Plano de Trabalho — item central de qualquer prestação de contas.',
        comoUsar: `Preencha (ou envie por PDF) a descrição da despesa/nota fiscal de um lado e a meta correspondente do Plano de Trabalho do outro. Clique em "Auditar Nexo Causal" — a IA aponta evidências que confirmam o vínculo, riscos identificados e recomendações.`,
        iaFaz: 'Compara os dois textos fornecidos.',
        iaNaoFaz: 'Não acessa automaticamente notas fiscais ou o Plano de Trabalho cadastrado em outro lugar do sistema — cada auditoria é isolada, com o que for colado ali.',
      },
    ],
  },
  {
    id: 'setorial',
    titulo: 'Setorial (Gestor Público)',
    itens: [
      {
        id: 'dashboard',
        path: '/dashboard',
        titulo: 'Dashboard',
        perfil: 'setorial',
        paraQueServe: 'Visão geral de todas as análises de IA já realizadas no sistema (Cotação Prévia, Governança, Radar Normativo, Nexo Causal etc.), com contagem por status e lista das mais recentes.',
        comoUsar: `É só uma tela de leitura — abre automaticamente com os dados agregados da conta. Não há nenhuma ação a realizar aqui além de consultar o histórico.`,
        iaNaoFaz: 'Nada nesta tela — ela só exibe o resultado de análises já feitas nas outras ferramentas.',
      },
      {
        id: 'parecer',
        path: '/parecer',
        titulo: 'Parecer Técnico',
        perfil: 'setorial',
        paraQueServe: 'Gerar um parecer técnico-jurídico redigido pela IA, com dois modos.',
        comoUsar: `Modo Geral — digite uma pergunta jurídica sobre o MROSC (ou use um dos temas rápidos sugeridos). A IA devolve conclusão, fundamentação, base legal, ressalvas e orientação, com opção de baixar em PDF.
Modo "Prestação de Contas Final (Anexo VII)" — preencha os dados de identificação do processo (número, instrumento, OSC, objeto, gestor responsável) e cole os relatórios/documentos da prestação de contas. A IA gera o parecer técnico conclusivo seguindo a estrutura oficial do Anexo VII do Manual MROSC (8 seções: Introdução, Avaliação das Ações, Cumprimento de Metas, Impactos, Satisfação do Público-Alvo, Sustentabilidade, Transparência e Conclusão), com desfecho recomendado.`,
        iaFaz: 'Redige a minuta do parecer com base no que for informado.',
        iaNaoFaz: 'A validação final, a assinatura e a decisão continuam sendo exclusivas do gestor público responsável — a própria IA reforça isso ao final de cada resposta.',
      },
    ],
  },
  {
    id: 'transversais',
    titulo: 'Transversais',
    itens: [
      {
        id: 'assistente',
        path: '/assistente',
        titulo: 'Assistente SIACT',
        perfil: 'ambos',
        paraQueServe: 'Tirar dúvidas jurídicas sobre o MROSC a qualquer momento, em dois tons: Simples (linguagem cidadã, pra OSC) ou Técnica (linguagem institucional, pra Setorial/DTPAR). Disponível tanto como botão flutuante em qualquer tela quanto como página cheia.',
        comoUsar: `Clique no botão roxo flutuante no canto da tela (ou acesse a página cheia pelo menu), escolha o modo, digite a pergunta ou anexe um PDF de contexto (até 10MB).`,
        iaFaz: 'Responde com base na legislação (Lei 13.019/2014, decretos, normas TCU/CGU).',
        iaNaoFaz: 'Não inventa artigo de lei, dado ou fato que não tenha base concreta — se não sabe, diz que não sabe.',
      },
      {
        id: 'capacitacao',
        path: '/capacitacao',
        titulo: 'Capacitação',
        perfil: 'ambos',
        paraQueServe: 'Trilha de cursos em vídeo/texto sobre o MROSC, organizada em módulos com aulas.',
        comoUsar: `Escolha um curso, acompanhe o progresso (salvo automaticamente no navegador) e assista às aulas uma a uma.`,
        iaNaoFaz: 'Conteúdo educacional fixo, sem geração por IA.',
      },
      {
        id: 'faq',
        path: '/faq',
        titulo: 'Perguntas Frequentes',
        perfil: 'ambos',
        paraQueServe: 'Respostas prontas pra dúvidas comuns sobre cada fase da parceria (Chamamento, Execução, Prestação de Contas, TCE), sempre com o artigo de lei citado.',
        comoUsar: `Escolha a fase (aba) e use a busca pra filtrar; clique numa pergunta pra expandir a resposta.`,
      },
      {
        id: 'arquitetura',
        path: '/arquitetura',
        titulo: 'Arquitetura',
        perfil: 'ambos',
        paraQueServe: 'Página institucional que explica os "5 pilares" do sistema (propósito legal, funcionalidades etc.) — é uma apresentação do projeto, não um manual de uso.',
        comoUsar: `Só leitura — role a página pra conhecer os pilares.`,
      },
      {
        id: 'roadmap',
        path: '/roadmap',
        titulo: 'Roadmap',
        perfil: 'ambos',
        paraQueServe: 'Mostrar publicamente o que já está pronto e o que está planejado (ex.: integração com Conecta.gov.br, automações futuras do Simulador de Elegibilidade) — transparência sobre os limites atuais do MVP.',
        comoUsar: `Só leitura — role a página pra ver as fases.`,
      },
      {
        id: 'privacidade',
        path: '/privacidade',
        titulo: 'Privacidade e Dados',
        perfil: 'ambos',
        paraQueServe: 'Explica quais dados o sistema coleta, com que base legal (LGPD), e como pedir acesso, correção ou exclusão dos seus dados, ou contestar uma análise de IA.',
        comoUsar: `Só leitura — a página traz um canal de contato (e-mail) tanto para pedidos de direitos LGPD quanto para reportar erro numa análise de IA.`,
      },
      {
        id: 'inicio',
        path: '/inicio',
        titulo: 'Tela inicial "Por onde começar"',
        perfil: 'ambos',
        paraQueServe: 'Assistente de 3 passos que direciona o usuário às ferramentas certas.',
        comoUsar: `Escolha seu perfil (OSC ou Setorial) → escolha a fase da parceria em que está (Chamamento, Plano de Trabalho, Execução, Prestação de Contas ou TCE) → o sistema recomenda as ferramentas mais relevantes pra aquela combinação, com uma delas marcada "Comece aqui". A escolha fica salva — ao voltar pra essa tela depois, ela retoma de onde parou.`,
      },
    ],
  },
];

/**
 * Trecho do manual referente à rota atual, pra injetar no contexto do Assistente Flutuante.
 * Sem isso, o assistente não tem nenhuma noção da interface do app — só do direito
 * (Lei 13.019/2014 e correlatos) — e responde "não tenho essa informação" quando
 * perguntado sobre uma tela específica (ex: "como uso a aba de governança?").
 */
export function getManualContextForPath(pathname: string): string | null {
  for (const bloco of MANUAL_DATA) {
    for (const item of bloco.itens) {
      if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) {
        const partes = [
          `# CONTEXTO DA TELA ATUAL: ${item.titulo}`,
          `O usuário está nesta tela agora. Pra que serve: ${item.paraQueServe}`,
          `Como usar: ${item.comoUsar}`,
        ];
        if (item.iaFaz) partes.push(`O que a IA faz aqui: ${item.iaFaz}`);
        if (item.iaNaoFaz) partes.push(`O que a IA NÃO faz aqui: ${item.iaNaoFaz}`);
        partes.push('Se a pergunta do usuário for sobre como usar esta tela, responda com base neste contexto — não diga que não tem essa informação.');
        return partes.join('\n');
      }
    }
  }
  return null;
}
