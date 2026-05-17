import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Building2, Calendar, FileText } from 'lucide-react';
import { OSCProfile } from '../types';

export function MapaOSCHub() {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<OSCProfile | null>(null);

  const fetchWithTimeout = (url: string, ms = 12000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      setError('CNPJ inválido. Informe os 14 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const brasilRes = await fetchWithTimeout(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!brasilRes.ok) throw new Error('CNPJ não encontrado na Receita Federal.');
      const brasilData = await brasilRes.json();

      let ipeaData: any = null;
      try {
        const ipeaRes = await fetchWithTimeout(`https://mapaosc.ipea.gov.br/api/v3/osc/cnpj/${cleanCnpj}`, 8000);
        if (ipeaRes.ok) ipeaData = await ipeaRes.json();
      } catch (err) {
        console.warn('IPEA API indisponível, usando dados parciais.', err);
      }

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
          dirigentes: ipeaData?.dirigentes || brasilData.qsa || [],
        },
      };

      setProfile(newProfile);

      try {
        const stored = localStorage.getItem('siact_recent_oscs');
        let recent = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(recent)) recent = [];
        recent = [newProfile, ...recent.filter((o: any) => o.cnpj !== newProfile.cnpj)].slice(0, 5);
        localStorage.setItem('siact_recent_oscs', JSON.stringify(recent));
      } catch {}

    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados da OSC.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Integração Mapa OSC</h1>
        <p className="text-slate-500 mt-2">Busca unificada na Receita Federal e IPEA para verificar elegibilidade da OSC.</p>
      </header>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Digite o CNPJ da OSC (apenas números)"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !cnpj}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Buscando...' : 'Buscar Dados'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {profile && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Status bar */}
          <div className={`h-[3px] ${profile.ipeaInsights.isEligible ? 'bg-emerald-500' : 'bg-amber-400'}`} />

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">{profile.nome}</h2>
                <p className="text-sm text-slate-400 font-mono mt-0.5">CNPJ: {profile.cnpj}</p>
              </div>
            </div>
            {profile.ipeaInsights.isEligible ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">Elegível — Art. 33</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 shrink-0">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold">Atenção — Tempo Mínimo</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Natureza Jurídica', value: profile.naturezaJuridica, icon: FileText },
              { label: 'Situação Cadastral', value: profile.situacao, icon: CheckCircle2 },
              { label: 'Data de Abertura', value: `${profile.dataAbertura} (${profile.ipeaInsights.ageInYears} anos)`, icon: Calendar },
              { label: 'Registro IPEA', value: profile.ipeaInsights.hasIpeaRecord ? 'Encontrado' : 'Não encontrado', icon: Search },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                </div>
                <p className="text-sm text-slate-800 font-medium leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {!profile.ipeaInsights.isEligible && (
            <div className="mx-6 mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Elegibilidade pendente:</strong> A OSC precisa de pelo menos 3 anos de existência para firmar parcerias (Art. 33, Lei 13.019/2014). Atual: {profile.ipeaInsights.ageInYears} ano(s).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
