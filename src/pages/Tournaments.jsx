import { useState } from 'react';
import { useUsername } from '@/hooks/useUsername';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { localDB } from '@/lib/localDB';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trophy, Users, Play, Trash2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import TournamentBracket from '@/components/tournaments/TournamentBracket';

function generateEliminationMatches(participants) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const matches = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      matches.push({ round: 1, match_number: Math.floor(i / 2) + 1, player_a: shuffled[i].name, player_b: shuffled[i + 1].name, winner: '', rounds: [], score_a: 0, score_b: 0, completed: false });
    } else {
      matches.push({ round: 1, match_number: Math.floor(i / 2) + 1, player_a: shuffled[i].name, player_b: 'BYE', winner: shuffled[i].name, rounds: [], score_a: 0, score_b: 0, completed: true });
    }
  }
  return matches;
}

function generateRoundRobinMatches(participants) {
  const matches = [];
  let matchNum = 1;
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({ round: 1, match_number: matchNum++, player_a: participants[i].name, player_b: participants[j].name, winner: '', rounds: [], score_a: 0, score_b: 0, completed: false });
    }
  }
  return matches;
}

export default function Tournaments() {
  const { username } = useUsername();
  const [createOpen, setCreateOpen] = useState(false);
  const [newTournament, setNewTournament] = useState({ name: '', mode: 'Eliminación Directa', point_limit: 5 });
  const [participantName, setParticipantName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const queryClient = useQueryClient();

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => localDB.entities.Tournament.list('-created_date'),
  });

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  const addParticipant = () => {
    if (!participantName.trim()) return;
    setParticipants(p => [...p, { name: participantName.trim(), wins: 0, losses: 0, points: 0 }]);
    setParticipantName('');
  };

  const createTournament = async () => {
    if (!newTournament.name || participants.length < 2) { toast.error('Necesitas al menos 2 participantes'); return; }
    const matches = newTournament.mode === 'Eliminación Directa'
      ? generateEliminationMatches(participants)
      : generateRoundRobinMatches(participants);
    await localDB.entities.Tournament.create({ ...newTournament, participants, matches, status: 'Pendiente' });
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    toast.success('Torneo creado');
    setCreateOpen(false);
    setNewTournament({ name: '', mode: 'Eliminación Directa', point_limit: 5 });
    setParticipants([]);
  };

  const handleStartTournament = async (t) => {
    await localDB.entities.Tournament.update(t.id, { status: 'En Progreso' });
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
  };

  const handleDeleteTournament = async (t) => {
    await localDB.entities.Tournament.delete(t.id);
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    if (selectedTournamentId === t.id) setSelectedTournamentId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Torneos</h1>
          <p className="text-muted-foreground text-sm mt-1">{tournaments.length} torneos</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Torneo
        </Button>
      </div>

      {selectedTournament ? (
        <TournamentBracket
          tournament={selectedTournament}
          onBack={() => setSelectedTournamentId(null)}
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['tournaments'] })}
          onStart={selectedTournament.status === 'Pendiente' ? () => handleStartTournament(selectedTournament) : undefined}
        />
      ) : (
        <div>
          {tournaments.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay torneos</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map(t => (
                <Card key={t.id} className="hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedTournamentId(t.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{t.name}</h3>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{t.mode}</Badge>
                          <Badge variant="outline" className="text-[10px]">{t.point_limit || 5} pts</Badge>
                          <Badge className={`text-[10px] ${t.status === 'Finalizado' ? 'bg-emerald-500/10 text-emerald-500' : t.status === 'En Progreso' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {t.status === 'Pendiente' && (
                          <button onClick={e => { e.stopPropagation(); handleStartTournament(t); }} className="p-1.5 hover:bg-primary/10 rounded-md">
                            <Play className="w-4 h-4 text-primary" />
                          </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); handleDeleteTournament(t); }} className="p-1.5 hover:bg-destructive/10 rounded-md">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{t.participants?.length || 0} participantes</span>
                    </div>
                    {t.winner && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-amber-500">
                        <Crown className="w-3.5 h-3.5" />
                        <span className="font-medium">Ganador: {t.winner}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo Torneo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={newTournament.name} onChange={e => setNewTournament(t => ({ ...t, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Modo</Label>
                <Select value={newTournament.mode} onValueChange={v => setNewTournament(t => ({ ...t, mode: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eliminación Directa">Eliminación Directa</SelectItem>
                    <SelectItem value="Round Robin">Round Robin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Límite de puntos</Label>
                <Input
                  type="number" min={1} max={99}
                  value={newTournament.point_limit}
                  onChange={e => setNewTournament(t => ({ ...t, point_limit: Math.max(1, parseInt(e.target.value) || 5) }))}
                />
              </div>
            </div>
            <div>
              <Label>Participantes ({participants.length})</Label>
              <div className="flex gap-2 mt-1">
                <Input value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="Nombre del participante" onKeyDown={e => e.key === 'Enter' && addParticipant()} />
                <Button variant="outline" onClick={addParticipant}><Plus className="w-4 h-4" /></Button>
              </div>
              {username && !participants.find(p => p.name === username) && (
                <button onClick={() => setParticipants(p => [...p, { name: username, wins: 0, losses: 0, points: 0 }])} className="mt-1.5 text-xs text-primary hover:underline">
                  + Añadirme ({username})
                </button>
              )}
              {participants.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {participants.map((p, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {p.name}
                      <button onClick={() => setParticipants(ps => ps.filter((_, idx) => idx !== i))} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {newTournament.mode === 'Round Robin' && participants.length > 1 && (
              <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                Se generarán <strong>{(participants.length * (participants.length - 1)) / 2}</strong> combates. Gana quien acumule más puntos al final.
              </p>
            )}
            {newTournament.mode === 'Eliminación Directa' && participants.length > 1 && (
              <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                Bracket aleatorio. El perdedor de cada combate queda eliminado.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={createTournament}>Crear Torneo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}