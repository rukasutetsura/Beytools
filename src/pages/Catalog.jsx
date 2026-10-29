import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PullToRefresh from '@/components/common/PullToRefresh';
import PartCard from '@/components/catalog/PartCard';
import PartFilters from '@/components/catalog/PartFilters';
import PartFormDialog from '@/components/catalog/PartFormDialog';
import { applySort } from '@/lib/sortItems';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const PART_SORT_OPTIONS = [
  { value: 'recent', label: 'Recientes' },
  { value: 'name', label: 'Nombre' },
  { value: 'weight', label: 'Peso' },
  { value: 'attack_stat', label: 'Ataque' },
  { value: 'defense_stat', label: 'Defensa' },
  { value: 'stamina_stat', label: 'Resistencia' },
  { value: 'height_stat', label: 'Altura' },
  { value: 'dash_stat', label: 'Dash' },
  { value: 'burst_stat', label: 'Burst' },
];

export default function Catalog() {
  const [filters, setFilters] = useState({ search: '', sistema: '', category: '', type: '', spin: '' });
  const [sortBy, setSortBy] = useState('recent');
  const [sortDir, setSortDir] = useState('desc');
  const [formOpen, setFormOpen] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [deletePart, setDeletePart] = useState(null);
  const queryClient = useQueryClient();

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: () => localDB.entities.Part.list('-created_date'),
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['parts'] });
  };

  const filtered = parts.filter(p => {
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.sistema && p.sistema !== filters.sistema) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.spin && p.spin_direction !== filters.spin) return false;
    return true;
  });
  const sorted = applySort(filtered, sortBy, sortDir);

  const handleDelete = async () => {
    if (!deletePart) return;
    await localDB.entities.Part.delete(deletePart.id);
    queryClient.invalidateQueries({ queryKey: ['parts'] });
    setDeletePart(null);
  };

  const handleImportJSON = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      const partsToImport = Array.isArray(data) ? data : data.parts || [];
      if (partsToImport.length > 0) {
        await localDB.entities.Part.bulkCreate(partsToImport.map(p => ({ ...p, is_official: true })));
        queryClient.invalidateQueries({ queryKey: ['parts'] });
      }
    };
    input.click();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Catálogo de Piezas</h1>
          <p className="text-muted-foreground text-sm mt-1">{parts.length} piezas registradas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImportJSON}>
            <Upload className="w-4 h-4 mr-2" /> Importar JSON
          </Button>
          <Button size="sm" onClick={() => { setEditPart(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Nueva Pieza
          </Button>
        </div>
      </div>

      <PartFilters
        filters={filters}
        onChange={setFilters}
        sortOptions={PART_SORT_OPTIONS}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No se encontraron piezas</p>
          <Button className="mt-4" onClick={() => { setEditPart(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Agregar primera pieza
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sorted.map(part => (
            <PartCard
              key={part.id}
              part={part}
              onEdit={p => { setEditPart(p); setFormOpen(true); }}
              onDelete={p => setDeletePart(p)}
            />
          ))}
        </div>
      )}

      <PartFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        part={editPart}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['parts'] })}
      />

      <AlertDialog open={!!deletePart} onOpenChange={() => setDeletePart(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pieza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente "{deletePart?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PullToRefresh>
  );
}