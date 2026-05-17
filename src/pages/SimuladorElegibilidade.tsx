import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';

interface Pergunta {
  id: string;
  texto: string;
  dica: string;
  fundamento: string;
}

const PERGUNTAS: Pergunta[] = [
  {
    id: 'p1',
    texto: 'A OSC existe há pelo menos 3 anos (data de abertura no CNPJ)?',
    dica: 'Verifique a data de abertura no cartão CNPJ ou consulte a aba "Integração (Mapa OSC)".',
    fundamento: 'Art. 33, V, §1º, Lei 13.019/2014',
  },
  {
    id: 'p2',
    texto: 'O CNPJ está ativo e em situação regular na Receita Federal?',
    dica: 'Status deve ser "Ativo" na consulta CNPJ. CNPJs suspensos, inaptos ou baixados são inelegíveis.',
    fundamento: 'Art. 33, III, Lei 13.019/2014',
  },
  {
    id: 'p3',
    texto: 'O estatuto social contém finalidade compatível com o objeto do chamamento?',
    dica: 'Compare o objeto social do estatuto com a finalidade descrita no edital. Deve haver compatibilidade expressa.',
    fundamento: 'Art. 33, I, Lei 13.019/2014',
  },
  {
    id: 'p4',
    texto: 'A OSC possui certidão negativa de débitos trabalhistas (CNDT) válida?',
    dica: 'Emita gratuitamente em tst.jus.br. Validade de 180 dias.',
    fundamento: 'Art. 33, VII, Lei 13.019/2014',
  },
  {
    id: 'p5',
    texto: 'A OSC está em dia com as certidões fiscais federais (Receita Federal/PGFN)?',
    dica: 'Certidão Conjunta de Débitos relativos a Tributos Federais e à Dívida Ativa da União. Emitida em receita.fazenda.gov.br.',
    fundamento: 'Art. 33, V, Lei 13.019/2014',
  },
  {
    id: 'p6',
    texto: 'Nenhum dirigente da OSC é cônjuge, companheiro ou parente até o 2º grau de autoridade pública do órgão concedente?',
    dica: 'Inclui cônjuge, filhos, irmãos e pais dos dirigentes da OSC comparados com servidores do órgão que assinarão a parceria.',
    fundamento: 'Art. 39, I, Lei 13.019/2014',
  },
  {
    id: 'p7',
    texto: 'A OSC não possui dirigente que seja agente público com poder de supervisão, fiscalização ou aprovação das parcerias?',
    dica: 'Ministros, secretários, presidentes de autarquias e seus subordinados não podem ser dirigentes da OSC parceira.',
    fundamento: 'Art. 39, II, Lei 13.019/2014',
  },
  {
    id: 'p8',
    texto: 'A OSC tem capacidade técnica e operacional para executar o objeto do chamamento?',
    dica: 'Avalie: equipe disponível, experiência em projetos similares, infraestrutura mínima necessária.',
    fundamento: 'Art. 24, §1º, Lei 13.019/2014',
  },
];

type Resposta = 'sim' | 'nao' | 'nao_sei';

interface Resultado {
  status: 'elegivel' | 'ressalva' | 'inelegivel';
  titulo: string;
  mensagem: string;
  proximos_passos: string[];
}

function calcularResultado(respostas: Record<string, Resposta>): Resultado {
  const bloqueantes = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
  const naoRespondidas = PERGUNTAS.filter(p => !respostas[p.id]);
  if (naoRespondidas.length > 0) return null as any;

  const inelegiveis = bloqueantes.filter(id => respostas[id] === 'nao');
  const ressalvas = PERGUNTAS.map(p => p.id).filter(id => respostas[id] === 'nao_sei');

  if (inelegiveis.length > 0) {
    return {
      status: 'inelegivel',
      titulo: 'Inelegível — requisitos obrigatórios não atendidos',
      mensagem: `${inelegiveis.length} requisito(s) obrigatório(s) não foram atendidos. A OSC não pode participar do chamamento neste momento.`,
      proximos_passos: inelegiveis.map(id => {
        const p = PERGUNTAS.find(p => p.id === id)!;
        return `Regularizar: ${p.texto}`;
      }),
    };
  }

  if (ressalvas.length > 0) {
    return {
      status: 'ressalva',
      titulo: 'Elegível com Ressalvas — verificação necessária',
      mensagem: `A OSC provavelmente atende os requisitos, mas há ${ressalvas.length} ponto(s) que precisam ser verificados antes de submeter a proposta.`,
      proximos_passos: [
        ...ressalvas.map(id => {
          const p = PERGUNTAS.find(p => p.id === id)!;
          return `Verificar: ${p.texto}`;
        }),
        'Use a aba "Integração (Mapa OSC)" para consultar dados do CNPJ.',
        'Consulte o Assistente SIACT para dúvidas específicas.',
      ],
    };
  }

  return {
    status: 'elegivel',
    titulo: 'Elegível — a OSC atende os requisitos básicos',
    mensagem: 'Todos os requisitos verificados estão em conformidade com a Lei 13.019/2014. A OSC pode prosseguir com a inscrição no chamamento.',
    proximos_passos: [
      'Use o Checklist de Documentos para preparar sua pasta.',
      'Consulte o Assistente SIACT para elaborar o Plano de Trabalho.',
      'Verifique se o edital exige requisitos adicionais específicos.',
    ],
  };
}

const CONFIG_STATUS = {
  elegivel: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
    titulo: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700',
    emoji: '🟢',
  },
  ressalva: {
    bg: 'bg-amber-50 border-amber-200',
    icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
    titulo: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700',
    emoji: '🟡',
  },
  inelegivel: {
    bg: 'bg-red-50 border-red-200',
    icon: <XCircle className="w-8 h-8 text-red-600" />,
    titulo: 'text-red-800',
    badge: 'bg-red-100 text-red-700',
    emoji: '🔴',
  },
};

export function SimuladorElegibilidade() {
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const responder = (id: string, valor: Resposta) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
    setMostrarResultado(false);
  };

  const totalRespondido = Object.keys(respostas).length;
  const resultado = totalRespondido === PERGUNTAS.length ? calcularResultado(respostas) : null;

  const reiniciar = () => { setRespostas({}); setMostrarResultado(false); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A855F7 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Simulador de Elegibilidade</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {PERGUNTAS.length} perguntas — descubra em segundos se sua OSC atende a Lei 13.019/2014
            </p>
          </div>
        </div>
      </div>

      {/* Progresso */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-slate-700">{totalRespondido} de {PERGUNTAS.length} perguntas respondidas</span>
          {totalRespondido > 0 && (
            <button onClick={reiniciar} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-xs">
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          )}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(totalRespondido / PERGUNTAS.length) * 100}%` }} />
        </div>
      </div>

      {/* Perguntas */}
      <div className="space-y-4">
        {PERGUNTAS.map((p, i) => (
          <div key={p.id} className={`bg-white rounded-2xl border-2 shadow-sm p-5 transition-all ${respostas[p.id] ? 'border-slate-200' : 'border-indigo-100'}`}>
            <div className="flex items-start gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm leading-relaxed">{p.texto}</p>
                <p className="text-xs text-slate-500 mt-1">{p.dica}</p>
                <p className="text-xs text-indigo-600 font-medium mt-1">{p.fundamento}</p>
              </div>
            </div>
            <div className="flex gap-2 ml-10">
              {([
                { val: 'sim', label: 'Sim', cls: respostas[p.id] === 'sim' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300 text-slate-600 hover:border-emerald-400' },
                { val: 'nao', label: 'Não', cls: respostas[p.id] === 'nao' ? 'bg-red-500 text-white border-red-500' : 'border-slate-300 text-slate-600 hover:border-red-400' },
                { val: 'nao_sei', label: 'Não sei', cls: respostas[p.id] === 'nao_sei' ? 'bg-amber-400 text-white border-amber-400' : 'border-slate-300 text-slate-600 hover:border-amber-400' },
              ] as const).map(opt => (
                <button
                  key={opt.val}
                  onClick={() => responder(p.id, opt.val)}
                  className={`px-4 py-2 text-sm font-medium border-2 rounded-xl transition-all ${opt.cls}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resultado */}
      {resultado && (
        <div className={`rounded-2xl border-2 p-6 ${CONFIG_STATUS[resultado.status].bg}`}>
          <div className="flex items-center gap-4 mb-4">
            {CONFIG_STATUS[resultado.status].icon}
            <div>
              <h2 className={`text-xl font-bold ${CONFIG_STATUS[resultado.status].titulo}`}>
                {CONFIG_STATUS[resultado.status].emoji} {resultado.titulo}
              </h2>
            </div>
          </div>
          <p className="text-slate-700 mb-4">{resultado.mensagem}</p>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-800">Próximos passos:</p>
            {resultado.proximos_passos.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
