import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Zap, Shield, Timer, Scale } from 'lucide-react';

const TYPE_CONFIG = {
  Ataque:     { icon: Zap,    color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    label: 'Ataque',     hint: 'Alto poder de lanzamiento, máxima velocidad inicial.' },
  Defensa:    { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Defensa',    hint: 'Lanzamiento firme y consistente, bajo retroceso.' },
  Resistencia:{ icon: Timer,  color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  label: 'Resistencia',hint: 'Giro estable y prolongado, precisión sobre potencia.' },
  Equilibrio: { icon: Scale,  color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    label: 'Equilibrio', hint: 'Versatilidad general, buen control en cualquier posición.' },
};

// Score a launcher for a given bey type based on lab + battle data
function scoreLauncherForType(launcherId, type, launcherComboStats, launcherBattleStats, combos) {
  let score = 0;

  // Battle win rate contributes heavily
  const battleStat = launcherBattleStats.find(s => s.launcherId === launcherId);
  if (battleStat) score += battleStat.winRate * 0.5;

  // Lab tests: check how this launcher performs with combos of this type
  const relevantTests = launcherComboStats.filter(e => {
    if (e.launcherId !== launcherId) return false;
    const combo = combos.find(c => c.id === e.comboId);
    return combo?.dominant_type === type;
  });

  if (relevantTests.length > 0) {
    const avgSpin = relevantTests.reduce((a, e) => a + e.avgSpinTime, 0) / relevantTests.length;
    // Normalize: 60s = baseline, bonus up to 30 pts for longer spin
    score += Math.min(30, (avgSpin / 60) * 20);
    score += relevantTests.length * 2; // more data = more confidence
  }

  return score;
}

// Generate recommendations per type
function buildRecommendations(launchers, combos, parts, launcherComboStats, launcherBattleStats) {
  return Object.keys(TYPE_CONFIG).map(type => {
    const scored = launchers.map(launcher => ({
      launcher,
      score: scoreLauncherForType(launcher.id, type, launcherComboStats, launcherBattleStats, combos),
    })).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    // Best combos for this type with any data
    const typeCombos = combos.filter(c => c.dominant_type === type);
    const bestCombos = typeCombos
      .map(c => {
        const testEntries = launcherComboStats.filter(e => e.comboId === c.id);
        const avgSpin = testEntries.length > 0
          ? testEntries.reduce((a, e) => a + e.avgSpinTime, 0) / testEntries.length
          : null;
        const weight = c.total_weight ?? null;
        return { combo: c, avgSpin, weight };
      })
      .filter(c => c.avgSpin !== null || c.weight !== null)
      .sort((a, b) => (b.avgSpin ?? 0) - (a.avgSpin ?? 0))
      .slice(0, 3);

    // Weight-based insight
    const weightInsight = buildWeightInsight(type, typeCombos);

    return { type, scored: scored.slice(0, 3), bestCombos, weightInsight };
  });
}

function buildWeightInsight(type, combos) {
  const withWeight = combos.filter(c => c.total_weight > 0);
  if (withWeight.length === 0) return null;
  const avg = withWeight.reduce((a, c) => a + c.total_weight, 0) / withWeight.length;
  const heavy = withWeight.filter(c => c.total_weight > avg);
  const light = withWeight.filter(c => c.total_weight <= avg);
  if (type === 'Ataque')      return `Peso medio de tus combos: ${avg.toFixed(1)}g. Los más ligeros (${light.length}) suelen tener mayor velocidad de entrada.`;
  if (type === 'Defensa')     return `Peso medio: ${avg.toFixed(1)}g. Los más pesados (${heavy.length}) suelen absorber mejor el impacto.`;
  if (type === 'Resistencia') return `Peso medio: ${avg.toFixed(1)}g. El equilibrio de peso es clave para mayor spin time.`;
  if (type === 'Equilibrio')  return `Peso medio: ${avg.toFixed(1)}g. Combos versátiles se benefician de lanzadores con buen control.`;
  return null;
}

export default function LauncherRecommendations({ launchers, combos, parts, launcherComboStats, launcherBattleStats }) {
  const recommendations = useMemo(
    () => buildRecommendations(launchers, combos, parts, launcherComboStats, launcherBattleStats),
    [launchers, combos, parts, launcherComboStats, launcherBattleStats]
  );

  const hasAnyData = launcherComboStats.length > 0 || launcherBattleStats.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" /> Recomendaciones por Tipo de Bey
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyData ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Registra tests de laboratorio o batallas con lanzadores para ver recomendaciones personalizadas.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(({ type, scored, bestCombos, weightInsight }) => {
              const cfg = TYPE_CONFIG[type];
              const Icon = cfg.icon;
              return (
                <div key={type} className={`rounded-xl border p-4 space-y-3 ${cfg.border} ${cfg.bg}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                    <h3 className={`font-display font-bold text-sm ${cfg.color}`}>{cfg.label}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{cfg.hint}</p>

                  {scored.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5">Lanzadores recomendados:</p>
                      <div className="space-y-1.5">
                        {scored.map(({ launcher, score }, idx) => (
                          <div key={launcher.id} className="flex items-center gap-2">
                            <span className={`text-xs font-bold w-4 ${cfg.color}`}>{idx + 1}.</span>
                            <span className="text-sm flex-1 truncate">{launcher.name}</span>
                            <Badge variant="outline" className="text-xs">{launcher.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Sin datos para este tipo aún.</p>
                  )}

                  {bestCombos.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5">Combos destacados:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {bestCombos.map(({ combo, avgSpin, weight }) => (
                          <div key={combo.id} className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {combo.name}
                              {avgSpin ? ` · ${avgSpin.toFixed(0)}s` : ''}
                              {weight ? ` · ${weight}g` : ''}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {weightInsight && (
                    <p className="text-xs text-muted-foreground border-t border-current/10 pt-2">{weightInsight}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}