import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
      </Routes>
    </BrowserRouter>
  );
}
