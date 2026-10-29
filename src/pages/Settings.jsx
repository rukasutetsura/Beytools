import { useState, useEffect } from 'react';
import { localDB } from '@/lib/localDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Sun, Moon, Palette, BookOpen, User, FileJson, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import defaultCatalog from '@/data/referenceCatalog.json';
import { normalizeReferenceCatalog } from '@/lib/normalizeReferenceCatalog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const COLOR_PRESETS = [
  { label: 'Azul', primary: '210 100% 50%', accent: '262 83% 58%' },
  { label: 'Rojo', primary: '0 84% 55%', accent: '25 95% 53%' },
  { label: 'Verde', primary: '152 69% 42%', accent: '180 70% 40%' },
  { label: 'Morado', primary: '262 83% 58%', accent: '300 70% 50%' },
  { label: 'Dorado', primary: '38 92% 50%', accent: '30 100% 55%' },
  { label: 'Cyan', primary: '192 100% 45%', accent: '210 100% 50%' },
];

const SURVEY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdF3_m9ZdmSyEeODlBRb6t4_jaH7x0yUFpVtpMITgfbNUuw1A/viewform?usp=sharing&ouid=115973283802543679250';

function applyColors(primary, accent) {
  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--ring', primary);
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--sidebar-primary', primary);
  document.documentElement.style.setProperty('--sidebar-ring', primary);
  document.documentElement.style.setProperty('--chart-1', primary);
  document.documentElement.style.setProperty('--chart-2', accent);
}

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('beytools-theme') || 'dark');
  const [colorPreset, setColorPreset] = useState(localStorage.getItem('beytools-color') || 'Azul');

  useEffect(() => {
    // Apply saved color on mount
    const saved = COLOR_PRESETS.find(p => p.label === colorPreset);
    if (saved) applyColors(saved.primary, saved.accent);
  }, []);

  useEffect(() => {
    localStorage.setItem('beytools-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleColorSelect = (preset) => {
    setColorPreset(preset.label);
    localStorage.setItem('beytools-color', preset.label);
    applyColors(preset.primary, preset.accent);
    toast.success(`Color aplicado: ${preset.label}`);
  };

  const handleExport = async () => {
    const [parts, launchers, combos, tests, battles, tournaments] = await Promise.all([
      localDB.entities.Part.list(),
      localDB.entities.Launcher.list(),
      localDB.entities.Combo.list(),
      localDB.entities.LabTest.list(),
      localDB.entities.Battle.list(),
      localDB.entities.Tournament.list(),
    ]);
    const data = { parts, launchers, combos, tests, battles, tournaments, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beytools-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados correctamente');
  };

  const handleExportReference = () => {
    const stored = localStorage.getItem('beytools-reference-catalog');
    const data = stored ? JSON.parse(stored) : defaultCatalog;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beytools-referencia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Catálogo de referencia exportado');
  };

  const handleImportReference = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      let data;
      try { data = JSON.parse(text); }
      catch { toast.error('El archivo no es un JSON válido'); return; }
      const hasPieces = Array.isArray(data.pieces);
      const hasParts = Array.isArray(data.parts);
      if (!hasPieces && !hasParts) {
        toast.error('El archivo no es un catálogo de referencia válido');
        return;
      }
      localStorage.setItem('beytools-reference-catalog', JSON.stringify(data));
      const norm = normalizeReferenceCatalog(data);
      toast.success(`Catálogo importado: ${norm?.parts?.length || 0} piezas · ${norm?.combos?.length || 0} combos`);
    };
    input.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.parts?.length) await localDB.entities.Part.bulkCreate(data.parts.map(({ id, created_date, updated_date, created_by_id, ...rest }) => rest));
      if (data.launchers?.length) await localDB.entities.Launcher.bulkCreate(data.launchers.map(({ id, created_date, updated_date, created_by_id, ...rest }) => rest));
      if (data.combos?.length) await localDB.entities.Combo.bulkCreate(data.combos.map(({ id, created_date, updated_date, created_by_id, ...rest }) => rest));
      if (data.tests?.length) await localDB.entities.LabTest.bulkCreate(data.tests.map(({ id, created_date, updated_date, created_by_id, ...rest }) => rest));
      if (data.battles?.length) await localDB.entities.Battle.bulkCreate(data.battles.map(({ id, created_date, updated_date, created_by_id, ...rest }) => rest));
      if (data.tournaments?.length) await localDB.entities.Tournament.bulkCreate(data.tournaments.map(({ id, created_date, updated_date, created_by_id, ...rest }) => rest));

      toast.success('Datos importados correctamente');
    };
    input.click();
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem('beytools-username');
    localStorage.removeItem('beytools-profile');
    toast.success('Cuenta eliminada');
    setTimeout(() => window.location.href = '/', 500);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Personaliza tu experiencia</p>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Palette className="w-5 h-5" /> Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Light / Dark */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Modo</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 sm:gap-2 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
              >
                <Sun className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
                <span className="text-xs sm:text-sm font-medium">Tema Claro</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 sm:gap-2 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
              >
                <Moon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium">Tema Oscuro</span>
              </button>
            </div>
          </div>

          {/* Color presets */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Color de la App</p>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-4 justify-items-center sm:justify-start">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleColorSelect(preset)}
                  className="flex flex-col items-center gap-1.5 group"
                  title={preset.label}
                >
                  <span
                    className={`w-10 h-10 rounded-full shrink-0 ring-2 transition-all ${colorPreset === preset.label ? 'ring-primary scale-110' : 'ring-border group-hover:ring-primary/40'}`}
                    style={{ background: `hsl(${preset.primary})` }}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <User className="w-5 h-5" /> Mis Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Exporta e importa tu colección personal: piezas, lanzadores, combos, tests de laboratorio, batallas y torneos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleExport} className="gap-2 h-10">
              <Download className="w-4 h-4" /> Exportar mis datos
            </Button>
            <Button variant="outline" onClick={handleImport} className="gap-2 h-10">
              <Upload className="w-4 h-4" /> Importar mis datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reference Catalog JSON */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Catálogo de Referencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Exporta el catálogo oficial de referencia (piezas, variantes y combos stock) en formato JSON para editarlo o compartirlo. Importa una versión actualizada del catálogo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleExportReference} className="gap-2 h-10">
              <FileJson className="w-4 h-4" /> Exportar referencia
            </Button>
            <Button variant="outline" onClick={handleImportReference} className="gap-2 h-10">
              <Upload className="w-4 h-4" /> Importar referencia
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            El catálogo importado reemplaza el actual en tu dispositivo (localStorage).
          </p>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" /> Eliminar Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Elimina tu perfil local, nombre de usuario y favoritos. Esta acción no se puede deshacer.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" /> Eliminar cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se borrarán tu nombre de usuario, favoritos y datos de perfil locales. Tu colección (piezas, combos, batallas) no se eliminará.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Survey */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground text-center">¿Qué te parece BeyTools? Tu opinión nos ayuda a mejorar.</p>
          <Button asChild className="gap-2">
            <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" /> Completar Encuesta
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-6 text-center">
          <p className="font-display text-lg font-bold tracking-wider text-primary">BEYTOOLS</p>
          <p className="text-xs text-muted-foreground mt-1">Versión 1.0 — Beyblade X Tool Suite</p>
          <p className="text-xs text-muted-foreground mt-3">
            Herramienta integral para coleccionistas, jugadores y organizadores de Beyblade X
          </p>
        </CardContent>
      </Card>
    </div>
  );
}