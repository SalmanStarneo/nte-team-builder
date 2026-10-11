// Community team archetypes (Mobalytics team guide, Sep 2026; Blackbird,
// Aurelia, Mint and Skia teams from Prydwen, Kaiden, Icy Veins and GameWith,
// Oct 2026). Loading one copies it into the team you're editing, with each
// member's recommended kit (see presetLoadouts).
import { CHARACTER_BY_ID } from './characters.js';
import { bestBuild } from './bestBuild.js';

export const PRESETS = [
  { name: 'Mono Blossom', members: ['nanally', 'jiuyuan', 'zero', 'hotori'] },
  { name: 'Chaos Charge', members: ['chaos', 'jiuyuan', 'zero', 'hathor'] },
  { name: 'Shinku Charge', members: ['shinku', 'iroi', 'zero', 'hathor'] },
  { name: 'Hyper Chiz', members: ['chiz', 'jiuyuan', 'hathor', 'hotori'] },
  { name: 'Hyper Nanally', members: ['nanally', 'sakiri', 'iroi', 'linko'] },
  { name: 'Lacrimosa Scorch DoT', members: ['lacrimosa', 'sakiri', 'adler', 'fadia'] },
  { name: 'Mono Scorch', members: ['baicang', 'sakiri', 'adler', 'daffodill'] },
  { name: 'Zankou Hexed', members: ['zankou', 'daffodill', 'sakiri', 'linko'] },
  { name: 'Mono Nova', members: ['lacrimosa', 'fadia', 'haniel', 'hotori'] },
  { name: 'Break Discord', members: ['fadia', 'daffodill', 'sakiri', 'hotori'] },
  { name: 'Hyper Hathor', members: ['hathor', 'haniel', 'daffodill', 'zero'] },
  { name: 'Blackbird Discord', members: ['blackbird', 'daffodill', 'sakiri', 'fadia'] },
  { name: 'Aurelia Nova', members: ['aurelia', 'daffodill', 'haniel', 'fadia'] },
  { name: 'Mint Hexed', members: ['mint', 'zero', 'sakiri', 'linko'] },
  { name: 'Skia Remora', members: ['skia', 'zero', 'nanally', 'haniel'] },
];

/**
 * Each member's recommended kit: signature (or top) Arc, recommended Cartridge
 * set with best-roll stats, and the suggested Console layout.
 */
export function presetLoadouts(members) {
  return Object.fromEntries(
    members.filter(Boolean).map((id) => {
      const c = CHARACTER_BY_ID[id];
      const b = c && bestBuild(c);
      return [id, b ? { arc: b.arc, arcDupes: 0, cartridge: b.cartridge, cartStats: b.cartStats, console: b.pieces } : {}];
    }),
  );
}
