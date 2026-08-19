// Frame-accurate export of /las-olas to MP4, vertical only (matches
// capture.js's hero-vertical targets): waves rise and the logo sharpens
// into view in one continuous, centered, enlarged shot — no tap simulation.
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
// overwrites what we set. This also means capture is back to the same
// single-global-clock scrub `capture.js` uses (`lib/video.js`) — no
// per-animation offset tracking needed, since unlike the old tap-driven
// version, everything here starts together at mount.
//
// Centering/enlarging the logo uses the same technique as ISOLATE_LOGO in
// capture.js: override the wrapper's centering margin and cap the image's
// width via injected CSS, `!important`, targeting classes by substring
// since CSS Modules hashes the exact name.
//
// See README.md in this folder for usage.

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { DEVICE_SCALE_FACTOR, frameTimes, pauseAllAnimations, captureFrames, encode } = require("./lib/video");

const BASE_URL = process.env.CAPTURE_URL || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "out");
const WIDTH = 1080;
const HEIGHT = 1920;

// Duration of the single continuous reveal ease.
const SMOOTH_MS = 4000;
// Hold on the settled, fully-revealed frame before the clip ends — long
// enough that the ambient motion (breathing sway, scrolling wave crests)
// carries a 12s clip instead of sitting on a dead static frame.
const HOLD_MS = 8000;
const CAPTURE_DURATION_MS = SMOOTH_MS + HOLD_MS;

async function preparePage(browser) {
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
      /* Mathematically centering logoWrap (margin-bottom: 0, letting the
         scene's flex centering land it dead center) looks WRONG once the
         logo is this large: the waves fill roughly the bottom third of the
         frame at full reveal (waveTop settles at 44%), so a true center
         leaves a huge gap above the wordmark and almost none below it
         before the crest — reads as "too high," not centered. 25vh nudges
         it up just enough to give the wordmark even breathing room between
         the top edge and the wave crest instead of the full viewport edges
         — checked empirically against several values with capture's
         quick-frame.js-style still-shot approach, not derived from a
         formula, since it's an optical-balance call. Re-check this if the
         min(72vh, 72vw) width below or the wave keyframes' end values
         change. */
      [class*="__logoWrap"] { margin-bottom: 25vh !important; }
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
    const [waveA, waveB] = document.querySelectorAll('[class*="__waveLayer"]');
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

  return { context, page };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--force-color-profile=srgb"],
  });

  try {
    const { context, page } = await preparePage(browser);
    const dir = await captureFrames({
      page,
      dir: path.join(OUT_DIR, "las-olas-vertical"),
      times: frameTimes(CAPTURE_DURATION_MS),
      label: "las-olas vertical",
    });
    await context.close();
    await encode(dir, path.join(OUT_DIR, "las-olas-vertical.mp4"), WIDTH, HEIGHT);
  } finally {
    await browser.close();
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
