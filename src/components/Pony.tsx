import type { Slot } from "@/lib/items";
import { ITEMS } from "@/lib/items";

export type Mood = "idle" | "happy" | "think" | "sad" | "hungry";

type Props = {
  mood?: Mood;
  equipped?: Partial<Record<Slot, string | undefined>>;
  className?: string;
};

const MOOD_CLASS: Record<Mood, string> = {
  idle: "animate-bob",
  happy: "animate-hop",
  think: "animate-tilt",
  sad: "animate-droop",
  hungry: "animate-bob",
};

function itemEmoji(equipped: Partial<Record<Slot, string | undefined>>, slot: Slot) {
  const id = equipped[slot];
  if (!id) return null;
  return ITEMS.find((i) => i.id === id)?.emoji ?? null;
}

export function Pony({ mood = "idle", equipped = {}, className = "" }: Props) {
  const hat = itemEmoji(equipped, "hat");
  const neck = itemEmoji(equipped, "neck");
  const body = itemEmoji(equipped, "body");
  const hoof = itemEmoji(equipped, "hoof");

  return (
    <div className={`relative select-none ${className}`}>
      <div className={`relative ${MOOD_CLASS[mood]}`}>
        <svg viewBox="0 0 200 220" className="h-full w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
          {/* base / chess pedestal */}
          <ellipse cx="100" cy="205" rx="62" ry="12" fill="var(--pony-base-dark)" />
          <rect x="46" y="182" width="108" height="18" rx="9" fill="var(--pony-base)" />
          <rect x="58" y="168" width="84" height="18" rx="9" fill="var(--pony-base-dark)" />
          {/* neck */}
          <path
            d="M70 172 C62 130 66 104 80 84 L138 96 C140 128 136 154 132 172 Z"
            fill="var(--pony-body)"
          />
          {/* head */}
          <path
            d="M78 88 C64 62 74 34 100 24 C112 19 124 22 130 30 L152 24 L146 46 C160 62 158 88 146 100 L86 96 Z"
            fill="var(--pony-body)"
          />
          {/* muzzle */}
          <path d="M76 62 C58 60 48 70 52 80 C56 90 72 92 84 86 Z" fill="var(--pony-muzzle)" />
          <circle cx="60" cy="73" r="3.2" fill="var(--pony-base-dark)" />
          {/* ear */}
          <path d="M136 30 L152 22 L146 44 Z" fill="var(--pony-mane)" />
          {/* mane */}
          <path
            d="M130 30 C150 46 152 78 146 104 C142 132 140 158 138 176 L156 176 C168 140 174 92 160 58 C154 42 144 32 130 30 Z"
            fill="var(--pony-mane)"
          />
          {/* eye */}
          <ellipse cx="98" cy="58" rx="9" ry="10" fill="#ffffff" />
          <circle cx="99" cy="59" r="5" fill="#2c2130" />
          <circle cx="101" cy="56.5" r="1.8" fill="#ffffff" />
          {/* cheek */}
          <ellipse cx="82" cy="76" rx="8" ry="5" fill="var(--pony-cheek)" opacity="0.7" />
          {mood === "happy" && (
            <path d="M70 84 q10 8 20 2" stroke="var(--pony-base-dark)" strokeWidth="3" fill="none" strokeLinecap="round" />
          )}
          {mood === "sad" && (
            <path d="M70 88 q10 -6 20 -1" stroke="var(--pony-base-dark)" strokeWidth="3" fill="none" strokeLinecap="round" />
          )}
        </svg>

        {/* accessories */}
        {hat && <span className="absolute left-1/2 top-[-6%] -translate-x-1/2 text-[2.2rem] leading-none">{hat}</span>}
        {neck && <span className="absolute left-[42%] top-[62%] -translate-x-1/2 text-[1.8rem] leading-none">{neck}</span>}
        {body && <span className="absolute left-[62%] top-[74%] -translate-x-1/2 text-[1.8rem] leading-none">{body}</span>}
        {hoof && <span className="absolute left-1/2 top-[86%] -translate-x-1/2 text-[1.6rem] leading-none">{hoof}</span>}
        {mood === "think" && (
          <span className="absolute right-0 top-2 animate-bob text-2xl">💭</span>
        )}
        {mood === "hungry" && (
          <span className="absolute right-0 top-4 animate-hop text-2xl">🍎</span>
        )}
      </div>
    </div>
  );
}
