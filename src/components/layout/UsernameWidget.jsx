import { useState } from 'react';
import { User, Check, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUsername } from '@/hooks/useUsername';

export default function UsernameWidget() {
  const { username, saveUsername } = useUsername();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(username);
    setEditing(true);
  };

  const confirm = () => {
    saveUsername(draft);
    setEditing(false);
  };

  return (
    <div className="px-3 py-2 border-b border-border">
      {editing ? (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setEditing(false); }}
            placeholder="Tu nombre..."
            className="h-7 text-xs px-2"
          />
          <button onClick={confirm} className="p-1 hover:bg-primary/10 rounded text-primary">
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={startEdit} className="w-full flex items-center gap-2 text-left group">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium truncate flex-1 text-foreground">
            {username || <span className="text-muted-foreground italic">Agregar nombre...</span>}
          </span>
          <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      )}
    </div>
  );
}