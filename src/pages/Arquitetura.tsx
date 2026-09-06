import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Bot, Database, Route, LayoutTemplate, Sparkles, CheckCircle2, Clock } from 'lucide-react';

function StatusLabel({ tipo }: { tipo: 'implementado' | 'planejado' }) {
  const implementado = tipo === 'implementado';
  const Icon = implementado ? CheckCircle2 : Clock;
  return (
    <p className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2.5 ${implementado ? 'text-emerald-600' : 'text-amber-600'}`}>
      <Icon className="w-3 h-3" /> {implementado ? 'Já implementado' : 'Planejado'}
    </p>
  );
}

export function Arquitetura() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Arquitetura SIACT-MROSC</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Sistema de Inteligência e Auditoria Contínua de Transferências, desenvolvido para ampliar o conhecimento sobre o MROSC entre setoriais e OSCs de pequeno e médio porte. Conheça os 5 pilares que garantem segurança jurídica e reduzem a burocracia.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pilar 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pilar 1</span>
              <h2 className="text-xl font-bold text-slate-900">Propósito e Base Legal</h2>
            </div>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Foco:</strong> Segurança Jurídica e Redução de Burocracia</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Legislação Base:</strong> MROSC (Lei 13.019/2014), Decretos 8.726 e 11.948</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Prevenção:</strong> Evitar Glosas, Improbidade e TCE</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Público-Alvo:</strong> Setoriais (órgãos concedentes) e OSCs de pequeno/médio porte</p>
            </li>
          </ul>
        </motion.div>

        {/* Pilar 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Pilar 2</span>
              <h2 className="text-xl font-bold text-slate-900">Assistente IA (O Cérebro)</h2>
            </div>
          </div>
          <StatusLabel tipo="implementado" />
          <ul className="space-y-3 mb-5">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Motor:</strong> Anthropic Claude (claude-sonnet-5), com prompts especializados por tipo de análise</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Leitura de Documentos:</strong> extração de texto de PDF (upload direto, até 10MB)</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Geração:</strong> Parecer Técnico (modo geral e modo Anexo VII) e Semáforo de Riscos</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Assistente contextual:</strong> reconhece a tela em que o usuário está, com base no Manual de Uso</p>
            </li>
          </ul>
          <div className="pt-4 border-t border-slate-100">
            <StatusLabel tipo="planejado" />
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500"><strong>Motor de Proporcionalidade automático</strong> — hoje a seleção de porte (Dec. 11.948/2024) é manual, no Checklist de Documentos</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500">Leitura de outros formatos (.txt/.csv/.json) e OCR de documentos escaneados</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500">Avaliação de migração para infraestrutura soberana SERPRO (ConversAÍ Studio / SerproLLM)</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500">Execução formal da Autoavaliação de Impacto Ético em IA (AIE/NIA), conforme Portarias SGD/MGI nº 6.618/2024 e nº 473/2026</p>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Pilar 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <Database className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pilar 3</span>
              <h2 className="text-xl font-bold text-slate-900">Integrações (Data-Driven)</h2>
            </div>
          </div>
          <StatusLabel tipo="implementado" />
          <ul className="space-y-3 mb-5">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Receita Federal (BrasilAPI):</strong> busca de CNPJ em tempo real</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Mapa das OSCs (IPEA):</strong> base de 330 mil+ organizações, com certificações CEBAS quando existentes</p>
            </li>
          </ul>
          <div className="pt-4 border-t border-slate-100">
            <StatusLabel tipo="planejado" />
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500"><strong>Transferegov:</strong> consumo direto de APIs REST governamentais</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500">Validação automática de CNDs e impedimentos contra cadastros oficiais — hoje é manual ou assistida por IA sobre texto informado pelo usuário</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500">Sugestão automática de preço de referência via Compras.gov.br</p>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Pilar 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <Route className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pilar 4</span>
              <h2 className="text-xl font-bold text-slate-900">Jornada da Parceria</h2>
            </div>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 1:</strong> Chamamento Público</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 2:</strong> Plano de Trabalho</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 3:</strong> Execução da Parceria</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 4:</strong> Prestação de Contas</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 5:</strong> Tomada de Contas Especial</p>
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">As mesmas 5 fases guiam a tela "Por onde começar", o Calendário de Prazos e as Perguntas Frequentes — uma única taxonomia usada em todo o sistema.</p>
        </motion.div>

        {/* Pilar 5 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
              <LayoutTemplate className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Pilar 5</span>
              <h2 className="text-xl font-bold text-slate-900">Interface e Usabilidade</h2>
            </div>
          </div>
          <StatusLabel tipo="implementado" />
          <ul className="space-y-3 mb-5">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Dashboard:</strong> histórico real de análises, por status</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Elegibilidade:</strong> selo por tempo de existência (Municipal/Estadual/Federal)</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Controle de acesso:</strong> perfis OSC, Setorial e Administrador, com o mesmo motor de IA reaproveitado nos dois primeiros</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Design:</strong> responsivo, com ajustes de acessibilidade (eMAG/WCAG) no Assistente</p>
            </li>
          </ul>
          <div className="pt-4 border-t border-slate-100">
            <StatusLabel tipo="planejado" />
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500">Score numérico de confiabilidade e maturidade da OSC</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-500">Alertas proativos no Dashboard (hoje é consulta sob demanda)</p>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Sinergia Perfeita */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">A Sinergia Perfeita</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              O SIACT reúne conhecimento do MROSC e apoio de IA num único lugar, reduzindo a dependência de conhecimento individual e o tempo gasto em tarefas repetitivas — a palavra final sobre qualquer parecer, análise ou decisão continua sendo sempre do gestor público responsável.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 font-medium text-sm border border-indigo-500/30">
              <ShieldCheck className="w-4 h-4" />
              COPILOTO TÉCNICO — DECISÃO SEMPRE HUMANA
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-xs text-slate-400 pt-2">
        Última revisão de conteúdo: 06/09/2026 — revisado a cada marco registrado no Diário de Bordo do projeto.
      </p>
    </div>
  );
}
