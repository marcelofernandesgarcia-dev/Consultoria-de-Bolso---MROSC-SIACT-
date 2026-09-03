import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldCheck, Search, Gavel, FileText, BarChart3, MessageSquare,
  ArrowRight, Zap, Lock, Star, ChevronDown
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    title: 'Análise de Elegibilidade',
    desc: 'Verificação automática dos requisitos da Lei 13.019/2014 — tempo de existência, CNDs e experiência prévia.',
  },
  {
    icon: Search,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Dossiê 360° OSC',
    desc: 'Inteligência governamental em segundos: Receita Federal, IPEA (Mapa OSC) e Portal de Dados Abertos em um único painel.',
  },
  {
    icon: Gavel,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'Radar Normativo',
    desc: 'Conformidade com o Decreto 11.948/2024 — identifica documentos dispensados, alertas de transição e riscos jurídicos.',
  },
  {
    icon: FileText,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: 'Validação de Nexo Causal',
    desc: 'Cruza o Plano de Trabalho com a Minuta do Termo e aponta inconsistências antes da celebração.',
  },
  {
    icon: BarChart3,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'Dashboard de Auditoria',
    desc: 'Painel em tempo real com score de conformidade, gráficos de distribuição e histórico completo de análises.',
  },
  {
    icon: MessageSquare,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    title: 'Assistente Jurídico IA',
    desc: 'Chat especialista em MROSC com upload de PDF — análise automática com fundamentação legal em cada resposta.',
  },
];

const STATS = [
  { label: 'Módulos de análise MROSC', value: '14' },
  { label: 'OSCs no Brasil', value: '900 mil+' },
  { label: 'Base legal', value: 'Lei 13.019/2014' },
  { label: 'Disponibilidade', value: '24/7' },
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'O sistema substitui a responsabilidade do servidor?', a: 'Não. O SIACT-MROSC é uma ferramenta de apoio à decisão. Toda análise gerada por IA deve ser revisada e assinada pelo servidor responsável, conforme legislação vigente.' },
    { q: 'Quais bases legais são cobertas?', a: 'Lei 13.019/2014 (MROSC), Decreto 11.948/2024, IN 98/2024, Portaria SGD/MGI nº 473/2026 e toda jurisprudência do TCU relacionada a parcerias OSC.' },
    { q: 'Os dados das análises ficam armazenados onde?', a: 'Em banco de dados seguro na nuvem (Supabase), com controle de acesso por usuário e conformidade LGPD.' },
    { q: 'Como faço para ter acesso ao sistema?', a: 'O acesso é por convite. Solicite ao administrador responsável pelo seu órgão.' },
    { q: 'OSCs de pequeno porte também podem usar?', a: 'Sim — essa é uma das prioridades da iniciativa. O SIACT-MROSC é gratuito e foi pensado especialmente para ajudar OSCs de pequeno e médio porte a entender e participar de chamamentos públicos, sem precisar de consultoria especializada.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>SIACT-MROSC</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Funcionalidades</a>
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Entrar</Link>
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
            >
              Acessar o sistema
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-6"
          >
            <Zap className="w-3.5 h-3.5" />
            Iniciativa DTPAR/SEGES/MGI · Lei 13.019/2014
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            MROSC ao alcance de setoriais e OSCs com{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Inteligência Artificial
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Uma iniciativa alinhada à Diretoria de Transferências e Parcerias da União (DTPAR/SEGES/MGI) para ampliar o conhecimento sobre o MROSC — apoiando setoriais na análise técnica e OSCs de pequeno e médio porte a entender e participar de chamamentos públicos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-indigo-900/30 text-sm"
            >
              Acessar o sistema
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium rounded-2xl transition-all text-sm"
            >
              Ver funcionalidades
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Tudo que setoriais e OSCs precisam em cada fase da parceria MROSC
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Do chamamento público à prestação de contas — cada fase coberta com IA especializada e fundamentação legal automática.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-12 px-6 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-slate-300">Dados criptografados em repouso e em trânsito (TLS 1.3)</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-sm text-slate-300">Conformidade LGPD — sem dados pessoais sem anonimização</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-slate-300">Risco Baixo · Portaria SGD/MGI nº 473/2026</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl border border-white/10 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-violet-600/10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Pronto para simplificar sua jornada no MROSC?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Uma iniciativa da DTPAR/SEGES/MGI para setoriais e OSCs de pequeno e médio porte que precisam entender, participar e executar parcerias com segurança jurídica.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-indigo-900/30 text-sm"
              >
                Acessar o sistema
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SIACT-MROSC</span>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 SIACT-MROSC · Iniciativa alinhada à DTPAR/SEGES/MGI · Parte do conteúdo gerado com o auxílio de IA · O servidor permanece responsável pela revisão e autoria plena.
          </p>
          <Link to="/login" className="text-xs text-slate-500 hover:text-white transition-colors">
            Área restrita →
          </Link>
        </div>
      </footer>
    </div>
  );
}
