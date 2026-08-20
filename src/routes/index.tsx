import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pony, type Mood } from "@/components/Pony";
import { ITEMS, SLOT_LABEL, type Slot } from "@/lib/items";
import { useSave } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Springo – Lilous Schach-Pony mit Schach-KI" },
      {
        name: "description",
        content:
          "Spiele Schach gegen eine mitwachsende KI, sammle Punkte, füttere das Schach-Pony Springo und kaufe ihm Kleidung und Schmuck.",
      },
      { property: "og:title", content: "Springo – Lilous Schach-Pony" },
      {
        property: "og:description",
        content:
          "Schach lernen mit Springo: Lob für gute Züge, Tipps bei Fehlern, Punkte fürs Füttern und Anziehen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FEED_COST = 10;
const FEED_GAIN = 18;

function Home() {
  const { state, update, ready } = useSave();
  const [bubble, setBubble] = useState<string | null>(null);
  const [crumbs, setCrumbs] = useState<number[]>([]);
  const [tab, setTab] = useState<Slot>("hat");
  const [happy, setHappy] = useState(false);

  const mood: Mood = happy ? "happy" : state.fed < 30 ? "hungry" : "idle";

  const shopItems = useMemo(() => ITEMS.filter((i) => i.slot === tab), [tab]);

  function feed() {
    if (state.points < FEED_COST) {
      setBubble("Zu wenig Punkte! Spiel eine Partie, dann gibt es Futter. 🍏");
      return;
    }
    update((s) => ({
      ...s,
      points: s.points - FEED_COST,
      fed: Math.min(100, s.fed + FEED_GAIN),
      lastFed: Date.now(),
    }));
    setCrumbs((c) => [...c, Date.now()]);
    setHappy(true);
    setBubble(
      ["Mmmh, lecker Hafer! 🥕", "Danke Lilou, das war köstlich!", "Njam njam – jetzt bin ich stark!"][
        Math.floor(Math.random() * 3)
      ]!,
    );
    window.setTimeout(() => setHappy(false), 1400);
  }

  function buy(id: string, price: number) {
    if (state.owned.includes(id)) return;
    if (state.points < price) {
      setBubble("Dafür brauchst du noch ein paar Punkte. Auf ins nächste Spiel!");
      return;
    }
    const item = ITEMS.find((i) => i.id === id)!;
    update((s) => ({
      ...s,
      points: s.points - price,
      owned: [...s.owned, id],
      equipped: { ...s.equipped, [item.slot]: id },
    }));
    setHappy(true);
    setBubble(`${item.name} steht mir super, oder? 😍`);
    window.setTimeout(() => setHappy(false), 1400);
  }

  function toggleEquip(id: string, slot: Slot) {
    update((s) => ({
      ...s,
      equipped: { ...s.equipped, [slot]: s.equipped[slot] === id ? undefined : id },
    }));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Springo</h1>
          <p className="text-sm text-muted-foreground">Lilous Schach-Pony</p>
        </div>
        <div className="rounded-full bg-[var(--gradient-gold)] px-4 py-2 text-lg font-extrabold text-[var(--pony-base-dark)] shadow-[var(--shadow-soft)]">
          ⭐ {ready ? state.points : "…"}
        </div>
      </header>

      <section className="relative mt-4 rounded-[2rem] bg-card p-5 shadow-[var(--shadow-soft)] ring-2 ring-border">
        <div className="relative mx-auto flex h-64 w-52 items-end justify-center">
          <Pony mood={mood} equipped={state.equipped} className="h-64 w-52" />
          {crumbs.map((c) => (
            <span key={c} className="animate-float-up pointer-events-none absolute bottom-10 text-3xl">
              🍎
            </span>
          ))}
        </div>

        <div className="mx-auto mt-3 max-w-sm rounded-2xl bg-secondary px-4 py-3 text-center text-sm font-semibold text-secondary-foreground">
          {bubble ??
            (state.fed < 30
              ? "Ich habe Hunger… hast du ein paar Punkte für mich? 🥕"
              : `Level ${state.level} – bereit für eine Partie Schach?`)}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Sattheit</span>
            <span>{state.fed}%</span>
          </div>
          <div className="mt-1 h-4 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--gradient-gold)] transition-all duration-500"
              style={{ width: `${state.fed}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={feed}
            className="rounded-2xl bg-accent px-4 py-3 text-base font-extrabold text-accent-foreground shadow-[var(--shadow-soft)] transition active:scale-95"
          >
            🍎 Füttern ({FEED_COST}⭐)
          </button>
          <Link
            to="/spiel"
            className="rounded-2xl bg-primary px-4 py-3 text-center text-base font-extrabold text-primary-foreground shadow-[var(--shadow-soft)] transition active:scale-95"
          >
            ♟️ Schach spielen
          </Link>
        </div>
      </section>

      <section className="mt-5 rounded-[2rem] bg-card p-5 shadow-[var(--shadow-soft)] ring-2 ring-border">
        <h2 className="text-2xl font-extrabold">Springos Laden</h2>
        <p className="text-sm text-muted-foreground">Kleidung & Schmuck für dein Pony</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(SLOT_LABEL) as Slot[]).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                tab === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {SLOT_LABEL[s]}
            </button>
          ))}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3">
          {shopItems.map((item) => {
            const owned = state.owned.includes(item.id);
            const worn = state.equipped[item.slot] === item.id;
            return (
              <li
                key={item.id}
                className="flex flex-col items-center gap-2 rounded-2xl bg-muted/60 p-3 text-center"
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-sm font-bold leading-tight">{item.name}</span>
                {owned ? (
                  <button
                    onClick={() => toggleEquip(item.id, item.slot)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold transition active:scale-95 ${
                      worn ? "bg-secondary text-secondary-foreground" : "bg-card text-foreground ring-1 ring-border"
                    }`}
                  >
                    {worn ? "Wird getragen" : "Anziehen"}
                  </button>
                ) : (
                  <button
                    onClick={() => buy(item.id, item.price)}
                    className="w-full rounded-xl bg-primary px-3 py-2 text-xs font-extrabold text-primary-foreground transition active:scale-95"
                  >
                    {item.price} ⭐
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Partien", value: state.games },
          { label: "Siege", value: state.wins },
          { label: "Stärke", value: `Lvl ${state.level}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)] ring-2 ring-border">
            <div className="text-xl font-extrabold">{s.value}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
