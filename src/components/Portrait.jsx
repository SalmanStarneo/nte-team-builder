import { useState } from 'react';
import { ELEMENT_BY_ID } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';

// Looks for public/characters/<id>.webp. If the file is missing,
// it falls back to the character's initials on their element colour.
const BASE = import.meta.env?.BASE_URL ?? '/';

export default function Portrait({ character, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const color = ELEMENT_BY_ID[character.element].color;
  const initials = character.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <span className={`portrait portrait--${size}`} style={{ '--el': color }}>
      {failed ? (
        <span className="portrait__initials">{initials}</span>
      ) : (
        <img
          className="portrait__img"
          src={`${BASE}characters/${character.id}.webp`}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <span className="portrait__glyph">
        <ElementGlyph element={character.element} size={size === 'lg' ? 16 : 12} />
      </span>
    </span>
  );
}
