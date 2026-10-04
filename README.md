# NTE Team Builder

An unofficial, fan-made team planner for **Neverness to Everness (NTE)**.

**Live app: https://salmanstarneo.github.io/nte-team-builder/**

Plan squads, browse every character, see which elemental reactions they trigger on the Esper Cycle, and share teams with a short code. Works in any modern browser on desktop and mobile, with no account or installation.

> NTE Team Builder is not affiliated with, endorsed by, or sponsored by Hotta Studio or Perfect World Games. See [Legal](#legal).

## Features

- **Multiple saved teams.** Create, rename, duplicate and delete as many four-character teams as you need. Characters already used in another team are flagged, which helps when planning two-team endgame content.
- **Loadouts.** Equip each team member with an Arc (filtered to their Arc type, signature Arcs marked), a Cartridge set with its 2- and 4-piece bonuses, and Console modules. Loadouts are saved per team.
- **Multi-role characters.** Characters list every role they cover, such as Hotori as Buff and Damage, and role coverage counts all of them.
- **Live synergy analysis.** An interactive Esper Cycle diagram highlights every pair and trio reaction the team can trigger, alongside role coverage and composition warnings.
- **Roster with smart hints.** Filter by element, role and rank. Each character card shows which new reactions it would add to the current team.
- **Community presets.** Load well-known team archetypes as a starting point.
- **Team codes.** Copy a compact code to share a team; paste a code to import one. Links ending in `#nte1~…` import the team automatically.
- **Character index.** A sortable, filterable table of every Esper with rank, element, role, Arc type and base stats. Each character has a detail view with faction, Esper ability, reactions and featured teams.
- **Arcs.** All Arcs with tabs for each Arc type (Solid, Liquid, Gas, Plasma, Condensate), rank filter, search, and the characters each Arc is the signature of or recommended for.
- **Glossary.** Searchable definitions of game terms, from the Esper Cycle and reactions to Arcs, the Console and endgame modes.
- **Light and dark themes**, following your system setting. Element colours match the in-game Esper Cycle.

## Reaction model

The six elements form a ring: Cosmos, Anima, Incantation, Chaos, Psyche and Lakshana. Each element reacts with its two neighbours:

| Elements | Reaction | Type |
| --- | --- | --- |
| Cosmos + Anima | Blossom | Amplify |
| Anima + Incantation | Hexed | Weaken |
| Incantation + Chaos | Scorch | Amplify |
| Chaos + Psyche | Nova | Control |
| Psyche + Lakshana | Stain | Weaken |
| Lakshana + Cosmos | Remora | Control |
| Lakshana + Cosmos + Anima | Charge | Trio |
| Incantation + Chaos + Psyche | Discord | Trio |

The model is validated against published community team compositions. Game data is compiled from public community sources and may lag behind new patches; corrections are welcome via [issues](https://github.com/SalmanStarneo/nte-team-builder/issues).

## Running locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev        # development server
npm run build      # production build in dist/
```

Use `npm run dev -- --host` to open the development server from a phone on the same network.

## Deployment

Every push to `main` is built and published to GitHub Pages by `.github/workflows/deploy.yml`.

## Project structure

```
src/
  data/          game data: elements, characters, Arcs, Cartridges, presets, glossary
  lib/           team analysis, state, routing, share codes, storage
  components/    React UI components
  App.jsx        application shell
  styles.css     styles and theme tokens
public/
  characters/    optional character portraits (see the README in that folder)
```

Game rules and data live in `src/data` and `src/lib`, independent of the UI.

### Updating the roster

Add or edit entries in `src/data/characters.js`:

```js
{ id: 'example', name: 'Example', rarity: 'S', element: 'cosmos', role: 'Damage' },
```

Characters marked `upcoming: true` appear only when the "Show upcoming" filter is enabled.

## Privacy

The app has no backend, accounts, analytics or tracking. Teams are stored only in your browser's local storage and never leave your device unless you share a team code yourself. Fonts are served by Google Fonts.

## Legal

**Unofficial fan project.** NTE Team Builder is a free, non-commercial fan project. It is not affiliated with, endorsed by, or sponsored by Hotta Studio, Perfect World Games or any of their affiliates.

**Trademarks and game content.** *Neverness to Everness*, *NTE*, and all related names, characters, artwork and other game content are trademarks or copyrighted material of their respective owners. They are referenced here for identification and informational purposes only, and all rights remain with their owners.

**Artwork.** Element symbols and placeholder portraits in this project are original. Any official artwork added to the project is used only where its publisher has made it available for free public or fan use, under that publisher's terms, and is not covered by this repository's license.

**No monetisation.** The project carries no advertising, paid features or donations and will not be monetised.

**Removal requests.** Rights holders who would like any content changed or removed can [open an issue](https://github.com/SalmanStarneo/nte-team-builder/issues). Requests will be handled promptly.

See [NOTICE.md](NOTICE.md) for full attribution.

## License

The source code is released under the [MIT License](LICENSE). The license covers this project's original code only; it grants no rights to third-party game content, trademarks or artwork.
