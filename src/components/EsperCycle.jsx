import { ELEMENTS, PAIR_REACTIONS } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';

// The Esper Cycle drawn as a ring line with six stations.
// A segment lights up when the team has both elements on either end of it.
const SIZE = 300;
const C = SIZE / 2;
const R = 96;

const point = (i, r = R) => {
  const a = (Math.PI * 2 * i) / ELEMENTS.length - Math.PI / 2;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};

export default function EsperCycle({ elementCounts, reactions, trios }) {
  const active = new Set(reactions.map((r) => r.id));

  return (
    <figure className="cycle">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Esper Cycle with this team's elements and reactions">
        {/* Segments between neighbouring stations */}
        {ELEMENTS.map((el, i) => {
          const j = (i + 1) % ELEMENTS.length;
          const reaction = PAIR_REACTIONS.find(
            (r) => r.elements.includes(el.id) && r.elements.includes(ELEMENTS[j].id),
          );
          const lit = active.has(reaction.id);
          const [x1, y1] = point(i);
          const [x2, y2] = point(j);
          const [lx, ly] = point(i + 0.5, R - 34);
          return (
            <g key={reaction.id} className={lit ? 'seg seg--lit' : 'seg'}>
              <path d={`M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">
                {reaction.name}
              </text>
            </g>
          );
        })}

        {/* Stations */}
        {ELEMENTS.map((el, i) => {
          const [x, y] = point(i);
          const [nx, ny] = point(i, R + 34);
          const count = elementCounts[el.id] || 0;
          return (
            <g key={el.id} className={count ? 'station station--on' : 'station'}>
              <circle cx={x} cy={y} r="17" style={count ? { fill: el.color, stroke: el.color } : undefined} />
              <ElementGlyph
                element={el.id}
                size={18}
                x={x - 9}
                y={y - 9}
                color={count ? 'var(--on-accent)' : el.color}
              />
              {count > 1 && (
                <g className="station__count">
                  <circle cx={x + 14} cy={y - 14} r="8" />
                  <text x={x + 14} y={y - 13.5} textAnchor="middle" dominantBaseline="middle">
                    {count}
                  </text>
                </g>
              )}
              <text className="station__name" x={nx} y={ny} textAnchor="middle" dominantBaseline="middle">
                {el.name}
              </text>
            </g>
          );
        })}

        {/* Hub */}
        <g className="hub">
          <text x={C} y={C - 8} textAnchor="middle" className="hub__num">
            {reactions.length}
          </text>
          <text x={C} y={C + 12} textAnchor="middle" className="hub__label">
            {reactions.length === 1 ? 'reaction' : 'reactions'}
          </text>
          {trios.map((t, k) => (
            <text key={t.id} x={C} y={C + 30 + k * 14} textAnchor="middle" className="hub__trio">
              + {t.name}
            </text>
          ))}
        </g>
      </svg>
    </figure>
  );
}
