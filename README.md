# NTE Team Builder

A fan-made team builder for **Neverness to Everness**. Build as many 4-character teams as you like, see which Esper Cycle reactions each one triggers, and share teams with friends using a short code.

Not affiliated with Hotta Studio or Perfect World.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install     # downloads React and Vite into node_modules/
npm run dev     # starts the dev server, open the URL it prints
```

To open it on your phone while developing, run `npm run dev -- --host` and visit the "Network" URL from your phone on the same Wi-Fi.

`npm run build` creates a production version in `dist/`.

## Live site

Every push to `main` builds and publishes the app to GitHub Pages
(`.github/workflows/deploy.yml`):

**https://salmanstarneo.github.io/nte-team-builder/**

One-time setup: in the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## How the project is organised

```
src/
  data/
    elements.js     six elements in Esper Cycle order, reactions, roles
    characters.js   the roster: name, rank, element, role  <- update each patch
    presets.js      community team archetypes
  lib/
    analyze.js      works out reactions and warnings for a team (pure functions)
    teamsReducer.js every team change: add, rename, toggle member, delete...
    share.js        team code encode/decode (nte1~Name~id.id.id.id)
    storage.js      saves teams in the browser (localStorage)
  components/       React UI pieces (roster, slots, Esper Cycle diagram...)
  App.jsx           puts it all together
  styles.css        all styling, with light and dark themes
```

The rules of the game live in `data/` and `lib/`, separate from the UI. That's on purpose: you can change how the page looks without touching the logic, and test the logic without a browser.

## How reactions are worked out

The six elements sit on a ring: Cosmos, Anima, Incantation, Chaos, Psyche, Lakshana. Each element reacts with the two next to it:

| Pair | Reaction |
| --- | --- |
| Cosmos + Anima | Blossom |
| Anima + Incantation | Hexed |
| Incantation + Chaos | Scorch |
| Chaos + Psyche | Nova |
| Psyche + Lakshana | Stain |
| Lakshana + Cosmos | Remora |

Three neighbours in a row unlock a trio reaction: **Charge** (Lakshana, Cosmos, Anima) and **Discord** (Incantation, Chaos, Psyche).

This mapping was checked against 11 community team guides; every one gives the reactions those guides list. The Stain pair (Psyche + Lakshana) is the least directly sourced, so double-check it in-game.

## Updating for a new patch

Add the character to `src/data/characters.js`:

```js
{ id: 'newname', name: 'New Name', rarity: 'S', element: 'cosmos', role: 'Damage' },
```

Remove `upcoming: true` from a character once they're released.

## Ideas for what to build next

Good ways to practise, roughly from easiest to hardest:

1. **"Characters I own" filter**: a checkbox per character, saved in `storage.js`.
2. **Drag and drop**: drag roster cards into specific slots (try the HTML Drag and Drop API, then `@dnd-kit/core`).
3. **Endgame pair check**: pick two teams and warn if they share a character (`usageInOtherTeams` in `analyze.js` is a start).
4. **Stage weakness**: choose a stage's weak element and highlight teams that hit it.
5. **Tests**: add Vitest and test `analyzeTeam` and `decodeTeam`.
6. **Share links**: when hosted, a link ending in `#nte1~...` already loads that team. Add a "Copy link" button.
