import { Badge } from '@/components/ui/badge';
import { Layers, ChevronRight, Package } from 'lucide-react';

const TYPE_COLORS = {
  'Ataque': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Defensa': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Resistencia': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Equilibrio': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SISTEMAS_COLORS = {
  'BX': 'bg-primary/10 text-primary',
  'BX INFINITY': 'bg-primary/20 text-primary',
  'UX': 'bg-orange-500/10 text-orange-400',
  'UX INFINITY': 'bg-orange-500/20 text-orange-400',
  'CX': 'bg-cyan-500/10 text-cyan-400',
  'CX INFINITY': 'bg-cyan-500/20 text-cyan-400',
};

export default function ReferencePartCard({ part, onClick }) {
  const img = part.images?.[0] || part.image_url;
  const imgCount = (part.images?.length || 0) + (part.image_url && !part.images?.length ? 1 : 0);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 group flex flex-col"
    >
      <div className="aspect-square bg-secondary/40 flex items-center justify-center overflow-hidden relative">
        {img ? (
          <img src={img} alt={part.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Package className="w-10 h-10 text-muted-foreground/40" />
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm truncate">{part.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{part.category}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge className={`text-[10px] border ${SISTEMAS_COLORS[part.sistema] || ''}`}>{part.sistema}</Badge>
          {part.type && <Badge className={`text-[10px] border ${TYPE_COLORS[part.type] || ''}`}>{part.type}</Badge>}
        </div>

        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Layers className="w-3 h-3" />
          <span>{imgCount} imagen{imgCount !== 1 ? 'es' : ''}</span>
          <span className="mx-1">·</span>
          <span>{part.stock_combos?.length || 0} combo{(part.stock_combos?.length || 0) !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </button>
  );
}