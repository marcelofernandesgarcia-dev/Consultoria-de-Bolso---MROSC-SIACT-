import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, PlayCircle, CheckCircle2, Clock, Play, Mic } from 'lucide-react';

const TRILHAS = [
  {
    id: 1,
    titulo: 'Introdução ao MROSC',
    descricao: 'Fundamentos da Lei 13.019/2014 e Decreto 11.948/2024.',
    progresso: 100,
    aulas: 5,
    duracao: '2h 30m',
    concluida: true
  },
  {
    id: 2,
    titulo: 'Fase de Seleção e Edital',
    descricao: 'Como elaborar e analisar editais de chamamento público.',
    progresso: 60,
    aulas: 8,
    duracao: '4h 15m',
    concluida: false
  },
  {
    id: 3,
    titulo: 'Plano de Trabalho',
    descricao: 'Metodologia para construção de metas, indicadores e orçamento.',
    progresso: 0,
    aulas: 6,
    duracao: '3h 00m',
    concluida: false
  },
  {
    id: 4,
    titulo: 'Prestação de Contas',
    descricao: 'Monitoramento, avaliação de resultados e análise financeira.',
    progresso: 0,
    aulas: 10,
    duracao: '5h 45m',
    concluida: false
  }
];

export function CapacitacaoTecnica() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Capacitação Técnica</h1>
        <p className="text-slate-400 mt-2">Trilhas de aprendizagem sobre o Marco Regulatório das OSCs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRILHAS.map((trilha) => (
          <motion.div
            key={trilha.id}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trilha.concluida ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                {trilha.concluida && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Concluído
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{trilha.titulo}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{trilha.descricao}</p>
            </div>

            <div className="px-6 py-4 bg-slate-900/50 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {trilha.aulas} aulas</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {trilha.duracao}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Progresso</span>
                  <span className={trilha.concluida ? 'text-emerald-400' : 'text-indigo-400'}>{trilha.progresso}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${trilha.concluida ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${trilha.progresso}%` }}
                  />
                </div>
              </div>

              <button className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${trilha.concluida
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}>
                <PlayCircle className="w-4 h-4" />
                {trilha.concluida ? 'Revisar Trilha' : trilha.progresso > 0 ? 'Continuar Trilha' : 'Iniciar Trilha'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Seção Biblioteca de Mídia */}
      <section className="mt-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Biblioteca de Mídia</h2>
          <p className="text-slate-400 mt-1">Materiais audiovisuais adicionais</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 flex items-start gap-5 hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Play className="w-6 h-6 ml-1" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">Análise de Prestação de Contas</h3>
              <p className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded inline-block">/Análise_de_Prestação_de_Contas.mp4</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 flex items-start gap-5 hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">Bastidores da Análise Financeira no Transferegov</h3>
              <p className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded inline-block">/Bastidores_da_análise_financeira_no_Transferegov.m4a</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
