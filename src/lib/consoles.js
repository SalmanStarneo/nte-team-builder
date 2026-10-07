// Saved Console builds, kept in this browser only.
const KEY = 'nte-team-builder:consoles';

export function loadSavedConsoles() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function storeSavedConsoles(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}
