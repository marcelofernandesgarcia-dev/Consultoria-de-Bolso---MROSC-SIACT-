import React from 'react';
import { motion } from 'motion/react';
import { Route, Bot, Database, ShieldCheck, Server, Rocket, CheckCircle2, Circle } from 'lucide-react';

const PHASES = [
  {
    id: 1,
    title: 'Governança da Inteligência Artificial (RAG)',
    status: 'EM ANDAMENTO',
    icon: Bot,
    color: 'indigo',
    description: 'Garantia de segurança jurídica, rastreabilidade e mitigação de alucinações da IA.',
    tasks: [
      { text: 'Implementar arquitetura RAG (Retrieval-Augmented Generation)', done: true },
      { text: 'Criar banco de dados vetorial com jurisprudência (TCU/CGU)', done: false },
      { text: 'Geração de Hash de segurança para cada Parecer emitido', done: false },
      { text: 'Fluxo de aprovação humana obrigatória (Human-in-the-loop)', done: false },
    ]
  },
  {
    id: 2,
    title: 'Integrações Oficiais (APIs)',
    status: 'PLANEJADO',
    icon: Database,
    color: 'emerald',
    description: 'Substituição de robôs de extração (RPA) por consumo direto de APIs governamentais.',
    tasks: [
      { text: 'Solicitar chaves de acesso ao Conecta.gov.br', done: false },
      { text: 'Integrar API REST do Transferegov (Habilitação e CNDs)', done: false },
      { text: 'Integrar API do SIAFI (Execução Financeira)', done: false },
      { text: 'Homologar endpoints no ambiente de teste do Serpro', done: false },
    ]
  },
  {
    id: 3,
    title: 'Autenticação e Segurança',
    status: 'PLANEJADO',
    icon: ShieldCheck,
    color: 'amber',
    description: 'Implementação de identidade digital e controle de acesso baseado em perfis (RBAC).',
    tasks: [
      { text: 'Integração com Login Único Gov.br (OAuth2)', done: false },
      { text: 'Restrição para contas nível Prata ou Ouro', done: false },
      { text: 'Mapeamento de Perfis (Gestor, Parecerista, OSC, Auditor)', done: false },
      { text: 'Trilha de auditoria para ações críticas (Logs imutáveis)', done: false },
    ]
  },
  {
    id: 4,
    title: 'Infraestrutura e Banco de Dados',
    status: 'PLANEJADO',
    icon: Server,
    color: 'blue',
    description: 'Migração do ambiente de desenvolvimento para nuvem governamental certificada.',
    tasks: [
      { text: 'Configuração de Banco de Dados Relacional (PostgreSQL/Oracle)', done: false },
      { text: 'Hospedagem em nuvem certificada (Serpro/Dataprev/GSI)', done: false },
      { text: 'Rotinas de Backup e Plano de Recuperação de Desastres (DRP)', done: false },
      { text: 'Testes de Carga e Stress (Performance)', done: false },
    ]
  },
  {
    id: 5,
    title: 'Marco Institucional e Piloto',
    status: 'PLANEJADO',
    icon: Rocket,
    color: 'purple',
    description: 'Oficialização do sistema e testes de aceitação com usuários reais.',
    tasks: [
      { text: 'Lançamento do Piloto como Ferramenta Consultiva (Shadow IT oficializada)', done: false },
      { text: 'Seleção de Ministério e OSCs para o Projeto Piloto', done: false },
      { text: 'Execução do Piloto (UAT - User Acceptance Testing) por 45 dias', done: false },
      { text: 'Minuta de Portaria/IN reconhecendo o SIACT como sistema auxiliar (Pós-Piloto)', done: false },
    ]
  }
];

export function Roadmap() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-slate-500/30">
          <Route className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Roadmap de Implantação (Go-Live)</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Plano de ação estratégico para transição do SIACT v6 (Protótipo Avançado) para o ambiente de Produção Governamental.
        </p>
      </header>

      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-12">
        {PHASES.map((phase, index) => (
          <motion.div 
            key={phase.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 md:pl-12"
          >
            {/* Timeline dot */}
            <div className={`absolute -left-[17px] top-6 w-8 h-8 rounded-full bg-white border-4 border-${phase.color}-500 flex items-center justify-center`}>
              {phase.status === 'CONCLUÍDO' ? (
                <div className={`w-2 h-2 rounded-full bg-${phase.color}-500`} />
              ) : phase.status === 'EM ANDAMENTO' ? (
                <div className={`w-2 h-2 rounded-full bg-${phase.color}-500 animate-pulse`} />
              ) : null}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${phase.color}-50 rounded-xl flex items-center justify-center border border-${phase.color}-100 shrink-0`}>
                      <phase.icon className={`w-6 h-6 text-${phase.color}-600`} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold text-${phase.color}-600 uppercase tracking-wider`}>Fase {phase.id}</span>
                      <h2 className="text-xl font-bold text-slate-900">{phase.title}</h2>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    phase.status === 'EM ANDAMENTO' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : phase.status === 'CONCLUÍDO'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                
                <p className="text-slate-600 mb-6">{phase.description}</p>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Route className="w-4 h-4" />
                    Checklist de Execução
                  </h3>
                  <ul className="space-y-3">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {task.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${task.done ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                          {task.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
