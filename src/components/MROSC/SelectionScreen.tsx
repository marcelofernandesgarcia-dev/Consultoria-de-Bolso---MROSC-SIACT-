import React from 'react';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SelectionScreenProps {
  onSelect: (perspective: 'OSC' | 'CONCEDENTE') => void;
}

export function SelectionScreen({ onSelect }: SelectionScreenProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Análise MROSC V2</h1>
        <p className="text-slate-600">Selecione a perspectiva da análise</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('OSC')}
          className="flex flex-col items-start p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-slate-750 transition-colors text-left group"
        >
          <div className="bg-cyan-500/20 p-3 rounded-xl mb-4 group-hover:bg-cyan-500/30 transition-colors">
            <User className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">OSC</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Análise sob a perspectiva da Organização da Sociedade Civil.
            Guia passo a passo para acessar recursos.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('CONCEDENTE')}
          className="flex flex-col items-start p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-slate-750 transition-colors text-left group"
        >
          <div className="bg-blue-500/20 p-3 rounded-xl mb-4 group-hover:bg-blue-500/30 transition-colors">
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">CONCEDENTE</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Análise sob a perspectiva do órgão ou entidade concedente.
            Gestão das fases de planejamento, seleção e celebração.
          </p>
        </motion.button>
      </div>
    </div>
  );
}
