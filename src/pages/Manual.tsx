import React, { useState } from 'react';
import { Compass, ChevronDown, ChevronUp, Search, Sparkles, XCircle } from 'lucide-react';
import { MANUAL_DATA } from '../data/manual';

const PERFIL_LABEL: Record<string, string> = {
  osc: 'OSC',
  setorial: 'Setorial',
  ambos: 'OSC e Setorial',
};

const PERFIL_COR: Record<string, string> = {
  osc: 'bg-indigo-100 text-indigo-700',
  setorial: 'bg-emerald-100 text-emerald-700',
  ambos: 'bg-slate-100 text-slate-600',
};

export function Manual() {
  const [blocoAtivo, setBlocoAtivo] = useState(MANUAL_DATA[0].id);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState('');

  const toggle = (id: string) => {
    setAbertos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const buscaAtiva = busca.trim().length > 0;
  const bloco = MANUAL_DATA.find(b => b.id === blocoAtivo) ?? MANUAL_DATA[0];
  const itensExibidos = buscaAtiva
    ? MANUAL_DATA.flatMap(b => b.itens).filter(item =>
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.paraQueServe.toLowerCase().includes(busca.toLowerCase()) ||
        item.comoUsar.toLowerCase().includes(busca.toLowerCase())
      )
    : bloco.itens;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 45%, #6D28D9 100%)' }}>
        <div className="px-7 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Compass className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Manual de Uso</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              O que cada ferramenta do sistema faz e como usar — inclusive onde a IA ajuda e onde ainda não ajuda
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por funcionalidade..."
          value={busca}
          onChange={e => { setBusca(e.target.value); setAbertos(new Set()); }}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        />
        {buscaAtiva && (
          <button
            onClick={() => setBusca('')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs por bloco — escondidas durante a busca (busca já cruza todos os blocos) */}
      {!buscaAtiva && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {MANUAL_DATA.map(b => (
            <button
              key={b.id}
              onClick={() => { setBlocoAtivo(b.id); setAbertos(new Set()); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap border-2 transition-all ${
                blocoAtivo === b.id ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {b.titulo}
            </button>
          ))}
        </div>
      )}

      {/* Acordeão */}
      <div className="space-y-3">
        {itensExibidos.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Compass className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma funcionalidade encontrada para "{busca}".</p>
          </div>
        ) : (
          itensExibidos.map(item => {
            const aberto = abertos.has(item.id);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  aberto ? 'border-2 border-indigo-200' : 'border-slate-200'
                }`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${aberto ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.titulo}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${PERFIL_COR[item.perfil]}`}>
                        {PERFIL_LABEL[item.perfil]}
                      </span>
                    </div>
                    {!aberto && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.paraQueServe}</p>}
                  </div>
                  {aberto
                    ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                </button>
                {aberto && (
                  <div className="px-5 pb-5 pt-0 space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed"><strong>Pra que serve:</strong> {item.paraQueServe}</p>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line"><strong className="text-slate-700">Como usar:</strong> {item.comoUsar}</p>
                    {item.iaFaz && (
                      <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800"><strong>O que a IA faz aqui:</strong> {item.iaFaz}</p>
                      </div>
                    )}
                    {item.iaNaoFaz && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800"><strong>O que a IA não faz aqui:</strong> {item.iaNaoFaz}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-sm text-indigo-700">
        <strong>Dúvida sobre a tela em que você está?</strong> Use o{' '}
        <strong>Assistente SIACT</strong> (botão flutuante) — ele já reconhece a tela atual e responde com base neste manual.
      </div>
    </div>
  );
}
