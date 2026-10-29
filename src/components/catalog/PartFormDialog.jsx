import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { localDB } from '@/lib/localDB';
import { getStatsForPart, STAT_LABELS } from '@/lib/partStats';

const SISTEMAS = ['BX', 'BX INFINITY', 'UX', 'UX INFINITY', 'CX', 'CX INFINITY'];
const TYPES = ['Ataque', 'Defensa', 'Resistencia', 'Equilibrio'];
const SPINS = ['Derecha', 'Izquierda'];

const CATEGORIES_BY_SISTEMAS = {
  'BX': ['Blade', 'Ratchet', 'Bit'],
  'BX INFINITY': ['Blade', 'Ratchet', 'Bit'],
  'UX': ['Blade', 'Ratchet', 'Bit'],
  'UX INFINITY': ['BladeRatchet', 'Bit'],
  'CX': ['Lock Chip', 'Main Blade', 'Assist Blade', 'Ratchet', 'Bit'],
  'CX INFINITY': ['Lock Chip', 'OverBlade', 'Metal Blade', 'Assist Blade', 'Ratchet', 'Bit'],
};

const emptyPart = {
  name: '', sistema: 'BX', category: 'Blade', type: 'Ataque',
  spin_direction: 'Derecha', weight: '', stock_combo: '', image_url: '', images: [],
  notes: '', is_integrated_bit: false, attack_stat: '', defense_stat: '',
  stamina_stat: '', height_stat: '', dash_stat: '', burst_stat: '',
  attack_stat_active: '', defense_stat_active: '', stamina_stat_active: '',
  height_stat_active: '', dash_stat_active: '', burst_stat_active: '',
};

export default function PartFormDialog({ open, onClose, part, onSaved }) {
  const [form, setForm] = useState(emptyPart);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statMode, setStatMode] = useState('inactive');

  useEffect(() => {
    if (part) setForm({ ...emptyPart, ...part, images: Array.isArray(part.images) ? part.images : (part.image_url ? [part.image_url] : []) });
    else setForm(emptyPart);
    setStatMode('inactive');
  }, [part, open]);

  const categories = CATEGORIES_BY_SISTEMAS[form.sistema] || ['Blade', 'Ratchet', 'Bit'];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(file => base44.integrations.Core.UploadFile({ file }))
      );
      setForm(f => ({ ...f, images: [...(f.images || []), ...uploaded.map(u => u.file_url)] }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (idx) => {
    setForm(f => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setSaving(true);
    const numericFields = ['weight', 'attack_stat', 'defense_stat', 'stamina_stat', 'height_stat', 'dash_stat', 'burst_stat', 'attack_stat_active', 'defense_stat_active', 'stamina_stat_active', 'height_stat_active', 'dash_stat_active', 'burst_stat_active'];
    const cleanForm = { ...form };
    if (!Array.isArray(cleanForm.images)) cleanForm.images = [];
    numericFields.forEach(k => { if (cleanForm[k] === '') cleanForm[k] = 0; });
    if (part?.id) {
      await localDB.entities.Part.update(part.id, cleanForm);
    } else {
      await localDB.entities.Part.create(cleanForm);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  const updateField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{part ? 'Editar Pieza' : 'Nueva Pieza'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Nombre de la pieza" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Sistema *</Label>
              <Select value={form.sistema} onValueChange={v => {
                const cats = CATEGORIES_BY_SISTEMAS[v];
                updateField('sistema', v);
                if (!cats.includes(form.category)) updateField('category', cats[0]);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SISTEMAS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoría *</Label>
              <Select value={form.category} onValueChange={v => updateField('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => updateField('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dirección de Giro</Label>
              <Select value={form.spin_direction} onValueChange={v => updateField('spin_direction', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SPINS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Peso (g)</Label>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  value={form.weight === null ? '' : form.weight}
                  disabled={form.weight === null}
                  onChange={e => updateField('weight', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                  placeholder="0.0"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => updateField('weight', form.weight === null ? '' : null)}
                  title="Desconocido"
                  className={`px-2.5 rounded-md border text-sm font-bold transition-colors ${form.weight === null ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-secondary'}`}
                >?</button>
              </div>
            </div>
            <div>
              <Label>Combo Stock</Label>
              <Input value={form.stock_combo} onChange={e => updateField('stock_combo', e.target.value)} placeholder="Combo original" />
            </div>
          </div>

          {form.category === 'Bit' && (
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Switch checked={form.is_integrated_bit} onCheckedChange={v => updateField('is_integrated_bit', v)} />
              <Label className="text-sm">Bit Integrada (Operate/Turbo) — anula Ratchet</Label>
            </div>
          )}

          {getStatsForPart(form).length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label>Estadísticas</Label>
                {form.is_integrated_bit && (
                  <div className="flex items-center gap-1 p-0.5 bg-secondary/60 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setStatMode('inactive')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${statMode === 'inactive' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >Desactivada</button>
                    <button
                      type="button"
                      onClick={() => setStatMode('active')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${statMode === 'active' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >Activada</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {getStatsForPart(form).map(key => {
                  const fieldKey = form.is_integrated_bit && statMode === 'active' ? `${key}_active` : key;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20">{STAT_LABELS[key]}</span>
                      <Input
                        type="number" min="0" max="10"
                        value={form[fieldKey] === null ? '' : form[fieldKey]}
                        disabled={form[fieldKey] === null}
                        onChange={e => updateField(fieldKey, e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
                        placeholder="0"
                        className="h-8 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => updateField(fieldKey, form[fieldKey] === null ? '' : null)}
                        title="Desconocido"
                        className={`h-8 w-8 rounded-md border text-xs font-bold shrink-0 transition-colors ${form[fieldKey] === null ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-secondary'}`}
                      >?</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label>Imágenes (IMG pieces)</Label>
            <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mt-1" disabled={uploading} />
            {uploading && <p className="text-xs text-muted-foreground mt-1">Subiendo...</p>}
            {form.images?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group/img">
                    <img src={src} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Notas adicionales..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Guardando...' : part ? 'Actualizar' : 'Crear Pieza'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}