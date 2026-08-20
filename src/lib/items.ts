export type Slot = "hat" | "neck" | "body" | "hoof";

export type Item = {
  id: string;
  name: string;
  slot: Slot;
  price: number;
  emoji: string;
  color: string;
};

export const ITEMS: Item[] = [
  { id: "crown", name: "Königskrone", slot: "hat", price: 220, emoji: "👑", color: "var(--gold)" },
  { id: "party", name: "Partyhut", slot: "hat", price: 60, emoji: "🎉", color: "var(--berry)" },
  { id: "wizard", name: "Zauberhut", slot: "hat", price: 140, emoji: "🎩", color: "var(--sky)" },
  { id: "flower", name: "Blumenkranz", slot: "hat", price: 90, emoji: "🌸", color: "var(--berry)" },
  { id: "pearls", name: "Perlenkette", slot: "neck", price: 120, emoji: "📿", color: "var(--cream)" },
  { id: "bowtie", name: "Fliege", slot: "neck", price: 45, emoji: "🎀", color: "var(--berry)" },
  { id: "medal", name: "Turniermedaille", slot: "neck", price: 260, emoji: "🏅", color: "var(--gold)" },
  { id: "cape", name: "Springer-Umhang", slot: "body", price: 180, emoji: "🧣", color: "var(--sky)" },
  { id: "saddle", name: "Glitzersattel", slot: "body", price: 300, emoji: "✨", color: "var(--gold)" },
  { id: "boots", name: "Goldene Hufeisen", slot: "hoof", price: 150, emoji: "🥾", color: "var(--gold)" },
  { id: "socks", name: "Ringelsocken", slot: "hoof", price: 55, emoji: "🧦", color: "var(--mint)" },
];

export const SLOT_LABEL: Record<Slot, string> = {
  hat: "Kopf",
  neck: "Hals",
  body: "Körper",
  hoof: "Hufe",
};
