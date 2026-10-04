// Arcs (weapons). Max-level base ATK and secondary stat.
// Sources (Oct 2026): neverness.gg Arc list (type, rarity, stats) and Icy Veins
// weapon pages for Arcs added after that list. Passives are short summaries;
// check in-game text for exact values.
// "signature" links an Arc to the character it was released with.

const arc = (name, rarity, type, atk, sub, passive, signature = null) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name,
  rarity,
  type,
  atk,
  sub,
  passive,
  signature,
});

export const ARCS = [
  // S-rank
  arc('Blow up the Crowd', 'S', 'Solid', 512, 'ATK 27.5%', 'Raises ATK while off-field; Basic Attacks boost Psyche DMG.'),
  arc('Blushing Mirage', 'S', 'Synthesis', 570, 'Crit Rate 24%', 'ATK +20%. After Ultimate, Cosmos DMG +32% and ignores 12% DEF for 20s.', 'shinku'),
  arc('Camellia Society', 'S', 'Synthesis', 666, 'Crit Rate 12%', 'Crit DMG stacks as HP drops; triggers Silent Garden attacks.'),
  arc('Contemplative Cat', 'S', 'Gas', 512, 'Crit DMG 44%', 'Cosmos DMG rises with Fons held, up to 10 stacks.'),
  arc('Crime and Punishment', 'S', 'Gas', 570, 'Crit Rate 24%', 'Psyche DMG +20% and Cycle Intensity up. After Ultimate, team Crit DMG up.', 'blackbird'),
  arc('Day Off', 'S', 'Solid', 512, 'Charge Efficiency 33%', 'ATK up; defeating enemies restores Ultimate Energy.'),
  arc('Eternal Waltz', 'S', 'Synthesis', 424, 'HP 41.25%', 'Max HP up; Mental DMG up after Ultimate.'),
  arc('Far Side of the Moon', 'S', 'Liquid', 570, 'Crit DMG 48%', 'Crit Rate +16%; stacking Basic Attack and Redirect Skill DMG.', 'akane'),
  arc('Fluff of Fearlessness', 'S', 'Solid', 512, 'Crit Rate 22%', 'ATK up for 10s after Ultimate.'),
  arc('Fluff of Ferocity', 'S', 'Synthesis', 512, 'ATK 27.5%', 'Crit DMG stacks on critical hits, up to 10.'),
  arc('Fluff of Finesse', 'S', 'Gas', 512, 'ATK 27.5%', 'DMG up for 10s after a Critical Dodge, up to 3 stacks.'),
  arc('Fluff of Fleetness', 'S', 'Liquid', 512, 'Crit DMG 44%', 'ATK stacks each second on-field, up to 5.'),
  arc('Fluff of Fortitude', 'S', 'Plasma', 512, 'ATK 27.5%', 'DMG up; more against enemies below 50% HP.'),
  arc("Good Boy's Grand Adventure", 'S', 'Gas', 474, 'ATK 45%', 'Charge Efficiency and team ATK up after Ultimate.'),
  arc("Hethereau's Keeper", 'S', 'Solid', 512, 'ATK 27.5%', 'ATK and Boss DMG up; summons Officer Whisker.'),
  arc('Marching Beyond Time', 'S', 'Solid', 570, 'Crit Rate 24%', 'ATK up; Wastetime stacks raise Ultimate Crit DMG.'),
  arc('Raging Flames', 'S', 'Plasma', 666, 'Crit DMG 24%', 'Stacking Redirect Skill DMG after Ultimate.'),
  arc('Ravenous Blade', 'S', 'Gas', 570, 'Crit Rate 24%', 'Crit Rate +16%; stacking Crit DMG when dealing Incantation DMG.'),
  arc('Ready-Ready', 'S', 'Plasma', 570, 'Crit Rate 24%', 'ATK and Basic Attack DMG up; Tiger Talismans add Boss DMG.'),
  arc('Reality Refuge', 'S', 'Solid', 570, 'ATK 30%', 'Anima DMG up; Attachment DMG doubled after Ultimate.'),
  arc('Song of the Whale', 'S', 'Plasma', 512, 'ATK 27.5%', 'ATK and DMG vs Broken enemies up; heals on Broken kills.'),
  arc('Stellar Veil', 'S', 'Plasma', 512, 'ATK 27.5%', 'Psyche DMG up; Crit DMG stacks on Psyche hits.'),
  arc('Tears Beneath the Mask', 'S', 'Gas', 512, 'ATK 27.5%', 'Ultimate debuffs enemies, lowering their DMG.'),
  arc('The Last Rose', 'S', 'Liquid', 570, 'Crit Rate 24%', 'ATK up; Chaos Thorn stacks build Crit DMG from DoT.'),
  arc('The Rain That Shook the World', 'S', 'Solid', 512, 'Crit Rate 22%', 'Cosmos DMG up on Redirect Skill and Ultimate.'),
  arc('The Wrong Gate', 'S', 'Liquid', 570, 'ATK 30%', 'Anima DMG up; healing boosts allies’ DMG.'),
  arc('Voice of the Voyager', 'S', 'Plasma', 570, 'Crit Rate 24%', 'Support Skill Crit DMG up; stacks Ultimate Crit DMG.'),
  arc("What's Desired", 'S', 'Synthesis', 570, 'Crit Rate 24%', 'Lakshana DMG up; Crit DMG up after Redirect Skill or Ultimate.'),
  arc('Your Happiness is Priceless', 'S', 'Solid', 512, 'DEF 38.5%', 'HP up; random heal or shield after Ultimate.'),
  arc('Youthful Fantasy', 'S', 'Liquid', 570, 'ATK 30%', 'Break Intensity up; summons Black Tome for Chaos DMG.'),
  // A-rank
  arc('A Time Will Come', 'A', 'Synthesis', 475, 'Crit Rate 20%', 'ATK, DEF and HP up with 3+ different Esper types in the team.'),
  arc('Call of the Twisted City', 'A', 'Liquid', 395, 'HP 37.5%', 'Healing Bonus up for 10s after Redirect Skill.'),
  arc('Clear Skies', 'A', 'Liquid', 475, 'ATK 25%', 'Anima DMG up for Redirect Skill and Ultimate.'),
  arc('Cosmos Daze, Wild Reverie', 'A', 'Gas', 475, 'ATK 25%', 'DMG up for 10s after Support Skill.'),
  arc('Drawn Blade', 'A', 'Plasma', 395, 'ATK 37.5%', 'Extra Incantation DMG on Parry Attacks.'),
  arc('Failing You, Heavy in My Heart', 'A', 'Gas', 475, 'Break Intensity 120', 'Basic Attacks build stacks that raise team ATK.'),
  arc('Mind Royale', 'A', 'Liquid', 555, 'Break Intensity 60', 'Redirect Skill restores Ultimate Energy.'),
  arc('Oraora!', 'A', 'Plasma', 395, 'ATK 37.5%', 'Basic Attack DMG stacks per hit, up to 10.'),
  arc('Shiny Days', 'A', 'Liquid', 475, 'ATK 25%', 'Break Intensity and DMG vs Broken enemies up.'),
  arc("The Fools' Spring", 'A', 'Synthesis', 395, 'DEF 52.5%', 'ATK up while shielded.'),
  arc('The Forgotten', 'A', 'Solid', 475, 'HP 25%', 'ATK up above 50% HP; DEF up below it.'),
  arc('The Good, The Bad, The Bitter', 'A', 'Synthesis', 475, 'HP 25%', 'DEF up for 10s after taking damage.'),
  arc('The Great Thief', 'A', 'Synthesis', 475, 'Break Intensity 120', 'Break Intensity up for allies of the same Esper type.'),
  arc('Time Bandit', 'A', 'Solid', 475, 'HP 25%', 'Break Intensity up after Redirect Skill.'),
  arc('Umbrella', 'A', 'Synthesis', 395, 'DEF 52.5%', 'HP and shield strength up above 50% HP.'),
  arc('Watch Your Heads!', 'A', 'Gas', 475, 'Crit DMG 40%', 'ATK and Lakshana DMG up vs Remora or Stain targets.'),
  // B-rank
  arc('Be Happy', 'B', 'Gas', 316, 'HP 30%', 'Restores HP when defeating enemies.'),
  arc('Dangerous Game', 'B', 'Synthesis', 380, 'Break Intensity 96', 'Break Intensity up when reducing Break.'),
  arc('First Step to Success', 'B', 'Solid', 380, 'ATK 20%', 'ATK up for 10s after Redirect Skill.'),
  arc('Real Music', 'B', 'Liquid', 380, 'ATK 20%', 'Redirect Skill DMG up.'),
  arc('Us', 'B', 'Plasma', 380, 'ATK 20%', 'Basic Attack DMG up.'),
];

export const ARC_BY_ID = Object.fromEntries(ARCS.map((a) => [a.id, a]));

const RANK_ORDER = { S: 0, A: 1, B: 2 };

/** Arcs a character can equip: matching type, signature first, then by rank and ATK. */
export function arcsFor(character) {
  return ARCS.filter((a) => a.type === character.arcType).sort(
    (a, b) =>
      (b.signature === character.id) - (a.signature === character.id) ||
      RANK_ORDER[a.rarity] - RANK_ORDER[b.rarity] ||
      b.atk - a.atk ||
      a.name.localeCompare(b.name),
  );
}
