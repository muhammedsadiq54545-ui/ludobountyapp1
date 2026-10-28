import { GameState, MoveOption, Player, PlayerColor, Token } from '../types/ludo';
import { getGlobalPerimeterIndex, SAFE_INDICES } from './ludoConstants';

export function getValidMovesForPlayer(player: Player, diceValue: number, allPlayers: Player[]): MoveOption[] {
  const moves: MoveOption[] = [];

  for (const token of player.tokens) {
    if (token.isHome) continue;

    // In Yard / Base
    if (token.isInBase || token.step < 0) {
      if (diceValue === 6) {
        // Can enter track at step 0 (start square)
        const targetGlobalIdx = getGlobalPerimeterIndex(player.color, 0);
        const willCapture = willCaptureOpponent(targetGlobalIdx, player.color, allPlayers);
        moves.push({
          tokenId: token.id,
          token,
          fromStep: -1,
          toStep: 0,
          willCapture,
          willReachHome: false,
        });
      }
      continue;
    }

    // On track or home stretch
    const nextStep = token.step + diceValue;
    if (nextStep > 56) {
      // Cannot overshoot home
      continue;
    }

    const willReachHome = nextStep === 56;
    let willCapture = false;

    if (nextStep < 51) {
      const targetGlobalIdx = getGlobalPerimeterIndex(player.color, nextStep);
      willCapture = willCaptureOpponent(targetGlobalIdx, player.color, allPlayers);
    }

    moves.push({
      tokenId: token.id,
      token,
      fromStep: token.step,
      toStep: nextStep,
      willCapture,
      willReachHome,
    });
  }

  return moves;
}

export function willCaptureOpponent(
  globalIndex: number,
  myColor: PlayerColor,
  allPlayers: Player[]
): boolean {
  if (globalIndex < 0 || SAFE_INDICES.has(globalIndex)) {
    return false;
  }

  for (const opponent of allPlayers) {
    if (opponent.color === myColor) continue;
    for (const oppToken of opponent.tokens) {
      if (oppToken.isInBase || oppToken.isHome || oppToken.step < 0 || oppToken.step >= 51) continue;
      const oppGlobalIdx = getGlobalPerimeterIndex(opponent.color, oppToken.step);
      if (oppGlobalIdx === globalIndex) {
        return true;
      }
    }
  }

  return false;
}

export function findCapturedToken(
  globalIndex: number,
  myColor: PlayerColor,
  allPlayers: Player[]
): { playerIndex: number; tokenId: number } | null {
  if (globalIndex < 0 || SAFE_INDICES.has(globalIndex)) {
    return null;
  }

  for (let pIdx = 0; pIdx < allPlayers.length; pIdx++) {
    const opponent = allPlayers[pIdx];
    if (opponent.color === myColor) continue;
    for (const oppToken of opponent.tokens) {
      if (oppToken.isInBase || oppToken.isHome || oppToken.step < 0 || oppToken.step >= 51) continue;
      const oppGlobalIdx = getGlobalPerimeterIndex(opponent.color, oppToken.step);
      if (oppGlobalIdx === globalIndex) {
        return { playerIndex: pIdx, tokenId: oppToken.id };
      }
    }
  }

  return null;
}

export function getNextActivePlayerIndex(currentIndex: number, players: Player[]): number {
  let next = (currentIndex + 1) % players.length;
  let loops = 0;
  while (players[next].tokensHome === 4 && loops < players.length) {
    next = (next + 1) % players.length;
    loops++;
  }
  return next;
}

export function createInitialTokens(color: PlayerColor): Token[] {
  return [0, 1, 2, 3].map((id) => ({
    id,
    color,
    step: -1,
    isHome: false,
    isInBase: true,
  }));
}
