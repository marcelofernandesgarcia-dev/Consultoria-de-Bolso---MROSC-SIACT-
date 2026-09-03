import React, { useEffect, useState } from 'react';
import { Radar, Upload, FileCheck, Loader2, ExternalLink, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';
import { SemaforoRisco } from '../components/SemaforoRisco';
import { AIAnalysisResult } from '../types';

type Tab = 'radar' | 'edital' | 'proposta';

interface Oportunidade {
  id: number | string;
  title: string;
  link: string;
  description?: string;
  date?: string;
}

interface EditalSelecionado {
  title: string;
  link: string;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'radar', label: 'Radar de Oportunidades', icon: Radar },
  { id: 'edital', label: 'Explicar Edital', icon: Upload },
  { id: 'proposta', label: 'Pré-Análise da Proposta', icon: FileCheck },
];

async function parsePdf(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/parse-pdf', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Erro ao processar PDF.');
  const data = await res.json();
  return (data.text || '').slice(0, 80000);
}

export function ChamamentosAbertos() {
  const [tab, setTab] = useState<Tab>('radar');

  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);
  const [radarLoaded, setRadarLoaded] = useState(false);

  const [expandedId, setExpandedId] = useState<Oportunidade['id'] | null>(null);
  const [explicarLoadingId, setExplicarLoadingId] = useState<Oportunidade['id'] | null>(null);
  const [explicarResults, setExplicarResults] = useState<Record<string, AIAnalysisResult>>({});
  const [explicarErrors, setExplicarErrors] = useState<Record<string, string>>({});

  const [editalText, setEditalText] = useState('');
  const [editalPdfLoading, setEditalPdfLoading] = useState(false);
  const [editalLoading, setEditalLoading] = useState(false);
  const [editalResult, setEditalResult] = useState<AIAnalysisResult | null>(null);

  const [propostaText, setPropostaText] = useState('');
  const [propostaPdfLoading, setPropostaPdfLoading] = useState(false);
  const [propostaLoading, setPropostaLoading] = useState(false);
  const [propostaResult, setPropostaResult] = useState<AIAnalysisResult | null>(null);
  const [editalContexto, setEditalContexto] = useState<EditalSelecionado | null>(null);

  const carregarRadar = async () => {
    setLoadingRadar(true);
    setRadarError(null);
    try {
      const res = await apiFetch('/api/mrosc/opportunities');
      if (!res.ok) throw new Error('Falha ao consultar a Plataforma OSC.');
      const data = await res.json();
      setOportunidades(Array.isArray(data.opportunities) ? data.opportunities : []);
    } catch (err: any) {
      setRadarError(err.message || 'Não foi possível consultar editais no momento.');
    } finally {
      setLoadingRadar(false);
      setRadarLoaded(true);
    }
  };

  useEffect(() => {
    if (tab === 'radar' && !radarLoaded) carregarRadar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const explicarNaLista = async (op: Oportunidade) => {
    if (expandedId === op.id) { setExpandedId(null); return; }
    setExpandedId(op.id);
    if (explicarResults[op.id] || explicarLoadingId === op.id) return;

    setExplicarLoadingId(op.id);
    setExplicarErrors(prev => { const next = { ...prev }; delete next[op.id]; return next; });
    try {
      const res = await apiFetch('/api/mrosc/edital-explicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: op.link, title: op.title }),
      });
      if (!res.ok) throw new Error('Falha ao analisar este edital.');
      const data = await res.json();
      setExplicarResults(prev => ({ ...prev, [op.id]: data }));
    } catch (err: any) {
      setExplicarErrors(prev => ({ ...prev, [op.id]: err.message || 'Erro ao analisar este edital.' }));
    } finally {
      setExplicarLoadingId(null);
    }
  };

  const usarNaPreAnalise = (op: Oportunidade) => {
    setEditalContexto({ title: op.title, link: op.link });
    setPropostaResult(null);
    setTab('proposta');
  };

  const handleEditalPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditalPdfLoading(true);
    try {
      setEditalText(await parsePdf(file));
    } catch (err) {
      console.error(err);
    } finally {
      setEditalPdfLoading(false);
      e.target.value = '';
    }
  };

  const handlePropostaPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPropostaPdfLoading(true);
    try {
      setPropostaText(await parsePdf(file));
    } catch (err) {
      console.error(err);
    } finally {
      setPropostaPdfLoading(false);
      e.target.value = '';
    }
  };

  const analisarEdital = async () => {
    if (!editalText) return;
    setEditalLoading(true);
    setEditalResult(null);
    try {
      const res = await apiFetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'osc_edital', textContent: editalText }),
      });
      if (!res.ok) throw new Error('Falha na análise do edital.');
      setEditalResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setEditalLoading(false);
    }
  };

  const analisarProposta = async () => {
    if (!propostaText) return;
    setPropostaLoading(true);
    setPropostaResult(null);
    try {
      let textContent = propostaText;

      if (editalContexto) {
        const editalRes = await fetch(`/api/mrosc/edital-texto?link=${encodeURIComponent(editalContexto.link)}`);
        if (editalRes.ok) {
          const { text } = await editalRes.json();
          textContent = `### EDITAL DE REFERÊNCIA (${editalContexto.title}) ###\n${text}\n\n### PROPOSTA DA OSC A SER AVALIADA ###\n${propostaText}`;
        }
      }

      const res = await apiFetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'osc_proposal', textContent }),
      });
      if (!res.ok) throw new Error('Falha na pré-análise da proposta.');
      setPropostaResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setPropostaLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F766E 0%, #0891B2 50%, #4F46E5 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Radar className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Chamamentos Abertos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Descubra editais, entenda o que pedem e prepare sua proposta com apoio de IA
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* RADAR */}
      {tab === 'radar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #ECFEFF, #EFF6FF)' }}>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Editais encontrados {oportunidades.length > 0 && !loadingRadar && `(${oportunidades.length})`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Lista completa da Plataforma OSC, mais recentes primeiro — confirme sempre no site oficial do edital</p>
            </div>
            <button
              onClick={carregarRadar}
              disabled={loadingRadar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors disabled:opacity-50 shrink-0"
            >
              {loadingRadar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radar className="w-3.5 h-3.5" />}
              {loadingRadar ? 'Consultando...' : 'Atualizar'}
            </button>
          </div>
          <div className="p-6">
            {loadingRadar ? (
              <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Consultando editais na Plataforma OSC...
              </div>
            ) : radarError ? (
              <div className="py-8 text-center text-sm text-red-600">{radarError}</div>
            ) : oportunidades.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Nenhum edital encontrado no momento. Consulte também o{' '}
                <a href="https://plataformaosc.org.br/editais/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  site da Plataforma OSC
                </a>.
              </div>
            ) : (
              <div className="grid gap-3">
                {oportunidades.map((op) => {
                  const isExpanded = expandedId === op.id;
                  const isLoadingThis = explicarLoadingId === op.id;
                  const result = explicarResults[op.id];
                  const error = explicarErrors[op.id];
                  return (
                    <div key={op.id} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                      <div className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 basis-[220px]">
                            <p className="font-semibold text-slate-900 text-sm">{op.title}</p>
                            {op.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{op.description}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              {op.date && <span className="text-[11px] text-slate-400">{op.date}</span>}
                              {op.link && (
                                <a href={op.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                                  Ver no site <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto sm:shrink-0">
                            <button
                              onClick={() => explicarNaLista(op)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-colors text-center"
                            >
                              {isLoadingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : isExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                              Explicar Edital
                            </button>
                            <button
                              onClick={() => usarNaPreAnalise(op)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors text-center"
                            >
                              <FileCheck className="w-3.5 h-3.5 shrink-0" />
                              <span className="sm:hidden">Pré-Análise</span>
                              <span className="hidden sm:inline">Pré-Análise da Proposta</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-white p-4">
                          {isLoadingThis ? (
                            <div className="py-6 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Buscando e analisando o edital...
                            </div>
                          ) : error ? (
                            <p className="text-sm text-red-600 py-2">{error}</p>
                          ) : result ? (
                            <div className="space-y-3">
                              {(result.summary || result.message) && (
                                <p className="text-sm text-slate-700 leading-relaxed">{result.summary || result.message}</p>
                              )}
                              {Array.isArray(result.deadlines) && result.deadlines.length > 0 && (
                                <MiniList title="Prazos" items={result.deadlines} />
                              )}
                              {Array.isArray(result.checklist) && result.checklist.length > 0 && (
                                <MiniList title="Checklist de Documentos" items={result.checklist} />
                              )}
                              {Array.isArray(result.tips) && result.tips.length > 0 && (
                                <MiniList title="Dicas" items={result.tips} />
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPLICAR EDITAL */}
      {tab === 'edital' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #ECFEFF, #EFF6FF)' }}>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Cole o texto ou envie o PDF do edital</h2>
                <p className="text-xs text-slate-500 mt-0.5">Use para editais fora da lista do Radar — a IA explica prazos, checklist e dicas em linguagem simples</p>
              </div>
              <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold cursor-pointer transition-colors shrink-0 ${editalPdfLoading ? 'text-slate-400' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'}`}>
                {editalPdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {editalPdfLoading ? 'Extraindo...' : 'Enviar PDF'}
                <input type="file" accept="application/pdf" className="hidden" onChange={handleEditalPdf} disabled={editalPdfLoading} />
              </label>
            </div>
            <div className="p-6">
              <textarea
                value={editalText}
                onChange={e => setEditalText(e.target.value)}
                rows={8}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-400"
                placeholder="Cole aqui o texto do edital de chamamento público..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={analisarEdital}
                  disabled={editalLoading || !editalText}
                  style={{ background: editalLoading || !editalText ? undefined : 'linear-gradient(135deg, #0891B2, #4F46E5)' }}
                  className="px-6 py-3 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {editalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {editalLoading ? 'Analisando...' : 'Explicar Edital'}
                </button>
              </div>
            </div>
          </div>

          {editalResult && (
            <div className="space-y-4">
              <SemaforoRisco status="CONFORME" mensagem={editalResult.summary || editalResult.message} />
              {Array.isArray(editalResult.deadlines) && editalResult.deadlines.length > 0 && (
                <ResultList title="Prazos" items={editalResult.deadlines} color="indigo" />
              )}
              {Array.isArray(editalResult.checklist) && editalResult.checklist.length > 0 && (
                <ResultList title="Checklist de Documentos" items={editalResult.checklist} color="emerald" />
              )}
              {Array.isArray(editalResult.tips) && editalResult.tips.length > 0 && (
                <ResultList title="Dicas" items={editalResult.tips} color="amber" />
              )}
            </div>
          )}
        </div>
      )}

      {/* PRÉ-ANÁLISE DA PROPOSTA */}
      {tab === 'proposta' && (
        <div className="space-y-5">
          {editalContexto && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="flex-1 min-w-0 truncate">Analisando contra: <strong>{editalContexto.title}</strong></span>
              <button onClick={() => setEditalContexto(null)} className="shrink-0 text-indigo-400 hover:text-indigo-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #ECFEFF, #EFF6FF)' }}>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Cole o texto ou envie o PDF da sua proposta</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editalContexto ? 'A IA vai cruzar sua proposta com o edital selecionado acima' : 'Simula a visão da comissão de seleção antes do envio oficial'}
                </p>
              </div>
              <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold cursor-pointer transition-colors shrink-0 ${propostaPdfLoading ? 'text-slate-400' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'}`}>
                {propostaPdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {propostaPdfLoading ? 'Extraindo...' : 'Enviar PDF'}
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePropostaPdf} disabled={propostaPdfLoading} />
              </label>
            </div>
            <div className="p-6">
              <textarea
                value={propostaText}
                onChange={e => setPropostaText(e.target.value)}
                rows={8}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-400"
                placeholder="Cole aqui o texto da sua proposta/projeto..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={analisarProposta}
                  disabled={propostaLoading || !propostaText}
                  style={{ background: propostaLoading || !propostaText ? undefined : 'linear-gradient(135deg, #0891B2, #4F46E5)' }}
                  className="px-6 py-3 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {propostaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  {propostaLoading ? 'Analisando...' : 'Pré-Analisar Proposta'}
                </button>
              </div>
            </div>
          </div>

          {propostaResult && (
            <div className="space-y-4">
              <SemaforoRisco
                status={
                  propostaResult.status_final === 'NAO_CONFORME' ? 'NAO_CONFORME'
                  : propostaResult.status_final === 'RESSALVA' ? 'ATENCAO'
                  : 'CONFORME'
                }
                titulo={typeof propostaResult.score_prediction === 'number' ? `Nota estimada: ${propostaResult.score_prediction}` : undefined}
                mensagem={propostaResult.summary || propostaResult.message}
              />
              {Array.isArray(propostaResult.weak_points) && propostaResult.weak_points.length > 0 && (
                <ResultList title="Pontos Fracos" items={propostaResult.weak_points} color="amber" />
              )}
              {Array.isArray(propostaResult.suggestions) && propostaResult.suggestions.length > 0 && (
                <ResultList title="Sugestões de Melhoria" items={propostaResult.suggestions} color="indigo" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultList({ title, items, color }: { title: string; items: string[]; color: 'indigo' | 'emerald' | 'amber' }) {
  const dot = { indigo: 'bg-indigo-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400' }[color];
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />
            <span className="text-sm text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
