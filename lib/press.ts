// Pairs with lib/releases.ts by `slug`; keep title/artist/cover/links/embed in Release,
// keep press-only content (bio, quotes, photos, credits) here so the fan-facing
// /releases/[slug] page doesn't get cluttered with press copy.

export type PressPhoto = {
  src: string; // web-sized display image — actual file must exist under public/press/
  downloadSrc?: string; // full-res original for the DOWNLOAD link; defaults to `src` if omitted
  alt: string;
  category: string; // grouping heading on /press/photos, e.g. "Portrait", "Las Olas"
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
  // Section 2 body copy (left column, next to the YouTube embed) — one string per paragraph.
  // Supports inline links via `[label](url)` markdown-link syntax, rendered by renderRichText()
  // in app/press/[slug]/page.tsx.
  content?: { es: string[]; en: string[] };
  quotes?: PressQuote[];
  credits?: PressCredit[];
  heroImage?: { src: string; alt: string }; // Section 1's main image; falls back to PRESS_PHOTOS[0]
  previewAudio?: { src: string; title: string }; // custom player in the stream section
  contactEmail?: string; // defaults to myplasticlover@gmail.com if omitted
};

export const PRESS_KITS: PressKit[] = [
  {
    slug: "las-olas",
    bio: {
      es: "Las Olas es el nuevo sencillo de Plastic Lover. Un track de indie pop sobre el desamor, donde el mar se vuelve la metáfora para entender aquello que ya no está. Las Olas remite a referencias del proyecto como Indios, Little Jesus y Babasónicos. El sencillo cuenta con un sitio interactivo promocional en [plasticlover.mx/las-olas](https://plasticlover.mx/las-olas).",
      en: "Las Olas is the new single by Plastic Lover. An indie pop track about heartbreak, where the sea becomes a metaphor for understanding what's no longer there. Las Olas nods to the project's usual references, like Indios, Little Jesus, and Babasónicos. The single has a promotional interactive site at [plasticlover.mx/las-olas](https://plasticlover.mx/las-olas).",
    },
    content: {
      es: [
        "Las Olas fue escrita por Efraín Gutiérrez junto a [Sam Vazquez](https://www.instagram.com/vamsazquez/), [Ivan Ivengo](https://www.instagram.com/ivan.ivengo/) y [Omar Guajardo](https://www.instagram.com/omaar_guajardo/), y forma parte del próximo EP de Plastic Lover, producido en su totalidad por Omar Guajardo. Las voces y la batería fueron grabadas en [El Nido Records](https://www.instagram.com/elnidorecordsmx/), con [Carlos Reyna](https://www.instagram.com/creynar_/) en la batería. El arte y diseño de la portada son de Efraín Gutiérrez, con fotografía de Pablo Barrera.",
        "El sencillo llega acompañado de un visualizer dirigido por [JJ Smartz](https://www.instagram.com/jjsmartz), disponible a partir del día de su lanzamiento, el 20 de agosto de 2026.",
      ],
      en: [
        "Las Olas was written by Efraín Gutiérrez alongside [Sam Vazquez](https://www.instagram.com/vamsazquez/), [Ivan Ivengo](https://www.instagram.com/ivan.ivengo/), and [Omar Guajardo](https://www.instagram.com/omaar_guajardo/), and is part of Plastic Lover's upcoming EP, produced entirely by Omar Guajardo. Vocals and drums were recorded at [El Nido Records](https://www.instagram.com/elnidorecordsmx/), with [Carlos Reyna](https://www.instagram.com/creynar_/) on drums. Cover art and design are by Efraín Gutiérrez, with photography by Pablo Barrera.",
        "The single arrives with a visualizer directed by [JJ Smartz](https://www.instagram.com/jjsmartz), out starting on release day, August 20, 2026.",
      ],
    },
    // Real master audio, supplied by Efraín — public/press/las-olas/las-olas-master.mp3.
    previewAudio: {
      src: "/press/las-olas/las-olas-master.mp3",
      title: "Las Olas — Preview",
    },
    // Official single cover art, web-sized copy at public/press/las-olas/cover-web.jpg.
    heroImage: {
      src: "/press/las-olas/cover-web.jpg",
      alt: "Las Olas cover art",
    },
  },
];

export function getPressKitBySlug(slug: string): PressKit | undefined {
  return PRESS_KITS.find((p) => p.slug === slug);
}

// Band-level (not release-specific) — shared photo library at /press/photos, not tied to any
// one single. Real photos supplied by Efraín (portrait session + one live shot), uploaded to
// public/press/portraits/. `src` is a web-sized copy (public/press/portraits/web/, generated
// with `sips`, ~1600px/~250KB) for on-page display; `downloadSrc` is the original full-res
// camera file (11-14MB) for the DOWNLOAD link. `credit` is Pablo Barrera for both the
// portrait session and the "Las Olas" video stills.
export const PRESS_PHOTOS: PressPhoto[] = [
  {
    src: "/press/portraits/web/dscf5471.jpg",
    downloadSrc: "/press/portraits/DSCF5471.JPG",
    alt: "Plastic Lover in golden-hour light, sunglasses, backlit by louvered blinds",
    category: "Portrait",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/portraits/web/dscf5657.jpg",
    downloadSrc: "/press/portraits/DSCF5657.JPG",
    alt: "Plastic Lover at dusk by a chain-link fence, wearing a polka-dot neckerchief",
    category: "Portrait",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/portraits/web/dscf5712.jpg",
    downloadSrc: "/press/portraits/DSCF5712.JPG",
    alt: "Plastic Lover in a dark shirt and sunglasses, warm evening light",
    category: "Portrait",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/portraits/web/dscf5727.jpg",
    downloadSrc: "/press/portraits/DSCF5727.JPG",
    alt: "Plastic Lover at night in amber-tinted glasses, city lights behind him",
    category: "Portrait",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/portraits/web/dscf5736.jpg",
    downloadSrc: "/press/portraits/DSCF5736.jpg",
    alt: "Plastic Lover in a cream double-breasted suit against an amber-lit backdrop",
    category: "Portrait",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/portraits/web/dscf5756.jpg",
    downloadSrc: "/press/portraits/DSCF5756.JPG",
    alt: "Plastic Lover buttoning a cream blazer against an amber-lit backdrop",
    category: "Portrait",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/portraits/web/img_6544.jpg",
    downloadSrc: "/press/portraits/IMG_6544.JPG",
    alt: "Plastic Lover performing live on guitar under blue stage lighting",
    category: "Portrait",
    credit: "Photo: Pablo Barrera",
  },
  // "Las Olas" category — stills captured from the music video (VLC screenshots), uploaded to
  // public/press/las-olas/. Web-sized copies at public/press/las-olas/web-vlcsnap-*.jpg.
  {
    src: "/press/las-olas/web-vlcsnap-2026-08-13-14h05m50s166-cropped.jpg",
    downloadSrc: "/press/las-olas/vlcsnap-2026-08-13-14h05m50s166-cropped.png",
    alt: "Close-up of Plastic Lover with the animated 'Plastic Lover' wordmark over his face, in a grassy park",
    category: "Las Olas",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/las-olas/web-vlcsnap-2026-08-13-14h05m57s114-cropped.jpg",
    downloadSrc: "/press/las-olas/vlcsnap-2026-08-13-14h05m57s114-cropped.png",
    alt: "Close-up of a white fabric mask draped over a black-suited figure lying in the grass",
    category: "Las Olas",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/las-olas/web-vlcsnap-2026-08-13-14h06m02s008-cropped.jpg",
    downloadSrc: "/press/las-olas/vlcsnap-2026-08-13-14h06m02s008-cropped.png",
    alt: "Plastic Lover kneeling in a grassy park, flanked by two masked figures in black suits",
    category: "Las Olas",
    credit: "Photo: Pablo Barrera",
  },
  {
    src: "/press/las-olas/web-vlcsnap-2026-08-13-14h06m20s226-cropped.jpg",
    downloadSrc: "/press/las-olas/vlcsnap-2026-08-13-14h06m20s226-cropped.png",
    alt: "Overhead shot of Plastic Lover kneeling in grass, surrounded by two masked figures lying down",
    category: "Las Olas",
    credit: "Photo: Pablo Barrera",
  },
];

// Band-level (not release-specific), reused on every press kit page.
// Reused verbatim from the "Oh No" EPK (new.express.adobe.com/webpage/N7COcRfr5Iq2J); the `es`
// text fixes two apparent typos in the source ("Inicalmente" -> "Inicialmente", "duo" -> "dúo").
// `en` is a translation of that original — the source EPK didn't have a separate English version.
export const ARTIST_BIO = {
  es: "Formado a finales del 2018, Plastic Lover es el proyecto solista de Efraín Gutiérrez. Inicialmente un dúo, Plastic Lover es un proyecto de indie pop de Monterrey, México. Ha compartido escenario con Mené, Tycho, Fármacos, entre otros.",
  en: "Formed in late 2018, Plastic Lover is Efraín Gutiérrez's solo project. Initially a duo, it's an indie pop project from Monterrey, Mexico. It has shared the stage with Mené, Tycho, Fármacos, and others.",
};

// Sourced from components/Footer.tsx — keep in sync if those links change.
export const SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://www.instagram.com/myplasticlover" },
  { label: "Facebook", href: "https://www.facebook.com/myplasticlover" },
  { label: "TikTok", href: "https://www.tiktok.com/@myplasticlover" },
  { label: "YouTube", href: "https://www.youtube.com/@myplasticlover" },
];
