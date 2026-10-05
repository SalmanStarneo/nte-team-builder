import { TEAM_SIZE } from './analyze.js';
import { MODULE_SLOTS } from '../data/gear.js';
import { MAX_ARC_DUPES, MAX_DUPES } from '../data/awakenings.js';

// All team changes go through this reducer, so the rules live in one place.
// State shape: { teams: [{ id, name, members: [id|null x4], loadouts }], activeId, notice }
// loadouts: { [characterId]: { arc, arcDupes, cartridge, modules: [{ type, stat } | null x4],
//   dupes, awakenings: ['A4', 'A1', ...] } }
// dupes = extra copies (0 = one copy). Up to `dupes` awakenings may be on, in any order.
// Loadouts are per team, so one character can be geared differently in two teams.

let counter = 0;
export const newId = () => `t${Date.now().toString(36)}${(counter++).toString(36)}`;
const emptyMembers = () => Array(TEAM_SIZE).fill(null);

export function makeTeam(name, members = emptyMembers(), loadouts = {}) {
  return { id: newId(), name, members: [...members], loadouts: structuredClone(loadouts) };
}

export const emptyLoadout = () => ({
  arc: null,
  arcDupes: 0,
  cartridge: null,
  modules: Array(MODULE_SLOTS).fill(null),
  dupes: 0,
  awakenings: [],
});

export function loadoutOf(team, charId) {
  // Merge with defaults so loadouts saved before new fields existed still work.
  return { ...emptyLoadout(), ...(team.loadouts?.[charId] ?? {}) };
}

export function initialState(saved) {
  if (saved) return { ...saved, notice: null };
  const teams = [
    makeTeam('Mono Blossom', ['nanally', 'jiuyuan', 'zero', 'hotori']),
    makeTeam('Lacrimosa Scorch', ['lacrimosa', 'sakiri', 'adler', 'fadia']),
  ];
  return { teams, activeId: teams[0].id, notice: null, isExample: true };
}

function nextName(teams) {
  let n = teams.length + 1;
  while (teams.some((t) => t.name === `Team ${n}`)) n += 1;
  return `Team ${n}`;
}

function updateActive(state, fn) {
  return {
    ...state,
    isExample: false,
    teams: state.teams.map((t) => (t.id === state.activeId ? fn(t) : t)),
  };
}

export function teamsReducer(state, action) {
  const active = state.teams.find((t) => t.id === state.activeId);
  switch (action.type) {
    case 'select':
      return { ...state, activeId: action.id, notice: null };

    case 'add': {
      const team = makeTeam(nextName(state.teams));
      return { ...state, teams: [...state.teams, team], activeId: team.id, notice: null };
    }

    case 'import': {
      const loadouts = Object.fromEntries(
        Object.entries(action.loadouts ?? {}).map(([id, lo]) => [id, { ...emptyLoadout(), ...lo }]),
      );
      const team = makeTeam(action.name, action.members, loadouts);
      return {
        ...state,
        isExample: false,
        teams: [...state.teams, team],
        activeId: team.id,
        notice: `Added “${team.name}” to your teams.`,
      };
    }

    case 'duplicate': {
      const team = makeTeam(`${active.name} copy`, active.members, active.loadouts);
      return { ...state, teams: [...state.teams, team], activeId: team.id, notice: null };
    }

    case 'remove': {
      if (state.teams.length === 1) {
        // Keep at least one team around; just empty it.
        return updateActive(state, (t) => ({ ...t, members: emptyMembers() }));
      }
      const index = state.teams.findIndex((t) => t.id === state.activeId);
      const teams = state.teams.filter((t) => t.id !== state.activeId);
      const next = teams[Math.max(0, index - 1)];
      return { ...state, teams, activeId: next.id, notice: `Deleted “${active.name}”.` };
    }

    case 'rename':
      return updateActive(state, (t) => ({ ...t, name: action.name }));

    case 'toggle': {
      // Tap a character: remove if already in team, else fill the first empty slot.
      if (active.members.includes(action.charId)) {
        return {
          ...updateActive(state, (t) => ({
            ...t,
            members: t.members.map((id) => (id === action.charId ? null : id)),
          })),
          notice: null,
        };
      }
      const slot = active.members.indexOf(null);
      if (slot === -1) {
        return { ...state, notice: 'This team is full. Remove someone first.' };
      }
      return {
        ...updateActive(state, (t) => ({
          ...t,
          members: t.members.map((id, i) => (i === slot ? action.charId : id)),
        })),
        notice: null,
      };
    }

    case 'clearSlot':
      return updateActive(state, (t) => ({
        ...t,
        members: t.members.map((id, i) => (i === action.index ? null : id)),
      }));

    case 'clear':
      return updateActive(state, (t) => ({ ...t, members: emptyMembers() }));

    case 'loadPreset':
      return {
        ...updateActive(state, (t) => ({ ...t, name: action.name, members: [...action.members] })),
        notice: `Loaded ${action.name} into this team.`,
      };

    case 'setLoadout':
      return updateActive(state, (t) => ({
        ...t,
        loadouts: {
          ...t.loadouts,
          [action.charId]: { ...loadoutOf(t, action.charId), ...action.patch },
        },
      }));

    case 'setDupes': {
      const dupes = Math.max(0, Math.min(MAX_DUPES, action.dupes));
      return updateActive(state, (t) => {
        const cur = loadoutOf(t, action.charId);
        // Fewer copies than active awakenings: keep the ones chosen first.
        const awakenings = cur.awakenings.slice(0, dupes);
        return { ...t, loadouts: { ...t.loadouts, [action.charId]: { ...cur, dupes, awakenings } } };
      });
    }

    case 'setArcDupes': {
      const arcDupes = Math.max(0, Math.min(MAX_ARC_DUPES, action.arcDupes));
      return updateActive(state, (t) => ({
        ...t,
        loadouts: { ...t.loadouts, [action.charId]: { ...loadoutOf(t, action.charId), arcDupes } },
      }));
    }

    case 'toggleAwakening': {
      const t0 = state.teams.find((t) => t.id === state.activeId);
      const cur = loadoutOf(t0, action.charId);
      const on = cur.awakenings.includes(action.id);
      if (!on && cur.awakenings.length >= cur.dupes) {
        return {
          ...state,
          notice:
            cur.dupes === 0
              ? 'Add a duplicate first: each one unlocks an awakening.'
              : `All ${cur.dupes} awakening slot${cur.dupes > 1 ? 's are' : ' is'} in use. Turn one off or add a duplicate.`,
        };
      }
      const awakenings = on ? cur.awakenings.filter((x) => x !== action.id) : [...cur.awakenings, action.id];
      return {
        ...updateActive(state, (t) => ({
          ...t,
          loadouts: { ...t.loadouts, [action.charId]: { ...cur, awakenings } },
        })),
        notice: null,
      };
    }

    case 'notice':
      return { ...state, notice: action.text };

    default:
      return state;
  }
}
