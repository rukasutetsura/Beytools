import { cn } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    green: 'bg-emerald-500/10 text-emerald-500',
    orange: 'bg-amber-500/10 text-amber-500',
    red: 'bg-red-500/10 text-red-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold font-display">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}