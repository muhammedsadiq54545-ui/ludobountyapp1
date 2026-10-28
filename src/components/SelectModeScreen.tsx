import React, { useState } from 'react';
import { GameMode } from '../types/ludo';
import { soundEffects } from '../utils/soundEffects';
import { ArrowLeft, Dices, Users, CheckCircle2, Sparkles, Play } from 'lucide-react';

interface SelectModeScreenProps {
  gameType: GameMode;
  onBack: () => void;
  onPlay: (modeName: string) => void;
}

export const SelectModeScreen: React.FC<SelectModeScreenProps> = ({
  gameType,
  onBack,
  onPlay,
}) => {
  const [selectedTopCard, setSelectedTopCard] = useState<'normal' | 'team'>('normal');
  const [selectedSubMode, setSelectedSubMode] = useState<string>('CLASSIC');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTopCardClick = (card: 'normal' | 'team') => {
    soundEffects.playClick();
    if (card === 'team') {
      showToast('2v2 Team Mode Coming Soon! Join forces with a teammate in a future update.');
    } else {
      setSelectedTopCard('normal');
    }
  };

  const handleClassicSelect = () => {
    soundEffects.playClick();
    setSelectedSubMode('CLASSIC');
  };

  const handlePlayClick = () => {
    soundEffects.playClick();
    if (selectedSubMode !== 'CLASSIC') {
      showToast('Please select Classic mode to continue.');
      return;
    }
    onPlay(selectedSubMode);
  };

  return (
    <div className="relative w-full h-full flex flex-col min-h-0 justify-between bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
            SELECT MODE
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">
            {gameType === 'vs_computer' ? 'Computer Mode' : 'Local Multiplayer'}
          </span>
        </div>

        {/* Symmetry placeholder */}
        <div className="w-16" />
      </header>

      {/* Main Scrollable Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {/* Top Section: Two Visual Cards (Normal vs 2v2 Team) */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
          {/* Card 1: Normal */}
          <div
            onClick={() => handleTopCardClick('normal')}
            className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-md flex flex-col items-center text-center ${
              selectedTopCard === 'normal'
                ? 'bg-slate-900/90 border-2 border-amber-400 shadow-xl shadow-amber-950/30 scale-102 ring-2 ring-amber-400/40'
                : 'bg-white/5 border border-white/10 opacity-75 hover:opacity-100 hover:bg-white/10'
            }`}
          >
            {selectedTopCard === 'normal' && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg mb-2">
              <Dices className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Normal
            </span>
            <span className="text-[10px] text-emerald-300 mt-0.5">Classic Rules</span>
          </div>

          {/* Card 2: 2v2 Team */}
          <div
            onClick={() => handleTopCardClick('team')}
            className="relative p-4 rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-md flex flex-col items-center text-center bg-white/5 border border-white/10 opacity-70 hover:opacity-90 hover:bg-white/10"
          >
            <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-400/30">
              SOON
            </span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center shadow-lg mb-2">
              <Users className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              2v2 Team
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Co-op Play</span>
          </div>
        </div>

        {/* Mode Selection Panel */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/15 shadow-2xl max-w-sm mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AVAILABLE MODES
            </h2>
            <span className="text-[10px] text-slate-400">1 Active</span>
          </div>

          {/* Only CLASSIC Mode is displayed */}
          <div
            onClick={handleClassicSelect}
            className="w-full p-4 rounded-2xl cursor-pointer transition-all bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-amber-500/10 border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shrink-0">
                <Dices className="w-6 h-6 text-amber-950" />
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-amber-300 uppercase tracking-wide block">
                  CLASSIC
                </span>
                <span className="text-[11px] text-slate-300 leading-tight">
                  Standard 4-color rules, home stretch & bounties
                </span>
              </div>
            </div>

            <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-amber-950" />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="relative z-30 shrink-0 w-full p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md border-t border-white/10 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-sm mx-auto flex items-center gap-3">
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

          {/* PLAY Button */}
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

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 inset-x-4 max-w-sm mx-auto z-50 p-3 bg-slate-900/95 border border-amber-400/60 text-amber-200 text-xs font-semibold rounded-2xl shadow-2xl text-center backdrop-blur-md animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
