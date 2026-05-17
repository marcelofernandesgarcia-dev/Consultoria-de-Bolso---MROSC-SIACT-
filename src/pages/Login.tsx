import React, { useState } from 'react';
import {
  ShieldCheck, Mail, Lock, Loader2, AlertCircle,
  Eye, EyeOff, CheckCircle2, Zap, FileText, GraduationCap, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const FEATURES = [
  { icon: CheckCircle2, color: '#6366F1', text: 'Elegibilidade e documentação analisadas por IA' },
  { icon: Zap,          color: '#8B5CF6', text: 'Auditoria de nexo causal em segundos' },
  { icon: FileText,     color: '#EC4899', text: 'Pareceres técnicos gerados automaticamente' },
  { icon: GraduationCap,color: '#10B981', text: '31 aulas gratuitas completas sobre MROSC' },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('magic');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) {
        setError('Não foi possível enviar o link. Verifique se o e-mail está cadastrado.');
      } else {
        setMagicSent(true);
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.');
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#060612', color: '#fff' }}>

      {/* ── Decorative: grid + blobs (idêntico ao Landing) ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-[-15%] left-[10%] w-[600px] h-[600px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 h-16 shrink-0"
           style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6366F1, #4338CA)' }}>
            <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">SIACT-MROSC</span>
            <span className="hidden sm:inline text-[10px] ml-2" style={{ color: 'rgba(148,163,184,0.6)' }}>
              Consultoria de Bolso
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/landing')}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'rgba(148,163,184,0.8)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.8)')}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Página inicial
        </button>
      </nav>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-16 items-center">

          {/* ══ ESQUERDA — Brand showcase ══ */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Logo */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-[2.2rem] blur-3xl scale-150 opacity-40"
                   style={{ background: 'linear-gradient(135deg, #6366F1, #4338CA)' }} />
              <div className="absolute -inset-3 rounded-[2.6rem] opacity-20"
                   style={{ border: '1px solid rgba(99,102,241,0.7)' }} />
              <div className="absolute -inset-6 rounded-[3rem] opacity-10"
                   style={{ border: '1px solid rgba(99,102,241,0.4)' }} />
              <div
                className="relative w-24 h-24 rounded-[1.5rem] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #6366F1 0%, #4F46E5 50%, #3730A3 100%)',
                  boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <ShieldCheck className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={1.4} />
              </div>
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-300 whitespace-nowrap"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online · Decreto 11.948/2024
              </div>
            </div>

            {/* Name */}
            <h1 className="text-6xl font-black tracking-tight leading-none text-white">SIACT</h1>
            <h2 className="text-4xl font-black tracking-tight leading-none mt-1"
                style={{ color: 'rgba(165,180,252,0.85)' }}>MROSC</h2>
            <p className="mt-2 text-xs font-medium max-w-xs leading-relaxed"
               style={{ color: 'rgba(148,163,184,0.55)' }}>
              Sistema Inteligente de Análise e Controle de Transferências da União
            </p>

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mt-5"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(124,58,237,0.25))',
                border: '1px solid rgba(165,180,252,0.35)',
              }}
            >
              <span className="text-sm font-black text-white">Consultoria de Bolso</span>
            </div>

            {/* Proposta */}
            <p className="mt-5 text-base font-medium leading-relaxed max-w-sm"
               style={{ color: 'rgba(203,213,225,0.8)' }}>
              Consultores especializados em MROSC cobram{' '}
              <strong style={{ color: '#fff' }}>R$ 300–800/hora</strong>.
              O SIACT democratiza esse acesso — gratuitamente — para as mais de{' '}
              <strong style={{ color: '#a5b4fc' }}>900 mil OSCs</strong> brasileiras.
            </p>

            {/* Features */}
            <ul className="mt-8 space-y-3 w-full max-w-sm">
              {FEATURES.map(({ icon: Icon, color, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(226,232,240,0.85)' }}>{text}</span>
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="flex items-center gap-5 mt-8">
              {[
                { v: '900k+', l: 'OSCs no Brasil' },
                { v: 'Lei', l: '13.019/2014' },
                { v: '24/7', l: 'Disponível' },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-xl font-black text-white">{s.v}</p>
                  <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'rgba(148,163,184,0.6)' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══ DIREITA — Formulário ══ */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(99,102,241,0.2)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08)',
              }}
            >
              {/* Topo colorido */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #7C3AED, #4F46E5)' }} />

              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white tracking-tight">Acessar a plataforma</h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    Acesso por convite. Use seu e-mail cadastrado.
                  </p>
                </div>

                {/* Toggle modo */}
                <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  {(['magic', 'password'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMode(m); setError(''); setMagicSent(false); }}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                      style={mode === m
                        ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff' }
                        : { color: 'rgba(148,163,184,0.6)' }
                      }
                    >
                      {m === 'magic' ? '✉ Link mágico' : '🔒 Senha'}
                    </button>
                  ))}
                </div>

                {/* Confirmação magic link enviado */}
                {magicSent ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                         style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-white font-semibold">Link enviado!</p>
                    <p className="text-sm" style={{ color: 'rgba(148,163,184,0.7)' }}>
                      Verifique sua caixa de entrada em<br />
                      <strong className="text-indigo-300">{email}</strong>
                    </p>
                    <button
                      onClick={() => setMagicSent(false)}
                      className="text-xs underline mt-2"
                      style={{ color: 'rgba(148,163,184,0.5)' }}
                    >
                      Usar outro e-mail
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">

                    {/* E-mail */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
                             style={{ color: 'rgba(148,163,184,0.7)' }}>
                        E-mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                              style={{ color: 'rgba(99,102,241,0.6)' }} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.gov.br"
                          required
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            color: '#fff',
                            outline: 'none',
                          }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Senha (só no modo password) */}
                    {mode === 'password' && (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
                               style={{ color: 'rgba(148,163,184,0.7)' }}>
                          Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                                style={{ color: 'rgba(99,102,241,0.6)' }} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(99,102,241,0.2)',
                              color: '#fff',
                              outline: 'none',
                            }}
                            onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
                            onBlur={e => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')}
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm transition-all placeholder:text-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: 'rgba(148,163,184,0.5)' }}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Erro */}
                    {error && (
                      <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
                           style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || !email || (mode === 'password' && !password)}
                      style={{
                        background: loading || !email
                          ? 'rgba(255,255,255,0.06)'
                          : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        boxShadow: loading || !email ? 'none' : '0 4px 20px rgba(79,70,229,0.45)',
                        color: loading || !email ? 'rgba(148,163,184,0.4)' : '#fff',
                      }}
                      className="w-full py-3.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2 mt-1"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                        : mode === 'magic'
                          ? <><Mail className="w-4 h-4" /> Enviar link de acesso</>
                          : <><ShieldCheck className="w-4 h-4" /> Entrar na plataforma</>
                      }
                    </button>
                  </form>
                )}

                {/* Rodapé do card */}
                <div className="mt-6 pt-5 text-center"
                     style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
                  <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                    Sem acesso?{' '}
                    <span className="font-semibold" style={{ color: '#a5b4fc' }}>
                      Solicite um convite ao administrador
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              {[
                { icon: ShieldCheck, label: 'Criptografado TLS' },
                { icon: ShieldCheck, label: 'Conforme LGPD' },
              ].map(({ icon: Icon, label }) => (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-1.5 text-[10px]"
                       style={{ color: 'rgba(148,163,184,0.5)' }}>
                    <Icon className="w-3 h-3 text-emerald-500" />
                    {label}
                  </div>
                  <div className="w-px h-3" style={{ background: 'rgba(99,102,241,0.2)' }} />
                </React.Fragment>
              ))}
              <div className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>
                Powered by Supabase
              </div>
            </div>

            <p className="mt-4 text-center text-[9px]" style={{ color: 'rgba(148,163,184,0.35)' }}>
              SIACT-MROSC © 2026 · Uso restrito a usuários autorizados
            </p>
            <p className="mt-2 text-center">
              <button
                onClick={() => navigate('/landing')}
                className="text-[10px] transition-colors"
                style={{ color: 'rgba(148,163,184,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.4)')}
              >
                ← Voltar à página inicial
              </button>
            </p>
          </div>

        </div>
      </div>

      {/* Bottom legal line */}
      <div className="relative z-10 text-center py-4"
           style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
        <p className="text-[9px]" style={{ color: 'rgba(148,163,184,0.3)' }}>
          Lei 13.019/2014 · Decreto 11.948/2024 · Portaria Interministerial 197/2025 · LGPD
        </p>
      </div>

    </div>
  );
}
