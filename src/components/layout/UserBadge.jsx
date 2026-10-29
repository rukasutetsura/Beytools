import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useUsername } from '@/hooks/useUsername';

export default function UserBadge() {
  const { username, photo } = useUsername();

  return (
    <Link to="/perfil" className="px-3 py-2 border-b border-border flex items-center gap-2 hover:bg-secondary/50 transition-colors">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
        {photo ? (
          <img src={photo} alt={username || 'User'} className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-primary" />
        )}
      </div>
      <span className="text-xs font-medium truncate flex-1 text-foreground">
        {username || 'User'}
      </span>
    </Link>
  );
}