import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Search, Activity, GraduationCap, Bell, X, ArrowRight,
  FileCheck, CalendarDays, MessageSquare, Sparkles, BookOpen,
  CheckCircle2, XCircle, AlertTriangle, Gavel, ClipboardList,
} from 'lucide-react';
import { OSCProfile } from '../types';

const AVISOS = [
  { id: 'decreto-11948', titulo: 'Decreto 11.948/2024 em vigor', texto: 'Simplifica exigências para parcerias até R$ 120k.', link: '/checklist', linkLabel: 'Ver Checklist' },
  { id: 'prestacao-90d', titulo: 'Lembrete de prazo', texto: 'Prestação de contas final: 90 dias após o término da vigência.', link: '/calendario', linkLabel: 'Ver Calendário' },
];

const QUICK_ACTIONS = [
  { label: 'Assistente SIACT', desc: 'Tire dúvidas sobre o MROSC', path: '/assistente', icon: MessageSquare, from: '#4F46E5', to: '#7C3AED' },
  { label: 'Simulador', desc: 'Verifique a elegibilidade da OSC', path: '/simulador', icon: Sparkles, from: '#7C3AED', to: '#A855F7' },
  { label: 'Checklist', desc: 'Documentos por fase da parceria', path: '/checklist', icon: FileCheck, from: '#059669', to: '#0D9488' },
  { label: 'Capacitação', desc: '31 aulas sobre o MROSC', path: '/capacitacao', icon: GraduationCap, from: '#D97706', to: '#EA580C' },
  { label: 'Calendário', desc: 'Calcule prazos obrigatórios', path: '/calendario', icon: CalendarDays, from: '#0284C7', to: '#0EA5E9' },
  { label: 'Radar Normativo', desc: 'Analise conformidade de editais', path: '/normas', icon: Gavel, from: '#DC2626', to: '#E11D48' },
];

const DISMISSED_KEY = 'siact_avisos_dismissed';
function loadDismissed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')); }
  catch { return new Set(); }
}

interface DashboardStats { total: number; approved: number; warning: number; rejected: number; }
interface RecentAnalysis { id: number; type: string; document_name: string; status: string; date: string; }

export function Dashboard() {
  const navigate = useNavigate();
  const [recentOSCs, setRecentOSCs] = useState<OSCProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, approved: 0, warning: 0, rejected: 0 });
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);

  const dismiss = (id: string) => {
    setDismissed(prev => {
      const next = new Set([...prev, id]);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const avisosVisiveis = AVISOS.filter(a => !dismissed.has(a.id));

  useEffect(() => {
    try {
      const stored = localStorage.getItem('siact_recent_oscs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentOSCs(parsed);
      }
    } catch {}

    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.recent) setRecentAnalyses(data.recent);
      })
      .catch(() => {});
  }, []);

  const STAT_CARDS = [
    { label: 'Total de Análises', value: stats.total, icon: ShieldCheck, from: '#4F46E5', to: '#6366F1' },
    { label: 'OSCs Consultadas',  value: recentOSCs.length, icon: Search, from: '#0284C7', to: '#0EA5E9' },
    { label: 'Conformes',         value: stats.approved, icon: CheckCircle2, from: '#059669', to: '#10B981' },
    { label: 'Com Ressalvas',     value: stats.warning + stats.rejected, icon: AlertTriangle, from: '#D97706', to: '#F59E0B' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 40%, #4F46E5 70%, #6D28D9 100%)' }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Glowing circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-200" />
            <span className="text-[11.5px] font-semibold text-indigo-100">Lei 13.019/2014 · Decreto 11.948/2024</span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            Consultoria de Bolso<br />
            <span className="text-indigo-300">para Parcerias Públicas</span>
          </h1>
          <p className="text-indigo-200/75 text-sm mt-3 max-w-xl leading-relaxed">
            Sistema especializado no Marco Regulatório das OSCs — análises com IA, capacitação, calendário de prazos e orientação normativa em um único lugar.
          </p>
        </div>
      </div>

      {/* ── AVISOS ───────────────────────────────────────────── */}
      {avisosVisiveis.length > 0 && (
        <div className="space-y-2">
          {avisosVisiveis.map(aviso => (
            <div key={aviso.id} className="flex items-stretch bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="w-1 shrink-0" style={{ background: 'linear-gradient(180deg, #F59E0B, #D97706)' }} />
              <div className="flex items-center gap-3 flex-1 px-4 py-3 min-w-0">
                <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[12.5px] text-slate-700 flex-1 min-w-0 truncate">
                  <span className="font-bold text-amber-700">{aviso.titulo} — </span>
                  {aviso.texto}
                </p>
                <button onClick={() => navigate(aviso.link)} className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700 shrink-0 flex items-center gap-1 transition-colors">
                  {aviso.linkLabel} <ArrowRight className="w-3 h-3" />
                </button>
                <button onClick={() => dismiss(aviso.id)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STAT CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${card.from} 0%, ${card.to} 100%)`, boxShadow: `0 4px 20px ${card.from}40` }}
          >
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
                <card.icon className="w-[18px] h-[18px] text-white" />
              </div>
              <p className="text-[34px] font-black leading-none">{card.value}</p>
              <p className="text-[11px] font-semibold text-white/70 mt-1.5 uppercase tracking-wide">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">Acesso Rápido</h2>
          <span className="text-[10.5px] text-slate-400 font-medium">Explore as ferramentas</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${action.from} 0%, ${action.to} 100%)`,
                boxShadow: `0 2px 12px ${action.from}35`,
              }}
            >
              <action.icon className="w-5 h-5 text-white/80 mb-2.5 group-hover:text-white transition-colors" />
              <p className="text-[12px] font-bold text-white leading-tight">{action.label}</p>
              <p className="text-[10px] text-white/60 mt-0.5 leading-tight">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── ACTIVITY ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* OSCs consultadas */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="text-sm font-bold text-slate-900">OSCs Consultadas</h2>
            <button onClick={() => navigate('/integracao')} className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              Buscar OSC <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentOSCs.length > 0 ? (
            <div>
              {recentOSCs.map((osc, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/70 transition-colors" style={idx > 0 ? { borderTop: '1px solid #F8FAFC' } : {}}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
                      <Search className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 truncate">{osc.nome}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{osc.cnpj}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${
                    osc.ipeaInsights?.isEligible
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {osc.ipeaInsights?.isEligible ? 'Elegível' : 'Atenção'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Nenhuma OSC consultada ainda</p>
              <button onClick={() => navigate('/integracao')} className="mt-2 text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
                Buscar uma OSC <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Análises recentes */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="text-sm font-bold text-slate-900">Análises Recentes</h2>
            <button onClick={() => navigate('/normas')} className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              Nova análise <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentAnalyses.length > 0 ? (
            <div>
              {recentAnalyses.map((a, idx) => {
                const isConforme = a.status === 'CONFORME';
                const isRejected = a.status === 'NAO_CONFORME' || a.status === 'REJEITADO';
                return (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors" style={idx > 0 ? { borderTop: '1px solid #F8FAFC' } : {}}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isConforme ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 truncate">{a.document_name}</p>
                      <p className="text-[11px] text-slate-400">{a.type.replace(/_/g, ' ')}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${isConforme ? 'bg-emerald-100 text-emerald-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Nenhuma análise realizada ainda</p>
              <button onClick={() => navigate('/normas')} className="mt-2 text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
                Iniciar análise <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
