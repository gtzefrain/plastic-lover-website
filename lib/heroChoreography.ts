// Choreography for the landing hero logo entrance.
//
// The handoff's default entrance ("blobs") assembles the wordmark from 12
// individually-positioned letter PNGs, all meant to be the same full
// 3246x3226 canvas so they stack pixel-perfectly. The delivered asset pack
// is missing that layer for "o" (O.png is a differently-cropped 1501x2113
// glyph, not the full canvas), which breaks the wordmark. We use the
// "melt" entrance instead — fully specified in the handoff and built on
// LOGO_3D.png, the one complete, correctly-composed asset.
export const HERO_SPEED = 1;
export const HERO_FLOATING = true;

export const d = (seconds: number) => seconds / HERO_SPEED + "s";

export const HERO_DROP_DURATION = d(2.2);
export const HERO_ENTER_EASE = "cubic-bezier(0.45, 0.05, 0.25, 1)";

export const NAV_DELAY = d(1.7);
export const TAGLINE_DELAY = d(2.05);
export const CTA_DELAY = d(2.35);
