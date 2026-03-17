import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Bot, Database, Route, LayoutTemplate, Sparkles } from 'lucide-react';

export function Arquitetura() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Arquitetura SIACT-MROSC</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Sistema de Inteligência e Auditoria Contínua de Transferências. Conheça os 5 pilares que garantem segurança jurídica e reduzem a burocracia.
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
              <p className="text-slate-700"><strong>Público-Alvo:</strong> Gestores Públicos e OSCs</p>
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
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Motor:</strong> LLM Especializado em Auditoria Pública</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Leitura de Documentos:</strong> OCR e parsing de .pdf, .txt, .csv, .json</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Motor de Proporcionalidade:</strong> Aplicação automática de ritos simplificados (Dec. 11.948/2024)</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Geração:</strong> Pareceres Técnicos Automatizados e Semáforo de Riscos</p>
            </li>
          </ul>
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
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Brasil API:</strong> Busca em tempo real de CNPJ e CNAE</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Mapa das OSCs (IPEA):</strong> Histórico e Certificações</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Transferegov:</strong> Consumo direto de APIs REST governamentais</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Automação:</strong> Validação automática de CNDs e Impedimentos</p>
            </li>
          </ul>
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
              <p className="text-slate-700"><strong>Fase 1:</strong> Diagnóstico e Prontidão Institucional</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 2:</strong> Elaboração de Planos de Trabalho</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 3:</strong> Execução e Monitoramento Financeiro</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Fase 4:</strong> Prestação de Contas (Impacto Social)</p>
            </li>
          </ul>
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
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Dashboard:</strong> Interativo com Alertas</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Score:</strong> Confiabilidade e Maturidade da OSC</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Histórico:</strong> Consultas e Memória Local</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
              <p className="text-slate-700"><strong>Design:</strong> Moderno, Responsivo e Focado na UX</p>
            </li>
          </ul>
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
              O SIACT transforma a burocracia das transferências voluntárias em um processo ágil, transparente e 100% rastreável.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-sm border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              SEGURANÇA JURÍDICA GARANTIDA
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
