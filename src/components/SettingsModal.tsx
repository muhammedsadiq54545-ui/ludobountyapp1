import React, { useState } from 'react';
import { X, Volume2, VolumeX, Zap, Smartphone, BookOpen, Code2, RotateCcw, Play, Home, AlertCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import { GameSettings } from '../types/ludo';
import { soundEffects } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenRules: () => void;
  onOpenAndroidCode: () => void;
  onResetStats: () => void;
  onLeaveGame?: () => void;
  isInGame?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenRules,
  onOpenAndroidCode,
  onResetStats,
  onLeaveGame,
  isInGame = false,
}) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!isOpen) return null;

  const toggleSound = () => {
    soundEffects.playClick();
    const next = !settings.soundEnabled;
    soundEffects.enabled = next;
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const toggleFastAnimation = () => {
    soundEffects.playClick();
    onUpdateSettings({ ...settings, fastAnimation: !settings.fastAnimation });
  };

  const toggleVibration = () => {
    soundEffects.playClick();
    onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled });
  };

  const handleLeaveClick = () => {
    soundEffects.playClick();
    setShowLeaveConfirm(true);
  };

  const handleConfirmLeave = () => {
    soundEffects.playClick();
    setShowLeaveConfirm(false);
    onClose();
    if (onLeaveGame) {
      onLeaveGame();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-amber-400/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header - Clean Flat Typography */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">
            Settings
          </h2>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Options List */}
        <div className="overflow-y-auto py-3 space-y-2.5 scrollbar-thin">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-white block">Sound Effects</span>
                <span className="text-[11px] text-slate-400">Dice roll and token sound effects</span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Moves */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Quick Moves</span>
                <span className="text-[11px] text-slate-400">Accelerate token animation speed</span>
              </div>
            </div>
            <button
              onClick={toggleFastAnimation}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.fastAnimation ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  settings.fastAnimation ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Vibration / Haptics */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Haptic Feedback</span>
                <span className="text-[11px] text-slate-400">Tactile vibrations on moves</span>
              </div>
            </div>
            <button
              onClick={toggleVibration}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.vibrationEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Game Rules */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenRules();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Game Rules</span>
                <span className="text-[11px] text-slate-400">Classic rules and board mechanics</span>
              </div>
            </div>
            <span className="text-xs text-amber-300 font-medium">View</span>
          </button>

          {/* Native Android Kotlin Project Source & Play Console AAB */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenAndroidCode();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 hover:bg-emerald-500/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-emerald-300 block">Google Play .AAB & Android</span>
                <span className="text-[11px] text-slate-300">Download project (.ZIP) & upload .AAB</span>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-lg font-bold uppercase">
              .AAB
            </span>
          </button>

          {/* Privacy Policy */}
          <a
            href="/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEffects.playClick()}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Privacy Policy</span>
                <span className="text-[11px] text-slate-400">Google Play policy & data protection</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-300 transition-colors" />
          </a>

          {/* IN-GAME SPECIFIC OPTIONS: Exit to Home / Leave Game */}
          {isInGame && onLeaveGame && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                onClick={handleLeaveClick}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-rose-400" />
                  <div>
                    <span className="text-xs font-semibold text-rose-200 block">Exit to Home</span>
                    <span className="text-[11px] text-slate-400">Save progress and return to home screen</span>
                  </div>
                </div>
                <span className="text-xs text-rose-300 font-semibold">Leave</span>
              </button>
            </div>
          )}

          {/* Reset Stats (Only in Menu) */}
          {!isInGame && (
            <button
              onClick={() => {
                soundEffects.playClick();
                if (window.confirm('Reset bounty coins and game statistics to default?')) {
                  onResetStats();
                }
              }}
              className="w-full flex items-center gap-2 p-2 rounded-2xl text-slate-400 hover:text-rose-400 text-xs justify-center hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Statistics</span>
            </button>
          )}
        </div>

        {/* Bottom Actions: Resume Game button */}
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 shadow-md shadow-emerald-950/40 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isInGame ? 'Resume Game' : 'Close'}</span>
          </button>
        </div>
      </div>

      {/* Leave Game Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xs bg-slate-900 border border-amber-400/50 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3 text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Leave Game
            </h3>
            <p className="text-xs text-slate-300 mt-2 mb-5 leading-relaxed">
              Are you sure you want to leave the current game?
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setShowLeaveConfirm(false);
                }}
                className="py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md"
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
