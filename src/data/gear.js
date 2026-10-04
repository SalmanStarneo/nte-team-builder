// Console gear: Cartridge sets and Module types.
// Sources (Oct 2026): Mobalytics cartridge guide (set bonuses), thegameswiki
// Console page (module sizes, stat pool), character build guides.
// Bonus text is summarised; check in-game for exact values.

export const CARTRIDGES = [
  { id: 'crimson-twin-butterflies', name: 'Crimson: Twin Butterflies', two: 'Incantation DMG +10%', four: 'ATK +6% each time a nearby enemy takes Incantation DMG from the team, up to 6 stacks (10s).' },
  { id: 'devils-blood-curse', name: "Devil's Blood: Curse", two: 'Psyche DMG +10%', four: 'DMG +18%, rising to 36% against enemies affected by Nova or Stain.' },
  { id: 'diabolos', name: 'Diabolos', two: 'Chaos DMG +10%', four: 'Ignores 12% Chaos RES; 24% for 20s after the wearer takes part in Nova or Scorch.' },
  { id: 'fireflies-and-the-forest', name: 'Fireflies and the Forest', two: 'Anima DMG +10%', four: 'Crit DMG +8% each time a nearby enemy takes Anima DMG from the team, up to 7 stacks (10s).' },
  { id: 'kingdoms-guard', name: "Kingdom's Guard", two: 'DEF +15%', four: 'Shields from the wearer +20%.' },
  { id: 'lost-radiance', name: 'Lost Radiance', two: 'Cosmos DMG +10%', four: 'Ignores 25% enemy DEF for 20s after the wearer casts Ultimate.' },
  { id: 'quiet-manor', name: 'Quiet Manor', two: 'Mental DMG +10%', four: 'Mental DMG +12% per Basic Attack, up to 3 stacks (6s).' },
  { id: 'shadow-creed', name: 'Shadow Creed', two: 'ATK +10%', four: 'ATK +25% for 20s after casting a Skill.' },
  { id: 'speedy-hedgehog', name: 'Speedy Hedgehog', two: 'Charge Efficiency +12%', four: 'All allies’ ATK +15% for 20s after the wearer casts Ultimate.' },
  { id: 'street-boxer', name: 'Street Boxer', two: 'Lakshana DMG +10%', four: 'Crit Rate up; the bonus increases for 20s after the team triggers Remora or Stain.' },
  { id: 'theas-night-tavern', name: "Thea's Night Tavern", two: 'HP +10%', four: 'Healing Bonus +20%.' },
  { id: 'tiny-big-adventure', name: 'Tiny Big Adventure', two: 'HP +10%', four: 'Max HP +4% when taking damage, up to 10 stacks (10s); Ultimate grants all 10.' },
];

export const CARTRIDGE_BY_ID = Object.fromEntries(CARTRIDGES.map((c) => [c.id, c]));

// Modules are Tetris-like pieces placed on the Console. Size is the number of cells.
export const MODULE_TYPES = [
  { id: 'II', label: 'Type II', cells: 2 },
  { id: 'III', label: 'Type III', cells: 3 },
  { id: 'IV', label: 'Type IV', cells: 4 },
];

export const MODULE_STATS = [
  'ATK %',
  'ATK',
  'Crit Rate',
  'Crit DMG',
  'Elemental DMG',
  'Break Intensity',
  'HP %',
  'HP',
  'DEF %',
  'DEF',
  'Energy Regen',
];

export const MODULE_SLOTS = 4;
