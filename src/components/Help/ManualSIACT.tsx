import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, Gavel, ShieldCheck, Radar, FileSearch, ClipboardCheck, GitMerge, Star, PenTool, Info, AlertCircle } from 'lucide-react';

export function ManualSIACT() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest"
        >
          <BookOpen className="w-3 h-3" /> Manual do Usuário
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Guia de Operação <span className="text-cyan-500">SIACT-MROSC</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Domine todas as funcionalidades do Sistema Inteligente de Apoio à Análise e Controle de Transferências.
        </p>
      </section>

      {/* Target Audience */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 space-y-4">
          <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <Gavel className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Para o Concedente</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Gestores públicos, analistas técnicos e assessores jurídicos que buscam celeridade e segurança jurídica na análise de parcerias.
          </p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 space-y-4">
          <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Para a OSC</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Organizações da Sociedade Civil que desejam profissionalizar suas propostas e garantir conformidade com o Marco Regulatório (MROSC).
          </p>
        </div>
      </div>

      {/* Modules OSC */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-white">1. Módulos para OSCs</h2>
          <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Suporte Preventivo</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Radar className="w-5 h-5 text-emerald-400" />
              <h4 className="text-white font-bold">Radar de Oportunidades</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Monitora em tempo real editais de chamamento público ativos. O sistema utiliza IA para filtrar oportunidades que se encaixam no perfil da OSC, apresentando prazos, valores e links diretos.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileSearch className="w-5 h-5 text-emerald-400" />
              <h4 className="text-white font-bold">Análise de Editais</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Tradução de editais complexos. Ao fazer o upload de um PDF, o SIACT extrai os pontos críticos, requisitos de elegibilidade e vedações, facilitando a compreensão técnica pela entidade.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-white font-bold">Pré-Análise Preventiva</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Simula a análise da comissão de seleção. A OSC submete sua proposta e recebe um relatório de riscos, identificando falhas formais ou metodológicas antes do envio oficial.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-white font-bold">Checklist de Admissibilidade</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Ferramenta de autoavaliação baseada nos Arts. 33 e 34 da Lei 13.019/14. Permite verificar se a OSC possui a documentação e o tempo de existência necessários para a parceria.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Concedente */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-white">2. Módulos para Concedentes</h2>
          <span className="text-xs font-bold bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">Análise Técnica</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5 text-cyan-400" />
              <h4 className="text-white font-bold">Análise de Requisitos</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Módulo triplo que valida: (1.1) Elegibilidade da OSC, (1.2) Checklist Documental conforme Decreto 11.948 e (1.3) Compatibilidade Orçamentária.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GitMerge className="w-5 h-5 text-cyan-400" />
              <h4 className="text-white font-bold">Roteador MROSC</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Algoritmo de decisão que, através de perguntas simples sobre repasse de recursos e iniciativa do projeto, define se o instrumento será Termo de Fomento, Colaboração ou Acordo de Cooperação.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-cyan-400" />
              <h4 className="text-white font-bold">Simulador de Ranking</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Apoio à Comissão de Seleção (Art. 27 Dec. 11.948/24). Permite a atribuição de notas ponderadas por critérios, gerando uma classificação automática e fundamentada.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <PenTool className="w-5 h-5 text-cyan-400" />
              <h4 className="text-white font-bold">Validação de Celebração</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Análise de Nexo Causal. Compara o Plano de Trabalho com a Minuta do Termo para garantir que todas as metas pactuadas estejam refletidas nas cláusulas jurídicas.
            </p>
          </div>
        </div>
      </section>

      {/* Governance & Ethics */}
      <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Governança e Responsabilidade</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h5 className="text-slate-200 font-bold text-sm">Supervisão Humana</h5>
            <p className="text-slate-500 text-xs">O SIACT é uma ferramenta de apoio. A decisão final e a responsabilidade administrativa permanecem com o servidor público.</p>
          </div>
          <div className="space-y-2">
            <h5 className="text-slate-200 font-bold text-sm">Padronização Ética</h5>
            <p className="text-slate-500 text-xs">O sistema utiliza vocabulário técnico padronizado ("pactuar", "informo") para manter a autoridade da Administração.</p>
          </div>
          <div className="space-y-2">
            <h5 className="text-slate-200 font-bold text-sm">Proteção de Dados</h5>
            <p className="text-slate-500 text-xs">Em conformidade com a LGPD, o sistema aplica anonimização em dados sensíveis durante o processamento.</p>
          </div>
        </div>
      </section>

      {/* Warning Footer */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <p className="text-sm text-amber-200 font-bold">Nota de Transparência</p>
          <p className="text-xs text-amber-200/70 leading-relaxed">
            Este manual descreve as funcionalidades da versão 2.5 do SIACT-MROSC. Parte do conteúdo e das análises geradas pelo sistema contam com o auxílio de Inteligência Artificial. Sempre verifique a fundamentação legal específica citada nos relatórios.
          </p>
        </div>
      </div>
    </div>
  );
}
