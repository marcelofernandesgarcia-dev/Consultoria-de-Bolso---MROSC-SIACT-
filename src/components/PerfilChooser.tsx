import React, { useState } from 'react';
import { Users, Building2, ShieldCheck, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function PerfilChooser() {
  const { definirPerfil } = useAuth();
  const [loading, setLoading] = useState(false);

  const escolherOsc = async () => {
    setLoading(true);
    try {
      await definirPerfil('osc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F2F4F8' }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Como você vai usar o SIACT-MROSC?</h1>
          <p className="text-slate-500 mt-2 text-sm">Essa escolha define quais ferramentas aparecem pra você. Não é possível trocar depois — se precisar, fale com o administrador.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={escolherOsc}
            disabled={loading}
            className="flex flex-col items-start p-7 bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl text-left transition-all group disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100">
              {loading ? <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" /> : <Users className="w-6 h-6 text-indigo-600" />}
            </div>
            <p className="font-bold text-slate-900">Organização da Sociedade Civil (OSC)</p>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Associação, fundação, cooperativa ou entidade parceira. Acesso livre, sem burocracia adicional.
            </p>
          </button>

          <div className="flex flex-col items-start p-7 bg-white border-2 border-slate-200 rounded-2xl text-left opacity-70 relative">
            <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" /> Em breve
            </span>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-bold text-slate-900">Servidor Público / Setorial</p>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Servidor do órgão concedente, fiscal ou parecerista. O acesso exige identidade verificada via gov.br.
            </p>
            <button
              disabled
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
            >
              Entrar com gov.br — aguardando credenciamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
