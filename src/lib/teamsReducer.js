import { TEAM_SIZE } from './analyze.js';

// All team changes go through this reducer, so the rules live in one place.
// State shape: { teams: [{ id, name, members: [id|null x4] }], activeId, notice }

let counter = 0;
export const newId = () => `t${Date.now().toString(36)}${(counter++).toString(36)}`;
const emptyMembers = () => Array(TEAM_SIZE).fill(null);

export function makeTeam(name, members = emptyMembers()) {
  return { id: newId(), name, members: [...members] };
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
      const team = makeTeam(action.name, action.members);
      return {
        ...state,
        isExample: false,
        teams: [...state.teams, team],
        activeId: team.id,
        notice: `Added “${team.name}” to your teams.`,
      };
    }

    case 'duplicate': {
      const team = makeTeam(`${active.name} copy`, active.members);
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

    case 'notice':
      return { ...state, notice: action.text };

    default:
      return state;
  }
}
