import React from 'react';
import { X, Shield, Star, Trophy, Sparkles, AlertCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-amber-400/30 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-amber-300 tracking-wide uppercase">
              Classic Ludo Rules
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-3 space-y-4 text-xs text-slate-300 leading-relaxed pr-1">
          <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Rolling a Six (6)</span>
              A roll of 6 allows you to move a token out of the yard onto your start square, OR advance any token 6 squares. Rolling a 6 also grants an extra roll!
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Three Sixes Penalty</span>
              Rolling three consecutive 6s voids the third roll and immediately passes the turn to the next player.
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
            <Star className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Capturing & Bounties</span>
              Landing on an opponent token on an unsafe cell captures it and sends it back to their yard. Captures reward an extra roll and +120 Bounty Coins!
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
            <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Safe Squares</span>
              Squares marked with a Star or Arrow are Safe Zones. Tokens on safe squares cannot be captured by opponents.
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
            <Trophy className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Home Stretch & Victory</span>
              Tokens must complete the 52 perimeter steps, then enter their color-coded home run. An exact dice roll is required to reach the center home. The first player to bring all 4 tokens home wins!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 shadow-md shadow-emerald-950/40 active:scale-98 transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
