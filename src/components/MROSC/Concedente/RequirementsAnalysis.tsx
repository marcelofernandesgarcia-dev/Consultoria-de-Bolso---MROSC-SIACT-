import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { clsx } from 'clsx';
import { getPDFDocument, extractTextFromPDF } from '../../../services/pdfService';
import { analyzeMROSC } from '../../../services/api';

export function RequirementsAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleAnalysis = async (type: string, files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      const pdf = await getPDFDocument(file);
      const pages = await extractTextFromPDF(pdf);
      const fullText = pages.map(p => p.text).join('\n');

      const data = await analyzeMROSC({
        type: type as any,
        textContent: fullText,
        documentName: file.name
      });
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Erro na análise");
    } finally {
      setIsProcessing(false);
    }
  };

  // @ts-ignore
  const { getRootProps: getEligibilityProps, getInputProps: getEligibilityInput } = useDropzone({
    onDrop: (f) => handleAnalysis('requirements_eligibility', f),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  // @ts-ignore
  const { getRootProps: getDocsProps, getInputProps: getDocsInput } = useDropzone({
    onDrop: (f) => handleAnalysis('requirements_docs', f),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  // @ts-ignore
  const { getRootProps: getBudgetProps, getInputProps: getBudgetInput } = useDropzone({
    onDrop: (f) => handleAnalysis('requirements_budget', f),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Tela 1: Análise de Requisitos</h3>
        <p className="text-slate-400 mb-6">
          Validação inicial de elegibilidade, documentação e orçamento conforme Lei 13.019/2014.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div {...getEligibilityProps()} className="border border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-700/50 transition-colors">
            <input {...getEligibilityInput()} />
            <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h4 className="text-white font-medium">Elegibilidade (1.1)</h4>
            <p className="text-xs text-slate-500 mt-1">Estatuto, CNPJ, Histórico</p>
          </div>
          
          <div {...getDocsProps()} className="border border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-700/50 transition-colors">
            <input {...getDocsInput()} />
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-white font-medium">Documentação (1.2)</h4>
            <p className="text-xs text-slate-500 mt-1">Checklist Decreto 11.948</p>
          </div>

          <div {...getBudgetProps()} className="border border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-700/50 transition-colors">
            <input {...getBudgetInput()} />
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-white font-medium">Orçamento (1.3)</h4>
            <p className="text-xs text-slate-500 mt-1">Validação de Despesas</p>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-6 flex items-center justify-center text-cyan-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Processando análise de requisitos...
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h4 className="text-lg font-bold text-white mb-4">Resultado da Análise</h4>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
