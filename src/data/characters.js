// Character roster. Update this file when a new patch adds characters.
// Sources: neverness.gg character list (Sep 2026) and build guides.
// "upcoming: true" hides a character unless the "Show upcoming" filter is on.
export const DATA_VERSION = '1.4 (first half)';

export const CHARACTERS = [
  // S-rank
  { id: 'baicang', name: 'Baicang', rarity: 'S', element: 'incantation', role: 'Damage' },
  { id: 'blackbird', name: 'Blackbird', rarity: 'S', element: 'psyche', role: 'Damage' },
  { id: 'chaos', name: 'Chaos', rarity: 'S', element: 'lakshana', role: 'Damage' },
  { id: 'chiz', name: 'Chiz', rarity: 'S', element: 'cosmos', role: 'Damage' },
  { id: 'daffodill', name: 'Daffodill', rarity: 'S', element: 'chaos', role: 'Damage' },
  { id: 'zero', name: 'Esper Zero', rarity: 'S', element: 'cosmos', role: 'Damage' },
  { id: 'fadia', name: 'Fadia', rarity: 'S', element: 'psyche', role: 'Survival' },
  { id: 'hathor', name: 'Hathor', rarity: 'S', element: 'lakshana', role: 'Damage' },
  { id: 'hotori', name: 'Hotori', rarity: 'S', element: 'cosmos', role: 'Buff' },
  { id: 'iroi', name: 'Iroi', rarity: 'S', element: 'anima', role: 'Survival' },
  { id: 'jiuyuan', name: 'Jiuyuan', rarity: 'S', element: 'anima', role: 'Damage' },
  { id: 'lacrimosa', name: 'Lacrimosa', rarity: 'S', element: 'chaos', role: 'Damage' },
  { id: 'linko', name: 'Linko', rarity: 'S', element: 'anima', role: 'Damage' },
  { id: 'nanally', name: 'Nanally', rarity: 'S', element: 'anima', role: 'Damage' },
  { id: 'sakiri', name: 'Sakiri', rarity: 'S', element: 'incantation', role: 'Buff' },
  { id: 'shinku', name: 'Shinku', rarity: 'S', element: 'cosmos', role: 'Damage' },
  { id: 'zankou', name: 'Zankou', rarity: 'S', element: 'incantation', role: 'Damage' },
  { id: 'akane', name: 'Akane Rin', rarity: 'S', element: 'lakshana', role: 'Damage', upcoming: true },
  // A-rank
  { id: 'adler', name: 'Adler', rarity: 'A', element: 'incantation', role: 'Survival' },
  { id: 'aurelia', name: 'Aurelia', rarity: 'A', element: 'psyche', role: 'Damage' },
  { id: 'edgar', name: 'Edgar', rarity: 'A', element: 'cosmos', role: 'Survival' },
  { id: 'haniel', name: 'Haniel', rarity: 'A', element: 'psyche', role: 'Buff' },
  { id: 'mint', name: 'Mint', rarity: 'A', element: 'anima', role: 'Damage' },
  { id: 'skia', name: 'Skia', rarity: 'A', element: 'lakshana', role: 'Damage' },
];

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
