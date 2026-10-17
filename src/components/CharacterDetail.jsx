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
import BondSection from './BondSection.jsx';
import { AWAKENINGS, RESONANCES } from '../data/awakenings.js';
import { AWAKENING_ORDER, ORDINAL } from '../data/awakeningOrder.js';
import RoleList from './RoleList.jsx';
import { useState } from 'react';
import ExportDialog from './ExportDialog.jsx';
import { characterBuild, renderBuildCard } from '../lib/buildCard.js';
import { CHARACTER_CONSOLE } from '../data/console.js';
import { bestBuild } from '../data/bestBuild.js';
import MyBuildEditor, { myBuildCurrent } from './MyBuildEditor.jsx';
import { farmList } from '../data/farmList.js';
import { renderFarmCard } from '../lib/farmCard.js';
import StatText from './StatText.jsx';
import SwipeTabs from './SwipeTabs.jsx';
import { PHONE, useMedia } from '../lib/useMedia.js';
import { renderCharacterCard } from '../lib/characterCard.js';
import { renderGuideCard } from '../lib/guideCard.js';
import ExportIcon from './ExportIcon.jsx';


export default function CharacterDetail({ character: c, activeTeam, inActiveTeam, teamFull, onAdd, onClose }) {
  const [sharing, setSharing] = useState(false);
  const element = ELEMENT_BY_ID[c.element];
  const index = ELEMENTS.findIndex((e) => e.id === c.element);
  const neighbours = [ELEMENTS[(index + 5) % 6], ELEMENTS[(index + 1) % 6]];
  const reactions = PAIR_REACTIONS.filter((r) => r.elements.includes(c.element));
  const trios = TRIO_REACTIONS.filter((r) => r.elements.includes(c.element));
  // Community teams first, then this site's kit-based ideas.
  const presets = PRESETS.filter((p) => p.members.includes(c.id)).sort((a, b) => Number(!!a.idea) - Number(!!b.idea));
  const signature = ARCS.find((a) => a.signature === c.id);
  const arcCount = ARCS.filter((a) => a.type === c.arcType).length;
  const phone = useMedia(PHONE);

  // Page sections: stacked on wider screens, swipeable slides on phones.
  const overview = (
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
        <div className="featured-head">
          <h3 className="mini-title">Featured in</h3>
          <button type="button" className="btn btn--quiet btn--small" onClick={() => setSharing({ teams: true })}>
            <ExportIcon size={14} />Share teams card
          </button>
        </div>
        <ul className="detail__presets">
          {presets.map((p) => (
            <li key={p.name} className={p.idea ? 'is-idea' : undefined}>
              <span className="detail__preset-name">
                {p.name}
                {p.idea && <span className="idea-tag">Kit idea</span>}
              </span>
              <span className="detail__preset-team">
                {p.members.map((id) => (
                  <Portrait key={id} character={CHARACTER_BY_ID[id]} size="sm" />
                ))}
              </span>
              {p.why && <span className="detail__preset-why">{p.why}</span>}
            </li>
          ))}
        </ul>
      </section>
    )}
    </div>
  );
  const stats = (
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
  );
  const awakenings = (
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
                  <span><StatText>{w.effect}</StatText></span>
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
                      <span><StatText>{r.effect}</StatText></span>
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
);
  const skills = <SkillsSection key={`skills-${c.id}`} character={c} />;
  const bondTab = <BondSection character={c} />;
  const materials = (
    <>
      <AscensionPlanner key={c.id} character={c} />

      {farmList(c.id) && (
        <section className="farm-cta" aria-labelledby="farm-cta-title">
          <div className="farm-cta__text">
            <h3 id="farm-cta-title" className="mini-title">Farming list</h3>
            <p className="muted small">
              Every material to ascend {c.name} to Lv 80 and max all skills, grouped by where to farm it.
            </p>
          </div>
          <button type="button" className="btn" onClick={() => setSharing({ farm: true })}>
            <ExportIcon />Share farming list
          </button>
        </section>
      )}
    </>
  );
  const myBuild = CHARACTER_CONSOLE[c.id] ? (
    <MyBuildEditor character={c} activeTeam={activeTeam} onShare={(b) => setSharing({ mine: b })} />
  ) : null;

  return (
    <article className="detail" style={{ '--el': element.color }} aria-labelledby="detail-name">
      <header className="detail__head">
        <Portrait character={c} size="xl" />
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">
              <ElementGlyph element={c.element} size={16} />
              <span>{element.name} · <span className="nowrap">{c.rarity}-rank</span></span>
            </span>
            {c.version && <span className="eyebrow__ver">Ver {c.version}</span>}
            <RoleList roles={c.roles} size={14} />
          </p>
          <h2 id="detail-name" className="detail__name">{c.name}</h2>
          {c.tags?.length > 0 && (
            <ul className="tags">
              {c.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
          )}
        </div>
        <div className="detail__head-actions">
          {CHARACTER_CONSOLE[c.id] && (
            <button
              type="button"
              className="btn btn--quiet detail__export"
              onClick={() => setSharing({ guide: true })}
              title="Export a build guide image"
              aria-label={`Export ${c.name} build guide image`}
            >
              <ExportIcon size={18} />
              <span className="detail__export-label">Build guide</span>
            </button>
          )}
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">×</button>
        </div>
      </header>

      {phone ? (
        <SwipeTabs
          key={c.id}
          label={`${c.name} details`}
          slides={[
            { id: 'overview', label: 'Overview', content: overview },
            { id: 'stats', label: 'Stats', content: stats },
            { id: 'awakenings', label: 'Awakenings', content: awakenings },
            { id: 'skills', label: 'Skills', content: skills },
            { id: 'bond', label: 'Bond', content: bondTab },
            { id: 'materials', label: 'Materials', content: materials },
            myBuild && { id: 'build', label: 'My build', content: myBuild },
          ].filter(Boolean)}
        />
      ) : (
        <>
          <div className="detail__grid">
            {overview}
            {stats}
          </div>
          {awakenings}
          {skills}
          {bondTab}
          {materials}
          {myBuild}
        </>
      )}

      <div className="detail__actions">
        <button className="btn btn--primary" onClick={onAdd} disabled={inActiveTeam || teamFull}>
          {inActiveTeam ? 'Already in current team' : teamFull ? 'Current team is full' : 'Add to current team'}
        </button>
        {CHARACTER_CONSOLE[c.id] && (
          <button className="btn" onClick={() => setSharing({ recommended: true })}>
            <ExportIcon />Share recommended build
          </button>
        )}
      </div>
      {sharing && (
        <ExportDialog
          title={sharing.guide ? 'Build guide image' : sharing.teams ? 'Character teams image' : sharing.farm ? 'Farming list image' : sharing.mine ? 'My build image' : 'Recommended build image'}
          name={c.name}
          suffix={sharing.guide ? 'nte-build-guide' : sharing.teams ? 'nte-teams' : sharing.farm ? 'nte-farming-list' : sharing.mine ? 'my-nte-build' : 'nte-build'}
          onClose={() => setSharing(false)}
          render={(opts) => {
            if (sharing.guide) return renderGuideCard(c, opts);
            if (sharing.teams) return renderCharacterCard(c, opts);
            if (sharing.farm) return renderFarmCard(c, opts);
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
