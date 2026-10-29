import { useState } from 'react';
import CountdownOverlay from '@/components/common/CountdownOverlay';
import { localDB } from '@/lib/localDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Check, Swords, Save, Play } from 'lucide-react';
import { toast } from 'sonner';
import ScoreBreakdown, { computeBreakdown } from '@/components/tournaments/ScoreBreakdown';

const FINISHES = [
  { value: 'Xtreme Finish', points: 3 },
  { value: 'Burst Finish', points: 2 },
  { value: 'Over Finish', points: 2 },
  { value: 'Pocket Finish', points: 2 },
  { value: 'Spin Finish', points: 1 },
];

// phase per match: 'idle' | 'countdown' | 'input'
function calcScore(match) {
  const rounds = match.rounds || [];
  let a = 0, b = 0;
  rounds.forEach(r => {
    if (r.winner === match.player_a) a += r.points || 0;
    else if (r.winner === match.player_b) b += r.points || 0;
  });
  return { score_a: a, score_b: b };
}

export default function TournamentBracket({ tournament, onBack, onUpdate, onStart }) {
  const pointLimit = tournament.point_limit || 5;
  // matchPhase[idx] = 'idle' | 'countdown' | 'input'
  const [matchPhase, setMatchPhase] = useState({});
  const [roundInput, setRoundInput] = useState({});
  const [countdownFor, setCountdownFor] = useState(null);

  const startCountdown = (matchIdx) => {
    setCountdownFor(matchIdx);
    setMatchPhase(p => ({ ...p, [matchIdx]: 'countdown' }));
  };

  const handleAddRound = async (matchIdx) => {
    const input = roundInput[matchIdx];
    if (!input?.winner || !input?.finish_type) { toast.error('Selecciona ganador y finish'); return; }

    const matches = [...(tournament.matches || [])];
    const match = { ...matches[matchIdx] };
    const pts = FINISHES.find(f => f.value === input.finish_type)?.points || 0;
    const rounds = [...(match.rounds || []), { winner: input.winner, finish_type: input.finish_type, points: pts }];
    match.rounds = rounds;

    const { score_a, score_b } = calcScore({ ...match });
    match.score_a = score_a;
    match.score_b = score_b;

    let participants = [...(tournament.participants || [])];
    let status = tournament.status;
    let tournamentWinner = tournament.winner || '';

    const matchWinner = score_a >= pointLimit ? match.player_a : score_b >= pointLimit ? match.player_b : null;

    if (matchWinner) {
      match.winner = matchWinner;
      match.completed = true;
      const loserName = match.player_a === matchWinner ? match.player_b : match.player_a;
      const wi = participants.findIndex(p => p.name === matchWinner);
      const li = participants.findIndex(p => p.name === loserName);
      const winnerOwn = matchWinner === match.player_a ? score_a : score_b;
      const loserOwn = matchWinner === match.player_a ? score_b : score_a;
      if (wi >= 0) participants[wi] = { ...participants[wi], wins: (participants[wi].wins || 0) + 1, points: (participants[wi].points || 0) + winnerOwn + 1 };
      if (li >= 0) participants[li] = { ...participants[li], losses: (participants[li].losses || 0) + 1, points: (participants[li].points || 0) + loserOwn - 1 };
      setMatchPhase(p => { const n = { ...p }; delete n[matchIdx]; return n; });
      setRoundInput(r => { const n = { ...r }; delete n[matchIdx]; return n; });
      toast.success(`¡${matchWinner} gana el combate!`);
    } else {
      match.winner = '';
      match.completed = false;
      setRoundInput(r => ({ ...r, [matchIdx]: {} }));
      setMatchPhase(p => ({ ...p, [matchIdx]: 'idle' }));
      toast.success(`Punto guardado — ${match.player_a}: ${score_a} | ${match.player_b}: ${score_b}`);
    }

    matches[matchIdx] = match;

    // For elimination: generate next round BEFORE checking allDone
    if (tournament.mode === 'Eliminación Directa' && matchWinner) {
      const currentRound = match.round;
      const roundMatches = matches.filter(m => m.round === currentRound);
      const roundComplete = roundMatches.every(m => m.completed);
      const nextRoundExists = matches.some(m => m.round === currentRound + 1);
      if (roundComplete && !nextRoundExists) {
        const winners = roundMatches.map(m => m.winner).filter(Boolean);
        if (winners.length >= 2) {
          for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
              matches.push({ round: currentRound + 1, match_number: Math.floor(i / 2) + 1, player_a: winners[i], player_b: winners[i + 1], winner: '', rounds: [], score_a: 0, score_b: 0, completed: false });
            } else {
              matches.push({ round: currentRound + 1, match_number: Math.floor(i / 2) + 1, player_a: winners[i], player_b: 'BYE', winner: winners[i], rounds: [], score_a: 0, score_b: 0, completed: true });
            }
          }
          toast.success(`¡Ronda ${currentRound + 1} generada con ${Math.ceil(winners.length / 2)} combate(s)!`);
        }
        // 1 winner left = champion, handled by allDone below
      }
    }

    // Now check completion (after potentially adding new matches)
    const realMatches = matches.filter(m => m.player_b !== 'BYE');
    const allDone = realMatches.every(m => m.completed);

    if (allDone) {
      if (tournament.mode === 'Round Robin') {
        const sorted = [...participants].sort((a, b) => (b.points || 0) - (a.points || 0));
        tournamentWinner = sorted[0]?.name || '';
      } else {
        // Last non-BYE completed match winner
        const lastReal = [...matches].filter(m => m.completed && m.player_b !== 'BYE').pop();
        tournamentWinner = lastReal?.winner || '';
      }
      status = 'Finalizado';
      toast.success(`🏆 Torneo finalizado — Ganador: ${tournamentWinner}`);
    }

    await localDB.entities.Tournament.update(tournament.id, { matches, participants, winner: tournamentWinner, status });
    onUpdate();
  };

  const handleDeclareTie = async (matchIdx) => {
    const matches = [...(tournament.matches || [])];
    const match = { ...matches[matchIdx] };
    const { score_a, score_b } = calcScore(match);
    match.winner = 'EMPATE';
    match.completed = true;
    let participants = [...(tournament.participants || [])];
    const ai = participants.findIndex(p => p.name === match.player_a);
    const bi = participants.findIndex(p => p.name === match.player_b);
    if (ai >= 0) participants[ai] = { ...participants[ai], ties: (participants[ai].ties || 0) + 1, points: (participants[ai].points || 0) + score_a };
    if (bi >= 0) participants[bi] = { ...participants[bi], ties: (participants[bi].ties || 0) + 1, points: (participants[bi].points || 0) + score_b };
    setMatchPhase(p => { const n = { ...p }; delete n[matchIdx]; return n; });
    setRoundInput(r => { const n = { ...r }; delete n[matchIdx]; return n; });
    matches[matchIdx] = match;
    let status = tournament.status;
    let tournamentWinner = tournament.winner || '';
    const realMatches = matches.filter(m => m.player_b !== 'BYE');
    const allDone = realMatches.every(m => m.completed);
    if (allDone) {
      const sorted = [...participants].sort((a, b) => (b.points || 0) - (a.points || 0));
      tournamentWinner = sorted[0]?.name || '';
      status = 'Finalizado';
      toast.success(`🏆 Torneo finalizado — Ganador: ${tournamentWinner}`);
    } else {
      toast.success('Combate declarado empate');
    }
    await localDB.entities.Tournament.update(tournament.id, { matches, participants, winner: tournamentWinner, status });
    onUpdate();
  };

  const rounds = {};
  (tournament.matches || []).forEach((m, i) => {
    const r = m.round || 1;
    if (!rounds[r]) rounds[r] = [];
    rounds[r].push({ ...m, idx: i });
  });

  const standings = [...(tournament.participants || [])]
    .map(p => ({ ...p, _total: computeBreakdown(p.name, tournament).total }))
    .sort((a, b) => b._total - a._total);

  return (
    <div className="space-y-6">
      {countdownFor !== null && (
        <CountdownOverlay onDone={() => {
          const idx = countdownFor;
          setCountdownFor(null);
          setMatchPhase(p => ({ ...p, [idx]: 'input' }));
        }} />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Button>
        <div>
          <h2 className="text-xl font-display font-bold">{tournament.name}</h2>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <Badge variant="outline" className="text-[10px]">{tournament.mode}</Badge>
            <Badge variant="outline" className="text-[10px]">Primero en {pointLimit} pts</Badge>
            <Badge className={`text-[10px] ${tournament.status === 'Finalizado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>{tournament.status}</Badge>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {tournament.status === 'Pendiente' && onStart && (
            <Button size="sm" onClick={onStart} className="gap-1.5">
              <Play className="w-3.5 h-3.5" /> Iniciar Torneo
            </Button>
          )}
          {tournament.winner && (
            <div className="flex items-center gap-2 text-amber-500">
              <Crown className="w-5 h-5" />
              <span className="font-display font-bold">{tournament.winner}</span>
            </div>
          )}
        </div>
      </div>

      {/* Standings */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-display">Clasificación</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {standings.map((p, i) => (
              <div key={p.name} className="p-2.5 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>V:{p.wins || 0}</span>
                    <span>E:{p.ties || 0}</span>
                    <span>D:{p.losses || 0}</span>
                    <span className="font-semibold text-foreground">{p._total} pts</span>
                  </div>
                </div>
                {tournament.status === 'Finalizado' && <ScoreBreakdown name={p.name} tournament={tournament} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matches */}
      {Object.entries(rounds).sort((a, b) => Number(a[0]) - Number(b[0])).map(([round, matches]) => (
        <Card key={round}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              {tournament.mode === 'Round Robin' ? 'Combates' : `Ronda ${round}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches.map(match => {
              const { score_a, score_b } = calcScore(match);
              const phase = matchPhase[match.idx] || 'idle';
              const roundsPlayed = (match.rounds || []).length;
              return (
                <div key={match.idx} className={`p-3 rounded-lg border ${match.completed ? 'bg-secondary/30 border-border' : 'bg-card border-primary/20'}`}>
                  {/* Score header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${match.winner === match.player_a ? 'text-emerald-500' : ''}`}>{match.player_a}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xl font-display font-bold ${score_a >= pointLimit ? 'text-emerald-500' : 'text-blue-500'}`}>{score_a}</span>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <span className={`text-xl font-display font-bold ${score_b >= pointLimit ? 'text-emerald-500' : 'text-red-500'}`}>{score_b}</span>
                      </div>
                      <span className={`text-sm font-semibold ${match.winner === match.player_b ? 'text-emerald-500' : ''}`}>{match.player_b}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {roundsPlayed > 0 && <span className="text-[10px] text-muted-foreground">{roundsPlayed} rnd</span>}
                      {match.completed && match.winner === 'EMPATE' && <Badge variant="outline" className="text-[10px]">Empate</Badge>}
                      {match.completed && match.winner !== 'EMPATE' && <Check className="w-4 h-4 text-emerald-500" />}
                    </div>
                  </div>

                  {/* Progress bars */}
                  {!match.completed && roundsPlayed > 0 && (
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div className="bg-secondary rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((score_a / pointLimit) * 100, 100)}%` }} />
                      </div>
                      <div className="bg-secondary rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((score_b / pointLimit) * 100, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Round history badges */}
                  {roundsPlayed > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {match.rounds.map((r, ri) => (
                        <Badge key={ri} variant="outline" className="text-[10px]">
                          R{ri + 1}: {r.winner === match.player_a ? 'A' : 'B'} +{r.points}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {!match.completed && match.player_b !== 'BYE' && tournament.status === 'En Progreso' && (
                    <div className="mt-2">
                      {phase === 'idle' && (
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 h-8" onClick={() => startCountdown(match.idx)}>
                            <Swords className="w-3.5 h-3.5 mr-1.5" />
                            {roundsPlayed === 0 ? 'Iniciar Combate' : `Iniciar Round ${roundsPlayed + 1}`}
                          </Button>
                        </div>
                      )}

                      {phase === 'input' && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium text-center">Round {roundsPlayed + 1} — meta: {pointLimit} pts</p>
                          <div className="space-y-2">
                            <Select value={roundInput[match.idx]?.winner || 'none'} onValueChange={v => setRoundInput(r => ({ ...r, [match.idx]: { ...r[match.idx], winner: v === 'none' ? '' : v } }))}>
                              <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Seleccionar ganador" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— Ganador —</SelectItem>
                                <SelectItem value={match.player_a}>{match.player_a}</SelectItem>
                                <SelectItem value={match.player_b}>{match.player_b}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={roundInput[match.idx]?.finish_type || 'none'} onValueChange={v => setRoundInput(r => ({ ...r, [match.idx]: { ...r[match.idx], finish_type: v === 'none' ? '' : v } }))}>
                              <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Seleccionar finish" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">— Finish —</SelectItem>
                                {FINISHES.map(f => <SelectItem key={f.value} value={f.value}>{f.value} (+{f.points})</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Button className="flex-1 h-10" onClick={() => handleAddRound(match.idx)}>
                                <Save className="w-4 h-4 mr-2" /> Guardar Punto
                              </Button>
                              {tournament.mode === 'Round Robin' && (
                                <Button variant="outline" className="h-10" onClick={() => handleDeclareTie(match.idx)}>
                                  Empate
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}