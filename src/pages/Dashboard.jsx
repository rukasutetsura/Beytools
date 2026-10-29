import { useQuery, useQueryClient } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { Database, Crosshair, Puzzle, FlaskConical, Swords, Trophy } from 'lucide-react';
import PullToRefresh from '@/components/common/PullToRefresh';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function Dashboard() {
  const { data: parts = [] } = useQuery({ queryKey: ['parts'], queryFn: () => localDB.entities.Part.list('-created_date') });
  const { data: launchers = [] } = useQuery({ queryKey: ['launchers'], queryFn: () => localDB.entities.Launcher.list() });
  const { data: combos = [] } = useQuery({ queryKey: ['combos'], queryFn: () => localDB.entities.Combo.list('-created_date') });
  const { data: tests = [] } = useQuery({ queryKey: ['tests'], queryFn: () => localDB.entities.LabTest.list('-created_date') });
  const { data: battles = [] } = useQuery({ queryKey: ['battles'], queryFn: () => localDB.entities.Battle.list('-created_date') });
  const { data: tournaments = [] } = useQuery({ queryKey: ['tournaments'], queryFn: () => localDB.entities.Tournament.list() });

  const stats = [
    { label: 'Piezas', value: parts.length, icon: Database, color: 'primary' },
    { label: 'Lanzadores', value: launchers.length, icon: Crosshair, color: 'accent' },
    { label: 'Combos', value: combos.length, icon: Puzzle, color: 'orange' },
    { label: 'Pruebas', value: tests.length, icon: FlaskConical, color: 'cyan' },
    { label: 'Batallas', value: battles.length, icon: Swords, color: 'red' },
    { label: 'Torneos', value: tournaments.length, icon: Trophy, color: 'green' },
  ];

  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['parts'] }),
      queryClient.invalidateQueries({ queryKey: ['launchers'] }),
      queryClient.invalidateQueries({ queryKey: ['combos'] }),
      queryClient.invalidateQueries({ queryKey: ['tests'] }),
      queryClient.invalidateQueries({ queryKey: ['battles'] }),
      queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
    ]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen general de tu colección</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold mb-4 tracking-wide">Accesos Rápidos</h2>
        <QuickActions />
      </div>

      <div>
        <h2 className="text-lg font-display font-semibold mb-4 tracking-wide">Actividad Reciente</h2>
        <RecentActivity parts={parts} combos={combos} tests={tests} battles={battles} />
      </div>
    </div>
    </PullToRefresh>
  );
}