// Template for lib/press.ts — copy into the repo and fill in real content.
// Pairs with lib/releases.ts by `slug`; keep title/artist/cover/links/embed in Release,
// keep press-only content (bio, quotes, photos, credits) here so the fan-facing
// /releases/[slug] page doesn't get cluttered with press copy.

export type PressPhoto = {
  src: string; // "/press/<slug>/photo-1.jpg" — actual file must exist under public/press/<slug>/
  alt: string;
  credit?: string; // e.g. "Photo: Jane Doe"
};

export type PressCredit = {
  label: string; // "WRITTEN BY", "PRODUCED BY", "LABEL" — keep mono-caps to match site voice
  value: string;
};

export type PressQuote = {
  text: string;
  source: string; // publication or person, e.g. "Rolling Stone en Español"
};

export type PressKit = {
  slug: string; // MUST match a Release.slug in lib/releases.ts
  bio: {
    es: string; // 2–3 sentences, Spanish is the site's default — write this one first
    en: string;
  };
  quotes?: PressQuote[];
  credits?: PressCredit[];
  photos: PressPhoto[];
  contactEmail?: string; // defaults to press@plasticlover.band if omitted
};

export const PRESS_KITS: PressKit[] = [
  {
    slug: "REPLACE_WITH_RELEASE_SLUG",
    bio: {
      es: "[Escribe una bio de 2–3 oraciones sobre este lanzamiento — no inventes datos, pídeselos al usuario si faltan]",
      en: "[2–3 sentence bio for this release — don't invent facts, ask the user for anything missing]",
    },
    quotes: [
      // { text: "...", source: "..." },
    ],
    credits: [
      // { label: "WRITTEN BY", value: "..." },
      // { label: "PRODUCED BY", value: "..." },
    ],
    photos: [
      // { src: "/press/REPLACE_WITH_RELEASE_SLUG/photo-1.jpg", alt: "...", credit: "Photo: ..." },
    ],
  },
];

export function getPressKitBySlug(slug: string): PressKit | undefined {
  return PRESS_KITS.find((p) => p.slug === slug);
}
