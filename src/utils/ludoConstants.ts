import { PlayerColor } from '../types/ludo';

export interface GridCoord {
  r: number;
  c: number;
}

// 52 cells around perimeter, indexed 0..51
// Clockwise arrangement:
// Green: Top-Left  (Start at Square 0: Row 6, Col 1)
// Red:   Top-Right (Start at Square 13: Row 1, Col 8)
// Blue:  Bottom-Right (Start at Square 26: Row 8, Col 13)
// Yellow: Bottom-Left (Start at Square 39: Row 13, Col 6)
export const PERIMETER_PATH: GridCoord[] = [
  /* 0 - Green Start */ { r: 6, c: 1 },
  /* 1 */ { r: 6, c: 2 },
  /* 2 */ { r: 6, c: 3 },
  /* 3 */ { r: 6, c: 4 },
  /* 4 */ { r: 6, c: 5 },
  /* 5 */ { r: 5, c: 6 },
  /* 6 */ { r: 4, c: 6 },
  /* 7 */ { r: 3, c: 6 },
  /* 8 - Safe Star (Green) */ { r: 2, c: 6 },
  /* 9 */ { r: 1, c: 6 },
  /* 10 */ { r: 0, c: 6 },
  /* 11 */ { r: 0, c: 7 },
  /* 12 */ { r: 0, c: 8 },
  /* 13 - Red Start */ { r: 1, c: 8 },
  /* 14 */ { r: 2, c: 8 },
  /* 15 */ { r: 3, c: 8 },
  /* 16 */ { r: 4, c: 8 },
  /* 17 */ { r: 5, c: 8 },
  /* 18 */ { r: 6, c: 9 },
  /* 19 */ { r: 6, c: 10 },
  /* 20 */ { r: 6, c: 11 },
  /* 21 - Safe Star (Red) */ { r: 6, c: 12 },
  /* 22 */ { r: 6, c: 13 },
  /* 23 */ { r: 6, c: 14 },
  /* 24 */ { r: 7, c: 14 },
  /* 25 */ { r: 8, c: 14 },
  /* 26 - Blue Start */ { r: 8, c: 13 },
  /* 27 */ { r: 8, c: 12 },
  /* 28 */ { r: 8, c: 11 },
  /* 29 */ { r: 8, c: 10 },
  /* 30 */ { r: 8, c: 9 },
  /* 31 */ { r: 9, c: 8 },
  /* 32 */ { r: 10, c: 8 },
  /* 33 */ { r: 11, c: 8 },
  /* 34 - Safe Star (Blue) */ { r: 12, c: 8 },
  /* 35 */ { r: 13, c: 8 },
  /* 36 */ { r: 14, c: 8 },
  /* 37 */ { r: 14, c: 7 },
  /* 38 */ { r: 14, c: 6 },
  /* 39 - Yellow Start */ { r: 13, c: 6 },
  /* 40 */ { r: 12, c: 6 },
  /* 41 */ { r: 11, c: 6 },
  /* 42 */ { r: 10, c: 6 },
  /* 43 */ { r: 9, c: 6 },
  /* 44 */ { r: 8, c: 5 },
  /* 45 */ { r: 8, c: 4 },
  /* 46 */ { r: 8, c: 3 },
  /* 47 - Safe Star (Yellow) */ { r: 8, c: 2 },
  /* 48 */ { r: 8, c: 1 },
  /* 49 */ { r: 8, c: 0 },
  /* 50 */ { r: 7, c: 0 },
  /* 51 */ { r: 6, c: 0 },
];

export const COLOR_OFFSETS: Record<PlayerColor, number> = {
  green: 0,
  red: 13,
  blue: 26,
  yellow: 39,
};

// Safe squares on perimeter (0..51)
export const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// 5 home stretch cells + 1 center home cell
export const HOME_STRETCH_PATHS: Record<PlayerColor, GridCoord[]> = {
  green: [
    { r: 7, c: 1 },
    { r: 7, c: 2 },
    { r: 7, c: 3 },
    { r: 7, c: 4 },
    { r: 7, c: 5 },
    { r: 7, c: 6.8 }, // Center home triangle (left)
  ],
  red: [
    { r: 1, c: 7 },
    { r: 2, c: 7 },
    { r: 3, c: 7 },
    { r: 4, c: 7 },
    { r: 5, c: 7 },
    { r: 6.8, c: 7 }, // Center home triangle (top)
  ],
  blue: [
    { r: 7, c: 13 },
    { r: 7, c: 12 },
    { r: 7, c: 11 },
    { r: 7, c: 10 },
    { r: 7, c: 9 },
    { r: 7, c: 7.2 }, // Center home triangle (right)
  ],
  yellow: [
    { r: 13, c: 7 },
    { r: 12, c: 7 },
    { r: 11, c: 7 },
    { r: 10, c: 7 },
    { r: 9, c: 7 },
    { r: 7.2, c: 7 }, // Center home triangle (bottom)
  ],
};

// Exact slot centers for drawing slot rings in the 4 corner homes
export const BASE_SLOT_CENTERS: Record<PlayerColor, GridCoord[]> = {
  green: [
    { r: 1.7, c: 1.7 },
    { r: 1.7, c: 4.3 },
    { r: 4.3, c: 1.7 },
    { r: 4.3, c: 4.3 },
  ],
  red: [
    { r: 1.7, c: 10.7 },
    { r: 1.7, c: 13.3 },
    { r: 4.3, c: 10.7 },
    { r: 4.3, c: 13.3 },
  ],
  yellow: [
    { r: 10.7, c: 1.7 },
    { r: 10.7, c: 4.3 },
    { r: 13.3, c: 1.7 },
    { r: 13.3, c: 4.3 },
  ],
  blue: [
    { r: 10.7, c: 10.7 },
    { r: 10.7, c: 13.3 },
    { r: 13.3, c: 10.7 },
    { r: 13.3, c: 13.3 },
  ],
};

// Token top-left positions (center minus 0.5 for 1x1 token container)
export const BASE_POSITIONS: Record<PlayerColor, GridCoord[]> = {
  // Top-Left: Green Home
  green: [
    { r: 1.2, c: 1.2 },
    { r: 1.2, c: 3.8 },
    { r: 3.8, c: 1.2 },
    { r: 3.8, c: 3.8 },
  ],
  // Top-Right: Red Home
  red: [
    { r: 1.2, c: 10.2 },
    { r: 1.2, c: 12.8 },
    { r: 3.8, c: 10.2 },
    { r: 3.8, c: 12.8 },
  ],
  // Bottom-Right: Blue Home
  blue: [
    { r: 10.2, c: 10.2 },
    { r: 10.2, c: 12.8 },
    { r: 12.8, c: 10.2 },
    { r: 12.8, c: 12.8 },
  ],
  // Bottom-Left: Yellow Home
  yellow: [
    { r: 10.2, c: 1.2 },
    { r: 10.2, c: 3.8 },
    { r: 12.8, c: 1.2 },
    { r: 12.8, c: 3.8 },
  ],
};

// Color palettes and theme styling
export const COLOR_CONFIG: Record<PlayerColor, {
  name: string;
  primary: string;
  dark: string;
  light: string;
  border: string;
  tokenGradStart: string;
  tokenGradEnd: string;
  bgBadge: string;
  highlightRing: string;
}> = {
  green: {
    name: 'Green',
    primary: '#10B981', // emerald
    dark: '#047857',
    light: '#6EE7B7',
    border: '#065F46',
    tokenGradStart: '#34D399',
    tokenGradEnd: '#059669',
    bgBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    highlightRing: 'ring-emerald-400',
  },
  red: {
    name: 'Red',
    primary: '#EF4444', // ruby red
    dark: '#B91C1C',
    light: '#FCA5A5',
    border: '#991B1B',
    tokenGradStart: '#F87171',
    tokenGradEnd: '#DC2626',
    bgBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    highlightRing: 'ring-rose-400',
  },
  blue: {
    name: 'Blue',
    primary: '#3B82F6', // royal blue
    dark: '#1D4ED8',
    light: '#93C5FD',
    border: '#1E40AF',
    tokenGradStart: '#60A5FA',
    tokenGradEnd: '#2563EB',
    bgBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    highlightRing: 'ring-blue-400',
  },
  yellow: {
    name: 'Yellow',
    primary: '#FBBF24', // amber/gold
    dark: '#B45309',
    light: '#FDE68A',
    border: '#92400E',
    tokenGradStart: '#FDE047',
    tokenGradEnd: '#D97706',
    bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    highlightRing: 'ring-amber-400',
  },
};

export const BOUNTY_REWARDS = {
  CAPTURE: 120,      // Coins awarded for cutting/capturing opponent
  TOKEN_HOME: 250,   // Coins awarded for getting token to center home
  WIN_FIRST: 1000,   // 1st place bounty jackpot
  WIN_SECOND: 500,   // 2nd place bounty
  ROLL_SIX: 30,      // Rolling a 6
};

// Calculate physical grid coordinate for a token
export function getTokenCoordinate(color: PlayerColor, step: number, tokenId: number): GridCoord {
  // In yard
  if (step < 0) {
    return BASE_POSITIONS[color][tokenId];
  }
  // On home stretch (51..56)
  if (step >= 51) {
    const homeIndex = Math.min(step - 51, 5);
    return HOME_STRETCH_PATHS[color][homeIndex];
  }
  // On perimeter track (0..50)
  const offset = COLOR_OFFSETS[color];
  const globalIndex = (offset + step) % 52;
  return PERIMETER_PATH[globalIndex];
}

// Convert player step to global perimeter index, or -1 if in yard/home
export function getGlobalPerimeterIndex(color: PlayerColor, step: number): number {
  if (step < 0 || step >= 51) return -1;
  return (COLOR_OFFSETS[color] + step) % 52;
}

// Calculate consistent progress percentage based on token steps
// Each token has 56 steps to reach home (step 0 = start square, step 56 = center home).
// In yard (step -1) = 0 steps. Total steps = 56 * 4 = 224 steps.
export function calculatePlayerProgress(tokens: { step: number; isHome: boolean }[]): number {
  let earnedSteps = 0;
  for (const t of tokens) {
    if (t.isHome) {
      earnedSteps += 56;
    } else if (t.step >= 0) {
      earnedSteps += t.step;
    }
  }
  const maxSteps = 56 * tokens.length;
  if (maxSteps === 0) return 0;
  return Math.min(100, Math.round((earnedSteps / maxSteps) * 100));
}
