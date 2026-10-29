import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Swords, ChevronDown, ChevronUp } from 'lucide-react';

// Merge lab + battle stats per launcher into a single unified view
function mergeStats(launchers, launcherComboStats, launcherBattleStats) {
  const battleMap = Object.fromEntries(launcherBattleStats.map(s => [s.launcherId, s]));

  // Collect best spin time entry per launcher
  const spinMap = {};
  launcherComboStats.forEach(e => {
    if (!spinMap[e.launcherId] || e.avgSpinTime > spinMap[e.launcherId].avgSpinTime) {
      spinMap[e.launcherId] = e;
    }
  });

  const seen = new Set([...Object.keys(spinMap), ...Object.keys(battleMap)]);
  return Array.from(seen).map(lid => {
    const launcher = launchers.find(l => l.id === lid);
    if (!launcher) return null;
    const spin = spinMap[lid];
    const battle = battleMap[lid];
    return { launcher, spin, battle };
  }).filter(Boolean).sort((a, b) => {
    const scoreA = (a.battle?.winRate ?? 0) + (a.spin?.avgSpinTime ?? 0) / 10;
    const scoreB = (b.battle?.winRate ?? 0) + (b.spin?.avgSpinTime ?? 0) / 10;
    return scoreB - scoreA;
  });
}

export default function LauncherEfficiencyTable({ launcherComboStats, launcherBattleStats, launchers }) {
  const [expanded, setExpanded] = useState(null);
  const merged = useMemo(() => mergeStats(launchers, launcherComboStats, launcherBattleStats), [launchers, launcherComboStats, launcherBattleStats]);

  if (merged.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" /> Eficiencia de Lanzadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos de laboratorio ni batallas con lanzadores registrados aún.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" /> Eficiencia de Lanzadores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {merged.map(({ launcher, spin, battle }, idx) => {
          const isOpen = expanded === launcher.id;
          // Combos sorted by spin time for this launcher
          const combosForLauncher = launcherComboStats.filter(e => e.launcherId === launcher.id);
          return (
            <div key={launcher.id} className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : launcher.id)}
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{launcher.name}</p>
                  <div className="flex gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className="text-xs">{launcher.type}</Badge>
                    {launcher.spin_direction && <Badge variant="outline" className="text-xs">{launcher.spin_direction}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {spin && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><FlaskConical className="w-3 h-3" /> Tiempo medio</p>
                      <p className="font-display font-bold text-sm text-cyan-500">{spin.avgSpinTime.toFixed(1)}s</p>
                    </div>
                  )}
                  {battle && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Swords className="w-3 h-3" /> Win rate</p>
                      <p className={`font-display font-bold text-sm ${battle.winRate >= 60 ? 'text-green-500' : battle.winRate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{battle.winRate}%</p>
                    </div>
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border bg-muted/30 p-3 space-y-3">
                  {/* Mobile summary */}
                  <div className="flex gap-4 sm:hidden">
                    {spin && <div><p className="text-xs text-muted-foreground">Tiempo medio</p><p className="font-display font-bold text-cyan-500">{spin.avgSpinTime.toFixed(1)}s</p></div>}
                    {battle && <div><p className="text-xs text-muted-foreground">Win rate</p><p className={`font-display font-bold ${battle.winRate >= 60 ? 'text-green-500' : battle.winRate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{battle.winRate}%</p></div>}
                  </div>

                  {battle?.bestCombo && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Mejor combo (por victorias)</p>
                      <Badge className="bg-primary/10 text-primary border-primary/20">{battle.bestCombo.name}</Badge>
                    </div>
                  )}

                  {combosForLauncher.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Combos por tiempo de giro (lab)</p>
                      <div className="space-y-1.5">
                        {combosForLauncher.slice(0, 5).map(e => (
                          <div key={e.comboId} className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs truncate">{e.combo?.name}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <div className="h-1.5 rounded-full bg-cyan-500/20 w-20 overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (e.avgSpinTime / 120) * 100)}%` }} />
                              </div>
                              <span className="text-xs font-mono text-cyan-600 w-10 text-right">{e.avgSpinTime.toFixed(1)}s</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {battle && (
                    <p className="text-xs text-muted-foreground">{battle.wins} victorias / {battle.losses} derrotas en {battle.total} batallas</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}