import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { Plus, Pencil, Trash2, Search, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import LauncherFormDialog from '@/components/launchers/LauncherFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Launchers() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editLauncher, setEditLauncher] = useState(null);
  const [deleteLauncher, setDeleteLauncher] = useState(null);
  const queryClient = useQueryClient();

  const { data: launchers = [], isLoading } = useQuery({
    queryKey: ['launchers'],
    queryFn: () => localDB.entities.Launcher.list('-created_date'),
  });

  const filtered = launchers.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (!deleteLauncher) return;
    await localDB.entities.Launcher.delete(deleteLauncher.id);
    queryClient.invalidateQueries({ queryKey: ['launchers'] });
    setDeleteLauncher(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Lanzadores</h1>
          <p className="text-muted-foreground text-sm mt-1">{launchers.length} lanzadores registrados</p>
        </div>
        <Button size="sm" onClick={() => { setEditLauncher(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Lanzador
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar lanzador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="bg-card border border-border rounded-xl h-40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Crosshair className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay lanzadores</p>
          <Button className="mt-4" onClick={() => { setEditLauncher(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Agregar lanzador
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(launcher => (
            <div key={launcher.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all group">
              <div className="flex items-start gap-3">
                {launcher.image_url ? (
                  <img src={launcher.image_url} alt={launcher.name} className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Crosshair className="w-6 h-6 text-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{launcher.name}</h3>
                  <div className="flex gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{launcher.type}</Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{launcher.spin_direction}</Badge>
                  </div>
                  {launcher.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{launcher.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditLauncher(launcher); setFormOpen(true); }} className="p-1.5 hover:bg-secondary rounded-md">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteLauncher(launcher)} className="p-1.5 hover:bg-destructive/10 rounded-md">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <LauncherFormDialog open={formOpen} onClose={() => setFormOpen(false)} launcher={editLauncher} onSaved={() => queryClient.invalidateQueries({ queryKey: ['launchers'] })} />

      <AlertDialog open={!!deleteLauncher} onOpenChange={() => setDeleteLauncher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lanzador?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará permanentemente "{deleteLauncher?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}