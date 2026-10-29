import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SortControl from '@/components/common/SortControl';

const SISTEMAS = ['BX', 'BX INFINITY', 'UX', 'UX INFINITY', 'CX', 'CX INFINITY'];
const CATEGORIES = ['Blade', 'Ratchet', 'Bit', 'BladeRatchet', 'Lock Chip', 'Main Blade', 'Assist Blade', 'OverBlade', 'Metal Blade'];
const TYPES = ['Ataque', 'Defensa', 'Resistencia', 'Equilibrio'];
const SPINS = ['Derecha', 'Izquierda'];

export default function PartFilters({ filters, onChange, sortOptions, sortBy, onSortChange, sortDir, onSortDirChange }) {
  const hasFilters = filters.search || filters.sistema || filters.category || filters.type || filters.spin;

  const clearAll = () => onChange({ search: '', sistema: '', category: '', type: '', spin: '' });

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pieza..."
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="pl-9 h-9 text-sm"
        />
      </div>
      <Select value={filters.sistema || "all"} onValueChange={v => onChange({ ...filters, sistema: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Sistema" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Sistemas</SelectItem>
          {SISTEMAS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.category || "all"} onValueChange={v => onChange({ ...filters, category: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Categoría" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.type || "all"} onValueChange={v => onChange({ ...filters, type: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.spin || "all"} onValueChange={v => onChange({ ...filters, spin: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Giro" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {SPINS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      {sortOptions && (
        <SortControl
          value={sortBy}
          onChange={onSortChange}
          options={sortOptions}
          direction={sortDir}
          onDirectionChange={onSortDirChange}
          triggerClassName="w-40"
        />
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 text-xs">
          <X className="w-3 h-3 mr-1" /> Limpiar
        </Button>
      )}
    </div>
  );
}