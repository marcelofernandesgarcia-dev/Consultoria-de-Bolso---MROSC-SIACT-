import React, { useState } from 'react';
import { Scale, Loader2, FileOutput, Copy, Check, AlertTriangle, BookOpen, Lightbulb } from 'lucide-react';

const TEMAS_RAPIDOS = [
  'Uma OSC com 2 anos de existência pode firmar Acordo de Cooperação?',
  'Quais documentos de habilitação foram dispensados pelo Decreto 11.948/2024?',
  'Como calcular o percentual máximo de pagamento de pessoal com recursos da parceria?',
  'Quais são os requisitos mínimos para uma OSC ser considerada elegível?',
  'Em que situações é obrigatório o chamamento público?',
  'O que caracteriza desvio de finalidade no uso dos recursos da parceria?',
];

interface ParecerResult {
  conclusao: string;
  fundamentacao: string;
  baseLegal: string[];
  ressalvas: string[];
  orientacao: string;
}

export function GeradorParecer() {
  const [pergunta, setPergunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParecerResult | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState('');

  const handleGerar = async () => {
    if (!pergunta.trim()) return;
    setLoading(true);
    setResult(null);
    setErro('');

    try {
      const response = await fetch('/api/analyze-mrosc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gerador_parecer', textContent: pergunta }),
      });

      if (!response.ok) throw new Error('Falha ao gerar o parecer.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setErro('Erro ao gerar o parecer. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copiarParecer = () => {
    if (!result) return;
    const texto = [
      'PARECER TÉCNICO — SIACT-MROSC',
      '='.repeat(50),
      `\nCONCLUSÃO:\n${result.conclusao}`,
      `\nFUNDAMENTAÇÃO JURÍDICA:\n${result.fundamentacao}`,
      `\nBASE LEGAL:\n${result.baseLegal.map(b => `• ${b}`).join('\n')}`,
      result.ressalvas.length ? `\nRESSSALVAS:\n${result.ressalvas.map(r => `• ${r}`).join('\n')}` : '',
      `\nORIENTAÇÃO FINAL:\n${result.orientacao}`,
      '\n—\nGerado por SIACT-MROSC. Este documento é consultivo e não substitui orientação jurídica formal.',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 40%, #4F46E5 70%, #7C3AED 100%)' }}>
        <div className="px-7 py-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Scale className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Gerador de Pareceres Técnicos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Opiniões jurídicas fundamentadas na Lei 13.019/2014 e Decreto 11.948/2024, geradas por IA
            </p>
          </div>
          <div
            className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
          >
            BETA
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>Uso consultivo:</strong> Os pareceres gerados são orientativos e baseados na legislação vigente. Não substituem orientação jurídica formal para casos concretos de alta complexidade.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100" style={{ background: 'linear-gradient(to right, #F5F3FF, #EFF6FF)' }}>
          <h2 className="text-sm font-bold text-slate-800">Sua Dúvida Jurídica</h2>
          <p className="text-xs text-slate-500 mt-0.5">Descreva a situação ou pergunta para receber uma análise fundamentada</p>
        </div>
        <div className="p-6">
          <textarea
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            rows={4}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-400"
            placeholder="Ex: Uma OSC com 2 anos de existência pode firmar parceria com o Município para execução de atividades de assistência social?"
          />

          {/* Quick topics */}
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Perguntas frequentes</p>
            <div className="flex flex-wrap gap-2">
              {TEMAS_RAPIDOS.map((tema, i) => (
                <button
                  key={i}
                  onClick={() => setPergunta(tema)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition-colors text-left"
                >
                  {tema}
                </button>
              ))}
            </div>
          </div>

          {erro && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleGerar}
              disabled={loading || !pergunta.trim()}
              style={{
                background: loading || !pergunta.trim() ? undefined : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: loading || !pergunta.trim() ? undefined : '0 4px 14px rgba(79,70,229,0.35)',
              }}
              className="px-6 py-3 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              {loading ? 'Gerando Parecer...' : 'Gerar Parecer Técnico'}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-5">
          {/* Conclusão */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #F5F3FF, #EEF2FF)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  <Scale className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Parecer Técnico</h3>
              </div>
              <button
                onClick={copiarParecer}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors border border-slate-200"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiado ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="p-6">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl mb-4">
                <p className="text-sm font-semibold text-indigo-900 leading-relaxed">{result.conclusao}</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{result.fundamentacao}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Base legal */}
            {result.baseLegal?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0284C7, #0891B2)' }}>
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Base Legal</h3>
                </div>
                <ul className="space-y-2">
                  {result.baseLegal.map((base, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 bg-sky-50 rounded-xl border border-sky-100 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{base}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ressalvas */}
            {result.ressalvas?.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Ressalvas</h3>
                </div>
                <ul className="space-y-2">
                  {result.ressalvas.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-100 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span className="leading-snug">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Orientação final */}
          {result.orientacao && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                  <Lightbulb className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Orientação Final</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{result.orientacao}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
