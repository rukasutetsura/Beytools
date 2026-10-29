import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { useUsername } from '@/hooks/useUsername';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Trophy, Swords, TrendingUp, Star, Pencil, Check, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { base44 as base44Client } from '@/api/base44Client';

const PROFILE_KEY = 'beytools-profile';

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; }
}

export default function Profile() {
  const { username, saveUsername, photo, savePhoto } = useUsername();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [profile, setProfile] = useState(loadProfile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState({});

  const { data: combos = [] } = useQuery({ queryKey: ['combos'], queryFn: () => localDB.entities.Combo.list() });
  const { data: launchers = [] } = useQuery({ queryKey: ['launchers'], queryFn: () => localDB.entities.Launcher.list() });
  const { data: battles = [] } = useQuery({ queryKey: ['battles'], queryFn: () => localDB.entities.Battle.list() });

  const stats = useMemo(() => {
    if (!username || battles.length === 0) return { wins: 0, losses: 0, pct: 0, total: 0 };
    const my = battles.filter(b => b.player_a_name === username || b.player_b_name === username);
    const wins = my.filter(b => (b.winner === 'A' && b.player_a_name === username) || (b.winner === 'B' && b.player_b_name === username)).length;
    const total = my.length;
    return { wins, losses: total - wins, pct: total > 0 ? Math.round((wins / total) * 100) : 0, total };
  }, [battles, username]);

  const saveName = () => {
    saveUsername(nameDraft);
    setEditingName(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44Client.integrations.Core.UploadFile({ file });
      savePhoto(file_url);
      toast.success('Foto actualizada');
    } catch {
      toast.error('Error al subir la foto');
    }
  };

  const startEditProfile = () => {
    setDraft({ ...profile });
    setEditingProfile(true);
  };

  const saveProfile = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setProfile(draft);
    setEditingProfile(false);
    toast.success('Perfil guardado');
  };

  const favCombos = [1, 2, 3].map(n => combos.find(c => c.id === profile[`fav_combo_${n}`]));
  const favLaunchers = [1, 2].map(n => launchers.find(l => l.id === profile[`fav_launcher_${n}`]));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu identidad en BeyTools</p>
      </div>

      {/* Name card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img src={photo} alt={username || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photo && (
                <button
                  onClick={() => savePhoto('')}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/80 transition-colors"
                  title="Quitar foto"
                >×</button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex gap-2 items-center">
                  <Input
                    autoFocus
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                    placeholder="Tu nombre..."
                    className="h-10"
                  />
                  <Button size="sm" onClick={saveName}><Check className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold truncate">
                    {username || <span className="text-muted-foreground italic text-base">Sin nombre</span>}
                  </h2>
                  <button onClick={() => { setNameDraft(username); setEditingName(true); }} className="p-1 hover:bg-secondary rounded-md">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Jugador local · BeyTools</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Combates', value: stats.total, icon: Swords, color: 'text-primary' },
          { label: 'Victorias', value: stats.wins, icon: Trophy, color: 'text-emerald-500' },
          { label: 'Derrotas', value: stats.losses, icon: TrendingUp, color: 'text-red-500' },
          { label: 'Win Rate', value: `${stats.pct}%`, icon: Star, color: 'text-amber-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
              <p className="text-xl font-display font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Favorites */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Favoritos
            </CardTitle>
            {!editingProfile ? (
              <Button size="sm" variant="outline" onClick={startEditProfile}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar</Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)}>Cancelar</Button>
                <Button size="sm" onClick={saveProfile}><Check className="w-3.5 h-3.5 mr-1.5" /> Guardar</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingProfile ? (
            <>
              {[1, 2, 3].map(n => (
                <div key={n}>
                  <Label>Combo favorito #{n}</Label>
                  <Select value={draft[`fav_combo_${n}`] || 'none'} onValueChange={v => setDraft(d => ({ ...d, [`fav_combo_${n}`]: v === 'none' ? '' : v }))}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar combo" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">— Ninguno —</SelectItem>{combos.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
              {[1, 2].map(n => (
                <div key={n}>
                  <Label>Lanzador favorito #{n}</Label>
                  <Select value={draft[`fav_launcher_${n}`] || 'none'} onValueChange={v => setDraft(d => ({ ...d, [`fav_launcher_${n}`]: v === 'none' ? '' : v }))}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar lanzador" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">— Ninguno —</SelectItem>{launchers.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-3">
              {favCombos.map((combo, i) => (
                <div key={`combo-${i}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="text-xs text-muted-foreground w-24">Combo #{i + 1}</span>
                  {combo ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium">{combo.name}</span>
                      {combo.sistema && <Badge variant="outline" className="text-[10px]">{combo.sistema}</Badge>}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic flex-1">No configurado</span>
                  )}
                </div>
              ))}
              {favLaunchers.map((launcher, i) => (
                <div key={`launcher-${i}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="text-xs text-muted-foreground w-24">Lanzador #{i + 1}</span>
                  {launcher ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium">{launcher.name}</span>
                      {launcher.type && <Badge variant="outline" className="text-[10px]">{launcher.type}</Badge>}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic flex-1">No configurado</span>
                  )}
                </div>
              ))}
              {!favCombos.some(Boolean) && !favLaunchers.some(Boolean) && (
                <p className="text-xs text-muted-foreground text-center py-2">Toca "Editar" para añadir tus favoritos</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}