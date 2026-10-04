// Small stat icons, drawn for this app in the spirit of the in-game stat list.
const PATHS = {
  hp: (
    <path d="M10 17.2 3.6 11A3.9 3.9 0 0 1 9.1 5.5l.9.9.9-.9A3.9 3.9 0 0 1 16.4 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  atk: (
    <path d="m3 15 4.5-5L10 13l3-4.5L17 15M10 4.5v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  def: (
    <path d="M10 2.8 16 5v4.6c0 3.6-2.6 6.4-6 7.6-3.4-1.2-6-4-6-7.6V5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  critRate: (
    <>
      <path d="M10 2.5 17.5 10 10 17.5 2.5 10Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.2" fill="currentColor" />
    </>
  ),
  critDmg: (
    <path d="M10 2.5 17.5 10 10 17.5 2.5 10Z M10 6.2 13.8 10 10 13.8 6.2 10Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  dmgBonus: (
    <path d="M10 3.2 17.2 16H2.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
};

export default function StatIcon({ stat, size = 16 }) {
  return (
    <svg className="stat-icon" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      {PATHS[stat]}
    </svg>
  );
}
