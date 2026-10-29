import { Badge } from '@/components/ui/badge';

const FINISHES = [
  { value: 'Xtreme Finish', points: 3 },
  { value: 'Burst Finish', points: 2 },
  { value: 'Over Finish', points: 2 },
  { value: 'Pocket Finish', points: 2 },
  { value: 'Spin Finish', points: 1 },
];

export function computeBreakdown(name, tournament) {
  const finishCounts = {};
  let finishPoints = 0;
  let wins = 0, ties = 0, losses = 0;
  for (const m of tournament.matches || []) {
    if (m.player_b === 'BYE') continue;
    if (m.player_a !== name && m.player_b !== name) continue;
    if (!m.completed) continue;
    for (const r of m.rounds || []) {
      if (r.winner === name) {
        finishCounts[r.finish_type] = (finishCounts[r.finish_type] || 0) + 1;
        finishPoints += r.points || 0;
      }
    }
    if (m.winner === name) wins++;
    else if (m.winner === 'EMPATE') ties++;
    else losses++;
  }
  const matchBonus = wins * 1 + losses * -1;
  return { finishCounts, finishPoints, wins, ties, losses, matchBonus, total: finishPoints + matchBonus };
}

export default function ScoreBreakdown({ name, tournament }) {
  const b = computeBreakdown(name, tournament);
  const items = [];
  for (const [ft, count] of Object.entries(b.finishCounts)) {
    const pts = FINISHES.find(f => f.value === ft)?.points || 0;
    items.push({ label: `${ft} ×${count}`, value: pts * count, color: 'text-blue-500' });
  }
  if (b.wins > 0) items.push({ label: `Victoria ×${b.wins}`, value: b.wins, color: 'text-emerald-500' });
  if (b.ties > 0) items.push({ label: `Empate ×${b.ties}`, value: 0, color: 'text-muted-foreground' });
  if (b.losses > 0) items.push({ label: `Derrota ×${b.losses}`, value: -b.losses, color: 'text-red-500' });

  if (items.length === 0) return null;

  return (
    <div className="mt-1.5 ml-8 flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <Badge key={i} variant="outline" className={`text-[10px] font-normal ${it.color}`}>
          {it.label} {it.value > 0 ? `+${it.value}` : it.value}
        </Badge>
      ))}
    </div>
  );
}