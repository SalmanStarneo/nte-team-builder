// Players' own character builds (for sharing a build card), kept in this
// browser only, keyed by character id:
//   { arc, arcDupes, cartridge, cartStats, pieces, consoleFrom, awakeningOrder }
const KEY = 'nte-team-builder:myBuilds';

export function loadMyBuilds() {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || '{}');
    return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
  } catch {
    return {};
  }
}

export function saveMyBuild(characterId, build) {
  try {
    const map = loadMyBuilds();
    if (build) map[characterId] = build;
    else delete map[characterId];
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable: the build just won't be remembered */
  }
}
