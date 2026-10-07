import { useState } from 'react';
import { DMG_TYPES, MAX_STATS_LEVEL } from '../data/maxStats.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';
import StatIcon from './StatIcon.jsx';

const num = (n) => n.toLocaleString('en-US');
const pct = (n) => `${Number.isInteger(n) ? n : n.toFixed(2).replace(/0$/, '')}%`;
const label = (type) => (type === 'mental' ? 'Mental' : ELEMENT_BY_ID[type].name);

// Level 80 stats as shown on the in-game character screen (no Arc or Console).
export default function MaxStats({ stats }) {
  const [showAll, setShowAll] = useState(false);
  const rows = [
    ['hp', 'HP', num(stats.hp)],
    ['atk', 'ATK', num(stats.atk)],
    ['def', 'DEF', num(stats.def)],
    ['stamina', 'Stamina', num(stats.stamina)],
  ];
  const advanced = [
    ['critRate', 'Crit Rate', pct(stats.critRate)],
    ['critDmg', 'Crit DMG', pct(stats.critDmg)],
    ['charge', 'Charge Efficiency', pct(stats.charge)],
    ['cycle', 'Cycle Intensity', num(stats.cycle)],
    ['breakInt', 'Break Intensity', num(stats.breakInt)],
    ['dmgBonus', 'Universal DMG Bonus', pct(stats.universal)],
  ];
  const healing = [
    ['healing', 'Healing Bonus', pct(stats.healing)],
    ['healing', 'Healing Received Bonus', pct(stats.healingReceived)],
  ];
  const dmg = DMG_TYPES.map((t) => [t, stats.dmg[t] ?? 0]);
  const res = DMG_TYPES.map((t) => [t, stats.res[t] ?? 0]);
  const shownDmg = showAll ? dmg : dmg.filter(([, v]) => v);
  const resAllZero = res.every(([, v]) => !v);

  const row = ([key, name, value], i) => (
    <tr key={`${name}-${i}`} className={value === '0' || value === '0%' ? 'is-zero' : undefined}>
      <th scope="row">
        <span className="stat-label"><StatIcon stat={key} />{name}</span>
      </th>
      <td>{value}</td>
    </tr>
  );
  const typeRow = (prefix) => ([t, v]) => (
    <tr key={`${prefix}-${t}`} className={v ? undefined : 'is-zero'}>
      <th scope="row">
        <span className="stat-label">
          {t === 'mental' ? <StatIcon stat={prefix === 'res' ? 'res' : 'dmgBonus'} /> : <ElementGlyph element={t} size={16} />}
          {label(t)} {prefix === 'res' ? 'Resistance' : 'DMG Bonus'}
        </span>
      </th>
      <td>{pct(v)}</td>
    </tr>
  );

  return (
    <>
      <h3 className="mini-title">Max stats <span>Lv {MAX_STATS_LEVEL} · without Arc or Console</span></h3>
      <table>
        <tbody>{rows.map(row)}</tbody>
      </table>
      <h3 className="mini-title stats__sub">Advanced attributes</h3>
      <table>
        <tbody>
          {advanced.map(row)}
          {healing.map(row)}
          {shownDmg.map(typeRow('dmg'))}
          {showAll ? res.map(typeRow('res')) : (
            <tr className="is-zero">
              <th scope="row"><span className="stat-label"><StatIcon stat="res" />Resistances</span></th>
              <td>{resAllZero ? 'All 0%' : 'See all'}</td>
            </tr>
          )}
        </tbody>
      </table>
      <button type="button" className="btn btn--quiet stats__toggle" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
        {showAll ? 'Hide zero values' : 'Show all bonuses'}
      </button>
    </>
  );
}
