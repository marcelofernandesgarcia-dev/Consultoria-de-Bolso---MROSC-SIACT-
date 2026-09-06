import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PerfilChooser } from './PerfilChooser';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, perfil, isAdmin, isDemo } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F4F8' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verificando acesso...
          </div>
        </div>
      </div>
    );
  }

  // Em desenvolvimento, libera acesso sem autenticação
  if (!user && import.meta.env.PROD) {
    return <Navigate to="/landing" replace />;
  }

  // Usuário autenticado sem perfil definido ainda: precisa se identificar antes de ver o app.
  // Admins e visitantes de demonstração pulam essa escolha — usam o seletor "Visualizar como"
  // na sidebar em vez disso. Pra visitante de demonstração isso também evita uma trava
  // permanente: a opção Setorial do PerfilChooser exige login gov.br (indisponível pra
  // anônimos), então sem essa exceção o visitante nunca conseguiria ver o lado Setorial.
  if (user && !perfil && !isAdmin && !isDemo) {
    return <PerfilChooser />;
  }

  return <>{children}</>;
}
