# Social media video capture

Exports Plastic Lover motion assets to high-quality MP4 for social media:

- `capture.js` — the landing-page hero entrance animation
  (`components/HeroLogo.tsx` + `app/globals.css` keyframes, choreographed by
  `lib/heroChoreography.ts`).
- `capture-url-cta.js` — a standalone "visit the site" clip: `www.plasticlover.mx`
  fading in with a mouse cursor swooping in and clicking it.
- `capture-las-olas.js` — a centered, enlarged `/las-olas` shot
  (`components/LasOlas.tsx`): waves rise and the logo sharpens into view in
  one continuous eased motion, waves + logo only (no tap hint, depth meter,
  or presave panel). See "Capturing /las-olas without the tap interaction"
  below for why this doesn't just replay the page's real tap-to-reveal
  interaction.
- `quick-frame.js` — not an export script: a fast one-screenshot composition
  check for `/las-olas` (jumps straight to the settled end state), for
  iterating on logo size/position without waiting on a full 12s/720-frame
  capture. See "Adjusting" below.

All three capture scripts use the same ffmpeg encode settings
(`lib/video.js`), so output from any of them is drop-in compatible with the
others for editing together.

## Why not a screen recorder / timecut / timesnap

The entrance is pure CSS keyframe animation. CSS animations run on the
browser's compositor thread, not the JS main-thread clock, so tools that
"fake" `Date.now()`/`performance.now()` (timecut, timesnap, etc.) never sync
with them — you get real-time capture with dropped/uneven frames.

Instead all three scripts use the Web Animations API directly
(`lib/video.js`):

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

## Capturing /las-olas without the tap interaction

On the real page, the wave-parting/logo-reveal only happens through 4 real
taps: each one jumps a `clicks` counter that snaps the logo/wave CSS to the
next of 5 fixed states and plays a per-tap "sway" bounce plus a water
ripple — the right interaction for a visitor's thumb, but stepped and
touch-driven on video, not the smooth continuous motion a promo clip wants.

`capture-las-olas.js` never dispatches a click, so `clicks` stays 0 for the
whole capture and none of that tap-driven styling (or the sway/ripples,
which only ever get created by a click) ever engages. Instead it sets a
hand-written `animation` directly on the logo `<img>` and the two wave-layer
divs — one continuous eased run from the "just touched the water" look to
"fully revealed" — via `page.evaluate`, bypassing React entirely. That's
safe here because nothing in the capture ever changes React state, so React
never re-renders (and never overwrites) those elements after the initial
style is set. It also means capture is back to the same single shared
`.currentTime` scrub `capture.js` uses — no per-animation offset tracking
needed, since everything here starts together, same as the hero's letters.

Centering and enlarging the logo reuses `capture.js`'s `ISOLATE_LOGO`
technique: an injected `<style>` tag overrides the wrapper's centering
margin and caps the image's width, targeting classes by substring since CSS
Modules hashes the exact name.

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
otherwise falls back to whatever locale Chromium happens to send. The
locale only affects metadata on this page though (there's no on-screen text
in the capture — tap hint, depth meter, and the presave panel are all hidden,
see above); edit the cookie value in `preparePage()` if that changes.

By default `capture.js`'s export is **logo-only**: nav, tagline, CTA, scroll arrow,
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
| `las-olas-vertical.mp4` | 1080x1920 (9:16) | Waves rise and the centered, enlarged logo sharpens in one continuous ease, holds on the settled wordmark, 0–12s |
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

- The `lasLogoReveal`/`lasWaveRiseA`/`lasWaveRiseB` keyframes (defined in the
  script, not `app/globals.css`) ease continuously over `SMOOTH_MS` = 4s from
  mount.
- Captured window extends to `SMOOTH_MS + HOLD_MS` = 12s, holding ~8s on the
  settled, centered wordmark before the cut — long enough that the ambient
  motion (breathing sway, scrolling wave crests) carries the clip rather than
  sitting on a dead static frame.

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
  or `WIDTH`/`HEIGHT` and `SMOOTH_MS`/`HOLD_MS` in `capture-las-olas.js`.
- **URL CTA look/timing**: all in `assets/url-cta.html` — it's plain
  CSS keyframes, same hand-written style as the rest of the site.
- **Las Olas logo size/position**: the `min(72vh, 72vw)` width cap and the
  `margin-bottom: 25vh` are in the injected `<style>` tag in
  `capture-las-olas.js`'s `preparePage()`. That 25vh isn't derived from a
  formula — true mathematical centering (`margin-bottom: 0`) looks *wrong*
  once the logo's this large, because the waves fill roughly the bottom
  third of the frame at full reveal, leaving a lopsided gap (huge above,
  almost none below) that reads as "too high." Use `quick-frame.js` to
  re-tune it by eye if the size or wave end-position changes:

  ```sh
  # requires the dev (or prod) server running on :3000
  node quick-frame.js 25 /tmp/check.png   # jumps straight to the settled
                                            # end state at margin-bottom: 25vh
  ```

  It's a one-screenshot tool (not a real capture), so it's safe to run
  against `next dev` for fast iteration — no need to stop dev/build/start
  just to check composition.
- If `LasOlas.tsx`'s idle/revealed filter, opacity, or wave `top` values
  change, update the matching `from`/`to` values in `capture-las-olas.js`'s
  `lasLogoReveal`/`lasWaveRiseA`/`lasWaveRiseB` keyframes to match.
- **Encode quality**: the ffmpeg args in `lib/video.js`'s `encode()`
  (currently `-crf 16 -preset slow`, visually lossless-ish H.264). Lower
  `-crf` = higher quality / bigger file.
- If the hero choreography timing changes in `lib/heroChoreography.ts`,
  re-check `ENTRANCE_DURATION_MS` in `capture.js` still covers the full
  settle, and re-run `generate-midi.js`.
