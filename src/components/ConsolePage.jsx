import { useEffect, useMemo, useState } from 'react';
import { CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import { CARTRIDGES, CARTRIDGE_BY_ID } from '../data/gear.js';
import {
  CHARACTER_CONSOLE, CONSOLE_SIZE, FREE_CELLS, LAYOUT_NAMES, SET_SHAPES, SHAPES, SHAPE_ORDER,
  canPlace, charactersWithLayout, consoleStats, footprint, maskOf, occupancy, setProgress, specBonus, usedCells,
} from '../data/console.js';
import { navigate } from '../lib/route.js';
import { loadoutOf } from '../lib/teamsReducer.js';
import CartridgeIcon from './CartridgeIcon.jsx';
import CartStatsEditor from './CartStatsEditor.jsx';
import { suggestedBuild } from '../data/consoleBuilds.js';
import { loadSavedConsoles, storeSavedConsoles } from '../lib/consoles.js';
import { CARTRIDGE_SUB_SLOTS, MODULE_SUB_STATS, bonusStats, formatStat, isPercentStat, moduleRange } from '../data/gear.js';
import Portrait from './Portrait.jsx';

const TYPE_NAMES = { 2: 'Type Ⅱ', 3: 'Type Ⅲ', 4: 'Type Ⅳ' };
const PLAYABLE = CHARACTERS.filter((c) => CHARACTER_CONSOLE[c.id]);
const emptyStats = () => ({ main: null, subs: Array(CARTRIDGE_SUB_SLOTS).fill(null) });

// Small drawing of a module shape.
export function ShapeGlyph({ shape, size = 10, className = '' }) {
  const cells = SHAPES[shape].cells;
  const w = Math.max(...cells.map(([, c]) => c)) + 1;
  const h = Math.max(...cells.map(([r]) => r)) + 1;
  return (
    <svg
      className={`shape-glyph shape-glyph--t${SHAPES[shape].type} ${className}`}
      width={w * size}
      height={h * size}
      viewBox={`0 0 ${w * 10} ${h * 10}`}
      aria-hidden="true"
    >
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c * 10 + 0.8} y={r * 10 + 0.8} width="8.4" height="8.4" rx="1.6" />
      ))}
    </svg>
  );
}

export default function ConsolePage({ characterId, activeTeam, onEquip }) {
  const charId = CHARACTER_CONSOLE[characterId] ? characterId : PLAYABLE[0].id;
  const character = CHARACTER_BY_ID[charId];
  const { layout } = CHARACTER_CONSOLE[charId];
  const mask = useMemo(() => maskOf(layout), [layout]);

  const [pieces, setPieces] = useState([]);
  const [cartridge, setCartridge] = useState(null);
  const [selected, setSelected] = useState('Hen3');
  const [hover, setHover] = useState(null);
  const [saved, setSaved] = useState(loadSavedConsoles);
  const [cartStats, setCartStats] = useState(emptyStats);
  const [active, setActive] = useState(null); // index of the module being edited
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  const inTeam = activeTeam.members.includes(charId);

  // Switching character loads the console they wear in the current team, if any.
  useEffect(() => {
    const lo = inTeam ? loadoutOf(activeTeam, charId) : null;
    setPieces(lo?.console ?? []);
    setCartridge(lo?.cartridge ?? null);
    setCartStats(lo?.cartStats ?? emptyStats());
    setActive(null);
    setStatus('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charId]);

  useEffect(() => storeSavedConsoles(saved), [saved]);

  const suggested = suggestedBuild(charId);
  function applyBuild(b) {
    setActive(null);
    setPieces(b.pieces);
    setCartridge(b.cartridge);
    setCartStats(b.cartStats ?? emptyStats());
  }

  const occ = occupancy(pieces);
  const used = usedCells(pieces);
  const set = cartridge ? setProgress(cartridge, pieces) : null;
  const spec = specBonus(charId, pieces);
  const cart = cartridge && CARTRIDGE_BY_ID[cartridge];
  const counts = { 2: 0, 3: 0, 4: 0 };
  pieces.forEach((p) => { counts[SHAPES[p.shape].type] += 1; });

  // Place so the clicked cell is the shape's first cell.
  const origin = (shape, r, c) => {
    const [fr, fc] = SHAPES[shape].cells[0];
    return [r - fr, c - fc];
  };
  const preview = hover && selected && occ[hover[0]][hover[1]] === -1
    ? (() => {
        const [r0, c0] = origin(selected, hover[0], hover[1]);
        return { cells: footprint(selected, r0, c0), ok: canPlace(layout, pieces, selected, r0, c0) };
      })()
    : null;
  const previewSet = new Set(preview?.cells.map(([a, b]) => `${a},${b}`) ?? []);

  function clickCell(r, c) {
    if (!mask[r][c]) return;
    const at = occ[r][c];
    if (at !== -1) {
      setActive(at === active ? null : at);
      return;
    }
    if (!selected) return;
    const [r0, c0] = origin(selected, r, c);
    if (canPlace(layout, pieces, selected, r0, c0)) {
      setPieces([...pieces, { shape: selected, r: r0, c: c0 }]);
      setActive(null);
      setStatus('');
    } else {
      setStatus('That module doesn’t fit there.');
    }
  }

  // Edges between different pieces get a border, so each module reads as one block.
  function edgeClass(r, c) {
    const me = occ[r][c];
    if (me === -1) return '';
    const diff = (rr, cc) => rr < 0 || cc < 0 || rr >= CONSOLE_SIZE || cc >= CONSOLE_SIZE || occ[rr][cc] !== me;
    return [
      diff(r - 1, c) && 'e-t', diff(r, c + 1) && 'e-r', diff(r + 1, c) && 'e-b', diff(r, c - 1) && 'e-l',
    ].filter(Boolean).join(' ');
  }

  function save() {
    const label = name.trim() || `${character.name} console`;
    setSaved([{ id: `c${Date.now().toString(36)}`, name: label.slice(0, 40), layout, pieces, cartridge, cartStats }, ...saved]);
    setName('');
    setStatus(`Saved “${label}”.`);
  }

  function equip(targetId) {
    onEquip(targetId, { console: pieces, cartridge: cartridge ?? loadoutOf(activeTeam, targetId).cartridge, cartStats });
    setStatus(`Equipped on ${CHARACTER_BY_ID[targetId].name} in “${activeTeam.name}”.`);
  }

  const sameLayout = charactersWithLayout(layout);
  const teamTargets = activeTeam.members.filter((id) => id && sameLayout.includes(id));

  return (
    <div className="page console-page">
      <header className="page__head">
        <h2 className="page__title">Console</h2>
        <p className="muted">
          Pick a character, choose a Cartridge set and fill the grid with modules. Save layouts and equip
          them on any character with the same grid.
        </p>
      </header>

      <div className="console-chars" role="group" aria-label="Character">
        {PLAYABLE.map((c) => (
          <button
            key={c.id}
            type="button"
            className="console-char"
            aria-pressed={c.id === charId}
            onClick={() => navigate(`console-${c.id}`)}
            title={c.name}
          >
            <Portrait character={c} size="sm" />
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      <div className="console-layout">
        <section className="console-board" aria-label={`${character.name} console grid`}>
          <div className="console-board__head">
            <div>
              <h3 className="mini-title">{character.name} <span>{LAYOUT_NAMES[layout]} grid</span></h3>
              <p className="console-fill"><b>{used}</b> / {FREE_CELLS} cells</p>
            </div>
            <div className="console-board__actions">
              {suggested && (
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => {
                    applyBuild(suggested);
                    setStatus('Loaded the suggested build. Add your stat values below the set.');
                  }}
                >
                  Use suggested
                </button>
              )}
              <button type="button" className="btn btn--quiet" onClick={() => { setPieces([]); setActive(null); }} disabled={!pieces.length}>
                Clear
              </button>
            </div>
          </div>
          <div className="console-grid" onMouseLeave={() => setHover(null)}>
            {mask.map((row, r) =>
              row.map((free, c) => {
                const at = occ[r][c];
                const p = at !== -1 ? pieces[at] : null;
                const inPreview = previewSet.has(`${r},${c}`);
                const cls = [
                  'ccell',
                  !free && 'ccell--blocked',
                  p && `ccell--t${SHAPES[p.shape].type}`,
                  p && set?.perShape && p.shape in set.perShape && 'ccell--set',
                  inPreview && (preview.ok ? 'ccell--ok' : 'ccell--bad'),
                  at !== -1 && at === active && 'ccell--active',
                  p?.stats && 'ccell--has-stats',
                  edgeClass(r, c),
                ].filter(Boolean).join(' ');
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    className={cls}
                    disabled={!free}
                    onMouseEnter={() => setHover([r, c])}
                    onFocus={() => setHover([r, c])}
                    onClick={() => clickCell(r, c)}
                    aria-label={
                      !free ? 'Blocked cell'
                        : p ? `${TYPE_NAMES[SHAPES[p.shape].type]} module, edit stats`
                          : `Empty cell, row ${r + 1} column ${c + 1}`
                    }
                  />
                );
              }),
            )}
          </div>
          <p className="muted small">
            Tap a shape, then tap a cell to place it. Tap a placed module to enter its stats or remove it.
          </p>
          <p className="console-status" role="status" aria-live="polite">{status}</p>
          {active !== null && pieces[active] && (
            <ModuleEditor
              piece={pieces[active]}
              index={active}
              onChange={(next) => setPieces(pieces.map((p, i) => (i === active ? next : p)))}
              onRemove={() => {
                setPieces(pieces.filter((_, i) => i !== active));
                setActive(null);
              }}
              onClose={() => setActive(null)}
            />
          )}
        </section>

        <div className="console-side">
          <section aria-labelledby="console-shapes">
            <h3 id="console-shapes" className="mini-title">Modules</h3>
            {[2, 3, 4].map((type) => (
              <div key={type} className="shape-group">
                <span className="shape-group__label">{TYPE_NAMES[type]} <b>{counts[type]}</b></span>
                <div className="shape-row">
                  {SHAPE_ORDER.filter((s) => SHAPES[s].type === type).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={
                        'shape-btn' + (cartridge && SET_SHAPES[cartridge]?.includes(s) ? ' shape-btn--set' : '')
                      }
                      aria-pressed={selected === s}
                      onClick={() => setSelected(s)}
                      title={`${TYPE_NAMES[type]} · ${SHAPES[s].label}`}
                    >
                      <ShapeGlyph shape={s} size={9} />
                      <span className="sr-only">{`${TYPE_NAMES[type]} ${SHAPES[s].label}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="muted small">Shapes marked with a dot count toward the chosen Cartridge set.</p>
          </section>

          <section aria-labelledby="console-cart">
            <label id="console-cart" className="mini-title" htmlFor="console-cart-select">Cartridge set</label>
            <select
              id="console-cart-select"
              value={cartridge ?? ''}
              onChange={(e) => setCartridge(e.target.value || null)}
            >
              <option value="">No set</option>
              {CARTRIDGES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {cart && set && (
              <div className="console-set">
                <div className="console-set__head">
                  <CartridgeIcon id={cart.id} size={28} />
                  <b>{cart.name}</b>
                  <span className="console-set__count">{Math.min(set.count, 4)} / 4</span>
                </div>
                <div className="console-set__shapes">
                  {set.shapes.map((s) => (
                    <span key={s} className={set.perShape[s] ? 'need is-on' : 'need'}>
                      <ShapeGlyph shape={s} size={7} />
                      {set.perShape[s] > 0 && <b>×{set.perShape[s]}</b>}
                    </span>
                  ))}
                </div>
                <ul className="console-tiers">
                  <li className={set.two ? 'is-on' : undefined}><b>2</b> {cart.two}</li>
                  <li className={set.four ? 'is-on' : undefined}><b>4</b> {cart.four}</li>
                </ul>
              </div>
            )}
          </section>

          <section aria-labelledby="console-cstats">
            <h3 id="console-cstats" className="mini-title">Cartridge stats <span>1 main · {CARTRIDGE_SUB_SLOTS} sub</span></h3>
            <CartStatsEditor value={cartStats} onChange={setCartStats} idPrefix="ccs" />
            <p className="muted small">
              Enter the values shown on your Cartridge. They’re added to the Arc’s stats under Bonus stats on the
              team image.
            </p>
          </section>

          {spec && (
            <section aria-labelledby="console-spec">
              <h3 id="console-spec" className="mini-title">{character.name} bonus</h3>
              <p className="console-spec">
                +{spec.value}% {spec.stat} per {TYPE_NAMES[spec.type]} module
                <span className="console-spec__total">
                  {spec.count} equipped → <b>+{spec.total}% {spec.stat}</b>
                </span>
              </p>
            </section>
          )}

          <section aria-labelledby="console-totals">
            <h3 id="console-totals" className="mini-title">Console totals <span>modules, Cartridge, bonuses</span></h3>
            {(() => {
              const totals = bonusStats(null, cartStats, consoleStats(charId, pieces, cartridge));
              return totals.length ? (
                <ul className="console-totals">
                  {totals.map((t) => <li key={t.stat}>{formatStat(t.stat, t.value)}</li>)}
                </ul>
              ) : (
                <p className="muted small">Enter module and Cartridge stats to see the totals.</p>
              );
            })()}
          </section>

          <section aria-labelledby="console-save">
            <h3 id="console-save" className="mini-title">Save &amp; equip</h3>
            <div className="code-row">
              <label className="sr-only" htmlFor="console-name">Console name</label>
              <input
                id="console-name"
                className="code"
                placeholder={`${character.name} console`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button type="button" className="btn" onClick={save} disabled={!pieces.length}>Save</button>
            </div>
            {teamTargets.length > 0 ? (
              <div className="console-equip">
                <span className="muted small">Equip in “{activeTeam.name}” on:</span>
                {teamTargets.map((id) => (
                  <button key={id} type="button" className="arc-pick" onClick={() => equip(id)}>
                    <Portrait character={CHARACTER_BY_ID[id]} size="sm" />
                    {CHARACTER_BY_ID[id].name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted small">
                Add a character with this grid to your current team to equip it. Same grid:{' '}
                {sameLayout.map((id) => CHARACTER_BY_ID[id].name).join(', ')}.
              </p>
            )}
          </section>
        </div>
      </div>

      <section className="console-saved" aria-labelledby="console-saved-title">
        <h3 id="console-saved-title" className="mini-title">Saved consoles</h3>
        {saved.length === 0 ? (
          <p className="muted small">No saved consoles yet. They stay in this browser.</p>
        ) : (
          <ul className="saved-list">
            {saved.map((s) => {
              const fits = s.layout === layout;
              const sc = s.cartridge && CARTRIDGE_BY_ID[s.cartridge];
              return (
                <li key={s.id} className={fits ? 'saved-item' : 'saved-item is-other'}>
                  <MiniBoard layout={s.layout} pieces={s.pieces} />
                  <div className="saved-item__body">
                    <b>{s.name}</b>
                    <span className="muted small">
                      {usedCells(s.pieces)}/{FREE_CELLS} cells
                      {sc && <> · <CartridgeIcon id={sc.id} size={14} /> {sc.name} {Math.min(setProgress(sc.id, s.pieces).count, 4)}/4</>}
                    </span>
                    <span className="muted small">
                      Fits: {charactersWithLayout(s.layout).map((id) => CHARACTER_BY_ID[id].name).join(', ')}
                    </span>
                  </div>
                  <div className="saved-item__actions">
                    <button
                      type="button"
                      className="btn btn--quiet"
                      disabled={!fits}
                      title={fits ? 'Load into this grid' : `Doesn’t fit ${character.name}’s grid`}
                      onClick={() => {
                        applyBuild(s);
                        setStatus(`Loaded “${s.name}”.`);
                      }}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="btn btn--quiet"
                      onClick={() => setSaved(saved.filter((x) => x.id !== s.id))}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <p className="muted small">
        Grid layouts, module shapes and set requirements follow game data compiled by the Icy Veins
        Console Tool. Module stats aren’t tracked yet.
      </p>
    </div>
  );
}

// Read-only thumbnail of a console layout.
export function MiniBoard({ layout, pieces, cell = 9 }) {
  const mask = maskOf(layout);
  const occ = occupancy(pieces);
  return (
    <svg
      className="mini-board"
      width={CONSOLE_SIZE * cell}
      height={CONSOLE_SIZE * cell}
      viewBox={`0 0 ${CONSOLE_SIZE * 10} ${CONSOLE_SIZE * 10}`}
      aria-hidden="true"
    >
      {mask.map((row, r) =>
        row.map((free, c) => {
          const p = occ[r][c] !== -1 ? pieces[occ[r][c]] : null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * 10 + 0.6}
              y={r * 10 + 0.6}
              width="8.8"
              height="8.8"
              rx="1.5"
              className={!free ? 'mb-blocked' : p ? `mb-t${SHAPES[p.shape].type}` : 'mb-free'}
            />
          );
        }),
      )}
    </svg>
  );
}

// Stats of one placed module: 2 main (flat HP, flat ATK) and 4 sub attributes.
function ModuleEditor({ piece, index, onChange, onRemove, onClose }) {
  const st = piece.stats ?? { hp: 0, atk: 0, subs: [null, null, null, null] };
  const set = (patch) => onChange({ ...piece, stats: { ...st, ...patch } });
  const num = (kind, stat, raw) => {
    const [, max] = moduleRange(kind, stat);
    const n = Math.max(0, Math.min(max, Number(raw) || 0));
    return Math.round(n * 10) / 10;
  };
  const typeName = TYPE_NAMES[SHAPES[piece.shape].type];
  return (
    <div className="module-editor" role="group" aria-label={`Module ${index + 1} stats`}>
      <div className="module-editor__head">
        <ShapeGlyph shape={piece.shape} size={9} />
        <b>{typeName} module</b>
        <button type="button" className="btn btn--quiet" onClick={onRemove}>Remove</button>
        <button type="button" className="btn btn--quiet" onClick={onClose}>Done</button>
      </div>
      <div className="module-editor__mains">
        {[['hp', 'HP'], ['atk', 'ATK']].map(([key, label]) => {
          const [min, max] = moduleRange('main', label);
          return (
            <label key={key} className="cstat cstat--on">
              <span className="cstat__label">Main</span>
              <span>{label}</span>
              <input
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                placeholder={`${min}–${max}`}
                value={st[key] || ''}
                onChange={(e) => set({ [key]: num('main', label, e.target.value) })}
              />
            </label>
          );
        })}
      </div>
      <div className="module-editor__subs">
        {st.subs.map((sub, i) => {
          const [min, max] = sub ? moduleRange('sub', sub.stat) : [0, 0];
          const pct = sub && isPercentStat(sub.stat);
          return (
            <div key={i} className={sub ? 'cstat cstat--on' : 'cstat'}>
              <span className="cstat__label">Sub {i + 1}</span>
              <select
                aria-label={`Sub ${i + 1} stat`}
                value={sub?.stat ?? ''}
                onChange={(e) => {
                  const stat = e.target.value;
                  const next = stat ? { stat, value: stat === 'Cycle Intensity' ? 18 : sub?.value ?? 0 } : null;
                  set({ subs: st.subs.map((x, j) => (j === i ? next : x)) });
                }}
              >
                <option value="">—</option>
                {MODULE_SUB_STATS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <span className="cstat__value">
                <input
                  type="number"
                  inputMode="decimal"
                  aria-label={`Sub ${i + 1} value`}
                  min={min}
                  max={max}
                  step={pct ? '0.1' : '1'}
                  disabled={!sub}
                  placeholder={sub ? `${min}–${max}` : ''}
                  value={sub?.value || ''}
                  onChange={(e) => set({
                    subs: st.subs.map((x, j) => (j === i ? { ...x, value: num('sub', x.stat, e.target.value) } : x)),
                  })}
                />
                <span className="cstat__unit" aria-hidden="true">{pct ? '%' : ''}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="muted small">
        Typical rolls: main HP 100–1,200 and ATK 10–90; sub HP up to 500, ATK and DEF 10–90, Cycle Intensity 18,
        percentages 1.0–9.9%.
      </p>
    </div>
  );
}
