import { ARCS, ARC_BY_ID } from '../data/arcs.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { MAX_DUPES } from '../data/awakenings.js';
import { CARTRIDGES, MODULE_SLOTS, MODULE_STATS, MODULE_TYPES } from '../data/gear.js';
import { TEAM_SIZE } from './analyze.js';

// Card codes: the code printed on exported team cards, e.g.
//   700B-00C0-140B                 team, duplicates and Arcs
//   700B-00C0-140B-5GQ2-0000       ... plus Cartridges and Console modules
//
// HEAD (always 12 characters, 60 bits):
//   per member, 14 bits: character (6) · duplicates (3) · Arc (5)
//   then a 4-bit check value, so typos are caught.
//
// GEAR TAIL (only when some gear is set; groups of 4 characters):
//   5-bit check value, then for each filled team slot:
//     has Cartridge (1) · has modules (1)
//     Cartridge (5)                          if set
//     slot mask (4), then per filled slot:   module type (2) · main stat (4)
//   padded with zeros to a whole group.
//
// IMPORTANT: every list below is APPEND-ONLY. Codes refer to positions in
// them, so reordering or removing entries would break codes already shared.
// When the game adds a character, Arc, Cartridge or module stat, add it at the end.

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

const CART_ORDER = [
  'crimson-twin-butterflies', 'devils-blood-curse', 'diabolos', 'fireflies-and-the-forest',
  'kingdoms-guard', 'lost-radiance', 'quiet-manor', 'shadow-creed', 'speedy-hedgehog',
  'street-boxer', 'theas-night-tavern', 'tiny-big-adventure',
];

const MODULE_TYPE_ORDER = ['II', 'III', 'IV'];

const MODULE_STAT_ORDER = [
  'ATK %', 'ATK', 'Crit Rate', 'Crit DMG', 'Elemental DMG', 'Break Intensity',
  'HP %', 'HP', 'DEF %', 'DEF', 'Energy Regen',
];

// Crockford base 32: no I, L, O or U, so codes are easy to read and type.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const HEAD_SALT = 0x9; // change if a layout ever changes, so old and new codes can't be confused
const TAIL_SALT = 0x15;
const HEAD_CHARS = 12;
const GROUP = 4;

// Arcs a character can use, in stable order. Index 0 means "no Arc".
const arcsOfType = (type) => ARC_ORDER.filter((id) => ARC_BY_ID[id]?.type === type);

// ---- bit helpers ---------------------------------------------------------

class BitWriter {
  bits = [];
  write(value, width) {
    for (let i = width - 1; i >= 0; i -= 1) this.bits.push((value >> i) & 1);
  }
}

class BitReader {
  constructor(bits) {
    this.bits = bits;
    this.pos = 0;
  }
  read(width) {
    if (this.pos + width > this.bits.length) throw new Error('short');
    let v = 0;
    for (let i = 0; i < width; i += 1) v = (v << 1) | this.bits[this.pos++];
    return v;
  }
}

const toChars = (bits) => {
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    let v = 0;
    for (let k = 0; k < 5; k += 1) v = (v << 1) | (bits[i + k] ?? 0);
    out += ALPHABET[v];
  }
  return out;
};

const toBits = (chars) =>
  [...chars].flatMap((ch) => {
    const v = ALPHABET.indexOf(ch);
    return [4, 3, 2, 1, 0].map((i) => (v >> i) & 1);
  });

const group = (s) => s.match(new RegExp(`.{1,${GROUP}}`, 'g')).join('-');

// ---- head ----------------------------------------------------------------

function headCheck(value) {
  let sum = 0n;
  for (let i = 0n; i < 14n; i += 1n) sum += ((value >> (i * 4n)) & 15n) * (i + 1n);
  return Number(sum % 16n) ^ HEAD_SALT;
}

function encodeHead(team, loadoutOf) {
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
    value = (((((value << 6n) | BigInt(c)) << 3n) | BigInt(d)) << 5n) | BigInt(a);
  }
  value = (value << 4n) | BigInt(headCheck(value));
  let out = '';
  for (let i = 0; i < HEAD_CHARS; i += 1) {
    out = ALPHABET[Number(value & 31n)] + out;
    value >>= 5n;
  }
  return out;
}

function decodeHead(chars) {
  let value = 0n;
  for (const ch of chars) value = (value << 5n) | BigInt(ALPHABET.indexOf(ch));
  const sum = Number(value & 15n);
  value >>= 4n;
  if (headCheck(value) !== sum) return null;

  const members = [];
  const loadouts = {};
  for (let i = TEAM_SIZE - 1; i >= 0; i -= 1) {
    const a = Number(value & 31n);
    const d = Number((value >> 5n) & 7n);
    const c = Number((value >> 8n) & 63n);
    value >>= 14n;
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

// ---- gear tail -----------------------------------------------------------

// Ties the tail to its head, so a tail can't be pasted onto another team.
function tailCheck(head, bits) {
  let sum = 0;
  for (let i = 0; i < head.length; i += 1) sum += ALPHABET.indexOf(head[i]) * (i + 1);
  for (let i = 0; i < bits.length; i += 5) {
    let v = 0;
    for (let k = 0; k < 5; k += 1) v = (v << 1) | (bits[i + k] ?? 0);
    sum += v * (i / 5 + 7);
  }
  return (sum % 32) ^ TAIL_SALT;
}

function encodeTail(head, team, loadoutOf) {
  const w = new BitWriter();
  let anyGear = false;
  for (const id of team.members) {
    if (!id || !CHAR_ORDER.includes(id)) continue;
    const lo = loadoutOf(team, id);
    const cart = CART_ORDER.indexOf(lo.cartridge);
    const mods = (lo.modules ?? []).slice(0, MODULE_SLOTS).map((m) =>
      m && MODULE_TYPE_ORDER.includes(m.type) && MODULE_STAT_ORDER.includes(m.stat) ? m : null,
    );
    const hasCart = cart >= 0;
    const hasMods = mods.some(Boolean);
    anyGear ||= hasCart || hasMods;
    w.write(hasCart ? 1 : 0, 1);
    w.write(hasMods ? 1 : 0, 1);
    if (hasCart) w.write(cart, 5);
    if (hasMods) {
      mods.forEach((m) => w.write(m ? 1 : 0, 1));
      for (const m of mods) {
        if (!m) continue;
        w.write(MODULE_TYPE_ORDER.indexOf(m.type) + 1, 2);
        w.write(MODULE_STAT_ORDER.indexOf(m.stat), 4);
      }
    }
  }
  if (!anyGear) return '';
  const body = w.bits;
  // Pad so check (5 bits) + body fills whole groups.
  const total = Math.ceil((5 + body.length) / (5 * GROUP)) * 5 * GROUP;
  while (body.length < total - 5) body.push(0);
  const check = new BitWriter();
  check.write(tailCheck(head, body), 5);
  return toChars([...check.bits, ...body]);
}

function decodeTail(head, chars, base) {
  if (chars.length % GROUP !== 0) return null;
  const bits = toBits(chars);
  const body = bits.slice(5);
  const r = new BitReader(bits);
  if (r.read(5) !== tailCheck(head, body)) return null;
  try {
    for (const id of base.members) {
      if (!id) continue;
      const hasCart = r.read(1);
      const hasMods = r.read(1);
      if (hasCart) {
        const cart = CART_ORDER[r.read(5)];
        if (!cart) return null;
        base.loadouts[id].cartridge = cart;
      }
      if (hasMods) {
        const mask = [r.read(1), r.read(1), r.read(1), r.read(1)];
        base.loadouts[id].modules = mask.map((on) => {
          if (!on) return null;
          const type = MODULE_TYPE_ORDER[r.read(2) - 1];
          const stat = MODULE_STAT_ORDER[r.read(4)];
          if (!type || !stat) throw new Error('bad module');
          return { type, stat };
        });
      }
    }
  } catch {
    return null;
  }
  return base;
}

// ---- public API ----------------------------------------------------------

/** team + loadoutOf(team, id) → 'XXXX-XXXX-XXXX[-XXXX…]' */
export function encodeCardCode(team, loadoutOf) {
  const head = encodeHead(team, loadoutOf);
  return group(head + encodeTail(head, team, loadoutOf));
}

/** Returns { members, loadouts } or null if the code isn't a valid card code. */
export function decodeCardCode(input) {
  if (!input) return null;
  const clean = input
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');
  if (clean.length < HEAD_CHARS || [...clean].some((ch) => !ALPHABET.includes(ch))) return null;
  const head = clean.slice(0, HEAD_CHARS);
  const base = decodeHead(head);
  if (!base) return null;
  const tail = clean.slice(HEAD_CHARS);
  return tail ? decodeTail(head, tail, base) : base;
}

// Keep the code lists in step with the data during development.
if (import.meta.env.DEV) {
  const missing = [
    ...Object.keys(CHARACTER_BY_ID).filter((id) => !CHAR_ORDER.includes(id)),
    ...ARCS.map((a) => a.id).filter((id) => !ARC_ORDER.includes(id)),
    ...CARTRIDGES.map((c) => c.id).filter((id) => !CART_ORDER.includes(id)),
    ...MODULE_TYPES.map((t) => t.id).filter((id) => !MODULE_TYPE_ORDER.includes(id)),
    ...MODULE_STATS.filter((s) => !MODULE_STAT_ORDER.includes(s)),
  ];
  if (missing.length) console.warn('cardCode.js: add these to the end of the code lists:', missing);
}
