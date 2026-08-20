import { createFileRoute, Link } from "@tanstack/react-router";
import { Chess, type Square } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Board } from "@/components/Board";
import { Pony, type Mood } from "@/components/Pony";
import { Coach, QUALITY_LABEL, QUALITY_POINTS } from "@/lib/coach";
import { judgeMove, pickEngineMove, type MoveQuality } from "@/lib/engine";
import { useSave } from "@/lib/store";

export const Route = createFileRoute("/spiel")({
  head: () => ({
    meta: [
      { title: "Partie gegen Springo – Schach mit Lob & Tipps" },
      {
        name: "description",
        content:
          "Spiele eine Partie Schach gegen Springo. Die KI passt sich deiner Stärke an, lobt gute Züge und gibt Tipps bei Fehlern.",
      },
      { property: "og:title", content: "Partie gegen Springo" },
      {
        property: "og:description",
        content: "Schach-KI, die mitwächst: Punkte sammeln, lernen und Springo verwöhnen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamePage,
});

type Msg = { id: number; text: string; quality?: MoveQuality | undefined };

function GamePage() {
  const { state, update, ready } = useSave();
  const coach = useRef(new Coach());
  const [game, setGame] = useState(() => new Chess());
  const [, setTick] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [qualities, setQualities] = useState<MoveQuality[]>([]);
  const [earned, setEarned] = useState(0);
  const [finished, setFinished] = useState<string | null>(null);
  const level = ready ? state.level : 1;

  useEffect(() => {
    setMessages([{ id: Date.now(), text: coach.current.greeting() }]);
  }, []);

  const say = useCallback((text: string, quality?: MoveQuality) => {
    setMessages((m) => [...m.slice(-8), { id: Date.now() + Math.random(), text, quality }]);
  }, []);

  const targets = useMemo(() => {
    if (!selected) return [];
    return game
      .moves({ square: selected, verbose: true })
      .map((m) => m.to as Square);
  }, [selected, game.fen()]);

  const accuracy = useMemo(() => {
    if (qualities.length === 0) return 0;
    const total = qualities.reduce((a, q) => a + QUALITY_POINTS[q], 0);
    return Math.round((total / (qualities.length * 12)) * 100);
  }, [qualities]);

  const endGame = useCallback(
    (g: Chess, bonusPoints: number, qs: MoveQuality[]) => {
      let result: string;
      let win = false;
      if (g.isCheckmate()) {
        win = g.turn() === "b";
        result = win ? "Schachmatt – du hast gewonnen! 🏆" : "Schachmatt – diesmal habe ich gewonnen.";
      } else {
        result = "Unentschieden – gut gekämpft!";
      }
      const acc =
        qs.length > 0
          ? Math.round((qs.reduce((a, q) => a + QUALITY_POINTS[q], 0) / (qs.length * 12)) * 100)
          : 0;
      const finalPoints = bonusPoints + (win ? 60 : 15) + Math.round(acc * 0.8);
      setEarned(finalPoints);
      setFinished(`${result} Du bekommst ${finalPoints} ⭐ (Genauigkeit ${acc}%).`);
      setMood(win ? "happy" : "sad");
      update((s) => {
        let newLevel = s.level;
        if (win && acc >= 55) newLevel = Math.min(10, s.level + 1);
        else if (!win && acc < 45) newLevel = Math.max(1, s.level - 1);
        return {
          ...s,
          points: s.points + finalPoints,
          games: s.games + 1,
          wins: s.wins + (win ? 1 : 0),
          level: newLevel,
          bestAccuracy: Math.max(s.bestAccuracy, acc),
        };
      });
    },
    [update],
  );

  const engineMove = useCallback(
    (g: Chess, bonus: number, qs: MoveQuality[]) => {
      setThinking(true);
      setMood("think");
      window.setTimeout(() => {
        const san = pickEngineMove(g.fen(), level);
        if (san) {
          const mv = g.move(san);
          setLastMove({ from: mv.from as Square, to: mv.to as Square });
        }
        setThinking(false);
        setMood("idle");
        setTick((t) => t + 1);
        if (g.isGameOver()) endGame(g, bonus, qs);
        else if (g.inCheck()) say("Achtung, dein König steht im Schach! 👑");
      }, 420);
    },
    [level, endGame, say],
  );

  function onSquare(sq: Square) {
    if (thinking || finished || game.turn() !== "w") return;
    const piece = game.get(sq);

    if (selected) {
      const legal = game.moves({ square: selected, verbose: true }).find((m) => m.to === sq);
      if (legal) {
        const fenBefore = game.fen();
        const mv = game.move({ from: selected, to: sq, promotion: "q" });
        setSelected(null);
        setLastMove({ from: mv.from as Square, to: mv.to as Square });
        setTick((t) => t + 1);

        const verdict = judgeMove(fenBefore, mv.san);
        const nextQualities = [...qualities, verdict.quality];
        setQualities(nextQualities);
        const bonus = nextQualities.reduce((a, q) => a + QUALITY_POINTS[q], 0);
        setEarned(bonus);
        say(coach.current.say(verdict.quality, verdict.bestSan), verdict.quality);
        setMood(
          verdict.quality === "brilliant" || verdict.quality === "good"
            ? "happy"
            : verdict.quality === "blunder"
              ? "sad"
              : "idle",
        );

        if (game.isGameOver()) endGame(game, bonus, nextQualities);
        else engineMove(game, bonus, nextQualities);
        return;
      }
    }
    if (piece && piece.color === "w") setSelected(sq);
    else setSelected(null);
  }

  function newGame() {
    coach.current.reset();
    const g = new Chess();
    setGame(g);
    setSelected(null);
    setLastMove(null);
    setQualities([]);
    setEarned(0);
    setFinished(null);
    setMood("idle");
    setMessages([{ id: Date.now(), text: coach.current.greeting() }]);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <header className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="rounded-full bg-card px-4 py-2 text-sm font-extrabold shadow-[var(--shadow-soft)] ring-2 ring-border"
        >
          ← Zurück
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-2 text-sm font-extrabold text-secondary-foreground">
            Springo Lvl {level}
          </span>
          <span className="rounded-full bg-[var(--gradient-gold)] px-3 py-2 text-sm font-extrabold text-[var(--pony-base-dark)]">
            +{earned} ⭐
          </span>
        </div>
      </header>

      <section className="mt-4 flex items-start gap-3 rounded-[2rem] bg-card p-4 shadow-[var(--shadow-soft)] ring-2 ring-border">
        <Pony mood={mood} equipped={state.equipped} className="h-28 w-24 shrink-0" />
        <div className="flex-1 space-y-2">
          {messages.slice(-3).map((m) => (
            <p
              key={m.id}
              className="rounded-2xl bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground"
            >
              {m.quality && (
                <span className="mr-2 rounded-full bg-card px-2 py-0.5 text-[0.7rem] font-extrabold uppercase">
                  {QUALITY_LABEL[m.quality]}
                </span>
              )}
              {m.text}
            </p>
          ))}
          {thinking && <p className="text-xs font-bold text-muted-foreground">Springo denkt nach…</p>}
        </div>
      </section>

      <div className="mt-4">
        <Board
          game={game}
          selected={selected}
          targets={targets}
          lastMove={lastMove}
          onSquare={onSquare}
          disabled={thinking || !!finished}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-card px-4 py-3 text-sm font-bold shadow-[var(--shadow-soft)] ring-2 ring-border">
          Genauigkeit: {accuracy}%
        </div>
        <button
          onClick={newGame}
          className="rounded-2xl bg-primary px-5 py-3 text-base font-extrabold text-primary-foreground shadow-[var(--shadow-soft)] transition active:scale-95"
        >
          Neue Partie
        </button>
      </div>

      {finished && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-3xl rounded-t-[2rem] bg-card p-5 text-center shadow-[var(--shadow-soft)] ring-2 ring-border">
          <p className="text-lg font-extrabold">{finished}</p>
          <div className="mt-3 flex justify-center gap-3">
            <button
              onClick={newGame}
              className="rounded-2xl bg-primary px-5 py-3 font-extrabold text-primary-foreground active:scale-95"
            >
              Nochmal
            </button>
            <Link
              to="/"
              className="rounded-2xl bg-accent px-5 py-3 font-extrabold text-accent-foreground active:scale-95"
            >
              Zu Springo
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
