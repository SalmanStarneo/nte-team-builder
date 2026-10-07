import { useState } from 'react';
import MaterialIcon from './MaterialIcon.jsx';
import { LIFE_MAX, SKILL_LEVEL_COSTS, SKILL_MAX, SKILLS, skillCost } from '../data/skills.js';

const fmt = (n) => n.toLocaleString('en-US');
const LEVELS = Array.from({ length: SKILL_MAX }, (_, i) => i + 1);

// A character's combat and life skills, plus a planner for the materials
// needed to level them.
export default function SkillsSection({ character }) {
  const data = SKILLS[character.id];
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(SKILL_MAX);
  const [passives, setPassives] = useState(true);
  const [life, setLife] = useState(true);
  const [showLevels, setShowLevels] = useState(false);

  if (!data) {
    return (
      <section>
        <h3 className="mini-title">Skills</h3>
        <p className="muted small">Skills will be added once they’re published.</p>
      </section>
    );
  }

  const cost = skillCost(character.id, { from, to, passives, life });

  return (
    <>
      <section aria-labelledby="skills-title">
        <h3 id="skills-title" className="mini-title">Combat skills <span>max Lv {SKILL_MAX}</span></h3>
        <ol className="skill-list">
          {data.combat.map((sk) => (
            <li key={sk.type}>
              <span className="skill-type">{sk.type}</span>
              <span className="awaken-body">
                <b>{sk.name ?? 'Not published yet'}</b>
                {sk.summary && <span>{sk.summary}</span>}
              </span>
            </li>
          ))}
        </ol>

        <h3 className="mini-title skill-life-title">Life skills <span>max Lv {LIFE_MAX}</span></h3>
        {data.life.length ? (
          <ol className="skill-list">
            {data.life.map((sk) => (
              <li key={sk.name}>
                <span className="skill-type skill-type--life">{sk.type}</span>
                <span className="awaken-body">
                  <b>{sk.name}</b>
                  <span>{sk.summary}</span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted small">Life skill not published yet.</p>
        )}
      </section>

      {cost && (
        <section className="ascend" aria-labelledby="skillmats-title">
          <div className="ascend__head">
            <h3 id="skillmats-title" className="mini-title">Skill materials</h3>
            <div className="ascend__range">
              <label>
                <span>All 4 skills, Lv</span>
                <select
                  id="skill-from"
                  value={from}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFrom(v);
                    if (to < v) setTo(v);
                  }}
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <span aria-hidden="true">→</span>
              <label>
                <span className="sr-only">Target skill level</span>
                <select id="skill-to" value={to} onChange={(e) => setTo(Number(e.target.value))}>
                  {LEVELS.filter((l) => l >= from).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div className="skill-opts">
            <label className="check">
              <input type="checkbox" checked={passives} onChange={(e) => setPassives(e.target.checked)} />
              Include both passives
            </label>
            <label className="check">
              <input type="checkbox" checked={life} onChange={(e) => setLife(e.target.checked)} />
              Include life skill (Lv 1 → {LIFE_MAX})
            </label>
          </div>

          {cost.length === 0 ? (
            <p className="muted small">Nothing needed for this range.</p>
          ) : (
            <ul className="mats">
              {cost.map((m) => (
                <li key={`${m.name}-${m.source ?? ''}`} className={`mat mat--${m.kind}`}>
                  <MaterialIcon name={m.name} />
                  <span className="mat__qty">{fmt(m.qty)}</span>
                  <span className="mat__name">
                    {m.name}
                    {m.source && <span className="mat__src">{m.source}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="btn btn--quiet ascend__toggle"
            aria-expanded={showLevels}
            onClick={() => setShowLevels((v) => !v)}
          >
            {showLevels ? 'Hide' : 'Show'} cost per level
          </button>
          {showLevels && (
            <div className="table-wrap">
              <table className="phase-table">
                <thead>
                  <tr>
                    <th scope="col">One skill</th>
                    <th scope="col">Skill books + family</th>
                    <th scope="col" className="num-l">Weekly</th>
                    <th scope="col" className="num">Beetle Coin</th>
                  </tr>
                </thead>
                <tbody>
                  {SKILL_LEVEL_COSTS.map((r) => (
                    <tr key={r.level} className={r.level > from && r.level <= to ? 'in-range' : undefined}>
                      <td>Lv {r.level - 1} → {r.level}</td>
                      <td>{r.qty} + {r.qty} × tier {r.tier}</td>
                      <td className="num-l">{r.weekly || '—'}</td>
                      <td className="num">{fmt(r.coins)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="muted small">
            Each of the 4 combat skills costs the same. Life skill amounts vary between guides
            (56–96 Dreamless Seeds); check in-game.
          </p>
        </section>
      )}
    </>
  );
}
