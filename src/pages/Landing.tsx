import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Zap, FileText, GraduationCap,
  ArrowRight, Star, Menu, X, Check, Building2, Users, Sparkles,
  BarChart3, Clock, Lock,
} from 'lucide-react';

/* ─── DATA ──────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: ShieldCheck,
    color: '#6366F1',
    title: 'Elegibilidade Automatizada',
    desc: 'Analise documentos e requisitos legais da OSC em segundos, com fundamentação no Art. 33 da Lei 13.019/2014.',
  },
  {
    icon: Zap,
    color: '#8B5CF6',
    title: 'Auditoria de Nexo Causal',
    desc: 'Cruzamento automático de despesas realizadas versus metas do Plano de Trabalho, com geração de relatório.',
  },
  {
    icon: FileText,
    color: '#EC4899',
    title: 'Pareceres Técnicos com IA',
    desc: 'Gere pareceres jurídicos fundamentados no Decreto 11.948/2024 e na Lei 13.019, prontos para assinar.',
  },
  {
    icon: GraduationCap,
    color: '#10B981',
    title: 'Capacitação Completa',
    desc: '31 aulas gratuitas cobrindo todo o ciclo MROSC: da seleção à prestação de contas final.',
  },
  {
    icon: BarChart3,
    color: '#F59E0B',
    title: 'Dashboard de Conformidade',
    desc: 'Painel centralizado com histórico de análises, status de conformidade e alertas normativos.',
  },
  {
    icon: Clock,
    color: '#0EA5E9',
    title: 'Calendário de Prazos',
    desc: 'Nunca perca um prazo legal. Alertas automáticos de vencimentos críticos da parceria.',
  },
];

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    desc: 'Para OSCs que estão começando no MROSC.',
    color: '#6366F1',
    highlight: false,
    cta: 'Criar conta grátis',
    features: [
      '5 análises por mês',
      'Checklist de documentos',
      'Assistente SIACT básico',
      '31 aulas de capacitação',
      'Calendário de prazos',
    ],
    missing: ['Pareceres técnicos ilimitados', 'PDF exportação', 'Suporte prioritário'],
  },
  {
    name: 'Profissional',
    price: 'R$ 97',
    period: 'por mês',
    desc: 'Para OSCs e gestores que precisam de análises frequentes.',
    color: '#7C3AED',
    highlight: true,
    cta: 'Começar grátis por 14 dias',
    features: [
      'Análises ilimitadas',
      'Exportação em PDF',
      'Pareceres técnicos completos',
      'Auditoria de nexo causal',
      'Radar normativo',
      'Suporte prioritário por e-mail',
    ],
    missing: [],
  },
  {
    name: 'Institucional',
    price: 'Sob consulta',
    period: '',
    desc: 'Para órgãos públicos e redes de OSCs.',
    color: '#0EA5E9',
    highlight: false,
    cta: 'Falar com especialista',
    features: [
      'Múltiplos usuários',
      'Integração via API',
      'Análise em lote de processos',
      'Relatórios personalizados',
      'SLA garantido',
      'Treinamento presencial',
    ],
    missing: [],
  },
];

const TESTIMONIALS = [
  {
    name: 'Ana Souza',
    role: 'Diretora Financeira · Instituto Ação Cidadã (SP)',
    text: 'O SIACT reduziu de 3 semanas para 2 dias o tempo de análise dos nossos documentos de elegibilidade. Nunca mais perdemos prazo.',
    stars: 5,
  },
  {
    name: 'Marcos Figueiredo',
    role: 'Gestor de Convênios · Prefeitura de Campinas',
    text: 'A geração de pareceres técnicos com fundamentação legal correta e atual é impressionante. Economizamos horas de trabalho por processo.',
    stars: 5,
  },
  {
    name: 'Carla Mendes',
    role: 'Presidente · OSCIP Novo Horizonte (MG)',
    text: 'As 31 aulas de capacitação foram um divisor de águas. Nossa equipe entendeu o MROSC de verdade pela primeira vez.',
    stars: 5,
  },
];

/* ─── COMPONENTS ────────────────────────────────────────────────── */

function NavBar({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(9,9,18,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.15)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6366F1, #4338CA)' }}>
            <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">SIACT-MROSC</span>
            <span className="hidden sm:inline text-[10px] text-slate-500 ml-2">Consultoria de Bolso</span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'Recursos', id: 'recursos' },
            { label: 'Como funciona', id: 'como-funciona' },
            { label: 'Preços', id: 'precos' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Entrar
          </button>
          <button
            onClick={onLogin}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
            }}
          >
            Criar conta grátis
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-3"
             style={{ background: 'rgba(9,9,18,0.98)' }}>
          {['recursos', 'como-funciona', 'precos'].map((id) => (
            <button key={id} onClick={() => scrollTo(id)}
                    className="block w-full text-left text-sm text-slate-300 py-2 capitalize">
              {id.replace('-', ' ')}
            </button>
          ))}
          <button onClick={onLogin}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            Entrar / Criar conta
          </button>
        </div>
      )}
    </nav>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────────── */

export function Landing() {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const goLogin = () => navigate('/login');

  return (
    <div className="min-h-screen" style={{ background: '#060612', color: '#fff' }}>
      <NavBar onLogin={goLogin} />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-16"
        style={{ background: 'linear-gradient(150deg, #060612 0%, #0f0c29 45%, #1a1040 100%)' }}
      >
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[30%] w-[700px] h-[700px] rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-12"
               style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold"
                 style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(165,180,252,0.3)', color: '#a5b4fc' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              900.000+ OSCs no Brasil precisam disso
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Consultoria MROSC
              <br />
              <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(90deg, #a5b4fc, #c4b5fd, #f0abfc)' }}>
                no seu bolso.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg">
              Consultores especializados em parceria OSC-Governo cobram{' '}
              <strong className="text-white">R$ 300–800 por hora</strong>.
              O SIACT entrega a mesma expertise — com IA — de graça para qualquer OSC do Brasil.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={goLogin}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] hover:opacity-95"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  boxShadow: '0 8px 30px rgba(79,70,229,0.5)',
                }}
              >
                <Sparkles className="w-5 h-5" />
                Criar minha conta grátis
              </button>
              <button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Ver como funciona
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust */}
            <div className="mt-10 flex items-center gap-6 flex-wrap">
              {[
                { icon: Lock, text: 'Conforme LGPD' },
                { icon: ShieldCheck, text: 'Criptografado TLS' },
                { icon: Users, text: 'Acesso por convite' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon className="w-3.5 h-3.5 text-emerald-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Stats + visual */}
          <div className="flex flex-col gap-4">
            {/* Big stat */}
            <div
              className="rounded-3xl p-8 text-center"
              style={{
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(165,180,252,0.2)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-8xl font-black text-white leading-none">900k<span className="text-indigo-400">+</span></p>
              <p className="mt-3 text-lg font-semibold text-slate-400">OSCs brasileiras que podem se beneficiar</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'R$ 0', label: 'Custo para OSCs', color: '#10B981' },
                { value: '< 60s', label: 'Tempo de análise', color: '#6366F1' },
                { value: '31', label: 'Aulas gratuitas', color: '#8B5CF6' },
                { value: '24/7', label: 'Disponibilidade', color: '#F59E0B' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMO FUNCIONA
      ══════════════════════════════════════════ */}
      <section id="como-funciona" className="py-24" style={{ background: '#080814' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">Como funciona</p>
            <h2 className="text-4xl font-black text-white">Simples como deve ser</h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Sem burocracia para usar a ferramenta. Cole o documento, clique em analisar, receba o resultado com fundamentação legal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { n: '01', title: 'Cole ou envie o documento', desc: 'Texto, PDF ou dados da OSC. O SIACT aceita qualquer formato.' },
              { n: '02', title: 'A IA analisa com a lei em mãos', desc: 'Fundamentação automática na Lei 13.019/2014 e Decreto 11.948/2024.' },
              { n: '03', title: 'Receba o parecer pronto', desc: 'Resultado estruturado com status, recomendações e base legal citada.' },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl p-7"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <p className="text-5xl font-black text-indigo-900 mb-4">{step.n}</p>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          RECURSOS
      ══════════════════════════════════════════ */}
      <section id="recursos" className="py-24" style={{ background: '#060612' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">Recursos</p>
            <h2 className="text-4xl font-black text-white">Tudo que uma OSC precisa</h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Ferramentas que antes custavam caro — agora acessíveis para qualquer organização civil do Brasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROVA SOCIAL
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ background: '#080814' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">Depoimentos</p>
            <h2 className="text-4xl font-black text-white">Quem já usa, aprova</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div
                key={name}
                className="rounded-2xl p-7"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">"{text}"</p>
                <div>
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PREÇOS
      ══════════════════════════════════════════ */}
      <section id="precos" className="py-24" style={{ background: '#060612' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">Planos e Preços</p>
            <h2 className="text-4xl font-black text-white">Transparente. Sem surpresas.</h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Comece grátis. Escale conforme sua necessidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                style={{
                  background: plan.highlight ? `linear-gradient(160deg, ${plan.color}22, ${plan.color}10)` : 'rgba(255,255,255,0.03)',
                  border: plan.highlight ? `2px solid ${plan.color}66` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.highlight ? `0 20px 60px ${plan.color}30` : 'none',
                }}
              >
                {plan.highlight && (
                  <div className="py-2 text-center text-xs font-bold tracking-wide"
                       style={{ background: plan.color, color: '#fff' }}>
                    ✦ MAIS POPULAR
                  </div>
                )}
                <div className="p-7">
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>

                  <div className="my-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-500 ml-2 text-sm">{plan.period}</span>}
                  </div>

                  <button
                    onClick={goLogin}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white mb-6 transition-all hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                      boxShadow: `0 4px 14px ${plan.color}40`,
                    }}
                  >
                    {plan.cta}
                  </button>

                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 line-through">
                        <X className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#060612' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
               style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)', boxShadow: '0 0 60px rgba(99,102,241,0.4)' }}>
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white">Comece agora. É grátis.</h2>
          <p className="mt-4 text-slate-400 text-lg">
            Mais de 900 mil OSCs brasileiras merecem acesso à melhor consultoria MROSC do país.
          </p>
          <button
            onClick={goLogin}
            className="mt-10 inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-black text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              boxShadow: '0 12px 40px rgba(79,70,229,0.5)',
            }}
          >
            <Sparkles className="w-5 h-5" />
            Criar minha conta grátis
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-4 text-xs text-slate-600">Sem cartão de crédito. Acesso imediato.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#040410' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366F1, #4338CA)' }}>
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white">SIACT-MROSC</p>
              <p className="text-[9px] text-slate-600 leading-tight">Sistema Inteligente de Análise e Controle de Transferências da União</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-slate-600">
            <span>Lei 13.019/2014</span>
            <span>Decreto 11.948/2024</span>
            <span>Portaria 197/2025</span>
            <span>LGPD</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <button onClick={goLogin} className="hover:text-slate-400 transition-colors">Entrar</button>
            <span>©&nbsp;2026 SIACT-MROSC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
