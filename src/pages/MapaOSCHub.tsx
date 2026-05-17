import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import { GovDataService, GovDossier } from '../services/api/GovDataService';

export function MapaOSCHub() {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<GovDossier | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cnpj) return;
    
    setLoading(true);
    setError(null);
    setDossier(null);

    try {
      const result = await GovDataService.assembleDossier(cnpj);
      setDossier(result);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados da OSC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white text-glow tracking-tight">Hub de Inteligência Governamental</h1>
        <p className="text-slate-400 mt-2">Dossiê 360º via APIs: Receita Federal, IPEA (Mapa OSC) e Portal Dados Abertos.</p>
      </header>

      {/* Busca Principal */}
      <form onSubmit={handleSearch} className="glass-card p-6 rounded-2xl shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Digite o CNPJ da OSC (apenas números)"
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !cnpj}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Consultar Bases'}
        </button>
      </form>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* Dossiê Dashboard */}
      {dossier && dossier.rfb && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pilar 1: Receita Federal */}
          <div className="glass-card rounded-2xl p-6 border-t-4 border-t-blue-500 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <ShieldAlert className="w-24 h-24" />
             </div>
             <h3 className="text-xl font-bold text-white mb-4">Receita Federal (RFB)</h3>
             <ul className="space-y-4 relative z-10">
               <li>
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Razão Social</p>
                 <p className="text-sm font-medium text-white">{dossier.rfb.razaoSocial}</p>
               </li>
               <li>
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Situação</p>
                 <p className={`text-sm font-bold ${dossier.rfb.situacao === 'ATIVA' ? 'text-green-400' : 'text-red-400'}`}>
                   {dossier.rfb.situacao}
                 </p>
               </li>
               <li>
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Natureza Jurídica</p>
                 <p className="text-sm text-slate-300">{dossier.rfb.naturezaJuridica}</p>
               </li>
               <li>
                 <p className="text-xs text-slate-400 uppercase tracking-wider">MROSC (Regra 3 Anos)</p>
                 <div className="flex items-center gap-2 mt-1">
                   {dossier.rfb.idadeAnos >= 3 ? (
                     <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md font-bold">Apta ({dossier.rfb.idadeAnos} Anos)</span>
                   ) : (
                     <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-md font-bold">Inapta ({dossier.rfb.idadeAnos} Anos)</span>
                   )}
                 </div>
               </li>
             </ul>
          </div>

          {/* Pilar 2: IPEA Mapa OSC */}
          <div className="glass-card rounded-2xl p-6 border-t-4 border-t-emerald-500 relative overflow-hidden">
             {dossier.ipea?.error && (
               <div className="absolute bottom-4 left-4 right-4 bg-red-500/20 border border-red-500/30 p-2 rounded-lg text-xs text-red-300 text-center">
                 {dossier.ipea.error}
               </div>
             )}
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-xl font-bold text-white">Mapa OSC (IPEA)</h3>
               {dossier.ipea?.oscId ? (
                 <CheckCircle2 className="w-6 h-6 text-emerald-400" />
               ) : (
                 <AlertCircle className="w-6 h-6 text-slate-500" />
               )}
             </div>

             {dossier.ipea?.oscId ? (
               <ul className="space-y-4">
                 <li>
                   <p className="text-xs text-slate-400 uppercase tracking-wider">ID Oficial IPEA</p>
                   <p className="text-sm font-medium text-emerald-300">#{dossier.ipea.oscId}</p>
                 </li>
                 <li>
                   <p className="text-xs text-slate-400 uppercase tracking-wider">Projetos Identificados</p>
                   <p className="text-2xl font-bold text-white text-glow">
                     {dossier.ipea.projetos?.length || 0}
                   </p>
                 </li>
                 <li>
                   <p className="text-xs text-slate-400 uppercase tracking-wider">Assentos em Conselhos</p>
                   <p className="text-xl font-bold text-slate-300">
                     {dossier.ipea.conselhos?.length || 0}
                   </p>
                 </li>
               </ul>
             ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400">OSC não cadastrada ou não detectada no IPEA MROSC neste momento.</p>
                </div>
             )}
          </div>

          {/* Pilar 3: Transferegov */}
          <div className="glass-card rounded-2xl p-6 border-t-4 border-t-amber-500 relative overflow-hidden">
             {dossier.transferegov?.error && (
               <div className="absolute bottom-4 left-4 right-4 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-xs text-amber-300 text-center">
                 {dossier.transferegov.error}
               </div>
             )}
             
             <div className="flex items-center gap-2 mb-4">
               <Activity className="w-5 h-5 text-amber-500" />
               <h3 className="text-xl font-bold text-white">Transferegov</h3>
             </div>

             <div className="space-y-4">
               <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                 <p className="text-xs text-slate-400 uppercase tracking-wider text-center mb-1">Convênios Localizados (CKAN)</p>
                 <p className="text-3xl font-bold text-center text-amber-400 text-glow">
                    {dossier.transferegov?.convenios?.length || 0}
                 </p>
               </div>

               <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                 A consulta verifica as bases do Portal de Dados Abertos (CKAN) referente a convênios atrelados administrativamente a este CNPJ. Latências de CORS podem omitir os dados momentaneamente.
               </p>
             </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}
