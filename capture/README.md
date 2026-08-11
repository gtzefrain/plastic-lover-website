# Social media video capture

Exports Plastic Lover motion assets to high-quality MP4 for social media:

- `capture.js` — the landing-page hero entrance animation
  (`components/HeroLogo.tsx` + `app/globals.css` keyframes, choreographed by
  `lib/heroChoreography.ts`).
- `capture-url-cta.js` — a standalone "visit the site" clip: `www.plasticlover.mx`
  fading in with a mouse cursor swooping in and clicking it.

Both use the same deterministic frame-scrub approach (`lib/video.js`) and the
same ffmpeg encode settings, so output from either is drop-in compatible with
the other for editing together.

## Why not a screen recorder / timecut / timesnap

The entrance is pure CSS keyframe animation. CSS animations run on the
browser's compositor thread, not the JS main-thread clock, so tools that
"fake" `Date.now()`/`performance.now()` (timecut, timesnap, etc.) never sync
with them — you get real-time capture with dropped/uneven frames.

Instead both scripts use the Web Animations API directly (`lib/video.js`):

1. Load the page in a **fresh** browser context.
2. Force-decode any CSS background-image (`img.decode()`) so nothing renders
   blank on the first scrubbed frames.
3. Call `document.getAnimations()` and `.pause()` every animation.
4. For each output frame, set every animation's `.currentTime` to the exact
   millisecond offset for that frame, then screenshot.

This is deterministic — the same frames come out every run regardless of
machine speed, and no frame is ever skipped.

## Requirements

- The site reachable at `http://localhost:3000` — **run it in production
  mode** (`npm run build && npm run start` from the repo root), not
  `next dev`. Dev mode renders the Next.js dev-tools indicator badge in the
  corner, which then bakes into every frame. (Only relevant to `capture.js`;
  `capture-url-cta.js` loads a local HTML file and doesn't touch the dev
  server at all.)
- `ffmpeg` on `PATH` (`brew install ffmpeg`).
- Node 18+.

## Usage

```sh
cd capture
npm install                  # installs Puppeteer + a bundled Chromium
npm run capture               # hero entrance -> capture.js
npm run capture:url-cta       # URL click-through CTA -> capture-url-cta.js
```

Set `CAPTURE_URL` to point at a different server for `capture.js` if needed:

```sh
CAPTURE_URL=http://localhost:3001 node capture.js
```

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
  `capture.js`, or `TARGETS` and `CAPTURE_DURATION_MS` in
  `capture-url-cta.js`.
- **URL CTA look/timing**: all in `assets/url-cta.html` — it's plain
  CSS keyframes, same hand-written style as the rest of the site.
- **Encode quality**: the ffmpeg args in `lib/video.js`'s `encode()`
  (currently `-crf 16 -preset slow`, visually lossless-ish H.264). Lower
  `-crf` = higher quality / bigger file.
- If the hero choreography timing changes in `lib/heroChoreography.ts`,
  re-check `ENTRANCE_DURATION_MS` in `capture.js` still covers the full
  settle, and re-run `generate-midi.js`.
