import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { localDB } from '@/lib/localDB';

const TYPES = ['String', 'Winder', 'Sword', 'Custom'];
const SPINS = ['Derecha', 'Izquierda'];

const emptyLauncher = { name: '', spin_direction: 'Derecha', type: 'String', image_url: '', notes: '' };

export default function LauncherFormDialog({ open, onClose, launcher, onSaved }) {
  const [form, setForm] = useState(emptyLauncher);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (launcher) setForm({ ...emptyLauncher, ...launcher });
    else setForm(emptyLauncher);
  }, [launcher, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (launcher?.id) {
      await localDB.entities.Launcher.update(launcher.id, form);
    } else {
      await localDB.entities.Launcher.create(form);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{launcher ? 'Editar Lanzador' : 'Nuevo Lanzador'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dirección de Giro</Label>
              <Select value={form.spin_direction} onValueChange={v => setForm(f => ({ ...f, spin_direction: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SPINS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Imagen</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-16 h-16 object-cover rounded-lg" />}
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Guardando...' : launcher ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}