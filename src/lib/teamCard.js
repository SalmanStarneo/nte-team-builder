// Draws a shareable team card on a canvas. No libraries: plain Canvas 2D,
// so the image looks the same in every browser and works offline.
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { ARC_BY_ID, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import { loadoutOf } from './teamsReducer.js';
import { analyzeTeam } from './analyze.js';

export const CARD_W = 1200;
export const CARD_H = 675;

const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
const BODY = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

// The card always uses the dark look, like the game's UI.
const C = {
  bg: '#0e1119',
  panel: '#161a25',
  panel2: '#1f2432',
  line: '#2b3242',
  fg: '#e7eaf2',
  muted: '#9aa3b7',
  accent: '#8e9cff',
  sig: '#f3d03e',
};

// Bright element colours (same values as the --elb-* tokens).
const EL = {
  cosmos: '#e6eaf2',
  anima: '#3fd3ad',
  incantation: '#f0576b',
  chaos: '#ad93f7',
  psyche: '#4fbcf3',
  lakshana: '#f3d03e',
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Fits text to maxWidth, wrapping onto at most `lines` lines with an ellipsis.
function wrap(ctx, text, maxWidth, lines) {
  const words = text.split(' ');
  const out = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    let last = out[lines - 1];
    while (ctx.measureText(`${last}\u2026`).width > maxWidth && last.length) last = last.slice(0, -1);
    out[lines - 1] = `${last}\u2026`;
  }
  return out;
}

function pill(ctx, x, y, text, { bg, fg, font = `700 12px ${MONO}`, padX = 8, h = 22 }) {
  ctx.font = font;
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  return w;
}

async function ensureFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${DISPLAY}`),
      document.fonts.load(`600 20px ${BODY}`),
      document.fonts.load(`500 12px ${MONO}`),
    ]);
  } catch {
    /* fall back to system fonts */
  }
}

/**
 * Renders the team card and returns the canvas.
 * @param team   { name, members, loadouts }
 * @param base   URL prefix for /characters/<id>.webp
 * @param site   address printed in the footer
 */
export async function renderTeamCard(team, { base = '/', site = '' } = {}) {
  await ensureFonts();
  const members = team.members.map((id) => (id ? CHARACTER_BY_ID[id] : null));
  const images = await Promise.all(
    members.map((c) => (c ? loadImage(`${base}characters/${c.id}.webp`) : null)),
  );
  const analysis = analyzeTeam(team.members);

  const canvas = document.createElement('canvas');
  const scale = 2; // sharp on high-density screens
  canvas.width = CARD_W * scale;
  canvas.height = CARD_H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, '#121624');
  g.addColorStop(1, C.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Element stripe
  const order = ['cosmos', 'anima', 'incantation', 'chaos', 'psyche', 'lakshana'];
  order.forEach((el, i) => {
    ctx.fillStyle = EL[el];
    ctx.fillRect((CARD_W / 6) * i, 0, CARD_W / 6 + 1, 8);
  });

  // Header
  const PAD = 48;
  ctx.fillStyle = C.muted;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('NEVERNESS TO EVERNESS  \u00b7  TEAM BUILD', PAD, 52);
  ctx.fillStyle = C.fg;
  ctx.font = `800 58px ${DISPLAY}`;
  const title = wrap(ctx, (team.name || 'Untitled team').toUpperCase(), CARD_W - PAD * 2 - 300, 1)[0];
  ctx.fillText(title, PAD, 108);

  // Role counts, top right
  ctx.font = `600 15px ${BODY}`;
  let rx = CARD_W - PAD;
  for (const [role, n] of Object.entries(analysis.roleCounts).reverse()) {
    const text = `${n} ${role}`;
    ctx.font = `600 14px ${BODY}`;
    const w = ctx.measureText(text).width + 22;
    rx -= w;
    ctx.fillStyle = n ? C.panel2 : C.panel;
    roundRect(ctx, rx, 76, w, 30, 15);
    ctx.fill();
    ctx.fillStyle = n ? C.fg : C.muted;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rx + 11, 92);
    ctx.textBaseline = 'alphabetic';
    rx -= 8;
  }

  // Member cards
  const top = 136;
  const gap = 18;
  const cw = (CARD_W - PAD * 2 - gap * 3) / 4;
  const ch = 400;
  members.forEach((c, i) => {
    const x = PAD + i * (cw + gap);
    if (!c) {
      ctx.strokeStyle = C.line;
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      roundRect(ctx, x + 1, top + 1, cw - 2, ch - 2, 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.muted;
      ctx.font = `500 16px ${BODY}`;
      ctx.textAlign = 'center';
      ctx.fillText('Open slot', x + cw / 2, top + ch / 2);
      ctx.textAlign = 'left';
      return;
    }
    const el = EL[c.element];

    ctx.fillStyle = C.panel;
    roundRect(ctx, x, top, cw, ch, 14);
    ctx.fill();
    ctx.save();
    roundRect(ctx, x, top, cw, ch, 14);
    ctx.clip();
    ctx.fillStyle = el;
    ctx.fillRect(x, top, cw, 5);
    ctx.restore();

    // Portrait
    const cx = x + cw / 2;
    const cy = top + 86;
    const r = 58;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = C.panel2;
    ctx.fill();
    ctx.clip();
    if (images[i]) {
      ctx.drawImage(images[i], cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = C.fg;
      ctx.font = `800 44px ${DISPLAY}`;
      ctx.textAlign = 'center';
      ctx.fillText(c.name.slice(0, 1), cx, cy + 15);
      ctx.textAlign = 'left';
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = el;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Name and element
    ctx.textAlign = 'center';
    ctx.fillStyle = C.fg;
    ctx.font = `700 22px ${BODY}`;
    ctx.fillText(wrap(ctx, c.name, cw - 24, 1)[0], cx, top + 176);
    ctx.font = `500 13px ${MONO}`;
    ctx.fillStyle = el;
    ctx.fillText(`${ELEMENT_BY_ID[c.element].name.toUpperCase()}  \u00b7  ${c.rarity}`, cx, top + 199);
    ctx.fillStyle = C.muted;
    ctx.font = `500 14px ${BODY}`;
    ctx.fillText(c.roles.join(' \u00b7 '), cx, top + 220);
    ctx.textAlign = 'left';

    // Gear
    const gear = loadoutOf(team, c.id);
    const arc = gear.arc && ARC_BY_ID[gear.arc];
    const cart = gear.cartridge && CARTRIDGE_BY_ID[gear.cartridge];
    const gx = x + 16;
    const gw = cw - 32;
    let gy = top + 248;

    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 12);
    ctx.lineTo(gx + gw, gy - 12);
    ctx.stroke();

    const gearRow = (label, value, tag) => {
      ctx.fillStyle = C.muted;
      ctx.font = `500 11px ${MONO}`;
      ctx.fillText(label, gx, gy + 4);
      let lx = gx + ctx.measureText(label).width + 8;
      if (tag) {
        pill(ctx, lx, gy - 9, tag === 'sig' ? 'SIG' : 'REC', {
          bg: tag === 'sig' ? C.sig : '#2a3150',
          fg: tag === 'sig' ? '#1a1400' : C.accent,
          font: `700 10px ${MONO}`,
          padX: 6,
          h: 17,
        });
      }
      ctx.fillStyle = value ? C.fg : C.muted;
      ctx.font = `${value ? 600 : 400} 15px ${BODY}`;
      const lines = wrap(ctx, value || '\u2014', gw, 2);
      lines.forEach((ln, k) => ctx.fillText(ln, gx, gy + 24 + k * 19));
      gy += 30 + lines.length * 19;
    };
    gearRow('ARC', arc?.name, arc ? arcTag(arc, c) : null);
    gearRow('CARTRIDGE', cart?.name, cart && cartridgesFor(c).includes(cart.id) ? 'rec' : null);
  });

  // Reactions
  const ry = top + ch + 46;
  ctx.fillStyle = C.muted;
  ctx.font = `500 12px ${MONO}`;
  ctx.fillText('REACTIONS', PAD, ry);
  let px = PAD + 96;
  const chips = [
    ...analysis.trios.map((t) => ({ text: `${t.name} \u00b7 Trio`, trio: true, els: t.elements })),
    ...analysis.reactions.map((r) => ({ text: r.name, els: r.elements })),
  ];
  if (chips.length === 0) {
    ctx.fillStyle = C.muted;
    ctx.font = `400 15px ${BODY}`;
    ctx.fillText('No reactions yet', px, ry);
  }
  for (const chip of chips) {
    ctx.font = `600 15px ${BODY}`;
    const dots = chip.els.length * 12;
    const w = ctx.measureText(chip.text).width + 28 + dots;
    if (px + w > CARD_W - PAD) break;
    ctx.fillStyle = chip.trio ? '#262c4a' : C.panel2;
    roundRect(ctx, px, ry - 22, w, 32, 16);
    ctx.fill();
    chip.els.forEach((e, k) => {
      ctx.beginPath();
      ctx.arc(px + 16 + k * 12, ry - 6, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = EL[e];
      ctx.fill();
    });
    ctx.fillStyle = chip.trio ? C.accent : C.fg;
    ctx.fillText(chip.text, px + 14 + dots + 4, ry);
    px += w + 8;
  }

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = `400 12px ${BODY}`;
  ctx.fillText('Unofficial fan project. Neverness to Everness \u00a9 Hotta Studio / Perfect World Games.', PAD, CARD_H - 24);
  if (site) {
    ctx.font = `500 13px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = C.fg;
    ctx.fillText(site, CARD_W - PAD, CARD_H - 24);
    ctx.textAlign = 'left';
  }

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
