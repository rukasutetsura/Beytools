import { cn } from '@/lib/utils';

const colorMap = {
  'Ataque': 'bg-blue-500',
  'Defensa': 'bg-emerald-500',
  'Resistencia': 'bg-amber-500',
  'Altura': 'bg-amber-500',
  'Dash': 'bg-purple-500',
  'Burst': 'bg-pink-500',
};

export default function StatBar({ label, value, max = 10 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorMap[label] || 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium w-6 text-right">{value}</span>
    </div>
  );
}