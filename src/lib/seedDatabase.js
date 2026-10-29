import { localDB } from '@/lib/localDB';
import { SEED_PARTS, SEED_COMBOS } from '@/data/seedData';

const SEED_FLAG = 'beytools-seeded-v1';

// Mapea el nombre del combo a las claves de sus piezas
const COMBO_PART_MAP = {
  'Dran Sword 3-60 F': { blade_id: 'Dran Sword', ratchet_id: '3-60', bit_id: 'Flat (F)' },
  'Dran Strike 4-50 FF': { blade_id: 'Dran Strike', ratchet_id: '4-50', bit_id: 'Free Flat (FF)' },
  'Meteor Dragoon 3-60 J': { blade_id: 'Meteor Dragoon', ratchet_id: '3-70', bit_id: 'Jolt (J)' },
  'Bullet Gryffon H': { blade_id: 'Bullet Gryffon', bit_id: 'Hexa (H)' },
  'Dran Brave S 6-60 V': { lock_chip_id: 'Dran', main_blade_id: 'Brave', assist_blade_id: 'Slash (S)', ratchet_id: '6-60', bit_id: 'Vortex' },
  'Bahamut Blitz BK 1-50 I': { lock_chip_id: 'Bahamut', over_blade_id: 'Break (B)', metal_blade_id: 'Blitz', assist_blade_id: 'Knuckle (K)', ratchet_id: '1-50', bit_id: 'Ignition' },
};

export async function seedDatabase() {
  if (localStorage.getItem(SEED_FLAG)) return;
  const existingParts = await localDB.entities.Part.list();
  if (existingParts.length > 0) {
    localStorage.setItem(SEED_FLAG, '1');
    return;
  }

  const createdParts = await localDB.entities.Part.bulkCreate(SEED_PARTS);
  const partByName = {};
  createdParts.forEach(p => { partByName[p.name] = p.id; });

  const combosWithRefs = SEED_COMBOS.map(combo => {
    const partMap = COMBO_PART_MAP[combo.name] || {};
    const refs = {};
    for (const [key, partName] of Object.entries(partMap)) {
      if (partByName[partName]) refs[key] = partByName[partName];
    }
    return { ...combo, ...refs };
  });

  await localDB.entities.Combo.bulkCreate(combosWithRefs);
  localStorage.setItem(SEED_FLAG, '1');
}