// Character roster. Update this file when a new patch adds characters.
// Sources (Oct 2026): neverness.gg and Icy Veins character lists (rank, element,
// role, arc type; some sources call Condensate "Synthesis"); Dexerto wiki profiles (faction, Esper ability, role tags,
// Level 1 base stats). Fields set to null are not yet published by those sources.
//
// roles: the in-game role comes first; extra roles reflect what community
// guides use the character for (e.g. Hotori is a Buffer who also burst-damages).
// "upcoming: true" hides a character unless the "Show upcoming" filter is on.
export const DATA_VERSION = '1.4';

export const ARC_TYPES = ['Solid', 'Liquid', 'Gas', 'Plasma', 'Condensate'];

const stats = (hp, atk, def) => ({ hp, atk, def, critRate: 5, critDmg: 50 });

export const CHARACTERS = [
  // S-rank
  {
    id: 'baicang', name: 'Baicang', rarity: 'S', element: 'incantation', roles: ['Damage'],
    arcType: 'Condensate', faction: 'Bureau of Anomaly Control, ETD-4', ability: 'Verdict and Autumn',
    tags: ['Main DPS', 'DoT'], stats: stats(1370, 81, 66),
  },
  {
    id: 'blackbird', name: 'Blackbird', rarity: 'S', element: 'psyche', roles: ['Damage', 'Buff'],
    arcType: 'Gas', faction: 'Yggash Court', ability: null,
    tags: ['Main DPS', 'Team ATK Buff'], stats: null,
  },
  {
    id: 'chaos', name: 'Chaos', rarity: 'S', element: 'lakshana', roles: ['Damage'],
    arcType: 'Condensate', faction: 'ETD-6', ability: null,
    tags: ['Main DPS'], stats: null,
  },
  {
    id: 'chiz', name: 'Chiz', rarity: 'S', element: 'cosmos', roles: ['Damage'],
    arcType: 'Gas', faction: 'Dvořák Family', ability: 'A World of Dew',
    tags: ['Main DPS'], stats: stats(1280, 83, 75),
  },
  {
    id: 'daffodill', name: 'Daffodill', rarity: 'S', element: 'chaos', roles: ['Damage'],
    arcType: 'Liquid', faction: 'Eibon Antique Shop', ability: 'Thousand Blades, Thousand Eyes',
    tags: ['Burst DPS', 'Break'], stats: stats(1335, 81, 72),
  },
  {
    id: 'zero', name: 'Esper Zero', rarity: 'S', element: 'cosmos', roles: ['Damage'],
    arcType: 'Solid', faction: 'Eibon Antique Shop', ability: 'Zeroth Sense',
    tags: ['Burst DPS', 'Instant Cycle'], stats: stats(1250, 85, 75),
  },
  {
    id: 'fadia', name: 'Fadia', rarity: 'S', element: 'psyche', roles: ['Survival', 'Damage'],
    arcType: 'Condensate', faction: 'Bureau of Anomaly Control, ETD-4', ability: 'Lilith',
    tags: ['Survival'], stats: stats(1410, 75, 75),
  },
  {
    id: 'hathor', name: 'Hathor', rarity: 'S', element: 'lakshana', roles: ['Damage', 'Buff'],
    arcType: 'Plasma', faction: 'Sterry Express', ability: "Wanderer's Pact",
    tags: ['Burst DPS'], stats: stats(1320, 81, 73),
  },
  {
    id: 'hotori', name: 'Hotori', rarity: 'S', element: 'cosmos', roles: ['Buff', 'Damage'],
    arcType: 'Solid', faction: 'Eibon Antique Shop', ability: 'Duino Elegies',
    tags: ['Burst DPS', 'DMG Boost'], stats: stats(1330, 82, 70),
  },
  {
    id: 'iroi', name: 'Iroi', rarity: 'S', element: 'anima', roles: ['Survival', 'Buff'],
    arcType: 'Liquid', faction: null, ability: null,
    tags: ['Survival', 'Team ATK Buff'], stats: null,
  },
  {
    id: 'jiuyuan', name: 'Jiuyuan', rarity: 'S', element: 'anima', roles: ['Damage', 'Survival'],
    arcType: 'Solid', faction: 'Sterry Express', ability: 'Ordinance of Cycles',
    tags: ['Burst DPS', 'Grouping'], stats: stats(1290, 82, 75),
  },
  {
    id: 'lacrimosa', name: 'Lacrimosa', rarity: 'S', element: 'chaos', roles: ['Damage'],
    arcType: 'Liquid', faction: 'Bureau of Anomaly Control, ETD-4', ability: 'Requiem',
    tags: ['Main DPS', 'DoT'], stats: stats(1320, 80, 75),
  },
  {
    id: 'linko', name: 'Linko', rarity: 'S', element: 'anima', roles: ['Damage', 'Buff'],
    arcType: 'Plasma', faction: null, ability: null,
    tags: ['Sub-DPS', 'RES Shred'], stats: null,
  },
  {
    id: 'nanally', name: 'Nanally', rarity: 'S', element: 'anima', roles: ['Damage'],
    arcType: 'Plasma', faction: null, ability: 'Genius Ichi-daime: Earth Flip',
    tags: ['Main DPS', 'Follow-up Attack'], stats: stats(1320, 80, 75),
  },
  {
    id: 'sakiri', name: 'Sakiri', rarity: 'S', element: 'incantation', roles: ['Buff'],
    arcType: 'Gas', faction: 'Eibon Antique Shop', ability: 'Ghosteater',
    tags: ['Control', 'DMG Boost'], stats: stats(1360, 78, 75),
  },
  {
    id: 'shinku', name: 'Shinku', rarity: 'S', element: 'cosmos', roles: ['Damage'],
    arcType: 'Condensate', faction: null, ability: null,
    tags: ['Main DPS'], stats: null,
  },
  {
    id: 'zankou', name: 'Zankou', rarity: 'S', element: 'incantation', roles: ['Damage'],
    arcType: 'Gas', faction: null, ability: null,
    tags: ['Main DPS', 'DoT'], stats: null,
  },
  {
    id: 'akane', name: 'Akane Rin', rarity: 'S', element: 'lakshana', roles: ['Damage'],
    arcType: 'Liquid', faction: 'Tamamochi Street Resident Association', ability: null,
    tags: ['Main DPS'], stats: null, upcoming: true,
  },
  // Version 1.5 drip-marketing reveals. Arc type and kit not published yet.
  {
    id: 'elyms', name: 'Elyms', rarity: 'S', element: 'cosmos', roles: ['Damage'],
    arcType: null, faction: 'E.T.D. 6', ability: null,
    tags: ['Melee'], stats: null, upcoming: true,
  },
  {
    id: 'exe', name: 'Exe', rarity: 'S', element: 'chaos', roles: ['Damage'],
    arcType: null, faction: 'E.T.D. 6', ability: null,
    tags: [], stats: null, upcoming: true,
  },
  // A-rank
  {
    id: 'adler', name: 'Adler', rarity: 'A', element: 'incantation', roles: ['Survival'],
    arcType: 'Condensate', faction: 'Eibon Antique Shop', ability: 'Ayatana',
    tags: ['Survival', 'DoT'], stats: stats(1180, 55, 82),
  },
  {
    id: 'aurelia', name: 'Aurelia', rarity: 'A', element: 'psyche', roles: ['Damage'],
    arcType: 'Plasma', faction: 'Tamamochi Street Resident Association', ability: 'Nostalgia for Youth',
    tags: ['Main DPS'], stats: stats(980, 76, 60),
  },
  {
    id: 'edgar', name: 'Edgar', rarity: 'A', element: 'cosmos', roles: ['Survival'],
    arcType: 'Liquid', faction: 'Eibon Antique Shop', ability: "Finnegan's Vigil",
    tags: ['Survival'], stats: stats(1350, 53, 68),
  },
  {
    id: 'haniel', name: 'Haniel', rarity: 'A', element: 'psyche', roles: ['Buff', 'Damage'],
    arcType: 'Solid', faction: 'Sterry Express', ability: 'Amazing Grace',
    tags: ['DMG Boost'], stats: stats(1130, 62, 70),
  },
  {
    id: 'mint', name: 'Mint', rarity: 'A', element: 'anima', roles: ['Damage'],
    arcType: 'Liquid', faction: 'Bureau of Anomaly Control, CSU-2', ability: 'Nya-choo!',
    tags: ['Main DPS'], stats: stats(1000, 75, 60),
  },
  {
    id: 'skia', name: 'Skia', rarity: 'A', element: 'lakshana', roles: ['Damage'],
    arcType: 'Gas', faction: 'Bureau of Anomaly Control, ETD-4', ability: 'Faust',
    tags: ['Main DPS'], stats: stats(1100, 70, 55),
  },
];

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
