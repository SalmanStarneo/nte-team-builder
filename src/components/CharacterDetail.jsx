import { ELEMENTS, ELEMENT_BY_ID, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { PRESETS } from '../data/presets.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARCS } from '../data/arcs.js';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';

const fmt = (n) => n.toLocaleString('en-US');

export default function CharacterDetail({ character: c, inActiveTeam, teamFull, onAdd, onClose }) {
  const element = ELEMENT_BY_ID[c.element];
  const index = ELEMENTS.findIndex((e) => e.id === c.element);
  const neighbours = [ELEMENTS[(index + 5) % 6], ELEMENTS[(index + 1) % 6]];
  const reactions = PAIR_REACTIONS.filter((r) => r.elements.includes(c.element));
  const trios = TRIO_REACTIONS.filter((r) => r.elements.includes(c.element));
  const presets = PRESETS.filter((p) => p.members.includes(c.id));
  const signature = ARCS.find((a) => a.signature === c.id);
  const arcCount = ARCS.filter((a) => a.type === c.arcType).length;

  return (
    <article className="detail" style={{ '--el': element.color }} aria-labelledby="detail-name">
      <header className="detail__head">
        <Portrait character={c} size="xl" />
        <div className="detail__title">
          <p className="eyebrow">
            <ElementGlyph element={c.element} size={14} /> {element.name} · {c.rarity}-rank · {c.roles.join(' · ')}
          </p>
          <h2 id="detail-name" className="detail__name">{c.name}</h2>
          {c.tags?.length > 0 && (
            <ul className="tags">
              {c.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
          )}
        </div>
        <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">×</button>
      </header>

      <div className="detail__grid">
        <dl className="facts">
          <div><dt>Arc type</dt><dd>{c.arcType} <span className="muted">· {arcCount} Arcs</span></dd></div>
          {signature && <div><dt>Signature Arc</dt><dd>{signature.name}</dd></div>}
          <div><dt>Faction</dt><dd>{c.faction ?? '—'}</dd></div>
          <div><dt>Esper ability</dt><dd>{c.ability ?? '—'}</dd></div>
          {c.upcoming && <div><dt>Status</dt><dd>Upcoming</dd></div>}
        </dl>

        <div className="stats">
          <h3 className="mini-title">Base stats <span>Level 1</span></h3>
          {c.stats ? (
            <table>
              <tbody>
                <tr><th scope="row">HP</th><td>{fmt(c.stats.hp)}</td></tr>
                <tr><th scope="row">ATK</th><td>{c.stats.atk}</td></tr>
                <tr><th scope="row">DEF</th><td>{c.stats.def}</td></tr>
                <tr><th scope="row">Crit Rate</th><td>{c.stats.critRate}%</td></tr>
                <tr><th scope="row">Crit DMG</th><td>{c.stats.critDmg}%</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="muted">Stats pending. Not yet published by our data sources.</p>
          )}
        </div>
      </div>

      <section>
        <h3 className="mini-title">Reacts with</h3>
        <p className="muted small">
          {element.name} sits between {neighbours[0].name} and {neighbours[1].name} on the Esper Cycle.
        </p>
        <ul className="detail__reactions">
          {reactions.map((r) => {
            const other = r.elements.find((e) => e !== c.element);
            return (
              <li key={r.id}>
                <ElementGlyph element={other} size={14} />
                <b>{r.name}</b>
                <span className="muted">with {ELEMENT_BY_ID[other].name}</span>
              </li>
            );
          })}
          {trios.map((t) => (
            <li key={t.id}>
              <span className="trio-dots">
                {t.elements.map((e) => <ElementGlyph key={e} element={e} size={11} />)}
              </span>
              <b>{t.name}</b>
              <span className="muted">trio</span>
            </li>
          ))}
        </ul>
      </section>

      {presets.length > 0 && (
        <section>
          <h3 className="mini-title">Featured in</h3>
          <ul className="detail__presets">
            {presets.map((p) => (
              <li key={p.name}>
                <span className="detail__preset-name">{p.name}</span>
                <span className="detail__preset-team">
                  {p.members.map((id) => (
                    <Portrait key={id} character={CHARACTER_BY_ID[id]} size="sm" />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="detail__actions">
        <button className="btn btn--primary" onClick={onAdd} disabled={inActiveTeam || teamFull}>
          {inActiveTeam ? 'Already in current team' : teamFull ? 'Current team is full' : 'Add to current team'}
        </button>
      </div>
    </article>
  );
}
