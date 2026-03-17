import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PenTool, FileText, ShieldCheck, Loader2, AlertCircle, CheckCircle2, ArrowRight, Upload, Info } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getPDFDocument, extractTextFromPDF } from '../../../services/pdfService';
import { analyzeMROSC } from '../../../services/api';
import { clsx } from 'clsx';

export function CelebraçãoAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [files, setFiles] = useState<{ plan?: File, draft?: File }>({});

  const handleFileUpload = async (acceptedFiles: File[], type: 'plan' | 'draft') => {
    setFiles(prev => ({ ...prev, [type]: acceptedFiles[0] }));
  };

  const runAnalysis = async () => {
    if (!files.plan || !files.draft) {
      alert("Por favor, carregue ambos os documentos (Plano de Trabalho e Minuta).");
      return;
    }

    setIsProcessing(true);
    try {
      const planPdf = await getPDFDocument(files.plan);
      const planPages = await extractTextFromPDF(planPdf);
      const planText = planPages.map(p => p.text).join('\n');

      const draftPdf = await getPDFDocument(files.draft);
      const draftPages = await extractTextFromPDF(draftPdf);
      const draftText = draftPages.map(p => p.text).join('\n');

      const data = await analyzeMROSC({
        type: 'celebration_validation',
        textContent: `PLANO DE TRABALHO:\n${planText}\n\nMINUTA DO TERMO:\n${draftText}`,
        documentName: "Análise de Celebração (Nexo Causal)"
      });
      
      setAnalysisResult(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar análise de celebração.");
    } finally {
      setIsProcessing(false);
    }
  };

  // @ts-ignore
  const { getRootProps: getPlanProps, getInputProps: getPlanInput } = useDropzone({
    onDrop: (f) => handleFileUpload(f, 'plan'),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  // @ts-ignore
  const { getRootProps: getDraftProps, getInputProps: getDraftInput } = useDropzone({
    onDrop: (f) => handleFileUpload(f, 'draft'),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-500/10 p-2 rounded-lg">
            <PenTool className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Fase de Celebração (Módulo 6.0)</h3>
            <p className="text-slate-400 text-sm italic">Validação do nexo causal entre o Plano de Trabalho e a Minuta do Termo.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1. Plano de Trabalho
            </h4>
            <div {...getPlanProps()} className={clsx(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              files.plan ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-600 hover:bg-slate-700/50"
            )}>
              <input {...getPlanInput()} />
              <Upload className={clsx("w-8 h-8 mx-auto mb-2", files.plan ? "text-emerald-400" : "text-slate-500")} />
              <p className="text-xs text-slate-300 font-medium truncate">
                {files.plan ? files.plan.name : "Arraste o Plano de Trabalho (PDF)"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> 2. Minuta do Termo
            </h4>
            <div {...getDraftProps()} className={clsx(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              files.draft ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-600 hover:bg-slate-700/50"
            )}>
              <input {...getDraftInput()} />
              <Upload className={clsx("w-8 h-8 mx-auto mb-2", files.draft ? "text-emerald-400" : "text-slate-500")} />
              <p className="text-xs text-slate-300 font-medium truncate">
                {files.draft ? files.draft.name : "Arraste a Minuta do Termo (PDF)"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={runAnalysis}
            disabled={isProcessing || !files.plan || !files.draft}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-cyan-900/20"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processando Análise...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" /> Iniciar Validação de Nexo Causal
              </>
            )}
          </button>
        </div>
      </div>

      {analysisResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Resultado da Validação Jurídica
              </h4>
              <div className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold border",
                analysisResult.status_final === 'CONFORME' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                analysisResult.status_final === 'RESSALVA' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                "bg-red-500/10 text-red-400 border-red-500/30"
              )}>
                {analysisResult.status_final}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h5 className="text-sm font-bold text-slate-300 mb-2">Resumo Executivo</h5>
                <p className="text-slate-400 text-sm leading-relaxed">{analysisResult.summary}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <h5 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Pontos de Conformidade
                  </h5>
                  <ul className="space-y-2">
                    {(analysisResult.details || []).filter((d: any) => d.result === 'CONFORME').map((item: any, i: number) => (
                      <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-bold">{item.criteria}:</span> {item.result}
                          {item.legal_ref && <p className="text-[10px] text-slate-500 mt-0.5 italic">{item.legal_ref}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <h5 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Inconsistências / Pendências
                  </h5>
                  <ul className="space-y-2">
                    {(analysisResult.missing_requirements || analysisResult.details?.filter((d: any) => d.result !== 'CONFORME') || []).map((item: any, i: number) => (
                      <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          {typeof item === 'string' ? item : (
                            <>
                              <span className="font-bold">{item.criteria}:</span> {item.result}
                              {item.legal_ref && <p className="text-[10px] text-slate-500 mt-0.5 italic">{item.legal_ref}</p>}
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h5 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" /> Fundamentação Legal Específica
                </h5>
                <p className="text-slate-400 text-xs font-mono">{analysisResult.fundamentacao_legal_especifica}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
