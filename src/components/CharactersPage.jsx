import { useMemo, useState } from 'react';
import { ARC_TYPES, CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENTS, ELEMENT_BY_ID, ROLES } from '../data/elements.js';
import { navigate } from '../lib/route.js';
import CharacterDetail from './CharacterDetail.jsx';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import RoleList from './RoleList.jsx';

const COLUMNS = [
  { id: 'name', label: 'Character', get: (c) => c.name },
  { id: 'element', label: 'Element', get: (c) => ELEMENTS.findIndex((e) => e.id === c.element) },
  { id: 'rarity', label: 'Rank', get: (c) => c.rarity },
  { id: 'role', label: 'Roles', get: (c) => c.roles.join(', ') },
  { id: 'arcType', label: 'Arc type', get: (c) => c.arcType },
  { id: 'hp', label: 'HP', get: (c) => c.stats?.hp, numeric: true },
  { id: 'atk', label: 'ATK', get: (c) => c.stats?.atk, numeric: true },
  { id: 'def', label: 'DEF', get: (c) => c.stats?.def, numeric: true },
];

function compare(a, b, col, dir) {
  const va = col.get(a);
  const vb = col.get(b);
  // Missing values always sort to the bottom.
  if (va == null && vb == null) return a.name.localeCompare(b.name);
  if (va == null) return 1;
  if (vb == null) return -1;
  const result = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
  return (result || a.name.localeCompare(b.name)) * dir;
}

export default function CharactersPage({ characterId, activeTeam, onAdd }) {
  const [query, setQuery] = useState('');
  const [element, setElement] = useState('all');
  const [role, setRole] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [arcType, setArcType] = useState('all');
  const [sort, setSort] = useState({ id: 'name', dir: 1 });

  const selected = characterId ? CHARACTER_BY_ID[characterId] : null;

  const rows = useMemo(() => {
    const col = COLUMNS.find((c) => c.id === sort.id);
    return CHARACTERS.filter((c) => {
      if (element !== 'all' && c.element !== element) return false;
      if (role !== 'all' && !c.roles.includes(role)) return false;
      if (rarity !== 'all' && c.rarity !== rarity) return false;
      if (arcType !== 'all' && c.arcType !== arcType) return false;
      if (query && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    }).sort((a, b) => compare(a, b, col, sort.dir));
  }, [query, element, role, rarity, arcType, sort]);

  function toggleSort(id) {
    const col = COLUMNS.find((c) => c.id === id);
    setSort((s) => (s.id === id ? { id, dir: -s.dir } : { id, dir: col.numeric ? -1 : 1 }));
  }

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Characters</h2>
        <p className="muted">
          {CHARACTERS.length} Espers. Select a character for details, reactions and featured teams.
        </p>
      </header>

      {selected && (
        <CharacterDetail
          character={selected}
          inActiveTeam={activeTeam.members.includes(selected.id)}
          teamFull={activeTeam.members.every(Boolean)}
          onAdd={() => onAdd(selected.id)}
          onClose={() => navigate('characters')}
        />
      )}

      <div className="filters filters--page">
        <div className="chips" role="group" aria-label="Filter by element">
          <button className="chip" aria-pressed={element === 'all'} onClick={() => setElement('all')}>All</button>
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
          <label className="sr-only" htmlFor="index-search">Search characters</label>
          <input
            id="index-search"
            className="search search--inline"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="select">
            <span>Role</span>
            <select id="index-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">Any</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="select">
            <span>Rank</span>
            <select id="index-rarity" value={rarity} onChange={(e) => setRarity(e.target.value)}>
              <option value="all">Any</option>
              <option value="S">S</option>
              <option value="A">A</option>
            </select>
          </label>
          <label className="select">
            <span>Arc</span>
            <select id="index-arc" value={arcType} onChange={(e) => setArcType(e.target.value)}>
              <option value="all">Any</option>
              {ARC_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="table-wrap">
        <table className="index-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={col.numeric ? 'num' : undefined}
                  aria-sort={sort.id === col.id ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                >
                  <button className="th-btn" onClick={() => toggleSort(col.id)}>
                    {col.label}
                    <span className="th-arrow" aria-hidden="true">
                      {sort.id === col.id ? (sort.dir === 1 ? '▲' : '▼') : ''}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className={c.id === characterId ? 'is-selected' : undefined}>
                <td>
                  <a className="row-link" href={`#character-${c.id}`}>
                    <Portrait character={c} size="sm" />
                    <span>{c.name}</span>
                    {c.upcoming && <span className="card__tag">Upcoming</span>}
                  </a>
                </td>
                <td>
                  <span className="cell-el">
                    <ElementGlyph element={c.element} size={13} />
                    {ELEMENT_BY_ID[c.element].name}
                  </span>
                </td>
                <td><RankBadge rank={c.rarity} size={22} /></td>
                <td><RoleList roles={c.roles} size={14} /></td>
                <td>{c.arcType ?? '—'}</td>
                <td className="num">{c.stats ? c.stats.hp.toLocaleString('en-US') : '—'}</td>
                <td className="num">{c.stats?.atk ?? '—'}</td>
                <td className="num">{c.stats?.def ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty">No characters match these filters.</p>}
      </div>
      <p className="muted small">Base stats at Level 1. “—” means the value hasn’t been published yet.</p>
    </div>
  );
}
