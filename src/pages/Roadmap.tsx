import React from 'react';
import { Route, Bot, Database, ShieldCheck, Server, Rocket, CheckCircle2, Circle, Zap } from 'lucide-react';

type Dificuldade = 'baixa' | 'media' | 'alta';

const DIFICULDADE_CONFIG: Record<Dificuldade, { label: string; bg: string; color: string; border: string }> = {
  baixa: { label: 'Baixa',  bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  media: { label: 'Média',  bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  alta:  { label: 'Alta',   bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

function DificuldadeBadge({ nivel }: { nivel: Dificuldade }) {
  const cfg = DIFICULDADE_CONFIG[nivel];
  return (
    <span
      className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

const PHASES = [
  {
    id: 1,
    title: 'Governança da Inteligência Artificial (RAG)',
    status: 'EM ANDAMENTO',
    icon: Bot,
    dotBorder: '#6366F1',
    dotColor: '#6366F1',
    iconBg: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    labelColor: '#4F46E5',
    statusBg: '#EEF2FF',
    statusColor: '#4338CA',
    statusBorder: '#C7D2FE',
    description: 'Garantia de segurança jurídica, rastreabilidade e mitigação de alucinações da IA.',
    tasks: [
      { text: 'Manual de Uso conectado ao Assistente por contexto de tela — reduz respostas de "não sei" sobre a própria interface', done: true, dificuldade: 'media' as Dificuldade },
      { text: 'Implementar arquitetura RAG (Retrieval-Augmented Generation)', done: false, dificuldade: 'alta' as Dificuldade },
      { text: 'Avaliar migração do motor de IA (Claude, Anthropic) para infraestrutura soberana SERPRO — ConversAÍ Studio / SerproLLM', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Criar banco de dados vetorial com jurisprudência (TCU/CGU)', done: false, dificuldade: 'alta' as Dificuldade },
      { text: 'Geração de Hash de segurança para cada Parecer emitido', done: false, dificuldade: 'baixa' as Dificuldade },
      { text: 'Fluxo de aprovação humana obrigatória (Human-in-the-loop)', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Simulador de Elegibilidade — apoio de IA nas perguntas 3 (compatibilidade do estatuto com o edital) e 8 (capacidade técnica/operacional), reaproveitando o motor já usado em "Pré-Análise da Proposta"', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Executar o Framework de Autoavaliação de Impacto Ético em IA (AIE) do Núcleo de IA/SGD — questionário oficial, sem mudança de código, conta para a meta 6.10 do PBIA', done: false, dificuldade: 'baixa' as Dificuldade },
    ],
  },
  {
    id: 2,
    title: 'Integrações Oficiais (APIs)',
    status: 'PLANEJADO',
    icon: Database,
    dotBorder: '#10B981',
    dotColor: '#10B981',
    iconBg: 'linear-gradient(135deg, #059669, #0D9488)',
    labelColor: '#059669',
    statusBg: '#F0FDF4',
    statusColor: '#166534',
    statusBorder: '#BBF7D0',
    description: 'Substituição de robôs de extração (RPA) por consumo direto de APIs governamentais.',
    tasks: [
      { text: 'Solicitar chaves de acesso ao Conecta.gov.br', done: false, dificuldade: 'baixa' as Dificuldade },
      { text: 'Integrar API REST do Transferegov (Habilitação e CNDs)', done: false, dificuldade: 'alta' as Dificuldade },
      { text: 'Integrar API do SIAFI (Execução Financeira)', done: false, dificuldade: 'alta' as Dificuldade },
      { text: 'Sugerir valor de referência na Cotação Prévia via API de Pesquisa de Preços do Compras.gov.br (dadosabertos.compras.gov.br/modulo-pesquisa-preco) — reduz dependência de o usuário já saber pesquisar preços por conta própria', done: false, dificuldade: 'baixa' as Dificuldade },
      { text: 'Simulador de Elegibilidade — automatizar pergunta 4 (CNDT) via consulta pública ao TST (tst.jus.br)', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Simulador de Elegibilidade — automatizar pergunta 5 (certidões fiscais Receita/PGFN) via API oficial de CND do Conecta.gov.br — não depende mais de scraping com captcha', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Simulador de Elegibilidade — avaliar viabilidade das perguntas 6 e 7 (parentesco/poder de supervisão de dirigentes) após acesso ao Conecta.gov.br — sem prazo definido, depende de integração institucional ainda não iniciada', done: false, dificuldade: 'alta' as Dificuldade },
      { text: 'Homologar endpoints no ambiente de teste do Serpro', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Substituir a consulta de CNPJ no Mapa OSC (hoje via BrasilAPI, terceiro) pela API oficial "CNPJ — Consulta de Empresas" do catálogo Conecta.gov.br', done: false, dificuldade: 'baixa' as Dificuldade },
      { text: 'Reforçar o módulo Governança/Impedimentos com verificação oficial via CADIN e Portal da Transparência (CEIS/CNEP), além da análise de IA sobre texto informado', done: false, dificuldade: 'media' as Dificuldade },
    ],
  },
  {
    id: 3,
    title: 'Autenticação e Segurança',
    status: 'PLANEJADO',
    icon: ShieldCheck,
    dotBorder: '#F59E0B',
    dotColor: '#F59E0B',
    iconBg: 'linear-gradient(135deg, #D97706, #F59E0B)',
    labelColor: '#D97706',
    statusBg: '#FFFBEB',
    statusColor: '#92400E',
    statusBorder: '#FDE68A',
    description: 'Implementação de identidade digital e controle de acesso baseado em perfis (RBAC).',
    tasks: [
      { text: 'Integração com Login Único Gov.br (OAuth2)', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Restrição para contas nível Prata ou Ouro', done: false, dificuldade: 'baixa' as Dificuldade },
      { text: 'Mapeamento de Perfis (OSC, Setorial, Administrador) — expandir para papéis adicionais (Parecerista, Auditor) se necessário', done: true, dificuldade: 'baixa' as Dificuldade },
      { text: 'Trilha de auditoria para ações críticas (Logs imutáveis)', done: false, dificuldade: 'media' as Dificuldade },
    ],
  },
  {
    id: 4,
    title: 'Infraestrutura e Banco de Dados',
    status: 'PLANEJADO',
    icon: Server,
    dotBorder: '#3B82F6',
    dotColor: '#3B82F6',
    iconBg: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
    labelColor: '#2563EB',
    statusBg: '#EFF6FF',
    statusColor: '#1E3A8A',
    statusBorder: '#BFDBFE',
    description: 'Migração do ambiente de desenvolvimento para nuvem governamental certificada.',
    tasks: [
      { text: 'Configuração de Banco de Dados Relacional (PostgreSQL) — via Supabase, já em produção; ainda não em nuvem governamental certificada', done: true, dificuldade: 'baixa' as Dificuldade },
      { text: 'Hospedagem em nuvem certificada (Serpro/Dataprev/GSI)', done: false, dificuldade: 'alta' as Dificuldade },
      { text: 'Rotinas de Backup e Plano de Recuperação de Desastres (DRP)', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Testes de Carga e Stress (Performance)', done: false, dificuldade: 'media' as Dificuldade },
    ],
  },
  {
    id: 5,
    title: 'Marco Institucional e Piloto',
    status: 'PLANEJADO',
    icon: Rocket,
    dotBorder: '#A855F7',
    dotColor: '#A855F7',
    iconBg: 'linear-gradient(135deg, #7C3AED, #A855F7)',
    labelColor: '#7C3AED',
    statusBg: '#FAF5FF',
    statusColor: '#4C1D95',
    statusBorder: '#E9D5FF',
    description: 'Oficialização do sistema e testes de aceitação com usuários reais.',
    tasks: [
      { text: 'Lançamento do Piloto como Ferramenta Consultiva (Shadow IT oficializada)', done: false, dificuldade: 'baixa' as Dificuldade },
      { text: 'Seleção de Ministério e OSCs para o Projeto Piloto', done: false, dificuldade: 'baixa' as Dificuldade },
      { text: 'Execução do Piloto (UAT - User Acceptance Testing) por 45 dias', done: false, dificuldade: 'media' as Dificuldade },
      { text: 'Minuta de Portaria/IN reconhecendo o SIACT como sistema auxiliar (Pós-Piloto)', done: false, dificuldade: 'baixa' as Dificuldade },
    ],
  },
];

export function Roadmap() {
  const done = PHASES.flatMap(p => p.tasks).filter(t => t.done).length;
  const total = PHASES.flatMap(p => p.tasks).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 40%, #4F46E5 70%, #6D28D9 100%)' }}>
        <div className="px-8 py-6 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Zap className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Roadmap de Implantação</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Plano estratégico para transição do SIACT v6 (Protótipo) para Produção Governamental
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-white">{done}/{total}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>tarefas concluídas</p>
          </div>
        </div>
        <div className="px-8 pb-6">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(done / total) * 100}%`, background: 'rgba(255,255,255,0.8)' }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-10">
        {PHASES.map((phase) => {
          const doneTasks = phase.tasks.filter(t => t.done).length;
          return (
            <div key={phase.id} className="relative pl-8 md:pl-12">
              {/* Timeline dot */}
              <div
                className="absolute -left-[17px] top-6 w-8 h-8 rounded-full bg-white flex items-center justify-center"
                style={{ border: `4px solid ${phase.dotBorder}` }}
              >
                {phase.status === 'EM ANDAMENTO' && (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: phase.dotColor }} />
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Card header with gradient accent */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: phase.iconBg }}>
                        <phase.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: phase.labelColor }}>
                          Fase {phase.id}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 leading-snug">{phase.title}</h2>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 border"
                      style={{ background: phase.statusBg, color: phase.statusColor, borderColor: phase.statusBorder }}
                    >
                      {phase.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{phase.description}</p>
                </div>

                {/* Checklist */}
                <div className="p-6 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Route className="w-3.5 h-3.5" /> Checklist de Execução
                    </h3>
                    <span className="text-xs font-bold" style={{ color: phase.labelColor }}>
                      {doneTasks}/{phase.tasks.length}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {task.done ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1 flex flex-wrap items-start gap-x-2 gap-y-1">
                          <span className={`text-sm leading-snug ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.text}
                          </span>
                          {!task.done && task.dificuldade && <DificuldadeBadge nivel={task.dificuldade} />}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
