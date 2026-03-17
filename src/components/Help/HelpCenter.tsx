import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Book, 
  Shield, 
  AlertTriangle, 
  Gavel, 
  Users, 
  Info,
  ExternalLink,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: 'INSTRUMENTS' | 'LEGAL' | 'ELIGIBILITY' | 'SECURITY' | 'RESPONSIBILITY';
  audience: 'BOTH' | 'OSC' | 'CONCEDENTE';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'instruments-diff',
    category: 'INSTRUMENTS',
    audience: 'BOTH',
    question: 'Qual a diferença entre Termo de Colaboração e Termo de Fomento?',
    answer: (
      <div className="space-y-2">
        <p>A distinção reside na <strong>iniciativa</strong> da parceria:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Termo de Colaboração:</strong> Proposto pela Administração Pública para consecução de planos de trabalho por ela estabelecidos.</li>
          <li><strong>Termo de Fomento:</strong> Proposto pelas OSCs para a consecução de planos de trabalho por elas idealizados.</li>
        </ul>
        <p className="text-xs text-slate-500 mt-2 italic">Base: Art. 2º da Lei nº 13.019/2014.</p>
      </div>
    )
  },
  {
    id: 'legal-prohibitions',
    category: 'LEGAL',
    audience: 'BOTH',
    question: 'Quais são as principais vedações no uso dos recursos (Art. 45)?',
    answer: (
      <div className="space-y-2">
        <p>Informo que é terminantemente proibido:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Pagamento de remuneração a servidores ativos da Administração Pública Concedente.</li>
          <li>Realização de despesas que não possuam nexo causal com o objeto da parceria.</li>
          <li>Pagamento de despesas em data anterior ou posterior à vigência da parceria.</li>
        </ul>
        <p className="font-medium text-cyan-700 mt-2">Dica: Utilize sempre o termo "pactuar" ao definir metas orçamentárias no plano de trabalho.</p>
      </div>
    )
  },
  {
    id: 'eligibility-time',
    category: 'ELIGIBILITY',
    audience: 'OSC',
    question: 'Quanto tempo de existência a OSC precisa ter para pactuar com a União?',
    answer: (
      <div className="space-y-2">
        <p>Para parcerias com a Administração Pública Federal (União), a OSC deve comprovar no mínimo <strong>02 (dois) anos</strong> de existência, com cadastro ativo no CNPJ.</p>
        <p className="text-xs text-slate-500 italic">Base: Art. 33, inciso V, da Lei nº 13.019/2014.</p>
      </div>
    )
  },
  {
    id: 'security-lgpd',
    category: 'SECURITY',
    audience: 'BOTH',
    question: 'Como o SIACT-MROSC trata meus dados e a LGPD?',
    answer: (
      <div className="space-y-2">
        <p>A segurança é nossa prioridade. Seguimos as diretrizes da LGPD:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Anonimização:</strong> É obrigatório o mascaramento de dados sensíveis (CPF, dados de saúde) antes do upload.</li>
          <li><strong>Alerta de Alucinação:</strong> O sistema utiliza modelos probabilísticos. Valide sempre cálculos e citações legais antes de oficializar qualquer documento.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'responsibility-server',
    category: 'RESPONSIBILITY',
    audience: 'CONCEDENTE',
    question: 'Qual o limite da responsabilidade do servidor ao usar o sistema?',
    answer: (
      <div className="space-y-2">
        <p>Informo que o SIACT-MROSC é uma ferramenta de <strong>suporte técnico</strong>.</p>
        <p>A autoria e responsabilidade final pelos atos administrativos permanecem integralmente com o servidor público. É obrigatório incluir a nota: <em>"Parte do conteúdo gerado com o auxílio de IA"</em> em todos os documentos oficiais derivados desta análise.</p>
      </div>
    )
  }
];

export function HelpCenter() {
  const [perspective, setPerspective] = useState<'OSC' | 'CONCEDENTE'>('CONCEDENTE');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesAudience = faq.audience === 'BOTH' || faq.audience === perspective;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAudience && matchesSearch;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <HelpCircle className="w-10 h-10 text-cyan-600" /> Central de Ajuda & FAQ
          </h1>
          <p className="text-slate-500 mt-2 text-lg italic">
            Suporte inteligente ancorado na Lei nº 13.019/2014 e Decreto nº 11.948/2024.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setPerspective('CONCEDENTE')}
            className={clsx(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              perspective === 'CONCEDENTE' ? "bg-white text-cyan-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Concedente
          </button>
          <button
            onClick={() => setPerspective('OSC')}
            className={clsx(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              perspective === 'OSC' ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            OSC
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Busque por termos legais, artigos ou procedimentos..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-slate-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Tips Banner */}
      <div className={clsx(
        "p-6 rounded-2xl border flex items-start gap-4",
        perspective === 'OSC' ? "bg-emerald-50 border-emerald-100" : "bg-cyan-50 border-cyan-100"
      )}>
        <div className={clsx(
          "p-2 rounded-lg",
          perspective === 'OSC' ? "bg-emerald-100 text-emerald-700" : "bg-cyan-100 text-cyan-700"
        )}>
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className={clsx(
            "font-bold text-lg",
            perspective === 'OSC' ? "text-emerald-900" : "text-cyan-900"
          )}>
            {perspective === 'OSC' ? 'Dica Preventiva para OSCs' : 'Segurança Jurídica para Concedentes'}
          </h3>
          <p className={clsx(
            "text-sm mt-1",
            perspective === 'OSC' ? "text-emerald-700" : "text-cyan-700"
          )}>
            {perspective === 'OSC' 
              ? 'Evite a desclassificação garantindo que sua proposta atenda a todos os critérios do Art. 26 do Dec. 11.948/24. O SIACT pode revisar sua documentação antes do envio.'
              : 'Garanta a conformidade documental para auditorias do TCU/CGU. Utilize o módulo de análise MROSC para validar o nexo causal entre plano de trabalho e metas.'}
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <motion.div 
            key={faq.id}
            whileHover={{ y: -2, borderColor: 'rgb(203 213 225)' }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-colors"
          >
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                  {faq.category === 'INSTRUMENTS' && <Book className="w-5 h-5" />}
                  {faq.category === 'LEGAL' && <Gavel className="w-5 h-5" />}
                  {faq.category === 'ELIGIBILITY' && <Users className="w-5 h-5" />}
                  {faq.category === 'SECURITY' && <Shield className="w-5 h-5" />}
                  {faq.category === 'RESPONSIBILITY' && <AlertTriangle className="w-5 h-5" />}
                </div>
                <span className="font-bold text-slate-800">{faq.question}</span>
              </div>
              {expandedId === faq.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>
            
            <AnimatePresence>
              {expandedId === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100"
                >
                  <div className="p-6 text-slate-600 leading-relaxed bg-slate-50/50">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Footer Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <motion.div 
          whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm transition-all"
        >
          <div className="bg-cyan-100 p-3 rounded-xl text-cyan-700">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Suporte Técnico</h4>
            <p className="text-sm text-slate-500">Dúvidas sobre o funcionamento do sistema?</p>
            <button className="text-cyan-600 text-sm font-bold mt-2 hover:underline">Abrir chamado</button>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm transition-all"
        >
          <div className="bg-amber-100 p-3 rounded-xl text-amber-700">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Legislação Completa</h4>
            <p className="text-sm text-slate-500">Acesse o portal do MROSC na íntegra.</p>
            <a href="https://www.gov.br/gestaoinovacao/pt-br/mrosc" target="_blank" rel="noopener noreferrer" className="text-amber-600 text-sm font-bold mt-2 flex items-center gap-1 hover:underline">
              Ver portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
