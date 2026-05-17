import React, { useState } from 'react';
import { User, Mail, Calendar, LogOut, Shield, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function Conta() {
  const { user, signOut } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—';

  async function handleResetPassword() {
    if (!user?.email) return;
    setResetting(true);
    await supabase.auth.resetPasswordForEmail(user.email);
    setResetSent(true);
    setResetting(false);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">Minha Conta</h1>

      {/* Avatar + info */}
      <div className="glass-card rounded-2xl border border-slate-700/50 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.email}</p>
          <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
            <Calendar size={13} />
            Membro desde {memberSince}
          </p>
        </div>
      </div>

      {/* Detalhes */}
      <div className="glass-card rounded-2xl border border-slate-700/50 divide-y divide-slate-700/40">
        <Row icon={<Mail size={15} />} label="E-mail" value={user?.email ?? '—'} />
        <Row icon={<User size={15} />} label="ID da conta" value={user?.id ? user.id.slice(0, 8) + '…' : '—'} />
        <Row icon={<Shield size={15} />} label="Plano atual" value="Pro" accent="text-indigo-400" />
      </div>

      {/* Ações */}
      <div className="glass-card rounded-2xl border border-slate-700/50 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Segurança</h2>

        {resetSent ? (
          <p className="text-emerald-400 text-sm">
            E-mail de redefinição enviado para {user?.email}.
          </p>
        ) : (
          <button
            onClick={handleResetPassword}
            disabled={resetting}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <Key size={15} />
            {resetting ? 'Enviando…' : 'Redefinir senha por e-mail'}
          </button>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
      >
        <LogOut size={15} />
        Encerrar sessão
      </button>
    </div>
  );
}

function Row({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="flex items-center gap-2 text-slate-400 text-sm">
        {icon}
        {label}
      </span>
      <span className={`text-sm font-medium ${accent ?? 'text-slate-200'}`}>{value}</span>
    </div>
  );
}
