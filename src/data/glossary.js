// Glossary of NTE terms. Reactions are added automatically from elements.js.
// Each entry: { term, also?, category, text, related? }
export const GLOSSARY_CATEGORIES = ['Esper Cycle', 'Reactions', 'Characters', 'Gear', 'Combat', 'Modes'];

export const GLOSSARY = [
  // Esper Cycle
  {
    term: 'Esper Cycle',
    category: 'Esper Cycle',
    text: 'The ring of six elements: Cosmos, Anima, Incantation, Chaos, Psyche and Lakshana. Elements next to each other on the ring react when both are applied to the same enemy.',
    related: ['Reaction', 'Esper Meter'],
  },
  {
    term: 'Element',
    also: 'Attribute',
    category: 'Esper Cycle',
    text: 'Every character deals one of six elements. A character’s element decides which reactions they can take part in.',
  },
  {
    term: 'Esper Meter',
    category: 'Esper Cycle',
    text: 'A team gauge that fills during combat. Switching characters with a full meter applies the incoming character’s element and can set off a reaction.',
    related: ['Instant Cycle'],
  },
  {
    term: 'Cycle Intensity',
    category: 'Esper Cycle',
    text: 'A stat that increases the damage dealt by reactions such as Blossom buds or Nova.',
  },
  {
    term: 'Instant Cycle',
    category: 'Esper Cycle',
    text: 'Effects that refill or trigger the Esper Meter immediately, letting a team react far more often. Esper Zero is the best-known example.',
  },
  {
    term: 'Reaction',
    category: 'Esper Cycle',
    text: 'The effect created when two neighbouring elements meet on an enemy. There are six pair reactions and two trio reactions that need three neighbouring elements.',
    related: ['Trio reaction'],
  },
  {
    term: 'Trio reaction',
    category: 'Esper Cycle',
    text: 'A stronger reaction that needs three neighbouring elements: Charge (Lakshana, Cosmos, Anima) or Discord (Incantation, Chaos, Psyche).',
  },

  // Characters
  {
    term: 'Esper',
    category: 'Characters',
    text: 'A person with supernatural abilities. Playable characters are Espers, each with a named Esper ability.',
  },
  {
    term: 'Rank',
    also: 'Rarity',
    category: 'Characters',
    text: 'S-rank characters are the rarest; A-rank characters are more common and easier to fully upgrade.',
  },
  {
    term: 'Role',
    category: 'Characters',
    text: 'Damage (deals most of the team’s damage), Buff (strengthens allies) or Survival (heals, shields or keeps the team alive). Many characters cover more than one role; the first listed is their in-game role.',
  },
  {
    term: 'Main DPS',
    category: 'Characters',
    text: 'Community term for the character who stays on the field and deals most of the damage. Burst DPS and Sub-DPS characters swap in briefly for big hits.',
  },
  {
    term: 'Awakening',
    also: 'A1 to A6',
    category: 'Characters',
    text: 'Six optional upgrades (A1 to A6) for a character. Each duplicate copy unlocks one awakening slot, and you can turn on any awakenings up to that number, in any order or none at all.',
  },
  {
    term: 'Resonance',
    also: 'R3 and R6',
    category: 'Characters',
    text: 'Two bonuses per character that switch on automatically: R3 with 3 awakenings active and R6 with all 6. R3 usually raises skill levels; R6 is a bigger personal or team bonus.',
  },
  {
    term: 'Ascension',
    category: 'Characters',
    text: 'Raising a character’s level cap. Six ascensions take the cap from 20 to 80, each costing Beetle Coin, a tier of the character’s material family and their Anomaly Hunt boss drop.',
    related: ['Anomaly Hunt', 'Beetle Coin'],
  },
  {
    term: 'Beetle Coin',
    category: 'Characters',
    text: 'The currency spent on ascensions, skill upgrades and Arc upgrades. Taking one character from cap 20 to 80 costs 525,000.',
  },
  {
    term: 'Material family',
    category: 'Characters',
    text: 'Each character ascends with one of four families (Whispers, Silhouette, Numeral or Delusions), used in three tiers as the level cap rises.',
  },
  {
    term: 'Base stats',
    category: 'Characters',
    text: 'A character’s HP, ATK and DEF before gear. This app lists Level 80 values without Arc or Console, as shown on the in-game character screen.',
  },

  // Gear
  {
    term: 'Arc',
    also: 'Weapon',
    category: 'Gear',
    text: 'The equipment slot that works like a weapon. An Arc adds base ATK, a secondary stat and a passive effect. Many S-rank characters have a signature Arc.',
    related: ['Arc type'],
  },
  {
    term: 'Arc type',
    also: 'Arc compatibility',
    category: 'Gear',
    text: 'Each character is compatible with one of five Arc types: Solid, Liquid, Gas, Plasma or Condensate (some sources call it Synthesis). Matching the type is required to equip an Arc.',
  },
  {
    term: 'Console',
    category: 'Gear',
    text: 'A character’s gear board. Modules are placed on it, and the Console grants traits based on how it is filled.',
    related: ['Module', 'Cartridge'],
  },
  {
    term: 'Module',
    category: 'Gear',
    text: 'Shaped gear pieces placed on the Console, each carrying stats. Modules come in different types and shapes, such as vertical, L and Z pieces.',
  },
  {
    term: 'Cartridge',
    category: 'Gear',
    text: 'A gear set. Equipping enough pieces of the same Cartridge set unlocks its 2-piece and 4-piece bonuses.',
  },

  // Combat
  {
    term: 'Break',
    category: 'Combat',
    text: 'Enemies have a break bar. Emptying it staggers them and leaves them open to much higher damage for a short time.',
  },
  {
    term: 'Critical Dodge',
    category: 'Combat',
    text: 'Dodging at the last moment before an attack lands. Some characters follow it with a special counter attack, called a Critical Riposte.',
  },
  {
    term: 'Support Skill',
    category: 'Combat',
    text: 'The move a character performs when switched in, often used to trigger reactions or apply buffs.',
  },
  {
    term: 'DoT',
    also: 'Damage over time',
    category: 'Combat',
    text: 'Damage dealt in repeated ticks, such as Scorch. Some supports increase damage taken from each DoT on an enemy.',
  },

  // Modes
  {
    term: 'Beyond the Rails',
    category: 'Modes',
    text: 'Endgame challenge mode. Most stages require two teams with no character in common, and stages have elemental weaknesses.',
  },
  {
    term: 'Anomaly Hunt',
    category: 'Modes',
    text: 'Boss fights that drop the character-specific material needed for ascension, such as Tear of the Sea from Sea Prisoner.',
  },
  {
    term: 'Hethereau',
    category: 'Modes',
    text: 'The open-world city where NTE takes place.',
  },
];
