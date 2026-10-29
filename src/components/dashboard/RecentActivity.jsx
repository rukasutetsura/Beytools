import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Database, Puzzle, FlaskConical, Swords } from 'lucide-react';

export default function RecentActivity({ parts, combos, tests, battles }) {
  const activities = [
    ...parts.slice(0, 3).map(p => ({ 
      type: 'part', icon: Database, label: `Pieza: ${p.name}`, 
      date: p.created_date, color: 'text-primary' 
    })),
    ...combos.slice(0, 3).map(c => ({ 
      type: 'combo', icon: Puzzle, label: `Combo: ${c.name}`, 
      date: c.created_date, color: 'text-amber-500' 
    })),
    ...tests.slice(0, 3).map(t => ({ 
      type: 'test', icon: FlaskConical, label: `Prueba: ${t.combo_name || 'Sin nombre'}`, 
      date: t.created_date, color: 'text-cyan-500' 
    })),
    ...battles.slice(0, 3).map(b => ({ 
      type: 'battle', icon: Swords, label: `Batalla: ${b.player_a_name} vs ${b.player_b_name}`, 
      date: b.created_date, color: 'text-red-500' 
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  if (activities.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">Sin actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl divide-y divide-border">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 hover:bg-secondary/50 transition-colors">
          <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center ${activity.color}`}>
            <activity.icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{activity.label}</p>
            <p className="text-[11px] text-muted-foreground">
              {activity.date ? format(new Date(activity.date), "d MMM yyyy, HH:mm", { locale: es }) : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}