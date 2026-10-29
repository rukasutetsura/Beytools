import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Puzzle, Clock } from 'lucide-react';
import StatBar from '@/components/combos/StatBar';

const statMax = (sistema) => {
  if (sistema === 'CX INFINITY') return { combat: 240, tech: 100 };
  if (sistema === 'CX') return { combat: 270, tech: 100 };
  return { combat: 230, tech: 100 };
};

const typeColors = {
  'Ataque': 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Defensa': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Resistencia': 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Equilibrio': 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function ComboCard({ combo, onEdit, onDelete }) {
  const mx = statMax(combo.sistema);
  return (
    <Card className="flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Puzzle className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate leading-tight">{combo.name}</h3>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{combo.sistema}</Badge>
              {combo.dominant_type && combo.dominant_type !== 'N/A' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${typeColors[combo.dominant_type] || ''}`}>{combo.dominant_type}</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <StatBar label="Ataque" value={combo.attack_stat || 0} max={mx.combat} />
          <StatBar label="Defensa" value={combo.defense_stat || 0} max={mx.combat} />
          <StatBar label="Resistencia" value={combo.stamina_stat || 0} max={mx.combat} />
          <StatBar label="Dash" value={combo.dash_stat || 0} max={mx.tech} />
          <StatBar label="Burst" value={combo.burst_stat || 0} max={mx.tech} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
          <span>{combo.total_weight || 0}g</span>
          <div className="flex items-center gap-2">
            {combo.best_spin_time ? (
              <span className="flex items-center gap-1 text-amber-500"><Clock className="w-3 h-3" />{combo.best_spin_time}s</span>
            ) : null}
            <span>{combo.spin_direction || '—'}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => onEdit(combo)}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(combo)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}