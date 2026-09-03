import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Search } from 'lucide-react';

type Fase = 'selecao' | 'execucao' | 'prestacao' | 'tce';

interface Item {
  pergunta: string;
  resposta: string;
  fundamento?: string;
}

const FAQ_DATA: Record<Fase, { titulo: string; cor: string; itens: Item[] }> = {
  selecao: {
    titulo: 'Chamamento e Seleção',
    cor: 'indigo',
    itens: [
      {
        pergunta: 'Minha OSC tem 2 anos e meio de existência. Pode participar do chamamento?',
        resposta: 'Depende da esfera. O tempo mínimo de existência não é fixo em 3 anos — varia conforme quem celebra a parceria: 1 ano para Municípios, 2 anos para Estados e Distrito Federal, e 3 anos para a União. Com 2 anos e meio, sua OSC já pode participar de chamamentos municipais e estaduais/distritais, mas ainda não de chamamentos federais.',
        fundamento: 'Art. 33, V, "a", Lei 13.019/2014',
      },
      {
        pergunta: 'O CNPJ precisa ter o mesmo CNAE da atividade do chamamento?',
        resposta: 'Não necessariamente o mesmo código CNAE, mas a finalidade do estatuto social deve ser compatível com o objeto do chamamento. O edital pode exigir compatibilidade de CNAE. Verifique sempre o edital específico. A compatibilidade estatutária é obrigatória por lei; a de CNAE depende do edital.',
        fundamento: 'Art. 33, I e III, Lei 13.019/2014',
      },
      {
        pergunta: 'As certidões negativas precisam estar válidas na data de inscrição ou na data da celebração?',
        resposta: 'As certidões devem estar válidas na data de apresentação dos documentos ao chamamento. Atenção: elas também precisam estar válidas no momento da celebração do instrumento. Emita com antecedência suficiente e acompanhe as datas de vencimento (CNDT: 180 dias; CND federal: geralmente 60 dias).',
        fundamento: 'Art. 33, V a VII, Lei 13.019/2014',
      },
      {
        pergunta: 'Um dirigente da OSC pode ser casado com servidor do órgão concedente?',
        resposta: 'Depende. Se o cônjuge for servidor sem poder de supervisão, fiscalização ou aprovação da parceria, pode ser possível. Porém, se o cônjuge tiver qualquer poder decisório sobre a parceria (incluindo assinar o instrumento), a OSC estará impedida. Analise a função exata do cônjuge junto ao setor jurídico.',
        fundamento: 'Art. 39, I, Lei 13.019/2014',
      },
      {
        pergunta: 'O chamamento pode dispensar a exigência de tempo mínimo de existência?',
        resposta: 'Sim, mas por um mecanismo específico: a lei admite que cada ente federativo reduza esse prazo por ato próprio, exclusivamente na hipótese de nenhuma organização da região atingir o tempo mínimo exigido. Não existe dispensa geral por "capacidade técnica comprovada" — a OSC continua precisando comprovar capacidade técnica separadamente, além do tempo de existência (reduzido ou não).',
        fundamento: 'Art. 33, V, "a", parte final, Lei 13.019/2014',
      },
    ],
  },
  execucao: {
    titulo: 'Execução da Parceria',
    cor: 'amber',
    itens: [
      {
        pergunta: 'A OSC pode remanejar recursos entre rubricas do plano de trabalho?',
        resposta: 'Sim. O plano de trabalho pode ser revisto para alteração de valores ou metas, formalizado por termo aditivo (mudanças mais substanciais) ou por simples apostilamento (ajustes que não alteram o objeto). A lei não fixa um percentual único válido para todo o país — verifique sempre o instrumento firmado, que detalha os limites e o procedimento aplicável ao seu caso.',
        fundamento: 'Art. 57, Lei 13.019/2014',
      },
      {
        pergunta: 'É obrigatória a cotação de preços para todas as compras?',
        resposta: 'Não existe um valor fixo (como R$ 2.000,00) que dispare essa obrigatoriedade — a OSC segue regras de contratação de direito privado, não o regime de licitação pública. O que a lei exige é comprovar a compatibilidade dos custos com os preços de mercado, usando qualquer um de 11 métodos aceitos (contratação similar recente, ata de registro de preços, tabela de associação profissional, Compras.gov.br, PNCP, entre outros) — cotação com 3 fornecedores é só um deles, não uma exigência isolada.',
        fundamento: 'Art. 46, Lei 13.019/2014; Decreto 8.726/2016, Art. 25, §1º',
      },
      {
        pergunta: 'A OSC pode pagar salários com recursos da parceria?',
        resposta: 'Sim, desde que previsto no plano de trabalho. Podem ser pagos salários, encargos e benefícios de pessoal contratado especificamente para a execução da parceria. Deve haver folha de pagamento, controle de ponto e comprovação da relação de trabalho. Não é permitido o pagamento de dirigentes da OSC.',
        fundamento: 'Art. 46, Lei 13.019/2014',
      },
      {
        pergunta: 'O saldo financeiro da parceria pode ficar na conta corrente?',
        resposta: 'Os recursos devem ficar em conta corrente específica para a parceria. O saldo não aplicado imediatamente deve ser depositado em conta de aplicação financeira vinculada. Os rendimentos pertencem à parceria e devem ser aplicados no objeto, com prestação de contas.',
        fundamento: 'Art. 51 e 53, Lei 13.019/2014',
      },
      {
        pergunta: 'O que acontece se a OSC não conseguir atingir as metas previstas?',
        resposta: 'A OSC deve comunicar imediatamente ao fiscal da parceria e ao órgão concedente, solicitando análise e possível revisão do plano de trabalho. Se o descumprimento for por causa externa e justificável, pode-se formalizar alteração. Descumprimento injustificado pode gerar reprovação da prestação de contas e devolução dos recursos.',
        fundamento: 'Art. 57 e 72, Lei 13.019/2014',
      },
    ],
  },
  prestacao: {
    titulo: 'Prestação de Contas',
    cor: 'emerald',
    itens: [
      {
        pergunta: 'Qual é o prazo para a OSC entregar a prestação de contas final?',
        resposta: 'A Lei 13.019/2014 permite até 90 dias após o fim da parceria, prorrogável por mais 30. Mas atenção: no âmbito federal, o Decreto 8.726/2016 e o Manual MROSC reduzem esse prazo especificamente para o Relatório Final de Execução do Objeto — até 30 dias após o término da execução, prorrogável por mais 15 mediante justificativa prévia da OSC. Como o prazo federal na prática é bem mais curto que os 90 dias da lei geral, confirme sempre o prazo exato no instrumento firmado e use o Calendário de Obrigações do sistema.',
        fundamento: 'Art. 69, Lei 13.019/2014; Decreto 8.726/2016, Art. 62 c/c Art. 65, I',
      },
      {
        pergunta: 'Qual a diferença entre a prestação de contas anual e a prestação de contas final?',
        resposta: 'A prestação de contas anual (intermediária) é obrigatória apenas para parcerias com vigência superior a 12 meses, devendo ser entregue até 30 dias após completar cada 12 meses de execução. A prestação de contas final é obrigatória para todos e deve ser entregue em até 90 dias após o término da parceria.',
        fundamento: 'Art. 69 e §3º, Lei 13.019/2014',
      },
      {
        pergunta: 'O saldo remanescente precisa ser devolvido antes ou depois da prestação de contas?',
        resposta: 'Antes. O saldo não utilizado deve ser devolvido ao órgão concedente em até 30 dias após o término da vigência — prazo improrrogável, sob pena de instauração imediata de Tomada de Contas Especial. Somente após a devolução e a confirmação do pagamento é que a prestação de contas deve ser entregue. O comprovante de devolução é documento obrigatório da prestação de contas.',
        fundamento: 'Art. 52, Lei 13.019/2014',
      },
      {
        pergunta: 'A OSC precisa publicar a prestação de contas em algum sítio eletrônico?',
        resposta: 'Toda parceria, independentemente do valor, precisa ter sua relação divulgada no sítio oficial da administração pública. Para parcerias com valor acumulado acima de R$ 600.000,00, essa divulgação na internet passa a ser obrigatória (não facultativa) — mas o que é publicado são as informações básicas da parceria (identificação, objeto, valores, situação das contas), não um "relatório técnico" ou parecer de prestação de contas.',
        fundamento: 'Art. 10 e 11, Lei 13.019/2014',
      },
      {
        pergunta: 'O que o órgão concedente verifica na prestação de contas?',
        resposta: 'O órgão analisa: (1) execução do objeto — metas atingidas vs. previstas; (2) execução financeira — receitas e despesas; (3) documentação comprobatória — notas fiscais, extratos, folhas de pagamento; (4) nexo causal — as despesas se vinculam às atividades do objeto? O prazo legal para análise é de até 150 dias.',
        fundamento: 'Art. 69 e 71, Lei 13.019/2014',
      },
    ],
  },
  tce: {
    titulo: 'Tomada de Contas Especial',
    cor: 'red',
    itens: [
      {
        pergunta: 'O que é uma Tomada de Contas Especial (TCE)?',
        resposta: 'A TCE é um processo administrativo de apuração de responsabilidade por dano ao erário. Ela é instaurada quando há irregularidade na aplicação de recursos públicos que não foi sanada por via ordinária. Pode resultar em imputação de débito (devolução do valor) e multa ao responsável, além de inscrição no CADIN e SIAFI irregular.',
        fundamento: 'Art. 80, Lei 13.019/2014; IN TCU 98/2024',
      },
      {
        pergunta: 'Recebi notificação de instauração de TCE. Quais são meus direitos?',
        resposta: 'Você tem direito ao contraditório e à ampla defesa. Após notificado, você tem prazo para apresentar alegações de defesa, documentos e justificativas. Caso o débito seja confirmado, você pode recorrer ao Tribunal de Contas competente. Consulte imediatamente um advogado especializado e use o Assistente SIACT para entender a notificação.',
        fundamento: 'Art. 5º, LV, CF/88; Lei 9.784/1999',
      },
      {
        pergunta: 'A TCE pode ser arquivada sem julgamento de mérito?',
        resposta: 'Sim. O processo pode ser arquivado se: o dano ao erário for inferior ao valor mínimo de instauração (R$ 120.000,00); as irregularidades forem sanadas com apresentação de documentação; os responsáveis efetuarem o ressarcimento voluntário do débito antes do julgamento.',
        fundamento: 'IN TCU 98/2024',
      },
      {
        pergunta: 'Quais são as consequências de uma TCE julgada procedente?',
        resposta: 'Imputação de débito (devolução integral do valor com correção monetária e juros), aplicação de multa, inscrição no SIAFI como irregular, possível inclusão em cadastros restritivos (CADIN, CADIP), impossibilidade de celebrar novas parcerias com o poder público enquanto irregular.',
        fundamento: 'Art. 39, §2º, Lei 13.019/2014; Lei 8.443/1992 (Lei Orgânica do TCU)',
      },
      {
        pergunta: 'Como evitar que a prestação de contas leve a uma TCE?',
        resposta: 'Mantenha documentação organizada durante toda a execução; guarde notas fiscais, extratos, folhas de ponto e registros fotográficos; entregue os relatórios periódicos no prazo; devolva o saldo remanescente antes do prazo de 30 dias; envie a prestação de contas final dentro de 90 dias. Use o Checklist de Documentos do sistema para não esquecer nada.',
        fundamento: 'Art. 69, Lei 13.019/2014',
      },
    ],
  },
};

const COR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
};

const TAB_ACTIVE: Record<string, string> = {
  indigo: 'border-indigo-500 text-indigo-700 bg-indigo-50',
  amber: 'border-amber-500 text-amber-700 bg-amber-50',
  emerald: 'border-emerald-500 text-emerald-700 bg-emerald-50',
  red: 'border-red-500 text-red-700 bg-red-50',
};

export function FAQ() {
  const [fase, setFase] = useState<Fase>('selecao');
  const [abertos, setAbertos] = useState<Set<number>>(new Set());
  const [busca, setBusca] = useState('');

  const toggle = (i: number) => {
    setAbertos(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const faseData = FAQ_DATA[fase];
  const itensFiltrados = busca.trim()
    ? faseData.itens.filter(
        item =>
          item.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
          item.resposta.toLowerCase().includes(busca.toLowerCase())
      )
    : faseData.itens;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 55%, #0891B2 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Perguntas Frequentes</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Respostas sobre cada fase da parceria, com fundamento legal citado
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar pergunta..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setAbertos(new Set()); }}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {(Object.entries(FAQ_DATA) as [Fase, typeof FAQ_DATA[Fase]][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setFase(key); setAbertos(new Set()); setBusca(''); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap border-2 transition-all ${
              fase === key ? TAB_ACTIVE[val.cor] : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {val.titulo}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {itensFiltrados.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma pergunta encontrada para "{busca}".</p>
          </div>
        ) : (
          itensFiltrados.map((item, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                abertos.has(i) ? `border-2 ${COR_MAP[faseData.cor].split(' ')[2]}` : 'border-slate-200'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left gap-4"
              >
                <p className={`text-sm font-semibold ${abertos.has(i) ? 'text-slate-900' : 'text-slate-700'}`}>
                  {item.pergunta}
                </p>
                {abertos.has(i)
                  ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>
              {abertos.has(i) && (
                <div className="px-5 pb-5 pt-0 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">{item.resposta}</p>
                  {item.fundamento && (
                    <p className="text-xs text-indigo-600 font-medium">{item.fundamento}</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-indigo-700">
        <strong>Não encontrou sua dúvida?</strong> Use o{' '}
        <strong>Assistente SIACT</strong> para perguntas específicas sobre sua parceria, com análise contextualizada.
      </div>
    </div>
  );
}
