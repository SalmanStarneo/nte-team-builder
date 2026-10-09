// Character stats at Level 80, without Arc or Console (Cartridge/module) stats.
// Source: in-game character screens, provided by the project owner (Oct 2026).
// Percentages are stored as numbers (83 = 83%). Element DMG bonuses and
// resistances not listed are 0%.

import { CHARACTERS } from './characters.js';

export const MAX_STATS_LEVEL = 80;

const s = (hp, atk, def, adv, dmg = {}, res = {}) => ({
  hp, atk, def, stamina: 200,
  ...adv,
  healing: 0,
  healingReceived: 0,
  dmg,
  res,
});

const MEASURED = {
  lacrimosa: s(15998, 1192, 909, { critRate: 83, critDmg: 73.6, charge: 100, cycle: 120, breakInt: 60, universal: 11 }, { chaos: 50 }),
  shinku: s(16120, 1206, 897, { critRate: 83, critDmg: 115.6, charge: 100, cycle: 18, breakInt: 0, universal: 9 }, { cosmos: 10 }),
  iroi: s(17210, 1092, 909, { critRate: 15, critDmg: 69.6, charge: 112, cycle: 18, breakInt: 114, universal: 21 }, { anima: 37.5 }),
  zankou: s(15514, 1230, 909, { critRate: 66, critDmg: 181.6, charge: 100, cycle: 130, breakInt: 0, universal: 13 }, { incantation: 10 }),
  zero: s(15150, 1122, 909, { critRate: 40.8, critDmg: 140, charge: 100, cycle: 0, breakInt: 126, universal: 10 }),
  chaos: s(15756, 1132, 921, { critRate: 50.6, critDmg: 158, charge: 100, cycle: 18, breakInt: 72, universal: 15 }),
  sakiri: s(16483, 1034, 909, { critRate: 18, critDmg: 68, charge: 100, cycle: 18, breakInt: 30, universal: 21 }, { incantation: 91.5 }),
  blackbird: s(15514, 1238, 884, { critRate: 74, critDmg: 96, charge: 100, cycle: 18, breakInt: 18, universal: 14 }, { psyche: 37.5 }),
};

// Estimated Level 80 HP, ATK and DEF for characters without in-game values yet,
// from their Level 1 stats. In the measured data, Level 80 HP and DEF are
// exactly 12.12x Level 1 (Zero, Lacrimosa, Sakiri); ATK grows 13.2x–14.9x, so
// 13.2x is used. Advanced stats (CRIT, Cycle, Break, DMG bonuses) can't be
// estimated and stay null. Marked `estimated` so the UI can flag them; replace
// with in-game values when available.
export const HP_DEF_GROWTH = 12.12;
export const ATK_GROWTH = 13.2;
const ESTIMATED = Object.fromEntries(
  CHARACTERS.filter((c) => c.stats && !MEASURED[c.id]).map((c) => [c.id, {
    hp: Math.round(c.stats.hp * HP_DEF_GROWTH),
    atk: Math.round(c.stats.atk * ATK_GROWTH),
    def: Math.round(c.stats.def * HP_DEF_GROWTH),
    stamina: 200,
    critRate: null, critDmg: null, charge: null, cycle: null, breakInt: null, universal: null,
    healing: null, healingReceived: null,
    dmg: {}, res: {},
    estimated: true,
  }]),
);

export const MAX_STATS = { ...ESTIMATED, ...MEASURED };

// Damage types in the order the game lists them.
export const DMG_TYPES = ['cosmos', 'anima', 'incantation', 'chaos', 'psyche', 'lakshana', 'mental'];
