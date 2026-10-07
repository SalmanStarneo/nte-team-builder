import { materialIconUrl } from '../lib/icons.js';

// Official material icon, or nothing when we don't have one yet.
export default function MaterialIcon({ name, size = 30 }) {
  const src = materialIconUrl(name);
  if (!src) return <span className="mat-icon mat-icon--none" style={{ width: size, height: size }} aria-hidden="true" />;
  return <img className="mat-icon" src={src} width={size} height={size} alt="" loading="lazy" />;
}
