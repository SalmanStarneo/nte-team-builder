import { useEffect, useMemo, useReducer } from 'react';
import { CHARACTER_BY_ID, DATA_VERSION } from './data/characters.js';
import { analyzeTeam, usageInOtherTeams } from './lib/analyze.js';
import { navigate, useHashRoute, VIEWS } from './lib/route.js';
import { decodeTeam } from './lib/share.js';
import { loadState, saveState } from './lib/storage.js';
import { initialState, teamsReducer } from './lib/teamsReducer.js';
import Analysis from './components/Analysis.jsx';
import CharactersPage from './components/CharactersPage.jsx';
import GlossaryPage from './components/GlossaryPage.jsx';
import Portrait from './components/Portrait.jsx';
import Roster from './components/Roster.jsx';
import SharePanel from './components/SharePanel.jsx';
import TeamSlots from './components/TeamSlots.jsx';
import TeamTabs from './components/TeamTabs.jsx';

export default function App() {
  const [state, dispatch] = useReducer(teamsReducer, null, () => initialState(loadState()));
  const route = useHashRoute();
  const active = state.teams.find((t) => t.id === state.activeId);

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
      <header className="masthead">
        <div className="masthead__line" aria-hidden="true" />
        <div className="masthead__row">
          <h1 className="brand">
            <span className="brand__small">Neverness to Everness</span>
            Team Builder
          </h1>
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
        <p className="masthead__meta">
          Unofficial fan project · Game data v{DATA_VERSION} · Not affiliated with Hotta Studio
        </p>
      </header>

      {route.view === 'characters' && (
        <CharactersPage characterId={route.characterId} activeTeam={active} onAdd={addFromIndex} />
      )}

      {route.view === 'glossary' && <GlossaryPage />}

      {route.view === 'builder' && (
        <main className="layout">
          <div className="bench">
            <TeamTabs teams={state.teams} activeId={state.activeId} dispatch={dispatch} />

            {state.isExample && (
              <p className="banner">
                These two example teams are community archetypes. Edit them or add your own with “New team”.
              </p>
            )}

            <TeamSlots members={active.members} dispatch={dispatch} />

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

      <footer className="foot">
        Element reactions follow the Esper Cycle: each element reacts with its two neighbours.
        Game data is compiled from community sources and may lag behind patches.
        Neverness to Everness and all related content belong to Hotta Studio and Perfect World Games.
      </footer>
    </div>
  );
}
