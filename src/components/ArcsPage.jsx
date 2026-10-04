import { useMemo, useState } from 'react';
import { ARCS, RECOMMENDED } from '../data/arcs.js';
import { ARC_TYPES, CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import Portrait from './Portrait.jsx';

const RANKS = ['S', 'A', 'B'];
const RANK_ORDER = { S: 0, A: 1, B: 2 };

// Who uses each Arc: its signature character and characters it's recommended for.
const RECOMMENDED_FOR = {};
for (const [cid, ids] of Object.entries(RECOMMENDED)) {
  for (const id of ids) (RECOMMENDED_FOR[id] ||= []).push(cid);
}

export default function ArcsPage({ arcType }) {
  const type = ARC_TYPES.map((t) => t.toLowerCase()).includes(arcType)
    ? ARC_TYPES.find((t) => t.toLowerCase() === arcType)
    : 'all';
  const [rank, setRank] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => Object.fromEntries(ARC_TYPES.map((t) => [t, ARCS.filter((a) => a.type === t).length])),
    [],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARCS.filter(
      (a) =>
        (type === 'all' || a.type === type) &&
        (rank === 'all' || a.rarity === rank) &&
        (!q || a.name.toLowerCase().includes(q) || a.passive.toLowerCase().includes(q)),
    ).sort((a, b) => RANK_ORDER[a.rarity] - RANK_ORDER[b.rarity] || b.atk - a.atk || a.name.localeCompare(b.name));
  }, [type, rank, query]);

  const wielders = type === 'all' ? [] : CHARACTERS.filter((c) => c.arcType === type);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Arcs</h2>
        <p className="muted">
          {ARCS.length} Arcs. A character can equip any Arc of their Arc type.
        </p>
      </header>

      <div className="type-tabs" role="tablist" aria-label="Arc type">
        <a className="type-tab" role="tab" aria-selected={type === 'all'} href="#arcs">
          All <span>{ARCS.length}</span>
        </a>
        {ARC_TYPES.map((t) => (
          <a
            key={t}
            className="type-tab"
            role="tab"
            aria-selected={type === t}
            href={`#arcs-${t.toLowerCase()}`}
          >
            {t} <span>{counts[t]}</span>
          </a>
        ))}
      </div>

      {type !== 'all' && (
        <div className="wielders">
          <span className="mini-title">{type} characters</span>
          <ul>
            {wielders.map((c) => (
              <li key={c.id}>
                <a href={`#character-${c.id}`} className="wielder">
                  <Portrait character={c} size="sm" />
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="filters filters--page filters--row">
        <label className="sr-only" htmlFor="arc-search">Search Arcs</label>
        <input
          id="arc-search"
          className="search search--inline"
          type="search"
          placeholder="Search name or effect"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by rank">
          <button className="chip" aria-pressed={rank === 'all'} onClick={() => setRank('all')}>Any rank</button>
          {RANKS.map((r) => (
            <button key={r} className="chip" aria-pressed={rank === r} onClick={() => setRank(rank === r ? 'all' : r)}>
              {r}-rank
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No Arcs match these filters.</p>
      ) : (
        <ul className="arc-grid">
          {list.map((a) => {
            const sig = a.signature && CHARACTER_BY_ID[a.signature];
            const recs = (RECOMMENDED_FOR[a.id] || []).filter((id) => id !== a.signature).map((id) => CHARACTER_BY_ID[id]);
            return (
              <li key={a.id} className="arc-card">
                <div className="arc-card__top">
                  <span className={`rank rank--${a.rarity}`}>{a.rarity}</span>
                  <h3 className="arc-card__name">{a.name}</h3>
                  {type === 'all' && <span className="arc-card__type">{a.type}</span>}
                </div>
                <dl className="gear-stats">
                  <div><dt>Base ATK</dt><dd>{a.atk}</dd></div>
                  <div><dt>Secondary</dt><dd>{a.sub}</dd></div>
                </dl>
                <p className="arc-card__passive">{a.passive}</p>
                {(sig || recs.length > 0) && (
                  <div className="arc-card__users">
                    {sig && (
                      <a href={`#character-${sig.id}`} className="arc-user" title={`Signature: ${sig.name}`}>
                        <span className="arc-tag arc-tag--sig">Sig</span>
                        <Portrait character={sig} size="sm" />
                        {sig.name}
                      </a>
                    )}
                    {recs.length > 0 && (
                      <span className="arc-user arc-user--recs">
                        <span className="arc-tag arc-tag--rec">Rec</span>
                        {recs.map((c) => (
                          <a key={c.id} href={`#character-${c.id}`} title={c.name}>
                            <Portrait character={c} size="sm" />
                          </a>
                        ))}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="muted small">Base ATK and secondary stats at max level. Effects are summaries; check in-game text for exact values.</p>
    </div>
  );
}
