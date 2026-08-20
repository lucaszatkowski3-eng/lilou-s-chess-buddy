import { useMemo } from "react";
import type { Chess, Square } from "chess.js";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

const GLYPH: Record<string, string> = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
};

type Props = {
  game: Chess;
  selected: Square | null;
  targets: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquare: (sq: Square) => void;
  disabled?: boolean;
};

export function Board({ game, selected, targets, lastMove, onSquare, disabled }: Props) {
  const board = useMemo(() => game.board(), [game.fen()]);

  return (
    <div className="rounded-3xl bg-card p-2 shadow-[var(--shadow-soft)] ring-2 ring-border">
      <div className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-2xl">
        {RANKS.map((rank, r) =>
          FILES.map((file, f) => {
            const sq = `${file}${rank}` as Square;
            const piece = board[r]![f];
            const light = (r + f) % 2 === 0;
            const isTarget = targets.includes(sq);
            const isSel = selected === sq;
            const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
            return (
              <button
                key={sq}
                type="button"
                disabled={disabled}
                onClick={() => onSquare(sq)}
                aria-label={sq}
                className={[
                  "relative flex items-center justify-center text-[7vw] leading-none sm:text-4xl",
                  light ? "bg-[var(--sq-light)]" : "bg-[var(--sq-dark)]",
                  isLast ? "ring-2 ring-inset ring-[var(--gold)]" : "",
                  isSel ? "ring-4 ring-inset ring-[var(--berry)]" : "",
                  disabled ? "cursor-default" : "cursor-pointer",
                ].join(" ")}
              >
                {piece && (
                  <span
                    className={
                      piece.color === "w"
                        ? "text-[var(--piece-white)] drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
                        : "text-[var(--piece-black)]"
                    }
                  >
                    {GLYPH[`${piece.color}${piece.type}`]}
                  </span>
                )}
                {isTarget && (
                  <span
                    className={
                      piece
                        ? "absolute inset-1 rounded-full ring-4 ring-[var(--berry)]/70"
                        : "absolute h-3 w-3 rounded-full bg-[var(--berry)]/70"
                    }
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
