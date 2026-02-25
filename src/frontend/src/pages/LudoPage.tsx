import React, { useCallback } from 'react';
import { Dices, RotateCcw, Trophy } from 'lucide-react';
import { useLudoGame, getColorLabel, getColorStyle, PlayerColor } from '../hooks/useLudoGame';

// Board layout constants
const BOARD_SIZE = 15; // 15x15 grid
const CELL_SIZE = 22; // px per cell

// Color hex values for SVG (cannot use CSS vars in SVG)
const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#e05050',
  green: '#50c878',
  yellow: '#f0c040',
  blue: '#5090e0',
};

const COLOR_LIGHT: Record<PlayerColor, string> = {
  red: '#f8d0d0',
  green: '#d0f0e0',
  yellow: '#fdf0c0',
  blue: '#d0e8f8',
};

// Ludo board cell definitions
// The board is 15x15. Each colored zone is a 6x6 corner.
// Main path cells are defined as [row, col] coordinates.

// Main path: 52 cells going clockwise starting from red's start
// Red starts at row=6, col=1 (going down then right etc.)
const MAIN_PATH: [number, number][] = [
  // Red start area going right (row 6)
  [6,1],[6,2],[6,3],[6,4],[6,5],
  // Going up (col 5)
  [5,5],[4,5],[3,5],[2,5],[1,5],[0,5],
  // Going right (row 0)
  [0,6],
  // Going down (col 6) - green home stretch entry
  [0,7],[0,8],
  // Going right (row 0)
  [1,8],[2,8],[3,8],[4,8],[5,8],
  // Going right (row 6)
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  // Going down (col 14)
  [7,14],
  // Going down (row 8)
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  // Going down (col 9)
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  // Going left (row 14)
  [14,7],
  // Going left (row 14)
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
  // Going left (row 8)
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  // Going up (col 0)
  [7,0],
];

// Home stretches (5 cells each, leading to center)
const HOME_STRETCHES: Record<PlayerColor, [number, number][]> = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5]],
  green:  [[1,7],[2,7],[3,7],[4,7],[5,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9]],
  blue:   [[13,7],[12,7],[11,7],[10,7],[9,7]],
};

// Base positions for pieces in home base (4 pieces per player)
const BASE_POSITIONS: Record<PlayerColor, [number, number][]> = {
  red:    [[1,1],[1,3],[3,1],[3,3]],
  green:  [[1,11],[1,13],[3,11],[3,13]],
  yellow: [[11,11],[11,13],[13,11],[13,13]],
  blue:   [[11,1],[11,3],[13,1],[13,3]],
};

// Zone colors for the board quadrants
const ZONE_COLORS: Record<PlayerColor, string> = COLOR_MAP;

function DiceDisplay({ value }: { value: number | null }) {
  const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return (
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center text-4xl select-none"
      style={{
        background: 'oklch(0.95 0.01 90)',
        border: '2px solid oklch(0.78 0.16 75)',
        boxShadow: '0 4px 12px oklch(0 0 0 / 0.4)',
        color: 'oklch(0.15 0.02 145)',
      }}
    >
      {value ? faces[value] : '🎲'}
    </div>
  );
}

export default function LudoPage() {
  const {
    state,
    numPlayers,
    setNumPlayers,
    gameStarted,
    initGame,
    rollDiceAction,
    movePiece,
    skipTurn,
    resetGame,
    getAbsolutePosition,
    SAFE_SQUARES,
    PATH_LENGTH,
    TOTAL_STEPS,
  } = useLudoGame();

  const boardPx = BOARD_SIZE * CELL_SIZE;

  // Build a map: absPosition -> list of pieces
  const pieceMap = useCallback(() => {
    const map = new Map<string, { color: PlayerColor; pieceId: number }[]>();

    for (const player of state.players) {
      for (const piece of player.pieces) {
        let key = '';
        if (piece.position === -1) {
          // In base
          const basePos = BASE_POSITIONS[player.color][piece.id];
          key = `base-${player.color}-${piece.id}`;
          const existing = map.get(key) || [];
          existing.push({ color: player.color, pieceId: piece.id });
          map.set(key, existing);
        } else if (piece.position === TOTAL_STEPS) {
          // Finished - in center
          key = `finished-${player.color}-${piece.id}`;
          const existing = map.get(key) || [];
          existing.push({ color: player.color, pieceId: piece.id });
          map.set(key, existing);
        } else if (piece.position < PATH_LENGTH) {
          // On main path
          const absPos = getAbsolutePosition(player.color, piece.position);
          key = `path-${absPos}`;
          const existing = map.get(key) || [];
          existing.push({ color: player.color, pieceId: piece.id });
          map.set(key, existing);
        } else {
          // Home stretch
          const stretchIdx = piece.position - PATH_LENGTH; // 0-4
          const homeCell = HOME_STRETCHES[player.color][stretchIdx];
          if (homeCell) {
            key = `home-${player.color}-${stretchIdx}`;
            const existing = map.get(key) || [];
            existing.push({ color: player.color, pieceId: piece.id });
            map.set(key, existing);
          }
        }
      }
    }
    return map;
  }, [state.players, getAbsolutePosition, PATH_LENGTH, TOTAL_STEPS]);

  const pMap = pieceMap();

  const currentPlayer = state.players[state.currentPlayerIndex];

  const handleCellClick = (color: PlayerColor, pieceId: number) => {
    if (state.diceValue !== null && state.movablePieces.includes(pieceId)) {
      movePiece(pieceId);
    }
  };

  const canSkip = state.diceValue !== null && state.movablePieces.length === 0 && !state.gameOver;

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dices className="w-8 h-8 text-gold" />
            <h1 className="text-3xl font-bold text-gold">লুডু</h1>
            <Dices className="w-8 h-8 text-gold" />
          </div>
          <p className="text-muted-foreground text-sm font-bangla">বাংলাদেশের প্রিয় বোর্ড গেম</p>
        </div>

        <div
          className="rounded-2xl p-6 w-full max-w-sm space-y-4"
          style={{
            background: 'oklch(0.16 0.025 145)',
            border: '1px solid oklch(0.28 0.04 145)',
          }}
        >
          <div>
            <p className="text-sm font-semibold text-foreground font-bangla mb-3">খেলোয়াড় সংখ্যা:</p>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setNumPlayers(n)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-lg transition-all"
                  style={
                    numPlayers === n
                      ? { background: 'linear-gradient(135deg, oklch(0.78 0.16 75), oklch(0.68 0.18 55))', color: 'oklch(0.10 0.02 75)' }
                      : { background: 'oklch(0.22 0.03 145)', color: 'oklch(0.65 0.04 145)' }
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-bangla">খেলোয়াড়রা:</p>
            {([0,1,2,3] as const).slice(0, numPlayers).map(i => {
              const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
              const color = colors[i];
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLOR_MAP[color] }} />
                  <span className="font-bangla text-foreground">{getColorLabel(color)}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => initGame(numPlayers)}
            className="w-full py-3 rounded-xl font-bold text-base font-bangla transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, oklch(0.55 0.18 145), oklch(0.40 0.15 145))',
              color: 'oklch(0.97 0.01 90)',
              boxShadow: '0 4px 16px oklch(0.55 0.18 145 / 0.3)',
            }}
          >
            🎮 খেলা শুরু করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-gold" />
          <span className="font-bold text-gold text-lg">লুডু</span>
        </div>
        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bangla transition-all hover:opacity-80"
          style={{ background: 'oklch(0.22 0.03 145)', color: 'oklch(0.65 0.04 145)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          নতুন খেলা
        </button>
      </div>

      {/* Win Banner */}
      {state.gameOver && state.winner && (
        <div
          className="w-full rounded-xl p-4 text-center animate-bounce-in"
          style={{
            background: 'linear-gradient(135deg, oklch(0.55 0.18 75), oklch(0.45 0.20 55))',
            color: 'oklch(0.10 0.02 75)',
            boxShadow: '0 0 30px oklch(0.78 0.16 75 / 0.5)',
          }}
        >
          <Trophy className="inline w-6 h-6 mr-2" />
          <span className="font-bold text-lg font-bangla">{state.message}</span>
        </div>
      )}

      {/* Message */}
      {!state.gameOver && (
        <div
          className="w-full rounded-lg px-3 py-2 text-center text-sm font-bangla"
          style={{
            background: 'oklch(0.18 0.04 145)',
            border: `1px solid ${currentPlayer ? COLOR_MAP[currentPlayer.color] + '60' : 'oklch(0.28 0.04 145)'}`,
            color: currentPlayer ? COLOR_MAP[currentPlayer.color] : 'oklch(0.65 0.04 145)',
          }}
        >
          {state.message}
        </div>
      )}

      {/* Board */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '3px solid oklch(0.78 0.16 75 / 0.5)',
          boxShadow: '0 0 20px oklch(0.78 0.16 75 / 0.15)',
        }}
      >
        <svg
          width={boardPx}
          height={boardPx}
          viewBox={`0 0 ${boardPx} ${boardPx}`}
          style={{ display: 'block', maxWidth: '100%' }}
        >
          {/* Background */}
          <rect width={boardPx} height={boardPx} fill="#1a2a1a" />

          {/* Draw grid cells */}
          {Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => {
              const x = col * CELL_SIZE;
              const y = row * CELL_SIZE;

              // Determine cell color
              let fill = '#1e2e1e';
              let stroke = '#2a3a2a';

              // Red zone (top-left 6x6)
              if (row < 6 && col < 6) fill = '#3a1a1a';
              // Green zone (top-right 6x6)
              else if (row < 6 && col >= 9) fill = '#1a3a1a';
              // Yellow zone (bottom-right 6x6)
              else if (row >= 9 && col >= 9) fill = '#3a3a1a';
              // Blue zone (bottom-left 6x6)
              else if (row >= 9 && col < 6) fill = '#1a1a3a';
              // Center home
              else if (row >= 6 && row < 9 && col >= 6 && col < 9) fill = '#2a2a2a';

              // Home stretch coloring
              if (HOME_STRETCHES.red.some(([r, c]) => r === row && c === col)) fill = '#5a2020';
              if (HOME_STRETCHES.green.some(([r, c]) => r === row && c === col)) fill = '#205a20';
              if (HOME_STRETCHES.yellow.some(([r, c]) => r === row && c === col)) fill = '#5a5a20';
              if (HOME_STRETCHES.blue.some(([r, c]) => r === row && c === col)) fill = '#20205a';

              // Safe squares on main path
              const pathIdx = MAIN_PATH.findIndex(([r, c]) => r === row && c === col);
              if (pathIdx >= 0 && SAFE_SQUARES.has(pathIdx)) fill = '#2a4a2a';

              // Start squares
              if (MAIN_PATH[0]?.[0] === row && MAIN_PATH[0]?.[1] === col) fill = '#5a2020';
              if (MAIN_PATH[13]?.[0] === row && MAIN_PATH[13]?.[1] === col) fill = '#205a20';
              if (MAIN_PATH[26]?.[0] === row && MAIN_PATH[26]?.[1] === col) fill = '#5a5a20';
              if (MAIN_PATH[39]?.[0] === row && MAIN_PATH[39]?.[1] === col) fill = '#20205a';

              return (
                <rect
                  key={`${row}-${col}`}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={0.5}
                />
              );
            })
          )}

          {/* Draw colored home base areas */}
          {/* Red base */}
          <rect x={2} y={2} width={CELL_SIZE * 5 - 4} height={CELL_SIZE * 5 - 4} rx={6} fill="#5a1a1a" stroke="#e05050" strokeWidth={1.5} />
          {/* Green base */}
          <rect x={CELL_SIZE * 9 + 2} y={2} width={CELL_SIZE * 5 - 4} height={CELL_SIZE * 5 - 4} rx={6} fill="#1a5a1a" stroke="#50c878" strokeWidth={1.5} />
          {/* Yellow base */}
          <rect x={CELL_SIZE * 9 + 2} y={CELL_SIZE * 9 + 2} width={CELL_SIZE * 5 - 4} height={CELL_SIZE * 5 - 4} rx={6} fill="#5a5a1a" stroke="#f0c040" strokeWidth={1.5} />
          {/* Blue base */}
          <rect x={2} y={CELL_SIZE * 9 + 2} width={CELL_SIZE * 5 - 4} height={CELL_SIZE * 5 - 4} rx={6} fill="#1a1a5a" stroke="#5090e0" strokeWidth={1.5} />

          {/* Center triangle (home area) */}
          <polygon
            points={`${CELL_SIZE * 6},${CELL_SIZE * 6} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 6},${CELL_SIZE * 9}`}
            fill="#5a1a1a" opacity={0.7}
          />
          <polygon
            points={`${CELL_SIZE * 6},${CELL_SIZE * 6} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 9},${CELL_SIZE * 6}`}
            fill="#1a5a1a" opacity={0.7}
          />
          <polygon
            points={`${CELL_SIZE * 9},${CELL_SIZE * 9} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 9},${CELL_SIZE * 6}`}
            fill="#5a5a1a" opacity={0.7}
          />
          <polygon
            points={`${CELL_SIZE * 6},${CELL_SIZE * 9} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 9},${CELL_SIZE * 9}`}
            fill="#1a1a5a" opacity={0.7}
          />

          {/* Draw pieces on base */}
          {state.players.map(player =>
            player.pieces.map(piece => {
              if (piece.position !== -1) return null;
              const basePos = BASE_POSITIONS[player.color][piece.id];
              const cx = basePos[1] * CELL_SIZE + CELL_SIZE / 2;
              const cy = basePos[0] * CELL_SIZE + CELL_SIZE / 2;
              const isMovable = state.movablePieces.includes(piece.id) && player.color === currentPlayer?.color;
              return (
                <g
                  key={`base-${player.color}-${piece.id}`}
                  onClick={() => handleCellClick(player.color, piece.id)}
                  style={{ cursor: isMovable ? 'pointer' : 'default' }}
                >
                  <circle cx={cx} cy={cy} r={CELL_SIZE * 0.35} fill={COLOR_MAP[player.color]} stroke={isMovable ? '#fff' : '#000'} strokeWidth={isMovable ? 2 : 1} />
                  {isMovable && <circle cx={cx} cy={cy} r={CELL_SIZE * 0.45} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="3,2" />}
                </g>
              );
            })
          )}

          {/* Draw pieces on main path */}
          {MAIN_PATH.map(([row, col], pathIdx) => {
            const key = `path-${pathIdx}`;
            const pieces = pMap.get(key) || [];
            if (pieces.length === 0) return null;
            const cx = col * CELL_SIZE + CELL_SIZE / 2;
            const cy = row * CELL_SIZE + CELL_SIZE / 2;
            return pieces.map((p, i) => {
              const isMovable = state.movablePieces.includes(p.pieceId) && p.color === currentPlayer?.color;
              const offset = pieces.length > 1 ? (i - (pieces.length - 1) / 2) * 5 : 0;
              return (
                <g
                  key={`path-${pathIdx}-${p.color}-${p.pieceId}`}
                  onClick={() => handleCellClick(p.color, p.pieceId)}
                  style={{ cursor: isMovable ? 'pointer' : 'default' }}
                >
                  <circle cx={cx + offset} cy={cy} r={CELL_SIZE * 0.32} fill={COLOR_MAP[p.color]} stroke={isMovable ? '#fff' : '#000'} strokeWidth={isMovable ? 2 : 1} />
                  {isMovable && <circle cx={cx + offset} cy={cy} r={CELL_SIZE * 0.42} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="3,2" />}
                </g>
              );
            });
          })}

          {/* Draw pieces on home stretches */}
          {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map(color =>
            HOME_STRETCHES[color].map(([row, col], stretchIdx) => {
              const key = `home-${color}-${stretchIdx}`;
              const pieces = pMap.get(key) || [];
              if (pieces.length === 0) return null;
              const cx = col * CELL_SIZE + CELL_SIZE / 2;
              const cy = row * CELL_SIZE + CELL_SIZE / 2;
              return pieces.map((p, i) => {
                const isMovable = state.movablePieces.includes(p.pieceId) && p.color === currentPlayer?.color;
                return (
                  <g
                    key={`home-${color}-${stretchIdx}-${p.pieceId}`}
                    onClick={() => handleCellClick(p.color, p.pieceId)}
                    style={{ cursor: isMovable ? 'pointer' : 'default' }}
                  >
                    <circle cx={cx} cy={cy} r={CELL_SIZE * 0.32} fill={COLOR_MAP[p.color]} stroke={isMovable ? '#fff' : '#000'} strokeWidth={isMovable ? 2 : 1} />
                    {isMovable && <circle cx={cx} cy={cy} r={CELL_SIZE * 0.42} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="3,2" />}
                  </g>
                );
              });
            })
          )}

          {/* Safe square markers */}
          {MAIN_PATH.map(([row, col], pathIdx) => {
            if (!SAFE_SQUARES.has(pathIdx)) return null;
            const cx = col * CELL_SIZE + CELL_SIZE / 2;
            const cy = row * CELL_SIZE + CELL_SIZE / 2;
            return (
              <text key={`safe-${pathIdx}`} x={cx} y={cy + 3} textAnchor="middle" fontSize={8} fill="#aaa" opacity={0.5}>★</text>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="w-full flex items-center gap-4">
        {/* Player indicators */}
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          {state.players.map((player, idx) => (
            <div
              key={player.color}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs"
              style={{
                background: idx === state.currentPlayerIndex && !state.gameOver
                  ? `${COLOR_MAP[player.color]}22`
                  : 'oklch(0.18 0.03 145)',
                border: `1px solid ${idx === state.currentPlayerIndex && !state.gameOver ? COLOR_MAP[player.color] : 'oklch(0.28 0.04 145)'}`,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLOR_MAP[player.color] }} />
              <span className="font-bangla text-foreground truncate" style={{ fontSize: '10px' }}>
                {getColorLabel(player.color).split(' ')[1]}
              </span>
              <span className="ml-auto text-muted-foreground" style={{ fontSize: '10px' }}>
                {player.finished}/4
              </span>
            </div>
          ))}
        </div>

        {/* Dice + Roll button */}
        <div className="flex flex-col items-center gap-2">
          <DiceDisplay value={state.diceValue} />
          {!state.gameOver && (
            <button
              onClick={canSkip ? skipTurn : rollDiceAction}
              disabled={state.diceValue !== null && state.movablePieces.length > 0}
              className="px-4 py-2 rounded-xl font-bold text-sm font-bangla transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSkip
                  ? 'linear-gradient(135deg, oklch(0.58 0.22 25), oklch(0.48 0.20 25))'
                  : 'linear-gradient(135deg, oklch(0.78 0.16 75), oklch(0.68 0.18 55))',
                color: 'oklch(0.10 0.02 75)',
                minWidth: '80px',
              }}
            >
              {canSkip ? 'পাস' : 'রোল 🎲'}
            </button>
          )}
          {state.gameOver && (
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-xl font-bold text-sm font-bangla transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, oklch(0.55 0.18 145), oklch(0.40 0.15 145))',
                color: 'oklch(0.97 0.01 90)',
              }}
            >
              আবার খেলুন
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div
        className="w-full rounded-xl p-3 text-xs text-muted-foreground font-bangla space-y-1"
        style={{ background: 'oklch(0.16 0.025 145)', border: '1px solid oklch(0.22 0.03 145)' }}
      >
        <p>📌 ৬ পেলে ঘর থেকে বের হওয়া যাবে</p>
        <p>⭐ তারা চিহ্নিত ঘর নিরাপদ (ধরা যাবে না)</p>
        <p>🎯 ৬ পেলে বা প্রতিপক্ষ ধরলে আবার রোল করুন</p>
        <p>🏆 সব ৪টি গুটি ঘরে পৌঁছালে জয়</p>
      </div>
    </div>
  );
}
