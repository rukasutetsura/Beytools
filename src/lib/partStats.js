export const STAT_LABELS = {
  attack_stat: 'Ataque',
  defense_stat: 'Defensa',
  stamina_stat: 'Resistencia',
  height_stat: 'Altura',
  dash_stat: 'Dash',
  burst_stat: 'Burst',
};

const ACTIVE_SUFFIX = '_active';

/**
 * Returns the list of stat keys applicable to a given part based on its category.
 * - Lock Chip: no stats
 * - Blade/BladeRatchet/OverBlade/Metal Blade/Main Blade/Assist Blade: attack, defense, stamina
 * - Ratchet: attack, defense, stamina, height
 * - Bit: attack, defense, stamina, dash, burst
 * - Bit integrada: attack, defense, stamina, height, dash, burst
 */
export function getStatsForPart(part) {
  const cat = part.category;
  if (cat === 'Lock Chip') return [];
  if (cat === 'Ratchet') return ['attack_stat', 'defense_stat', 'stamina_stat', 'height_stat'];
  if (cat === 'Bit') {
    return part.is_integrated_bit
      ? ['attack_stat', 'defense_stat', 'stamina_stat', 'height_stat', 'dash_stat', 'burst_stat']
      : ['attack_stat', 'defense_stat', 'stamina_stat', 'dash_stat', 'burst_stat'];
  }
  return ['attack_stat', 'defense_stat', 'stamina_stat'];
}

/**
 * Devuelve el valor de una stat para una pieza, usando el set activado si la
 * pieza es una bit integrada y `activated` es true.
 * `key` es la stat base (ej. 'attack_stat').
 */
export function getStatValue(part, key, activated = false) {
  if (!part) return 0;
  const useActive = activated && part.is_integrated_bit;
  const fieldKey = useActive ? `${key}${ACTIVE_SUFFIX}` : key;
  return part[fieldKey] || 0;
}