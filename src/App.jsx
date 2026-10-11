import { useEffect, useMemo, useReducer, useState } from 'react';
import { CHARACTER_BY_ID, DATA_VERSION } from './data/characters.js';
import { analyzeTeam, usageInOtherTeams } from './lib/analyze.js';
import { navigate, useHashRoute, VIEWS } from './lib/route.js';
import { SCALE_OPTIONS, useDisplayScale } from './lib/displayScale.js';
import { decodeTeam } from './lib/share.js';
import { loadState, saveState } from './lib/storage.js';
import { initialState, loadoutOf, teamsReducer } from './lib/teamsReducer.js';
import Analysis from './components/Analysis.jsx';
import ArcsPage from './components/ArcsPage.jsx';
import CharactersPage from './components/CharactersPage.jsx';
import ExportDialog from './components/ExportDialog.jsx';
import LoadoutPanel from './components/LoadoutPanel.jsx';
import GlossaryPage from './components/GlossaryPage.jsx';
import ConsolePage from './components/ConsolePage.jsx';
import Portrait from './components/Portrait.jsx';
import Roster from './components/Roster.jsx';
import SharePanel from './components/SharePanel.jsx';
import TeamSlots from './components/TeamSlots.jsx';
import TeamTabs from './components/TeamTabs.jsx';

// Cortado, the mascot: an anomaly that runs on coffee. Its headwear doubles as
// the lid over a hatch where coffee (or beans/powder and hot water) is poured
// in, and every hat carries its silver star. It usually floats; retractable
// wheels come out only when it's tired of floating or needs to dash. Its
// cream-and-brown striped tail stays out of sight from the front: the tip wraps
// into a handle at the back, used to carry it (or swing it in a fight).
// Clicking the mascot swaps its headwear.
const MASCOT_HATS = [
  { file: 'mascot.svg', label: 'Hard hat' },
  { file: 'mascot-beanie.svg', label: 'Knit beanie' },
  { file: 'mascot-beret.svg', label: 'Barista beret' },
  { file: 'mascot-lid.svg', label: 'Coffee cup lid' },
];
const HAT_KEY = 'nte-team-builder:mascotHat';
const loadHat = () => {
  try {
    const n = Number(localStorage.getItem(HAT_KEY));
    return Number.isInteger(n) && n >= 0 && n < MASCOT_HATS.length ? n : 0;
  } catch {
    return 0;
  }
};

export default function App() {
  const [hat, setHat] = useState(loadHat);
  const nextHat = () => {
    const n = (hat + 1) % MASCOT_HATS.length;
    setHat(n);
    try {
      localStorage.setItem(HAT_KEY, String(n));
    } catch {
      /* storage unavailable */
    }
  };
  const [state, dispatch] = useReducer(teamsReducer, null, () => initialState(loadState()));
  const route = useHashRoute();
  const display = useDisplayScale();
  const active = state.teams.find((t) => t.id === state.activeId);

  // Which team slot's loadout is open. Closes when switching teams.
  const [selectedSlot, setSelectedSlot] = useState(null);
  useEffect(() => setSelectedSlot(null), [state.activeId]);
  const [exporting, setExporting] = useState(false);
  const selectedChar = selectedSlot != null ? CHARACTER_BY_ID[active.members[selectedSlot]] : null;

  const analysis = useMemo(() => analyzeTeam(active.members), [active.members]);
  const usage = useMemo(() => usageInOtherTeams(state.teams, state.activeId), [state.teams, state.activeId]);

  useEffect(() => {
    saveState({ teams: state.teams, activeId: state.activeId });
  }, [state.teams, state.activeId]);

  // Opening a link ending in #nte1~... adds that team.
  useEffect(() => {
    const team = decodeTeam(window.location.hash);
    if (!team) return;
    dispatch({ type: 'import', ...team });
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  }, []);

  function addFromIndex(charId) {
    dispatch({ type: 'toggle', charId });
    navigate('builder');
  }

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <header className="masthead">
        <div className="masthead__line" aria-hidden="true" />
        <div className="masthead__row">
          <div className="brand-wrap">
            <button
              type="button"
              className="brand__mascot-btn"
              onClick={nextHat}
              title={`Cortado · ${MASCOT_HATS[hat].label} (click to swap headwear)`}
              aria-label={`Cortado, the site mascot, wearing a ${MASCOT_HATS[hat].label.toLowerCase()}. Swap headwear`}
            >
              <img
                src={`${import.meta.env.BASE_URL}${MASCOT_HATS[hat].file}`}
                alt=""
                className="brand__mascot"
                width="200"
                height="200"
              />
            </button>
            <h1 className="brand">
              <span className="brand__small">Neverness to Everness</span>
              Team Builder
            </h1>
          </div>
          <nav className="nav" aria-label="Sections">
            {VIEWS.map((v) => (
              <a
                key={v.id}
                href={`#${v.id}`}
                className="nav__link"
                aria-current={route.view === v.id ? 'page' : undefined}
              >
                {v.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="masthead__meta-row">
          <p className="masthead__meta">
            Unofficial fan project · Game data v{DATA_VERSION} · Not affiliated with Hotta Studio
          </p>
          <label className="display-size">
            <span>Display size</span>
            <select
              id="display-size"
              value={display.setting}
              onChange={(e) => display.setSetting(e.target.value)}
            >
              {SCALE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id === 'auto' ? `Auto (${Math.round(display.scale * 100)}%)` : o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {route.view === 'characters' && (
        <CharactersPage characterId={route.characterId} activeTeam={active} onAdd={addFromIndex} />
      )}

      {route.view === 'arcs' && <ArcsPage arcType={route.arcType} />}

      {route.view === 'console' && (
        <ConsolePage
          characterId={route.characterId}
          activeTeam={active}
          onEquip={(charId, patch) => dispatch({ type: 'setLoadout', charId, patch })}
        />
      )}

      {route.view === 'glossary' && <GlossaryPage />}

      {route.view === 'builder' && (
        <main className="layout">
          <div className="bench">
            <TeamTabs
              teams={state.teams}
              activeId={state.activeId}
              dispatch={dispatch}
              onExport={() => setExporting(true)}
            />

            {state.isExample && (
              <p className="banner">
                These two example teams are community archetypes. Edit them or add your own with “New team”.
              </p>
            )}

            <TeamSlots
              team={active}
              selected={selectedChar ? selectedSlot : null}
              onSelect={setSelectedSlot}
              dispatch={dispatch}
            />

            {selectedChar ? (
              <LoadoutPanel
                key={selectedChar.id}
                character={selectedChar}
                loadout={loadoutOf(active, selectedChar.id)}
                onChange={(patch) => dispatch({ type: 'setLoadout', charId: selectedChar.id, patch })}
                dispatch={dispatch}
                onClose={() => setSelectedSlot(null)}
              />
            ) : (
              active.members.some(Boolean) && (
                <p className="hint">Select a team member to equip an Arc, Cartridge set and Cartridge stats.</p>
              )
            )}

            <p className="notice" role="status" aria-live="polite">
              {state.notice}
            </p>

            <Analysis analysis={analysis} />
            <SharePanel team={active} dispatch={dispatch} />
          </div>

          <div className="side">
            <div className="mini" aria-hidden="true">
              <span className="mini__name">{active.name}</span>
              <span className="mini__slots">
                {active.members.map((id, i) =>
                  id ? (
                    <Portrait key={i} character={CHARACTER_BY_ID[id]} size="sm" />
                  ) : (
                    <span key={i} className="mini__empty" />
                  ),
                )}
              </span>
              <span className="mini__count">{analysis.reactions.length} reactions</span>
            </div>
            <Roster members={active.members} analysis={analysis} usage={usage} dispatch={dispatch} />
          </div>
        </main>
      )}

      {exporting && <ExportDialog team={active} onClose={() => setExporting(false)} />}

      <footer className="foot">
        Your teams are saved only in this browser on this device. Nobody else can see or change them.
        Element reactions follow the Esper Cycle: each element reacts with its two neighbours.
        Game data is compiled from community sources and may lag behind patches.
        Neverness to Everness and all related content belong to Hotta Studio and Perfect World Games.
      </footer>
    </div>
  );
}
