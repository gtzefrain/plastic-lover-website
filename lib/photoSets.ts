export type PhotoSpec = {
  label: string;
  top: string;
  left: string;
  w: string;
  h: string;
  z: number;
  dly: number;
};

export const PHOTO_SETS: PhotoSpec[][] = [
  [
    { label: "LIVE — MELT TOUR", top: "14%", left: "6%", w: "24vw", h: "34vh", z: 1, dly: 0 },
    { label: "STUDIO", top: "11%", left: "32%", w: "18vw", h: "26vh", z: 2, dly: 1.8 },
    { label: "PRESS SHOT", top: "19%", left: "52%", w: "26vw", h: "38vh", z: 1, dly: 1.8 },
    { label: "BACKSTAGE", top: "12%", left: "80%", w: "15vw", h: "28vh", z: 2, dly: 0.7 },
    { label: "CROWD", top: "46%", left: "14%", w: "20vw", h: "30vh", z: 3, dly: 2.4 },
    { label: "POLAROID", top: "42%", left: "36%", w: "13vw", h: "20vh", z: 4, dly: 2.7 },
    { label: "VIDEO STILL", top: "52%", left: "48%", w: "22vw", h: "32vh", z: 2, dly: 0.6 },
    { label: "SOUNDCHECK", top: "48%", left: "70%", w: "20vw", h: "34vh", z: 3, dly: 2.9 },
  ],
  [
    { label: "VINYL MACRO", top: "12%", left: "10%", w: "18vw", h: "28vh", z: 2, dly: 1.1 },
    { label: "FANS", top: "16%", left: "36%", w: "25vw", h: "36vh", z: 1, dly: 0 },
    { label: "TOUR BUS", top: "10%", left: "60%", w: "20vw", h: "26vh", z: 2, dly: 2.5 },
    { label: "MERCH", top: "24%", left: "82%", w: "13vw", h: "22vh", z: 3, dly: 0.7 },
    { label: "NEON SIGN", top: "48%", left: "8%", w: "15vw", h: "24vh", z: 4, dly: 1.9 },
    { label: "REHEARSAL", top: "44%", left: "28%", w: "22vw", h: "34vh", z: 2, dly: 0.3 },
    { label: "PORTRAIT", top: "50%", left: "52%", w: "17vw", h: "32vh", z: 3, dly: 2.95 },
    { label: "GREEN ROOM", top: "46%", left: "72%", w: "21vw", h: "28vh", z: 1, dly: 1.5 },
  ],
  [
    { label: "FESTIVAL", top: "13%", left: "8%", w: "26vw", h: "36vh", z: 1, dly: 1.7 },
    { label: "ENCORE", top: "10%", left: "38%", w: "17vw", h: "24vh", z: 2, dly: 0.2 },
    { label: "SETLIST", top: "18%", left: "58%", w: "14vw", h: "26vh", z: 3, dly: 2.7 },
    { label: "VAN LOAD-IN", top: "12%", left: "76%", w: "18vw", h: "30vh", z: 2, dly: 1.0 },
    { label: "HOTEL TV", top: "46%", left: "16%", w: "15vw", h: "22vh", z: 4, dly: 2.2 },
    { label: "RADIO", top: "44%", left: "34%", w: "21vw", h: "32vh", z: 2, dly: 0.6 },
    { label: "SIGNING", top: "52%", left: "56%", w: "24vw", h: "30vh", z: 1, dly: 1.35 },
    { label: "AFTERSHOW", top: "48%", left: "82%", w: "13vw", h: "24vh", z: 3, dly: 3.0 },
  ],
];

const LOOP = 16;

// The vw/vh sizes above were tuned against a widescreen desktop viewport, so
// their w:h ratio only reads correctly there — on a narrow, tall mobile
// viewport the same vw/vh pair maps to very different pixel dimensions and
// the frame looks stretched. Bake in the desktop aspect ratio here so it can
// be reapplied via CSS `aspect-ratio` on mobile instead of the raw vh.
const DESKTOP_ASPECT = 16 / 9;

export type LoopedPhoto = PhotoSpec & { anim: string; delay: string; ratio: number };

// All 24 photos loop continuously on a 16s cycle; each is visible for a
// third of it (0.9s in + ~3.5s hold + 0.9s out). The three sets are offset
// by a third of the cycle each, so exits of one set overlap entries of the
// next and the section is never empty.
export function buildLoopedPhotos(): LoopedPhoto[] {
  return PHOTO_SETS.flatMap((set, s) =>
    set.map((p, i) => ({
      ...p,
      anim: `${i % 2 === 0 ? "plLoopR" : "plLoopL"} ${LOOP}s ease-in-out infinite both`,
      delay: `${s * (LOOP / 3) + p.dly}s`,
      ratio: (parseFloat(p.w) / parseFloat(p.h)) * DESKTOP_ASPECT,
    })),
  );
}
