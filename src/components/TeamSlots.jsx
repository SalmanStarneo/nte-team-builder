import { CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import Portrait from './Portrait.jsx';

export default function TeamSlots({ members, dispatch }) {
  return (
    <ol className="slots" aria-label="Team members">
      {members.map((id, index) => {
        const c = id && CHARACTER_BY_ID[id];
        if (!c) {
          return (
            <li key={index} className="slot slot--empty">
              <span className="slot__plus" aria-hidden="true">+</span>
              <span className="slot__hint">Pick from roster</span>
            </li>
          );
        }
        return (
          <li key={index} className="slot" style={{ '--el': ELEMENT_BY_ID[c.element].color }}>
            <button
              className="slot__btn"
              onClick={() => dispatch({ type: 'clearSlot', index })}
              aria-label={`Remove ${c.name}`}
              title="Remove"
            >
              <Portrait character={c} size="lg" />
              <span className="slot__name">{c.name}</span>
              <span className="slot__meta">
                {c.rarity} · {c.role}
              </span>
              <span className="slot__x" aria-hidden="true">×</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
