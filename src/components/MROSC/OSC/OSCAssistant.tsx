import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Radar, Search, FileCheck, Upload, ShieldCheck, Loader2, AlertCircle, FileText, CheckCircle2, ArrowRight, ClipboardCheck, Info } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { clsx } from 'clsx';
import { getPDFDocument, extractTextFromPDF } from '../../../services/pdfService';
import { analyzeMROSC } from '../../../services/api';

const OPPORTUNITIES = [
  { id: 1, title: "Edital Cultura Viva", ministry: "Ministério da Cultura", deadline: "15/04/2026", value: "R$ 500.000" },
  { id: 2, title: "Esporte para Todos", ministry: "Ministério do Esporte", deadline: "30/03/2026", value: "R$ 300.000" },
  { id: 3, title: "Turismo de Base Comunitária", ministry: "Órgão Federal", deadline: "20/05/2026", value: "R$ 750.000" }
];

export function OSCAssistant({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'RADAR' | 'UPLOAD' | 'EDITAL' | 'PROPOSAL' | 'ADMISSIBILIDADE'>('RADAR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [uploadedEditais, setUploadedEditais] = useState<Array<{ name: string, text: string, analysis?: any, isAnalyzing?: boolean }>>([]);

  useEffect(() => {
    if (step === 'RADAR') {
      setLoadingRadar(true);
      fetch('/api/mrosc/opportunities')
        .then(res => res.json())
        .then(data => {
          // Merge hardcoded with API results, avoiding duplicates by title
          const apiOps = data.opportunities || [];
          const merged = [...apiOps];
          
          OPPORTUNITIES.forEach(hard => {
            if (!merged.some(m => m.title === hard.title)) {
              merged.push(hard);
            }
          });

          setOpportunities(merged);
          setLoadingRadar(false);
        })
        .catch(err => {
          console.error(err);
          setOpportunities(OPPORTUNITIES); // Fallback to hardcoded
          setLoadingRadar(false);
        });
    }
  }, [step]);

  const handleFileUpload = async (files: File[], type: 'osc_edital_explainer' | 'osc_proposal_precheck' | 'upload_only') => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    if (type !== 'upload_only') {
      setAnalysisResult(null); // Clear previous results
    }

    try {
      for (const file of files) {
        const pdf = await getPDFDocument(file);
        const pages = await extractTextFromPDF(pdf);
        const fullText = pages.map(p => p.text).join('\n');
        
        if (type === 'upload_only') {
          // Add placeholder for the file being analyzed
          const newEdital = { name: file.name, text: fullText, isAnalyzing: true };
          setUploadedEditais(prev => [...prev, newEdital]);

          try {
            const data = await analyzeMROSC({
              type: 'osc_edital_explainer',
              textContent: fullText,
              documentName: file.name
            });
            
            setUploadedEditais(prev => prev.map(e => 
              e.name === file.name ? { ...e, analysis: data, isAnalyzing: false } : e
            ));
          } catch (err) {
            console.error(`Error analyzing ${file.name}:`, err);
            setUploadedEditais(prev => prev.map(e => 
              e.name === file.name ? { ...e, isAnalyzing: false } : e
            ));
          }
        } else {
          const data = await analyzeMROSC({
            type: type as any,
            textContent: fullText,
            documentName: file.name
          });
          setAnalysisResult(data);
          // If it's an edital analysis, also add it to uploaded if not already there
          if (type === 'osc_edital_explainer') {
            setUploadedEditais(prev => {
              if (prev.some(e => e.name === file.name)) return prev;
              return [...prev, { name: file.name, text: fullText, analysis: data }];
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao processar arquivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeSelectedEdital = async (edital: { name: string, text: string }) => {
    setIsProcessing(true);
    setAnalysisResult(null);
    try {
      const data = await analyzeMROSC({
        type: 'osc_edital_explainer',
        textContent: edital.text,
        documentName: edital.name
      });
      setAnalysisResult(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar edital.");
    } finally {
      setIsProcessing(false);
    }
  };

  // @ts-ignore
  const { getRootProps: getUploadProps, getInputProps: getUploadInput } = useDropzone({
    onDrop: (f) => handleFileUpload(f, 'upload_only'),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    disabled: isProcessing
  });

  // @ts-ignore
  const { getRootProps: getEditalProps, getInputProps: getEditalInput } = useDropzone({
    onDrop: (f) => handleFileUpload(f, 'osc_edital_explainer'),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isProcessing
  });

  // @ts-ignore
  const { getRootProps: getProposalProps, getInputProps: getProposalInput } = useDropzone({
    onDrop: (f) => handleFileUpload(f, 'osc_proposal_precheck'),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 text-sm flex items-center gap-1">
        ← Voltar
      </button>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Header Navigation */}
        <div className="flex border-b border-slate-700">
          <button 
            onClick={() => { setStep('RADAR'); setAnalysisResult(null); }}
            className={clsx("flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors", step === 'RADAR' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
          >
            <Radar className="w-4 h-4" /> Radar de Oportunidades
          </button>
          <button 
            onClick={() => { setStep('UPLOAD'); setAnalysisResult(null); }}
            className={clsx("flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors", step === 'UPLOAD' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
          >
            <Upload className="w-4 h-4" /> Upload de Edital
          </button>
          <button 
            onClick={() => { setStep('EDITAL'); setAnalysisResult(null); }}
            className={clsx("flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors", step === 'EDITAL' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
          >
            <Search className="w-4 h-4" /> Análise de Edital
          </button>
          <button 
            onClick={() => { setStep('PROPOSAL'); setAnalysisResult(null); }}
            className={clsx("flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors", step === 'PROPOSAL' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
          >
            <FileCheck className="w-4 h-4" /> Pré-Análise Preventiva
          </button>
          <button 
            onClick={() => { setStep('ADMISSIBILIDADE'); setAnalysisResult(null); }}
            className={clsx("flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors", step === 'ADMISSIBILIDADE' ? "bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500" : "text-slate-400 hover:text-white")}
          >
            <ClipboardCheck className="w-4 h-4" /> Checklist Admissibilidade
          </button>
        </div>

        <div className="p-6 min-h-[400px]">
          {/* STEP 1: RADAR */}
          {step === 'RADAR' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Radar de Oportunidades (Plataforma OSC)</h3>
                {loadingRadar && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
              </div>
              
              <div className="grid gap-4">
                {loadingRadar ? (
                  <div className="py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                    Consultando editais na Plataforma OSC...
                  </div>
                ) : (
                  opportunities.map(op => (
                    <div key={op.id} className="bg-slate-750 p-4 rounded-lg border border-slate-600 hover:border-cyan-500/50 transition-colors flex justify-between items-center group">
                      <div className="flex-1">
                        <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{op.title}</h4>
                        <p className="text-sm text-slate-400">{op.ministry}</p>
                        {op.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{op.description}</p>}
                        {op.link && (
                          <a 
                            href={op.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-cyan-500 hover:underline mt-2 inline-block"
                          >
                            Acessar site do edital →
                          </a>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-emerald-400 font-mono">{op.value}</p>
                        <p className="text-xs text-slate-500">Até {op.deadline}</p>
                      </div>
                    </div>
                  ))
                )}
                {!loadingRadar && opportunities.length === 0 && (
                  <div className="py-12 text-center text-slate-500">
                    Nenhum edital aberto encontrado no momento.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: UPLOAD */}
          {step === 'UPLOAD' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Upload de Editais</h3>
                  <p className="text-slate-400 text-sm">Insira os editais de seu interesse para análise individual.</p>
                </div>
                <button 
                  {...getUploadProps().onClick}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Upload Múltiplo
                </button>
              </div>
              
              <div {...getUploadProps()} className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:bg-slate-700/50 transition-colors mb-8">
                <input {...getUploadInput()} />
                {isProcessing ? (
                   <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-3" />
                ) : (
                   <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                )}
                <p className="text-slate-300 font-medium">{isProcessing ? "Processando..." : "Arraste um ou mais PDFs de Editais aqui"}</p>
              </div>

              {uploadedEditais.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Editais Carregados e Analisados</h4>
                  <div className="grid gap-4">
                    {uploadedEditais.map((edital, idx) => (
                      <div key={idx} className="bg-slate-750 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            <span className="text-slate-200 font-medium truncate max-w-[200px] md:max-w-md">{edital.name}</span>
                          </div>
                          {edital.isAnalyzing ? (
                            <div className="flex items-center gap-2 text-cyan-400 text-xs">
                              <Loader2 className="w-3 h-3 animate-spin" /> Analisando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs">
                              <CheckCircle2 className="w-3 h-3" /> Analisado
                            </div>
                          )}
                        </div>
                        
                        {edital.analysis && (
                          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2">{edital.analysis.summary}</p>
                            <div className="flex gap-2">
                              {edital.analysis.checklist && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {edital.analysis.checklist.length} itens no checklist
                                </span>
                              )}
                              {edital.analysis.risks && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                                  {edital.analysis.risks.length} riscos identificados
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: EDITAL ANALYSIS */}
          {step === 'EDITAL' && !analysisResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-bold text-white mb-2">Análise de Edital</h3>
              <p className="text-slate-400 mb-6 text-sm">Selecione um edital carregado ou faça upload de um novo para análise.</p>
              
              {uploadedEditais.length > 0 && (
                <div className="grid gap-3 mb-8">
                  {uploadedEditais.map((edital, idx) => (
                    <button 
                      key={idx}
                      onClick={() => analyzeSelectedEdital(edital)}
                      className="bg-slate-750 p-4 rounded-lg border border-slate-600 hover:border-cyan-500/50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <span className="text-slate-200 font-medium group-hover:text-cyan-400 transition-colors">{edital.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              <div {...getEditalProps()} className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input {...getEditalInput()} />
                {isProcessing ? (
                   <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-3" />
                ) : (
                   <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                )}
                <p className="text-slate-300 font-medium">{isProcessing ? "Analisando..." : "Ou arraste um novo PDF de Edital aqui"}</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROPOSAL PRE-CHECK */}
          {step === 'PROPOSAL' && !analysisResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-bold text-white mb-2">Pré-Análise da Proposta</h3>
              <p className="text-slate-400 mb-6 text-sm">Verifique erros comuns antes de submeter oficialmente.</p>
              
              <div {...getProposalProps()} className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input {...getProposalInput()} />
                {isProcessing ? (
                   <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-3" />
                ) : (
                   <FileCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                )}
                <p className="text-slate-300 font-medium">{isProcessing ? "Simulando análise da comissão..." : "Arraste sua Proposta (PDF) aqui"}</p>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ADMISSIBILIDADE */}
          {step === 'ADMISSIBILIDADE' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Checklist de Admissibilidade (Autoavaliação)</h3>
                  <p className="text-slate-400 text-sm italic">Verifique se sua OSC atende aos requisitos mínimos da Lei 13.019/2014.</p>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { id: 't1', label: 'Tempo de Existência', desc: 'Mínimo de 02 anos para parcerias com a União (Art. 33, V).', ref: 'Art. 33, V, Lei 13.019' },
                  { id: 't2', label: 'Regularidade Fiscal', desc: 'CND Federal, FGTS e CND Trabalhista válidas.', ref: 'Art. 34, II' },
                  { id: 't3', label: 'Estatuto Social', desc: 'Previsão de objetivos de interesse público e desinteresse de lucro.', ref: 'Art. 33, I' },
                  { id: 't4', label: 'Experiência Prévia', desc: 'Comprovação de execução de projetos similares ao objeto pactuado.', ref: 'Art. 33, V, b' },
                  { id: 't5', label: 'Capacidade Técnica', desc: 'Instalações, equipamentos e equipe técnica compatíveis.', ref: 'Art. 33, V, c' },
                  { id: 't6', label: 'Não Impedimento', desc: 'Dirigentes não podem ser servidores do órgão ou estar suspensos.', ref: 'Art. 39' },
                ].map((item) => (
                  <div key={item.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex items-start gap-4">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                    <div>
                      <h4 className="text-slate-200 font-bold text-sm">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      <span className="text-[10px] text-slate-600 mt-2 block font-mono">{item.ref}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200/70 leading-relaxed">
                  <strong>Dica:</strong> Se você marcou todos os itens, sua OSC está em excelente posição para concorrer a editais. Se faltou algum, utilize o Assistente de IA para orientar a regularização.
                </p>
              </div>
            </motion.div>
          )}

          {/* RESULTS DISPLAY */}
          {analysisResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> Resultado da Análise
                </h4>
                <button onClick={() => setAnalysisResult(null)} className="text-xs text-slate-400 hover:text-white underline">
                  Voltar para lista
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Summary Section */}
                {analysisResult.summary && (
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h5 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Resumo
                    </h5>
                    <p className="text-slate-400 text-sm whitespace-pre-wrap">{analysisResult.summary}</p>
                  </div>
                )}

                {/* Checklist / Weak Points */}
                <div className="grid md:grid-cols-2 gap-4">
                  {(analysisResult.checklist || analysisResult.suggestions) && (
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <h5 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {analysisResult.checklist ? "Checklist" : "Sugestões"}
                      </h5>
                      <ul className="space-y-2">
                        {(analysisResult.checklist || analysisResult.suggestions || []).map((item: string, i: number) => (
                          <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(analysisResult.risks || analysisResult.weak_points) && (
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                      <h5 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {analysisResult.risks ? "Riscos" : "Pontos Fracos"}
                      </h5>
                      <ul className="space-y-2">
                        {(analysisResult.risks || analysisResult.weak_points || []).map((item: string, i: number) => (
                          <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                 {/* Fallback for raw JSON */}
                 {!analysisResult.summary && !analysisResult.checklist && !analysisResult.weak_points && (
                    <pre className="text-xs text-slate-500 whitespace-pre-wrap font-mono bg-black/20 p-4 rounded-lg">
                      {JSON.stringify(analysisResult, null, 2)}
                    </pre>
                 )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
