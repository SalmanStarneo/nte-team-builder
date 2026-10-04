import { useMemo, useState } from 'react';
import { CHARACTERS } from '../data/characters.js';
import { ELEMENTS, PAIR_REACTIONS, ROLES } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';

// Which new reactions a character would unlock if added to this team.
function unlocks(character, presentElements, activeReactionIds) {
  return PAIR_REACTIONS.filter(
    (r) =>
      r.elements.includes(character.element) &&
      !activeReactionIds.has(r.id) &&
      r.elements.some((e) => e !== character.element && presentElements.has(e)),
  );
}

export default function Roster({ members, analysis, usage, dispatch }) {
  const [query, setQuery] = useState('');
  const [element, setElement] = useState('all');
  const [role, setRole] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(false);

  const present = useMemo(() => new Set(Object.keys(analysis.elementCounts)), [analysis]);
  const activeIds = useMemo(() => new Set(analysis.reactions.map((r) => r.id)), [analysis]);
  const teamFull = members.every(Boolean);

  const list = CHARACTERS.filter((c) => {
    if (c.upcoming && !showUpcoming) return false;
    if (element !== 'all' && c.element !== element) return false;
    if (role !== 'all' && !c.roles.includes(role)) return false;
    if (rarity !== 'all' && c.rarity !== rarity) return false;
    if (query && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <section className="roster" aria-labelledby="roster-title">
      <div className="roster__head">
        <h2 id="roster-title" className="section-title">Roster</h2>
        <label className="sr-only" htmlFor="roster-search">Search characters</label>
        <input
          id="roster-search"
          className="search"
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filters">
        <div className="chips" role="group" aria-label="Filter by element">
          <button className="chip" aria-pressed={element === 'all'} onClick={() => setElement('all')}>
            All
          </button>
          {ELEMENTS.map((el) => (
            <button
              key={el.id}
              className="chip"
              aria-pressed={element === el.id}
              onClick={() => setElement(element === el.id ? 'all' : el.id)}
            >
              <ElementGlyph element={el.id} size={13} />
              {el.name}
            </button>
          ))}
        </div>
        <div className="filters__row">
          <label className="select">
            <span>Role</span>
            <select id="filter-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">Any</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="select">
            <span>Rank</span>
            <select id="filter-rarity" value={rarity} onChange={(e) => setRarity(e.target.value)}>
              <option value="all">Any</option>
              <option value="S">S</option>
              <option value="A">A</option>
            </select>
          </label>
          <label className="check">
            <input
              id="filter-upcoming"
              type="checkbox"
              checked={showUpcoming}
              onChange={(e) => setShowUpcoming(e.target.checked)}
            />
            Show upcoming
          </label>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No characters match these filters.</p>
      ) : (
        <ul className="grid">
          {list.map((c) => {
            const inTeam = members.includes(c.id);
            const others = usage[c.id];
            const gains = inTeam ? [] : unlocks(c, present, activeIds);
            return (
              <li key={c.id}>
                <button
                  className={`card${inTeam ? ' card--in' : ''}`}
                  aria-pressed={inTeam}
                  disabled={!inTeam && teamFull}
                  onClick={() => dispatch({ type: 'toggle', charId: c.id })}
                >
                  <Portrait character={c} />
                  <span className="card__body">
                    <span className="card__name">
                      {c.name}
                      <span className={`rank rank--${c.rarity}`}>{c.rarity}</span>
                    </span>
                    <span className="card__role">{c.roles.join(' · ')}</span>
                    {gains.length > 0 && (
                      <span className="card__gain">+ {gains.map((g) => g.name).join(', ')}</span>
                    )}
                    {c.upcoming && <span className="card__tag">Upcoming</span>}
                    {others && (
                      <span className="card__tag card__tag--used" title={`Also in ${others.join(', ')}`}>
                        In {others.join(', ')}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
