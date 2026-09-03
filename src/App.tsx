import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout/Layout';
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
import { Inicio } from './pages/Inicio';
import { ChecklistDocumentos } from './pages/ChecklistDocumentos';
import { ChamamentosAbertos } from './pages/ChamamentosAbertos';
import { CalendarioObrigacoes } from './pages/CalendarioObrigacoes';
import { SimuladorElegibilidade } from './pages/SimuladorElegibilidade';
import { FAQ } from './pages/FAQ';
import { LessonViewer } from './pages/LessonViewer';
import { GeradorParecer } from './pages/GeradorParecer';
import { Landing } from './pages/Landing';
import { Conta } from './pages/Conta';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* A tela inicial padrão do sistema é sempre "Por onde começar" — mesma pra todo mundo. */}
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<Inicio />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="integracao" element={<MapaOSCHub />} />
            <Route path="governanca" element={<PapeisImpedimentos />} />
            <Route path="normas" element={<RadarNormativo />} />
            <Route path="planejamento" element={<CotacaoPrevia />} />
            <Route path="monitoramento" element={<AuditoriaNexoCausal />} />
            <Route path="parecer" element={<GeradorParecer />} />
            <Route path="capacitacao" element={<CapacitacaoTecnica />} />
            <Route path="capacitacao/:cursoId/:aulaId" element={<LessonViewer />} />
            <Route path="assistente" element={<AssistenteSiact />} />
            <Route path="checklist" element={<ChecklistDocumentos />} />
            <Route path="chamamentos" element={<ChamamentosAbertos />} />
            <Route path="calendario" element={<CalendarioObrigacoes />} />
            <Route path="simulador" element={<SimuladorElegibilidade />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="arquitetura" element={<Arquitetura />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="conta" element={<Conta />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
