import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeColors = {
  'Ataque': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Defensa': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Resistencia': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Equilibrio': 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function PartCard({ part, onEdit, onDelete }) {
  const images = Array.isArray(part.images) && part.images.length
    ? part.images
    : (part.image_url ? [part.image_url] : []);
  const img = images[0];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
      <div className="aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden relative">
        {img ? (
          <img src={img} alt={part.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-display font-bold text-primary">{part.name?.[0]}</span>
          </div>
        )}
        {images.length > 1 && (
          <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 text-white rounded px-1.5 py-0.5">
            +{images.length - 1}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm truncate flex-1">{part.name}</h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(part)} className="p-1 hover:bg-secondary rounded">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => onDelete(part)} className="p-1 hover:bg-destructive/10 rounded">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{part.sistema}</Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{part.category}</Badge>
          {part.type && (
            <Badge className={cn("text-[10px] px-1.5 py-0 border", typeColors[part.type])}>
              {part.type}
            </Badge>
          )}
        </div>
        {part.weight > 0 && (
          <p className="text-[11px] text-muted-foreground mt-2">{part.weight}g</p>
        )}
      </div>
    </div>
  );
}