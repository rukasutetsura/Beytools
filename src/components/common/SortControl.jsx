import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SortControl({ value, onChange, options, direction, onDirectionChange, className, triggerClassName }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn('h-9 text-xs', triggerClassName)}>
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
        title={direction === 'asc' ? 'Ascendente' : 'Descendente'}
        aria-label={direction === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
      >
        {direction === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4" /> : <ArrowDownWideNarrow className="w-4 h-4" />}
      </Button>
    </div>
  );
}