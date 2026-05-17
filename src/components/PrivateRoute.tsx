import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

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

  return <>{children}</>;
}
