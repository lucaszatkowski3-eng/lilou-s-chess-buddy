import type { MoveQuality } from "./engine";

const LINES: Record<MoveQuality, string[]> = {
  brilliant: [
    "Wow Lilou, das war ein Zauberzug! ✨",
    "Genial! Sogar ich hätte das übersehen.",
    "Das war brillant – du spielst wie eine Großmeisterin!",
    "Puh! Dieser Zug hat mich fast vom Hocker gehauen.",
    "Perfekt getimt – ich bin richtig stolz auf dich!",
    "So ein Zug schmeckt mir besser als Hafer!",
  ],
  good: [
    "Stark gespielt! Genau so macht man das.",
    "Sehr gut – du hast den besten Plan gefunden.",
    "Toller Zug! Deine Figuren arbeiten zusammen.",
    "Klasse! Da habe ich nichts zu meckern.",
    "Ich wiehere vor Freude – super Zug!",
    "Das war präzise wie ein Hufschlag!",
  ],
  ok: [
    "Solide! Kein Problem, weiter so.",
    "Okay, das geht in Ordnung.",
    "Nicht schlecht – es gab aber noch etwas Besseres.",
    "Passt schon. Schau als Nächstes auf freie Figuren.",
    "Ordentlich. Denk daran, deine Türme zu verbinden.",
  ],
  inaccuracy: [
    "Kleiner Ausrutscher – schau, ob eine Figur ungeschützt steht.",
    "Fast! Frag dich immer: Was will mein Gegner als Nächstes?",
    "Ein bisschen ungenau. Figuren in die Mitte sind meist stärker.",
    "Hmm, da war mehr drin. Zähle kurz Angreifer und Verteidiger.",
    "Tipp: Ein Zug, der gleichzeitig angreift und verteidigt, ist Gold wert.",
  ],
  mistake: [
    "Aufgepasst! Prüfe vor jedem Zug, ob etwas geschlagen werden kann.",
    "Das war ein Fehler. Tipp: {best} wäre stärker gewesen.",
    "Ups! Nimm dir Zeit und schau alle Schachgebote an.",
    "Da hättest du besser {best} gespielt.",
    "Merke dir: Erst schauen, ob deine Figuren sicher stehen.",
  ],
  blunder: [
    "Oh nein, da geht Material verloren! Ruhig bleiben, wir holen es zurück.",
    "Autsch! {best} hätte dich gerettet.",
    "Das war ein großer Patzer – atme durch, du schaffst das!",
    "Puh! Prüfe immer, welche Figur dich gerade angreift.",
    "Nicht traurig sein – aus solchen Zügen lernt man am meisten. Besser war {best}.",
  ],
};

const GREETINGS = [
  "Los geht's, Lilou! Ich passe auf dich auf. 🐴",
  "Bereit für eine Partie? Ich bin Springo, dein Schach-Pony!",
  "Viel Glück! Zeig mir deine besten Züge.",
  "Neue Partie, neues Glück – auf geht's!",
];

/** Tracks which line was used how often in the current game (max 2x). */
export class Coach {
  private counts = new Map<string, number>();

  greeting() {
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)]!;
  }

  reset() {
    this.counts.clear();
  }

  say(quality: MoveQuality, bestSan: string): string {
    const pool = LINES[quality];
    const available = pool.filter((l) => (this.counts.get(l) ?? 0) < 2);
    const list = available.length > 0 ? available : pool.filter((l) => (this.counts.get(l) ?? 0) < 3);
    const line = list.length > 0 ? list[Math.floor(Math.random() * list.length)]! : pool[0]!;
    this.counts.set(line, (this.counts.get(line) ?? 0) + 1);
    return line.replace("{best}", bestSan);
  }
}

export const QUALITY_LABEL: Record<MoveQuality, string> = {
  brilliant: "Zauberzug",
  good: "Guter Zug",
  ok: "Solide",
  inaccuracy: "Ungenau",
  mistake: "Fehler",
  blunder: "Patzer",
};

export const QUALITY_POINTS: Record<MoveQuality, number> = {
  brilliant: 12,
  good: 6,
  ok: 3,
  inaccuracy: 1,
  mistake: 0,
  blunder: 0,
};
