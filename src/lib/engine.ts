import { Chess } from "chess.js";

export type Color = "w" | "b";

const VAL: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Simple piece-square tables (white perspective, index 0 = a8 ... 63 = h1)
const PST_P = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10,
  25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10,
  10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];
const PST_N = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0,
  -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5,
  -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
];
const PST_B = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20,
];
const PST_R = [
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0,
  0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5,
  5, 0, 0, 0,
];
const PST_Q = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5,
  0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0,
  -10, -20, -10, -10, -5, -5, -10, -10, -20,
];
const PST_K = [
  -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40,
  -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30,
  -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0,
  10, 30, 20,
];

const PST: Record<string, number[]> = { p: PST_P, n: PST_N, b: PST_B, r: PST_R, q: PST_Q, k: PST_K };

/** Evaluation in centipawns, positive = white is better. */
export function evaluate(game: Chess): number {
  if (game.isCheckmate()) return game.turn() === "w" ? -100000 : 100000;
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) return 0;

  let score = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r]![f];
      if (!sq) continue;
      const idx = r * 8 + f;
      const pst = PST[sq.type]!;
      const positional = sq.color === "w" ? pst[idx]! : pst[(7 - r) * 8 + f]!;
      const v = VAL[sq.type]! + positional;
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

function negamax(game: Chess, depth: number, alpha: number, beta: number, color: number): number {
  if (depth === 0 || game.isGameOver()) return color * evaluate(game);
  const moves = game.moves({ verbose: true });
  // order captures first for better pruning
  moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));
  let best = -Infinity;
  for (const m of moves) {
    game.move(m);
    const score = -negamax(game, depth - 1, -beta, -alpha, -color);
    game.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

/** Score of the position for the side to move, in centipawns. */
export function scoreForSideToMove(game: Chess, depth: number): number {
  const color = game.turn() === "w" ? 1 : -1;
  return negamax(game, depth, -Infinity, Infinity, color);
}

export type LevelConfig = { depth: number; noise: number; blunder: number };

export function levelConfig(level: number): LevelConfig {
  const l = Math.max(1, Math.min(10, level));
  const table: LevelConfig[] = [
    { depth: 1, noise: 260, blunder: 0.45 },
    { depth: 1, noise: 200, blunder: 0.32 },
    { depth: 1, noise: 140, blunder: 0.22 },
    { depth: 2, noise: 110, blunder: 0.16 },
    { depth: 2, noise: 80, blunder: 0.1 },
    { depth: 2, noise: 50, blunder: 0.06 },
    { depth: 3, noise: 35, blunder: 0.03 },
    { depth: 3, noise: 20, blunder: 0.015 },
    { depth: 3, noise: 10, blunder: 0 },
    { depth: 4, noise: 0, blunder: 0 },
  ];
  return table[l - 1]!;
}

/** Pick the engine's move for a given strength level. */
export function pickEngineMove(fen: string, level: number): string | null {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;
  const cfg = levelConfig(level);

  if (Math.random() < cfg.blunder) {
    const m = moves[Math.floor(Math.random() * moves.length)]!;
    return m.san;
  }

  const color = game.turn() === "w" ? 1 : -1;
  let best = -Infinity;
  let bestSan = moves[0]!.san;
  for (const m of moves) {
    game.move(m);
    const raw = -negamax(game, cfg.depth - 1, -Infinity, Infinity, -color);
    game.undo();
    const score = raw + (Math.random() - 0.5) * 2 * cfg.noise;
    if (score > best) {
      best = score;
      bestSan = m.san;
    }
  }
  return bestSan;
}

export type MoveQuality = "brilliant" | "good" | "ok" | "inaccuracy" | "mistake" | "blunder";

/**
 * Compares the played move with the best available move (shallow search)
 * and returns how good it was.
 */
export function judgeMove(
  fenBefore: string,
  san: string,
): { quality: MoveQuality; loss: number; bestSan: string } {
  const game = new Chess(fenBefore);
  const depth = 2;
  const color = game.turn() === "w" ? 1 : -1;
  const moves = game.moves({ verbose: true });

  let bestScore = -Infinity;
  let bestSan = san;
  let playedScore = 0;
  for (const m of moves) {
    game.move(m);
    const s = -negamax(game, depth - 1, -Infinity, Infinity, -color);
    game.undo();
    if (m.san === san) playedScore = s;
    if (s > bestScore) {
      bestScore = s;
      bestSan = m.san;
    }
  }

  const loss = Math.max(0, bestScore - playedScore);
  let quality: MoveQuality;
  if (loss <= 10 && bestScore > 300 && moves.length > 4) quality = "brilliant";
  else if (loss <= 25) quality = "good";
  else if (loss <= 70) quality = "ok";
  else if (loss <= 150) quality = "inaccuracy";
  else if (loss <= 350) quality = "mistake";
  else quality = "blunder";

  return { quality, loss, bestSan };
}
