import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Layers, Package } from 'lucide-react';
import StatBar from '@/components/combos/StatBar';
import { getStatsForPart, STAT_LABELS } from '@/lib/partStats';

const TYPE_COLORS = {
  'Ataque': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Defensa': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Resistencia': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Equilibrio': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STAT_MAX = {
  attack_stat: 60,
  defense_stat: 40,
  stamina_stat: 40,
  height_stat: 80,
  dash_stat: 40,
  burst_stat: 80,
};

export default function ReferencePartDetail({ part, onBack }) {
  const images = Array.isArray(part.images) && part.images.length
    ? part.images
    : (part.image_url ? [part.image_url] : []);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver
        </Button>
        <div>
          <h2 className="text-xl font-display font-bold">{part.name}</h2>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <Badge variant="outline" className="text-[10px]">{part.sistema}</Badge>
            <Badge variant="outline" className="text-[10px]">{part.category}</Badge>
            {part.type && <Badge className={`text-[10px] border ${TYPE_COLORS[part.type] || ''}`}>{part.type}</Badge>}
            {part.spin_direction && <Badge variant="outline" className="text-[10px]">{part.spin_direction}</Badge>}
          </div>
        </div>
      </div>

      {/* IMG pieces — galería de imágenes */}
      {images.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Package className="w-4 h-4" /> Imágenes ({images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((src, i) => (
                <div key={i} className="aspect-square bg-secondary/40 rounded-lg overflow-hidden border border-border">
                  <img src={src} alt={`${part.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {getStatsForPart(part).length > 0 && getStatsForPart(part).some(key => part[key] > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Estadísticas Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {getStatsForPart(part).map(key => (
              <StatBar key={key} label={STAT_LABELS[key]} value={part[key] || 0} max={STAT_MAX[key] || 80} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Variants */}
      {part.variants?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Layers className="w-4 h-4" /> Variantes ({part.variants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {part.variants.map((v, i) => (
              <div key={i} className="flex items-start justify-between p-3 bg-secondary/50 rounded-lg gap-3">
                <div>
                  <p className="text-sm font-medium">{v.name}</p>
                  {v.notes && <p className="text-xs text-muted-foreground mt-0.5">{v.notes}</p>}
                </div>
                {v.product_code && (
                  <Badge variant="outline" className="text-[10px] shrink-0">{v.product_code}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stock Combos */}
      {part.stock_combos?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Package className="w-4 h-4" /> Combos Stock ({part.stock_combos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {part.stock_combos.map((c, i) => (
              <div key={i} className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-display font-bold">{c.combo}</p>
                  {c.product_code && <Badge variant="outline" className="text-[10px]">{c.product_code}</Badge>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.blade && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Blade: {c.blade}</span>}
                  {c.main_blade && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Main: {c.main_blade}</span>}
                  {c.assist_blade && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Assist: {c.assist_blade}</span>}
                  {c.ratchet && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Ratchet: {c.ratchet}</span>}
                  {c.bit && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Bit: {c.bit}</span>}
                </div>
                {c.notes && <p className="text-xs text-muted-foreground mt-2">{c.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}