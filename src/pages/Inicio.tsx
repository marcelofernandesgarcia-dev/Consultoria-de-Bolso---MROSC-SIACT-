import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, FileSearch, BookOpen, PlayCircle,
  FileCheck, AlertTriangle, ChevronRight, ArrowLeft, Sparkles
} from 'lucide-react';

type Perfil = 'osc' | 'gestor' | null;
type Fase =
  | 'chamamento' | 'plano_trabalho' | 'execucao'
  | 'prestacao' | 'tce' | null;

interface Destino {
  label: string;
  path: string;
  descricao: string;
  icon: React.ReactNode;
  badge?: string;
}

const DESTINOS_POR_FASE: Record<string, Destino[]> = {
  osc_chamamento: [
    { label: 'Simulador de Elegibilidade', path: '/simulador', descricao: 'Verifique em segundos se sua OSC atende os requisitos do edital.', icon: <Sparkles className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Checklist de Documentos', path: '/checklist', descricao: 'Saiba exatamente quais documentos levar ao chamamento.', icon: <FileCheck className="w-5 h-5" /> },
    { label: 'Integração (Mapa OSC)', path: '/integracao', descricao: 'Consulte o perfil da sua OSC na Receita Federal e IPEA.', icon: <FileSearch className="w-5 h-5" /> },
    { label: 'FAQ — Fase de Seleção', path: '/faq', descricao: 'Perguntas frequentes sobre chamamentos públicos.', icon: <BookOpen className="w-5 h-5" /> },
  ],
  osc_plano_trabalho: [
    { label: 'Checklist de Documentos', path: '/checklist', descricao: 'Documentos exigidos para formalização da parceria.', icon: <FileCheck className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Assistente SIACT', path: '/assistente', descricao: 'Tire dúvidas sobre metas, indicadores e orçamento.', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'Capacitação — Plano de Trabalho', path: '/capacitacao', descricao: 'Aprenda a estruturar metas e indicadores.', icon: <BookOpen className="w-5 h-5" /> },
  ],
  osc_execucao: [
    { label: 'Calendário de Obrigações', path: '/calendario', descricao: 'Não perca prazos de relatórios e prestações de contas.', icon: <AlertTriangle className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Assistente SIACT', path: '/assistente', descricao: 'Dúvidas sobre alteração de plano, compras, pagamento de pessoal.', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'FAQ — Fase de Execução', path: '/faq', descricao: 'O que é permitido gastar? Como alterar metas?', icon: <BookOpen className="w-5 h-5" /> },
  ],
  osc_prestacao: [
    { label: 'Checklist de Documentos', path: '/checklist', descricao: 'Documentos necessários para a prestação de contas final.', icon: <FileCheck className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Calendário de Obrigações', path: '/calendario', descricao: 'Prazo: 90 dias após o término da parceria.', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'FAQ — Prestação de Contas', path: '/faq', descricao: 'Diferença entre prestação anual e final, documentos exigidos.', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Capacitação — Prestação de Contas', path: '/capacitacao', descricao: 'Trilha completa com 10 aulas práticas.', icon: <PlayCircle className="w-5 h-5" /> },
  ],
  osc_tce: [
    { label: 'Assistente SIACT', path: '/assistente', descricao: 'Entenda a notificação recebida e seus direitos de defesa.', icon: <Sparkles className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Monitoramento (Nexo Causal)', path: '/monitoramento', descricao: 'Verifique o nexo causal das despesas questionadas.', icon: <FileSearch className="w-5 h-5" /> },
    { label: 'FAQ — TCE', path: '/faq', descricao: 'Prazos de defesa, como apresentar alegações.', icon: <BookOpen className="w-5 h-5" /> },
  ],
  gestor_chamamento: [
    { label: 'Normas (Radar Normativo)', path: '/normas', descricao: 'Verifique conformidade do edital com o Decreto 11.948/2024.', icon: <Sparkles className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Governança — Papéis e Impedimentos', path: '/governanca', descricao: 'Analise dirigentes e impeça conflitos de interesse.', icon: <FileCheck className="w-5 h-5" /> },
    { label: 'Integração (Mapa OSC)', path: '/integracao', descricao: 'Verifique elegibilidade da OSC habilitada.', icon: <FileSearch className="w-5 h-5" /> },
  ],
  gestor_plano_trabalho: [
    { label: 'Normas (Radar Normativo)', path: '/normas', descricao: 'Valide o Plano de Trabalho contra a Portaria Interministerial.', icon: <Sparkles className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Cotação Prévia', path: '/planejamento', descricao: 'Analise orçamentos e detecte sobrepreço.', icon: <FileCheck className="w-5 h-5" /> },
    { label: 'Assistente SIACT', path: '/assistente', descricao: 'Tire dúvidas sobre estruturação do plano.', icon: <BookOpen className="w-5 h-5" /> },
  ],
  gestor_execucao: [
    { label: 'Monitoramento (Nexo Causal)', path: '/monitoramento', descricao: 'Cruze despesas com metas para verificar nexo causal.', icon: <Sparkles className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Cotação Prévia', path: '/planejamento', descricao: 'Valide aditivos e remanejamentos orçamentários.', icon: <FileCheck className="w-5 h-5" /> },
    { label: 'Calendário de Obrigações', path: '/calendario', descricao: 'Monitore prazos de relatórios da OSC parceira.', icon: <AlertTriangle className="w-5 h-5" /> },
  ],
  gestor_prestacao: [
    { label: 'Monitoramento (Nexo Causal)', path: '/monitoramento', descricao: 'Audite despesas antes de emitir parecer técnico.', icon: <Sparkles className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Normas (Radar Normativo)', path: '/normas', descricao: 'Verifique conformidade da prestação de contas.', icon: <FileCheck className="w-5 h-5" /> },
    { label: 'Assistente SIACT', path: '/assistente', descricao: 'Apoio na elaboração do parecer técnico-financeiro.', icon: <BookOpen className="w-5 h-5" /> },
  ],
  gestor_tce: [
    { label: 'Monitoramento (Nexo Causal)', path: '/monitoramento', descricao: 'Fundamente a TCE com análise de nexo causal.', icon: <Sparkles className="w-5 h-5" />, badge: 'Comece aqui' },
    { label: 'Assistente SIACT', path: '/assistente', descricao: 'Apoio na estruturação do processo de TCE.', icon: <FileSearch className="w-5 h-5" /> },
    { label: 'FAQ — TCE', path: '/faq', descricao: 'Ritos e prazos da Tomada de Contas Especial.', icon: <BookOpen className="w-5 h-5" /> },
  ],
};

const FASES = [
  { id: 'chamamento', label: 'Chamamento Público', sub: 'Vou participar ou publicar um edital' },
  { id: 'plano_trabalho', label: 'Plano de Trabalho', sub: 'Estou elaborando ou analisando o plano' },
  { id: 'execucao', label: 'Execução da Parceria', sub: 'A parceria está em andamento' },
  { id: 'prestacao', label: 'Prestação de Contas', sub: 'Preciso prestar ou analisar contas' },
  { id: 'tce', label: 'Tomada de Contas Especial', sub: 'Recebi notificação ou preciso instaurar TCE' },
];

export function Inicio() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [fase, setFase] = useState<Fase>(null);

  const chave = perfil && fase ? `${perfil}_${fase}` : null;
  const destinos: Destino[] = chave ? (DESTINOS_POR_FASE[chave] ?? []) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 40%, #4F46E5 70%, #7C3AED 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Por onde começar?</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Responda 2 perguntas e o sistema indica exatamente o que você precisa
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? 'bg-indigo-500' : 'bg-slate-200'}`} />
        ))}
      </div>

      {/* STEP 1 — Perfil */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Quem é você nesta parceria?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setPerfil('osc'); setStep(2); }}
              className="flex items-start gap-4 p-6 bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl text-left transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Organização da Sociedade Civil (OSC)</p>
                <p className="text-sm text-slate-500 mt-1">Associação, fundação, cooperativa ou entidade parceira</p>
              </div>
            </button>
            <button
              onClick={() => { setPerfil('gestor'); setStep(2); }}
              className="flex items-start gap-4 p-6 bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl text-left transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Gestor Público / Administração</p>
                <p className="text-sm text-slate-500 mt-1">Servidor do órgão concedente, fiscal ou parecerista</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Fase */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">Em qual fase da parceria você está?</h2>
          </div>
          <div className="space-y-3">
            {FASES.map(f => (
              <button
                key={f.id}
                onClick={() => { setFase(f.id as Fase); setStep(3); }}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-xl text-left transition-all group"
              >
                <div>
                  <p className="font-semibold text-slate-900">{f.label}</p>
                  <p className="text-sm text-slate-500">{f.sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Destinos */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep(2)} className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Ferramentas recomendadas para você</h2>
              <p className="text-sm text-slate-500">Comece pela marcada como "Comece aqui" e avance na sequência.</p>
            </div>
          </div>
          <div className="space-y-3">
            {destinos.map((d, i) => (
              <button
                key={i}
                onClick={() => navigate(d.path)}
                className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl text-left transition-all group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 text-indigo-600 group-hover:bg-indigo-100">
                  {d.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{d.label}</p>
                    {d.badge && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">{d.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{d.descricao}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
              </button>
            ))}
          </div>
          <button
            onClick={() => { setPerfil(null); setFase(null); setStep(1); }}
            className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Recomeçar o guia
          </button>
        </div>
      )}
    </div>
  );
}
