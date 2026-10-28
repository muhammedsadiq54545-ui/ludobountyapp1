import React, { useState } from 'react';
import { GameMode, Player, PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';
import { createInitialTokens } from '../utils/ludoRules';
import { soundEffects } from '../utils/soundEffects';
import { ArrowLeft, User, Bot, UserX, Check, AlertCircle, Play } from 'lucide-react';

interface SelectPlayersScreenProps {
  gameType: GameMode;
  onBack: () => void;
  onStartGame: (players: Player[]) => void;
}

type SlotType = 'human' | 'computer' | 'nobody';

export const SelectPlayersScreen: React.FC<SelectPlayersScreenProps> = ({
  gameType,
  onBack,
  onStartGame,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In Local mode, user can customize slot assignments
  // Default configurations:
  // 2P: Green (Human), Blue (Opposite: Human or Computer)
  // 3P: Green, Yellow, Red
  // 4P: Green, Yellow, Blue, Red
  const [localSlots, setLocalSlots] = useState<Record<PlayerColor, SlotType>>({
    green: 'human',
    yellow: 'nobody',
    blue: 'human',
    red: 'nobody',
  });

  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    soundEffects.playClick();
    setPlayerCount(count);
    setErrorMsg(null);

    // Update active slots default according to count
    if (count === 2) {
      setLocalSlots({
        green: 'human',
        yellow: 'nobody',
        blue: gameType === 'vs_computer' ? 'computer' : 'human',
        red: 'nobody',
      });
    } else if (count === 3) {
      setLocalSlots({
        green: 'human',
        yellow: gameType === 'vs_computer' ? 'computer' : 'human',
        red: gameType === 'vs_computer' ? 'computer' : 'human',
        blue: 'nobody',
      });
    } else {
      setLocalSlots({
        green: 'human',
        yellow: gameType === 'vs_computer' ? 'computer' : 'human',
        blue: gameType === 'vs_computer' ? 'computer' : 'human',
        red: gameType === 'vs_computer' ? 'computer' : 'human',
      });
    }
  };

  const handleLocalToggleSlot = (color: PlayerColor) => {
    if (gameType === 'vs_computer') {
      // In computer mode, configuration is determined by player count
      return;
    }
    soundEffects.playClick();
    setErrorMsg(null);

    const current = localSlots[color];
    const next: SlotType = current === 'human' ? 'nobody' : 'human';
    setLocalSlots((prev) => ({ ...prev, [color]: next }));
  };

  // Determine active slots based on mode and count
  const getSlotConfig = (color: PlayerColor): { type: SlotType; isActive: boolean; label: string } => {
    if (gameType === 'vs_computer') {
      if (playerCount === 2) {
        if (color === 'green') return { type: 'human', isActive: true, label: 'You (Human)' };
        if (color === 'blue') return { type: 'computer', isActive: true, label: 'Computer AI' };
        return { type: 'nobody', isActive: false, label: 'Inactive' };
      } else if (playerCount === 3) {
        if (color === 'green') return { type: 'human', isActive: true, label: 'You (Human)' };
        if (color === 'yellow') return { type: 'computer', isActive: true, label: 'Computer 1' };
        if (color === 'red') return { type: 'computer', isActive: true, label: 'Computer 2' };
        return { type: 'nobody', isActive: false, label: 'Inactive' };
      } else {
        if (color === 'green') return { type: 'human', isActive: true, label: 'You (Human)' };
        if (color === 'yellow') return { type: 'computer', isActive: true, label: 'Computer 1' };
        if (color === 'blue') return { type: 'computer', isActive: true, label: 'Computer 2' };
        if (color === 'red') return { type: 'computer', isActive: true, label: 'Computer 3' };
        return { type: 'nobody', isActive: false, label: 'Inactive' };
      }
    } else {
      // Local multiplayer
      const type = localSlots[color];
      const isActive = type === 'human';
      return {
        type,
        isActive,
        label: isActive ? 'Player (Human)' : 'Nobody',
      };
    }
  };

  const handlePlayClick = () => {
    soundEffects.playClick();

    const colors: PlayerColor[] = ['green', 'red', 'blue', 'yellow'];
    const activePlayers: Player[] = [];

    for (const color of colors) {
      const config = getSlotConfig(color);
      if (config.isActive) {
        activePlayers.push({
          id: `player_${color}`,
          name:
            color === 'green'
              ? 'Player GREEN'
              : gameType === 'vs_computer'
              ? config.type === 'human'
                ? 'Player 1'
                : `Computer ${color.toUpperCase()}`
              : `Player ${color.toUpperCase()}`,
          color,
          isComputer: config.type === 'computer',
          tokens: createInitialTokens(color),
          tokensHome: 0,
          bountyScore: 0,
        });
      }
    }

    // Validation
    if (gameType === 'local_multiplayer') {
      if (activePlayers.length < 2) {
        setErrorMsg('Please activate at least 2 player slots for local multiplayer.');
        return;
      }
      if (activePlayers.length !== playerCount) {
        setErrorMsg(`Selected ${playerCount}P mode, but ${activePlayers.length} slots are active. Please activate exactly ${playerCount} slots.`);
        return;
      }
    }

    if (activePlayers.length < 2) {
      setErrorMsg('At least 2 players are required to start a game.');
      return;
    }

    onStartGame(activePlayers);
  };

  return (
    <div className="relative w-full h-full flex flex-col min-h-0 justify-between bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header - Fixed & Pinned */}
      <header className="relative z-20 shrink-0 flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-md">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
            SELECT PLAYERS
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">
            {gameType === 'vs_computer' ? 'Computer Mode' : 'Local Multiplayer'}
          </span>
        </div>

        {/* Empty placeholder for symmetry */}
        <div className="w-16" />
      </header>

      {/* Middle Scrollable Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-thin">
        {/* Player Count Selection (2P, 3P, 4P) */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-xl max-w-sm mx-auto w-full">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 px-1">
            Select Player Count
          </span>
          <div className="grid grid-cols-3 gap-2">
            {([2, 3, 4] as const).map((count) => {
              const isSelected = playerCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-md scale-102'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                  <span>{count}P</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Player Slots (Green, Red, Yellow, Blue) */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-3.5 border border-white/15 shadow-xl space-y-2 max-w-sm mx-auto w-full">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Player Slots Configuration
            </span>
            <span className="text-[10px] text-amber-300/80 font-medium">
              {gameType === 'vs_computer' ? 'Auto-assigned' : 'Tap to toggle'}
            </span>
          </div>

          {(['green', 'yellow', 'blue', 'red'] as PlayerColor[]).map((color) => {
            const config = COLOR_CONFIG[color];
            const slot = getSlotConfig(color);

            return (
              <div
                key={color}
                onClick={() => handleLocalToggleSlot(color)}
                className={`p-2.5 rounded-2xl transition-all flex items-center justify-between ${
                  slot.isActive
                    ? 'bg-slate-950/90 border-2 border-white/20 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-white/5 border border-white/5 opacity-50'
                } ${gameType === 'local_multiplayer' ? 'cursor-pointer hover:opacity-100' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Color disc */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md relative shrink-0"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${config.tokenGradStart}, ${config.tokenGradEnd})`,
                      border: '2px solid rgba(255,255,255,0.7)',
                    }}
                  >
                    {slot.type === 'human' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : slot.type === 'computer' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <UserX className="w-4 h-4 text-white/60" />
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      {config.name}
                    </span>
                    <span className="text-[11px] text-slate-300 leading-none">{slot.label}</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div>
                  {slot.isActive ? (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: config.primary }}
                    >
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                      INACTIVE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2 max-w-sm mx-auto w-full">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Bar - PLAY & BACK BUTTONS ALWAYS VISIBLE */}
      <footer className="relative z-30 shrink-0 w-full p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md border-t border-white/10 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-sm mx-auto flex items-center gap-3">
          {/* Back button beside PLAY button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onBack();
            }}
            type="button"
            className="w-1/3 py-3.5 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* PLAY Button - Prominent, Glossy Green with Highlight */}
          <button
            onClick={handlePlayClick}
            type="button"
            className="flex-1 py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider text-white bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 hover:from-emerald-300 hover:to-emerald-600 shadow-xl shadow-emerald-950/60 border-t-2 border-emerald-300/70 active:scale-95 transition-all flex items-center justify-center gap-2 ring-2 ring-emerald-400/40"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
