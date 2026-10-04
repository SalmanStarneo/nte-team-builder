// The six elements, in Esper Cycle order. Each element reacts with its two
// neighbours on the ring (index - 1 and index + 1, wrapping around).
// Colours match the in-game Esper Cycle; values are theme tokens in styles.css.
export const ELEMENTS = [
  { id: 'cosmos', name: 'Cosmos', color: 'var(--el-cosmos)' },
  { id: 'anima', name: 'Anima', color: 'var(--el-anima)' },
  { id: 'incantation', name: 'Incantation', color: 'var(--el-incantation)' },
  { id: 'chaos', name: 'Chaos', color: 'var(--el-chaos)' },
  { id: 'psyche', name: 'Psyche', color: 'var(--el-psyche)' },
  { id: 'lakshana', name: 'Lakshana', color: 'var(--el-lakshana)' },
];

export const ELEMENT_BY_ID = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));

// Pair reactions: one per neighbouring pair on the ring.
// "kind" groups them the way the community describes them.
export const PAIR_REACTIONS = [
  {
    id: 'blossom',
    name: 'Blossom',
    elements: ['cosmos', 'anima'],
    kind: 'Amplify',
    effect: 'Spawns Blossom buds that keep attacking enemies.',
  },
  {
    id: 'hexed',
    name: 'Hexed',
    elements: ['anima', 'incantation'],
    kind: 'Weaken',
    effect: 'Echoes part of the damage the target takes.',
  },
  {
    id: 'scorch',
    name: 'Scorch',
    elements: ['incantation', 'chaos'],
    kind: 'Amplify',
    effect: 'Burns the target with damage over time.',
  },
  {
    id: 'nova',
    name: 'Nova',
    elements: ['chaos', 'psyche'],
    kind: 'Control',
    effect: 'Area burst that staggers nearby enemies.',
  },
  {
    id: 'stain',
    name: 'Stain',
    elements: ['psyche', 'lakshana'],
    kind: 'Weaken',
    effect: 'Lowers the target’s resistance and slows it.',
  },
  {
    id: 'remora',
    name: 'Remora',
    elements: ['lakshana', 'cosmos'],
    kind: 'Control',
    effect: 'Restrains the target, slowing its movement and attacks.',
  },
];

// Trio reactions need three neighbouring elements.
export const TRIO_REACTIONS = [
  {
    id: 'charge',
    name: 'Charge',
    elements: ['lakshana', 'cosmos', 'anima'],
    effect: 'Blossom hitting a Remora target. Refills Ultimate energy fast.',
  },
  {
    id: 'discord',
    name: 'Discord',
    elements: ['incantation', 'chaos', 'psyche'],
    effect: 'Heavy debuff that makes enemies much easier to break.',
  },
];

export const ROLES = ['Damage', 'Buff', 'Survival'];
