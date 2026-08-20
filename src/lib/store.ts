import { useCallback, useEffect, useState } from "react";
import type { Slot } from "./items";

export type SaveState = {
  points: number;
  level: number;
  fed: number; // 0..100 satiety
  lastFed: number; // timestamp
  owned: string[];
  equipped: Partial<Record<Slot, string>>;
  games: number;
  wins: number;
  bestAccuracy: number;
};

const KEY = "springo-save-v1";

const DEFAULT: SaveState = {
  points: 40,
  level: 1,
  fed: 60,
  lastFed: Date.now(),
  owned: [],
  equipped: {},
  games: 0,
  wins: 0,
  bestAccuracy: 0,
};

function decay(s: SaveState): SaveState {
  const minutes = (Date.now() - s.lastFed) / 60000;
  const fed = Math.max(0, Math.round(s.fed - minutes / 8));
  return { ...s, fed, lastFed: Date.now() };
}

export function loadState(): SaveState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return decay({ ...DEFAULT, ...(JSON.parse(raw) as SaveState) });
  } catch {
    return DEFAULT;
  }
}

export function saveState(s: SaveState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("springo-save"));
}

export function useSave() {
  const [state, setState] = useState<SaveState>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
    const onSave = () => setState(loadState());
    window.addEventListener("springo-save", onSave);
    const t = window.setInterval(() => setState(loadState()), 60000);
    return () => {
      window.removeEventListener("springo-save", onSave);
      window.clearInterval(t);
    };
  }, []);

  const update = useCallback((fn: (s: SaveState) => SaveState) => {
    setState((prev) => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  return { state, update, ready };
}
