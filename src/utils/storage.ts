import { GameSettings, GameState } from '../types/ludo';

const SAVED_GAME_KEY = 'LUDO_BOUNTY_ACTIVE_GAME_v1';
const SETTINGS_KEY = 'LUDO_BOUNTY_SETTINGS_v1';
const STATS_KEY = 'LUDO_BOUNTY_STATS_v1';

export interface UserStats {
  bountyCoins: number;
  gamesPlayed: number;
  gamesWon: number;
  totalCaptures: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  fastAnimation: false,
  vibrationEnabled: true,
};

export const DEFAULT_STATS: UserStats = {
  bountyCoins: 1250, // Starting bounty bonus
  gamesPlayed: 0,
  gamesWon: 0,
  totalCaptures: 0,
};

export function saveGameState(state: GameState): void {
  try {
    if (state.status === 'game_over') {
      localStorage.removeItem(SAVED_GAME_KEY);
      return;
    }
    localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state', e);
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVED_GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed && parsed.players && parsed.players.length >= 2 && parsed.status === 'playing') {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse saved game', e);
  }
  return null;
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVED_GAME_KEY);
  } catch (e) {
    console.error('Failed to clear saved game', e);
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STATS;
}
