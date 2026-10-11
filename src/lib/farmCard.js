// Draws a shareable "materials to farm" card for one character: everything
// needed to ascend them to Lv 80 and max their skills, grouped by where each
// material is farmed. Same look as the build card (charcoal panels, silver frame).
import { ELEMENT_BY_ID } from '../data/elements.js';
import { farmList } from '../data/farmList.js';
import { bestBuild } from '../data/bestBuild.js';
import { CARTRIDGE_BY_ID } from '../data/gear.js';
import { SET_SHAPES, SHAPES } from '../data/console.js';
import { materialIconUrl } from './icons.js';
import {
  BODY, DISPLAY, EL, MONO, clipCard, drawRank, drawSilverFrame, ensureFonts, loadImage, roundRect, wrap,
} from './teamCard.js';

export const FARM_W = 1600;
export const FARM_H = 920;

const K = {
  bg: '#121318',
  panel: 'rgba(29, 30, 36, 0.94)',
  inset: '#26272e',
  line: '#34353e',
  fg: '#eceef3',
  muted: '#9b9eab',
  pink: '#e8488c',
};

// Tile accent per material kind (tiers read low → high like the game's rarity colours).
const KIND = {
  tier1: '#6fbf73',
  tier2: '#4f9ee8',
  tier3: '#a46be8',
  boss: '#f2c14e',
  weekly: '#f28b4e',
  coins: '#c9a46a',
  life: '#e8488c',
};

const fmt = (n) => n.toLocaleString('en-US');
const short = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `${+(n / 1e3).toFixed(1)}K` : fmt(n));

function drawBackdrop(ctx) {
  ctx.fillStyle = K.bg;
  ctx.fillRect(0, 0, FARM_W, FARM_H);
  ctx.save();
  ctx.translate(FARM_W / 2, FARM_H / 2);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.translate(-FARM_W / 2, -FARM_H / 2);
  for (const b of [{ y: -60, h: 190, a: 1 }, { y: 380, h: 130, a: 0.6 }, { y: 800, h: 180, a: 0.8 }]) {
    ctx.globalAlpha = b.a;
    ctx.fillStyle = 'rgba(194, 24, 91, 0.2)';
    roundRect(ctx, -400, b.y, FARM_W + 800, b.h, b.h / 2);
    ctx.fill();
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = 'rgba(232, 72, 140, 0.28)';
    ctx.lineWidth = 2;
    roundRect(ctx, -300, b.y + 24, FARM_W + 600, b.h - 48, (b.h - 48) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function panel(ctx, x, y, w, h, title, where) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = K.fg;
  ctx.font = `700 18px ${BODY}`;
  ctx.fillText(title, x + 18, y + 32);
  const tw = ctx.measureText(title).width;
  ctx.fillStyle = K.muted;
  ctx.font = `500 14px ${BODY}`;
  // Beside the title when it fits, otherwise on its own line underneath.
  if (ctx.measureText(where).width <= w - tw - 48) {
    ctx.fillText(where, x + 18 + tw + 12, y + 32);
    return 0;
  }
  const [line] = wrap(ctx, where, w - 36, 1);
  ctx.fillText(line ?? '', x + 18, y + 52);
  return 12;
}

// One material: icon tile with its amount, name underneath.
function tile(ctx, x, y, size, item, img) {
  const accent = KIND[item.kind] ?? K.muted;
  ctx.fillStyle = K.inset;
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();
  const g = ctx.createLinearGradient(0, y + size * 0.55, 0, y + size);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `${accent}55`);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, size, size, 12);
  ctx.stroke();
  if (img) {
    const s = size * 0.74;
    ctx.drawImage(img, x + (size - s) / 2, y + (size - s) / 2 - 4, s, s);
  }
  // Amount badge
  if (item.badge === false) {
    ctx.fillStyle = K.fg;
    ctx.font = `600 14px ${BODY}`;
    ctx.textAlign = 'center';
    wrap(ctx, item.name, size + 22, 2).forEach((l, i) => ctx.fillText(l, x + size / 2, y + size + 22 + i * 18));
    ctx.textAlign = 'left';
    return;
  }
  const label = item.qty == null ? 'as needed' : `×${short(item.qty)}`;
  ctx.font = `800 ${item.qty == null ? 12 : 16}px ${MONO}`;
  const bw = ctx.measureText(label).width + 14;
  const bx = x + size - bw - 6;
  const by = y + size - 28;
  ctx.fillStyle = 'rgba(12,12,16,0.88)';
  roundRect(ctx, bx, by, bw, 22, 11);
  ctx.fill();
  ctx.fillStyle = item.qty == null ? K.muted : '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + 7, by + 12);
  ctx.textBaseline = 'alphabetic';
  // Name
  ctx.fillStyle = K.fg;
  ctx.font = `600 14px ${BODY}`;
  ctx.textAlign = 'center';
  wrap(ctx, item.name, size + 22, 2).forEach((l, i) => ctx.fillText(l, x + size / 2, y + size + 22 + i * 18));
  ctx.textAlign = 'left';
}

function group(ctx, x, y, w, h, g, imgs, size = 104) {
  const shift = panel(ctx, x, y, w, h, g.title, g.where);
  const n = g.items.length;
  const gap = Math.min(44, (w - 36 - n * size) / Math.max(1, n - 1));
  const startX = x + (w - (n * size + (n - 1) * gap)) / 2;
  // Tile plus a two-line name, centred in the space under the title.
  const top = y + 46 + shift;
  const startY = top + Math.max(6, (y + h - 12 - top - (size + 44)) / 2);
  g.items.forEach((item, i) => tile(ctx, startX + i * (size + gap), startY, size, item, imgs.get(item.name)));
}

const ROMAN = { 2: 'II', 3: 'III', 4: 'IV' };

function goldCells(ctx, x, y, cells, size, gap) {
  for (const [r, c] of cells) {
    const cx = x + c * (size + gap);
    const cy = y + r * (size + gap);
    const g = ctx.createLinearGradient(cx, cy, cx + size, cy + size);
    g.addColorStop(0, '#f8c27a');
    g.addColorStop(1, '#c46a2c');
    ctx.fillStyle = g;
    roundRect(ctx, cx, cy, size, size, Math.max(2, size * 0.18));
    ctx.fill();
  }
}

// The recommended Cartridge set and the modules to farm for it.
function consolePanel(ctx, x, y, w, h, build, cartImg) {
  const cart = CARTRIDGE_BY_ID[build.cartridge];
  panel(ctx, x, y, w, h, 'Console gear', 'Rabbit Hole');
  const size = 104;
  // Cartridge tile
  const cx = x + 24;
  const ty = y + 52;
  tile(ctx, cx, ty, size, { name: cart.name, qty: null, kind: 'boss', badge: false }, cartImg);
  const main = build.cartStats?.main?.stat;
  if (main) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 13px ${BODY}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Main: ${main}`, cx + size / 2, ty + size + 58);
    ctx.textAlign = 'left';
  }

  // Modules: one chip per shape with its count
  const counts = new Map();
  for (const p of build.pieces) counts.set(p.shape, (counts.get(p.shape) ?? 0) + 1);
  const setShapes = new Set(SET_SHAPES[build.cartridge] ?? []);
  const mx = cx + size + 34;
  const mw = x + w - 24 - mx;
  ctx.fillStyle = K.fg;
  ctx.font = `700 15px ${BODY}`;
  ctx.fillText(`${build.pieces.length} modules`, mx, ty + 14);
  ctx.fillStyle = K.muted;
  ctx.font = `500 13px ${BODY}`;
  ctx.fillText(`gold = counts for ${cart.name}`, mx + ctx.measureText(`${build.pieces.length} modules`).width + 40, ty + 14);
  const chipW = 64;
  const chipH = 62;
  const perRow = Math.max(1, Math.floor((mw + 10) / (chipW + 10)));
  [...counts].forEach(([shape, n], i) => {
    const sx = mx + (i % perRow) * (chipW + 10);
    const sy = ty + 28 + Math.floor(i / perRow) * (chipH + 8);
    const inSet = setShapes.has(shape);
    ctx.fillStyle = K.inset;
    roundRect(ctx, sx, sy, chipW, chipH, 10);
    ctx.fill();
    ctx.strokeStyle = inSet ? '#f2c14e' : K.line;
    ctx.lineWidth = inSet ? 2 : 1.5;
    ctx.stroke();
    const cells = SHAPES[shape].cells;
    const rows = Math.max(...cells.map((c) => c[0])) + 1;
    const cols = Math.max(...cells.map((c) => c[1])) + 1;
    const cs = Math.min(9, 30 / Math.max(rows, cols));
    const gw = cols * cs + (cols - 1) * 2;
    const gh = rows * cs + (rows - 1) * 2;
    goldCells(ctx, sx + 6 + (28 - gw) / 2, sy + 6 + (36 - gh) / 2, cells, cs, 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 15px ${MONO}`;
    ctx.fillText(`×${n}`, sx + 36, sy + 29);
    ctx.fillStyle = K.muted;
    ctx.font = `600 10px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText(`TYPE ${ROMAN[SHAPES[shape].type]}`, sx + chipW / 2, sy + chipH - 8);
    ctx.textAlign = 'left';
  });
  const chipRows = Math.ceil(counts.size / perRow);

  // Sub stats to look for
  const subs = [...new Set((build.pieces[0]?.stats?.subs ?? []).map((sub) => sub.stat))];
  if (subs.length) {
    ctx.fillStyle = K.muted;
    ctx.font = `600 13px ${BODY}`;
    const ly = ty + 28 + chipRows * (chipH + 8) + 16;
    ctx.fillText('Module sub stats to look for', mx, ly);
    ctx.fillStyle = K.fg;
    ctx.font = `600 14px ${BODY}`;
    wrap(ctx, subs.join(' · '), mw, 2).forEach((l, i) => ctx.fillText(l, mx, ly + 22 + i * 19));
  }
}

/** Renders the farm card and returns the canvas (null without material data). */
export async function renderFarmCard(character, { base = '/' } = {}) {
  const list = farmList(character.id);
  if (!list) return null;
  await ensureFonts();
  const c = character;
  const el = ELEMENT_BY_ID[c.element];
  const elColor = EL[c.element] ?? K.pink;

  const names = [...new Set(list.groups.flatMap((g) => g.items.map((i) => i.name)))];
  const [portrait, elIcon, ...icons] = await Promise.all([
    loadImage(`${base}characters/${c.id}.webp`),
    loadImage(`${base}icons/elements/${c.element}.webp`),
    ...names.map((n) => (materialIconUrl(n) ? loadImage(materialIconUrl(n)) : null)),
  ]);
  const imgs = new Map(names.map((n, i) => [n, icons[i]]));
  const build = bestBuild(c);
  const cartImg = build?.cartridge ? await loadImage(`${base}icons/cartridges/${build.cartridge}.webp`) : null;

  const canvas = document.createElement('canvas');
  canvas.width = FARM_W;
  canvas.height = FARM_H;
  const ctx = canvas.getContext('2d');
  clipCard(ctx, FARM_W, FARM_H);
  drawBackdrop(ctx);

  const PAD = 32;

  // ---- Left: portrait and identity ----
  const LW = 340;
  const px = PAD;
  const py = PAD;
  const glow = ctx.createRadialGradient(px + LW / 2, py + LW / 2, 20, px + LW / 2, py + LW / 2, LW * 0.75);
  glow.addColorStop(0, `${elColor}55`);
  glow.addColorStop(1, 'rgba(18,19,24,0)');
  ctx.fillStyle = '#1b1c22';
  roundRect(ctx, px, py, LW, LW, 22);
  ctx.fill();
  ctx.fillStyle = glow;
  roundRect(ctx, px, py, LW, LW, 22);
  ctx.fill();
  if (portrait) {
    ctx.save();
    roundRect(ctx, px, py, LW, LW, 22);
    ctx.clip();
    ctx.drawImage(portrait, px, py, LW, LW);
    ctx.restore();
  }
  ctx.strokeStyle = elColor;
  ctx.lineWidth = 3;
  roundRect(ctx, px, py, LW, LW, 22);
  ctx.stroke();

  let ly = py + LW + 58;
  let nameSize = 54;
  ctx.fillStyle = K.fg;
  ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  while (nameSize > 30 && ctx.measureText(c.name.toUpperCase()).width > LW) {
    nameSize -= 2;
    ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  }
  ctx.fillText(c.name.toUpperCase(), px, ly);

  ly += 40;
  drawRank(ctx, c.rarity, px, ly - 8, 36);
  if (elIcon) ctx.drawImage(elIcon, px + 46, ly - 24, 32, 32);
  ctx.fillStyle = elColor;
  ctx.font = `700 19px ${BODY}`;
  ctx.fillText(el.name, px + 86, ly);
  ctx.fillStyle = K.muted;
  ctx.font = `500 18px ${BODY}`;
  ctx.fillText(` · ${c.roles.join(' / ')}`, px + 86 + ctx.measureText(el.name).width + 6, ly);

  // What the totals cover
  ly += 44;
  ctx.fillStyle = K.panel;
  roundRect(ctx, px, ly - 26, LW, 150, 14);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = K.pink;
  ctx.font = `700 13px ${MONO}`;
  ctx.fillText('TOTALS COVER', px + 18, ly);
  ctx.fillStyle = K.fg;
  ctx.font = `500 16px ${BODY}`;
  const lines = ['Level cap 20 → 80 (6 ascensions)', '4 combat skills Lv 1 → 10', 'Both passives', 'Life skill Lv 1 → 5'];
  lines.forEach((t, i) => {
    ctx.fillStyle = K.pink;
    ctx.fillRect(px + 18, ly + 22 + i * 28 - 6, 6, 6);
    ctx.fillStyle = K.fg;
    ctx.fillText(t, px + 34, ly + 22 + i * 28);
  });

  // ---- Header strip ----
  const RX = PAD + LW + 28;
  const RW = FARM_W - RX - PAD;
  ctx.fillStyle = K.panel;
  roundRect(ctx, RX, PAD, RW, 84, 16);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = K.fg;
  ctx.font = `italic 800 40px ${DISPLAY}`;
  ctx.fillText('MATERIALS TO FARM', RX + 24, PAD + 55);
  const hw = ctx.measureText('MATERIALS TO FARM').width;
  ctx.fillStyle = K.muted;
  ctx.font = `500 17px ${BODY}`;
  ctx.fillText('Ascend to Lv 80 and max every skill', RX + 24 + hw + 20, PAD + 53);

  // ---- Groups ----
  const by = Object.fromEntries(list.groups.map((g) => [g.id, g]));
  const GAP = 20;
  const TOP = PAD + 84 + GAP;
  const ROW = 214;
  // Row 1: boss + weekly + EXP
  const w1 = 316;
  let x = RX;
  for (const id of ['boss', 'weekly']) {
    if (!by[id]) continue;
    group(ctx, x, TOP, w1, ROW, by[id], imgs);
    x += w1 + GAP;
  }
  group(ctx, x, TOP, RX + RW - x, ROW, by.exp, imgs);
  // Row 2: anomaly family + skill books
  const half = (RW - GAP) / 2;
  group(ctx, RX, TOP + ROW + GAP, half, ROW, by.family, imgs);
  group(ctx, RX + half + GAP, TOP + ROW + GAP, half, ROW, by.books, imgs);
  // Row 3: currency + console gear
  const r3 = TOP + 2 * (ROW + GAP);
  const ROW3 = 250;
  if (build?.cartridge) {
    group(ctx, RX, r3, half, ROW3, by.money, imgs);
    consolePanel(ctx, RX + half + GAP, r3, half, ROW3, build, cartImg);
  } else {
    group(ctx, RX, r3, RW, ROW3, by.money, imgs);
  }

  // ---- Footer ----
  ctx.font = `500 13px ${BODY}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(
    'Unofficial fan project · Neverness to Everness © Hotta Studio / Perfect World Games · Amounts may change with updates',
    PAD, FARM_H - 30,
  );

  drawSilverFrame(ctx, FARM_W, FARM_H);
  return canvas;
}
