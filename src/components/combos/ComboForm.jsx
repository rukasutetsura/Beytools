import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MobileSelect from '@/components/ui/MobileSelect';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Save, RotateCcw, Zap } from 'lucide-react';
import StatBar from '@/components/combos/StatBar';
import { getStatValue } from '@/lib/partStats';
import { toast } from 'sonner';

const SISTEMAS = ['BX', 'BX INFINITY', 'UX', 'UX INFINITY', 'CX', 'CX INFINITY'];

const SLOTS_BY_SISTEMAS = {
  'BX': [{ key: 'blade_id', label: 'Blade', category: 'Blade' }, { key: 'ratchet_id', label: 'Ratchet', category: 'Ratchet' }, { key: 'bit_id', label: 'Bit', category: 'Bit' }],
  'BX INFINITY': [{ key: 'blade_id', label: 'Blade', category: 'Blade' }, { key: 'ratchet_id', label: 'Ratchet', category: 'Ratchet' }, { key: 'bit_id', label: 'Bit', category: 'Bit' }],
  'UX': [{ key: 'blade_id', label: 'Blade', category: 'Blade' }, { key: 'ratchet_id', label: 'Ratchet', category: 'Ratchet' }, { key: 'bit_id', label: 'Bit', category: 'Bit' }],
  'UX INFINITY': [{ key: 'blade_id', label: 'BladeRatchet', category: 'BladeRatchet' }, { key: 'bit_id', label: 'Bit', category: 'Bit' }],
  'CX': [{ key: 'lock_chip_id', label: 'Lock Chip', category: 'Lock Chip' }, { key: 'main_blade_id', label: 'Main Blade', category: 'Main Blade' }, { key: 'assist_blade_id', label: 'Assist Blade', category: 'Assist Blade' }, { key: 'ratchet_id', label: 'Ratchet', category: 'Ratchet' }, { key: 'bit_id', label: 'Bit', category: 'Bit' }],
  'CX INFINITY': [{ key: 'lock_chip_id', label: 'Lock Chip', category: 'Lock Chip' }, { key: 'over_blade_id', label: 'OverBlade', category: 'OverBlade' }, { key: 'metal_blade_id', label: 'Metal Blade', category: 'Metal Blade' }, { key: 'assist_blade_id', label: 'Assist Blade', category: 'Assist Blade' }, { key: 'ratchet_id', label: 'Ratchet', category: 'Ratchet' }, { key: 'bit_id', label: 'Bit', category: 'Bit' }],
};

export default function ComboForm({ open, onOpenChange, editCombo, parts }) {
  const [sistema, setSistema] = useState('BX');
  const [name, setName] = useState('');
  const [selections, setSelections] = useState({});
  const [bitActivated, setBitActivated] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const isEdit = Boolean(editCombo);

  useEffect(() => {
    if (open) {
      if (editCombo) {
        setSistema(editCombo.sistema || 'BX');
        setName(editCombo.name || '');
        const s = {};
        SLOTS_BY_SISTEMAS[editCombo.sistema || 'BX'].forEach(slot => {
          if (editCombo[slot.key]) s[slot.key] = editCombo[slot.key];
        });
        setSelections(s);
        setBitActivated(Boolean(editCombo.bit_activated));
      } else {
        setSistema('BX'); setName(''); setSelections({}); setBitActivated(false);
      }
    }
  }, [open, editCombo]);

  const slots = SLOTS_BY_SISTEMAS[sistema] || SLOTS_BY_SISTEMAS['BX'];

  const selectedBit = parts.find(p => p.id === selections.bit_id);
  const isIntegratedBit = selectedBit?.is_integrated_bit;

  const activeSlots = useMemo(() => {
    if (isIntegratedBit) return slots.filter(s => s.key !== 'ratchet_id');
    return slots;
  }, [slots, isIntegratedBit]);

  const getPartsForSlot = (slot) => {
    const sistemaCategories = ['Ratchet', 'Bit'];
    if (sistemaCategories.includes(slot.category)) {
      return parts.filter(p => p.category === slot.category);
    }
    return parts.filter(p => p.category === slot.category && p.sistema === sistema);
  };

  const selectedParts = Object.values(selections).map(id => parts.find(p => p.id === id)).filter(Boolean);

  const stats = useMemo(() => {
    if (selectedParts.length === 0) return { attack: 0, defense: 0, stamina: 0, height: 0, dash: 0, burst: 0 };
    const sum = (key) => selectedParts.reduce((acc, p) => {
      const activated = p.id === selections.bit_id && bitActivated;
      return acc + getStatValue(p, key, activated);
    }, 0);
    return {
      attack: sum('attack_stat'), defense: sum('defense_stat'), stamina: sum('stamina_stat'),
      height: sum('height_stat'), dash: sum('dash_stat'), burst: sum('burst_stat'),
    };
  }, [selectedParts, selections.bit_id, bitActivated]);

  const statMax = useMemo(() => {
    const isCXInfinity = sistema === 'CX INFINITY';
    const isCX = sistema === 'CX';
    const combatMax = isCXInfinity ? 240 : isCX ? 270 : 230;
    return { combat: combatMax, tech: 100 };
  }, [sistema]);

  const totalWeight = selectedParts.reduce((acc, p) => acc + (p.weight || 0), 0);

  const dominantType = useMemo(() => {
    const types = selectedParts.map(p => p.type).filter(Boolean);
    if (types.length === 0) return 'N/A';
    const counts = {};
    types.forEach(t => counts[t] = (counts[t] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [selectedParts]);

  const spinDirection = selectedParts.find(p => p.spin_direction)?.spin_direction || 'N/A';

  const warnings = useMemo(() => {
    const w = [];
    const requiredSlots = activeSlots.filter(s => s.key !== 'ratchet_id' || !isIntegratedBit);
    const missing = requiredSlots.filter(s => !selections[s.key]);
    if (missing.length > 0) w.push(`Faltan piezas: ${missing.map(s => s.label).join(', ')}`);
    if (isIntegratedBit) w.push('Bit integrada detectada: Ratchet anulado');
    return w;
  }, [activeSlots, selections, isIntegratedBit]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Ingresa un nombre para el combo'); return; }
    setSaving(true);
    const comboData = {
      name, sistema, ...selections,
      bit_activated: isIntegratedBit ? bitActivated : false,
      total_weight: totalWeight, dominant_type: dominantType, spin_direction: spinDirection,
      attack_stat: stats.attack, defense_stat: stats.defense, stamina_stat: stats.stamina,
      height_stat: stats.height, dash_stat: stats.dash, burst_stat: stats.burst,
    };
    try {
      if (isEdit) {
        await localDB.entities.Combo.update(editCombo.id, comboData);
        queryClient.setQueryData(['combos'], (old = []) => old.map(c => c.id === editCombo.id ? { ...c, ...comboData } : c));
        toast.success('Combo actualizado');
      } else {
        const tempId = `temp-${Date.now()}`;
        queryClient.setQueryData(['combos'], (old = []) => [{ ...comboData, id: tempId, created_date: new Date().toISOString() }, ...old]);
        const created = await localDB.entities.Combo.create(comboData);
        queryClient.setQueryData(['combos'], (old = []) => old.map(c => c.id === tempId ? { ...comboData, ...created } : c));
        toast.success('Combo guardado');
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(isEdit ? 'Error al actualizar' : 'Error al guardar el combo');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => { setSelections({}); setName(''); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? 'Editar Combo' : 'Crear Combo'}</DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nombre del Combo</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Mi combo..." />
                  </div>
                  <div>
                    <Label>Sistema</Label>
                    <MobileSelect
                      value={sistema}
                      onChange={v => { setSistema(v); setSelections({}); }}
                      options={SISTEMAS.map(s => ({ value: s, label: s }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {activeSlots.map(slot => {
                    const available = getPartsForSlot(slot);
                    const slotOptions = [
                      { value: 'none', label: '— Sin selección —' },
                      ...available.map(p => ({ value: p.id, label: p.weight ? `${p.name} (${p.weight}g)` : p.name })),
                    ];
                    return (
                      <div key={slot.key}>
                        <Label className="text-xs">{slot.label}</Label>
                        <MobileSelect
                          value={selections[slot.key] || 'none'}
                          onChange={v => setSelections(s => ({ ...s, [slot.key]: v === 'none' ? undefined : v }))}
                          placeholder={`Seleccionar ${slot.label}`}
                          options={slotOptions}
                        />
                      </div>
                    );
                  })}
                </div>

                {isIntegratedBit && (
                  <div className="flex items-center justify-between gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Gimmick de la Bit</p>
                        <p className="text-xs text-muted-foreground">Cambia las stats del combo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 p-0.5 bg-secondary/60 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setBitActivated(false)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${!bitActivated ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >Desactivada</button>
                      <button
                        type="button"
                        onClick={() => setBitActivated(true)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${bitActivated ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >Activada</button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {warnings.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-1.5">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedParts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {selectedParts.map(p => (
                      <div key={p.id} className="bg-secondary/50 rounded-lg p-2 flex items-center gap-2">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{p.name[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <StatBar label="Ataque" value={stats.attack} max={statMax.combat} />
                  <StatBar label="Defensa" value={stats.defense} max={statMax.combat} />
                  <StatBar label="Resistencia" value={stats.stamina} max={statMax.combat} />
                  <StatBar label="Altura" value={stats.height} max={statMax.tech} />
                  <StatBar label="Dash" value={stats.dash} max={statMax.tech} />
                  <StatBar label="Burst" value={stats.burst} max={statMax.tech} />
                </div>
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Peso Total</span>
                    <span className="font-medium">{totalWeight}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo</span>
                    <Badge variant="outline" className="text-xs">{dominantType}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giro</span>
                    <span className="text-xs font-medium">{spinDirection}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}