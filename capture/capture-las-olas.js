// Frame-accurate export of /las-olas to MP4, vertical only (matches
// capture.js's hero-vertical targets): waves rise and the logo sharpens
// into view, holds, then crossfades into a live-action clip
// (assets/las olas preview.mp4) that fills the rest of the 12s runtime.
//
// The real /las-olas page (components/LasOlas.tsx) reveals this progress
// through 4 discrete taps: each one jumps a `clicks` counter, which snaps
// the logo/wave CSS to the next of 5 fixed states and plays a per-tap
// "sway" bounce + water ripple. That's the right interaction for a visitor
// tapping their phone, but it reads as stepped/touch-driven on video. This
// script never dispatches a click — `clicks` stays 0 for the whole capture,
// so React's own tap-driven styling never engages (and neither does the
// per-tap sway or the ripples, which only ever get created by a click).
//
// Instead, `preparePage()` below reaches past React and drives the same
// visual properties (logo filter/opacity, wave `top`) directly via two
// hand-written `@keyframes` set as inline `animation` on the actual
// elements — one continuous ease from the "just tapped the water" state to
// the "fully revealed" state. Because nothing here is React-driven, setting
// `.style.animation` once and letting it run is enough; React never
// re-renders these elements (nothing changes React state) so it never
// overwrites what we set. This also means the reveal phase scrubs on the
// same single global clock `capture.js` uses (`lib/video.js`) — no
// per-animation offset tracking needed, since everything here starts
// together at mount.
//
// Centering/enlarging the logo uses the same technique as ISOLATE_LOGO in
// capture.js: override the wrapper's centering margin and cap the image's
// width via injected CSS, `!important`, targeting classes by substring
// since CSS Modules hashes the exact name.
//
// The crossfade clip is a different animal from everything above: an
// `HTMLVideoElement` isn't part of `document.getAnimations()`, so it can't
// ride the same `.currentTime` scrub. It's driven separately — seek
// `video.currentTime` per frame and await the `seeked` event before
// screenshotting, same "deterministic, not real-time" spirit as the rest of
// this file. The clip is served from a throwaway local HTTP server
// (startAssetServer below) rather than a `file://` src or an inline
// `data:` URI: Chromium blocks `file://` media loads from an `http://` page
// (mixed-origin restriction) and the video is ~12MB, too large to
// comfortably round-trip through `page.evaluate` as base64.
//
// The crossfade blends the clip in behind the logo/wave, then out again at
// the very end — and the wave and logo are not on the same timer:
//   1. CROSSFADE_STAGE1_MS: the clip fades in *behind* the logo and wave.
//      The open "background" gaps around them reveal it immediately — no
//      opaque content there to hold it back. The wave (which otherwise
//      hides it) holds fully opaque for WAVE_FADE_HOLD_MS first — a beat
//      where the clip is already visible in the background gaps while the
//      wave still blocks it, making the DOM-stacking trick itself legible —
//      then fades out over the same span the clip's fade-in uses, finishing
//      at WAVE_FADE_END_MS. The logo is untouched through all of this.
//   2. The clip is now fully faded in and the wave is gone; the logo stays
//      put, sitting fully opaque over the clip's own footage, until the
//      clip's own built-in fade to black begins (VIDEO_FADE_START_MS/
//      VIDEO_FADE_END_MS, measured from the clip itself) — then the logo
//      fades out on that exact same schedule, so the two disappear
//      together rather than the logo vanishing on some earlier, unrelated
//      timer of its own.
// This is plain DOM stacking, not a mask: the video is inserted as a CHILD
// of the scene with `position: absolute; z-index: -1`, which — per the CSS
// painting-order spec — paints above the scene's own background (a child
// always paints above its parent's background, regardless of z-index) but
// below the logo (non-positioned, in-flow) and the wave (position:
// absolute with z-index:auto, which paints even later). So wherever the
// logo/wave are opaque, they simply cover the video underneath for free;
// wherever they're not, the video already shows through.
//
// See README.md in this folder for usage.

const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer");
const { DEVICE_SCALE_FACTOR, frameTimes, pauseAllAnimations, setAnimationTime, encode } = require("./lib/video");

const BASE_URL = process.env.CAPTURE_URL || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "out");
const VIDEO_PATH = path.join(__dirname, "assets", "las olas preview.mp4");
const WIDTH = 1080;
const HEIGHT = 1920;

// Duration of the single continuous logo/wave reveal ease.
const SMOOTH_MS = 4000;
// Hold on the settled, fully-revealed frame before the crossfade starts —
// long enough that the ambient motion (breathing sway, scrolling wave
// crests) reads as deliberate rather than a jump cut into the clip.
const HOLD_MS = 8000;
const CAPTURE_DURATION_MS = SMOOTH_MS + HOLD_MS;
// The two-stage blend's two stages (see header comment), timed
// independently rather than split evenly: stage 1 is the clip fading in
// behind the logo/waves, stage 2 is the logo/waves fading out to reveal it
// everywhere. The clip itself keeps playing at its own pace throughout —
// these only control how long the waves/logo linger before they're gone,
// not when the clip's own playback starts or ends (still end-aligned via
// crossfadeStartMs below, so the rest of the clip's runtime is unaffected).
const CROSSFADE_STAGE1_MS = 2000;
// The wave holds fully opaque for this long after the clip starts fading in
// behind it, before the wave itself starts fading out — a beat where the
// clip is already visible through the open background gaps around the
// wave/logo (the DOM-stacking trick, see header comment) while the wave is
// still fully solid on top of it, so the layering itself reads as
// intentional before the wave dissolves away and reveals the rest.
const WAVE_FADE_HOLD_MS = 1000;
// The wave then fades out over the same CROSSFADE_STAGE1_MS span as the
// clip's own fade-in, just starting WAVE_FADE_HOLD_MS later — so it
// finishes this long after elapsed=0. Everything downstream that used to
// time itself off CROSSFADE_STAGE1_MS alone (the logo's move, below) now
// times itself off this instead, since the wave — not the clip's fade-in —
// is the thing it needs to sync with finishing.
const WAVE_FADE_END_MS = WAVE_FADE_HOLD_MS + CROSSFADE_STAGE1_MS;
// The logo's own fade-out is timed to the clip's *own* built-in fade to
// black near its end, not to a fixed duration after stage 1 — so the logo
// disappearing reads as part of the same fade rather than a separate,
// earlier event. These are the clip's own fade window on its local
// timeline (which is the same as `elapsed` here, since the clip starts
// playing at elapsed=0 — see crossfadeStartMs below), measured by sampling
// average frame luminance (`ffmpeg -vf signalstats`) against "assets/las
// olas preview.mp4": brightness holds roughly steady until ~5.8s, then
// drops steeply to black by ~7.55s (full duration ~7.66s). If the clip is
// swapped for a different one, re-measure and update these two — unlike
// the clip's own duration/end-alignment, this can't be derived from
// metadata automatically.
const VIDEO_FADE_START_MS = 5800;
const VIDEO_FADE_END_MS = 7550;
// The logo slides from its reveal position down to the vertical center of
// the bottom third of the frame over this long — timed backward from
// WAVE_FADE_END_MS (above) so the move always *finishes* exactly when the
// wave's own fade does, landing in position right as the logo's own fade
// (tied to the clip's fade window, below) begins, rather than starting only
// once the wave's gone.
const LOGO_MOVE_DURATION_MS = 2000;
// Currently 1000 (3000 - 2000): the move starts partway through the wave's
// hold, once WAVE_FADE_HOLD_MS has been re-derived into WAVE_FADE_END_MS.
// If any of these durations change, this re-derives itself rather than
// needing to be hand-tuned back into sync.
const LOGO_MOVE_START_MS = WAVE_FADE_END_MS - LOGO_MOVE_DURATION_MS;
// Equivalent absolute `top` for the old `margin-bottom: 25vh` flex-centered
// position (see the "optical vs mathematical centering" comment where that
// 25vh was chosen) — `top: (100vh - 25vh) / 2` — expressed as `top` instead
// of a margin so it can be interpolated in the frame loop below; a CSS
// transition can't be scrubbed deterministically (see README.md's "a
// still-shot screenshot can catch a transition mid-flight" for why).
const LOGO_TOP_START_PCT = 37.5;
// Vertical center of the frame's bottom third: (2/3 + 1) / 2 * 100.
const LOGO_TOP_END_PCT = 83.333;

// Serves just the one clip on an ephemeral localhost port, ignoring the
// request path entirely — this only ever needs to hand back one file, so
// there's no reason to deal with URL-encoding "las olas preview.mp4"'s
// space or build out a real static-file server.
function startAssetServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      fs.stat(VIDEO_PATH, (err, stat) => {
        if (err) {
          res.writeHead(404);
          res.end();
          return;
        }
        // Range support isn't optional here: Chromium's <video> seeking
        // fetches the byte range it needs for a given currentTime via a
        // "Range" request, and falls back to whatever's already buffered
        // (silently, no error) if the server can't fulfill it — without
        // this, seeks past however much of the file arrived on the initial
        // request just freeze on the last successfully-decoded frame
        // instead of erroring, which is a much harder bug to spot than it
        // sounds (the first second or so of seeking looks completely fine).
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
        if (!match) {
          res.writeHead(200, {
            "Content-Type": "video/mp4",
            "Content-Length": stat.size,
            "Accept-Ranges": "bytes",
          });
          fs.createReadStream(VIDEO_PATH).pipe(res);
          return;
        }
        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Number(match[2]) : stat.size - 1;
        res.writeHead(206, {
          "Content-Type": "video/mp4",
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
        });
        fs.createReadStream(VIDEO_PATH, { start, end }).pipe(res);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function preparePage(browser, videoUrl) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DEVICE_SCALE_FACTOR });

  // Force the Spanish dictionary (the site's default locale) regardless of
  // whatever Accept-Language this machine's Chromium sends — getServerLocale()
  // checks this cookie before falling back to the header.
  await page.setCookie({ name: "pl_locale", value: "es", url: BASE_URL });

  await page.goto(`${BASE_URL}/las-olas`, { waitUntil: "load" });

  await page.addStyleTag({
    content: `
      @keyframes lasLogoReveal {
        from { filter: blur(14px) brightness(0.9); opacity: 0.12; }
        to { filter: blur(0px) brightness(1); opacity: 1; }
      }
      @keyframes lasWaveRiseA {
        from { top: -20%; }
        to { top: 44%; }
      }
      @keyframes lasWaveRiseB {
        from { top: -14%; }
        to { top: 46%; }
      }
      /* Mathematically centering logoWrap (top: 50%, letting the scene's
         own middle be dead center) looks WRONG once the logo is this
         large: the waves fill roughly the bottom third of the frame at
         full reveal (waveTop settles at 44%), so a true center leaves a
         huge gap above the wordmark and almost none below it before the
         crest — reads as "too high," not centered. 37.5% nudges it up
         just enough to give the wordmark even breathing room between the
         top edge and the wave crest instead of the full viewport edges —
         checked empirically against several values with capture's
         quick-frame.js-style still-shot approach, not derived from a
         formula, since it's an optical-balance call (this used to be
         expressed as margin-bottom: 25vh on a flex-centered element, which
         is exactly equivalent to top: 37.5% here — switched to absolute
         positioning so captureScene can animate top directly once the
         wave disappears; see LOGO_TOP_START_PCT/LOGO_TOP_END_PCT).
         Re-check this if the min(72vh, 72vw) width below or the wave
         keyframes' end values change. */
      /* Forces .scene (already position: relative) to establish its own
         stacking context, so the crossfade video's z-index: -1 (added
         later, once the video element exists) is guaranteed to stay
         contained behind .scene's own children instead of depending on
         .scene having no competing siblings at the body level. */
      [class*="__scene"] { z-index: 0; }
      [class*="__logoWrap"] {
        position: absolute !important;
        left: 50% !important;
        /* No !important here, unlike its siblings: nothing else sets top
           on this element (it's a flex item in the real component, not
           positioned), so nothing needs beating — and captureScene animates
           this via plain el.style.top later, which an !important stylesheet
           rule would silently keep winning over. */
        top: 37.5%;
        transform: translate(-50%, -50%) !important;
        margin-bottom: 0 !important;
      }
      [class*="__logoImage"] { width: min(72vh, 72vw) !important; }
      [class*="__tapHint"] { display: none !important; }
      [class*="__depthMeterWrap"] { display: none !important; }
      [class*="__revealPanel"] { display: none !important; }
    `,
  });

  await page.waitForSelector('img[alt="Las Olas"]', { timeout: 15000 });
  await page.evaluate(() => {
    const img = document.querySelector('img[alt="Las Olas"]');
    if (!img) return Promise.resolve();
    if (img.complete) return img.decode().catch(() => {});
    return new Promise((resolve) => {
      img.onload = () => img.decode().then(resolve, resolve);
      img.onerror = resolve;
    });
  });

  await page.evaluate((ms) => {
    const img = document.querySelector('img[alt="Las Olas"]');
    img.style.animation = `lasLogoReveal ${ms}ms ease both`;
    // IDed here so captureScene can fade them out by reference later,
    // separately from the filter/opacity/top animations already running on
    // the image and the wave layers themselves.
    img.closest('[class*="__logoWrap"]').id = "__logoWrapFade";
    const [waveA, waveB] = document.querySelectorAll('[class*="__waveLayer"]');
    waveA.id = "__waveLayerA";
    waveB.id = "__waveLayerB";
    waveA.style.animation = `lasWaveRiseA ${ms}ms ease both`;
    waveB.style.animation = `lasWaveRiseB ${ms}ms ease both`;
  }, SMOOTH_MS);

  // Two rAFs so the animations above (and the page's own idle lasBreath/
  // lasWave loops) actually exist in document.getAnimations() before we
  // pause everything — see lib/video.js's setAnimationTime for why one rAF
  // isn't reliably enough.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  );
  await pauseAllAnimations(page);

  // The crossfade overlay: full-bleed, muted (silent export — see
  // README.md), never actually played — it's seeked frame-by-frame like
  // everything else here, starting fully transparent so it's inert until
  // the capture loop below starts raising its opacity. object-fit: cover
  // is a safety net; the clip's native 2160x3840 already exactly matches
  // this capture's physical resolution (1080x1920 @ deviceScaleFactor 2),
  // so it renders pixel-for-pixel with no actual cropping/scaling.
  //
  // Appended inside the scene (not document.body) with position: absolute
  // and z-index: -1 so it paints behind the logo/waves rather than on top —
  // see the header comment for why that's what makes the two-stage reveal
  // work without an actual mask.
  const videoDurationMs = await page.evaluate((src) => {
    return new Promise((resolve, reject) => {
      const scene = document.querySelector('[class*="__scene"]');
      const video = document.createElement("video");
      video.id = "__crossfadeVideo";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;z-index:-1;pointer-events:none;";
      video.addEventListener("loadedmetadata", () => resolve(video.duration * 1000), { once: true });
      video.addEventListener("error", () => reject(new Error("crossfade video failed to load")), { once: true });
      scene.appendChild(video);
      video.src = src;
      video.load();
    });
  }, videoUrl);

  return { context, page, videoDurationMs };
}

// Advances the crossfade by one frame: seeks the clip, and sets the clip's,
// the wave's, and the logo's opacity — plus the logo's position — for this
// instant (see the timing breakdown in the header comment: the wave, the
// logo's fade, and the logo's move are three independently-timed things,
// not one shared value). Combined into one evaluate() call rather than
// several round-trips per frame.
async function updateCrossfade(page, { videoMs, videoOpacity, waveOpacity, logoOpacity, logoTopPct }) {
  await page.evaluate(
    ({ videoMs, videoOpacity, waveOpacity, logoOpacity, logoTopPct }) => {
      const video = document.getElementById("__crossfadeVideo");
      video.style.opacity = videoOpacity;
      const logoWrap = document.getElementById("__logoWrapFade");
      logoWrap.style.opacity = logoOpacity;
      logoWrap.style.top = `${logoTopPct}%`;
      document.getElementById("__waveLayerA").style.opacity = waveOpacity;
      document.getElementById("__waveLayerB").style.opacity = waveOpacity;
      return new Promise((resolve) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = videoMs / 1000;
      });
    },
    { videoMs, videoOpacity, waveOpacity, logoOpacity, logoTopPct }
  );
}

async function captureScene(page, dir, label, videoDurationMs) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const times = frameTimes(CAPTURE_DURATION_MS);
  // End-aligned: the clip plays once, straight through, finishing exactly
  // as the capture ends, so its own ending is the capture's last frame.
  const crossfadeStartMs = CAPTURE_DURATION_MS - videoDurationMs;
  for (let i = 0; i < times.length; i++) {
    const ms = times[i];

    // CSS side (logo/wave reveal + idle loops) — scrubbed the whole
    // runtime regardless of the crossfade; harmless once the video overlay
    // opacity reaches 1 and hides it, and keeps the two systems decoupled.
    await setAnimationTime(page, ms);

    if (ms >= crossfadeStartMs) {
      const elapsed = ms - crossfadeStartMs;
      const videoMs = Math.min(elapsed, videoDurationMs);
      // Stage 1 (0..CROSSFADE_STAGE1_MS): clip fades in behind the
      // logo/waves. The "background" gaps around them reveal it as soon as
      // it starts fading in — nothing opaque there to hold it back. The
      // wave (which otherwise stays fully opaque and hides it) holds for
      // WAVE_FADE_HOLD_MS before it starts fading too, so there's a beat
      // where the clip is already visible in the background gaps while the
      // wave still fully blocks it, then fades out over the same
      // CROSSFADE_STAGE1_MS span the clip's own fade-in uses, just starting
      // later — finishing at WAVE_FADE_END_MS, not at the end of stage 1.
      // The logo is unrelated to either of these and keeps its own timer,
      // below — it, the wave, and the clip are all on independent clocks.
      const videoOpacity = Math.min(elapsed / CROSSFADE_STAGE1_MS, 1);
      const waveElapsed = Math.max(elapsed - WAVE_FADE_HOLD_MS, 0);
      const waveOpacity = Math.max(1 - waveElapsed / CROSSFADE_STAGE1_MS, 0);
      // Logo fade: stays fully opaque, sitting over the clip's own footage,
      // until the clip's own built-in fade to black begins
      // (VIDEO_FADE_START_MS), then fades out on the exact same schedule as
      // the clip does — the two disappear together rather than the logo
      // fading on its own separate, earlier timer.
      const logoOpacity =
        elapsed <= VIDEO_FADE_START_MS
          ? 1
          : Math.max(1 - (elapsed - VIDEO_FADE_START_MS) / (VIDEO_FADE_END_MS - VIDEO_FADE_START_MS), 0);
      // Logo move: runs concurrently with stage 1 (see LOGO_MOVE_START_MS),
      // landing in its final position long before the logo's own fade (tied
      // to the clip's fade, above) begins.
      const moveProgress = Math.min(Math.max((elapsed - LOGO_MOVE_START_MS) / LOGO_MOVE_DURATION_MS, 0), 1);
      const logoTopPct = LOGO_TOP_START_PCT + (LOGO_TOP_END_PCT - LOGO_TOP_START_PCT) * moveProgress;
      await updateCrossfade(page, { videoMs, videoOpacity, waveOpacity, logoOpacity, logoTopPct });
    }

    const framePath = path.join(dir, `frame_${String(i).padStart(5, "0")}.png`);
    await page.screenshot({ path: framePath, type: "png" });
    if (i % 30 === 0 || i === times.length - 1) {
      process.stdout.write(`\r[${label}] frame ${i + 1}/${times.length}`);
    }
  }
  process.stdout.write("\n");
  return dir;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const assetServer = await startAssetServer();
  const { port } = assetServer.address();
  const videoUrl = `http://127.0.0.1:${port}/las-olas-preview.mp4`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--force-color-profile=srgb"],
    // Default (30s) is too tight for this script under real machine load —
    // 720 frames of video-seek-and-screenshot is a long enough run that a
    // handful of slow CDP round-trips (this machine routinely has several
    // other Chrome/Claude processes competing for CPU) shouldn't blow up
    // the whole capture.
    protocolTimeout: 300000,
  });

  try {
    const { context, page, videoDurationMs } = await preparePage(browser, videoUrl);
    const dir = await captureScene(
      page,
      path.join(OUT_DIR, "las-olas-vertical"),
      "las-olas vertical",
      videoDurationMs
    );
    await context.close();
    await encode(dir, path.join(OUT_DIR, "las-olas-vertical.mp4"), WIDTH, HEIGHT);
  } finally {
    await browser.close();
    await new Promise((resolve) => assetServer.close(resolve));
  }

  console.log("\nDone. Output in capture/out/:");
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.startsWith("las-olas")) console.log(`  ${f}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
