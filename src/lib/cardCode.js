import { ARCS, ARC_BY_ID } from '../data/arcs.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { MAX_DUPES } from '../data/awakenings.js';
import { TEAM_SIZE } from './analyze.js';

// Card codes: a short code printed on exported team cards, e.g. 1JHK-JJBN-2345.
// It stores the 4 characters, their duplicate count and their Arc.
//
// Layout (60 bits = 12 Crockford base-32 characters):
//   per member, 14 bits: character (6) · duplicates (3) · Arc (5)
//   then a 4-bit check value, so typos are caught.
//
// IMPORTANT: both lists below are APPEND-ONLY. Codes refer to positions in
// them, so reordering or removing entries would break codes already shared.
// When the game adds a character or Arc, add its id at the end.

const CHAR_ORDER = [
  'baicang', 'blackbird', 'chaos', 'chiz', 'daffodill', 'zero', 'fadia', 'hathor',
  'hotori', 'iroi', 'jiuyuan', 'lacrimosa', 'linko', 'nanally', 'sakiri', 'shinku',
  'zankou', 'akane', 'elyms', 'exe', 'adler', 'aurelia', 'edgar', 'haniel', 'mint', 'skia',
];

const ARC_ORDER = [
  'blow-up-the-crowd', 'blushing-mirage', 'camellia-society', 'contemplative-cat',
  'crime-and-punishment', 'day-off', 'eternal-waltz', 'far-side-of-the-moon',
  'fluff-of-fearlessness', 'fluff-of-ferocity', 'fluff-of-finesse', 'fluff-of-fleetness',
  'fluff-of-fortitude', 'good-boys-grand-adventure', 'hethereaus-keeper', 'marching-beyond-time',
  'raging-flames', 'ravenous-blade', 'ready-ready', 'reality-refuge', 'song-of-the-whale',
  'stellar-veil', 'tears-beneath-the-mask', 'the-last-rose', 'the-rain-that-shook-the-world',
  'the-wrong-gate', 'voice-of-the-voyager', 'whats-desired', 'your-happiness-is-priceless',
  'youthful-fantasy', 'a-time-will-come', 'call-of-the-twisted-city', 'clear-skies',
  'cosmos-daze-wild-reverie', 'drawn-blade', 'failing-you-heavy-in-my-heart', 'mind-royale',
  'oraora', 'shiny-days', 'the-fools-spring', 'the-forgotten', 'the-good-the-bad-the-bitter',
  'the-great-thief', 'time-bandit', 'umbrella', 'watch-your-heads', 'be-happy',
  'dangerous-game', 'first-step-to-success', 'real-music', 'us',
];

// Crockford base 32: no I, L, O or U, so codes are easy to read and type.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const SALT = 0x9; // changes if the layout ever does, so old and new codes can't be confused

const CHAR_BITS = 6n;
const DUPE_BITS = 3n;
const ARC_BITS = 5n;

// Arcs a character can use, in stable (append-only) order. Index 0 means "no Arc".
const arcsOfType = (type) => ARC_ORDER.filter((id) => ARC_BY_ID[id]?.type === type);

function check(value) {
  let sum = 0n;
  for (let i = 0n; i < 14n; i += 1n) sum += ((value >> (i * 4n)) & 15n) * (i + 1n);
  return Number(sum % 16n) ^ SALT;
}

/** team + loadoutOf(team, id) → 'XXXX-XXXX-XXXX' */
export function encodeCardCode(team, loadoutOf) {
  let value = 0n;
  for (let i = 0; i < TEAM_SIZE; i += 1) {
    const id = team.members[i];
    let c = 0, d = 0, a = 0;
    if (id && CHAR_ORDER.includes(id)) {
      const lo = loadoutOf(team, id);
      c = CHAR_ORDER.indexOf(id) + 1;
      d = Math.min(Math.max(lo.dupes | 0, 0), MAX_DUPES);
      const list = arcsOfType(CHARACTER_BY_ID[id].arcType);
      a = lo.arc ? list.indexOf(lo.arc) + 1 : 0;
    }
    value = (((((value << CHAR_BITS) | BigInt(c)) << DUPE_BITS) | BigInt(d)) << ARC_BITS) | BigInt(a);
  }
  value = (value << 4n) | BigInt(check(value));
  let out = '';
  for (let i = 0; i < 12; i += 1) {
    out = ALPHABET[Number(value & 31n)] + out;
    value >>= 5n;
  }
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8)}`;
}

/** Returns { members, loadouts } or null if the code isn't a valid card code. */
export function decodeCardCode(input) {
  if (!input) return null;
  const clean = input
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');
  if (clean.length !== 12) return null;

  let value = 0n;
  for (const ch of clean) {
    const n = ALPHABET.indexOf(ch);
    if (n < 0) return null;
    value = (value << 5n) | BigInt(n);
  }
  const sum = Number(value & 15n);
  value >>= 4n;
  if (check(value) !== sum) return null;

  const members = [];
  const loadouts = {};
  for (let i = TEAM_SIZE - 1; i >= 0; i -= 1) {
    const a = Number(value & 31n);
    const d = Number((value >> ARC_BITS) & 7n);
    const c = Number((value >> (ARC_BITS + DUPE_BITS)) & 63n);
    value >>= CHAR_BITS + DUPE_BITS + ARC_BITS;
    if (c === 0) {
      members[i] = null;
      continue;
    }
    const id = CHAR_ORDER[c - 1];
    if (!id || !CHARACTER_BY_ID[id] || members.includes(id) || d > MAX_DUPES) return null;
    const list = arcsOfType(CHARACTER_BY_ID[id].arcType);
    if (a > list.length) return null;
    members[i] = id;
    loadouts[id] = { dupes: d, arc: a ? list[a - 1] : null };
  }
  if (!members.some(Boolean)) return null;
  return { members, loadouts };
}

// Keep the code lists in step with the data during development.
if (import.meta.env.DEV) {
  const missingC = Object.keys(CHARACTER_BY_ID).filter((id) => !CHAR_ORDER.includes(id));
  const missingA = ARCS.map((a) => a.id).filter((id) => !ARC_ORDER.includes(id));
  if (missingC.length || missingA.length) {
    console.warn('cardCode.js: add these ids to the end of the code lists:', missingC, missingA);
  }
}
