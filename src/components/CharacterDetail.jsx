import { ELEMENTS, ELEMENT_BY_ID, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { PRESETS } from '../data/presets.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARCS, ARC_BY_ID, RECOMMENDED } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import CartridgeIcon from './CartridgeIcon.jsx';
import MaxStats from './MaxStats.jsx';
import EndgameStats from './EndgameStats.jsx';
import ArcTypeIcon from './ArcTypeIcon.jsx';
import { MAX_STATS } from '../data/maxStats.js';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';
import AscensionPlanner from './AscensionPlanner.jsx';
import SkillsSection from './SkillsSection.jsx';
import StatIcon from './StatIcon.jsx';
import { AWAKENINGS, RESONANCES } from '../data/awakenings.js';
import { AWAKENING_ORDER, ORDINAL } from '../data/awakeningOrder.js';
import RoleList from './RoleList.jsx';
import { useState } from 'react';
import ExportDialog from './ExportDialog.jsx';
import { characterBuild, renderBuildCard } from '../lib/buildCard.js';
import { CHARACTER_CONSOLE } from '../data/console.js';
import { bestBuild } from '../data/bestBuild.js';
import MyBuildEditor, { myBuildCurrent } from './MyBuildEditor.jsx';

const fmt = (n) => n.toLocaleString('en-US');

export default function CharacterDetail({ character: c, activeTeam, inActiveTeam, teamFull, onAdd, onClose }) {
  const [sharing, setSharing] = useState(false);
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
            {c.version && <>Ver. {c.version} ·{' '}</>}
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
        <div className="detail__main">
          <dl className="facts">
            <div><dt>Arc type</dt><dd>
              {c.arcType ? (
                <>
                  <ArcTypeIcon type={c.arcType} size={18} />
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
            <div><dt>Faction</dt><dd>
              {c.faction ?? (c.formerFaction ? '' : '—')}
              {c.unit && <span className="muted"> · {c.unit}</span>}
              {c.formerFaction && (
                <span className="former">
                  {c.faction && ' '}
                  <span className="former__tag">Former</span> {c.formerFaction}
                </span>
              )}
            </dd></div>
            <div><dt>Esper ability</dt><dd>{c.ability ?? '—'}</dd></div>
            <div>
              <dt>Recommended Cartridges</dt>
              <dd className="cart-list">
                {cartridgesFor(c).map((id) => (
                  <span key={id} className="cart-list__item">
                    <CartridgeIcon id={id} size={22} />
                    {CARTRIDGE_BY_ID[id].name}
                  </span>
                ))}
              </dd>
            </div>
            {c.upcoming && <div><dt>Status</dt><dd>Upcoming</dd></div>}
          </dl>

        <section className="detail__reacts">
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
        </div>

        <div className="stats">
          {MAX_STATS[c.id] ? (
            <MaxStats stats={MAX_STATS[c.id]} />
          ) : (
            <>
              <h3 className="mini-title">Stats</h3>
              <p className="muted">Level 80 stats not added yet.</p>
            </>
          )}
          <EndgameStats character={c} />
        </div>
      </div>

      <section>
        <h3 className="mini-title">Awakenings</h3>
        {AWAKENINGS[c.id] ? (
          <>
            {AWAKENING_ORDER[c.id] && (
              <div className="awaken-order" data-el={c.element}>
                <p className="awaken-order__title">Suggested unlock order <span>one per duplicate</span></p>
                <ol className="awaken-chain" aria-label="Unlock order">
                  {AWAKENING_ORDER[c.id].order.map((id, i) => (
                    <li key={id} title={`${ORDINAL[i]} duplicate`}>
                      {i > 0 && <span className="awaken-chain__arrow" aria-hidden="true">→</span>}
                      <span className={`awaken-chain__id${i === 0 ? ' is-first' : ''}`}>{id}</span>
                    </li>
                  ))}
                </ol>
                {AWAKENING_ORDER[c.id].alt && <p className="muted small">{AWAKENING_ORDER[c.id].alt}</p>}
              </div>
            )}
            <ol className="awaken-list">
              {AWAKENINGS[c.id].map((w) => (
                <li key={w.id}>
                  <span className="awaken-id">{w.id}</span>
                  <span className="awaken-body">
                    <b>
                      {w.name}
                      {AWAKENING_ORDER[c.id]?.order.includes(w.id) && (
                        <span className="awaken-rank">{ORDINAL[AWAKENING_ORDER[c.id].order.indexOf(w.id)]} pick</span>
                      )}
                    </b>
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

      <SkillsSection key={`skills-${c.id}`} character={c} />

      <AscensionPlanner key={c.id} character={c} />

      {CHARACTER_CONSOLE[c.id] && (
        <MyBuildEditor character={c} activeTeam={activeTeam} onShare={(b) => setSharing({ mine: b })} />
      )}


      <div className="detail__actions">
        <button className="btn btn--primary" onClick={onAdd} disabled={inActiveTeam || teamFull}>
          {inActiveTeam ? 'Already in current team' : teamFull ? 'Current team is full' : 'Add to current team'}
        </button>
        {CHARACTER_CONSOLE[c.id] && (
          <button className="btn" onClick={() => setSharing({ recommended: true })}>
            Share recommended build
          </button>
        )}
      </div>
      {sharing && (
        <ExportDialog
          title={sharing.mine ? 'My build image' : 'Recommended build image'}
          name={c.name}
          suffix={sharing.mine ? 'my-nte-build' : 'nte-build'}
          onClose={() => setSharing(false)}
          render={(opts) => {
            if (sharing.mine) {
              const mine = myBuildCurrent(sharing.mine);
              return renderBuildCard(characterBuild(c, { current: mine, source: 'My build', recStats: mine.cartStats }), opts);
            }
            const best = bestBuild(c);
            return renderBuildCard(
              characterBuild(c, { current: best, source: 'Recommended build', recStats: best?.cartStats }),
              opts,
            );
          }}
        />
      )}
    </article>
  );
}
