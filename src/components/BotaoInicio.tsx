import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

/**
 * Botão flutuante fixo — presente em toda tela autenticada, leva de volta pra "Por onde
 * começar" (a tela inicial padrão do sistema). Some só na própria /inicio, onde não faz
 * sentido oferecer "voltar pra onde você já está".
 */
export function BotaoInicio() {
  const { pathname } = useLocation();
  if (pathname === '/inicio') return null;

  return (
    <Link
      to="/inicio"
      title="Voltar para Por onde começar"
      aria-label="Voltar para a tela inicial"
      className="fixed top-4 right-4 md:top-5 md:right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 print:hidden"
      style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5, #7C3AED)' }}
    >
      <Home className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
    </Link>
  );
}
