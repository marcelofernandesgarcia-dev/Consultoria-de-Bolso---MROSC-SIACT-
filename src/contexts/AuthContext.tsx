import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Perfil } from '../lib/nav';
import { isAdminEmail } from '../lib/admin';

const PREVIEW_KEY = 'siact_admin_preview_perfil';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  /** Login anônimo de demonstração (botão "Entrar como visitante"). */
  isDemo: boolean;
  /** Perfil real, salvo no cadastro do usuário. */
  perfil: Perfil | null;
  /** Perfil a usar para filtrar menu/rotas: para admin OU visitante de demonstração, é o
   *  preview escolhido (ou null = vê tudo — as duas gavetas, sem bloqueio de rota); para os
   *  demais, é o perfil real, permanente. Visitantes de demonstração precisam ver tudo por
   *  padrão porque quem decide sobre colocar o sistema em produção (ex: alta cúpula do MGI)
   *  usa esse login e precisa acessar todas as funcionalidades e perfis, não só um. */
  perfilVisivel: Perfil | null;
  /** Tem efeito para admins e para visitantes de demonstração — permite pré-visualizar o app
   *  como cada perfil (ou "tudo") sem depender de um cadastro permanente. */
  previewPerfil: Perfil | null;
  setPreviewPerfil: (perfil: Perfil | null) => void;
  definirPerfil: (perfil: Perfil) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadPreviewPerfil(): Perfil | null {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw === 'osc' || raw === 'setorial' ? raw : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewPerfil, setPreviewPerfilState] = useState<Perfil | null>(loadPreviewPerfil);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = isAdminEmail(user?.email);
  const isDemo = Boolean(user?.is_anonymous);
  const perfil: Perfil | null = (user?.user_metadata?.perfil as Perfil | undefined) ?? null;
  const perfilVisivel: Perfil | null = (isAdmin || isDemo) ? previewPerfil : perfil;

  const setPreviewPerfil = (novoPerfil: Perfil | null) => {
    setPreviewPerfilState(novoPerfil);
    try {
      if (novoPerfil) localStorage.setItem(PREVIEW_KEY, novoPerfil);
      else localStorage.removeItem(PREVIEW_KEY);
    } catch {}
  };

  const definirPerfil = async (novoPerfil: Perfil) => {
    const { data, error } = await supabase.auth.updateUser({ data: { perfil: novoPerfil } });
    if (error) throw error;
    if (data.user) setUser(data.user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isDemo, perfil, perfilVisivel, previewPerfil, setPreviewPerfil, definirPerfil, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
