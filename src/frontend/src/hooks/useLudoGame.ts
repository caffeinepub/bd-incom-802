import { useState, useCallback } from 'react';

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Piece {
  id: number; // 0-3
  player: PlayerColor;
  position: number; // -1 = home base, 0-56 = board path, 57 = finished
}

export interface Player {
  color: PlayerColor;
  isHuman: boolean;
  pieces: Piece[];
  finished: number; // count of pieces that finished
}

export interface LudoGameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  gameOver: boolean;
  winner: PlayerColor | null;
  movablePieces: number[]; // piece ids that can move
  message: string;
}

// Board path length
const PATH_LENGTH = 52;
const HOME_STRETCH = 5; // 5 steps in home column
const TOTAL_STEPS = PATH_LENGTH + HOME_STRETCH; // 57 = finished

// Safe squares on the main path (0-indexed positions on the 52-cell path)
const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Starting positions on the main path for each player (0-indexed)
const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Home stretch entry point (position on main path just before home stretch)
const HOME_ENTRY: Record<PlayerColor, number> = {
  red: 51,
  green: 12,
  yellow: 25,
  blue: 38,
};

const COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

function createPlayer(color: PlayerColor, isHuman: boolean): Player {
  return {
    color,
    isHuman,
    finished: 0,
    pieces: [0, 1, 2, 3].map(id => ({
      id,
      player: color,
      position: -1,
    })),
  };
}

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function getAbsolutePosition(color: PlayerColor, relativePos: number): number {
  // relativePos: 0 = start, 51 = last main path cell, 52-56 = home stretch
  if (relativePos < 0) return -1;
  if (relativePos >= PATH_LENGTH) return relativePos; // home stretch, no wrapping
  const start = START_POSITIONS[color];
  return (start + relativePos) % PATH_LENGTH;
}

function canCapture(piece: Piece, targetAbsPos: number, players: Player[]): boolean {
  // Check if any opponent piece is at targetAbsPos (not safe)
  if (SAFE_SQUARES.has(targetAbsPos)) return false;
  for (const player of players) {
    if (player.color === piece.player) continue;
    for (const p of player.pieces) {
      if (p.position >= 0 && p.position < PATH_LENGTH) {
        const absPos = getAbsolutePosition(p.player, p.position);
        if (absPos === targetAbsPos) return true;
      }
    }
  }
  return false;
}

function getMovablePieces(player: Player, dice: number, players: Player[]): number[] {
  const movable: number[] = [];
  for (const piece of player.pieces) {
    if (piece.position === TOTAL_STEPS) continue; // already finished

    if (piece.position === -1) {
      // In base: can only move out with a 6
      if (dice === 6) movable.push(piece.id);
    } else {
      const newPos = piece.position + dice;
      if (newPos <= TOTAL_STEPS) {
        movable.push(piece.id);
      }
    }
  }
  return movable;
}

export function useLudoGame() {
  const [numPlayers, setNumPlayers] = useState<2 | 3 | 4>(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [state, setState] = useState<LudoGameState>({
    players: [],
    currentPlayerIndex: 0,
    diceValue: null,
    isRolling: false,
    gameOver: false,
    winner: null,
    movablePieces: [],
    message: 'ডাইস রোল করুন',
  });

  const initGame = useCallback((playerCount: 2 | 3 | 4) => {
    const activePlayers = COLORS.slice(0, playerCount).map((color, i) =>
      createPlayer(color, i === 0) // only first player is human for simplicity; all human in local mode
    );
    // All players are human (local multiplayer)
    const humanPlayers = activePlayers.map(p => ({ ...p, isHuman: true }));

    setState({
      players: humanPlayers,
      currentPlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      gameOver: false,
      winner: null,
      movablePieces: [],
      message: `${getColorLabel(humanPlayers[0].color)} এর পালা — ডাইস রোল করুন`,
    });
    setGameStarted(true);
  }, []);

  const rollDiceAction = useCallback(() => {
    setState(prev => {
      if (prev.isRolling || prev.gameOver || prev.diceValue !== null) return prev;

      const dice = rollDice();
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const movable = getMovablePieces(currentPlayer, dice, prev.players);

      let message = '';
      if (movable.length === 0) {
        message = `${getColorLabel(currentPlayer.color)}: ${dice} — কোনো চাল নেই, পরের খেলোয়াড়ের পালা`;
      } else if (dice === 6) {
        message = `${getColorLabel(currentPlayer.color)}: ${dice} 🎉 — একটি গুটি সরান`;
      } else {
        message = `${getColorLabel(currentPlayer.color)}: ${dice} — একটি গুটি সরান`;
      }

      return {
        ...prev,
        diceValue: dice,
        movablePieces: movable,
        message,
      };
    });
  }, []);

  const movePiece = useCallback((pieceId: number) => {
    setState(prev => {
      if (prev.diceValue === null || prev.gameOver) return prev;

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      if (!prev.movablePieces.includes(pieceId)) return prev;

      const dice = prev.diceValue;
      const newPlayers = prev.players.map(p => ({ ...p, pieces: p.pieces.map(pc => ({ ...pc })) }));
      const player = newPlayers[prev.currentPlayerIndex];
      const piece = player.pieces.find(p => p.id === pieceId)!;

      let captured = false;

      if (piece.position === -1) {
        // Move out of base
        piece.position = 0;
      } else {
        const newPos = piece.position + dice;
        piece.position = newPos;

        // Check capture (only on main path)
        if (newPos < PATH_LENGTH) {
          const absPos = getAbsolutePosition(player.color, newPos);
          // Capture opponent pieces
          for (const opponent of newPlayers) {
            if (opponent.color === player.color) continue;
            for (const op of opponent.pieces) {
              if (op.position >= 0 && op.position < PATH_LENGTH) {
                const opAbs = getAbsolutePosition(op.player, op.position);
                if (opAbs === absPos && !SAFE_SQUARES.has(absPos)) {
                  op.position = -1; // send back to base
                  captured = true;
                }
              }
            }
          }
        }
      }

      // Check if piece finished
      if (piece.position === TOTAL_STEPS) {
        player.finished += 1;
      }

      // Check win condition
      if (player.finished === 4) {
        return {
          ...prev,
          players: newPlayers,
          gameOver: true,
          winner: player.color,
          diceValue: null,
          movablePieces: [],
          message: `🏆 ${getColorLabel(player.color)} জিতেছে!`,
        };
      }

      // Determine next turn
      // Player gets another turn if: rolled 6 or captured a piece
      const extraTurn = dice === 6 || captured;
      let nextIndex = prev.currentPlayerIndex;
      if (!extraTurn) {
        nextIndex = (prev.currentPlayerIndex + 1) % newPlayers.length;
      }

      const nextPlayer = newPlayers[nextIndex];
      const nextMessage = extraTurn
        ? `${getColorLabel(player.color)}: আবার রোল করুন!`
        : `${getColorLabel(nextPlayer.color)} এর পালা — ডাইস রোল করুন`;

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        diceValue: null,
        movablePieces: [],
        message: nextMessage,
      };
    });
  }, []);

  const skipTurn = useCallback(() => {
    setState(prev => {
      if (prev.diceValue === null || prev.movablePieces.length > 0 || prev.gameOver) return prev;
      const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const nextPlayer = prev.players[nextIndex];
      return {
        ...prev,
        diceValue: null,
        movablePieces: [],
        message: `${getColorLabel(nextPlayer.color)} এর পালা — ডাইস রোল করুন`,
        currentPlayerIndex: nextIndex,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setState({
      players: [],
      currentPlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      gameOver: false,
      winner: null,
      movablePieces: [],
      message: 'ডাইস রোল করুন',
    });
  }, []);

  return {
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
    START_POSITIONS,
    HOME_ENTRY,
    PATH_LENGTH,
    TOTAL_STEPS,
  };
}

export function getColorLabel(color: PlayerColor): string {
  const labels: Record<PlayerColor, string> = {
    red: '🔴 লাল',
    green: '🟢 সবুজ',
    yellow: '🟡 হলুদ',
    blue: '🔵 নীল',
  };
  return labels[color];
}

export function getColorStyle(color: PlayerColor): string {
  const styles: Record<PlayerColor, string> = {
    red: 'oklch(0.60 0.22 25)',
    green: 'oklch(0.65 0.20 145)',
    yellow: 'oklch(0.80 0.18 85)',
    blue: 'oklch(0.60 0.20 240)',
  };
  return styles[color];
}
