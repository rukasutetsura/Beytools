import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import LauncherEfficiencyTable from '@/components/stats/LauncherEfficiencyTable';
import LauncherRecommendations from '@/components/stats/LauncherRecommendations';
import StatsSummaryCards from '@/components/stats/StatsSummaryCards';
import { BarChart2 } from 'lucide-react';

export default function Statistics() {
  const { data: launchers = [], isLoading: lL } = useQuery({ queryKey: ['launchers'], queryFn: () => localDB.entities.Launcher.list() });
  const { data: combos = [], isLoading: lC } = useQuery({ queryKey: ['combos'], queryFn: () => localDB.entities.Combo.list() });
  const { data: parts = [], isLoading: lP } = useQuery({ queryKey: ['parts'], queryFn: () => localDB.entities.Part.list() });
  const { data: tests = [], isLoading: lT } = useQuery({ queryKey: ['tests'], queryFn: () => localDB.entities.LabTest.list() });
  const { data: battles = [], isLoading: lB } = useQuery({ queryKey: ['battles'], queryFn: () => localDB.entities.Battle.list() });

  const isLoading = lL || lC || lP || lT || lB;

  // Pre-build lookup maps
  const comboMap = useMemo(() => Object.fromEntries(combos.map(c => [c.id, c])), [combos]);
  const launcherMap = useMemo(() => Object.fromEntries(launchers.map(l => [l.id, l])), [launchers]);

  // --- Launcher efficiency from LabTests ---
  // Group tests by launcher+combo, average spin_time
  const launcherComboStats = useMemo(() => {
    const map = {};
    tests.forEach(t => {
      if (!t.launcher_id || !t.combo_id) return;
      const key = `${t.launcher_id}__${t.combo_id}`;
      if (!map[key]) map[key] = { launcherId: t.launcher_id, comboId: t.combo_id, spinTimes: [], testCount: 0 };
      map[key].spinTimes.push(t.spin_time);
      map[key].testCount++;
    });
    return Object.values(map).map(entry => ({
      ...entry,
      avgSpinTime: entry.spinTimes.reduce((a, b) => a + b, 0) / entry.spinTimes.length,
      launcher: launcherMap[entry.launcherId],
      combo: comboMap[entry.comboId],
    })).filter(e => e.launcher && e.combo)
       .sort((a, b) => b.avgSpinTime - a.avgSpinTime);
  }, [tests, launcherMap, comboMap]);

  // --- Win rate per launcher from Battles ---
  const launcherBattleStats = useMemo(() => {
    const map = {};
    battles.forEach(b => {
      [
        { id: b.player_a_launcher_id, won: b.winner === 'A', comboId: b.player_a_combo_id },
        { id: b.player_b_launcher_id, won: b.winner === 'B', comboId: b.player_b_combo_id },
      ].forEach(({ id, won, comboId }) => {
        if (!id) return;
        if (!map[id]) map[id] = { launcherId: id, wins: 0, losses: 0, comboWins: {} };
        won ? map[id].wins++ : map[id].losses++;
        if (won && comboId) {
          map[id].comboWins[comboId] = (map[id].comboWins[comboId] || 0) + 1;
        }
      });
    });
    return Object.values(map).map(entry => {
      const total = entry.wins + entry.losses;
      const bestComboId = Object.entries(entry.comboWins).sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        ...entry,
        total,
        winRate: total > 0 ? Math.round((entry.wins / total) * 100) : 0,
        launcher: launcherMap[entry.launcherId],
        bestCombo: comboMap[bestComboId],
      };
    }).filter(e => e.launcher)
      .sort((a, b) => b.winRate - a.winRate);
  }, [battles, launcherMap, comboMap]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-primary" /> Estadísticas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Eficiencia de lanzadores, combos recomendados y análisis de rendimiento</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <StatsSummaryCards
            launchers={launchers}
            tests={tests}
            battles={battles}
            launcherBattleStats={launcherBattleStats}
          />
          <LauncherEfficiencyTable
            launcherComboStats={launcherComboStats}
            launcherBattleStats={launcherBattleStats}
            launchers={launchers}
          />
          <LauncherRecommendations
            launchers={launchers}
            combos={combos}
            parts={parts}
            launcherComboStats={launcherComboStats}
            launcherBattleStats={launcherBattleStats}
          />
        </>
      )}
    </div>
  );
}