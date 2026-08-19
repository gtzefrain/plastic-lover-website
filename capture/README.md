# Social media video capture

Exports Plastic Lover motion assets to high-quality MP4 for social media:

- `capture.js` — the landing-page hero entrance animation
  (`components/HeroLogo.tsx` + `app/globals.css` keyframes, choreographed by
  `lib/heroChoreography.ts`).
- `capture-url-cta.js` — a standalone "visit the site" clip: `www.plasticlover.mx`
  fading in with a mouse cursor swooping in and clicking it.
- `capture-las-olas.js` — the `/las-olas` tap-to-reveal presave teaser
  (`components/LasOlas.tsx`): 4 simulated taps part the waves and reveal the
  logo + PRESAVE button. See "Capturing an interactive scene" below — this
  one works differently from the other two because the scene is driven by
  real click events and real `setTimeout`s, not a single animation that
  starts at mount.

All three use the same ffmpeg encode settings (`lib/video.js`), so output
from any of them is drop-in compatible with the others for editing together.

## Why not a screen recorder / timecut / timesnap

The entrance is pure CSS keyframe animation. CSS animations run on the
browser's compositor thread, not the JS main-thread clock, so tools that
"fake" `Date.now()`/`performance.now()` (timecut, timesnap, etc.) never sync
with them — you get real-time capture with dropped/uneven frames.

Instead `capture.js` and `capture-url-cta.js` use the Web Animations API
directly (`lib/video.js`):

1. Load the page in a **fresh** browser context.
2. Wait for the hero's 12 letter layers to actually exist in the DOM.
   `HeroLogo` doesn't mount them (or start their entrance animation) until
   it's finished its own client-side image preload — see the progress-ring
   loading state in `components/HeroLogo.tsx` — which happens *after* page
   load, not during it, so `capture.js` has to wait for it explicitly
   rather than assuming the letters are there as soon as the page loads.
3. Force-decode any CSS background-image (`img.decode()`) so nothing renders
   blank on the first scrubbed frames.
4. Call `document.getAnimations()` and `.pause()` every animation.
5. For each output frame, set every animation's `.currentTime` to the exact
   millisecond offset for that frame, then screenshot.

This is deterministic — the same frames come out every run regardless of
machine speed, and no frame is ever skipped.

## Capturing an interactive scene

`capture-las-olas.js` captures `/las-olas`, which isn't a single animation
that starts at mount — it's a real tap-to-reveal interaction
(`components/LasOlas.tsx`). Each of the 4 required taps mounts a fresh
ripple, retriggers a CSS transition on the logo/waves, and (on the 4th tap)
mounts the presave panel and arms two real `setTimeout`s — one that unmounts
each ripple 4.6s later, one that opens the presave link 3s after reveal.

The hero's "set one shared `.currentTime` on every animation, every frame"
trick only works because every hero animation starts together at mount.
Here, taps create new Animation objects at different points on the capture's
simulated timeline, so `capture-las-olas.js` tags each one (via
`page.evaluateOnNewDocument`) with the simulated ms offset it was created at,
and drives `.currentTime = frameMs - itsOwnOffset` per animation instead of
one global value.

It also has to defuse the two real `setTimeout`s: capturing ~500 screenshots
takes far longer in wall-clock time than the ~8 simulated seconds being
scrubbed, so left alone those timers fire "early" relative to the simulated
timeline — e.g. a ripple's cleanup can land while it's simulated to still be
mid-fade, popping it out of the DOM instead of finishing its animation. The
injected script stretches any `setTimeout` delay of 2s+ by 100x (short
delays, e.g. anything React's own scheduler uses, are left alone) and stubs
`window.open` so the presave tab never actually tries to open.

## Requirements

- The site reachable at `http://localhost:3000` — **run it in production
  mode** (`npm run build && npm run start` from the repo root), not
  `next dev`. Dev mode renders the Next.js dev-tools indicator badge in the
  corner, which then bakes into every frame. (Only relevant to `capture.js`
  and `capture-las-olas.js`; `capture-url-cta.js` loads a local HTML file and
  doesn't touch the dev server at all.)
  - **Stop any running `next dev` first.** Dev and `next build`/`next start`
    both read/write the same `.next/` directory, and dev's incremental
    compiler will prune chunk files it doesn't recognize from a prod build
    that lands in the directory while it's watching — the prod server then
    500s on those missing chunks (or, worse, renders with partial/missing
    CSS, which silently drops letter layers from the hero logo instead of
    erroring). If you hit intermittent blank/broken captures, check for a
    stray `next dev` first before suspecting the capture script itself.
  - `next build` occasionally leaves a background compiler process running
    past when the CLI reports success — if a capture run is unexpectedly
    slow or flaky, check `ps aux | grep "next build"` for a stray process
    still burning CPU and kill it.
- `ffmpeg` on `PATH` (`brew install ffmpeg`).
- Node 18+.

## Usage

```sh
cd capture
npm install                  # installs Puppeteer + a bundled Chromium
npm run capture               # hero entrance -> capture.js
npm run capture:url-cta       # URL click-through CTA -> capture-url-cta.js
npm run capture:las-olas      # /las-olas tap-to-reveal -> capture-las-olas.js
```

Set `CAPTURE_URL` to point at a different server for `capture.js` or
`capture-las-olas.js` if needed (e.g. to capture the live site instead of a
local build):

```sh
CAPTURE_URL=http://localhost:3001 node capture.js
CAPTURE_URL=https://plasticlover.mx node capture-las-olas.js
```

`capture-las-olas.js` always forces the `pl_locale` cookie to `es` before
navigating, regardless of the machine's own Accept-Language — `/las-olas`
otherwise falls back to whatever locale Chromium happens to send, and the
capture is scripted around the Spanish copy ("EL NUEVO SENCILLO — 20 DE
AGOSTO" / "PRESAVE"). Edit the cookie value in `preparePage()` for an English
capture.

By default the export is **logo-only**: nav, tagline, CTA, scroll arrow,
footer, and the mailing-list section are hidden via an injected `<style>`
tag (see `ISOLATE_LOGO` / `preparePage()` in `capture.js`) rather than by
adding a stripped-down route to the app. `Hero`'s padding (normally reserved
so content doesn't sit under the fixed nav/footer) is zeroed too, so the
logo re-centers in the full frame. To get the original full-page capture
(nav visible, tagline/CTA animating in, etc.) instead:

```sh
CAPTURE_FULL_PAGE=1 node capture.js
```

## Output

Written to `capture/out/` (gitignored):

| File | Size | Content |
| --- | --- | --- |
| `hero-vertical-entrance.mp4` | 1080x1920 (9:16) | Full entrance, 0–5s |
| `hero-square-entrance.mp4` | 1080x1080 (1:1) | Full entrance, 0–5s |
| `hero-vertical-loop.mp4` | 1080x1920 (9:16) | Seamless loop of one `plFloat` cycle, for use *after* the entrance clip or as a standalone looping background |
| `url-cta-vertical.mp4` | 1080x1920 (9:16) | `www.plasticlover.mx` fades in, cursor double-clicks it, 0–4s |
| `url-cta-square.mp4` | 1080x1080 (1:1) | Same, square |
| `las-olas-vertical.mp4` | 1080x1920 (9:16) | 4 taps part the waves; reveal panel rises and holds on the PRESAVE button, 0–7.8s |
| `hero-cues.mid` | — | MIDI click track for scoring the hero entrance (see below) |

PNG frame sequences (`out/<variant>/frame_*.png`) are also left on disk in
case you want to re-encode with different ffmpeg settings; delete them once
you're happy with the .mp4s.

## Key timing constants

**`capture.js`** (60fps, `deviceScaleFactor: 2` — renders at 2x, ffmpeg
downscales with Lanczos for supersampled anti-aliasing):

- Entrance: letters finish settling ~2.9s in; tagline/CTA finish ~3.65s.
  Captured window is 0–5s to include some settled float time before the cut.
- Loop: `plFloat` has a 5000ms period. The loop clip scrubs
  `currentTime = 5000..10000ms` — i.e. exactly one period, starting after all
  the one-shot entrance animations (`plBlob`, `plMeltShadow`, `plFadeUp`,
  `plPop`) have already finished — so frame 0 and frame 299 are the same
  animation phase and it loops with no visible seam.

**`capture-url-cta.js`** (`assets/url-cta.html`, self-contained — not a page
on the live site, since the hand-drawn letter PNGs used for the real
wordmark only exist for P-l-a-s-t-i-c-L-o-v-e-r):

- 0–0.8s: `www.plasticlover.mx` fades up (plain text, same `plFadeUp`
  treatment as the site's tagline — not the melted-logo style).
- 0.9–1.8s: cursor swoops in from off-frame, landing with its tip over the
  text.
- 1.8s: click (press + red ripple) directly on the text.
- 2.4–2.8s: cursor fades out, leaving a clean static hold for the rest of
  the 4s clip.

**`capture-las-olas.js`** (`components/LasOlas.tsx`, 60fps,
`deviceScaleFactor: 2`):

- Taps land at 0.8s, 1.8s, 2.8s, 3.8s (simulated) — evenly spaced, each on an
  exact frame boundary.
- The 4th tap triggers the reveal; `lasRise` (0.6s delay + 1.2s rise) settles
  at 3.8 + 1.8 = 5.6s.
- Captured window extends to 7.8s, holding ~2.2s on the settled presave CTA
  before the cut.

## MIDI click track

`generate-midi.js` writes `out/hero-cues.mid`: a 110 BPM click track with a
C4 blip each time a letter starts flying in (12 notes, 0.12s apart, matching
`lib/heroChoreography.ts`'s stagger) and a C5 at 2.92s when the last letter
finishes settling and the wordmark is fully assembled. No dependencies —
Standard MIDI File format 0 is simple enough to hand-build. Regenerate with:

```sh
node generate-midi.js
```

Edit `LETTER_STAGGER_SEC`, `BLOB_DURATION_SEC`, note numbers, or note
lengths at the top of the file to adjust.

## Adjusting

- **Duration / resolution**: edit `TARGETS` and `ENTRANCE_DURATION_MS` in
  `capture.js`, `TARGETS` and `CAPTURE_DURATION_MS` in `capture-url-cta.js`,
  or `WIDTH`/`HEIGHT` and `CLICK_TIMES_MS`/`REVEAL_SETTLE_MS`/`HOLD_MS` in
  `capture-las-olas.js`.
- **URL CTA look/timing**: all in `assets/url-cta.html` — it's plain
  CSS keyframes, same hand-written style as the rest of the site.
- If `LasOlas.tsx`'s `REVEAL_AT` (taps required) or `REVEAL_HOLD_MS` changes,
  update `CLICK_TIMES_MS`'s length/spacing in `capture-las-olas.js` to match;
  if `lasRise`'s delay/duration in `app/globals.css` changes, update
  `REVEAL_SETTLE_MS` too.
- **Encode quality**: the ffmpeg args in `lib/video.js`'s `encode()`
  (currently `-crf 16 -preset slow`, visually lossless-ish H.264). Lower
  `-crf` = higher quality / bigger file.
- If the hero choreography timing changes in `lib/heroChoreography.ts`,
  re-check `ENTRANCE_DURATION_MS` in `capture.js` still covers the full
  settle, and re-run `generate-midi.js`.
