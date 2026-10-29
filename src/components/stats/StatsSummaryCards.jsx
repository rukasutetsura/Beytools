import { Card, CardContent } from '@/components/ui/card';
import { FlaskConical, Swords, Trophy, TrendingUp } from 'lucide-react';

export default function StatsSummaryCards({ launchers, tests, battles, launcherBattleStats }) {
  const topLauncher = launcherBattleStats[0];
  const totalBattles = battles.length;
  const totalTests = tests.length;

  const cards = [
    { icon: FlaskConical, label: 'Tests de Lab', value: totalTests, sub: 'registrados', color: 'text-cyan-500' },
    { icon: Swords, label: 'Batallas', value: totalBattles, sub: 'registradas', color: 'text-red-500' },
    { icon: Trophy, label: 'Mejor Lanzador', value: topLauncher?.launcher?.name || '—', sub: topLauncher ? `${topLauncher.winRate}% victorias (${topLauncher.total} bat.)` : 'Sin datos', color: 'text-amber-500' },
    { icon: TrendingUp, label: 'Lanzadores Analizados', value: launcherBattleStats.length || tests.length ? launchers.length : 0, sub: 'con datos disponibles', color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ icon: Icon, label, value, sub, color }) => (
        <Card key={label}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`mt-0.5 ${color}`}><Icon className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-display font-bold text-lg leading-tight truncate">{value}</p>
              <p className="text-xs text-muted-foreground truncate">{sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}