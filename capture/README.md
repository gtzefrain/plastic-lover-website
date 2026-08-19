# Social media video capture

Exports Plastic Lover motion assets to high-quality MP4 for social media:

- `capture.js` — the landing-page hero entrance animation
  (`components/HeroLogo.tsx` + `app/globals.css` keyframes, choreographed by
  `lib/heroChoreography.ts`).
- `capture-url-cta.js` — a standalone "visit the site" clip: `www.plasticlover.mx`
  fading in with a mouse cursor swooping in and clicking it.
- `capture-las-olas.js` — a centered, enlarged `/las-olas` shot
  (`components/LasOlas.tsx`): waves rise and the logo sharpens into view in
  one continuous eased motion, holds, then crossfades into a live-action
  clip (`assets/las olas preview.mp4`) that fills the rest of the runtime —
  waves + logo only, no tap hint, depth meter, or presave panel. See
  "Capturing /las-olas without the tap interaction" and "Crossfading into a
  real clip" below.
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

## Crossfading into a real clip

After the reveal settles and holds, `capture-las-olas.js` blends into
`assets/las olas preview.mp4`, ending exactly as the capture ends (see the
timing breakdown below). An `HTMLVideoElement` isn't part of
`document.getAnimations()`, so it can't ride the same shared `.currentTime`
scrub as the rest of the scene — it's driven separately: seek
`video.currentTime` per frame and await the `seeked` event before
screenshotting, same "deterministic, not real-time" principle as everything
else in this folder, just via the media element's own API instead of the
Web Animations one. The two systems run side by side in the same frame loop
rather than one replacing the other.

The blend is two stages, not one flat opacity fade, and it's plain DOM
stacking rather than a CSS mask: the video is inserted as a *child of the
scene* with `position: absolute; z-index: -1`. Per the CSS painting-order
spec, a child always paints above its parent's own background regardless of
z-index, but a negative-z-index child still paints *below* the scene's
non-positioned content (the logo) and its `z-index: auto` positioned
content (the waves). So for free, with no mask:

1. **`CROSSFADE_STAGE1_MS`**: the clip fades in *behind* the logo/wave.
   The open "background" gaps around them reveal it immediately — no
   opaque content there to hold it back. (Since the logo art is a
   transparent PNG, the clip also shows faintly through its own negative
   space during this stage — that reads as part of the look, not a bug,
   once seen against motion rather than as a single still frame.) The wave
   (which otherwise stays fully opaque and hides the clip) holds for
   `WAVE_FADE_HOLD_MS` (1s) *after* the clip starts fading in, before it
   starts fading itself — a deliberate beat where the clip is already
   visible in the background gaps while the wave still fully blocks it, so
   the DOM-stacking trick (see above) is legible on screen before the wave
   dissolves away and reveals the rest. It then fades out over the same
   `CROSSFADE_STAGE1_MS` span the clip's own fade-in uses, just starting
   later, finishing at `WAVE_FADE_END_MS = WAVE_FADE_HOLD_MS +
   CROSSFADE_STAGE1_MS`. The logo itself is untouched through all of this.
2. The clip is now fully faded in and the wave is gone; the logo stays put,
   fully opaque over the clip's own footage, until the clip's own built-in
   fade to black begins — then the logo fades out on that *exact same
   schedule* (`VIDEO_FADE_START_MS`/`VIDEO_FADE_END_MS`), so the two
   disappear together rather than the logo vanishing on some earlier,
   unrelated timer of its own. Those two constants are the clip's own fade
   window on its local timeline (which is the same as `elapsed` here, since
   the clip starts playing at `elapsed = 0`) — measured by sampling average
   frame luminance against the clip file itself:
   ```sh
   ffmpeg -i "assets/las olas preview.mp4" \
     -vf "signalstats,metadata=print:file=-" -f null - 2>&1 | grep -E "pts_time|YAVG"
   ```
   Brightness (`lavfi.signalstats.YAVG`) holds roughly steady through most of
   the clip, then drops steeply to black over its last ~1.75s. If the clip
   is swapped for a different one, re-run this and update both constants —
   unlike the clip's own duration/end-alignment, this can't be derived from
   metadata automatically.

   (Earlier version: the logo faded out on its own fixed-duration timer
   right after stage 1, independent of the clip's own fade. A real bug hit
   during that design — a 6s fade *target* against a ~7.66s clip left only
   ~5.66s actually available before the capture ended, so the logo was
   still ~6% opaque on the last frame instead of gone — is why any duration
   derived from an end-aligned deadline needs clamping against how much time
   is actually available, not just declared as a constant. Tying the fade to
   the clip's own fade window sidesteps that class of bug entirely: both
   ends are already guaranteed to land inside the clip's own runtime.)

The wave and logo are driven by two separate opacity values (`waveOpacity`,
`logoOpacity`) — they used to share one, but that made the wave fade out
alongside the logo, well after it had already visually "lost" to the clip in
the background around it. Tying the wave to the clip's own stage-1 fade-in
instead keeps everything reading as one continuous reveal.

Independent of its fade, the logo also *moves*: it slides from its reveal
position to the vertical center of the frame's bottom third over
`LOGO_MOVE_DURATION_MS` (2s), timed backward via `LOGO_MOVE_START_MS =
WAVE_FADE_END_MS - LOGO_MOVE_DURATION_MS` so the move always *finishes*
exactly when stage 1 (the wave's fade) does — well before the logo's own
fade (tied to the clip's fade window, above) begins. The logo's positioning switched from a
flex-centered `margin-bottom` (see the "optical vs mathematical centering"
note above) to `position: absolute; top: <percent>` for exactly this reason
— a percentage `top` is something `captureScene` can interpolate frame by
frame, the same deterministic-scrub principle as everything else here,
where a margin-based flex offset isn't.

`[class*="__scene"] { z-index: 0; }` in the injected stylesheet forces the
scene to formally establish its own stacking context, so the video's
`z-index: -1` is guaranteed to stay contained within it rather than
depending on the scene having no competing siblings at the body level.

`assets/*.mp4` is gitignored — the clip itself isn't checked in (it's a
~12MB raw source file, not something worth tracking in git), so it has to
be placed at `assets/las olas preview.mp4` locally before this script will
run; without it the asset server 404s and `preparePage()`'s `loadedmetadata`
wait times out. `assets/url-cta.html` isn't affected by this rule — it's
small, hand-written, and meant to be tracked like any other source file.

The clip is served from a throwaway local HTTP server
(`startAssetServer()`), not a `file://` src or an inline `data:` URI —
Chromium blocks `file://` media loads from an `http://` page (a
mixed-origin restriction `capture-url-cta.js` never hits, since *that*
script's whole page is loaded via `file://`, not just one asset within an
`http://` page), and the clip is large enough (~12MB) that base64-inlining
it through `page.evaluate` isn't worth the risk. The server ignores the
request path entirely and always hands back the one file — there's only
ever one thing to serve, so it's not worth building out real routing or
dealing with the filename's space in a URL.

The clip is muted and never actually `.play()`s; it's silent in the export
(matching every other clip in this folder) and fully seek-controlled. Its
native resolution (2160x3840) exactly matches this capture's physical
resolution (1080x1920 CSS px at `deviceScaleFactor: 2`), so `object-fit:
cover` never actually has to crop or scale anything — it's there as a
safety net, not because the numbers don't already line up.

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
- `capture-las-olas.js`'s crossfade run is long (720 frames, most of them
  also seeking a real `<video>`) and CPU/memory-heavy enough that on a
  loaded machine (regular browser with many tabs, other apps, other Claude
  sessions) it can fail partway through with a Puppeteer `ProtocolError`
  (`Runtime.callFunctionOn timed out`) or a detached-frame error — the
  browser's renderer stalling or crashing under contention, not a bug in
  the script. `puppeteer.launch()` sets `protocolTimeout: 300000` to absorb
  ordinary slowness, but a genuinely overloaded machine can still lose the
  run. If it fails this way, just retry — check `uptime`/`top` first if it
  fails more than once or twice in a row.

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
| `las-olas-vertical.mp4` | 1080x1920 (9:16) | Waves rise and the centered, enlarged logo sharpens in one continuous ease, holds, then crossfades into `assets/las olas preview.mp4` full-bleed, 0–12s |
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
- Captured window is `SMOOTH_MS + HOLD_MS` = 12s total.
- The crossfade is **end-aligned**: `crossfadeStartMs = CAPTURE_DURATION_MS -
  videoDurationMs`, read from the clip's own `loadedmetadata` at runtime (not
  hardcoded), so the clip plays once, straight through, and its last frame
  lands exactly on the capture's last frame — swap in a differently-timed
  clip and this re-derives itself, no constant to update. `CROSSFADE_STAGE1_MS`
  (2s) controls both the clip's own fade-in speed and the wave's fade-out
  speed once it starts (see `WAVE_FADE_HOLD_MS` above for the 1s delay before
  it does); the logo's own fade is tied to the clip's *own* fade window instead
  (`VIDEO_FADE_START_MS`/`VIDEO_FADE_END_MS`, measured per clip — see
  above), not a separate duration of its own.

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
- **Las Olas logo size/reveal position**: the `min(72vh, 72vw)` width cap
  and the `top: 37.5%` (`LOGO_TOP_START_PCT`) are in the injected `<style>`
  tag in `capture-las-olas.js`'s `preparePage()`. That 37.5% isn't derived
  from a formula — true mathematical centering (`top: 50%`) looks *wrong*
  once the logo's this large, because the waves fill roughly the bottom
  third of the frame at full reveal, leaving a lopsided gap (huge above,
  almost none below) that reads as "too high." Use `quick-frame.js` to
  re-tune it by eye if the size or wave end-position changes — it still
  uses the older, visually-equivalent `margin-bottom` technique (25vh ≡
  37.5% top on a flex-centered element) rather than `top` directly, since it
  only needs a single static screenshot, not something to animate:

  ```sh
  # requires the dev (or prod) server running on :3000
  node quick-frame.js 25 /tmp/check.png   # jumps straight to the settled
                                            # end state at margin-bottom: 25vh
  ```

  It's a one-screenshot tool (not a real capture), so it's safe to run
  against `next dev` for fast iteration — no need to stop dev/build/start
  just to check composition.
- **Las Olas logo bottom-third move**: `LOGO_MOVE_DURATION_MS` (2s) and
  `LOGO_TOP_END_PCT` (83.333%, the vertical center of the bottom third) in
  `capture-las-olas.js` control the slide, timed via `LOGO_MOVE_START_MS` (see
  above) to *finish* exactly as the wave finishes disappearing rather than
  starting there. Note the CSS override deliberately leaves `top`
  *without* `!important` while its sibling properties (`position`, `left`,
  `transform`, `margin-bottom`) keep it — an `!important` stylesheet rule
  beats a later plain `el.style.top = ...` even though inline style normally
  wins, so animating a property from `captureScene` means it can't carry
  `!important` in its own initial CSS declaration. If a future override needs
  to both beat a real competing value *and* be animatable later, that's a
  contradiction — set it once via `el.style.setProperty(prop, value,
  "important")` from JS instead of the injected stylesheet.
- If `LasOlas.tsx`'s idle/revealed filter, opacity, or wave `top` values
  change, update the matching `from`/`to` values in `capture-las-olas.js`'s
  `lasLogoReveal`/`lasWaveRiseA`/`lasWaveRiseB` keyframes to match.
- **Crossfade clip**: swap `assets/las olas preview.mp4` for a different file
  (keep the same path, or update `VIDEO_PATH` in `capture-las-olas.js`) — the
  crossfade's start time re-derives itself from the new clip's own duration,
  nothing else to update unless its resolution no longer matches this
  capture's 1080x1920 (then `object-fit: cover` will crop instead of mapping
  pixel-for-pixel — still fine visually, just no longer a lossless passthrough).
  `CROSSFADE_STAGE1_MS` controls the fade-in speed; `VIDEO_FADE_START_MS`/
  `VIDEO_FADE_END_MS` need re-measuring against the new clip (see above) since
  they're specific to *this* clip's own fade-to-black, not derived from
  anything the script can read automatically.
- **Encode quality**: the ffmpeg args in `lib/video.js`'s `encode()`
  (currently `-crf 16 -preset slow`, visually lossless-ish H.264). Lower
  `-crf` = higher quality / bigger file.
- If the hero choreography timing changes in `lib/heroChoreography.ts`,
  re-check `ENTRANCE_DURATION_MS` in `capture.js` still covers the full
  settle, and re-run `generate-midi.js`.
