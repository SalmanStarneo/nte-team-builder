import { useEffect, useState } from 'react';

// Tiny hash router: #builder, #characters, #character-<id>, #glossary.
// Hashes stay plain tokens so links work everywhere the app is hosted.
export const VIEWS = [
  { id: 'builder', label: 'Team Builder' },
  { id: 'characters', label: 'Characters' },
  { id: 'glossary', label: 'Glossary' },
];

export function parseHash(hash) {
  const h = (hash || '').replace(/^#/, '');
  if (h.startsWith('character-')) return { view: 'characters', characterId: h.slice(10) };
  if (VIEWS.some((v) => v.id === h)) return { view: h, characterId: null };
  return { view: 'builder', characterId: null };
}

export function navigate(target) {
  if (window.location.hash !== `#${target}`) window.location.hash = target;
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
