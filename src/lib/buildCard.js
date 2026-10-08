// Draws a shareable single-character build card, laid out like the game's
// Character Guide screen: portrait on the left, a header strip with the
// Console bonus, build stats / Arc / Cartridge panels, and a Console
// Development panel with current and recommended modules plus the grid.
import { ELEMENT_BY_ID } from '../data/elements.js';
import { ARC_BY_ID, RECOMMENDED, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, bonusStats, isPercentStat, moduleLevel } from '../data/gear.js';
import {
  CHARACTER_CONSOLE, CONSOLE_SIZE, SHAPES, consoleStats, maskOf, occupancy, setProgress,
} from '../data/console.js';
import { suggestedBuild, suggestedCartStats } from '../data/consoleBuilds.js';
import { MAX_STATS, MAX_STATS_LEVEL } from '../data/maxStats.js';
import { encodeConsoleCode } from './consoleCode.js';
import { loadoutOf } from './teamsReducer.js';
import {
  BODY, DISPLAY, EL, MONO, clipCard, drawRank, drawSilverFrame, ensureFonts, loadImage, roundRect, wrap,
} from './teamCard.js';

export const BUILD_W = 1600;
export const BUILD_H = 820;

// Charcoal panels and gold modules, like the in-game guide.
const K = {
  bg: '#121318',
  panel: 'rgba(29, 30, 36, 0.94)',
  inset: '#26272e',
  line: '#34353e',
  fg: '#eceef3',
  muted: '#9b9eab',
  pink: '#e8488c',
  pinkSoft: 'rgba(232, 72, 140, 0.18)',
  gold: '#f2c14e',
  goldDeep: '#c98a23',
  goldTile: '#3b3120',
};

const ROMAN = { 2: 'II', 3: 'III', 4: 'IV' };

// The game's names for stats: "ATK Bonus", "Chaos DMG Bonus"…
export function statLabel(stat) {
  const map = { 'ATK%': 'ATK Bonus', 'HP%': 'HP Bonus', 'DEF%': 'DEF Bonus', 'DMG%': 'DMG Bonus' };
  if (map[stat]) return map[stat];
  if (/ DMG%$/.test(stat)) return stat.replace(/%$/, ' Bonus');
  if (stat.endsWith('%')) return stat.slice(0, -1);
  return stat;
}
const statValue = (stat, value) => {
  const n = Number(value);
  const text = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `${text}${isPercentStat(stat) ? '%' : ''}`;
};

const specText = (spec) => {
  const stat = spec.stat.endsWith('DMG') && !spec.stat.startsWith('CRIT') ? `${spec.stat} Bonus` : spec.stat;
  return `Increases ${stat} by ${spec.value}% for each Type ${ROMAN[spec.type]} Module equipped.`;
};

/**
 * Collects what a build card shows for one character.
 * `current` (optional): { pieces, cartridge, cartStats, arc } from the Console page.
 * Otherwise the character's loadout in `team` is used, if they are in it.
 */
export function characterBuild(character, { team = null, current = null } = {}) {
  const inTeam = team?.members.includes(character.id);
  const lo = inTeam ? loadoutOf(team, character.id) : null;
  const recArcId = (RECOMMENDED[character.id] ?? [])[0];
  const arcId = current?.arc ?? lo?.arc ?? null;
  const arc = arcId ? ARC_BY_ID[arcId] : null;
  const pieces = current?.pieces ?? lo?.console ?? [];
  const cartridge = current?.cartridge ?? lo?.cartridge ?? null;
  const cartStats = current?.cartStats ?? lo?.cartStats ?? null;
  const rec = suggestedBuild(character.id, cartridge);
  return {
    character,
    source: current ? 'Console build' : inTeam ? `Team · ${team.name}` : 'Recommended build',
    arc: arc ?? (recArcId ? ARC_BY_ID[recArcId] : null),
    arcState: arc ? 'Equipped' : 'Recommended',
    arcDupes: lo?.arcDupes ?? null,
    cartridge: cartridge ?? rec?.cartridge ?? null,
    cartStats,
    pieces,
    recommended: rec,
    recStats: suggestedCartStats(character, cartridge ?? rec?.cartridge ?? null),
  };
}

function panel(ctx, x, y, w, h, title) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (title) {
    ctx.fillStyle = K.muted;
    ctx.font = `600 17px ${BODY}`;
    ctx.fillText(title, x + 18, y + 30);
  }
}

function goldCells(ctx, x, y, cells, size, gap) {
  for (const [r, c] of cells) {
    const cx = x + c * (size + gap);
    const cy = y + r * (size + gap);
    const g = ctx.createLinearGradient(cx, cy, cx + size, cy + size);
    g.addColorStop(0, '#ffe08a');
    g.addColorStop(1, K.goldDeep);
    ctx.fillStyle = g;
    roundRect(ctx, cx, cy, size, size, Math.max(2, size * 0.18));
    ctx.fill();
  }
}

// A module tile: dark gold square, the shape in gold, a pink level badge.
function moduleTile(ctx, x, y, size, shape, level) {
  ctx.fillStyle = K.goldTile;
  roundRect(ctx, x, y, size, size, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 193, 78, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const cells = SHAPES[shape].cells;
  const w = Math.max(...cells.map(([, c]) => c)) + 1;
  const h = Math.max(...cells.map(([r]) => r)) + 1;
  const cell = Math.min(13, Math.floor((size - 22) / Math.max(w, h)));
  const gap = 2;
  const gw = w * cell + (w - 1) * gap;
  const gh = h * cell + (h - 1) * gap;
  goldCells(ctx, x + (size - gw) / 2, y + (size - gh) / 2 + 4, cells, cell, gap);
  if (level != null) {
    ctx.font = `700 13px ${MONO}`;
    const t = String(level);
    const bw = ctx.measureText(t).width + 10;
    ctx.fillStyle = K.pink;
    roundRect(ctx, x + size - bw - 3, y - 7, bw, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(t, x + size - bw / 2 - 3, y + 6.5);
    ctx.textAlign = 'left';
  }
}

function cartTile(ctx, x, y, size, img) {
  const g = ctx.createRadialGradient(x + size / 2, y + size / 2, 4, x + size / 2, y + size / 2, size * 0.7);
  g.addColorStop(0, '#5a4422');
  g.addColorStop(1, K.goldTile);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 193, 78, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (img) ctx.drawImage(img, x + 8, y + 8, size - 16, size - 16);
}

// One "Current" / "Recommended" row. Returns the height used.
function moduleRow(ctx, x, y, w, label, cartId, pieces, cartImg) {
  ctx.fillStyle = K.muted;
  ctx.font = `600 16px ${BODY}`;
  ctx.fillText(label, x, y + 16);
  if (cartId) {
    const prog = setProgress(cartId, pieces);
    const name = `${CARTRIDGE_BY_ID[cartId].name} ×${Math.min(prog.count, 4)}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = prog.four ? K.gold : K.fg;
    ctx.font = `700 16px ${BODY}`;
    ctx.fillText(name, x + w, y + 16);
    ctx.textAlign = 'left';
  }
  const tile = 64;
  const gap = 10;
  const top = y + 34;
  cartTile(ctx, x, top, 72, cartImg);
  ctx.fillStyle = K.muted;
  ctx.font = `700 22px ${BODY}`;
  ctx.fillText('+', x + 82, top + 44);
  const startX = x + 106;
  const perRow = Math.max(1, Math.floor((w - 106 + gap) / (tile + gap)));
  if (!pieces.length) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 15px ${BODY}`;
    ctx.fillText('No modules placed', startX, top + 42);
    return 34 + 72;
  }
  pieces.forEach((p, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    moduleTile(ctx, startX + col * (tile + gap), top + 4 + row * (tile + gap + 6), tile, p.shape, p.stats ? moduleLevel(p.stats) : 20);
  });
  const rows = Math.ceil(pieces.length / perRow);
  return 34 + Math.max(72, rows * (tile + gap + 6) + 4);
}

// The 5x5 template: each module is one gold block, seams between modules,
// blocked cells left as faint outlines.
function consoleGrid(ctx, x, y, cell, layout, pieces) {
  const mask = maskOf(layout);
  const occ = occupancy(pieces);
  const gap = 5;
  const at = (r, c) => x + c * (cell + gap);
  const atY = (r) => y + r * (cell + gap);
  const same = (r, c, me) => r >= 0 && c >= 0 && r < CONSOLE_SIZE && c < CONSOLE_SIZE && occ[r][c] === me;
  for (let r = 0; r < CONSOLE_SIZE; r += 1) {
    for (let c = 0; c < CONSOLE_SIZE; c += 1) {
      const cx = at(r, c);
      const cy = atY(r);
      if (!mask[r][c]) {
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        roundRect(ctx, cx + 3, cy + 3, cell - 6, cell - 6, 5);
        ctx.stroke();
      } else if (occ[r][c] === -1) {
        ctx.fillStyle = K.inset;
        roundRect(ctx, cx, cy, cell, cell, 6);
        ctx.fill();
      }
    }
  }
  pieces.forEach((p, me) => {
    const cells = SHAPES[p.shape].cells.map(([a, b]) => [p.r + a, p.c + b]);
    const xs = cells.map(([, c]) => at(0, c));
    const ys = cells.map(([r]) => atY(r));
    const g = ctx.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs) + cell, Math.max(...ys) + cell);
    g.addColorStop(0, '#ffdf7e');
    g.addColorStop(1, '#d2952a');
    ctx.fillStyle = g;
    ctx.beginPath();
    for (const [r, c] of cells) {
      // Each cell, stretched over the gap toward neighbours of the same module.
      const l = same(r, c - 1, me) ? gap : 0;
      const t = same(r - 1, c, me) ? gap : 0;
      ctx.rect(at(r, c) - l, atY(r) - t, cell + l, cell + t);
    }
    ctx.fill();
    // Soft sheen ring on each cell, like the game's tiles.
    ctx.strokeStyle = 'rgba(255, 246, 214, 0.32)';
    ctx.lineWidth = 1.2;
    for (const [r, c] of cells) {
      ctx.beginPath();
      ctx.arc(at(r, c) + cell * 0.72, atY(r) + cell * 0.74, cell * 0.42, Math.PI, Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(120, 76, 10, 0.9)';
    ctx.lineWidth = 2;
    for (const [r, c] of cells) {
      const x0 = at(r, c) - (same(r, c - 1, me) ? gap : 0);
      const y0 = atY(r) - (same(r - 1, c, me) ? gap : 0);
      const x1 = at(r, c) + cell;
      const y1 = atY(r) + cell;
      ctx.beginPath();
      if (!same(r - 1, c, me)) { ctx.moveTo(x0, y0 + 1); ctx.lineTo(x1, y0 + 1); }
      if (!same(r + 1, c, me)) { ctx.moveTo(x0, y1 - 1); ctx.lineTo(x1, y1 - 1); }
      if (!same(r, c - 1, me)) { ctx.moveTo(x0 + 1, y0); ctx.lineTo(x0 + 1, y1); }
      if (!same(r, c + 1, me)) { ctx.moveTo(x1 - 1, y0); ctx.lineTo(x1 - 1, y1); }
      ctx.stroke();
    }
  });
  return CONSOLE_SIZE * cell + (CONSOLE_SIZE - 1) * gap;
}

function drawBackdrop(ctx) {
  ctx.fillStyle = K.bg;
  ctx.fillRect(0, 0, BUILD_W, BUILD_H);
  ctx.save();
  ctx.translate(BUILD_W / 2, BUILD_H / 2);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.translate(-BUILD_W / 2, -BUILD_H / 2);
  const bands = [{ y: -60, h: 190, a: 1 }, { y: 360, h: 130, a: 0.6 }, { y: 760, h: 180, a: 0.8 }];
  for (const b of bands) {
    ctx.globalAlpha = b.a;
    ctx.fillStyle = 'rgba(194, 24, 91, 0.2)';
    roundRect(ctx, -400, b.y, BUILD_W + 800, b.h, b.h / 2);
    ctx.fill();
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = 'rgba(232, 72, 140, 0.28)';
    ctx.lineWidth = 2;
    roundRect(ctx, -300, b.y + 24, BUILD_W + 600, b.h - 48, (b.h - 48) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

/** Renders the build card and returns the canvas. */
export async function renderBuildCard(build, { base = '/' } = {}) {
  await ensureFonts();
  const c = build.character;
  const el = ELEMENT_BY_ID[c.element];
  const info = CHARACTER_CONSOLE[c.id];
  const elColor = EL[c.element] ?? K.pink;
  const [portrait, elIcon, cartImg, recCartImg, arcImg] = await Promise.all([
    loadImage(`${base}characters/${c.id}.webp`),
    loadImage(`${base}icons/elements/${c.element}.webp`),
    build.cartridge ? loadImage(`${base}icons/cartridges/${build.cartridge}.webp`) : null,
    build.recommended ? loadImage(`${base}icons/cartridges/${build.recommended.cartridge}.webp`) : null,
    build.arc ? loadImage(`${base}icons/arc-types/${build.arc.type.toLowerCase()}.webp`) : null,
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = BUILD_W;
  canvas.height = BUILD_H;
  const ctx = canvas.getContext('2d');
  clipCard(ctx, BUILD_W, BUILD_H);
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
  ctx.fillStyle = K.fg;
  ctx.font = `italic 700 24px ${DISPLAY}`;
  const lvW = ctx.measureText(`LV. ${MAX_STATS_LEVEL}`).width + 14;
  let nameSize = 54;
  ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  while (nameSize > 30 && ctx.measureText(c.name.toUpperCase()).width > LW - lvW) {
    nameSize -= 2;
    ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  }
  ctx.fillText(c.name.toUpperCase(), px, ly);
  const nameW = ctx.measureText(c.name.toUpperCase()).width;
  ctx.font = `italic 700 24px ${DISPLAY}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(`LV. ${MAX_STATS_LEVEL}`, px + nameW + 14, ly);

  ly += 40;
  drawRank(ctx, c.rarity, px, ly - 8, 36);
  if (elIcon) ctx.drawImage(elIcon, px + 46, ly - 24, 32, 32);
  ctx.fillStyle = elColor;
  ctx.font = `700 19px ${BODY}`;
  ctx.fillText(el.name, px + 86, ly);
  ctx.fillStyle = K.muted;
  ctx.font = `500 18px ${BODY}`;
  ctx.fillText(` · ${c.roles.join(' / ')}`, px + 86 + ctx.measureText(el.name).width + 6, ly);

  ly += 36;
  ctx.font = `500 16px ${BODY}`;
  ctx.fillStyle = K.muted;
  const factionText = c.faction ? `${c.faction}${c.unit ? ` · ${c.unit}` : ''}` : c.formerFaction ? `Former ${c.formerFaction}` : '';
  for (const line of wrap(ctx, factionText, LW, 2)) {
    ctx.fillText(line, px, ly);
    ly += 22;
  }
  if (c.ability) {
    ctx.fillStyle = K.fg;
    ctx.font = `italic 500 16px ${BODY}`;
    for (const line of wrap(ctx, `Esper ability: ${c.ability}`, LW, 2)) {
      ctx.fillText(line, px, ly + 4);
      ly += 22;
    }
  }

  // ---- Header strip ----
  const RX = PAD + LW + 28;
  const RW = BUILD_W - RX - PAD;
  ctx.fillStyle = K.panel;
  roundRect(ctx, RX, PAD, RW, 84, 16);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Pink ring with the rank letter, like the guide header.
  ctx.beginPath();
  ctx.arc(RX + 50, PAD + 42, 30, 0, Math.PI * 2);
  ctx.fillStyle = K.pink;
  ctx.fill();
  drawRank(ctx, c.rarity, RX + 25, PAD + 42, 50);
  ctx.fillStyle = K.fg;
  ctx.font = `italic 800 30px ${DISPLAY}`;
  ctx.fillText('CONSOLE DEVELOPMENT', RX + 98, PAD + 38);
  ctx.font = `500 18px ${BODY}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(info ? specText(info.spec) : 'Console data not published yet.', RX + 98, PAD + 66);
  ctx.textAlign = 'right';
  ctx.font = `700 14px ${MONO}`;
  ctx.fillStyle = K.pink;
  ctx.fillText(build.source.toUpperCase(), RX + RW - 22, PAD + 36);
  ctx.textAlign = 'left';

  const top = PAD + 84 + 16;
  const bottom = BUILD_H - 74;
  const LCW = 500;
  const LCX = RX;
  const RCX = RX + LCW + 16;
  const RCW = RW - LCW - 16;

  // ---- Key attributes: Level 80 base (when known) plus what the build adds ----
  const extra = bonusStats(build.arc && build.arcState === 'Equipped' ? build.arc : null, build.cartStats,
    consoleStats(c.id, build.pieces, build.cartridge));
  const ms = MAX_STATS[c.id];
  let stats = extra;
  if (ms) {
    const take = (stat) => {
      const i = stats.findIndex((x) => x.stat === stat);
      if (i === -1) return 0;
      const [x] = stats.splice(i, 1);
      return x.value;
    };
    stats = [...extra];
    const elDmg = `${el.name} DMG%`;
    const round = (n) => Math.round(n * 100) / 100;
    stats = [
      { stat: 'HP', value: round(ms.hp + take('HP')) },
      { stat: 'ATK', value: round(ms.atk + take('ATK')) },
      { stat: 'DEF', value: round(ms.def + take('DEF')) },
      { stat: 'CRIT Rate', value: round(ms.critRate + take('CRIT Rate')) },
      { stat: 'CRIT DMG', value: round(ms.critDmg + take('CRIT DMG')) },
      { stat: elDmg, value: round((ms.dmg?.[c.element] ?? 0) + take(elDmg)) },
      { stat: 'Universal DMG%', value: round((ms.universal ?? 0) + take('Universal DMG%')) },
      ...stats,
    ];
  }
  const statsH = 214;
  panel(ctx, LCX, top, LCW, statsH, 'Key attributes');
  ctx.textAlign = 'right';
  ctx.fillStyle = K.muted;
  ctx.font = `500 14px ${BODY}`;
  ctx.fillText(ms ? `Lv ${MAX_STATS_LEVEL} base + build` : 'from this build', LCX + LCW - 18, top + 30);
  ctx.textAlign = 'left';
  if (!stats.length) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 16px ${BODY}`;
    ctx.fillText('No stat values entered yet.', LCX + 18, top + 70);
  } else {
    const colW = (LCW - 36 - 12) / 2;
    stats.slice(0, 10).forEach((st, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = LCX + 18 + col * (colW + 12);
      const sy = top + 46 + row * 32;
      ctx.fillStyle = K.inset;
      roundRect(ctx, sx, sy, colW, 26, 6);
      ctx.fill();
      ctx.font = `500 15px ${BODY}`;
      ctx.fillStyle = K.fg;
      // Drop "Bonus" when the full name doesn't fit beside the value.
      let label = statLabel(st.stat);
      if (ctx.measureText(label).width > colW - 84) label = label.replace(/ Bonus$/, '');
      label = wrap(ctx, label, colW - 84, 1)[0];
      ctx.fillText(label, sx + 10, sy + 18);
      ctx.textAlign = 'right';
      ctx.font = `600 15px ${MONO}`;
      const v = Number(st.value);
      ctx.fillText(isPercentStat(st.stat) ? statValue(st.stat, v) : v.toLocaleString('en-US'), sx + colW - 10, sy + 18);
      ctx.textAlign = 'left';
    });
  }

  // ---- Arc ----
  const arcY = top + statsH + 14;
  const arcH = 132;
  panel(ctx, LCX, arcY, LCW, arcH, 'Arc');
  if (build.arc) {
    const a = build.arc;
    if (arcImg) ctx.drawImage(arcImg, LCX + 18, arcY + 46, 64, 64);
    ctx.fillStyle = K.fg;
    ctx.font = `700 22px ${BODY}`;
    const nm = wrap(ctx, a.name, LCW - 230, 1)[0];
    ctx.fillText(nm, LCX + 96, arcY + 66);
    const tag = arcTag(a, c) === 'sig' ? 'Signature' : build.arcState;
    ctx.font = `700 13px ${MONO}`;
    const tw = ctx.measureText(tag.toUpperCase()).width + 16;
    ctx.fillStyle = tag === 'Signature' ? K.gold : K.pinkSoft;
    roundRect(ctx, LCX + LCW - tw - 18, arcY + 14, tw, 24, 12);
    ctx.fill();
    ctx.fillStyle = tag === 'Signature' ? '#1b1405' : K.pink;
    ctx.fillText(tag.toUpperCase(), LCX + LCW - tw - 10, arcY + 31);
    ctx.font = `500 16px ${BODY}`;
    ctx.fillStyle = K.muted;
    const dupes = build.arcDupes ? ` · +${build.arcDupes}` : '';
    ctx.fillText(`${a.rarity}-rank ${a.type}${dupes}`, LCX + 96, arcY + 90);
    ctx.fillStyle = K.fg;
    ctx.font = `600 16px ${MONO}`;
    ctx.fillText(`ATK ${a.atk}   ${a.sub}`, LCX + 96, arcY + 114);
  } else {
    ctx.fillStyle = K.muted;
    ctx.font = `500 16px ${BODY}`;
    ctx.fillText('No Arc chosen.', LCX + 18, arcY + 74);
  }

  // ---- Cartridge stats ----
  const cY = arcY + arcH + 14;
  const cH = bottom - cY;
  panel(ctx, LCX, cY, LCW, cH, 'Cartridge stats');
  const cs = build.cartStats;
  const rows = [
    cs?.main ? { k: 'Main', ...cs.main } : null,
    ...(cs?.subs ?? []).map((x) => (x ? { k: 'Sub', ...x } : null)),
  ].filter(Boolean);
  const list = rows.length ? rows : [
    { k: 'Main', ...build.recStats.main }, ...build.recStats.subs.map((x) => ({ k: 'Sub', ...x })),
  ];
  if (!rows.length) {
    ctx.textAlign = 'right';
    ctx.fillStyle = K.muted;
    ctx.font = `500 14px ${BODY}`;
    ctx.fillText('suggested priorities', LCX + LCW - 18, cY + 30);
    ctx.textAlign = 'left';
  }
  const rowH = Math.min(30, (cH - 50) / 5);
  list.slice(0, 5).forEach((r, i) => {
    const ry = cY + 44 + i * rowH;
    ctx.fillStyle = i === 0 ? 'rgba(242, 193, 78, 0.12)' : K.inset;
    roundRect(ctx, LCX + 18, ry, LCW - 36, rowH - 5, 6);
    ctx.fill();
    ctx.font = `700 12px ${MONO}`;
    ctx.fillStyle = i === 0 ? K.gold : K.muted;
    ctx.fillText(r.k.toUpperCase(), LCX + 30, ry + rowH / 2 + 2);
    ctx.font = `500 15px ${BODY}`;
    ctx.fillStyle = K.fg;
    ctx.fillText(statLabel(r.stat), LCX + 82, ry + rowH / 2 + 3);
    if (r.value) {
      ctx.textAlign = 'right';
      ctx.font = `600 15px ${MONO}`;
      ctx.fillText(statValue(r.stat, r.value), LCX + LCW - 30, ry + rowH / 2 + 3);
      ctx.textAlign = 'left';
    }
  });

  // ---- Console development ----
  panel(ctx, RCX, top, RCW, bottom - top, 'Console development');
  const innerX = RCX + 18;
  const innerW = RCW - 36;
  let y = top + 46;
  const hasCurrent = build.pieces.length > 0;
  if (hasCurrent) {
    y += moduleRow(ctx, innerX, y, innerW, 'Current', build.cartridge, build.pieces, cartImg) + 14;
  }
  if (build.recommended) {
    y += moduleRow(ctx, innerX, y, innerW, 'Recommended', build.recommended.cartridge, build.recommended.pieces, recCartImg) + 14;
  }

  // Attribute priorities + grid template.
  const gridPieces = hasCurrent ? build.pieces : build.recommended?.pieces ?? [];
  const avail = bottom - 18 - y;
  const cell = Math.max(24, Math.min(46, Math.floor((avail - 30 - 20) / 5)));
  const gridSize = cell * 5 + 20;
  const gx = RCX + RCW - 18 - gridSize;
  ctx.fillStyle = K.muted;
  ctx.font = `600 16px ${BODY}`;
  ctx.fillText('Recommended attributes & template', innerX, y + 16);
  if (info) consoleGrid(ctx, gx, y + 30, cell, info.layout, gridPieces);
  const recList = [build.recStats.main.stat, ...build.recStats.subs.map((s) => s.stat)];
  const lw = gx - innerX - 16;
  const lh = Math.min(38, (gridSize) / recList.length);
  recList.forEach((stat, i) => {
    const ry = y + 30 + i * lh;
    ctx.fillStyle = K.inset;
    roundRect(ctx, innerX, ry, lw, lh - 6, 8);
    ctx.fill();
    ctx.font = `700 11px ${MONO}`;
    ctx.fillStyle = i === 0 ? K.gold : K.muted;
    ctx.fillText(i === 0 ? 'MAIN' : `SUB ${i}`, innerX + 10, ry + (lh - 6) / 2 + 4);
    ctx.font = `500 15px ${BODY}`;
    ctx.fillStyle = K.fg;
    ctx.fillText(wrap(ctx, statLabel(stat), lw - 70, 1)[0], innerX + 62, ry + (lh - 6) / 2 + 5);
  });

  // ---- Footer: console code + legal line ----
  const code = info && (build.pieces.length || build.cartridge)
    ? encodeConsoleCode({ layout: info.layout, cartridge: build.cartridge, cartStats: build.cartStats, pieces: build.pieces })
    : '';
  ctx.font = `500 13px ${BODY}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(
    'Unofficial fan project · Neverness to Everness © Hotta Studio / Perfect World Games',
    PAD, BUILD_H - 30,
  );
  if (code) {
    ctx.textAlign = 'right';
    ctx.font = `700 20px ${MONO}`;
    ctx.fillStyle = K.fg;
    ctx.fillText(code, BUILD_W - PAD, BUILD_H - 28);
    const cw = ctx.measureText(code).width;
    ctx.font = `600 12px ${MONO}`;
    ctx.fillStyle = K.pink;
    ctx.fillText('CONSOLE CODE', BUILD_W - PAD - cw - 14, BUILD_H - 30);
    ctx.textAlign = 'left';
  }

  drawSilverFrame(ctx, BUILD_W, BUILD_H);
  return canvas;
}
