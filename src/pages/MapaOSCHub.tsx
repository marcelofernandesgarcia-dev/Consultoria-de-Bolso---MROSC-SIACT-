import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { OSCProfile } from '../types';

export function MapaOSCHub() {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<OSCProfile | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnpj) return;
    
    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      
      // 1. BrasilAPI
      const brasilRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!brasilRes.ok) throw new Error('CNPJ não encontrado na Receita Federal.');
      const brasilData = await brasilRes.json();

      // 2. IPEA API (Mocked if fails, as it might have CORS or be down)
      let ipeaData: any = null;
      try {
        const ipeaRes = await fetch(`https://mapaosc.ipea.gov.br/api/v3/osc/cnpj/${cleanCnpj}`);
        if (ipeaRes.ok) ipeaData = await ipeaRes.json();
      } catch (err) {
        console.warn('IPEA API failed, using fallback/empty data', err);
      }

      // Calculate Age
      const abertura = new Date(brasilData.data_inicio_atividade);
      const ageInYears = new Date().getFullYear() - abertura.getFullYear();
      const isEligible = ageInYears >= 3;

      const newProfile: OSCProfile = {
        nome: brasilData.razao_social,
        cnpj: brasilData.cnpj,
        situacao: brasilData.descricao_situacao_cadastral,
        dataAbertura: brasilData.data_inicio_atividade,
        naturezaJuridica: brasilData.natureza_juridica,
        certificacoes: [],
        projetosRecentes: ipeaData?.projetos || [],
        ipeaInsights: {
          isEligible,
          ageInYears,
          hasIpeaRecord: !!ipeaData,
          projetos: ipeaData?.projetos || [],
          dirigentes: ipeaData?.dirigentes || brasilData.qsa || []
        }
      };

      setProfile(newProfile);

      // Save to localStorage
      try {
        const stored = localStorage.getItem('siact_recent_oscs');
        let recent = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(recent)) recent = [];
        recent = [newProfile, ...recent.filter((o: any) => o.cnpj !== newProfile.cnpj)].slice(0, 5);
        localStorage.setItem('siact_recent_oscs', JSON.stringify(recent));
      } catch (e) {
        console.error('Error saving to localStorage', e);
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados da OSC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Integração Mapa OSC</h1>
        <p className="text-slate-500 mt-2">Busca unificada de dados da OSC na Receita Federal e IPEA.</p>
      </header>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Digite o CNPJ (apenas números)"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !cnpj}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar Dados'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {profile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{profile.nome}</h2>
              <p className="text-slate-500 text-sm mt-1">CNPJ: {profile.cnpj}</p>
            </div>
            {profile.ipeaInsights.isEligible ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Elegível (Art. 33)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Inapta (Tempo Mínimo)</span>
              </div>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Natureza Jurídica</p>
                <p className="text-sm text-slate-900 mt-1">{profile.naturezaJuridica}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Situação Cadastral</p>
                <p className="text-sm text-slate-900 mt-1">{profile.situacao}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Data de Abertura</p>
                <p className="text-sm text-slate-900 mt-1">{profile.dataAbertura} ({profile.ipeaInsights.ageInYears} anos)</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registro IPEA</p>
                <p className="text-sm text-slate-900 mt-1">{profile.ipeaInsights.hasIpeaRecord ? 'Encontrado' : 'Não Encontrado'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
