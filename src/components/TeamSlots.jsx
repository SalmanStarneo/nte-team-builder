import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARC_BY_ID, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { loadoutOf } from '../lib/teamsReducer.js';
import Portrait from './Portrait.jsx';

// Four team slots. Selecting a filled slot opens its loadout below.
export default function TeamSlots({ team, selected, onSelect, dispatch }) {
  return (
    <ol className="slots" aria-label="Team members">
      {team.members.map((id, index) => {
        const c = id && CHARACTER_BY_ID[id];
        if (!c) {
          return (
            <li key={index} className="slot slot--empty">
              <span className="slot__plus" aria-hidden="true">+</span>
              <span className="slot__hint">Pick from roster</span>
            </li>
          );
        }
        const gear = loadoutOf(team, c.id);
        const arc = gear.arc && ARC_BY_ID[gear.arc];
        const cart = gear.cartridge && CARTRIDGE_BY_ID[gear.cartridge];
        const moduleCount = gear.modules.filter(Boolean).length;
        const isSelected = selected === index;
        return (
          <li
            key={index}
            className={`slot${isSelected ? ' slot--selected' : ''}`}
            style={{ '--el': ELEMENT_BY_ID[c.element].color }}
          >
            <button
              className="slot__btn"
              onClick={() => onSelect(isSelected ? null : index)}
              aria-expanded={isSelected}
              aria-label={`${c.name}: edit gear`}
            >
              <Portrait character={c} size="lg" />
              <span className="slot__name">{c.name}</span>
              <span className="slot__meta">{c.roles.join(' · ')}</span>
              <span className="slot__gear">
                <span className={arc ? 'gear-chip gear-chip--on' : 'gear-chip'} title={arc?.name ?? 'No Arc'}>
                  {arc ? arc.name : 'No Arc'}
                  {arc && arcTag(arc, c) && (
                    <span className="chip-tag"> · {arcTag(arc, c) === 'sig' ? 'Sig' : 'Rec'}</span>
                  )}
                </span>
                <span className="slot__gear-row">
                  <span className={cart ? 'gear-chip gear-chip--on' : 'gear-chip'} title={cart?.name ?? 'No Cartridge'}>
                    {cart ? cart.name.split(':')[0] : 'No set'}
                    {cart && cartridgesFor(c).includes(cart.id) && <span className="chip-tag"> · Rec</span>}
                  </span>
                  <span className={moduleCount ? 'gear-chip gear-chip--on' : 'gear-chip'}>
                    {moduleCount}/4 mod
                  </span>
                </span>
              </span>
            </button>
            <button
              className="slot__x"
              onClick={() => {
                if (isSelected) onSelect(null);
                dispatch({ type: 'clearSlot', index });
              }}
              aria-label={`Remove ${c.name} from team`}
              title="Remove from team"
            >
              ×
            </button>
          </li>
        );
      })}
    </ol>
  );
}
