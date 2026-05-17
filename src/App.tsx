import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MapaOSCHub } from './pages/MapaOSCHub';
import { RadarNormativo } from './pages/RadarNormativo';
import { CotacaoPrevia } from './pages/CotacaoPrevia';
import { AuditoriaNexoCausal } from './pages/AuditoriaNexoCausal';
import { PapeisImpedimentos } from './pages/PapeisImpedimentos';
import { CapacitacaoTecnica } from './pages/CapacitacaoTecnica';
import { AssistenteSiact } from './pages/AssistenteSiact';
import { Arquitetura } from './pages/Arquitetura';
import { Roadmap } from './pages/Roadmap';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="integracao" element={<MapaOSCHub />} />
        <Route path="governanca" element={<PapeisImpedimentos />} />
        <Route path="normas" element={<RadarNormativo />} />
        <Route path="planejamento" element={<CotacaoPrevia />} />
        <Route path="monitoramento" element={<AuditoriaNexoCausal />} />
        <Route path="capacitacao" element={<CapacitacaoTecnica />} />
        <Route path="assistente" element={<AssistenteSiact />} />
        <Route path="arquitetura" element={<Arquitetura />} />
        <Route path="roadmap" element={<Roadmap />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
