import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Swords, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { path: '/', label: 'Inicio', icon: LayoutDashboard },
  { path: '/catalogo', label: 'Catálogo', icon: Database },
  { path: '/batallas', label: 'Batallas', icon: Swords },
  { path: '/perfil', label: 'Perfil', icon: UserCircle },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map(item => {
        const active = pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 px-4 transition-colors flex-1',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}