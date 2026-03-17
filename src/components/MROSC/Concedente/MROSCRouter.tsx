import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GitMerge, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export function MROSCRouter() {
  const [selection, setSelection] = useState<{resource: boolean | null, initiative: 'OSC' | 'ADM' | null}>({
    resource: null,
    initiative: null
  });

  const getInstrument = () => {
    if (selection.resource === false) return "Acordo de Cooperação";
    if (selection.resource === true) {
      if (selection.initiative === 'OSC') return "Termo de Fomento";
      if (selection.initiative === 'ADM') return "Termo de Colaboração";
    }
    return null;
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <GitMerge className="w-6 h-6 text-purple-400" />
        Tela 2: Roteador MROSC
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">Haverá repasse de recursos financeiros?</label>
          <div className="flex gap-4">
            <button 
              onClick={() => setSelection(s => ({ ...s, resource: true }))}
              className={clsx("px-4 py-2 rounded-lg border transition-colors", selection.resource === true ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-slate-600 text-slate-400")}
            >
              Sim
            </button>
            <button 
              onClick={() => setSelection(s => ({ ...s, resource: false }))}
              className={clsx("px-4 py-2 rounded-lg border transition-colors", selection.resource === false ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-slate-600 text-slate-400")}
            >
              Não
            </button>
          </div>
        </div>

        {selection.resource === true && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-slate-400 mb-3">De quem é a iniciativa/concepção do projeto?</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setSelection(s => ({ ...s, initiative: 'ADM' }))}
                className={clsx("px-4 py-2 rounded-lg border transition-colors", selection.initiative === 'ADM' ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-slate-600 text-slate-400")}
              >
                Administração Pública (Parametrizada)
              </button>
              <button 
                onClick={() => setSelection(s => ({ ...s, initiative: 'OSC' }))}
                className={clsx("px-4 py-2 rounded-lg border transition-colors", selection.initiative === 'OSC' ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-slate-600 text-slate-400")}
              >
                OSC (Inovação/Proposta)
              </button>
            </div>
          </motion.div>
        )}

        {getInstrument() && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
          >
            <h4 className="text-emerald-400 font-bold text-lg mb-2">Instrumento Recomendado</h4>
            <p className="text-white text-2xl font-bold">{getInstrument()}</p>
            <p className="text-emerald-300/70 text-sm mt-2">
              Baseado na Lei 13.019/2014. O sistema irá configurar as cláusulas contratuais automaticamente para este tipo.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
