// Suggested Console builds: a starting point for each character, not a
// community-tested build. Layouts were found by an exhaustive search over each
// character's grid (see data/console.js) that fills all 20 cells, reaches the
// recommended Cartridge set's 4-piece bonus, then uses as many modules of the
// character's bonus Type as possible. Stats follow the character's main role;
// values are left blank because they depend on your Cartridge's rolls.

import { CHARACTER_BY_ID } from './characters.js';
import { ELEMENT_BY_ID } from './elements.js';

// [cartridge set, [[shape, row, col], ...]]
const LAYOUTS = {
  adler: ['kingdoms-guard', [['Hen2', 0, 0], ['Shu3', 0, 3], ['Shu3', 0, 4], ['Hen3', 1, 0], ['Hen3', 2, 0], ['Hen3', 3, 1], ['Hen3', 4, 1]]],
  akane: ['street-boxer', [['Hen2', 1, 0], ['Hen3', 1, 2], ['Hen3', 2, 0], ['Shu3', 2, 3], ['Shu3', 2, 4], ['Hen3', 3, 0], ['Hen3', 4, 0]]],
  aurelia: ['devils-blood-curse', [['Hen2', 0, 0], ['ZhiJiao2', 0, 2], ['ZhiJiao2', 1, 0], ['Shu3', 1, 3], ['Shu3', 2, 1], ['Shu3', 2, 4], ['ZhiJiao1', 3, 2]]],
  baicang: ['crimson-twin-butterflies', [['Hen3', 0, 1], ['ZhiJiao4', 0, 3], ['Hen3', 1, 0], ['Hen3', 2, 0], ['Shu2', 2, 4], ['ZhiJiao2', 3, 0], ['Hen3', 4, 1]]],
  blackbird: ['devils-blood-curse', [['Hen2', 0, 0], ['ZhiJiao2', 0, 2], ['ZhiJiao2', 1, 0], ['Shu3', 1, 3], ['Shu3', 2, 1], ['Shu3', 2, 4], ['ZhiJiao1', 3, 2]]],
  chaos: ['street-boxer', [['Hen2', 0, 1], ['ZhiJiao2', 0, 3], ['Hen3', 1, 0], ['Shu3', 1, 4], ['Hen3', 2, 0], ['ZhiJiao2', 3, 0], ['Hen3', 4, 1]]],
  chiz: ['lost-radiance', [['ZhiJiao1', 0, 1], ['ZhiJiao3', 0, 2], ['Shu4', 0, 4], ['Shu4', 1, 0], ['ZhiJiao2', 2, 1], ['Hen3', 4, 1]]],
  daffodill: ['diabolos', [['Hen2', 0, 0], ['ZhiJiao2', 0, 2], ['ZhiJiao2', 1, 0], ['ZhiJiao1', 1, 3], ['Shu3', 2, 1], ['ZhiJiao2', 3, 2], ['ZhiJiao4', 3, 3]]],
  edgar: ['theas-night-tavern', [['Hen2', 1, 0], ['Hen3', 1, 2], ['Hen3', 2, 0], ['Shu3', 2, 3], ['Shu3', 2, 4], ['Hen3', 3, 0], ['Hen3', 4, 0]]],
  fadia: ['tiny-big-adventure', [['Hen2', 0, 0], ['Hen2', 0, 2], ['Hen2', 1, 0], ['Hen2', 1, 2], ['Hen2', 2, 0], ['Hen2', 2, 3], ['Hen2', 3, 1], ['Hen2', 3, 3], ['Hen2', 4, 1], ['Hen2', 4, 3]]],
  haniel: ['speedy-hedgehog', [['Hen2', 0, 0], ['Shu3', 0, 3], ['Shu3', 0, 4], ['ZhiJiao1', 1, 0], ['ZhiJiao3', 1, 1], ['ZhiJiao1', 3, 1], ['ZhiJiao3', 3, 2]]],
  hathor: ['street-boxer', [['Hen2', 0, 0], ['ZhiJiao3', 0, 2], ['Hen3', 1, 0], ['ZhiJiao3', 2, 0], ['Shu3', 2, 3], ['Shu3', 2, 4], ['ZhiJiao4', 3, 1]]],
  hotori: ['speedy-hedgehog', [['Hen2', 0, 0], ['Shu3', 0, 3], ['Shu3', 0, 4], ['ZhiJiao1', 1, 0], ['ZhiJiao3', 1, 1], ['ZhiJiao1', 3, 1], ['ZhiJiao3', 3, 2]]],
  iroi: ['theas-night-tavern', [['Hen2', 0, 0], ['Shu3', 0, 3], ['Shu3', 0, 4], ['Hen3', 1, 0], ['Hen3', 2, 0], ['Hen3', 3, 1], ['Hen3', 4, 1]]],
  jiuyuan: ['fireflies-and-the-forest', [['Hen2', 1, 0], ['Hen2', 1, 2], ['Shu2', 1, 4], ['Hen2', 2, 0], ['Hen2', 2, 2], ['Hen2', 3, 0], ['Hen2', 3, 2], ['Shu2', 3, 4], ['Hen2', 4, 0], ['Hen2', 4, 2]]],
  lacrimosa: ['diabolos', [['Hen2', 1, 0], ['Hen3', 1, 2], ['Hen3', 2, 0], ['ZhiJiao2', 2, 3], ['ZhiJiao2', 3, 0], ['ZhiJiao4', 3, 1], ['ZhiJiao4', 3, 3]]],
  linko: ['fireflies-and-the-forest', [['Shu3', 0, 1], ['Hen3', 0, 2], ['Shu3', 1, 0], ['ZhiJiao2', 1, 2], ['Shu3', 1, 4], ['ZhiJiao4', 3, 0], ['Hen2', 4, 2]]],
  mint: ['fireflies-and-the-forest', [['Shu3', 0, 1], ['Hen3', 0, 2], ['Shu3', 1, 0], ['ZhiJiao2', 1, 2], ['Shu3', 1, 4], ['ZhiJiao4', 3, 0], ['Hen2', 4, 2]]],
  nanally: ['fireflies-and-the-forest', [['Hen2', 1, 0], ['Hen2', 1, 2], ['Shu2', 1, 4], ['Hen2', 2, 0], ['Hen2', 2, 2], ['Hen2', 3, 0], ['Hen2', 3, 2], ['Shu2', 3, 4], ['Hen2', 4, 0], ['Hen2', 4, 2]]],
  sakiri: ['speedy-hedgehog', [['Hen2', 0, 0], ['Shu3', 0, 3], ['Shu3', 0, 4], ['ZhiJiao1', 1, 0], ['ZhiJiao3', 1, 1], ['ZhiJiao1', 3, 1], ['ZhiJiao3', 3, 2]]],
  shinku: ['lost-radiance', [['Hen2', 1, 0], ['Hen3', 1, 2], ['Hen3', 2, 0], ['ZhiJiao3', 2, 3], ['ZhiJiao1', 3, 0], ['ZhiJiao3', 3, 1], ['ZhiJiao1', 3, 3]]],
  skia: ['street-boxer', [['Hen2', 0, 1], ['ZhiJiao2', 0, 3], ['Hen3', 1, 0], ['Shu3', 1, 4], ['Hen3', 2, 0], ['ZhiJiao2', 3, 0], ['Hen3', 4, 1]]],
  zankou: ['crimson-twin-butterflies', [['Hen3', 0, 1], ['ZhiJiao4', 0, 3], ['Hen3', 1, 0], ['Hen3', 2, 0], ['Shu2', 2, 4], ['ZhiJiao2', 3, 0], ['Hen3', 4, 1]]],
  zero: ['lost-radiance', [['Hen2', 0, 0], ['ZhiJiao2', 0, 2], ['ZhiJiao2', 1, 0], ['ZhiJiao1', 1, 3], ['Shu3', 2, 1], ['ZhiJiao1', 3, 2], ['ZhiJiao3', 3, 3]]],
};

// Main stat and 4 sub stats to look for, by main role.
function suggestedStats(c) {
  const role = c.roles[0];
  const el = `${ELEMENT_BY_ID[c.element].name} DMG%`;
  if (role === 'Survival') {
    const main = c.id === 'adler' ? 'DEF%' : 'HP%';
    return { main, subs: ['HP%', 'DEF%', 'Cycle Intensity', 'HP'] };
  }
  if (role === 'Buff') return { main: 'ATK%', subs: ['ATK%', 'CRIT Rate', 'Cycle Intensity', 'HP%'] };
  return { main: c.element ? el : 'CRIT DMG', subs: ['CRIT Rate', 'CRIT DMG', 'ATK%', 'DMG%'] };
}

/** Suggested build for a character: { name, cartridge, pieces, cartStats } or null. */
export function suggestedBuild(characterId) {
  const entry = LAYOUTS[characterId];
  const c = CHARACTER_BY_ID[characterId];
  if (!entry || !c) return null;
  const [cartridge, layout] = entry;
  const st = suggestedStats(c);
  return {
    id: `suggested-${characterId}`,
    name: 'Suggested build',
    suggested: true,
    cartridge,
    pieces: layout.map(([shape, r, col]) => ({ shape, r, c: col })),
    cartStats: {
      main: { stat: st.main, value: 0 },
      subs: st.subs.map((stat) => ({ stat, value: 0 })),
    },
  };
}
