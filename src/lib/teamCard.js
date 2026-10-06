// Draws a shareable team card on a canvas. No libraries: plain Canvas 2D,
// so the image looks the same in every browser and works offline.
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { ARC_BY_ID, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, bonusStats, cartridgesFor, isPercentStat } from '../data/gear.js';
import { loadoutOf } from './teamsReducer.js';
import { analyzeTeam } from './analyze.js';
import { activeResonance } from '../data/awakenings.js';
import { encodeCardCode } from './cardCode.js';

export const CARD_W = 1200;
export const CARD_H = 675;

const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
const BODY = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

// The card always uses the dark look, like the game's UI.
const C = {
  bg: '#0e1119',
  panel: 'rgba(22, 26, 37, 0.9)',
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

// Short module stat labels that fit a small tile.
const STAT_SHORT = {
  'HP%': 'HP%',
  'ATK%': 'ATK%',
  'DEF%': 'DEF%',
  HP: 'HP',
  ATK: 'ATK',
  DEF: 'DEF',
  'DMG%': 'DMG%',
  'CRIT Rate': 'CRIT RATE',
  'CRIT DMG': 'CRIT DMG',
  'Cycle Intensity': 'CYCLE INT.',
  'Break Intensity': 'BREAK INT.',
  'Healing%': 'HEALING%',
  'Cosmos DMG%': 'COSMOS DMG%',
  'Anima DMG%': 'ANIMA DMG%',
  'Incantation DMG%': 'INCANT. DMG%',
  'Chaos DMG%': 'CHAOS DMG%',
  'Psyche DMG%': 'PSYCHE DMG%',
  'Lakshana DMG%': 'LAKSH. DMG%',
  'Mental DMG%': 'MENTAL DMG%',
  'Charge Efficiency%': 'CHARGE EFF.',
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

// Rank badge matching RankBadge.jsx: dark disc, heavy italic gradient letter,
// white outline drawn under the fill.
const RANK_FONT = '"Inter", "Arial Black", "Segoe UI Black", sans-serif';
const RANK_GRADIENTS = {
  S: ['#ffe866', '#ff9d3a', '#ff3d8f'],
  A: ['#ff7ad9', '#e04cff', '#9c46ff'],
  B: ['#c35bff', '#7f7dff', '#47d9ff'],
};
function drawRank(ctx, rank, x, centerY, size) {
  const stops = RANK_GRADIENTS[rank] ?? ['#d7dbe4', '#a9b0bf', '#7d869a'];
  const r = size / 2;
  const cx = x + r;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, centerY, r, 0, Math.PI * 2);
  ctx.fillStyle = '#141826';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.stroke();
  const fs = size * 0.69;
  ctx.font = `italic 900 ${fs}px ${RANK_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const base = centerY + fs * 0.36;
  const g = ctx.createLinearGradient(cx - r * 0.3, centerY - r, cx + r * 0.3, centerY + r);
  g.addColorStop(0, stops[0]);
  g.addColorStop(0.5, stops[1]);
  g.addColorStop(1, stops[2]);
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.075;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText(rank, cx + 0.5, base);
  ctx.fillStyle = g;
  ctx.fillText(rank, cx + 0.5, base);
  ctx.restore();
}

// Tilted pink rounded bands with dashed inner tracks, matching the app's backdrop.
const BANDS = [
  { y: -40, x: -120, h: 170, a: 1 },
  { y: 150, x: -420, h: 110, a: 0.7 },
  { y: 310, x: -60, h: 190, a: 1 },
  { y: 500, x: -480, h: 120, a: 0.6 },
  { y: 660, x: -180, h: 160, a: 0.8 },
];
function drawBands(ctx) {
  ctx.save();
  ctx.translate(CARD_W / 2, CARD_H / 2);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.translate(-CARD_W / 2, -CARD_H / 2);
  for (const b of BANDS) {
    const w = CARD_W * 1.6;
    ctx.globalAlpha = b.a;
    ctx.fillStyle = 'rgba(194, 24, 91, 0.16)';
    roundRect(ctx, b.x, b.y, w, b.h, b.h / 2);
    ctx.fill();
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(232, 72, 140, 0.24)';
    const inset = 22;
    roundRect(ctx, b.x + 90, b.y + inset, w - 180, b.h - inset * 2, (b.h - inset * 2) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

async function ensureFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${DISPLAY}`),
      document.fonts.load(`600 20px ${BODY}`),
      document.fonts.load(`500 12px ${MONO}`),
      document.fonts.load(`italic 900 16px ${RANK_FONT}`),
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
  // Official element and role icons.
  const elementIds = [...new Set(members.filter(Boolean).map((c) => c.element))];
  const roleIds = [...new Set(members.filter(Boolean).flatMap((c) => c.roles))];
  const cartIds = [...new Set(members.filter(Boolean).map((c) => loadoutOf(team, c.id).cartridge).filter(Boolean))];
  const cartIcons = Object.fromEntries(
    await Promise.all(cartIds.map(async (id) => [id, await loadImage(`${base}icons/cartridges/${id}.webp`)])),
  );
  const [elIcons, roleIcons] = await Promise.all([
    Promise.all(elementIds.map((id) => loadImage(`${base}icons/elements/${id}.webp`))).then((l) =>
      Object.fromEntries(elementIds.map((id, i) => [id, l[i]])),
    ),
    Promise.all(roleIds.map((r) => loadImage(`${base}icons/roles/${r.toLowerCase()}.webp`))).then((l) =>
      Object.fromEntries(roleIds.map((r, i) => [r, l[i]])),
    ),
  ]);

  const canvas = document.createElement('canvas');
  const scale = 2; // sharp on high-density screens
  canvas.width = CARD_W * scale;
  canvas.height = CARD_H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  // Best resampling when portraits are scaled onto the card.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background
  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, '#121624');
  g.addColorStop(1, C.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  drawBands(ctx);

  // Element stripe: Charge trio on the left, Discord trio on the right
  const order = ['lakshana', 'cosmos', 'anima', 'incantation', 'chaos', 'psyche'];
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

    // Awakenings A1-A6 down the left edge, then R3 / R6 Resonance circles.
    const gearAw = loadoutOf(team, c.id);
    const onSet = new Set(gearAw.awakenings);
    const colX = x + 14;
    const pillW = 34;
    const pillH = 20;
    for (let k = 0; k < 6; k++) {
      const id = `A${k + 1}`;
      const on = onSet.has(id);
      const py = top + 18 + k * 24;
      ctx.fillStyle = on ? el : 'rgba(255, 255, 255, 0.06)';
      roundRect(ctx, colX, py, pillW, pillH, 6);
      ctx.fill();
      if (!on) {
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = on ? C.bg : C.muted;
      ctx.font = `700 11px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id, colX + pillW / 2, py + pillH / 2 + 1);
    }
    const reso = activeResonance(onSet.size);
    ['R3', 'R6'].forEach((id, k) => {
      const on = reso[id];
      const rcx = colX + pillW / 2;
      const rcy = top + 18 + 6 * 24 + 18 + k * 34;
      ctx.beginPath();
      ctx.arc(rcx, rcy, 14, 0, Math.PI * 2);
      ctx.fillStyle = on ? el : 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = on ? el : C.line;
      ctx.stroke();
      ctx.fillStyle = on ? C.bg : C.muted;
      ctx.font = `700 11px ${MONO}`;
      ctx.fillText(id, rcx, rcy + 1);
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Duplicate count, top-right corner
    if (gearAw.dupes) {
      const dText = `+${gearAw.dupes}`;
      ctx.font = `700 12px ${MONO}`;
      const dW = ctx.measureText(dText).width + 16;
      pill(ctx, x + cw - 12 - dW, top + 16, dText, { bg: C.panel2, fg: C.muted, font: `700 12px ${MONO}`, h: 22 });
    }

    // Name and element
    ctx.textAlign = 'center';
    ctx.fillStyle = C.fg;
    ctx.font = `700 22px ${BODY}`;
    ctx.fillText(wrap(ctx, c.name, cw - 24, 1)[0], cx, top + 176);
    ctx.font = `500 13px ${MONO}`;
    ctx.fillStyle = el;
    const elName = ELEMENT_BY_ID[c.element].name.toUpperCase();
    const elW = ctx.measureText(elName).width;
    ctx.textAlign = 'left';
    const elIcon = elIcons[c.element];
    const iconW = elIcon ? 24 : 0;
    const startX = cx - (iconW + elW + 32) / 2;
    if (elIcon) ctx.drawImage(elIcon, startX, top + 182, 20, 20);
    ctx.fillText(elName, startX + iconW, top + 199);
    drawRank(ctx, c.rarity, startX + iconW + elW + 8, top + 194, 24);

    // Roles, each with its icon, centred as one line
    ctx.font = `500 14px ${BODY}`;
    const ROLE_ICON = 16;
    const parts = c.roles.map((role) => ({ role, w: ROLE_ICON + 4 + ctx.measureText(role).width }));
    const sepW = ctx.measureText('  \u00b7  ').width;
    const total = parts.reduce((sum, p) => sum + p.w, 0) + sepW * (parts.length - 1);
    // Stay clear of the awakening column on the left edge.
    let rx2 = Math.max(cx - total / 2, x + 56);
    ctx.fillStyle = C.muted;
    parts.forEach((p, k) => {
      if (k > 0) {
        ctx.fillText('  \u00b7  ', rx2, top + 222);
        rx2 += sepW;
      }
      const icon = roleIcons[p.role];
      if (icon) ctx.drawImage(icon, rx2, top + 209, ROLE_ICON, ROLE_ICON);
      ctx.fillText(p.role, rx2 + ROLE_ICON + 4, top + 222);
      rx2 += p.w;
    });
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

    const bonus = bonusStats(arc, gear.cartStats);
    const hasBonus = bonus.length > 0;
    // With bonus stats shown, names stay on one line so the stats have room.
    const maxLines = hasBonus ? 1 : 2;

    const gearRow = (label, value, tag, extra, icon) => {
      ctx.fillStyle = C.muted;
      ctx.font = `500 11px ${MONO}`;
      ctx.fillText(label, gx, gy + 4);
      let lx = gx + ctx.measureText(label).width + 8;
      if (extra) {
        ctx.fillStyle = C.fg;
        ctx.fillText(extra, lx, gy + 4);
        lx += ctx.measureText(extra).width + 8;
      }
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
      const ICON = 20;
      const tx = icon ? gx + ICON + 6 : gx;
      if (icon) {
        ctx.save();
        roundRect(ctx, gx, gy + 10, ICON, ICON, 5);
        ctx.clip();
        ctx.drawImage(icon, gx, gy + 10, ICON, ICON);
        ctx.restore();
      }
      const lines = wrap(ctx, value || '\u2014', gw - (tx - gx), maxLines);
      lines.forEach((ln, k) => ctx.fillText(ln, tx, gy + 24 + k * 19));
      gy += 30 + lines.length * 19;
    };
    gearRow('ARC', arc?.name, arc ? arcTag(arc, c) : null, arc && gear.arcDupes ? `+${gear.arcDupes}` : null);
    gearRow('CARTRIDGE', cart?.name, cart && cartridgesFor(c).includes(cart.id) ? 'rec' : null, null, cart && cartIcons[cart.id]);

    // Bonus stats: Arc + Cartridge, two columns along the bottom of the panel.
    if (hasBonus) {
      // Sits right under the Cartridge row: label, then up to 4 rows x 2 columns.
      const rows = 4;
      const lineH = 13;
      const colW = (gw - 10) / 2;
      const by = gy + 8;
      ctx.fillStyle = C.muted;
      ctx.font = `500 11px ${MONO}`;
      ctx.fillText('BONUS STATS', gx, gy - 6);
      const shown = bonus.length > rows * 2 ? bonus.slice(0, rows * 2 - 1) : bonus;
      shown.forEach((b, k) => {
        const bx = gx + Math.floor(k / rows) * (colW + 10);
        const yy = by + (k % rows) * lineH;
        const v = Number.isInteger(b.value) ? String(b.value) : b.value.toFixed(2).replace(/0$/, '');
        const valText = `${v}${isPercentStat(b.stat) ? '%' : ''}`;
        ctx.font = `700 12px ${MONO}`;
        const vw = ctx.measureText(valText).width;
        ctx.fillStyle = C.muted;
        ctx.font = `500 11px ${MONO}`;
        ctx.fillText(wrap(ctx, STAT_SHORT[b.stat] ?? b.stat, colW - vw - 6, 1)[0], bx, yy);
        ctx.fillStyle = C.fg;
        ctx.font = `700 12px ${MONO}`;
        ctx.textAlign = 'right';
        ctx.fillText(valText, bx + colW, yy);
        ctx.textAlign = 'left';
      });
      if (shown.length < bonus.length) {
        ctx.fillStyle = C.muted;
        ctx.font = `500 11px ${MONO}`;
        ctx.fillText(`+${bonus.length - shown.length} more`, gx + colW + 10, by + (rows - 1) * lineH);
      }
    }
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

  // Footer: legal line on the left, card code on the right.
  // Long codes (full gear) move the legal line up and wrap onto two lines.
  const LEGAL = 'Unofficial fan project. Neverness to Everness \u00a9 Hotta Studio / Perfect World Games.';
  const code = encodeCardCode(team, loadoutOf);
  ctx.font = `400 12px ${BODY}`;
  const legalW = ctx.measureText(LEGAL).width;
  const labelW = 46;
  const fits = (text, size) => {
    ctx.font = `600 ${size}px ${MONO}`;
    return ctx.measureText(text).width;
  };
  const maxW = CARD_W - PAD * 2 - labelW;
  let codeSize = 20;
  let codeLines = [code];
  const sideBySide = PAD + legalW + 32 + labelW + fits(code, 20) <= CARD_W - PAD;
  if (!sideBySide) {
    codeSize = Math.max(15, Math.min(20, Math.floor((20 * maxW) / fits(code, 20))));
    if (fits(code, codeSize) > maxW) {
      // Two lines, split between groups.
      const groups = code.split('-');
      const half = Math.ceil(groups.length / 2);
      codeLines = [groups.slice(0, half).join('-') + '-', groups.slice(half).join('-')];
      codeSize = Math.max(13, Math.min(18, Math.floor((codeSize * maxW) / fits(codeLines[0], codeSize))));
    }
  }
  const lineGap = codeSize + 4;
  const codeTop = CARD_H - 22 - (codeLines.length - 1) * lineGap;
  ctx.fillStyle = C.muted;
  ctx.font = `400 12px ${BODY}`;
  ctx.fillText(LEGAL, PAD, sideBySide ? CARD_H - 24 : codeTop - codeSize - 10);
  // Card code: type it into the builder to rebuild this team and its gear.
  ctx.textAlign = 'right';
  ctx.font = `600 ${codeSize}px ${MONO}`;
  ctx.fillStyle = C.fg;
  codeLines.forEach((ln, i) => ctx.fillText(ln, CARD_W - PAD, codeTop + i * lineGap));
  const firstW = ctx.measureText(codeLines[0]).width;
  ctx.font = `500 11px ${MONO}`;
  ctx.fillStyle = C.muted;
  ctx.fillText('CODE', CARD_W - PAD - firstW - 12, codeTop - 2);
  if (site) {
    ctx.font = `500 12px ${MONO}`;
    ctx.fillText(site, CARD_W - PAD, CARD_H - 52);
  }
  ctx.textAlign = 'left';

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
