/**
 * Unit Tests for Ludo Bounty Game Engine, Dice Behavior, Turn Ownership & Classic Rules
 */
import { getValidMovesForPlayer, willCaptureOpponent, findCapturedToken, getNextActivePlayerIndex } from './ludoRules';
import { Player } from '../types/ludo';
import { SAFE_INDICES, COLOR_OFFSETS, calculatePlayerProgress, getTokenCoordinate } from './ludoConstants';

function createMockPlayer(color: 'green' | 'red' | 'blue' | 'yellow', tokenSteps: number[]): Player {
  return {
    id: `p_${color}`,
    name: `Player ${color.toUpperCase()}`,
    color,
    isComputer: false,
    tokens: tokenSteps.map((step, id) => ({
      id,
      color,
      step,
      isInBase: step < 0,
      isHome: step === 56,
    })),
    tokensHome: tokenSteps.filter((s) => s === 56).length,
    bountyScore: 0,
  };
}

export function runLudoEngineTests(): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  const assert = (desc: string, condition: boolean) => {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${desc}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${desc}`);
    }
  };

  // Test 1: Leaving Yard requires a 6
  {
    const green = createMockPlayer('green', [-1, -1, -1, -1]);
    const movesOn5 = getValidMovesForPlayer(green, 5, [green]);
    assert('Tokens in yard cannot move on a dice roll of 5', movesOn5.length === 0);

    const movesOn6 = getValidMovesForPlayer(green, 6, [green]);
    assert('Tokens in yard can enter start square on a dice roll of 6', movesOn6.length === 4 && movesOn6[0].toStep === 0);
  }

  // Test 2: Legal track advancement
  {
    const green = createMockPlayer('green', [10, -1, -1, -1]);
    const moves = getValidMovesForPlayer(green, 4, [green]);
    assert('Active token advances step + dice value (10 + 4 = 14)', moves.length === 1 && moves[0].toStep === 14);
  }

  // Test 3: Four Corner Offsets match reference layout
  {
    assert('Green offset is 0 (Top-Left corner start)', COLOR_OFFSETS.green === 0);
    assert('Red offset is 13 (Top-Right corner start)', COLOR_OFFSETS.red === 13);
    assert('Blue offset is 26 (Bottom-Right corner start)', COLOR_OFFSETS.blue === 26);
    assert('Yellow offset is 39 (Bottom-Left corner start)', COLOR_OFFSETS.yellow === 39);
  }

  // Test 4: Safe Star Squares protect against capture
  {
    assert('Global index 8 (Green Star) is in SAFE_INDICES', SAFE_INDICES.has(8));
    assert('Global index 21 (Red Star) is in SAFE_INDICES', SAFE_INDICES.has(21));
    assert('Global index 34 (Blue Star) is in SAFE_INDICES', SAFE_INDICES.has(34));
    assert('Global index 47 (Yellow Star) is in SAFE_INDICES', SAFE_INDICES.has(47));

    const oppRed = createMockPlayer('red', [0, -1, -1, -1]);
    const canCaptureOnStar = willCaptureOpponent(8, 'green', [oppRed]);
    assert('Cannot capture opponent token on a safe star square', !canCaptureOnStar);
  }

  // Test 5: Capturing opponent on unsafe square
  {
    const green = createMockPlayer('green', [1, -1, -1, -1]);
    // Blue start is global index 26.
    // At global index 5: Blue step = (5 - 26 + 52) % 52 = 31.
    const blue = createMockPlayer('blue', [31, -1, -1, -1]);
    const willCapture = willCaptureOpponent(5, 'green', [green, blue]);
    assert('Opponent token on unsafe square will be captured', willCapture);

    const captured = findCapturedToken(5, 'green', [green, blue]);
    assert('Captured opponent is accurately identified', captured !== null && captured.playerIndex === 1);
  }

  // Test 6: Reaching home requires exact roll
  {
    const red = createMockPlayer('red', [54, -1, -1, -1]);
    const movesOvershoot = getValidMovesForPlayer(red, 3, [red]);
    assert('Dice roll of 3 overshoots home (54 + 3 = 57 > 56) and is rejected', movesOvershoot.length === 0);

    const movesExact = getValidMovesForPlayer(red, 2, [red]);
    assert('Dice roll of 2 reaches exact home (54 + 2 = 56) and willReachHome is true', movesExact.length === 1 && movesExact[0].willReachHome);
  }

  // Test 7: Turn Ownership & Rotation
  {
    const p1 = createMockPlayer('green', [-1, -1, -1, -1]);
    const p2 = createMockPlayer('red', [-1, -1, -1, -1]);
    const p3 = createMockPlayer('blue', [-1, -1, -1, -1]);
    const p4 = createMockPlayer('yellow', [-1, -1, -1, -1]);
    const players = [p1, p2, p3, p4];

    const next0 = getNextActivePlayerIndex(0, players);
    assert('Turn rotates from Player 0 (Green) to Player 1 (Red)', next0 === 1);

    const next1 = getNextActivePlayerIndex(1, players);
    assert('Turn rotates from Player 1 (Red) to Player 2 (Blue)', next1 === 2);

    const next3 = getNextActivePlayerIndex(3, players);
    assert('Turn rotates from Player 3 (Yellow) back to Player 0 (Green)', next3 === 0);

    // Skip finished players
    p2.tokensHome = 4; // Player 1 finished all 4 tokens
    const nextSkipFinished = getNextActivePlayerIndex(0, players);
    assert('Turn skips finished player and advances to next active player', nextSkipFinished === 2);
  }

  // Test 8: Progress percentage computation
  {
    const p = createMockPlayer('green', [-1, -1, -1, -1]);
    assert('All tokens in yard yields 0% progress', calculatePlayerProgress(p.tokens) === 0);

    const pDone = createMockPlayer('green', [56, 56, 56, 56]);
    assert('All tokens home yields 100% progress', calculatePlayerProgress(pDone.tokens) === 100);

    const pHalf = createMockPlayer('green', [28, 28, 28, 28]);
    assert('All tokens at step 28 yields 50% progress', calculatePlayerProgress(pHalf.tokens) === 50);
  }

  // Test 9: Route Connection to Center (No gaps or offsets)
  {
    // Green: perimeter step 50 at (7, 0) -> home stretch (7, 1..5) -> center (7, 6.8)
    const g0 = getTokenCoordinate('green', 0, 0);
    const g50 = getTokenCoordinate('green', 50, 0);
    const g51 = getTokenCoordinate('green', 51, 0);
    const g55 = getTokenCoordinate('green', 55, 0);
    const g56 = getTokenCoordinate('green', 56, 0);
    assert('Green starts at row 6, col 1', g0.r === 6 && g0.c === 1);
    assert('Green turns into home run from (7, 0)', g50.r === 7 && g50.c === 0);
    assert('Green home run step 51 starts at (7, 1)', g51.r === 7 && g51.c === 1);
    assert('Green home run step 55 reaches (7, 5) adjacent to center col 6', g55.r === 7 && g55.c === 5);
    assert('Green reaches Center Left Triangle at step 56', g56.r === 7 && Math.abs(g56.c - 6.8) < 0.1);

    // Red: perimeter step 50 at (0, 7) -> home stretch (1..5, 7) -> center (6.8, 7)
    const r0 = getTokenCoordinate('red', 0, 0);
    const r50 = getTokenCoordinate('red', 50, 0);
    const r51 = getTokenCoordinate('red', 51, 0);
    const r55 = getTokenCoordinate('red', 55, 0);
    const r56 = getTokenCoordinate('red', 56, 0);
    assert('Red starts at row 1, col 8', r0.r === 1 && r0.c === 8);
    assert('Red turns into home run from (0, 7)', r50.r === 0 && r50.c === 7);
    assert('Red home run step 51 starts at (1, 7)', r51.r === 1 && r51.c === 7);
    assert('Red home run step 55 reaches (5, 7) adjacent to center row 6', r55.r === 5 && r55.c === 7);
    assert('Red reaches Center Top Triangle at step 56', Math.abs(r56.r - 6.8) < 0.1 && r56.c === 7);

    // Blue: perimeter step 50 at (7, 14) -> home stretch (7, 13..9) -> center (7, 7.2)
    const b0 = getTokenCoordinate('blue', 0, 0);
    const b50 = getTokenCoordinate('blue', 50, 0);
    const b51 = getTokenCoordinate('blue', 51, 0);
    const b55 = getTokenCoordinate('blue', 55, 0);
    const b56 = getTokenCoordinate('blue', 56, 0);
    assert('Blue starts at row 8, col 13', b0.r === 8 && b0.c === 13);
    assert('Blue turns into home run from (7, 14)', b50.r === 7 && b50.c === 14);
    assert('Blue home run step 51 starts at (7, 13)', b51.r === 7 && b51.c === 13);
    assert('Blue home run step 55 reaches (7, 9) adjacent to center col 8', b55.r === 7 && b55.c === 9);
    assert('Blue reaches Center Right Triangle at step 56', b56.r === 7 && Math.abs(b56.c - 7.2) < 0.1);

    // Yellow: perimeter step 50 at (14, 7) -> home stretch (13..9, 7) -> center (7.2, 7)
    const y0 = getTokenCoordinate('yellow', 0, 0);
    const y50 = getTokenCoordinate('yellow', 50, 0);
    const y51 = getTokenCoordinate('yellow', 51, 0);
    const y55 = getTokenCoordinate('yellow', 55, 0);
    const y56 = getTokenCoordinate('yellow', 56, 0);
    assert('Yellow starts at row 13, col 6', y0.r === 13 && y0.c === 6);
    assert('Yellow turns into home run from (14, 7)', y50.r === 14 && y50.c === 7);
    assert('Yellow home run step 51 starts at (13, 7)', y51.r === 13 && y51.c === 7);
    assert('Yellow home run step 55 reaches (9, 7) adjacent to center row 8', y55.r === 9 && y55.c === 7);
    assert('Yellow reaches Center Bottom Triangle at step 56', Math.abs(y56.r - 7.2) < 0.1 && y56.c === 7);
  }

  // Test 10: Tokens in Yard are strictly contained inside 6x6 home areas
  {
    for (const color of ['green', 'red', 'yellow', 'blue'] as const) {
      for (let t = 0; t < 4; t++) {
        const coord = getTokenCoordinate(color, -1, t);
        if (color === 'green') {
          assert(`Green token ${t} inside Top-Left yard (rows 0..5, cols 0..5)`, coord.r >= 0 && coord.r <= 5 && coord.c >= 0 && coord.c <= 5);
        } else if (color === 'red') {
          assert(`Red token ${t} inside Top-Right yard (rows 0..5, cols 9..14)`, coord.r >= 0 && coord.r <= 5 && coord.c >= 9 && coord.c <= 14);
        } else if (color === 'yellow') {
          assert(`Yellow token ${t} inside Bottom-Left yard (rows 9..14, cols 0..5)`, coord.r >= 9 && coord.r <= 14 && coord.c >= 0 && coord.c <= 5);
        } else if (color === 'blue') {
          assert(`Blue token ${t} inside Bottom-Right yard (rows 9..14, cols 9..14)`, coord.r >= 9 && coord.r <= 14 && coord.c >= 9 && coord.c <= 14);
        }
      }
    }
  }

  return { passed, failed, results };
}
