export type PlayerColor = 'green' | 'yellow' | 'blue' | 'red';

export type GameMode = 'vs_computer' | 'local_multiplayer';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'game_over';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  // position:
  // -1: in base / yard
  // 0 to 50: on track relative to player's start (0 = player's start, 50 = last track square before home column)
  // 51 to 55: home path (51 = 1st step, 55 = 5th step)
  // 56: HOME (finished)
  step: number; 
  isHome: boolean;
  isInBase: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isComputer: boolean;
  tokens: Token[];
  tokensHome: number;
  rank?: number; // 1st, 2nd, 3rd, 4th
  bountyScore: number;
}

export interface MoveOption {
  tokenId: number;
  token: Token;
  fromStep: number;
  toStep: number;
  willCapture: boolean;
  willReachHome: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  fastAnimation: boolean;
  vibrationEnabled: boolean;
}

export interface GameState {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  players: Player[];
  activePlayerIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  hasRolled: boolean;
  consecutiveSixes: number;
  validMoves: MoveOption[];
  status: GameStatus;
  winnerOrder: PlayerColor[];
  turnMessage: string;
  lastAction: string;
  bountyTotal: number;
  activeTokenMoving: { color: PlayerColor; tokenId: number } | null;
  timestamp: number;
}
