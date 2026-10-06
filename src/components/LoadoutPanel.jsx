import { ARC_BY_ID, arcTag, arcsFor } from '../data/arcs.js';
import CartridgeIcon from './CartridgeIcon.jsx';
import { CARTRIDGES, CARTRIDGE_BY_ID, MODULE_STATS, MODULE_TYPES, cartridgesFor } from '../data/gear.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import { AWAKENINGS, MAX_ARC_DUPES, MAX_DUPES } from '../data/awakenings.js';
import ResonanceBadges from './ResonanceBadges.jsx';

// Gear editor for one team member: Arc, Cartridge set and Console modules.
export default function LoadoutPanel({ character: c, loadout, onChange, onClose, dispatch }) {
  const awakenings = AWAKENINGS[c.id];
  const arcs = arcsFor(c);
  const arc = loadout.arc && ARC_BY_ID[loadout.arc];
  const cart = loadout.cartridge && CARTRIDGE_BY_ID[loadout.cartridge];
  const TAG_LABEL = { sig: 'Signature', rec: 'Recommended' };
  const picks = arcs.filter((a) => arcTag(a, c));
  const others = arcs.filter((a) => !arcTag(a, c));
  const ranks = ['S', 'A', 'B'].filter((r) => others.some((a) => a.rarity === r));
  const arcOption = (a) => {
    const tag = arcTag(a, c);
    return (
      <option key={a.id} value={a.id}>
        {a.name}
        {tag ? ` (${tag === 'sig' ? 'Sig' : 'Rec'})` : ''} · {a.rarity} · {a.atk} ATK
      </option>
    );
  };
  const arcTagNow = arc ? arcTag(arc, c) : null;
  const recSets = cartridgesFor(c);
  const otherSets = CARTRIDGES.filter((s) => !recSets.includes(s.id));
  const cartIsRec = cart && recSets.includes(cart.id);

  function setModule(i, patch) {
    const modules = loadout.modules.map((m, j) => {
      if (j !== i) return m;
      const next = { type: 'II', stat: 'ATK%', ...m, ...patch };
      return next.type ? next : null;
    });
    onChange({ modules });
  }

  return (
    <section
      className="loadout"
      style={{ '--el': ELEMENT_BY_ID[c.element].color }}
      aria-labelledby="loadout-title"
    >
      <header className="loadout__head">
        <Portrait character={c} size="md" />
        <div>
          <p className="eyebrow">Loadout</p>
          <h2 id="loadout-title" className="loadout__name">{c.name}</h2>
        </div>
        <button className="btn btn--quiet loadout__close" onClick={onClose} aria-label="Close loadout">
          Done
        </button>
      </header>

      <div className="loadout__grid">
        {/* Duplicates and awakenings */}
        <div className="gear-block gear-block--wide">
          <div className="awaken-head">
            <label className="mini-title" htmlFor="gear-dupes">
              Duplicates <span>{loadout.awakenings.length}/{loadout.dupes} awakenings on</span>
            </label>
            <div className="stepper" role="group" aria-label="Duplicate copies">
              {Array.from({ length: MAX_DUPES + 1 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  className="stepper__btn"
                  aria-pressed={loadout.dupes === n}
                  title={n === 0 ? 'No duplicates: one copy' : `${n} duplicate${n > 1 ? 's' : ''}`}
                  onClick={() => dispatch({ type: 'setDupes', charId: c.id, dupes: n })}
                >
                  {n === 0 ? '0' : `+${n}`}
                </button>
              ))}
            </div>
          </div>
          {awakenings ? (
            <ul className="awaken-pick">
              {awakenings.map((w) => {
                const on = loadout.awakenings.includes(w.id);
                const full = !on && loadout.awakenings.length >= loadout.dupes;
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      className={`awaken-btn${on ? ' is-on' : ''}${full ? ' is-locked' : ''}`}
                      aria-pressed={on}
                      onClick={() => dispatch({ type: 'toggleAwakening', charId: c.id, id: w.id })}
                    >
                      <span className="awaken-id">{w.id}</span>
                      <span className="awaken-body">
                        <b>{w.name}</b>
                        <span>{w.effect}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted small">Awakenings will be added once they’re published.</p>
          )}
          <ResonanceBadges characterId={c.id} awakeningCount={loadout.awakenings.length} />
          <p className="muted small">
            {loadout.dupes === 0
              ? 'Add duplicates to unlock awakenings. Each one lets you turn on any awakening, in any order.'
              : `${loadout.dupes - loadout.awakenings.length} of ${loadout.dupes} slot${loadout.dupes > 1 ? 's' : ''} free. Pick any awakenings, in any order.`}
          </p>
        </div>

        {/* Arc */}
        <div className="gear-block">
          <label className="mini-title" htmlFor="gear-arc">
            Arc <span>{c.arcType ? `${c.arcType} only` : 'Arc type not announced'}</span>
          </label>
          <select
            id="gear-arc"
            value={loadout.arc ?? ''}
            onChange={(e) => onChange({ arc: e.target.value || null })}
          >
            <option value="">No Arc</option>
            {picks.length > 0 && <optgroup label="Signature & recommended">{picks.map(arcOption)}</optgroup>}
            {ranks.map((r) => (
              <optgroup key={r} label={`${r}-rank`}>
                {others.filter((a) => a.rarity === r).map(arcOption)}
              </optgroup>
            ))}
          </select>
          {arc && (
            <label className="arc-dupes">
              <span>Arc copies</span>
              <select
                id="gear-arc-dupes"
                value={loadout.arcDupes}
                onChange={(e) => dispatch({ type: 'setArcDupes', charId: c.id, arcDupes: Number(e.target.value) })}
              >
                {Array.from({ length: MAX_ARC_DUPES + 1 }, (_, n) => (
                  <option key={n} value={n}>
                    {n === 0 ? '1 copy (base)' : n === MAX_ARC_DUPES ? `+${n} duplicates (max)` : `+${n} duplicate${n > 1 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          {arc ? (
            <div className="gear-card">
              <div className="gear-card__top">
                <RankBadge rank={arc.rarity} size={22} />
                <b>{arc.name}</b>
                {arcTagNow && <span className={`arc-tag arc-tag--${arcTagNow}`}>{TAG_LABEL[arcTagNow]}</span>}
              </div>
              <dl className="gear-stats">
                <div><dt>Base ATK</dt><dd>{arc.atk}</dd></div>
                <div><dt>Secondary</dt><dd>{arc.sub}</dd></div>
              </dl>
              <p>{arc.passive}</p>
            </div>
          ) : (
            <div className="arc-picks">
              {picks.length > 0 ? (
                picks.map((a) => {
                  const tag = arcTag(a, c);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="arc-pick"
                      onClick={() => onChange({ arc: a.id })}
                    >
                      <span className={`arc-tag arc-tag--${tag}`}>{tag === 'sig' ? 'Sig' : 'Rec'}</span>
                      {a.name}
                    </button>
                  );
                })
              ) : (
                <p className="muted small">{arcs.length} {c.arcType} Arcs available.</p>
              )}
            </div>
          )}
        </div>

        {/* Cartridge */}
        <div className="gear-block">
          <label className="mini-title" htmlFor="gear-cart">Cartridge set</label>
          <select
            id="gear-cart"
            value={loadout.cartridge ?? ''}
            onChange={(e) => onChange({ cartridge: e.target.value || null })}
          >
            <option value="">No set</option>
            <optgroup label="Recommended">
              {recSets.map((id) => (
                <option key={id} value={id}>{CARTRIDGE_BY_ID[id].name} (Rec)</option>
              ))}
            </optgroup>
            <optgroup label="Other sets">
              {otherSets.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
          </select>
          {cart ? (
            <div className="gear-card">
              <div className="gear-card__top">
                <CartridgeIcon id={cart.id} size={30} />
                <b>{cart.name}</b>
                {cartIsRec && <span className="arc-tag arc-tag--rec">Recommended</span>}
              </div>
              <dl className="gear-bonus">
                <div><dt>2-piece</dt><dd>{cart.two}</dd></div>
                <div><dt>4-piece</dt><dd>{cart.four}</dd></div>
              </dl>
            </div>
          ) : (
            <>
              <div className="arc-picks">
                {recSets.map((id) => (
                  <button key={id} type="button" className="arc-pick" onClick={() => onChange({ cartridge: id })}>
                    <CartridgeIcon id={id} size={18} />
                    <span className="arc-tag arc-tag--rec">Rec</span>
                    {CARTRIDGE_BY_ID[id].name}
                  </button>
                ))}
              </div>
              <p className="muted small">
                Recommended for {c.name}’s element and roles. Bonuses activate with 2 and 4 matching pieces.
              </p>
            </>
          )}
        </div>

        {/* Modules */}
        <div className="gear-block gear-block--wide">
          <p className="mini-title">Console modules</p>
          <ol className="modules">
            {loadout.modules.map((m, i) => (
              <li key={i} className={m ? 'module module--on' : 'module'}>
                <span className="module__cells" aria-hidden="true">
                  {Array.from({ length: 4 }, (_, k) => (
                    <span
                      key={k}
                      className={
                        m && k < MODULE_TYPES.find((t) => t.id === m.type).cells ? 'cell cell--on' : 'cell'
                      }
                    />
                  ))}
                </span>
                <label className="sr-only" htmlFor={`mod-type-${i}`}>Module {i + 1} size</label>
                <select
                  id={`mod-type-${i}`}
                  value={m?.type ?? ''}
                  onChange={(e) => setModule(i, { type: e.target.value || null })}
                >
                  <option value="">Empty</option>
                  {MODULE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label} ({t.cells} cells)</option>
                  ))}
                </select>
                <label className="sr-only" htmlFor={`mod-stat-${i}`}>Module {i + 1} main stat</label>
                <select
                  id={`mod-stat-${i}`}
                  value={m?.stat ?? ''}
                  disabled={!m}
                  onChange={(e) => setModule(i, { stat: e.target.value })}
                >
                  {!m && <option value="">Main stat</option>}
                  {MODULE_STATS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </li>
            ))}
          </ol>
          <p className="muted small">
            Records each module’s size and main stat. Interactive Console grid placement is coming next.
          </p>
        </div>
      </div>
    </section>
  );
}
