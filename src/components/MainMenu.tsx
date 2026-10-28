import React, { useState } from 'react';
import { GameMode } from '../types/ludo';
import { soundEffects } from '../utils/soundEffects';
import { UserStats } from '../utils/storage';
import { Bot, Users, Play, Globe, Settings, LogOut, Coins, Sparkles, Trophy, AlertTriangle } from 'lucide-react';

interface MainMenuProps {
  onSelectGameType: (type: GameMode) => void;
  onContinueGame: () => void;
  hasSavedGame: boolean;
  onOpenSettings: () => void;
  stats: UserStats;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectGameType,
  onContinueGame,
  hasSavedGame,
  onOpenSettings,
  stats,
}) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleComputerClick = () => {
    soundEffects.playClick();
    onSelectGameType('vs_computer');
  };

  const handleLocalClick = () => {
    soundEffects.playClick();
    onSelectGameType('local_multiplayer');
  };

  const handleContinueClick = () => {
    soundEffects.playClick();
    if (hasSavedGame) {
      onContinueGame();
    } else {
      showToast('No saved game found. Start a new game!');
    }
  };

  const handleOnlineClick = () => {
    soundEffects.playClick();
    showToast('Online Multiplayer Coming Soon! Matchmaking is in development.');
  };

  const handleExitClick = () => {
    soundEffects.playClick();
    setShowExitDialog(true);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Background Animated Ambient Glows & Sparkles */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-5 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating subtle star particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <Sparkles className="absolute top-10 left-8 w-4 h-4 text-amber-300 animate-pulse" />
        <Sparkles className="absolute top-28 right-12 w-5 h-5 text-yellow-200 animate-pulse delay-300" />
        <Sparkles className="absolute bottom-32 left-12 w-4 h-4 text-emerald-300 animate-pulse delay-700" />
      </div>

      {/* Top Bar: Bounty Coins & Profile */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto pt-2">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-lg shadow-black/30">
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-inner">
            <Coins className="w-3.5 h-3.5 text-amber-950" />
          </div>
          <span className="text-xs font-black text-amber-300 font-mono tracking-tight">
            {stats.bountyCoins.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase font-bold text-amber-200/60 ml-0.5">Bounty</span>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenSettings();
          }}
          className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white shadow-lg active:scale-95 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Center Hero: Logo & 3D Tokens Display */}
      <div className="relative z-10 flex flex-col items-center my-auto py-4">
        {/* 3D Dice and Pawn Decorative Cluster */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-slate-300 shadow-2xl border-2 border-white flex items-center justify-center rotate-12 transform hover:rotate-6 transition-transform">
            <div className="w-4 h-4 rounded-full bg-red-600 shadow-inner" />
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 border-2 border-white shadow-xl -ml-5 mt-6 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-emerald-950" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white shadow-xl -ml-3 -mt-6 flex items-center justify-center">
            <span className="text-xs font-black text-amber-950">6</span>
          </div>
        </div>

        {/* Brand Title - Clean Flat Typography */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center tracking-tight text-amber-400 uppercase">
          Ludo Bounty
        </h1>
        <p className="text-xs font-semibold text-amber-200/80 tracking-widest uppercase mt-1">
          Classic Board Game Edition
        </p>
      </div>

      {/* Main Menu Action Buttons Panel */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-3 pb-4">
        {/* 1. Computer Button */}
        <button
          onClick={handleComputerClick}
          className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 hover:from-emerald-300 hover:to-emerald-600 shadow-xl shadow-emerald-950/60 border-t-2 border-emerald-300/70 active:scale-98 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-800/60 border border-emerald-300/40 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-emerald-200" />
            </div>
            <span>Computer</span>
          </div>
          <span className="text-xs text-emerald-200 font-mono font-bold group-hover:translate-x-1 transition-transform">
            PLAY →
          </span>
        </button>

        {/* 2. Local Button */}
        <button
          onClick={handleLocalClick}
          className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 hover:from-emerald-300 hover:to-emerald-600 shadow-xl shadow-emerald-950/60 border-t-2 border-emerald-300/70 active:scale-98 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-800/60 border border-emerald-300/40 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5 text-emerald-200" />
            </div>
            <span>Local</span>
          </div>
          <span className="text-xs text-emerald-200 font-mono font-bold group-hover:translate-x-1 transition-transform">
            PLAY →
          </span>
        </button>

        {/* 3. Continue Last Game Button */}
        <button
          onClick={handleContinueClick}
          className={`w-full py-3 px-5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-between border ${
            hasSavedGame
              ? 'text-amber-300 bg-amber-500/20 border-amber-400/50 hover:bg-amber-500/30 shadow-lg shadow-amber-950/30 active:scale-98'
              : 'text-slate-400 bg-slate-900/60 border-white/10 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center">
              <Play className="w-4 h-4" />
            </div>
            <span>Continue Last Game</span>
          </div>
          {hasSavedGame && (
            <span className="text-[10px] bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full font-bold">
              RESUME
            </span>
          )}
        </button>

        {/* 4. Online Button */}
        <button
          onClick={handleOnlineClick}
          className="w-full py-3 px-5 rounded-2xl font-extrabold text-xs uppercase tracking-wider text-slate-300 bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 transition-all flex items-center justify-between active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <span>Online</span>
          </div>
          <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-400/30">
            SOON
          </span>
        </button>

        {/* Bottom row: Settings & Exit */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSettings();
            }}
            className="py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleExitClick}
            className="py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>

        {/* Footer Privacy Policy Link */}
        <div className="pt-2 text-center">
          <a
            href="/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-amber-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
          >
            <span>Privacy Policy</span>
            <span className="text-slate-600">&bull;</span>
            <span>com.ludobounty.game</span>
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 inset-x-4 max-w-sm mx-auto z-50 p-3 bg-slate-900/95 border border-amber-400/60 text-amber-200 text-xs font-semibold rounded-2xl shadow-2xl text-center backdrop-blur-md animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xs bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Exit Game?
            </h3>
            <p className="text-xs text-slate-300 mt-1 mb-5">
              Are you sure you want to close Ludo Bounty? Unfinished games are safely saved.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowExitDialog(false);
                }}
                className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowExitDialog(false);
                  showToast('You can safely minimize or close the tab/app.');
                }}
                className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-colors"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
