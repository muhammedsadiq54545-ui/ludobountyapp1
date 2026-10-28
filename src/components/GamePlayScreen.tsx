import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, GameSettings, GameState, MoveOption, Player, PlayerColor, Token } from '../types/ludo';
import { LudoBoard } from './LudoBoard';
import { PlayerCornerHUD, RollDiceButton } from './PlayerCornerHUD';
import { VictoryModal } from './VictoryModal';
import { SettingsModal } from './SettingsModal';
import { RulesModal } from './RulesModal';
import { AndroidCodeModal } from './AndroidCodeModal';
import { COLOR_CONFIG, BOUNTY_REWARDS } from '../utils/ludoConstants';
import { getValidMovesForPlayer, findCapturedToken, getNextActivePlayerIndex } from '../utils/ludoRules';
import { chooseBestMoveForAI } from '../utils/ludoAI';
import { soundEffects } from '../utils/soundEffects';
import { saveGameState, clearSavedGame, UserStats, saveStats, saveSettings } from '../utils/storage';
import { Settings, Coins, Sparkles, ChevronLeft, AlertTriangle } from 'lucide-react';

interface GamePlayScreenProps {
  initialState: GameState;
  onExitToMenu: () => void;
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  initialState,
  onExitToMenu,
  userStats,
  onUpdateStats,
  settings,
  onUpdateSettings,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showAndroidCode, setShowAndroidCode] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [winnerColor, setWinnerColor] = useState<PlayerColor>('green');
  const [bountyFloater, setBountyFloater] = useState<{ text: string; id: number } | null>(null);

  const calculateBoardSize = useCallback(() => {
    if (typeof window === 'undefined') return 300;
    const availableW = Math.min(window.innerWidth - 32, 400);
    const availableH = Math.min(window.innerHeight - 250, 400);
    return Math.max(220, Math.min(availableW, availableH, 320));
  }, []);

  const [boardSize, setBoardSize] = useState<number>(calculateBoardSize);

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(calculateBoardSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateBoardSize]);

  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  const getPlayer = (c: PlayerColor): Player | undefined => {
    return gameState.players.find((p) => p.color === c);
  };

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, []);

  const triggerBountyPopup = (text: string) => {
    setBountyFloater({ text, id: Date.now() });
    setTimeout(() => {
      setBountyFloater(null);
    }, 2000);
  };

  // Turn management: Check if Computer player should roll or move
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    if (activePlayer.isComputer) {
      if (!gameState.hasRolled && !gameState.isRolling && !gameState.activeTokenMoving) {
        aiTimerRef.current = setTimeout(() => {
          handleDiceRoll(activePlayer.color);
        }, 850);
      } else if (gameState.hasRolled && gameState.validMoves.length > 0 && !gameState.activeTokenMoving) {
        aiTimerRef.current = setTimeout(() => {
          const bestMove = chooseBestMoveForAI(activePlayer, gameState.validMoves, gameState.players);
          if (bestMove) {
            handleExecuteMove(bestMove);
          }
        }, 950);
      } else if (gameState.hasRolled && gameState.validMoves.length === 0 && !gameState.activeTokenMoving) {
        aiTimerRef.current = setTimeout(() => {
          handleAdvanceToNextPlayer('No legal moves for Computer. Passing turn.');
        }, 1200);
      }
    } else {
      if (gameState.hasRolled && gameState.validMoves.length === 0 && !gameState.activeTokenMoving) {
        aiTimerRef.current = setTimeout(() => {
          handleAdvanceToNextPlayer('No valid moves possible. Passing turn.');
        }, 1400);
      } else if (gameState.hasRolled && gameState.validMoves.length === 1 && !gameState.activeTokenMoving) {
        aiTimerRef.current = setTimeout(() => {
          handleExecuteMove(gameState.validMoves[0]);
        }, 600);
      }
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [gameState.hasRolled, gameState.isRolling, gameState.activePlayerIndex, gameState.validMoves, gameState.activeTokenMoving]);

  // Individual Dice Roll Handler
  const handleDiceRoll = useCallback((rollingColor: PlayerColor) => {
    if (activePlayer.color !== rollingColor) return;
    if (gameState.isRolling || gameState.hasRolled || gameState.activeTokenMoving) return;

    soundEffects.playDiceRoll();

    setGameState((prev) => ({
      ...prev,
      isRolling: true,
      turnMessage: `${activePlayer.name} is rolling the dice...`,
    }));

    const rollDuration = settings.fastAnimation ? 350 : 650;

    setTimeout(() => {
      const rolledValue = Math.floor(Math.random() * 6) + 1;
      const isSix = rolledValue === 6;

      soundEffects.playDiceSettle(isSix);

      setGameState((prev) => {
        const consecutive = isSix ? prev.consecutiveSixes + 1 : 0;

        if (consecutive === 3) {
          return {
            ...prev,
            diceValue: rolledValue,
            isRolling: false,
            hasRolled: true,
            consecutiveSixes: 0,
            validMoves: [],
            turnMessage: `Three 6's rolled! Turn passed.`,
          };
        }

        const moves = getValidMovesForPlayer(activePlayer, rolledValue, prev.players);

        if (isSix) {
          triggerBountyPopup(`+${BOUNTY_REWARDS.ROLL_SIX} Six Bonus`);
        }

        const msg =
          moves.length === 0
            ? `${activePlayer.name} rolled a ${rolledValue}. No moves available.`
            : isSix
            ? `${activePlayer.name} rolled a 6! Extra roll granted.`
            : `${activePlayer.name} rolled a ${rolledValue}. Choose a token to move.`;

        return {
          ...prev,
          diceValue: rolledValue,
          isRolling: false,
          hasRolled: true,
          consecutiveSixes: consecutive,
          validMoves: moves,
          turnMessage: msg,
        };
      });
    }, rollDuration);
  }, [gameState.isRolling, gameState.hasRolled, gameState.activeTokenMoving, activePlayer, settings.fastAnimation]);

  // Helper to update a token's intermediate step
  const updateIntermediateStep = (color: PlayerColor, tokenId: number, step: number) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        if (p.color !== color) return p;
        return {
          ...p,
          tokens: p.tokens.map((t) => {
            if (t.id !== tokenId) return t;
            return {
              ...t,
              step,
              isInBase: step < 0,
              isHome: step === 56,
            };
          }),
        };
      }),
    }));
  };

  // STEP-BY-STEP TOKEN MOVEMENT ANIMATION
  // Moves through each square along the valid route, one square at a time!
  const handleExecuteMove = (move: MoveOption) => {
    if (gameState.activeTokenMoving) return;

    const from = move.fromStep;
    const to = move.toStep;

    setGameState((prev) => ({
      ...prev,
      activeTokenMoving: { color: activePlayer.color, tokenId: move.tokenId },
      validMoves: [], // clear valid moves while moving
    }));

    const stepInterval = settings.fastAnimation ? 90 : 135;

    // Case 1: Releasing from yard to starting square (from -1 to 0)
    if (from < 0) {
      soundEffects.playTokenStep();
      updateIntermediateStep(activePlayer.color, move.tokenId, 0);

      stepTimerRef.current = setTimeout(() => {
        applyMoveOutcome(move);
      }, stepInterval + 60);
      return;
    }

    // Case 2: Advancing along track and home stretch square by square
    let currentStep = from;

    const hopNext = () => {
      if (currentStep < to) {
        currentStep++;
        soundEffects.playTokenStep();
        updateIntermediateStep(activePlayer.color, move.tokenId, currentStep);

        if (currentStep < to) {
          stepTimerRef.current = setTimeout(hopNext, stepInterval);
        } else {
          // Reached exact destination square! Settle briefly before checking capture / home
          stepTimerRef.current = setTimeout(() => {
            applyMoveOutcome(move);
          }, stepInterval + 50);
        }
      }
    };

    stepTimerRef.current = setTimeout(hopNext, stepInterval);
  };

  // Complete move outcome after step-by-step movement reaches destination
  const applyMoveOutcome = (move: MoveOption) => {
    // 1. Calculate next state snapshot
    const currentPlayers = gameState.players;
    const nextPlayers = currentPlayers.map((p) => {
      if (p.color !== activePlayer.color) return p;

      const updatedTokens = p.tokens.map((t) => {
        if (t.id !== move.tokenId) return t;
        return {
          ...t,
          step: move.toStep,
          isInBase: move.toStep < 0,
          isHome: move.toStep === 56,
        };
      });

      const newTokensHome = updatedTokens.filter((t) => t.isHome).length;
      return {
        ...p,
        tokens: updatedTokens,
        tokensHome: newTokensHome,
      };
    });

    const updatedActivePlayer = nextPlayers[gameState.activePlayerIndex];
    let didCapture = false;
    const didReachHome = move.willReachHome;
    let capturedPlayerName = '';

    // Check capture on destination square
    if (move.toStep < 51 && move.toStep >= 0) {
      const offset = COLOR_CONFIG[activePlayer.color];
      const targetGlobal = (offset ? (move.toStep + (activePlayer.color === 'green' ? 0 : activePlayer.color === 'red' ? 13 : activePlayer.color === 'blue' ? 26 : 39)) : move.toStep) % 52;

      const capturedInfo = findCapturedToken(targetGlobal, activePlayer.color, nextPlayers);
      if (capturedInfo) {
        didCapture = true;
        const oppPlayer = nextPlayers[capturedInfo.playerIndex];
        capturedPlayerName = oppPlayer.name;

        // Return captured token to home yard
        oppPlayer.tokens = oppPlayer.tokens.map((t) =>
          t.id === capturedInfo.tokenId
            ? { ...t, step: -1, isInBase: true, isHome: false }
            : t
        );

        updatedActivePlayer.bountyScore += BOUNTY_REWARDS.CAPTURE;
      }
    }

    // Check reaching center home
    if (didReachHome) {
      updatedActivePlayer.bountyScore += BOUNTY_REWARDS.TOKEN_HOME;
    }

    // Check for Game Victory (All 4 tokens home)
    const hasWon = updatedActivePlayer.tokensHome === 4;
    const rank = hasWon ? gameState.winnerOrder.length + 1 : undefined;
    if (hasWon && rank) {
      updatedActivePlayer.rank = rank;
    }
    const newWinnerOrder = hasWon ? [...gameState.winnerOrder, activePlayer.color] : gameState.winnerOrder;
    const isFirstWinner = hasWon && rank === 1;

    const earnedExtraRoll = (gameState.diceValue === 6 || didCapture || didReachHome) && updatedActivePlayer.tokensHome < 4;

    let nextIdx = gameState.activePlayerIndex;
    let nextTurnMessage = '';

    if (isFirstWinner) {
      nextTurnMessage = `${activePlayer.name} has Won the Game!`;
    } else if (earnedExtraRoll) {
      const reason = gameState.diceValue === 6 ? 'Rolling a 6' : didCapture ? `Capturing ${capturedPlayerName}` : 'Reaching Home';
      nextTurnMessage = `${activePlayer.name} earned an Extra Roll for ${reason}!`;
    } else {
      nextIdx = getNextActivePlayerIndex(gameState.activePlayerIndex, nextPlayers);
      const nextPlayer = nextPlayers[nextIdx];
      nextTurnMessage = `${nextPlayer.name}'s turn. Tap dice to roll.`;
    }

    // 2. Pure state transition
    setGameState((prev) => ({
      ...prev,
      players: nextPlayers,
      winnerOrder: newWinnerOrder,
      status: isFirstWinner ? 'game_over' : 'playing',
      activePlayerIndex: nextIdx,
      activeTokenMoving: null,
      hasRolled: false,
      diceValue: null,
      consecutiveSixes: 0,
      validMoves: [],
      turnMessage: nextTurnMessage,
    }));

    // 3. Side effects safely scheduled outside of React state update / render cycle
    if (didCapture) {
      soundEffects.playCapture();
      triggerBountyPopup(`+${BOUNTY_REWARDS.CAPTURE} Bounty Cut`);
      if (!activePlayer.isComputer) {
        setTimeout(() => {
          onUpdateStats({
            ...userStats,
            bountyCoins: userStats.bountyCoins + BOUNTY_REWARDS.CAPTURE,
            totalCaptures: userStats.totalCaptures + 1,
          });
        }, 0);
      }
    }

    if (didReachHome) {
      soundEffects.playTokenHome();
      triggerBountyPopup(`+${BOUNTY_REWARDS.TOKEN_HOME} Token Home`);
    }

    if (isFirstWinner) {
      clearSavedGame();
      setTimeout(() => {
        setWinnerColor(activePlayer.color);
        setShowVictory(true);
        if (!activePlayer.isComputer) {
          onUpdateStats({
            ...userStats,
            bountyCoins: userStats.bountyCoins + BOUNTY_REWARDS.WIN_FIRST,
            gamesWon: userStats.gamesWon + 1,
            gamesPlayed: userStats.gamesPlayed + 1,
          });
        }
      }, 0);
    }
  };

  const handleAdvanceToNextPlayer = (reasonMsg: string) => {
    setGameState((prev) => {
      const nextIdx = getNextActivePlayerIndex(prev.activePlayerIndex, prev.players);
      const nextPlayer = prev.players[nextIdx];
      return {
        ...prev,
        activePlayerIndex: nextIdx,
        hasRolled: false,
        isRolling: false,
        diceValue: null,
        consecutiveSixes: 0,
        validMoves: [],
        turnMessage: `${reasonMsg} Now ${nextPlayer.name}'s turn.`,
      };
    });
  };

  const handleTokenClick = (tokenId: number) => {
    if (activePlayer.isComputer || !gameState.hasRolled || gameState.activeTokenMoving) return;
    const matchingMove = gameState.validMoves.find((m) => m.tokenId === tokenId);
    if (matchingMove) {
      handleExecuteMove(matchingMove);
    }
  };

  const handleRestart = () => {
    setShowVictory(false);
    clearSavedGame();
    const freshPlayers = gameState.players.map((p) => ({
      ...p,
      tokens: [0, 1, 2, 3].map((id) => ({
        id,
        color: p.color,
        step: -1,
        isHome: false,
        isInBase: true,
      })),
      tokensHome: 0,
      rank: undefined,
      bountyScore: 0,
    }));

    setGameState({
      ...gameState,
      players: freshPlayers,
      activePlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      hasRolled: false,
      consecutiveSixes: 0,
      validMoves: [],
      status: 'playing',
      winnerOrder: [],
      turnMessage: `${freshPlayers[0].name}'s turn. Tap dice to roll.`,
      lastAction: 'Game started',
      bountyTotal: 0,
      activeTokenMoving: null,
      timestamp: Date.now(),
    });
  };

  const handleExitToMenu = () => {
    setShowVictory(false);
    onExitToMenu();
  };

  const modeLabel =
    gameState.mode === 'vs_computer'
      ? `Solo vs Computer`
      : `Local Multiplayer`;

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-x-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, #0F172A 0%, #090E1A 55%, #030712 100%)',
      }}
    >
      {/* Floating Bounty Toast */}
      {bountyFloater && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-400 text-amber-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg border border-white animate-bounce flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-950" />
          <span>{bountyFloater.text}</span>
        </div>
      )}

      {/* Top Navigation Bar Matching Reference Design */}
      <header className="relative z-20 shrink-0 flex items-center justify-between px-3 py-2.5 bg-black/75 backdrop-blur-md border-b border-white/10">
        {/* Left: Back Button & Mode Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setShowBackConfirm(true);
            }}
            type="button"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-colors active:scale-95"
            aria-label="Back to Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400">
                {gameState.mode === 'vs_computer' ? 'SOLO VS COMPUTER' : 'LOCAL MULTIPLAYER'}
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {gameState.playerCount}P
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Classic Tournament Mode
            </span>
          </div>
        </div>

        {/* Right: Coin Balance & Settings Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40 text-amber-300 font-mono text-xs font-bold shadow-xs">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{userStats.bountyCoins.toLocaleString()}</span>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setShowSettings(true);
            }}
            type="button"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-amber-300 transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Game Arena: Dedicated Top Row + Centered Ludo Board + Dedicated Bottom Row */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-2 sm:px-3 py-2 max-w-lg mx-auto w-full min-h-0">
        {/* TOP ROW: GREEN (upper-left corner) and RED (upper-right corner) completely outside the board */}
        <div
          style={{ width: Math.max(boardSize + 36, 290) }}
          className="flex justify-between items-center mb-2 px-1 shrink-0 mx-auto max-w-full"
        >
          {/* Green: Upper-left outside corner ROLL button + Player info */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <RollDiceButton
              color="green"
              diceValue={activePlayer.color === 'green' ? gameState.diceValue : null}
              isRolling={activePlayer.color === 'green' && gameState.isRolling}
              canRoll={
                activePlayer.color === 'green' &&
                !activePlayer.isComputer &&
                !gameState.hasRolled &&
                !gameState.activeTokenMoving
              }
              isActive={activePlayer.color === 'green'}
              onRollDice={() => handleDiceRoll('green')}
            />
            <PlayerCornerHUD
              color="green"
              player={getPlayer('green')}
              isActive={activePlayer.color === 'green'}
              position="top-left"
            />
          </div>

          {/* Red: Player info + Upper-right outside corner ROLL button */}
          <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
            <PlayerCornerHUD
              color="red"
              player={getPlayer('red')}
              isActive={activePlayer.color === 'red'}
              position="top-right"
            />
            <RollDiceButton
              color="red"
              diceValue={activePlayer.color === 'red' ? gameState.diceValue : null}
              isRolling={activePlayer.color === 'red' && gameState.isRolling}
              canRoll={
                activePlayer.color === 'red' &&
                !activePlayer.isComputer &&
                !gameState.hasRolled &&
                !gameState.activeTokenMoving
              }
              isActive={activePlayer.color === 'red'}
              onRollDice={() => handleDiceRoll('red')}
            />
          </div>
        </div>

        {/* CENTERED 15x15 LUDO BOARD (Completely clean, unobstructed by player info) */}
        <div className="relative shrink-0 flex items-center justify-center my-auto">
          <LudoBoard
            players={gameState.players}
            activePlayer={activePlayer}
            validMoves={gameState.validMoves}
            onTokenClick={handleTokenClick}
            movingTokenInfo={gameState.activeTokenMoving}
            boardSize={boardSize}
          />
        </div>

        {/* BOTTOM ROW: YELLOW (lower-left corner) and BLUE (lower-right corner) completely outside the board */}
        <div
          style={{ width: Math.max(boardSize + 36, 290) }}
          className="flex justify-between items-center mt-2 px-1 shrink-0 mx-auto max-w-full"
        >
          {/* Yellow: Lower-left outside corner ROLL button + Player info */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <RollDiceButton
              color="yellow"
              diceValue={activePlayer.color === 'yellow' ? gameState.diceValue : null}
              isRolling={activePlayer.color === 'yellow' && gameState.isRolling}
              canRoll={
                activePlayer.color === 'yellow' &&
                !activePlayer.isComputer &&
                !gameState.hasRolled &&
                !gameState.activeTokenMoving
              }
              isActive={activePlayer.color === 'yellow'}
              onRollDice={() => handleDiceRoll('yellow')}
            />
            <PlayerCornerHUD
              color="yellow"
              player={getPlayer('yellow')}
              isActive={activePlayer.color === 'yellow'}
              position="bottom-left"
            />
          </div>

          {/* Blue: Player info + Lower-right outside corner ROLL button */}
          <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
            <PlayerCornerHUD
              color="blue"
              player={getPlayer('blue')}
              isActive={activePlayer.color === 'blue'}
              position="bottom-right"
            />
            <RollDiceButton
              color="blue"
              diceValue={activePlayer.color === 'blue' ? gameState.diceValue : null}
              isRolling={activePlayer.color === 'blue' && gameState.isRolling}
              canRoll={
                activePlayer.color === 'blue' &&
                !activePlayer.isComputer &&
                !gameState.hasRolled &&
                !gameState.activeTokenMoving
              }
              isActive={activePlayer.color === 'blue'}
              onRollDice={() => handleDiceRoll('blue')}
            />
          </div>
        </div>

        {/* Turn Message Status Banner */}
        <div className="shrink-0 w-full max-w-xs mt-1 text-center py-1 px-3 rounded-full bg-slate-900/80 border border-white/10 text-[11px] text-slate-300 font-medium">
          {gameState.turnMessage}
        </div>
      </main>

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={showVictory}
        players={gameState.players}
        winnerColor={winnerColor}
        onRestart={handleRestart}
        onHome={handleExitToMenu}
      />

      {/* Centralized Settings Modal (Houses Leave Game with Confirmation) */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          onUpdateSettings(newSettings);
          saveSettings(newSettings);
        }}
        onOpenRules={() => setShowRules(true)}
        onOpenAndroidCode={() => setShowAndroidCode(true)}
        onResetStats={() => {
          onUpdateStats({
            bountyCoins: 1250,
            gamesPlayed: 0,
            gamesWon: 0,
            totalCaptures: 0,
          });
          saveStats({
            bountyCoins: 1250,
            gamesPlayed: 0,
            gamesWon: 0,
            totalCaptures: 0,
          });
        }}
        onLeaveGame={handleExitToMenu}
        isInGame={true}
      />

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Android Code Modal */}
      <AndroidCodeModal isOpen={showAndroidCode} onClose={() => setShowAndroidCode(false)} />

      {/* Back to Menu Confirmation Dialog */}
      {showBackConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xs bg-slate-900 border border-amber-400/40 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-base font-black uppercase tracking-wide text-white mb-1">
              Leave Current Match?
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Your match progress will be saved. Are you sure you want to return to the main menu?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowBackConfirm(false)}
                className="py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 bg-white/10 hover:bg-white/15 border border-white/10 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowBackConfirm(false);
                  handleExitToMenu();
                }}
                className="py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 shadow-md shadow-rose-950/40 active:scale-95 transition-all"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
