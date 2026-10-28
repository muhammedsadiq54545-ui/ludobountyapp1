import { MoveOption, Player, PlayerColor } from '../types/ludo';
import { getGlobalPerimeterIndex, SAFE_INDICES } from './ludoConstants';

export function chooseBestMoveForAI(
  aiPlayer: Player,
  validMoves: MoveOption[],
  allPlayers: Player[]
): MoveOption | null {
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) return validMoves[0];

  let bestMove: MoveOption = validMoves[0];
  let highestScore = -Infinity;

  for (const move of validMoves) {
    let score = 0;

    // 1. Move reaches center home: top priority
    if (move.willReachHome) {
      score += 2000;
    }

    // 2. Move captures an opponent: high bounty and extra turn
    if (move.willCapture) {
      score += 1500;
    }

    // 3. Move token out of yard (base) when rolled a 6
    if (move.fromStep === -1 && move.toStep === 0) {
      score += 900;
    }

    // 4. Moving to a safe star square
    if (move.toStep < 51) {
      const targetGlobal = getGlobalPerimeterIndex(aiPlayer.color, move.toStep);
      if (SAFE_INDICES.has(targetGlobal)) {
        score += 450;
      }
    }

    // 5. Entering home stretch (safe from all captures)
    if (move.fromStep < 51 && move.toStep >= 51) {
      score += 700;
    }

    // 6. Escape from danger: is current token currently in danger of being captured by someone behind?
    if (move.fromStep >= 0 && move.fromStep < 51) {
      const currentGlobal = getGlobalPerimeterIndex(aiPlayer.color, move.fromStep);
      if (!SAFE_INDICES.has(currentGlobal)) {
        const isUnderThreat = checkThreat(currentGlobal, aiPlayer.color, allPlayers);
        if (isUnderThreat) {
          score += 600; // escaping danger is crucial
        }
      }
    }

    // 7. Avoid moving into an unsafe square if an opponent can capture right away
    if (move.toStep < 51) {
      const targetGlobal = getGlobalPerimeterIndex(aiPlayer.color, move.toStep);
      if (!SAFE_INDICES.has(targetGlobal)) {
        const isDangerousDestination = checkThreat(targetGlobal, aiPlayer.color, allPlayers);
        if (isDangerousDestination) {
          score -= 300;
        }
      }
    }

    // 8. Progress bonus (farthest ahead token or nearest to home)
    score += move.toStep * 10;

    if (score > highestScore) {
      highestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function checkThreat(globalIndex: number, myColor: PlayerColor, allPlayers: Player[]): boolean {
  for (const opp of allPlayers) {
    if (opp.color === myColor) continue;
    for (const token of opp.tokens) {
      if (token.isInBase || token.isHome || token.step < 0 || token.step >= 51) continue;
      const oppGlobal = getGlobalPerimeterIndex(opp.color, token.step);
      // Distance from opp to target
      const dist = (globalIndex - oppGlobal + 52) % 52;
      // If opponent is 1 to 6 steps behind, it's an immediate threat!
      if (dist >= 1 && dist <= 6) {
        return true;
      }
    }
  }
  return false;
}
