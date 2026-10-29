// Datos de ejemplo: piezas y combos stock oficiales
// Las stats de cada pieza suman exactamente las stats del combo al que pertenecen.

export const SEED_PARTS = [
  // ===== BX: Dran Sword 3-60 F =====
  { name: 'Dran Sword', sistema: 'BX', category: 'Blade', type: 'Ataque', spin_direction: 'Derecha', weight: 33.2, stock_combo: 'Dran Sword 3-60 F', is_official: true, attack_stat: 55, defense_stat: 25, stamina_stat: 20 },
  { name: '3-60', sistema: 'BX', category: 'Ratchet', type: 'Equilibrio', spin_direction: 'Derecha', weight: 5.8, stock_combo: 'Dran Sword 3-60 F', is_official: true, attack_stat: 15, defense_stat: 9, stamina_stat: 6, height_stat: 60 },
  { name: 'Flat (F)', sistema: 'BX', category: 'Bit', type: 'Ataque', spin_direction: 'Derecha', weight: 1.9, stock_combo: 'Dran Sword 3-60 F', is_official: true, attack_stat: 40, defense_stat: 15, stamina_stat: 10, dash_stat: 35, burst_stat: 80 },

  // ===== BX INFINITY: Dran Strike 4-50 FF =====
  { name: 'Dran Strike', sistema: 'BX INFINITY', category: 'Blade', type: 'Ataque', spin_direction: 'Derecha', weight: 41.4, stock_combo: 'Dran Strike 4-50 FF', is_official: true, attack_stat: 58, defense_stat: 25, stamina_stat: 17 },
  { name: '4-50', sistema: 'BX INFINITY', category: 'Ratchet', type: 'Equilibrio', spin_direction: 'Derecha', weight: 5.9, stock_combo: 'Dran Strike 4-50 FF', is_official: true, attack_stat: 12, defense_stat: 13, stamina_stat: 5, height_stat: 50 },
  { name: 'Free Flat (FF)', sistema: 'BX INFINITY', category: 'Bit', type: 'Ataque', spin_direction: 'Derecha', weight: 2.1, stock_combo: 'Dran Strike 4-50 FF', is_official: true, attack_stat: 40, defense_stat: 15, stamina_stat: 15, dash_stat: 35, burst_stat: 80 },

  // ===== UX: Meteor Dragoon 3-60 J =====
  { name: 'Meteor Dragoon', sistema: 'UX', category: 'Blade', type: 'Ataque', spin_direction: 'Izquierda', weight: 37.9, stock_combo: 'Meteor Dragoon 3-60 J', is_official: true, attack_stat: 55, defense_stat: 10, stamina_stat: 35 },
  { name: '3-70', sistema: 'UX', category: 'Ratchet', type: 'Equilibrio', spin_direction: 'Derecha', weight: 6.4, stock_combo: 'Meteor Dragoon 3-60 J', is_official: true, attack_stat: 15, defense_stat: 8, stamina_stat: 7, height_stat: 70 },
  { name: 'Jolt (J)', sistema: 'UX', category: 'Bit', type: 'Ataque', spin_direction: 'Derecha', weight: 2.1, stock_combo: 'Meteor Dragoon 3-60 J', is_official: true, attack_stat: 35, defense_stat: 10, stamina_stat: 15, dash_stat: 34, burst_stat: 80 },

  // ===== UX INFINITY: Bullet Gryffon H =====
  { name: 'Bullet Gryffon', sistema: 'UX INFINITY', category: 'BladeRatchet', type: 'Equilibrio', spin_direction: 'Derecha', weight: 60.6, stock_combo: 'Bullet Gryffon H', is_official: true, attack_stat: 35, defense_stat: 35, stamina_stat: 30 },
  { name: 'Hexa (H)', sistema: 'UX INFINITY', category: 'Bit', type: 'Equilibrio', spin_direction: 'Derecha', weight: 1.9, stock_combo: 'Bullet Gryffon H', is_official: true, attack_stat: 30, defense_stat: 35, stamina_stat: 20, dash_stat: 15, burst_stat: 80 },

  // ===== CX: Dran Brave S 6-60 V =====
  { name: 'Dran', sistema: 'CX', category: 'Lock Chip', type: 'Ataque', spin_direction: 'Derecha', weight: 1.7, stock_combo: 'Dran Brave S 6-60 V', is_official: true },
  { name: 'Brave', sistema: 'CX', category: 'Main Blade', type: 'Ataque', spin_direction: 'Derecha', weight: 31.2, stock_combo: 'Dran Brave S 6-60 V', is_official: true, attack_stat: 60, defense_stat: 20, stamina_stat: 20 },
  { name: 'Slash (S)', sistema: 'CX', category: 'Assist Blade', type: 'Ataque', spin_direction: 'Derecha', weight: 4.7, stock_combo: 'Dran Brave S 6-60 V', is_official: true, attack_stat: 20, defense_stat: 10, stamina_stat: 10 },
  { name: '6-60', sistema: 'CX', category: 'Ratchet', type: 'Equilibrio', spin_direction: 'Derecha', weight: 3.1, stock_combo: 'Dran Brave S 6-60 V', is_official: true, attack_stat: 14, defense_stat: 8, stamina_stat: 8, height_stat: 60 },
  { name: 'Vortex', sistema: 'CX', category: 'Bit', type: 'Ataque', spin_direction: 'Derecha', weight: 2.2, stock_combo: 'Dran Brave S 6-60 V', is_official: true, attack_stat: 45, defense_stat: 10, stamina_stat: 5, dash_stat: 40, burst_stat: 80 },

  // ===== CX INFINITY: Bahamut Blitz BK 1-50 I =====
  { name: 'Bahamut', sistema: 'CX INFINITY', category: 'Lock Chip', type: 'Ataque', spin_direction: 'Derecha', weight: 1.7, stock_combo: 'Bahamut Blitz BK 1-50 I', is_official: true },
  { name: 'Break (B)', sistema: 'CX INFINITY', category: 'OverBlade', type: 'Ataque', spin_direction: 'Derecha', weight: 3.8, stock_combo: 'Bahamut Blitz BK 1-50 I', is_official: true, attack_stat: 10, defense_stat: 5, stamina_stat: 5 },
  { name: 'Blitz', sistema: 'CX INFINITY', category: 'Metal Blade', type: 'Ataque', spin_direction: 'Derecha', weight: 29.6, stock_combo: 'Bahamut Blitz BK 1-50 I', is_official: true, attack_stat: 25, defense_stat: 10, stamina_stat: 5 },
  { name: 'Knuckle (K)', sistema: 'CX INFINITY', category: 'Assist Blade', type: 'Ataque', spin_direction: 'Derecha', weight: 4.9, stock_combo: 'Bahamut Blitz BK 1-50 I', is_official: true, attack_stat: 30, defense_stat: 5, stamina_stat: 5 },
  { name: '1-50', sistema: 'CX INFINITY', category: 'Ratchet', type: 'Equilibrio', spin_direction: 'Derecha', weight: 5.7, stock_combo: 'Bahamut Blitz BK 1-50 I', is_official: true, attack_stat: 18, defense_stat: 9, stamina_stat: 3, height_stat: 50 },
  { name: 'Ignition', sistema: 'CX INFINITY', category: 'Bit', type: 'Ataque', spin_direction: 'Derecha', weight: 2.4, stock_combo: 'Bahamut Blitz BK 1-50 I', is_official: true, attack_stat: 50, defense_stat: 15, stamina_stat: 5, dash_stat: 30, burst_stat: 80 },
];

export const SEED_COMBOS = [
  { name: 'Dran Sword 3-60 F', sistema: 'BX', type: 'Ataque', spin_direction: 'Derecha', total_weight: 40.9, dominant_type: 'Ataque', stock_combo: 'Dran Sword 3-60 F', is_official: true, attack_stat: 110, defense_stat: 49, stamina_stat: 41, height_stat: 60, dash_stat: 35, burst_stat: 80 },
  { name: 'Dran Strike 4-50 FF', sistema: 'BX INFINITY', type: 'Ataque', spin_direction: 'Derecha', total_weight: 49.4, dominant_type: 'Ataque', stock_combo: 'Dran Strike 4-50 FF', is_official: true, attack_stat: 110, defense_stat: 53, stamina_stat: 37, height_stat: 50, dash_stat: 35, burst_stat: 80 },
  { name: 'Meteor Dragoon 3-60 J', sistema: 'UX', type: 'Ataque', spin_direction: 'Izquierda', total_weight: 46.4, dominant_type: 'Ataque', stock_combo: 'Meteor Dragoon 3-60 J', is_official: true, attack_stat: 105, defense_stat: 28, stamina_stat: 57, height_stat: 70, dash_stat: 34, burst_stat: 80 },
  { name: 'Bullet Gryffon H', sistema: 'UX INFINITY', type: 'Equilibrio', spin_direction: 'Derecha', total_weight: 62.5, dominant_type: 'Equilibrio', stock_combo: 'Bullet Gryffon H', is_official: true, attack_stat: 65, defense_stat: 70, stamina_stat: 50, dash_stat: 15, burst_stat: 80 },
  { name: 'Dran Brave S 6-60 V', sistema: 'CX', type: 'Ataque', spin_direction: 'Derecha', total_weight: 42.9, dominant_type: 'Ataque', stock_combo: 'Dran Brave S 6-60 V', is_official: true, attack_stat: 126, defense_stat: 48, stamina_stat: 43, height_stat: 60, dash_stat: 40, burst_stat: 80 },
  { name: 'Bahamut Blitz BK 1-50 I', sistema: 'CX INFINITY', type: 'Ataque', spin_direction: 'Derecha', total_weight: 48.1, dominant_type: 'Ataque', stock_combo: 'Bahamut Blitz BK 1-50 I', is_official: true, attack_stat: 133, defense_stat: 69, stamina_stat: 23, height_stat: 50, dash_stat: 30, burst_stat: 80 },
];