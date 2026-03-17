import React from 'react';
import { AnalysisResult } from '../services/api';
import { CheckCircle, AlertTriangle, XCircle, FileText, Calendar, Clock, DollarSign, Building2, FileCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

export function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  const { metadados, diagnostico, prescricao, conclusao_final } = result;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Regular': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Prescrito': return 'text-red-600 bg-red-50 border-red-200';
      case 'Risco': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getAptidaoColor = (aptidao: string) => {
    return aptidao === 'Apto' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Processo: {metadados.numero_processo}
            </h2>
            {metadados.numero_tce && (
              <p className="text-slate-500 text-sm mt-1">TCE: {metadados.numero_tce}</p>
            )}
          </div>
          <div className={clsx("px-4 py-2 rounded-full border font-medium", getStatusColor(prescricao.status))}>
            Status: {prescricao.status.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm">
              <Building2 className="w-4 h-4" /> Concedente
            </div>
            <div className="font-medium text-slate-900 truncate" title={metadados.concedente || ''}>
              {metadados.concedente || 'Não identificado'}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm">
              <Building2 className="w-4 h-4" /> Convenente
            </div>
            <div className="font-medium text-slate-900 truncate" title={metadados.convenente || ''}>
              {metadados.convenente || 'Não identificado'}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm">
              <FileCheck className="w-4 h-4" /> Instrumento
            </div>
            <div className="font-medium text-slate-900">
              {metadados.instrumento_siafi || 'Não identificado'}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm">
              <DollarSign className="w-4 h-4" /> Valor Atualizado
            </div>
            <div className="font-medium text-slate-900">
              {metadados.valor_atualizado}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnóstico e Prescrição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Diagnóstico */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-1 h-fit">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-slate-400" />
            Diagnóstico Inicial
          </h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-500 block mb-1">Fase Processual</span>
              <div className="font-medium text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {diagnostico.fase}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-slate-500 block mb-1">Aptidão</span>
              <div className={clsx("font-medium p-2 rounded-lg inline-block", getAptidaoColor(diagnostico.aptidao))}>
                {diagnostico.aptidao}
              </div>
            </div>

            <div>
              <span className="text-sm text-slate-500 block mb-1">Resumo</span>
              <p className="text-sm text-slate-700 leading-relaxed">
                {diagnostico.resumo}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Análise de Prescrição */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Análise de Prescrição
          </h3>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-900 text-sm leading-relaxed">
            {prescricao.analise_detalhada}
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider mb-3 border-b pb-2">
                Atos Interruptivos (Considerados)
              </h4>
              {prescricao.atos_interruptivos.length > 0 ? (
                <div className="space-y-3">
                  {prescricao.atos_interruptivos.map((ato, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                      <div className="w-24 flex-shrink-0 text-sm font-mono text-slate-500 pt-1">
                        {ato.data}
                      </div>
                      <div className="flex-grow bg-white border border-slate-100 p-3 rounded-lg shadow-sm group-hover:border-blue-200 transition-colors">
                        <p className="text-slate-800 text-sm">{ato.descricao}</p>
                        {ato.pagina && (
                          <span className="text-xs text-blue-600 mt-1 block font-medium">
                            Página: {ato.pagina}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Nenhum ato interruptivo identificado.</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider mb-3 border-b pb-2">
                Atos de Mero Seguimento (Ignorados)
              </h4>
              {prescricao.atos_mero_seguimento.length > 0 ? (
                <div className="space-y-2">
                  {prescricao.atos_mero_seguimento.map((ato, idx) => (
                    <div key={idx} className="flex gap-4 items-start opacity-60 hover:opacity-100 transition-opacity">
                      <div className="w-24 flex-shrink-0 text-sm font-mono text-slate-500 pt-1">
                        {ato.data}
                      </div>
                      <div className="flex-grow">
                        <p className="text-slate-600 text-sm">{ato.descricao}</p>
                        {ato.pagina && (
                          <span className="text-xs text-slate-400 mt-0.5 block">
                            Página: {ato.pagina}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Nenhum ato ignorado listado.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conclusão Final */}
      <div className={clsx(
        "rounded-2xl shadow-sm border p-6 text-center",
        prescricao.status === 'Regular' ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      )}>
        <h3 className={clsx(
          "text-lg font-bold mb-2",
          prescricao.status === 'Regular' ? "text-emerald-800" : "text-red-800"
        )}>
          CONCLUSÃO
        </h3>
        <p className={clsx(
          "text-lg",
          prescricao.status === 'Regular' ? "text-emerald-900" : "text-red-900"
        )}>
          {conclusao_final}
        </p>
      </div>
    </motion.div>
  );
}
