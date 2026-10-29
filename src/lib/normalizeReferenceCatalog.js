// Normaliza un catálogo de referencia desde dos formatos posibles:
//  - Formato exportación nuevo: { pieces: [...], combos: [...] } (con arrays `images`)
//  - Formato interno antiguo:    { parts: [...con stock_combos] }
// Devuelve siempre: { version, lastUpdated, parts: [...], combos: [...] }
// donde cada pieza/combo lleva su array `images` ("IMG pieces" / "IMG combo").

const SPIN_MAP = { Right: 'Derecha', Left: 'Izquierda', Both: 'Ambos' };

const PIECE_TYPE_TO_CATEGORY = {
  'Blade': 'Blade',
  'Ratchet': 'Ratchet',
  'Bit': 'Bit',
  'Integrated Bit': 'Bit',
  'Bladeratchet': 'BladeRatchet',
  'Lock Chip': 'Lock Chip',
  'Main Blade': 'Main Blade',
  'Assist Blade': 'Assist Blade',
  'Overblade': 'OverBlade',
  'Metal Blade': 'Metal Blade',
};

const CATEGORY_TO_COMBO_FIELD = {
  'Blade': 'blade',
  'Ratchet': 'ratchet',
  'Bit': 'bit',
  'Lock Chip': 'lock_chip',
  'Main Blade': 'main_blade',
  'Assist Blade': 'assist_blade',
  'OverBlade': 'over_blade',
  'Metal Blade': 'metal_blade',
  'BladeRatchet': 'blade',
};

function normalizeSystem(s) {
  return (s || '').toUpperCase();
}

function deriveType(attack, defense, stamina) {
  const a = attack || 0, d = defense || 0, s = stamina || 0;
  if (!a && !d && !s) return '';
  if (a === d && d === s) return 'Equilibrio';
  const max = Math.max(a, d, s);
  if (max === a && a > d && a > s) return 'Ataque';
  if (max === d && d > a && d > s) return 'Defensa';
  if (max === s && s > a && s > d) return 'Resistencia';
  return 'Equilibrio';
}

function mapStats(src) {
  return {
    attack_stat: src.attack ?? 0,
    defense_stat: src.defense ?? 0,
    stamina_stat: src.stamina ?? 0,
    height_stat: src.height ?? 0,
    dash_stat: src.dash ?? 0,
    burst_stat: src.burst ?? 0,
  };
}

function normalizePiece(p) {
  const category = PIECE_TYPE_TO_CATEGORY[p.piece_type] || p.piece_type;
  const stats = mapStats(p);
  return {
    id: p.id,
    name: p.name,
    sistema: normalizeSystem(p.system),
    category,
    type: deriveType(stats.attack_stat, stats.defense_stat, stats.stamina_stat),
    spin_direction: SPIN_MAP[p.spin_direction] || p.spin_direction || '',
    weight: p.weight ?? 0,
    is_integrated_bit: p.piece_type === 'Integrated Bit',
    ...stats,
    variants: Array.isArray(p.variants) ? p.variants : [],
    images: Array.isArray(p.images) ? p.images : [],
    stock_combos: [],
  };
}

function deriveComboSpin(parts, pieceById) {
  for (const part of parts) {
    const piece = pieceById[part.piece_id];
    const raw = piece && piece.spin_direction;
    if (raw && raw !== 'Both' && raw !== 'Ambos') {
      return SPIN_MAP[raw] || raw;
    }
  }
  return 'Ambos';
}

function normalizeCombo(c, pieceById) {
  const stats = c.stats || {};
  const components = {};
  (c.parts || []).forEach(part => {
    const cat = PIECE_TYPE_TO_CATEGORY[part.piece_type] || part.piece_type;
    const field = CATEGORY_TO_COMBO_FIELD[cat];
    if (field && !components[field]) components[field] = part.piece_name;
  });
  const comboStats = mapStats(stats);
  return {
    id: c.id,
    combo: c.name,
    sistema: normalizeSystem(c.system),
    type: deriveType(comboStats.attack_stat, comboStats.defense_stat, comboStats.stamina_stat),
    spin_direction: deriveComboSpin(c.parts || [], pieceById),
    total_weight: stats.weight ?? 0,
    ...comboStats,
    ...components,
    images: Array.isArray(c.images) ? c.images : [],
    notes: c.notes || '',
  };
}

function normalizeNewFormat(data) {
  const pieceById = {};
  (data.pieces || []).forEach(p => { pieceById[p.id] = p; });
  const parts = (data.pieces || []).map(normalizePiece);
  const combos = (data.combos || []).map(c => normalizeCombo(c, pieceById));
  return {
    version: data.version || '3.0',
    lastUpdated:
      data.lastUpdated ||
      (data.exported_at ? data.exported_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    parts,
    combos,
  };
}

function normalizeOldFormat(data) {
  const parts = (data.parts || []).map(p => ({
    ...p,
    images: Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []),
  }));
  const seen = new Set();
  const combos = [];
  parts.forEach(part => {
    (part.stock_combos || []).forEach(sc => {
      const key = sc.combo || sc.product_code;
      if (key && !seen.has(key)) {
        seen.add(key);
        combos.push({
          ...sc,
          sistema: part.sistema,
          images: Array.isArray(sc.images) ? sc.images : [],
        });
      }
    });
  });
  return {
    version: data.version || '2.0',
    lastUpdated: data.lastUpdated || '',
    parts,
    combos: Array.isArray(data.combos) && data.combos.length ? data.combos : combos,
  };
}

export function normalizeReferenceCatalog(data) {
  if (!data || typeof data !== 'object') return null;
  if (Array.isArray(data.pieces)) return normalizeNewFormat(data);
  if (Array.isArray(data.parts)) return normalizeOldFormat(data);
  return null;
}