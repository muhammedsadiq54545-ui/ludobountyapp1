import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoConstants';
import { Trophy, RotateCcw, Home, Sparkles, Coins } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface VictoryModalProps {
  isOpen: boolean;
  players: Player[];
  winnerColor: PlayerColor;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  players,
  winnerColor,
  onRestart,
  onHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEffects.playWin();

      // Confetti celebration blasts
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FBBF24', '#10B981', '#3B82F6', '#EF4444'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FBBF24', '#10B981', '#3B82F6', '#EF4444'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const winner = players.find((p) => p.color === winnerColor) || players[0];
  const winnerConfig = COLOR_CONFIG[winner.color];

  // Sort players by tokens home (and rank)
  const rankedPlayers = [...players].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return b.tokensHome - a.tokensHome;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Glow halo */}
        <div className="absolute -top-12 w-28 h-28 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

        {/* 3D Trophy Badge */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-4 border-white shadow-xl flex items-center justify-center -mt-12 mb-3 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-950" />
        </div>

        {/* Heading */}
        <span className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          VICTORY!
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </span>

        <h1 className="text-2xl font-black text-white mt-1">
          {winner.name} Wins!
        </h1>

        <div className="mt-1 flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: winnerConfig.primary }}
          >
            {winnerConfig.name} Player
          </span>
          <span className="text-xs text-slate-300">
            {winner.isComputer ? 'Computer AI' : 'Human'}
          </span>
        </div>

        {/* Bounty Reward Card */}
        <div className="mt-4 w-full p-3 bg-white/10 rounded-2xl border border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Champion Bounty</span>
              <span className="text-[10px] text-amber-300">Jackpot Reward</span>
            </div>
          </div>
          <span className="text-lg font-black text-amber-300 font-mono tracking-tight">
            +1,000 Coins
          </span>
        </div>

        {/* Rankings Breakdown */}
        <div className="mt-4 w-full space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-left px-1">
            Match Standings
          </span>
          {rankedPlayers.map((player, idx) => {
            const pConfig = COLOR_CONFIG[player.color];
            return (
              <div
                key={player.color}
                className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300 w-4 text-left">
                    #{idx + 1}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: pConfig.primary }}
                  />
                  <span className="font-semibold text-white truncate max-w-[100px]">
                    {player.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">{player.tokensHome}/4 Home</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {player.bountyScore} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 w-full grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundEffects.playClick();
              onRestart();
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 shadow-lg shadow-emerald-950/40 border-t border-emerald-300/40 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onHome();
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-white/10 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
