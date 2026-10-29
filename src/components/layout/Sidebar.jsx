import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Database, Crosshair, Puzzle, FlaskConical, 
  Swords, Trophy, Settings, X, BookOpen, BarChart2, UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UserBadge from './UserBadge';
import AppLogo from './AppLogo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/perfil', label: 'Mi Perfil', icon: UserCircle },
  { path: '/catalogo', label: 'Catálogo', icon: Database },
  { path: '/lanzadores', label: 'Lanzadores', icon: Crosshair },
  { path: '/combos', label: 'Combos', icon: Puzzle },
  { path: '/laboratorio', label: 'Laboratorio', icon: FlaskConical },
  { path: '/batallas', label: 'Batallas', icon: Swords },
  { path: '/torneos', label: 'Torneos', icon: Trophy },
  { path: '/referencia', label: 'Referencia Oficial', icon: BookOpen },
  { path: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { path: '/configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <AppLogo />
            <span className="font-display text-lg font-bold tracking-wider text-foreground">
              BEYTOOLS
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-secondary rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center font-display tracking-widest">
            BEYTOOLS v1.0
          </p>
        </div>
      </aside>
    </>
  );
}