// Character stats at Level 80, without Arc or Console (Cartridge/module) stats.
// Source: in-game character screens, provided by the project owner (Oct 2026).
// Percentages are stored as numbers (83 = 83%). Element DMG bonuses and
// resistances not listed are 0%.

export const MAX_STATS_LEVEL = 80;

const s = (hp, atk, def, adv, dmg = {}, res = {}) => ({
  hp, atk, def, stamina: 200,
  ...adv,
  healing: 0,
  healingReceived: 0,
  dmg,
  res,
});

export const MAX_STATS = {
  lacrimosa: s(15998, 1192, 909, { critRate: 83, critDmg: 73.6, charge: 100, cycle: 120, breakInt: 60, universal: 11 }, { chaos: 50 }),
  shinku: s(16120, 1206, 897, { critRate: 83, critDmg: 115.6, charge: 100, cycle: 18, breakInt: 0, universal: 9 }, { cosmos: 10 }),
  iroi: s(17210, 1092, 909, { critRate: 15, critDmg: 69.6, charge: 112, cycle: 18, breakInt: 114, universal: 21 }, { anima: 37.5 }),
  zankou: s(15514, 1230, 909, { critRate: 66, critDmg: 181.6, charge: 100, cycle: 130, breakInt: 0, universal: 13 }, { incantation: 10 }),
  zero: s(15150, 1122, 909, { critRate: 40.8, critDmg: 140, charge: 100, cycle: 0, breakInt: 126, universal: 10 }),
  chaos: s(15756, 1132, 921, { critRate: 50.6, critDmg: 158, charge: 100, cycle: 18, breakInt: 72, universal: 15 }),
  sakiri: s(16483, 1034, 909, { critRate: 18, critDmg: 68, charge: 100, cycle: 18, breakInt: 30, universal: 21 }, { incantation: 91.5 }),
  blackbird: s(15514, 1238, 884, { critRate: 74, critDmg: 96, charge: 100, cycle: 18, breakInt: 18, universal: 14 }, { psyche: 37.5 }),
};

// Damage types in the order the game lists them.
export const DMG_TYPES = ['cosmos', 'anima', 'incantation', 'chaos', 'psyche', 'lakshana', 'mental'];
