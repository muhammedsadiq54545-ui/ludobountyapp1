import React, { useMemo } from 'react';
import { Player, PlayerColor, Token, MoveOption } from '../types/ludo';
import { COLOR_CONFIG, getTokenCoordinate, BASE_SLOT_CENTERS, calculatePlayerProgress } from '../utils/ludoConstants';
import { Star, Trophy, ArrowRight, ArrowDown, ArrowLeft, ArrowUp } from 'lucide-react';

interface LudoBoardProps {
  players: Player[];
  activePlayer: Player;
  validMoves: MoveOption[];
  onTokenClick: (tokenId: number) => void;
  movingTokenInfo: { color: PlayerColor; tokenId: number } | null;
  boardSize?: number;
}

interface TrackCellDef {
  r: number;
  c: number;
  type: 'regular' | 'green-home' | 'red-home' | 'blue-home' | 'yellow-home' | 'start' | 'star';
  color?: PlayerColor;
  icon?: React.ReactNode;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activePlayer,
  validMoves,
  onTokenClick,
  movingTokenInfo,
  boardSize = 520,
}) => {
  const validTokenIds = useMemo(() => {
    return new Set(validMoves.map((m) => m.tokenId));
  }, [validMoves]);

  const activeTokens = useMemo(() => {
    const list: { player: Player; token: Token }[] = [];
    for (const p of players) {
      for (const t of p.tokens) {
        list.push({ player: p, token: t });
      }
    }
    return list;
  }, [players]);

  const tokensByCoord = useMemo(() => {
    const map = new Map<string, { player: Player; token: Token }[]>();
    for (const item of activeTokens) {
      const coord = getTokenCoordinate(item.player.color, item.token.step, item.token.id);
      const key = `${coord.r.toFixed(1)}_${coord.c.toFixed(1)}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }
    return map;
  }, [activeTokens]);

  // Generate all 72 playable track cells on the unified 15x15 grid
  const trackCells = useMemo(() => {
    const cells: TrackCellDef[] = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const inGreenHome = r < 6 && c < 6;
        const inRedHome = r < 6 && c >= 9;
        const inYellowHome = r >= 9 && c < 6;
        const inBlueHome = r >= 9 && c >= 9;
        const inCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

        if (inGreenHome || inRedHome || inYellowHome || inBlueHome || inCenter) {
          continue; // Covered by quadrant or center panels
        }

        // Start squares
        if (r === 6 && c === 1) {
          cells.push({ r, c, type: 'start', color: 'green', icon: <ArrowRight className="w-3.5 h-3.5 text-white" /> });
        } else if (r === 1 && c === 8) {
          cells.push({ r, c, type: 'start', color: 'red', icon: <ArrowDown className="w-3.5 h-3.5 text-white" /> });
        } else if (r === 8 && c === 13) {
          cells.push({ r, c, type: 'start', color: 'blue', icon: <ArrowLeft className="w-3.5 h-3.5 text-white" /> });
        } else if (r === 13 && c === 6) {
          cells.push({ r, c, type: 'start', color: 'yellow', icon: <ArrowUp className="w-3.5 h-3.5 text-white" /> });
        }
        // Safe star squares
        else if ((r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8) || (r === 8 && c === 2)) {
          cells.push({ r, c, type: 'star', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> });
        }
        // Colored home stretch runways
        else if (r === 7 && c >= 1 && c <= 5) {
          cells.push({ r, c, type: 'green-home', color: 'green' });
        } else if (c === 7 && r >= 1 && r <= 5) {
          cells.push({ r, c, type: 'red-home', color: 'red' });
        } else if (r === 7 && c >= 9 && c <= 13) {
          cells.push({ r, c, type: 'blue-home', color: 'blue' });
        } else if (c === 7 && r >= 9 && r <= 13) {
          cells.push({ r, c, type: 'yellow-home', color: 'yellow' });
        }
        // Regular perimeter track cells
        else {
          cells.push({ r, c, type: 'regular' });
        }
      }
    }
    return cells;
  }, []);

  return (
    <div className="relative select-none flex items-center justify-center p-1 sm:p-2">
      {/* 3D Board Outer Bezel Frame */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
        style={{
          width: boardSize,
          height: boardSize,
          maxWidth: '100%',
          aspectRatio: '1 / 1',
          background: 'linear-gradient(135deg, #B45309 0%, #F59E0B 50%, #D97706 100%)', // Orange-gold tournament board frame
          padding: 8,
          boxShadow: '0 20px 45px -10px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 24px rgba(245, 158, 11, 0.25)',
          border: '4px solid #FCD34D', // Gold outer trim
        }}
      >
        {/* Inner 15x15 Master Canvas Container */}
        <div className="relative w-full h-full bg-[#FFFFFF] rounded-xl overflow-hidden shadow-inner border border-amber-950/40">
          
          {/* ================= 1. FOUR CORNER HOME YARDS ================= */}
          {/* GREEN HOME (Top-Left: cols 0..6, rows 0..6 -> 40% x 40%) */}
          <HomeYardQuadrant
            color="green"
            player={players.find((p) => p.color === 'green')}
            left="0%"
            top="0%"
            slotCenters={BASE_SLOT_CENTERS.green}
            cornerOffsetR={0}
            cornerOffsetC={0}
            boardSize={boardSize}
          />

          {/* RED HOME (Top-Right: cols 9..15, rows 0..6 -> 40% x 40%) */}
          <HomeYardQuadrant
            color="red"
            player={players.find((p) => p.color === 'red')}
            left="60%"
            top="0%"
            slotCenters={BASE_SLOT_CENTERS.red}
            cornerOffsetR={0}
            cornerOffsetC={9}
            boardSize={boardSize}
          />

          {/* YELLOW HOME (Bottom-Left: cols 0..6, rows 9..15 -> 40% x 40%) */}
          <HomeYardQuadrant
            color="yellow"
            player={players.find((p) => p.color === 'yellow')}
            left="0%"
            top="60%"
            slotCenters={BASE_SLOT_CENTERS.yellow}
            cornerOffsetR={9}
            cornerOffsetC={0}
            boardSize={boardSize}
          />

          {/* BLUE HOME (Bottom-Right: cols 9..15, rows 9..15 -> 40% x 40%) */}
          <HomeYardQuadrant
            color="blue"
            player={players.find((p) => p.color === 'blue')}
            left="60%"
            top="60%"
            slotCenters={BASE_SLOT_CENTERS.blue}
            cornerOffsetR={9}
            cornerOffsetC={9}
            boardSize={boardSize}
          />

          {/* ================= 2. CENTRAL VICTORY FINISHING AREA ================= */}
          {/* Spans rows 6..8, cols 6..8 (exactly 20% x 20% right at center 40% to 60%) */}
          <div
            className="absolute z-10 overflow-hidden shadow-md"
            style={{
              left: '40%',
              top: '40%',
              width: '20%',
              height: '20%',
              boxShadow: 'inset 0 0 0 1px #CBD5E1',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Green Triangle (Left: connects to Green home stretch) */}
              <polygon points="0,0 50,50 0,100" fill="#059669" />
              {/* Red Triangle (Top: connects to Red home stretch) */}
              <polygon points="0,0 50,50 100,0" fill="#DC2626" />
              {/* Blue Triangle (Right: connects to Blue home stretch) */}
              <polygon points="100,0 50,50 100,100" fill="#2563EB" />
              {/* Yellow Triangle (Bottom: connects to Yellow home stretch) */}
              <polygon points="0,100 50,50 100,100" fill="#D97706" />

              {/* Dividing crisp lines */}
              <line x1="0" y1="0" x2="100" y2="100" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>

            {/* Central Victory Crest */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 border-2 border-white shadow-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-950" />
              </div>
            </div>
          </div>

          {/* ================= 3. PLAYABLE TRACK CELLS (72 CELLS) ================= */}
          {trackCells.map((cell) => {
            let bgStyle = 'bg-white';
            if (cell.type === 'green-home') bgStyle = 'bg-[#10B981]';
            else if (cell.type === 'red-home') bgStyle = 'bg-[#EF4444]';
            else if (cell.type === 'blue-home') bgStyle = 'bg-[#3B82F6]';
            else if (cell.type === 'yellow-home') bgStyle = 'bg-[#FBBF24]';
            else if (cell.type === 'start') {
              if (cell.color === 'green') bgStyle = 'bg-[#059669]';
              else if (cell.color === 'red') bgStyle = 'bg-[#DC2626]';
              else if (cell.color === 'blue') bgStyle = 'bg-[#2563EB]';
              else if (cell.color === 'yellow') bgStyle = 'bg-[#D97706]';
            } else if (cell.type === 'star') {
              bgStyle = 'bg-[#F8FAFC]';
            } else {
              bgStyle = (cell.r + cell.c) % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC]';
            }

            return (
              <div
                key={`track_${cell.r}_${cell.c}`}
                className={`absolute flex items-center justify-center ${bgStyle}`}
                style={{
                  left: `${(cell.c / 15) * 100}%`,
                  top: `${(cell.r / 15) * 100}%`,
                  width: `${(1 / 15) * 100}%`,
                  height: `${(1 / 15) * 100}%`,
                  boxShadow: 'inset 0 0 0 0.5px #CBD5E1',
                }}
              >
                {cell.icon}
              </div>
            );
          })}

          {/* ================= 4. TOKENS LAYER ================= */}
          {Array.from(tokensByCoord.entries()).map(([key, group]) => {
            const [rStr, cStr] = key.split('_');
            const row = parseFloat(rStr);
            const col = parseFloat(cStr);

            return (
              <React.Fragment key={key}>
                {group.map((item, idx) => {
                  const { player, token } = item;
                  const isEligible =
                    player.color === activePlayer.color &&
                    !player.isComputer &&
                    validTokenIds.has(token.id);

                  const isMoving =
                    movingTokenInfo?.color === player.color &&
                    movingTokenInfo?.tokenId === token.id;

                  let offsetX = 0;
                  let offsetY = 0;
                  if (group.length === 2) {
                    offsetX = idx === 0 ? -4 : 4;
                    offsetY = idx === 0 ? -3 : 3;
                  } else if (group.length > 2) {
                    offsetX = idx % 2 === 0 ? -5 : 5;
                    offsetY = idx < 2 ? -5 : 5;
                  }

                  const config = COLOR_CONFIG[player.color];

                  return (
                    <div
                      key={`${player.color}_token_${token.id}`}
                      onClick={() => {
                        if (isEligible) {
                          onTokenClick(token.id);
                        }
                      }}
                      className={`absolute z-30 transition-all ${
                        isEligible
                          ? 'cursor-pointer hover:scale-115 active:scale-95 animate-bounce'
                          : isMoving
                          ? 'z-40 scale-110 pointer-events-none'
                          : 'cursor-default pointer-events-none'
                      }`}
                      style={{
                        top: `${(row / 15) * 100}%`,
                        left: `${(col / 15) * 100}%`,
                        width: `${(1 / 15) * 100}%`,
                        height: `${(1 / 15) * 100}%`,
                        transform: `translate(${offsetX}px, ${offsetY}px)`,
                        transition: isMoving ? 'all 0.12s linear' : 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center p-0.5">
                        {/* 3D Glossy Pawns with Highlight Ring */}
                        <div
                          className={`relative rounded-full flex items-center justify-center transition-all ${
                            isEligible ? 'ring-3 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-2xl scale-105' : 'shadow-md'
                          }`}
                          style={{
                            width: Math.max(18, Math.min(26, Math.floor((boardSize / 15) * 0.84))),
                            height: Math.max(18, Math.min(26, Math.floor((boardSize / 15) * 0.84))),
                            background: `radial-gradient(circle at 35% 30%, ${config.tokenGradStart}, ${config.tokenGradEnd})`,
                            border: '1.5px solid rgba(255,255,255,0.95)',
                            boxShadow: `0 3px 5px -1px rgba(0,0,0,0.5), inset 0 1.5px 2px rgba(255,255,255,0.6), 0 0 8px ${config.primary}80`,
                          }}
                        >
                          <div
                            className="rounded-full border border-white/70 bg-white/30 flex items-center justify-center"
                            style={{
                              width: Math.max(10, Math.floor((boardSize / 15) * 0.44)),
                              height: Math.max(10, Math.floor((boardSize / 15) * 0.44)),
                            }}
                          >
                            <span className="text-[8px] sm:text-[9px] font-bold text-white">
                              {token.id + 1}
                            </span>
                          </div>
                          <div className="absolute top-0.5 left-1 w-2 h-1 bg-white/80 rounded-full blur-[0.5px] pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface HomeYardQuadrantProps {
  color: PlayerColor;
  player?: Player;
  left: string;
  top: string;
  slotCenters: { r: number; c: number }[];
  cornerOffsetR: number;
  cornerOffsetC: number;
  boardSize: number;
}

const HomeYardQuadrant: React.FC<HomeYardQuadrantProps> = ({
  color,
  player,
  left,
  top,
  slotCenters,
  cornerOffsetR,
  cornerOffsetC,
  boardSize,
}) => {
  const config = COLOR_CONFIG[color];
  const progressPercent = player ? calculatePlayerProgress(player.tokens) : 0;
  const homeCount = player?.tokensHome || 0;
  const slotSize = Math.max(26, Math.min(36, Math.floor((boardSize / 15) * 1.25)));
  const innerDotSize = Math.max(10, Math.min(14, Math.floor(slotSize * 0.38)));

  return (
    <div
      className="absolute overflow-hidden p-2 flex items-center justify-center"
      style={{
        left,
        top,
        width: '40%',
        height: '40%',
        backgroundColor: config.primary,
        backgroundImage: `radial-gradient(circle at 35% 35%, ${config.tokenGradStart}, ${config.dark})`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
      }}
    >
      {/* Inner White Home Panel (Centered with rounded corners) */}
      <div className="relative w-full h-full bg-white/95 rounded-2xl shadow-inner border-2 border-white/80 p-2 overflow-hidden flex items-center justify-center">
        {/* 4 Concentric Slot Rings for the Yard Tokens in 2x2 Grid */}
        <div className="relative w-full h-full">
          {slotCenters.map((slot, idx) => {
            const localR = slot.r - cornerOffsetR;
            const localC = slot.c - cornerOffsetC;
            const leftPct = (localC / 6) * 100;
            const topPct = (localR / 6) * 100;

            return (
              <div
                key={`slot_${color}_${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-inner"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: slotSize,
                  height: slotSize,
                  backgroundColor: `${config.primary}18`,
                  border: `2px solid ${config.primary}`,
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: innerDotSize,
                    height: innerDotSize,
                    backgroundColor: `${config.primary}40`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
