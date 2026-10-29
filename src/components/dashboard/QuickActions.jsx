import { Link } from 'react-router-dom';
import { 
  Database, Plus, Crosshair, Puzzle, FlaskConical, 
  Swords, Trophy, Settings 
} from 'lucide-react';

const actions = [
  { path: '/catalogo', label: 'Catálogo', icon: Database, color: 'bg-primary/10 text-primary' },
  { path: '/catalogo/nuevo', label: 'Nuevo Componente', icon: Plus, color: 'bg-emerald-500/10 text-emerald-500' },
  { path: '/lanzadores', label: 'Lanzadores', icon: Crosshair, color: 'bg-accent/10 text-accent' },
  { path: '/combos', label: 'Constructor', icon: Puzzle, color: 'bg-amber-500/10 text-amber-500' },
  { path: '/laboratorio', label: 'Laboratorio', icon: FlaskConical, color: 'bg-cyan-500/10 text-cyan-500' },
  { path: '/batallas', label: 'Batallas', icon: Swords, color: 'bg-red-500/10 text-red-500' },
  { path: '/torneos', label: 'Torneos', icon: Trophy, color: 'bg-yellow-500/10 text-yellow-500' },
  { path: '/configuracion', label: 'Configuración', icon: Settings, color: 'bg-muted-foreground/10 text-muted-foreground' },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map(action => (
        <Link
          key={action.path}
          to={action.path}
          className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 group"
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-center">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}