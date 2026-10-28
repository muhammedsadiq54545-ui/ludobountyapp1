import React from 'react';
import { Player, PlayerColor } from '../types/ludo';
import { COLOR_CONFIG, calculatePlayerProgress } from '../utils/ludoConstants';
import { User, Bot } from 'lucide-react';

interface PlayerCornerHUDProps {
  color: PlayerColor;
  player: Player | undefined;
  isActive: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * PlayerCornerHUD: Displays player info card (Avatar, Human/AI badge, 0/4 home count, Progress bar & percentage)
 * Positioned in separate dedicated top/bottom rows alongside the corner ROLL buttons,
 * completely outside the playable board and tokens.
 */
export const PlayerCornerHUD: React.FC<PlayerCornerHUDProps> = ({
  color,
  player,
  isActive,
  position,
}) => {
  const config = COLOR_CONFIG[color];

  if (!player) {
    return (
      <div className="w-[88px] sm:w-[110px] py-1 bg-transparent opacity-30 flex items-center justify-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          {config.name} (Off)
        </span>
      </div>
    );
  }

  const progress = calculatePlayerProgress(player.tokens);
  const isRightSide = position === 'top-right' || position === 'bottom-right';
  const roleLabel = player.isComputer ? 'AI' : 'Human';

  return (
    <div
      className={`relative transition-all duration-300 w-[88px] sm:w-[110px] py-0.5 bg-transparent border-0 shadow-none ring-0 ${
        isRightSide ? 'text-right' : 'text-left'
      } ${isActive ? 'opacity-100' : 'opacity-75'}`}
    >
      {/* Avatar, Role Badge, and 0/4 Counter Row */}
      <div className={`flex items-center gap-1 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
        {!isRightSide && (
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${config.tokenGradStart}, ${config.tokenGradEnd})`,
              border: '1.5px solid rgba(255,255,255,0.85)',
            }}
          >
            {player.isComputer ? (
              <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            ) : (
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            )}
          </div>
        )}

        <span
          className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-white shadow-xs shrink-0"
          style={{ backgroundColor: config.primary }}
        >
          {roleLabel}
        </span>

        <span className="px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-mono font-bold text-slate-200 bg-white/10 border border-white/10 shadow-xs shrink-0">
          {player.tokensHome}/4
        </span>

        {isRightSide && (
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${config.tokenGradStart}, ${config.tokenGradEnd})`,
              border: '1.5px solid rgba(255,255,255,0.85)',
            }}
          >
            {player.isComputer ? (
              <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            ) : (
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Progress Bar & Percentage */}
      <div className="mt-1 w-full">
        <div className={`flex items-center justify-between text-[8px] sm:text-[9px] text-slate-300 font-mono ${isRightSide ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="font-medium text-slate-400">Progress</span>
          <span className="text-amber-300 font-bold">{progress}%</span>
        </div>
        <div className="w-full h-1 sm:h-1.5 bg-slate-800/90 rounded-full overflow-hidden mt-0.5 border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: config.primary,
            }}
          />
        </div>
      </div>
    </div>
  );
};

interface RollDiceButtonProps {
  color: PlayerColor;
  diceValue: number | null;
  isRolling: boolean;
  canRoll: boolean;
  isActive: boolean;
  onRollDice: () => void;
}

/**
 * RollDiceButton: The standalone 3D ROLL dice button positioned at the four outside edges of the board
 * (Green: upper-left, Red: upper-right, Yellow: lower-left, Blue: lower-right).
 */
export const RollDiceButton: React.FC<RollDiceButtonProps> = ({
  color,
  diceValue,
  isRolling,
  canRoll,
  isActive,
  onRollDice,
}) => {
  const config = COLOR_CONFIG[color];

  const renderDiceFace = () => {
    const pipClass = 'w-2.5 h-2.5 rounded-full bg-slate-900 shadow-inner';
    const centerRedPip = diceValue === 1 ? 'w-3.5 h-3.5 rounded-full bg-red-600 shadow-inner' : pipClass;

    if (!diceValue && !isRolling) {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
            ROLL
          </span>
        </div>
      );
    }

    if (isRolling) {
      return (
        <div className="w-6 h-6 rounded-md border-2 border-dashed border-amber-600 animate-spin" />
      );
    }

    switch (diceValue) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className={centerRedPip} />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2">
            <span className={pipClass} />
            <span className={`${pipClass} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2">
            <span className={pipClass} />
            <span className={`${pipClass} self-center`} />
            <span className={`${pipClass} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-2 p-2 w-full h-full place-items-center">
            <span className={pipClass} /><span className={pipClass} />
            <span className={pipClass} /><span className={pipClass} />
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-3 grid-rows-3 p-1.5 w-full h-full place-items-center">
            <span className={`${pipClass} col-start-1 row-start-1`} />
            <span className={`${pipClass} col-start-3 row-start-1`} />
            <span className={`${pipClass} col-start-2 row-start-2 bg-red-600`} />
            <span className={`${pipClass} col-start-1 row-start-3`} />
            <span className={`${pipClass} col-start-3 row-start-3`} />
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 grid-rows-3 gap-x-2.5 gap-y-1 p-1.5 w-full h-full place-items-center">
            <span className={pipClass} /><span className={pipClass} />
            <span className={pipClass} /><span className={pipClass} />
            <span className={pipClass} /><span className={pipClass} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={canRoll ? onRollDice : undefined}
      disabled={!canRoll || isRolling}
      type="button"
      aria-label={`${config.name} Dice Button`}
      className={`relative shrink-0 rounded-2xl transition-all select-none ${
        canRoll
          ? 'cursor-pointer scale-105 hover:scale-110 active:scale-95 ring-2 ring-amber-300 shadow-lg shadow-amber-500/30 animate-pulse'
          : isActive && isRolling
          ? 'cursor-wait scale-100 ring-2 ring-amber-300'
          : 'cursor-not-allowed opacity-60'
      }`}
      style={{
        width: 52,
        height: 52,
        background: 'linear-gradient(145deg, #FFFFFF, #E2E8F0)',
        borderTop: '2px solid rgba(255,255,255,0.95)',
        borderLeft: '2px solid rgba(255,255,255,0.85)',
        borderRight: '2px solid rgba(203,213,225,0.9)',
        borderBottom: '3px solid rgba(148,163,184,0.95)',
        boxShadow: isActive
          ? `0 8px 16px -2px rgba(0,0,0,0.55), 0 0 14px ${config.primary}80`
          : '0 4px 8px -2px rgba(0,0,0,0.3)',
      }}
    >
      {/* Glossy highlight */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-2xl" />

      {/* Dice Face Content */}
      <div className="w-full h-full flex items-center justify-center relative z-10">
        {renderDiceFace()}
      </div>

      {/* TAP label visual cue when human needs to roll */}
      {canRoll && !isRolling && (
        <span className="absolute -bottom-2.5 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-amber-950 bg-amber-400 border border-white shadow-md">
          TAP
        </span>
      )}
    </button>
  );
};
