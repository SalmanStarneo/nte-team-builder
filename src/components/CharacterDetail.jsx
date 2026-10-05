import { ELEMENTS, ELEMENT_BY_ID, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { PRESETS } from '../data/presets.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARCS, ARC_BY_ID, RECOMMENDED } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';
import AscensionPlanner from './AscensionPlanner.jsx';
import StatIcon from './StatIcon.jsx';
import { AWAKENINGS, RESONANCES } from '../data/awakenings.js';
import RoleList from './RoleList.jsx';

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
            <ElementGlyph element={c.element} size={16} /> {element.name} · {c.rarity}-rank ·{' '}
            <RoleList roles={c.roles} size={14} />
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
          <div><dt>Arc type</dt><dd>
            {c.arcType ? (
              <>
                {c.arcType}{' '}
                <a className="muted" href={`#arcs-${c.arcType.toLowerCase()}`}>· {arcCount} Arcs</a>
              </>
            ) : (
              <span className="muted">Not announced yet</span>
            )}
          </dd></div>
          {signature && <div><dt>Signature Arc</dt><dd>{signature.name}</dd></div>}
          {RECOMMENDED[c.id]?.length > 0 && (
            <div>
              <dt>Recommended Arcs</dt>
              <dd>
                {RECOMMENDED[c.id]
                  .filter((id) => ARC_BY_ID[id].signature !== c.id)
                  .map((id) => ARC_BY_ID[id].name)
                  .join(', ')}
              </dd>
            </div>
          )}
          <div><dt>Faction</dt><dd>{c.faction ?? '—'}</dd></div>
          <div><dt>Esper ability</dt><dd>{c.ability ?? '—'}</dd></div>
          <div>
            <dt>Recommended Cartridges</dt>
            <dd>{cartridgesFor(c).map((id) => CARTRIDGE_BY_ID[id].name).join(', ')}</dd>
          </div>
          {c.upcoming && <div><dt>Status</dt><dd>Upcoming</dd></div>}
        </dl>

        <div className="stats">
          <h3 className="mini-title">Base stats <span>Level 1</span></h3>
          {c.stats ? (
            <table>
              <tbody>
                {[
                  ['hp', 'HP', fmt(c.stats.hp)],
                  ['atk', 'ATK', c.stats.atk],
                  ['def', 'DEF', c.stats.def],
                  ['critRate', 'Crit Rate', `${c.stats.critRate.toFixed(2)}%`],
                  ['critDmg', 'Crit DMG', `${c.stats.critDmg.toFixed(2)}%`],
                  ['dmgBonus', 'Universal DMG Bonus', '0.00%'],
                ].map(([key, label, value]) => (
                  <tr key={key}>
                    <th scope="row">
                      <span className="stat-label"><StatIcon stat={key} />{label}</span>
                    </th>
                    <td>{value}</td>
                  </tr>
                ))}
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

      <section>
        <h3 className="mini-title">Awakenings</h3>
        {AWAKENINGS[c.id] ? (
          <>
            <ol className="awaken-list">
              {AWAKENINGS[c.id].map((w) => (
                <li key={w.id}>
                  <span className="awaken-id">{w.id}</span>
                  <span className="awaken-body">
                    <b>{w.name}</b>
                    <span>{w.effect}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="muted small">
              Each duplicate unlocks one awakening of your choice, in any order.
            </p>
            {RESONANCES[c.id] && (
              <>
                <h3 className="mini-title reso-title">Resonance</h3>
                <ol className="awaken-list reso-list">
                  {RESONANCES[c.id].map((r) => (
                    <li key={r.id}>
                      <span className="reso__dot is-on is-static">{r.id}</span>
                      <span className="awaken-body">
                        <b>{r.name}</b>
                        <span>{r.effect}</span>
                        <span className="reso-when">Active with {r.at} awakenings on</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </>
        ) : (
          <p className="muted small">Awakenings will be added once they’re published.</p>
        )}
      </section>

      <AscensionPlanner key={c.id} character={c} />

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
