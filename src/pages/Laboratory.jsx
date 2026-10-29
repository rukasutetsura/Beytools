import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Clock, Trophy, Target } from 'lucide-react';
import Stopwatch from '@/components/lab/Stopwatch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Laboratory() {
  const [comboId, setComboId] = useState('');
  const [launcherId, setLauncherId] = useState('');
  const [observations, setObservations] = useState('');
  const queryClient = useQueryClient();

  const { data: combos = [] } = useQuery({ queryKey: ['combos'], queryFn: () => localDB.entities.Combo.list() });
  const { data: launchers = [] } = useQuery({ queryKey: ['launchers'], queryFn: () => localDB.entities.Launcher.list() });
  const { data: tests = [] } = useQuery({ queryKey: ['tests'], queryFn: () => localDB.entities.LabTest.list('-created_date') });

  const selectedCombo = combos.find(c => c.id === comboId);
  const selectedLauncher = launchers.find(l => l.id === launcherId);

  const stats = useMemo(() => {
    if (tests.length === 0) return { best: 0, avg: 0, bestCombo: 'N/A', bestLauncher: 'N/A' };
    const best = Math.max(...tests.map(t => t.spin_time || 0));
    const avg = (tests.reduce((a, t) => a + (t.spin_time || 0), 0) / tests.length).toFixed(2);
    
    const comboCount = {};
    const launcherCount = {};
    tests.forEach(t => {
      if (t.combo_name) comboCount[t.combo_name] = (comboCount[t.combo_name] || 0) + (t.spin_time || 0);
      if (t.launcher_name) launcherCount[t.launcher_name] = (launcherCount[t.launcher_name] || 0) + (t.spin_time || 0);
    });
    const bestCombo = Object.entries(comboCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const bestLauncher = Object.entries(launcherCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { best, avg, bestCombo, bestLauncher };
  }, [tests]);

  // Sincroniza el mejor tiempo de giro de cada combo desde el historial de pruebas
  useEffect(() => {
    if (!tests.length || !combos.length) return;
    const bestByCombo = {};
    tests.forEach(t => {
      if (!t.combo_id) return;
      bestByCombo[t.combo_id] = Math.max(bestByCombo[t.combo_id] || 0, t.spin_time || 0);
    });
    const toUpdate = combos.filter(c => {
      const computed = bestByCombo[c.id] || 0;
      return computed > 0 && (c.best_spin_time ?? 0) < computed;
    });
    if (toUpdate.length === 0) return;
    (async () => {
      await Promise.all(toUpdate.map(c => localDB.entities.Combo.update(c.id, { best_spin_time: bestByCombo[c.id] })));
      queryClient.invalidateQueries({ queryKey: ['combos'] });
    })();
  }, [tests, combos, queryClient]);

  const handleSave = async (spinTime) => {
    await localDB.entities.LabTest.create({
      combo_id: comboId, combo_name: selectedCombo?.name || '',
      launcher_id: launcherId, launcher_name: selectedLauncher?.name || '',
      spin_time: spinTime, observations,
    });
    queryClient.invalidateQueries({ queryKey: ['tests'] });
    setObservations('');
    toast.success(`Prueba guardada: ${spinTime}s`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Laboratorio</h1>
        <p className="text-muted-foreground text-sm mt-1">Pruebas de rendimiento</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Configuración de Prueba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Combo</Label>
                  <Select value={comboId || 'none'} onValueChange={v => setComboId(v === 'none' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar combo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Sin combo —</SelectItem>
                      {combos.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lanzador</Label>
                  <Select value={launcherId || 'none'} onValueChange={v => setLauncherId(v === 'none' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar lanzador" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Sin lanzador —</SelectItem>
                      {launchers.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Observaciones</Label>
                <Textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Notas de la prueba..." className="h-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Cronómetro Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <Stopwatch onSave={handleSave} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {[
              { label: 'Mejor Tiempo', value: `${stats.best}s`, icon: Trophy, color: 'text-amber-500' },
              { label: 'Promedio', value: `${stats.avg}s`, icon: Clock, color: 'text-primary' },
              { label: 'Mejor Combo', value: stats.bestCombo, icon: FlaskConical, color: 'text-emerald-500' },
              { label: 'Mejor Lanzador', value: stats.bestLauncher, icon: Target, color: 'text-accent' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold truncate">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              {tests.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sin pruebas registradas</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {tests.slice(0, 20).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{t.combo_name || 'Sin combo'}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {t.launcher_name || 'Sin lanzador'} • {t.created_date ? format(new Date(t.created_date), "d MMM", { locale: es }) : ''}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs shrink-0">
                        {t.spin_time}s
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}