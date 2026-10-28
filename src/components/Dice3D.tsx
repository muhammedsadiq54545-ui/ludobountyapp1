import React from 'react';
import { PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';

interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  onRoll: () => void;
  size?: number;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  onRoll,
  size = 64,
}) => {
  const colorData = COLOR_CONFIG[activeColor];

  // Render pips for a face
  const renderPips = (val: number | null) => {
    if (!val) {
      return (
        <div className="text-white/40 font-bold text-xs uppercase tracking-wider">
          Roll
        </div>
      );
    }

    const pipClass = "w-2.5 h-2.5 rounded-full bg-slate-900 shadow-inner";
    const centerRedPip = val === 1 ? "w-4 h-4 rounded-full bg-red-600 shadow-inner shadow-red-950/40" : pipClass;

    switch (val) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className={centerRedPip} />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2.5">
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
          <div className="grid grid-cols-2 gap-2.5 p-2 w-full h-full place-items-center">
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
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
          <div className="grid grid-cols-2 grid-rows-3 gap-x-3 gap-y-1 p-2 w-full h-full place-items-center">
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={canRoll ? onRoll : undefined}
        disabled={!canRoll || isRolling}
        type="button"
        aria-label="Roll dice"
        className={`relative group transition-all duration-200 select-none ${
          canRoll ? 'cursor-pointer scale-100 hover:scale-105 active:scale-95' : 'cursor-default opacity-85'
        }`}
        style={{ width: size, height: size }}
      >
        {/* Glow indicator when eligible to roll */}
        {canRoll && !isRolling && (
          <div
            className="absolute -inset-2 rounded-2xl animate-pulse blur-sm opacity-80"
            style={{ backgroundColor: colorData.primary }}
          />
        )}

        {/* 3D Dice Shadow */}
        <div className="absolute -bottom-2 inset-x-2 h-3 bg-black/40 rounded-full blur-[3px] transform scale-90" />

        {/* 3D Dice Cube Face */}
        <div
          className={`w-full h-full rounded-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-300 ${
            isRolling ? 'animate-spin' : ''
          }`}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF, #E2E8F0)',
            borderTop: '2px solid rgba(255,255,255,0.9)',
            borderLeft: '2px solid rgba(255,255,255,0.7)',
            borderRight: '2px solid rgba(203,213,225,0.8)',
            borderBottom: '3px solid rgba(148,163,184,0.9)',
            boxShadow: canRoll
              ? `0 10px 20px -3px rgba(0,0,0,0.4), 0 0 12px ${colorData.primary}66`
              : '0 8px 16px -4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Subtle gloss reflection */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-2xl" />

          {/* Dice Content */}
          <div className="w-full h-full flex items-center justify-center z-10">
            {renderPips(value)}
          </div>
        </div>

        {/* Turn prompt overlay button */}
        {canRoll && !isRolling && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-extrabold uppercase tracking-widest text-amber-300 whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-400/40">
            TAP TO ROLL
          </span>
        )}
      </button>
    </div>
  );
};
