import { ELEMENT_BY_ID } from '../data/elements.js';

// Simple original shapes per element (not the game's icons).
const SHAPES = {
  cosmos: <path d="M10 1.5 12 8l6.5 2-6.5 2-2 6.5L8 12l-6.5-2L8 8z" />,
  anima: <path d="M10 2c4 4.5 6 7.6 6 10.2A6 6 0 0 1 4 12.2C4 9.6 6 6.5 10 2z" />,
  incantation: <path d="M10 2.5 18 17H2z" />,
  chaos: <path d="m10 1.5 2.2 5.4 5.6-1-3.4 4.6 3.4 4.6-5.6-1L10 18.5l-2.2-5.4-5.6 1 3.4-4.6-3.4-4.6 5.6 1z" />,
  psyche: (
    <>
      <circle cx="10" cy="10" r="7.5" fill="none" strokeWidth="2.4" stroke="currentColor" />
      <circle cx="10" cy="10" r="3" />
    </>
  ),
  lakshana: <path d="M10 1.8 17.1 6v8L10 18.2 2.9 14V6z" />,
};

export default function ElementGlyph({ element, size = 16, title, color, x, y }) {
  const el = ELEMENT_BY_ID[element];
  return (
    <svg
      className="glyph"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      x={x}
      y={y}
      style={{ color: color || el?.color }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {SHAPES[element]}
    </svg>
  );
}
