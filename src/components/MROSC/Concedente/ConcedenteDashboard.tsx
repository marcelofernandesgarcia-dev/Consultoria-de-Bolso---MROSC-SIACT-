import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, CheckCircle2, AlertTriangle, Loader2, ShieldCheck, Info, X, BookOpen } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { clsx } from 'clsx';
import { getPDFDocument, extractTextFromPDF } from '../../../services/pdfService';
import { analyzeMROSC, MROSCAnalysisResult } from '../../../services/api';

interface FileUploadSlotProps {
  label: string;
  onUpload: (file: File) => void;
  isProcessing: boolean;
  status?: 'pending' | 'success' | 'error';
}

function FileUploadSlot({ label, onUpload, isProcessing, status = 'pending' }: FileUploadSlotProps) {
  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files.length > 0 && onUpload(files[0]),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      <div 
        {...getRootProps()}
        className={clsx(
          "border border-dashed rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all",
          isDragActive ? "border-cyan-500 bg-cyan-500/10" : "border-slate-600 hover:border-slate-500 hover:bg-slate-750",
          status === 'success' && "border-emerald-500/50 bg-emerald-500/5",
          status === 'error' && "border-red-500/50 bg-red-500/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-3">
          {status === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : status === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <Upload className="w-5 h-5 text-slate-500" />
          )}
          <span className={clsx("text-sm", status === 'success' ? "text-emerald-400" : "text-slate-300")}>
            {isProcessing ? "Processando..." : status === 'success' ? "Arquivo analisado" : "Selecionar ou arrastar arquivo(s)"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ConcedenteDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'PLANNING' | 'SELECTION' | 'CELEBRATION'>('PLANNING');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleAnalysis = async (type: string, file: File) => {
    setIsProcessing(true);
    setAnalysisResult(null);
    try {
      const pdf = await getPDFDocument(file);
      const pages = await extractTextFromPDF(pdf);
      const fullText = pages.map(p => p.text).join('\n');

      const data = await analyzeMROSC({
        type: type as any,
        textContent: fullText,
        documentName: file.name
      });
      setAnalysisResult(data);
    } catch (error) {
      console.error(error);
      alert("Erro na análise");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden min-h-[600px]">
        {/* Header with Info Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" /> Hub do Concedente
          </h2>
          <button 
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-600"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" /> Informações e Boas Práticas
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
        <button 
          onClick={() => { setActiveTab('PLANNING'); setAnalysisResult(null); }}
          className={clsx("flex-1 p-4 text-sm font-medium transition-colors", activeTab === 'PLANNING' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
        >
          4. Planejamento (Fase Interna)
        </button>
        <button 
          onClick={() => { setActiveTab('SELECTION'); setAnalysisResult(null); }}
          className={clsx("flex-1 p-4 text-sm font-medium transition-colors", activeTab === 'SELECTION' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
        >
          5. Seleção (Ranking)
        </button>
        <button 
          onClick={() => { setActiveTab('CELEBRATION'); setAnalysisResult(null); }}
          className={clsx("flex-1 p-4 text-sm font-medium transition-colors", activeTab === 'CELEBRATION' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
        >
          6. Celebração (Contratação)
        </button>
      </div>

      <div className="p-6">
        {/* PHASE 4: PLANNING */}
        {activeTab === 'PLANNING' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-bold text-white mb-4">Análise de Planejamento</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <FileUploadSlot 
                  label="Estudo Técnico Preliminar (ETP)" 
                  onUpload={(f) => handleAnalysis('internal_planning_etp', f)}
                  isProcessing={isProcessing}
                />
                <FileUploadSlot 
                  label="Minuta do Edital" 
                  onUpload={(f) => handleAnalysis('internal_planning_edital', f)}
                  isProcessing={isProcessing}
                />
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 min-h-[200px]">
                <h4 className="text-sm font-bold text-slate-400 mb-2">Resultado da Análise</h4>
                {analysisResult ? (
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{JSON.stringify(analysisResult, null, 2)}</pre>
                ) : (
                  <p className="text-slate-600 text-xs italic">Aguardando documento...</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 5: SELECTION */}
        {activeTab === 'SELECTION' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-bold text-white mb-4">Ranking de Propostas</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <FileUploadSlot 
                  label="Plano de Trabalho (Proposta)" 
                  onUpload={(f) => handleAnalysis('selection_ranking', f)}
                  isProcessing={isProcessing}
                />
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 min-h-[200px]">
                <h4 className="text-sm font-bold text-slate-400 mb-2">Pontuação e Ranking</h4>
                {analysisResult ? (
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{JSON.stringify(analysisResult, null, 2)}</pre>
                ) : (
                  <p className="text-slate-600 text-xs italic">Envie uma proposta para ranquear...</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 6: CELEBRATION */}
        {activeTab === 'CELEBRATION' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-lg font-bold text-white mb-4">Formalização da Parceria</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <FileUploadSlot 
                  label="Minuta do Termo Final" 
                  onUpload={(f) => handleAnalysis('celebration_term', f)}
                  isProcessing={isProcessing}
                />
                <FileUploadSlot 
                  label="Plano de Trabalho Final" 
                  onUpload={(f) => handleAnalysis('celebration_workplan', f)}
                  isProcessing={isProcessing}
                />
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 min-h-[200px]">
                <h4 className="text-sm font-bold text-slate-400 mb-2">Validação Jurídica</h4>
                {analysisResult ? (
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{JSON.stringify(analysisResult, null, 2)}</pre>
                ) : (
                  <p className="text-slate-600 text-xs italic">Aguardando documentos finais...</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>

    {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" /> Informações e Boas Práticas
              </h3>
              <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <section className="space-y-3">
                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Alerta de Responsabilidade e "Alucinações"
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  O servidor público assume a autoria plena do resultado final. É obrigatória a revisão integral de todo conteúdo gerado pela IA. Instruímos o usuário a validar rigorosamente cada ponto factual e cálculo matemático apresentado, prevenindo inconsistências típicas de modelos de linguagem.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Segurança e LGPD
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  É terminantemente proibido o processamento de dados sensíveis reais (CPF, informações de saúde, endereços privados) sem a devida anonimização (Mascaramento/Tokenização) prévia. Utilize apenas dados públicos ou anonimizados.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Checklist de Ética e Imparcialidade
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Exigimos que o servidor confirme a inexistência de critérios discriminatórios ou preconceitos (Viés de Representatividade ou Seleção) antes da exportação de qualquer documento. A análise deve ser estritamente baseada em critérios objetivos.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Verificação de Vedações
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Lembre-se de checar manualmente a presença de agentes públicos na diretoria da OSC ou outras vedações legais que possam impedir a celebração da parceria, conforme a legislação vigente.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                  <Info className="w-4 h-4" /> Transparência Administrativa
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Toda saída documental que utilizar subsídios desta ferramenta deve conter obrigatoriamente a nota: <span className="italic text-cyan-200">"Parte do conteúdo gerado com o auxílio de Inteligência Artificial (SIACT-MROSC) e revisado tecnicamente pela equipe responsável."</span>
                </p>
              </section>
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-700 flex justify-end">
              <button 
                onClick={() => setShowInfo(false)}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
