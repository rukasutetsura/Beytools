import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobileSelect from '@/components/ui/MobileSelect';
import { Plus, Search, Puzzle } from 'lucide-react';
import SortControl from '@/components/common/SortControl';
import { applySort } from '@/lib/sortItems';
import ComboCard from '@/components/combos/ComboCard';
import ComboForm from '@/components/combos/ComboForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const SISTEMAS = ['BX', 'BX INFINITY', 'UX', 'UX INFINITY', 'CX', 'CX INFINITY'];
const TYPES = ['Ataque', 'Defensa', 'Resistencia', 'Equilibrio'];

const COMBO_SORT_OPTIONS = [
  { value: 'recent', label: 'Recientes' },
  { value: 'name', label: 'Nombre' },
  { value: 'total_weight', label: 'Peso' },
  { value: 'attack_stat', label: 'Ataque' },
  { value: 'defense_stat', label: 'Defensa' },
  { value: 'stamina_stat', label: 'Resistencia' },
  { value: 'height_stat', label: 'Altura' },
  { value: 'dash_stat', label: 'Dash' },
  { value: 'burst_stat', label: 'Burst' },
  { value: 'best_spin_time', label: 'Tiempo de giro' },
];

export default function ComboBuilder() {
  const [search, setSearch] = useState('');
  const [sistemaFilter, setSistemaFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [sortDir, setSortDir] = useState('desc');
  const [formOpen, setFormOpen] = useState(false);
  const [editCombo, setEditCombo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: parts = [] } = useQuery({
    queryKey: ['parts'],
    queryFn: () => localDB.entities.Part.list(),
  });

  const { data: combos = [] } = useQuery({
    queryKey: ['combos'],
    queryFn: () => localDB.entities.Combo.list('-created_date'),
  });

  const filtered = useMemo(() => {
    const result = combos.filter(c => {
      if (sistemaFilter !== 'all' && c.sistema !== sistemaFilter) return false;
      if (typeFilter !== 'all' && c.dominant_type !== typeFilter) return false;
      if (search.trim() && !c.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    return applySort(result, sortBy, sortDir);
  }, [combos, sistemaFilter, typeFilter, search, sortBy, sortDir]);

  const handleEdit = (combo) => {
    setEditCombo(combo);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditCombo(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await localDB.entities.Combo.delete(deleteTarget.id);
      queryClient.setQueryData(['combos'], (old = []) => old.filter(c => c.id !== deleteTarget.id));
      toast.success('Combo eliminado');
      setDeleteTarget(null);
    } catch (e) {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Combos</h1>
          <p className="text-muted-foreground text-sm mt-1">{combos.length} combo{combos.length !== 1 ? 's' : ''} disponibles</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Crear Combo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar combo..." className="pl-9" />
        </div>
        <MobileSelect
          value={sistemaFilter}
          onChange={setSistemaFilter}
          placeholder="Sistema"
          triggerClassName="sm:w-40"
          options={[{ value: 'all', label: 'Todos los sistemas' }, ...SISTEMAS.map(s => ({ value: s, label: s }))]}
        />
        <MobileSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="Tipo"
          triggerClassName="sm:w-40"
          options={[{ value: 'all', label: 'Todos los tipos' }, ...TYPES.map(t => ({ value: t, label: t }))]}
        />
        <SortControl
          value={sortBy}
          onChange={setSortBy}
          options={COMBO_SORT_OPTIONS}
          direction={sortDir}
          onDirectionChange={setSortDir}
          triggerClassName="w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Puzzle className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            {combos.length === 0 ? 'Aún no hay combos. ¡Crea el primero!' : 'No se encontraron combos con esos filtros'}
          </p>
          {combos.length === 0 && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" /> Crear Combo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(combo => (
            <ComboCard key={combo.id} combo={combo} onEdit={handleEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <ComboForm open={formOpen} onOpenChange={setFormOpen} editCombo={editCombo} parts={parts} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar combo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar "{deleteTarget?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}