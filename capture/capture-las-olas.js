// Frame-accurate export of the /las-olas "tap to reveal" presave teaser to
// MP4, vertical only (matches capture.js's hero-vertical-entrance target).
//
// This scene is NOT a single declarative entrance like the landing hero
// (see capture.js's header): it's driven by real click events. Each tap on
// components/LasOlas.tsx bumps a click counter that (a) mounts a fresh
// ripple (real CSS keyframe animations: lasRing/lasBloom/lasBubble), (b)
// re-triggers a CSS *transition* on the logo's filter/opacity and the wave
// layers' `top` (new value each tap, so a fresh Animation object each
// time), and (c) on the 4th tap flips `revealed` to true, mounting the
// presave panel (`lasRise`) and arming two real setTimeouts: one that
// unmounts each ripple 4.6s after it was created, one that calls
// `window.open()` on the presave link 3s after reveal.
//
// Two consequences for a deterministic scrub capture like the hero's:
//
// 1. The hero's approach sets ONE shared `.currentTime` on every
//    `document.getAnimations()` result each frame, which only works
//    because all of the hero's animations start together at mount. Here,
//    each tap creates new Animation objects at a *different* point on our
//    simulated timeline, so every animation needs `.currentTime` driven
//    relative to *when it was created*, not the capture's global clock.
//    `__tagNewAnimations`/`__scrubTo` below (injected into the page) track
//    a per-animation offset for exactly this.
//
// 2. The two real `setTimeout`s run on the actual wall clock, not our
//    simulated one — and capturing ~500 screenshots takes far longer in
//    real time than the ~8 simulated seconds we're scrubbing through, so
//    left alone they fire "early" relative to the simulated timeline
//    (e.g. a ripple's cleanup timer can land while it's simulated to still
//    be mid-fade, popping it out of the DOM instead of finishing its
//    animation). `evaluateOnNewDocument` below stretches any setTimeout
//    delay of 2s+ by 100x so neither timer can fire before a capture run
//    finishes, and stubs `window.open` so the presave tab never actually
//    tries to open from a headless capture context.
//
// See README.md in this folder for usage.

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { DEVICE_SCALE_FACTOR, frameTimes, encode } = require("./lib/video");

const BASE_URL = process.env.CAPTURE_URL || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "out");
const WIDTH = 1080;
const HEIGHT = 1920;

// Simulated ms (since mount) at which each of the 4 required taps fires.
// Evenly spaced 1s apart, landing on exact 60fps frame boundaries.
const CLICK_TIMES_MS = [800, 1800, 2800, 3800];
// lasRise: 0.6s delay + 1.2s rise = 1.8s from the last tap to fully settled.
const REVEAL_SETTLE_MS = 1800;
// Hold on the settled presave CTA before the clip ends.
const HOLD_MS = 2200;
const CAPTURE_DURATION_MS =
  CLICK_TIMES_MS[CLICK_TIMES_MS.length - 1] + REVEAL_SETTLE_MS + HOLD_MS;

async function preparePage(browser) {
  // Fresh, cookie-less/storage-less context every run: the reveal is
  // persisted via localStorage (see STORAGE_KEY in LasOlas.tsx), and a
  // stale value would skip straight to the revealed panel instead of
  // playing the 4-tap build-up.
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DEVICE_SCALE_FACTOR });

  // Force the Spanish dictionary (the site's default locale) regardless of
  // whatever Accept-Language this machine's Chromium sends — getServerLocale()
  // checks this cookie before falling back to the header.
  await page.setCookie({ name: "pl_locale", value: "es", url: BASE_URL });

  await page.evaluateOnNewDocument(() => {
    const LONG_DELAY_MS = 2000;
    const STRETCH = 100;
    const realSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, delay, ...args) => {
      const d = typeof delay === "number" ? delay : 0;
      return realSetTimeout(fn, d >= LONG_DELAY_MS ? d * STRETCH : d, ...args);
    };
    window.open = () => null;

    const offsets = new WeakMap();
    window.__scrubReset = () => {
      document.getAnimations().forEach((a) => {
        a.pause();
        offsets.set(a, 0);
      });
    };
    window.__tagNewAnimations = (offsetMs) => {
      document.getAnimations().forEach((a) => {
        if (offsets.has(a)) return;
        a.pause();
        a.currentTime = 0;
        offsets.set(a, offsetMs);
      });
    };
    window.__scrubTo = (frameMs) => {
      document.getAnimations().forEach((a) => {
        const offset = offsets.has(a) ? offsets.get(a) : 0;
        a.currentTime = Math.max(0, frameMs - offset);
      });
      // Two rAFs to guarantee a real paint with the new currentTime has
      // happened before the caller screenshots — see lib/video.js's
      // setAnimationTime for why one isn't reliably enough.
      return new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
    };
  });

  await page.goto(`${BASE_URL}/las-olas`, { waitUntil: "load" });

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

  await page.evaluate(() => window.__scrubReset());

  return { context, page };
}

async function waitTwoFrames(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  );
}

async function captureScene(page, dir, label) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const times = frameTimes(CAPTURE_DURATION_MS);
  let nextClick = 0;

  for (let i = 0; i < times.length; i++) {
    const ms = times[i];

    while (nextClick < CLICK_TIMES_MS.length && CLICK_TIMES_MS[nextClick] <= ms) {
      const clickMs = CLICK_TIMES_MS[nextClick];
      await page.mouse.click(WIDTH / 2, HEIGHT / 2);
      await waitTwoFrames(page);
      await page.evaluate((offset) => window.__tagNewAnimations(offset), clickMs);
      nextClick++;
    }

    await page.evaluate((t) => window.__scrubTo(t), ms);
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

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--force-color-profile=srgb"],
  });

  try {
    const { context, page } = await preparePage(browser);
    const dir = await captureScene(page, path.join(OUT_DIR, "las-olas-vertical"), "las-olas vertical");
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
