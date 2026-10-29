import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function ReferenceComboCard({ combo, onClick }) {
  const mx = statMax(combo.sistema);
  const components = [
    combo.lock_chip && { label: 'Lock Chip', value: combo.lock_chip },
    combo.blade && { label: 'Blade', value: combo.blade },
    combo.main_blade && { label: 'Main Blade', value: combo.main_blade },
    combo.metal_blade && { label: 'Metal Blade', value: combo.metal_blade },
    combo.assist_blade && { label: 'Assist Blade', value: combo.assist_blade },
    combo.over_blade && { label: 'OverBlade', value: combo.over_blade },
    combo.ratchet && { label: 'Ratchet', value: combo.ratchet },
    combo.bit && { label: 'Bit', value: combo.bit },
  ].filter(Boolean);
  const img = combo.images?.[0];

  return (
    <Card className="cursor-pointer hover:border-primary/40 hover:shadow-md transition-all overflow-hidden" onClick={onClick}>
      {/* IMG combo */}
      {img && (
        <div className="aspect-[16/9] bg-secondary/40 overflow-hidden">
          <img src={img} alt={combo.combo} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate leading-tight">{combo.combo}</h3>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              {combo.sistema && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{combo.sistema}</Badge>}
              {combo.type && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${typeColors[combo.type] || ''}`}>{combo.type}</span>
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
          <span>{combo.spin_direction || '—'}</span>
        </div>

        {components.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {components.map((c, i) => (
              <span key={i} className="text-[10px] bg-secondary/60 rounded px-1.5 py-0.5">
                <span className="text-muted-foreground">{c.label}:</span> {c.value}
              </span>
            ))}
          </div>
        )}

        {combo.notes && (
          <p className="text-[11px] text-muted-foreground italic">{combo.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}