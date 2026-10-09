// Recommended order to unlock Awakenings as duplicates come in (each duplicate
// unlocks one Awakening of your choice, in any order).
// Source (Oct 2026): Icy Veins "Guide and Best Builds" page for each character
// (https://www.icy-veins.com/neverness-to-everness/<name>-guide-best-builds),
// which ranks all six. Akane: only her first pick is ranked so far (Gurugamer,
// mone.gg). `alt`: a different order other guides or Icy Veins itself suggest
// for another playstyle.

const o = (order, why, alt = null) => ({ order, why, alt });

export const AWAKENING_ORDER = {
  adler: o(['A1', 'A6', 'A2', 'A5', 'A3', 'A4'], {
    A1: 'Max Karma right away, so his Skill hits hard straight after Ultimate.',
    A6: 'Longer shield that roughly matches his Skill cooldown.',
    A2: 'Big Skill damage boost; combos with A1.',
  }, 'Shield-focused: take A3, A6 and A4 first.'),
  aurelia: o(['A6', 'A1', 'A2', 'A5', 'A3', 'A4'], {
    A6: 'Doubles max Crescendo stacks and their bonus; her key breakpoint.',
    A1: 'Flat CRIT Rate while in Cadenza.',
    A2: 'Another reliable way into Cadenza.',
  }),
  baicang: o(['A1', 'A6', 'A2', 'A5', 'A3', 'A4'], {
    A1: 'More Skill damage during his Ultimate and a shorter Skill cooldown.',
    A6: 'CRIT Rate during his Ultimate.',
    A2: 'Strong ATK boost once A1 and A6 are in.',
  }),
  blackbird: o(['A1', 'A3', 'A6', 'A5', 'A4', 'A2'], {
    A1: 'Flames of Deliverance get +150% DMG; top pick for an attacker build.',
    A3: '+50% DMG on attacks that consume Malice.',
    A6: 'Psyche DMG and extra Malice.',
  }, 'Support build: A4 › A5 › A6 › A1 › A3 › A2.'),
  chaos: o(['A2', 'A6', 'A3', 'A1', 'A4', 'A5'], {
    A2: 'Strong DEF ignore; the best single pick.',
    A6: 'Fills Crime on Ultimate, so Final Verdict is ready at once.',
    A3: 'Big CRIT DMG boost after his Ultimate.',
  }, 'Against a single boss, take A5 before A4.'),
  chiz: o(['A6', 'A4', 'A5', 'A2', 'A1', 'A3'], {
    A6: 'More bonus Cosmos damage from Grain in her burst window.',
    A4: 'Faster Grain gain, so her Skill hits harder.',
    A5: 'Starts combat with full Grain.',
  }),
  daffodill: o(['A5', 'A3', 'A4', 'A2', 'A1', 'A6'], {
    A5: 'Extra Break DMG hits per Insight stack; her biggest gain.',
    A3: 'Insight stays on enemies, so more Break DMG lands.',
    A4: 'More Break DMG per Insight stack; pairs with A3.',
  }),
  edgar: o(['A3', 'A5', 'A6', 'A2', 'A1', 'A4'], {
    A3: 'More healing on badly injured allies.',
    A5: '+20% Max HP, which raises his healing.',
    A6: 'Adds a 15% DEF buff in his Ultimate area.',
  }),
  fadia: o(['A2', 'A3', 'A6', 'A5', 'A4', 'A1'], {
    A2: 'Destructive Experience deals even more damage.',
    A3: '+30% Max HP, which boosts her Skill and Ultimate damage.',
    A6: 'Destructive Experience on up to 10 targets.',
  }, 'Against bosses, A5 can go before A6.'),
  haniel: o(['A2', 'A6', 'A1', 'A3', 'A5', 'A4'], {
    A2: 'Longer Skill, so her ATK buff stays up longer.',
    A6: 'Shorter Skill cooldown; with A2 the buff gap drops to 4s.',
    A1: 'More Paranormal Cannon ricochets.',
  }),
  hathor: o(['A2', 'A1', 'A6', 'A5', 'A4', 'A3'], {
    A2: 'Express Delivery stacks build naturally; smoother rotation.',
    A1: 'Enters combat ready, so her Ultimate needs less setup.',
    A6: 'Big burst after her Ultimate plus 30% CRIT DMG.',
  }, 'If you often overcap stacks, take A1 first.'),
  hotori: o(['A6', 'A2', 'A1', 'A5', 'A3', 'A4'], {
    A6: 'Ignores 30% DEF during time stop; the standout.',
    A2: '+20% damage during time stop; great with A6.',
    A1: '+12% damage per recorded skill during time stop.',
  }),
  iroi: o(['A5', 'A1', 'A2', 'A3', 'A4', 'A6'], {
    A5: 'Her passive also buffs allies and ignores DEF.',
    A1: 'Builds Imagination off-field for more enhanced Ultimates.',
    A2: 'Extra off-field damage.',
  }, 'If the team keeps dying, take A3 first. Kaiden rates A2 highest.'),
  jiuyuan: o(['A2', 'A6', 'A1', 'A5', 'A3', 'A4'], {
    A2: 'More Lethal Rose Pact damage plus team healing.',
    A6: 'Large burst on every Skill cast.',
    A1: 'Best against large groups.',
  }),
  lacrimosa: o(['A6', 'A4', 'A1', 'A5', 'A3', 'A2'], {
    A6: 'Triggers Cycle reactions without needing Cycle energy.',
    A4: 'Doubles Nightmare duration, so about double its damage.',
    A1: 'More Nightmare damage; pairs with A4.',
  }, 'Without a Cycle-reaction team, A4 and A1 can beat A6.'),
  linko: o(['A5', 'A6', 'A1', 'A3', 'A4', 'A2'], {
    A5: 'Triggers Cycle effects with Incantation/Cosmos allies.',
    A6: 'CRIT Rate on Synced Strikes plus team Charge.',
    A1: 'Shorter gap between her off-field attacks.',
  }),
  mint: o(['A1', 'A5', 'A3', 'A2', 'A4', 'A6'], {
    A1: 'Resets her Skill cooldown.',
    A5: 'Raises her CRIT DMG.',
    A3: 'Good ATK boost with a Cosmos/Incantation ally.',
  }),
  nanally: o(['A6', 'A3', 'A5', 'A1', 'A2', 'A4'], {
    A6: "Ichi-daime's Authority lasts 3s longer; uptime is vital.",
    A3: 'Adds a follow-up attack; take with A5.',
    A5: 'Builds on A3’s follow-up attack.',
  }),
  sakiri: o(['A4', 'A5', 'A3', 'A2', 'A1', 'A6'], {
    A4: 'Doubles her Ultimate ATK buff.',
    A5: 'Restores Ultimate Energy, so the buff is up more.',
    A3: 'More Skill and Ultimate damage.',
  }),
  shinku: o(['A2', 'A3', 'A6', 'A1', 'A4', 'A5'], {
    A2: 'Best raw damage: Cosmos RES down after her Ultimate.',
    A3: 'Keeps Menacing Gaze stacks after swapping.',
    A6: 'Big buff to her Ultimate window.',
  }, 'For smoother play, take A5 (interrupt resistance) first.'),
  skia: o(['A6', 'A4', 'A1', 'A5', 'A2', 'A3'], {
    A6: 'Stronger Fang Thrust, his main gimmick.',
    A4: 'Doubles Tailed duration.',
    A1: 'Big boost to Fang Thrust auto-attacks.',
  }),
  zankou: o(['A5', 'A1', 'A2', 'A4', 'A6', 'A3'], {
    A5: 'Huge value in Break-focused teams.',
    A1: 'Keeps Delusion and Hunt up at all times.',
    A2: 'Builds Kindling faster via Cycle reactions.',
  }, 'If interrupts are a problem, take A3 earlier.'),
  zero: o(['A2', 'A3', 'A4', 'A5', 'A1', 'A6'], {
    A2: 'Extra Ultimate energy, so more Ultimates.',
    A3: 'Helps reach 100% CRIT Rate on the Ultimate.',
    A4: 'Raises Ultimate damage.',
  }),
  akane: o(['A1'], {
    A1: '12% CRIT Rate and a heal on Synced Resonance.',
  }),
};

export const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
