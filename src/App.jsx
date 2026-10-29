import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';

const COLOR_PRESETS = [
  { label: 'Azul', primary: '210 100% 50%', accent: '262 83% 58%' },
  { label: 'Rojo', primary: '0 84% 55%', accent: '25 95% 53%' },
  { label: 'Verde', primary: '152 69% 42%', accent: '180 70% 40%' },
  { label: 'Morado', primary: '262 83% 58%', accent: '300 70% 50%' },
  { label: 'Dorado', primary: '38 92% 50%', accent: '30 100% 55%' },
  { label: 'Cyan', primary: '192 100% 45%', accent: '210 100% 50%' },
];

function initApp() {
  // Theme
  const theme = localStorage.getItem('beytools-theme') || 'dark';
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  // Color
  const colorLabel = localStorage.getItem('beytools-color') || 'Azul';
  const preset = COLOR_PRESETS.find(p => p.label === colorLabel);
  if (preset) {
    document.documentElement.style.setProperty('--primary', preset.primary);
    document.documentElement.style.setProperty('--ring', preset.primary);
    document.documentElement.style.setProperty('--accent', preset.accent);
    document.documentElement.style.setProperty('--sidebar-primary', preset.primary);
    document.documentElement.style.setProperty('--sidebar-ring', preset.primary);
    document.documentElement.style.setProperty('--chart-1', preset.primary);
    document.documentElement.style.setProperty('--chart-2', preset.accent);
  }
}
initApp();

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Catalog from '@/pages/Catalog';
import Launchers from '@/pages/Launchers';
import ComboBuilder from '@/pages/ComboBuilder';
import Laboratory from '@/pages/Laboratory';
import Battles from '@/pages/Battles';
import Tournaments from '@/pages/Tournaments';
import Settings from '@/pages/Settings';
import ReferenceCatalog from '@/pages/ReferenceCatalog';
import Statistics from '@/pages/Statistics';
import Profile from '@/pages/Profile';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/catalogo/nuevo" element={<Catalog />} />
            <Route path="/lanzadores" element={<Launchers />} />
            <Route path="/combos" element={<ComboBuilder />} />
            <Route path="/laboratorio" element={<Laboratory />} />
                    <Route path="/batallas" element={<Battles />} />
            <Route path="/torneos" element={<Tournaments />} />
            <Route path="/referencia" element={<ReferenceCatalog />} />
            <Route path="/referencia/:partId" element={<ReferenceCatalog />} />
            <Route path="/estadisticas" element={<Statistics />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/configuracion" element={<Settings />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </QueryClientProvider>
  )
}

export default App