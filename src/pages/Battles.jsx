import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUsername } from '@/hooks/useUsername';
import CountdownOverlay from '@/components/common/CountdownOverlay';
import PullToRefresh from '@/components/common/PullToRefresh';
import MobileSelect from '@/components/ui/MobileSelect';
import { localDB } from '@/lib/localDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy, TrendingUp, TrendingDown, Percent, RotateCcw, Save, FlaskConical, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FINISHES = [
  { value: 'Xtreme Finish', points: 3 },
  { value: 'Burst Finish', points: 2 },
  { value: 'Over Finish', points: 2 },
  { value: 'Pocket Finish', points: 2 },
  { value: 'Spin Finish', points: 1 },
];

export default function Battles() {
  const { username } = useUsername();
  const [mode, setMode] = useState('battle');
  const [pointLimit, setPointLimit] = useState(5);
  const [players, setPlayers] = useState({ a_name: '', a_combo_id: '', a_launcher_id: '', b_name: '', b_combo_id: '', b_launcher_id: '' });
  const [rounds, setRounds] = useState([]);
  const [roundForm, setRoundForm] = useState({ winner: '', finish_type: '' });
  const [phase, setPhase] = useState('setup');
  const [isEmpate, setIsEmpate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testComboId, setTestComboId] = useState('');
  const [testOpponent, setTestOpponent] = useState('');
  const [testRounds, setTestRounds] = useState([]);
  const [testRoundForm, setTestRoundForm] = useState({ winner: '', finish_type: '' });
  const [testPhase, setTestPhase] = useState('setup');
  const [testIsEmpate, setTestIsEmpate] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (username) setPlayers(p => ({ ...p, a_name: username }));
  }, [username]);

  const { data: combos = [] } = useQuery({ queryKey: ['combos'], queryFn: () => localDB.entities.Combo.list() });
  const { data: launchers = [] } = useQuery({ queryKey: ['launchers'], queryFn: () => localDB.entities.Launcher.list() });
  const { data: battles = [] } = useQuery({ queryKey: ['battles'], queryFn: () => localDB.entities.Battle.list('-created_date') });

  const comboOptions = [{ value: 'none', label: '— Sin combo —' }, ...combos.map(c => ({ value: c.id, label: c.name }))];
  const launcherOptions = [{ value: 'none', label: '— Sin lanzador —' }, ...launchers.map(l => ({ value: l.id, label: l.name }))];
  const finishOptions = [{ value: 'none', label: '— Seleccionar —' }, ...FINISHES.map(f => ({ value: f.value, label: `${f.value} (+${f.points} pts)` }))];
  const winnerOptions = [
    { value: 'none', label: '— Seleccionar —' },
    { value: 'A', label: `A — ${players.a_name || 'Jugador A'}` },
    { value: 'B', label: `B — ${players.b_name || 'Jugador B'}` },
  ];

  const scoreA = rounds.filter(r => r.winner === 'A').reduce((s, r) => s + r.points, 0);
  const scoreB = rounds.filter(r => r.winner === 'B').reduce((s, r) => s + r.points, 0);
  const matchWinner = scoreA >= pointLimit ? 'A' : scoreB >= pointLimit ? 'B' : null;

  const stats = useMemo(() => {
    if (battles.length === 0) return { wins: 0, losses: 0, pct: 0, rivalMostBeaten: 'N/A' };
    const me = username || battles[0]?.player_a_name || '';
    const myBattles = battles.filter(b => b.player_a_name === me || b.player_b_name === me);
    const wins = myBattles.filter(b => (b.winner === 'A' && b.player_a_name === me) || (b.winner === 'B' && b.player_b_name === me)).length;
    const ties = myBattles.filter(b => b.winner === 'EMPATE').length;
    const pct = (myBattles.length - ties) > 0 ? Math.round((wins / (myBattles.length - ties)) * 100) : 0;
    const beaten = {};
    myBattles.forEach(b => {
      if ((b.winner === 'A' && b.player_a_name === me) || (b.winner === 'B' && b.player_b_name === me)) {
        const opp = b.player_a_name === me ? b.player_b_name : b.player_a_name;
        beaten[opp] = (beaten[opp] || 0) + 1;
      }
    });
    const rivalMostBeaten = Object.entries(beaten).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return { wins, losses: myBattles.length - wins - ties, ties, pct, rivalMostBeaten };
  }, [battles, username]);

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['combos'] }),
      queryClient.invalidateQueries({ queryKey: ['launchers'] }),
      queryClient.invalidateQueries({ queryKey: ['battles'] }),
    ]);
  };

  const addRound = () => {
    if (!roundForm.winner || !roundForm.finish_type) { toast.error('Selecciona ganador y finish'); return; }
    const pts = FINISHES.find(f => f.value === roundForm.finish_type)?.points || 0;
    const newRounds = [...rounds, { winner: roundForm.winner, finish_type: roundForm.finish_type, points: pts }];
    setRounds(newRounds);
    setRoundForm({ winner: '', finish_type: '' });

    const newA = newRounds.filter(r => r.winner === 'A').reduce((s, r) => s + r.points, 0);
    const newB = newRounds.filter(r => r.winner === 'B').reduce((s, r) => s + r.points, 0);

    if (newA >= pointLimit || newB >= pointLimit) {
      setPhase('done');
      toast.success(`¡${newA >= pointLimit ? (players.a_name || 'Jugador A') : (players.b_name || 'Jugador B')} gana el combate!`);
    } else {
      toast.success(`Punto guardado — A:${newA} B:${newB}`);
      setPhase('setup');
    }
  };

  const handleSaveMatch = async () => {
    if (!players.a_name || !players.b_name) { toast.error('Ingresa los nombres'); return; }
    if (rounds.length === 0) { toast.error('No hay rounds registrados'); return; }
    const winner = isEmpate ? 'EMPATE' : (scoreA >= pointLimit ? 'A' : 'B');
    const lastRound = rounds[rounds.length - 1];
    setSaving(true);
    const comboA = combos.find(c => c.id === players.a_combo_id);
    const comboB = combos.find(c => c.id === players.b_combo_id);
    const launcherA = launchers.find(l => l.id === players.a_launcher_id);
    const launcherB = launchers.find(l => l.id === players.b_launcher_id);
    const battleData = {
      player_a_name: players.a_name, player_b_name: players.b_name,
      player_a_combo_id: players.a_combo_id, player_b_combo_id: players.b_combo_id,
      player_a_launcher_id: players.a_launcher_id, player_b_launcher_id: players.b_launcher_id,
      player_a_combo_name: comboA?.name || '', player_b_combo_name: comboB?.name || '',
      player_a_launcher_name: launcherA?.name || '', player_b_launcher_name: launcherB?.name || '',
      winner, finish_type: lastRound?.finish_type || 'Spin Finish',
      points: scoreA + scoreB,
    };
    const tempId = `temp-${Date.now()}`;
    queryClient.setQueryData(['battles'], (old = []) => [{ ...battleData, id: tempId, created_date: new Date().toISOString() }, ...old]);
    try {
      const created = await localDB.entities.Battle.create(battleData);
      queryClient.setQueryData(['battles'], (old = []) => old.map(b => b.id === tempId ? { ...battleData, ...created } : b));
      toast.success('Combate guardado');
      setRounds([]);
      setPhase('setup');
      setIsEmpate(false);
    } catch (e) {
      queryClient.setQueryData(['battles'], (old = []) => old.filter(b => b.id !== tempId));
      toast.error('Error al guardar el combate');
    } finally {
      setSaving(false);
    }
  };

  const resetMatch = () => { setRounds([]); setRoundForm({ winner: '', finish_type: '' }); setPhase('setup'); setIsEmpate(false); };
  const update = (key, value) => setPlayers(p => ({ ...p, [key]: value }));
  const declareEmpate = () => { setIsEmpate(true); setPhase('done'); toast.success('Combate declarado empate'); };

  const testScoreA = testRounds.filter(r => r.winner === 'combo').reduce((s, r) => s + r.points, 0);
  const testScoreB = testRounds.filter(r => r.winner === 'opp').reduce((s, r) => s + r.points, 0);
  const testMatchWinner = testScoreA >= pointLimit ? 'combo' : testScoreB >= pointLimit ? 'opp' : null;
  const testWinRate = testRounds.length > 0 ? Math.round((testRounds.filter(r => r.winner === 'combo').length / testRounds.length) * 100) : null;
  const comboName = combos.find(c => c.id === testComboId)?.name || 'Mi Combo';
  const testWinnerOptions = [
    { value: 'none', label: '— Seleccionar —' },
    { value: 'combo', label: `${comboName} (Mi combo)` },
    { value: 'opp', label: testOpponent || 'Oponente' },
  ];

  const addTestRound = () => {
    if (!testRoundForm.winner || !testRoundForm.finish_type) { toast.error('Selecciona ganador y finish'); return; }
    const pts = FINISHES.find(f => f.value === testRoundForm.finish_type)?.points || 0;
    const newRounds = [...testRounds, { winner: testRoundForm.winner, finish_type: testRoundForm.finish_type, points: pts }];
    setTestRounds(newRounds);
    setTestRoundForm({ winner: '', finish_type: '' });
    const newA = newRounds.filter(r => r.winner === 'combo').reduce((s, r) => s + r.points, 0);
    const newB = newRounds.filter(r => r.winner === 'opp').reduce((s, r) => s + r.points, 0);
    if (newA >= pointLimit || newB >= pointLimit) {
      setTestPhase('done');
      toast.success(newA >= pointLimit ? '¡Tu combo gana el test!' : '¡El oponente gana!');
    } else {
      toast.success(`Test — Combo:${newA} Oponente:${newB}`);
      setTestPhase('setup');
    }
  };

  const resetTest = () => { setTestRounds([]); setTestRoundForm({ winner: '', finish_type: '' }); setTestPhase('setup'); setTestIsEmpate(false); };
  const declareTestEmpate = () => { setTestIsEmpate(true); setTestPhase('done'); toast.success('Test declarado empate'); };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-6 max-w-5xl mx-auto">
      {phase === 'countdown' && <CountdownOverlay onDone={() => setPhase('round_input')} />}
      {testPhase === 'countdown' && <CountdownOverlay onDone={() => setTestPhase('round_input')} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Batallas</h1>
          <p className="text-muted-foreground text-sm mt-1">Primero en llegar a {pointLimit} pts gana</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Límite pts</Label>
            <Input
              type="number" min={1} max={99}
              value={pointLimit}
              onChange={e => setPointLimit(Math.max(1, parseInt(e.target.value) || 5))}
              className="w-16 h-8 text-center text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode('battle')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'battle' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Swords className="w-4 h-4" /> Combate Real
        </button>
        <button
          onClick={() => setMode('test')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'test' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FlaskConical className="w-4 h-4" /> Testeo de Combo
        </button>
      </div>

      {/* ===== TEST MODE ===== */}
      {mode === 'test' && (
        <div className="space-y-4 max-w-xl">
          <Card className="border-primary/20">
            <CardHeader className="pb-3"><CardTitle className="text-base font-display flex items-center gap-2"><FlaskConical className="w-4 h-4 text-primary" /> Configuración del Test</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Combo a testear</Label>
                <MobileSelect
                  value={testComboId || 'none'}
                  onChange={v => { setTestComboId(v === 'none' ? '' : v); resetTest(); }}
                  placeholder="Seleccionar combo..."
                  options={comboOptions}
                  triggerClassName="h-11"
                />
              </div>
              <div>
                <Label>Tipo de oponente (descripción libre)</Label>
                <Input value={testOpponent} onChange={e => setTestOpponent(e.target.value)} placeholder="Ej: Combo de ataque rápido, Stamina largo..." className="h-11" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Límite pts</Label>
                <Input type="number" min={1} max={99} value={pointLimit} onChange={e => setPointLimit(Math.max(1, parseInt(e.target.value) || 5))} className="w-16 h-8 text-center text-sm" />
              </div>
            </CardContent>
          </Card>

          {testRounds.length > 0 && (
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-8 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{comboName}</p>
                    <span className={`text-4xl font-display font-bold ${testScoreA >= pointLimit ? 'text-emerald-500' : 'text-blue-500'}`}>{testScoreA}</span>
                  </div>
                  <span className="text-muted-foreground text-lg">vs</span>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{testOpponent || 'Oponente'}</p>
                    <span className={`text-4xl font-display font-bold ${testScoreB >= pointLimit ? 'text-emerald-500' : 'text-red-500'}`}>{testScoreB}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((testScoreA / pointLimit) * 100, 100)}%` }} />
                  </div>
                  <div className="bg-secondary rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((testScoreB / pointLimit) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {testRounds.map((r, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      R{i + 1}: {r.winner === 'combo' ? comboName : (testOpponent || 'Opp')} +{r.points}
                    </Badge>
                  ))}
                </div>
                {testWinRate !== null && (
                  <p className="text-center text-xs text-muted-foreground mt-2">Win Rate del combo: <span className="font-bold text-primary">{testWinRate}%</span></p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20">
            <CardContent className="pt-5 space-y-3">
              {testPhase === 'setup' && !testMatchWinner && (
                <Button onClick={() => setTestPhase('countdown')} className="w-full" size="lg" disabled={!testComboId}>
                  <Swords className="w-4 h-4 mr-2" />
                  {testRounds.length === 0 ? 'Iniciar Test' : `Iniciar Round ${testRounds.length + 1}`}
                </Button>
              )}
              {testPhase === 'round_input' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-center">Round {testRounds.length + 1} — meta: {pointLimit} pts</p>
                  <MobileSelect
                    value={testRoundForm.winner || 'none'}
                    onChange={v => setTestRoundForm(f => ({ ...f, winner: v === 'none' ? '' : v }))}
                    placeholder="¿Quién ganó este round?"
                    options={testWinnerOptions}
                    triggerClassName="h-11"
                  />
                  <MobileSelect
                    value={testRoundForm.finish_type || 'none'}
                    onChange={v => setTestRoundForm(f => ({ ...f, finish_type: v === 'none' ? '' : v }))}
                    placeholder="Tipo de finish"
                    options={finishOptions}
                    triggerClassName="h-11"
                  />
                  <div className="flex gap-2">
                    <Button onClick={addTestRound} className="flex-1 h-11 text-base">
                      <Save className="w-4 h-4 mr-2" /> Registrar Round
                    </Button>
                    <Button variant="outline" onClick={declareTestEmpate} className="h-11">
                      Empate
                    </Button>
                  </div>
                </div>
              )}
              {(testPhase === 'done' || testMatchWinner) && (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground mb-1">Resultado del Test</p>
                    {testIsEmpate ? (
                      <p className="text-xl font-display font-bold text-amber-500">Empate</p>
                    ) : (
                      <p className="text-xl font-display font-bold text-emerald-500">
                        {testScoreA >= pointLimit ? `✓ ${comboName} GANA` : `✗ ${comboName} PIERDE`}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{testScoreA} — {testScoreB}</p>
                    {testWinRate !== null && (
                      <p className="text-sm font-semibold text-primary mt-1">Win Rate: {testWinRate}%</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center bg-secondary/50 rounded-lg p-2">
                    Este combate de testeo <strong>no se guarda</strong> en el historial.
                  </p>
                  <Button variant="outline" onClick={resetTest} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" /> Nuevo Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== BATTLE MODE ===== */}
      {mode === 'battle' && (
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-500/20">
              <CardHeader className="pb-3"><CardTitle className="text-base font-display text-blue-500">Jugador A</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Nombre *</Label><Input value={players.a_name} onChange={e => update('a_name', e.target.value)} placeholder="Jugador A" /></div>
                <div>
                  <Label>Combo</Label>
                  <MobileSelect value={players.a_combo_id || 'none'} onChange={v => update('a_combo_id', v === 'none' ? '' : v)} placeholder="Seleccionar" options={comboOptions} />
                </div>
                <div>
                  <Label>Lanzador</Label>
                  <MobileSelect value={players.a_launcher_id || 'none'} onChange={v => update('a_launcher_id', v === 'none' ? '' : v)} placeholder="Seleccionar" options={launcherOptions} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20">
              <CardHeader className="pb-3"><CardTitle className="text-base font-display text-red-500">Jugador B</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Nombre *</Label><Input value={players.b_name} onChange={e => update('b_name', e.target.value)} placeholder="Jugador B" /></div>
                <div>
                  <Label>Combo</Label>
                  <MobileSelect value={players.b_combo_id || 'none'} onChange={v => update('b_combo_id', v === 'none' ? '' : v)} placeholder="Seleccionar" options={comboOptions} />
                </div>
                <div>
                  <Label>Lanzador</Label>
                  <MobileSelect value={players.b_launcher_id || 'none'} onChange={v => update('b_launcher_id', v === 'none' ? '' : v)} placeholder="Seleccionar" options={launcherOptions} />
                </div>
              </CardContent>
            </Card>
          </div>

          {rounds.length > 0 && (
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-center gap-8 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{players.a_name || 'Jugador A'}</p>
                    <span className={`text-4xl font-display font-bold ${scoreA >= pointLimit ? 'text-emerald-500' : 'text-blue-500'}`}>{scoreA}</span>
                  </div>
                  <span className="text-muted-foreground text-lg">vs</span>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{players.b_name || 'Jugador B'}</p>
                    <span className={`text-4xl font-display font-bold ${scoreB >= pointLimit ? 'text-emerald-500' : 'text-red-500'}`}>{scoreB}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((scoreA / pointLimit) * 100, 100)}%` }} />
                  </div>
                  <div className="bg-secondary rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((scoreB / pointLimit) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rounds.map((r, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      R{i + 1}: {r.winner === 'A' ? (players.a_name || 'A') : (players.b_name || 'B')} +{r.points} ({r.finish_type.split(' ')[0]})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20">
            <CardContent className="pt-5 space-y-3">
              {phase === 'setup' && !matchWinner && (
                <Button onClick={() => setPhase('countdown')} className="w-full" size="lg">
                  <Swords className="w-4 h-4 mr-2" />
                  {rounds.length === 0 ? 'Iniciar Combate' : `Iniciar Round ${rounds.length + 1}`}
                </Button>
              )}

              {phase === 'round_input' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-center">Round {rounds.length + 1} — meta: {pointLimit} pts</p>
                  <div className="space-y-3">
                    <div>
                      <Label>Ganador</Label>
                      <MobileSelect
                        value={roundForm.winner || 'none'}
                        onChange={v => setRoundForm(f => ({ ...f, winner: v === 'none' ? '' : v }))}
                        placeholder="Seleccionar ganador"
                        options={winnerOptions}
                        triggerClassName="h-11"
                      />
                    </div>
                    <div>
                      <Label>Tipo de Finish</Label>
                      <MobileSelect
                        value={roundForm.finish_type || 'none'}
                        onChange={v => setRoundForm(f => ({ ...f, finish_type: v === 'none' ? '' : v }))}
                        placeholder="Seleccionar finish"
                        options={finishOptions}
                        triggerClassName="h-11"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addRound} className="flex-1 h-11 text-base">
                      <Save className="w-4 h-4 mr-2" /> Guardar Punto
                    </Button>
                    <Button variant="outline" onClick={declareEmpate} className="h-11">
                      Empate
                    </Button>
                  </div>
                </div>
              )}

              {(phase === 'done' || (phase === 'setup' && matchWinner)) && (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    {isEmpate ? (
                      <>
                        <p className="text-xs text-muted-foreground mb-1">Resultado</p>
                        <p className="text-xl font-display font-bold text-amber-500">Empate</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mb-1">¡Ganador del combate!</p>
                        <p className="text-xl font-display font-bold text-emerald-500">
                          {scoreA >= pointLimit ? (players.a_name || 'Jugador A') : (players.b_name || 'Jugador B')}
                        </p>
                      </>
                    )}
                    <p className="text-sm text-muted-foreground">{scoreA} — {scoreB}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveMatch} disabled={saving} className="flex-1">
                      <Save className="w-4 h-4 mr-2" /> Guardar en Historial
                    </Button>
                    <Button variant="outline" onClick={resetMatch}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {[
              { label: 'Victorias', value: stats.wins, icon: TrendingUp, color: 'text-emerald-500' },
              { label: 'Empates', value: stats.ties, icon: Scale, color: 'text-amber-500' },
              { label: 'Derrotas', value: stats.losses, icon: TrendingDown, color: 'text-red-500' },
              { label: '% Victorias', value: `${stats.pct}%`, icon: Percent, color: 'text-primary' },
              { label: 'Rival más derrotado', value: stats.rivalMostBeaten, icon: Trophy, color: 'text-amber-500' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold truncate">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-display">Historial</CardTitle></CardHeader>
            <CardContent>
              {battles.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sin batallas registradas</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {battles.slice(0, 20).map(b => (
                    <div key={b.id} className="p-2.5 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{b.player_a_name} vs {b.player_b_name}</span>
                        <Badge variant="outline" className="text-[10px]">{b.finish_type}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{b.winner === 'EMPATE' ? 'Empate' : `Ganador: ${b.winner === 'A' ? b.player_a_name : b.player_b_name}`}</span>
                        <span className="text-[10px] text-muted-foreground">{b.created_date ? format(new Date(b.created_date), "d MMM", { locale: es }) : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
    </PullToRefresh>
  );
}