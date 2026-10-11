// Draws a shareable "materials to farm" card for one character: everything
// needed to ascend them to Lv 80 and max their skills, grouped by where each
// material is farmed. Same look as the build card (charcoal panels, silver frame).
import { ELEMENT_BY_ID } from '../data/elements.js';
import { farmList } from '../data/farmList.js';
import { materialIconUrl } from './icons.js';
import {
  BODY, DISPLAY, EL, MONO, clipCard, drawRank, drawSilverFrame, ensureFonts, loadImage, roundRect, wrap,
} from './teamCard.js';

export const FARM_W = 1600;
export const FARM_H = 880;

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
  g.items.forEach((item, i) => tile(ctx, x + 18 + i * (size + gap), y + 52 + shift, size, item, imgs.get(item.name)));
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
  // Row 3: currency
  group(ctx, RX, TOP + 2 * (ROW + GAP), RW, ROW, by.money, imgs);

  // Exact coin total next to the currency tiles
  const coins = by.money.items.find((i) => i.name === 'Beetle Coin');
  if (coins) {
    const ry = TOP + 2 * (ROW + GAP);
    ctx.textAlign = 'right';
    ctx.fillStyle = K.muted;
    ctx.font = `600 14px ${MONO}`;
    ctx.fillText('BEETLE COIN TOTAL', RX + RW - 24, ry + 96);
    ctx.fillStyle = K.fg;
    ctx.font = `italic 800 44px ${DISPLAY}`;
    ctx.fillText(fmt(coins.qty), RX + RW - 24, ry + 142);
    ctx.fillStyle = K.muted;
    ctx.font = `500 13px ${BODY}`;
    ctx.fillText('Character EXP costs extra coin as you level', RX + RW - 24, ry + 168);
    ctx.textAlign = 'left';
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
