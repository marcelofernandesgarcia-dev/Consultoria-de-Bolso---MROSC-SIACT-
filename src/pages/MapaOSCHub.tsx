import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Building2, Calendar, FileText, ShieldCheck, List } from 'lucide-react';
import { OSCProfile } from '../types';
import { apiFetch } from '../lib/apiFetch';

interface IpeaLocal {
  cebas: { tipo: string; status: string; validade: string }[];
  areas: { area: string; subarea: string }[];
  projetos: { titulo: string; valor: number; situacao: string }[];
}

interface BuscaResult {
  cnpj: string; razao_social: string; municipio: string; uf: string; situacao: string;
}

export function MapaOSCHub() {
  const [tab, setTab]     = useState<'cnpj' | 'nome'>('cnpj');
  const [cnpj, setCnpj]   = useState('');
  const [nome, setNome]   = useState('');
  const [uf, setUf]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [profile, setProfile]   = useState<OSCProfile | null>(null);
  const [ipeaLocal, setIpeaLocal] = useState<IpeaLocal | null>(null);
  const [lista, setLista]       = useState<BuscaResult[]>([]);
  const [totalLista, setTotalLista] = useState(0);

  const fetchWithTimeout = (url: string, ms = 12000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) { setError('CNPJ inválido. Informe os 14 dígitos.'); return; }

    setLoading(true); setError(null); setProfile(null); setIpeaLocal(null);

    try {
      const [brasilRes, localRes] = await Promise.allSettled([
        fetchWithTimeout(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`),
        apiFetch(`/api/osc/${cleanCnpj}`),
      ]);

      if (brasilRes.status === 'rejected' || !('value' in brasilRes) || !brasilRes.value.ok)
        throw new Error('CNPJ não encontrado na Receita Federal.');

      const brasilData = await brasilRes.value.json();

      if (localRes.status === 'fulfilled' && localRes.value.ok) {
        const local = await localRes.value.json();
        setIpeaLocal({ cebas: local.cebas ?? [], areas: local.areas ?? [], projetos: local.projetos ?? [] });
      }

      const abertura = new Date(brasilData.data_inicio_atividade);
      const ageInYears = new Date().getFullYear() - abertura.getFullYear();

      const newProfile: OSCProfile = {
        nome: brasilData.razao_social,
        cnpj: brasilData.cnpj,
        situacao: brasilData.descricao_situacao_cadastral,
        dataAbertura: brasilData.data_inicio_atividade,
        naturezaJuridica: brasilData.natureza_juridica,
        certificacoes: [],
        projetosRecentes: [],
        ipeaInsights: {
          isEligible: ageInYears >= 3,
          ageInYears,
          hasIpeaRecord: localRes.status === 'fulfilled' && localRes.value.ok,
          projetos: [],
          dirigentes: brasilData.qsa || [],
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

  const handleBuscaNome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true); setError(null); setLista([]);
    try {
      const params = new URLSearchParams({ q: nome, limit: '20' });
      if (uf) params.set('uf', uf);
      const res = await apiFetch(`/api/osc?${params}`);
      if (!res.ok) throw new Error('Erro ao consultar base IPEA.');
      const { data, total } = await res.json();
      setLista(data ?? []);
      setTotalLista(total ?? 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Integração Mapa OSC</h1>
        <p className="text-slate-500 mt-2">Busca unificada na Receita Federal e base IPEA (330 mil+ OSCs).</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['cnpj', 'nome'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError(null); setProfile(null); setLista([]); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'cnpj' ? <><Search className="inline w-3.5 h-3.5 mr-1.5" />Por CNPJ</> : <><List className="inline w-3.5 h-3.5 mr-1.5" />Por Nome</>}
          </button>
        ))}
      </div>

      {/* Busca por CNPJ */}
      {tab === 'cnpj' && (
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)}
              placeholder="CNPJ da OSC (apenas números)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400" />
          </div>
          <button type="submit" disabled={loading || !cnpj}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      )}

      {/* Busca por Nome */}
      {tab === 'nome' && (
        <form onSubmit={handleBuscaNome} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex gap-3">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome ou parte do nome da OSC"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none" />
          <select value={uf} onChange={e => setUf(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 text-slate-600">
            <option value="">Todos os UFs</option>
            {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(u => <option key={u}>{u}</option>)}
          </select>
          <button type="submit" disabled={loading || !nome.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Lista de resultados (busca por nome) */}
      {lista.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Resultados</span>
            <span className="text-xs text-slate-400">{totalLista} OSCs encontradas</span>
          </div>
          <div className="divide-y divide-slate-100">
            {lista.map(item => (
              <div key={item.cnpj} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.razao_social}</p>
                  <p className="text-xs text-slate-400">{item.municipio} — {item.uf}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.situacao === 'ATIVA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {item.situacao}
                </span>
                <span className="text-xs text-slate-400 font-mono shrink-0">{item.cnpj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perfil OSC (busca por CNPJ) */}
      {profile && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`h-[3px] ${profile.ipeaInsights.isEligible ? 'bg-emerald-500' : 'bg-amber-400'}`} />
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
            {profile.ipeaInsights.isEligible
              ? <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0"><CheckCircle2 className="w-4 h-4" /><span className="text-xs font-bold">Elegível — Art. 33</span></div>
              : <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 shrink-0"><ShieldAlert className="w-4 h-4" /><span className="text-xs font-bold">Atenção — Tempo Mínimo</span></div>
            }
          </div>

          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Natureza Jurídica', value: profile.naturezaJuridica, icon: FileText },
              { label: 'Situação Cadastral', value: profile.situacao, icon: CheckCircle2 },
              { label: 'Data de Abertura', value: `${profile.dataAbertura} (${profile.ipeaInsights.ageInYears} anos)`, icon: Calendar },
              { label: 'Registro IPEA', value: profile.ipeaInsights.hasIpeaRecord ? '✓ Na base local' : 'Não sincronizado', icon: Search },
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

          {/* CEBAS da base IPEA local */}
          {ipeaLocal && ipeaLocal.cebas.length > 0 && (
            <div className="px-6 pb-4 flex gap-2 flex-wrap">
              {ipeaLocal.cebas.map(c => (
                <span key={c.tipo} className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> CEBAS {c.tipo} · válido até {c.validade ?? '—'}
                </span>
              ))}
            </div>
          )}

          {!profile.ipeaInsights.isEligible && (
            <div className="mx-6 mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Elegibilidade pendente:</strong> A OSC precisa de pelo menos 3 anos de existência (Art. 33, Lei 13.019/2014). Atual: {profile.ipeaInsights.ageInYears} ano(s).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
