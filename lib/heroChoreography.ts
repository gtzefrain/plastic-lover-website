// Choreography for the landing hero logo entrance ("blobs" — the handoff's
// default): 12 individually-positioned full-canvas (3246x3226) letter PNGs
// fly in from scattered offsets as blurred blobs and sharpen into place.
// Must stay PNG (not JPEG): each layer is transparent except for that one
// letter's ink, and they're stacked to spell the wordmark — filling the
// transparency opaque (as JPEG conversion does) makes each later layer
// blot out every layer beneath it.
export const HERO_SPEED = 1;
export const HERO_FLOATING = true;

export const d = (seconds: number) => seconds / HERO_SPEED + "s";

export const NAV_DELAY = d(2.4);
export const TAGLINE_DELAY = d(2.75);
export const CTA_DELAY = d(3.05);

// [filename, dx (vw), dy (vh), rot (deg)] — scatter start offsets for each
// letter layer, spelling P-l-a-s-t-i-c-L-o-v-e-r.
export const LETTERS: [string, number, number, number][] = [
  ["P.png", -42, -30, -60],
  ["l1.png", 18, -48, 45],
  ["a.png", -30, 35, -90],
  ["S.png", 40, -25, 70],
  ["t.png", -15, -52, -40],
  ["i.png", 48, 20, 110],
  ["c.png", 35, -40, -75],
  ["L.png", -48, 25, 80],
  ["o.png", -22, 50, -55],
  ["v.png", 12, 55, 65],
  ["e.png", 45, 38, -100],
  ["R.png", 30, 48, 50],
];
