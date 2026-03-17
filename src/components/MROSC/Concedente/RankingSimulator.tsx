import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gavel, Star, Info, AlertCircle, Save, Download, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number; // 0 to 10
}

const DEFAULT_CRITERIA: Criterion[] = [
  { id: '1', name: 'Adequação ao Objeto', description: 'Grau de adequação da proposta aos objetivos e diretrizes do edital.', weight: 3, score: 0 },
  { id: '2', name: 'Capacidade Técnica', description: 'Experiência comprovada da OSC na execução de objetos similares.', weight: 2, score: 0 },
  { id: '3', name: 'Viabilidade Econômica', description: 'Compatibilidade dos custos com os preços de mercado e nexo causal.', weight: 2, score: 0 },
  { id: '4', name: 'Impacto Social', description: 'Abrangência e relevância social dos resultados esperados.', weight: 2, score: 0 },
  { id: '5', name: 'Inovação/Metodologia', description: 'Originalidade e eficiência da metodologia proposta.', weight: 1, score: 0 },
];

export function RankingSimulator() {
  const [criteria, setCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA);
  const [proposalName, setProposalName] = useState('');
  const [rankings, setRankings] = useState<Array<{ name: string, score: number, details: Criterion[] }>>([]);

  const calculateFinalScore = (items: Criterion[]) => {
    const totalWeight = items.reduce((acc, curr) => acc + curr.weight, 0);
    const weightedSum = items.reduce((acc, curr) => acc + (curr.score * curr.weight), 0);
    return Number((weightedSum / totalWeight).toFixed(2));
  };

  const handleSaveRanking = () => {
    if (!proposalName) {
      alert("Informe o nome da proposta.");
      return;
    }
    const finalScore = calculateFinalScore(criteria);
    setRankings(prev => [...prev, { name: proposalName, score: finalScore, details: [...criteria] }].sort((a, b) => b.score - a.score));
    setProposalName('');
    setCriteria(DEFAULT_CRITERIA.map(c => ({ ...c, score: 0 })));
  };

  const removeRanking = (index: number) => {
    setRankings(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-500/10 p-2 rounded-lg">
            <Gavel className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Simulador de Ranking (Art. 27 Dec. 11.948/24)</h3>
            <p className="text-slate-400 text-sm italic">Atribua notas objetivas para classificar as propostas recebidas.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Proposta / OSC</label>
            <input 
              type="text" 
              value={proposalName}
              onChange={(e) => setProposalName(e.target.value)}
              placeholder="Ex: Projeto Inclusão Digital - OSC Esperança"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div className="grid gap-4">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-slate-200 font-bold text-sm flex items-center gap-2">
                      {criterion.name} <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Peso {criterion.weight}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{criterion.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-cyan-400">{criterion.score}</span>
                    <span className="text-xs text-slate-600">/ 10</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5"
                  value={criterion.score}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCriteria(prev => prev.map(c => c.id === criterion.id ? { ...c, score: val } : c));
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">Nota Final Calculada:</span>
              <span className="text-3xl font-mono font-bold text-emerald-400">{calculateFinalScore(criteria)}</span>
            </div>
            <button 
              onClick={handleSaveRanking}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Salvar no Ranking
            </button>
          </div>
        </div>
      </div>

      {rankings.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" /> Classificação Geral
            </h3>
            <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <Download className="w-3 h-3" /> Exportar PDF
            </button>
          </div>

          <div className="space-y-3">
            {rankings.map((rank, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 group">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                  idx === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : 
                  idx === 1 ? "bg-slate-400/20 text-slate-300 border border-slate-400/30" :
                  idx === 2 ? "bg-orange-800/20 text-orange-400 border border-orange-800/30" :
                  "bg-slate-800 text-slate-500"
                )}>
                  {idx + 1}º
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{rank.name}</h4>
                  <div className="flex gap-2 mt-1">
                    {rank.details.slice(0, 3).map((d, i) => (
                      <span key={i} className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                        {d.name}: {d.score}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-cyan-400">{rank.score}</div>
                  <button 
                    onClick={() => removeRanking(idx)}
                    className="text-slate-600 hover:text-red-400 transition-colors mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/70 leading-relaxed">
          <strong>Atenção:</strong> Este simulador auxilia na aplicação dos critérios do Art. 27 do Decreto 11.948/2024. A pontuação deve ser devidamente fundamentada em parecer técnico pela comissão de seleção.
        </p>
      </div>
    </div>
  );
}
