import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Package, Puzzle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SortControl from '@/components/common/SortControl';
import { applySort } from '@/lib/sortItems';
import defaultCatalog from '@/data/referenceCatalog.json';
import { normalizeReferenceCatalog } from '@/lib/normalizeReferenceCatalog';
import ReferencePartCard from '@/components/reference/ReferencePartCard';
import ReferencePartDetail from '@/components/reference/ReferencePartDetail';
import ReferenceComboCard from '@/components/reference/ReferenceComboCard';

const SISTEMAS = ['BX', 'BX INFINITY', 'UX', 'UX INFINITY', 'CX', 'CX INFINITY'];
const CATEGORIES = ['Blade', 'Ratchet', 'Bit', 'BladeRatchet', 'Lock Chip', 'Main Blade', 'Assist Blade', 'OverBlade', 'Metal Blade'];

const REF_PART_SORT_OPTIONS = [
  { value: 'name', label: 'Nombre' },
  { value: 'weight', label: 'Peso' },
  { value: 'attack_stat', label: 'Ataque' },
  { value: 'defense_stat', label: 'Defensa' },
  { value: 'stamina_stat', label: 'Resistencia' },
  { value: 'height_stat', label: 'Altura' },
  { value: 'dash_stat', label: 'Dash' },
  { value: 'burst_stat', label: 'Burst' },
];

const REF_COMBO_SORT_OPTIONS = [
  { value: 'name', label: 'Nombre' },
  { value: 'total_weight', label: 'Peso' },
  { value: 'attack_stat', label: 'Ataque' },
  { value: 'defense_stat', label: 'Defensa' },
  { value: 'stamina_stat', label: 'Resistencia' },
  { value: 'height_stat', label: 'Altura' },
  { value: 'dash_stat', label: 'Dash' },
  { value: 'burst_stat', label: 'Burst' },
];

function loadCatalog() {
  const stored = localStorage.getItem('beytools-reference-catalog');
  const raw = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : defaultCatalog;
  return normalizeReferenceCatalog(raw) || normalizeReferenceCatalog(defaultCatalog);
}

export default function ReferenceCatalog() {
  const { partId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterSistema, setFilterSistema] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('parts');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleViewChange = (mode) => {
    setViewMode(mode);
    setSortBy('name');
    setSortDir('asc');
  };

  const catalogData = useMemo(() => loadCatalog(), []);
  const parts = catalogData.parts || [];

  const selected = partId ? parts.find(p => p.id === partId) : null;

  const allCombos = catalogData.combos || [];

  const filtered = useMemo(() => {
    let result;
    if (viewMode === 'combos') {
      result = allCombos.filter(c => {
        if (search && !c.combo.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterSistema !== 'all' && c.sistema !== filterSistema) return false;
        return true;
      });
    } else {
      result = parts.filter(p => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterSistema !== 'all' && p.sistema !== filterSistema) return false;
        if (filterCategory !== 'all' && p.category !== filterCategory) return false;
        return true;
      });
    }
    return applySort(result, sortBy, sortDir);
  }, [parts, allCombos, viewMode, search, filterSistema, filterCategory, sortBy, sortDir]);

  const hasFilters = search || filterSistema !== 'all' || filterCategory !== 'all';

  if (partId) {
    if (selected) {
      return (
        <div className="max-w-3xl mx-auto">
          <ReferencePartDetail part={selected} onBack={() => navigate('/referencia')} />
        </div>
      );
    }
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Pieza no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/referencia')}>Volver al catálogo</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Catálogo de Referencia</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {parts.length} piezas · {allCombos.length} combos oficiales · v{catalogData.version} ({catalogData.lastUpdated}){localStorage.getItem('beytools-reference-catalog') ? ' · Catálogo personalizado' : ''}
          </p>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => handleViewChange('parts')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === 'parts' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Puzzle className="w-4 h-4" /> Piezas
        </button>
        <button
          onClick={() => handleViewChange('combos')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            viewMode === 'combos' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <Package className="w-4 h-4" /> Combos Oficiales
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pieza..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterSistema} onValueChange={setFilterSistema}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sistema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sistemas</SelectItem>
            {SISTEMAS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {viewMode === 'parts' && (
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <SortControl
          value={sortBy}
          onChange={setSortBy}
          options={viewMode === 'parts' ? REF_PART_SORT_OPTIONS : REF_COMBO_SORT_OPTIONS}
          direction={sortDir}
          onDirectionChange={setSortDir}
          triggerClassName="w-40"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterSistema('all'); setFilterCategory('all'); }}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Results count */}
      {hasFilters && (
        <p className="text-sm text-muted-foreground">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No se encontraron {viewMode === 'parts' ? 'piezas' : 'combos'} con esos filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {viewMode === 'parts'
            ? filtered.map(part => (
              <ReferencePartCard key={part.id} part={part} onClick={() => navigate(`/referencia/${part.id}`)} />
            ))
            : filtered.map((combo, i) => (
              <ReferenceComboCard key={`${combo.combo}-${i}`} combo={combo} />
            ))
          }
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pb-2">
        Catálogo de referencia oficial — solo lectura. Para tu colección personal usa el Catálogo.
      </p>
    </div>
  );
}