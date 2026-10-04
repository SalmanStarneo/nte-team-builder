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

// Recommended Cartridge sets, worked out from each character's element and
// roles (no guide publishes a full per-character list yet):
//   Damage   -> the set that boosts their element's DMG
//   Buff     -> Speedy Hedgehog (team ATK after Ultimate)
//   Survival -> by how they protect the team: healing, shields or HP
// The character's first role decides which set is listed first.
const ELEMENT_SET = {
  cosmos: 'lost-radiance',
  anima: 'fireflies-and-the-forest',
  incantation: 'crimson-twin-butterflies',
  chaos: 'diabolos',
  psyche: 'devils-blood-curse',
  lakshana: 'street-boxer',
};

const SURVIVAL_SET = {
  heal: 'theas-night-tavern',
  shield: 'kingdoms-guard',
  hp: 'tiny-big-adventure',
};

// How each Survival character keeps the team alive.
const SURVIVAL_STYLE = { adler: 'shield', edgar: 'heal', iroi: 'heal', fadia: 'hp' };

export function cartridgesFor(character) {
  const sets = [];
  for (const role of character.roles) {
    if (role === 'Damage') sets.push(ELEMENT_SET[character.element]);
    if (role === 'Buff') sets.push('speedy-hedgehog', ELEMENT_SET[character.element]);
    if (role === 'Survival') sets.push(SURVIVAL_SET[SURVIVAL_STYLE[character.id] ?? 'hp']);
  }
  return [...new Set(sets)];
}

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
