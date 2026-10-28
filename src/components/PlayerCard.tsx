import React from 'react';
import { Player } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';
import { Bot, User, Trophy, Coins } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isDiceRolling?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
}) => {
  const config = COLOR_CONFIG[player.color];

  return (
    <div
      className={`relative p-2 rounded-xl transition-all duration-300 backdrop-blur-md flex items-center justify-between min-w-[130px] sm:min-w-[150px] ${
        isActive
          ? `bg-slate-900/95 ring-2 ring-amber-300 shadow-lg shadow-black/40 scale-102`
          : 'bg-slate-900/60 border border-white/10 opacity-80'
      }`}
    >
      {/* Active turn ambient pulse */}
      {isActive && (
        <div
          className="absolute -inset-0.5 rounded-xl blur-xs opacity-50 pointer-events-none animate-pulse"
          style={{ backgroundColor: config.primary }}
        />
      )}

      {/* Left: Avatar & Info */}
      <div className="relative z-10 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-md relative"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${config.tokenGradStart}, ${config.tokenGradEnd})`,
            border: '2px solid rgba(255,255,255,0.7)',
          }}
        >
          {player.isComputer ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}

          {/* Winner Rank Badge */}
          {player.rank && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 border border-amber-950 flex items-center justify-center">
              <span className="text-[9px] font-black text-amber-950">#{player.rank}</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-white tracking-tight truncate max-w-[80px]">
              {player.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-300">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: config.primary }}
            />
            <span>{player.tokensHome}/4 Home</span>
          </div>
        </div>
      </div>

      {/* Right: Bounty Points */}
      <div className="relative z-10 flex flex-col items-end">
        <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xs">
          <Coins className="w-3 h-3 text-amber-400" />
          <span>{player.bountyScore}</span>
        </div>
        {isActive && (
          <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-widest animate-pulse">
            TURN
          </span>
        )}
      </div>
    </div>
  );
};
