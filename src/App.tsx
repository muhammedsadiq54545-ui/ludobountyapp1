import React, { useState, useEffect } from 'react';
import { GameMode, GameSettings, GameState, Player } from './types/ludo';
import { MainMenu } from './components/MainMenu';
import { SelectModeScreen } from './components/SelectModeScreen';
import { SelectPlayersScreen } from './components/SelectPlayersScreen';
import { GamePlayScreen } from './components/GamePlayScreen';
import { SettingsModal } from './components/SettingsModal';
import { RulesModal } from './components/RulesModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { loadGameState, loadSettings, loadStats, saveSettings, saveStats, UserStats } from './utils/storage';
import { Smartphone, Monitor } from 'lucide-react';
import { soundEffects } from './utils/soundEffects';

type Screen = 'menu' | 'mode' | 'players' | 'game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedGameType, setSelectedGameType] = useState<GameMode>('vs_computer');
  const [activeGameState, setActiveGameState] = useState<GameState | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);

  // Settings & User Stats
  const [settings, setSettings] = useState<GameSettings>(loadSettings());
  const [stats, setStats] = useState<UserStats>(loadStats());

  // Global modals
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showAndroidCodeModal, setShowAndroidCodeModal] = useState<boolean>(false);

  // Layout View Mode (Mobile Phone Chassis vs Full Viewport)
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);

  // Check saved game on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setHasSavedGame(true);
    }
    soundEffects.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    soundEffects.enabled = newSettings.soundEnabled;
  };

  const handleUpdateStats = (newStats: UserStats) => {
    setStats(newStats);
    saveStats(newStats);
  };

  // 1. Menu: User taps Computer or Local
  const handleSelectGameType = (type: GameMode) => {
    setSelectedGameType(type);
    setCurrentScreen('mode');
  };

  // 2. Menu: Continue Last Game
  const handleContinueLastGame = () => {
    const saved = loadGameState();
    if (saved) {
      setActiveGameState(saved);
      setCurrentScreen('game');
    }
  };

  // 3. Select Mode: Play pressed -> Proceed to Select Players
  const handleModeConfirmed = (_modeName: string) => {
    setCurrentScreen('players');
  };

  // 4. Select Players: Start Game pressed -> Initialize GameState & Launch Board
  const handleStartGame = (configuredPlayers: Player[]) => {
    const startingPlayer = configuredPlayers[0];

    const newGameState: GameState = {
      mode: selectedGameType,
      playerCount: configuredPlayers.length as 2 | 3 | 4,
      players: configuredPlayers,
      activePlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      hasRolled: false,
      consecutiveSixes: 0,
      validMoves: [],
      status: 'playing',
      winnerOrder: [],
      turnMessage: `${startingPlayer.name}'s turn. Tap dice to roll.`,
      lastAction: 'Game started',
      bountyTotal: 0,
      activeTokenMoving: null,
      timestamp: Date.now(),
    };

    setActiveGameState(newGameState);
    setHasSavedGame(true);
    setCurrentScreen('game');
  };

  // 5. Leave game back to Main Menu
  const handleExitToMenu = () => {
    const saved = loadGameState();
    setHasSavedGame(!!saved);
    setCurrentScreen('menu');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative font-sans text-white">
      {/* Viewport Frame Switcher (for desktop testing) */}
      <div className="hidden sm:flex fixed top-3 right-3 z-50 items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl text-xs">
        <button
          onClick={() => setPhoneFrameMode(true)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
            phoneFrameMode ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Android Device View"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Mockup</span>
        </button>
        <button
          onClick={() => setPhoneFrameMode(false)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
            !phoneFrameMode ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Full Viewport"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Screen</span>
        </button>
      </div>

      {/* Main Container / Android Device Bezel */}
      <div
        className={`relative w-full overflow-hidden transition-all duration-300 ${
          phoneFrameMode
            ? 'max-w-[440px] h-[92vh] max-h-[880px] rounded-[38px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[10px] border-slate-800 ring-1 ring-white/10'
            : 'max-w-2xl h-screen'
        }`}
      >
        {/* Android Camera Punch Hole / Speaker Grill (in device mode) */}
        {phoneFrameMode && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2 border border-white/5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-black border border-slate-700" />
            <div className="w-8 h-1 rounded-full bg-slate-800" />
          </div>
        )}

        {/* Dynamic Screen Routing */}
        {currentScreen === 'menu' && (
          <MainMenu
            onSelectGameType={handleSelectGameType}
            onContinueGame={handleContinueLastGame}
            hasSavedGame={hasSavedGame}
            onOpenSettings={() => setShowSettingsModal(true)}
            stats={stats}
          />
        )}

        {currentScreen === 'mode' && (
          <SelectModeScreen
            gameType={selectedGameType}
            onBack={() => setCurrentScreen('menu')}
            onPlay={handleModeConfirmed}
          />
        )}

        {currentScreen === 'players' && (
          <SelectPlayersScreen
            gameType={selectedGameType}
            onBack={() => setCurrentScreen('mode')}
            onStartGame={handleStartGame}
          />
        )}

        {currentScreen === 'game' && activeGameState && (
          <GamePlayScreen
            initialState={activeGameState}
            onExitToMenu={handleExitToMenu}
            userStats={stats}
            onUpdateStats={handleUpdateStats}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </div>

      {/* Global Modals */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenAndroidCode={() => setShowAndroidCodeModal(true)}
        onResetStats={() => {
          handleUpdateStats({
            bountyCoins: 1250,
            gamesPlayed: 0,
            gamesWon: 0,
            totalCaptures: 0,
          });
        }}
      />

      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <AndroidCodeModal
        isOpen={showAndroidCodeModal}
        onClose={() => setShowAndroidCodeModal(false)}
      />
    </div>
  );
}
