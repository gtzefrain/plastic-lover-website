// Frame-accurate export of the Plastic Lover landing hero intro to MP4.
//
// The hero entrance is 100% CSS keyframe animation (see app/globals.css +
// lib/heroChoreography.ts). CSS animations run on the compositor clock, so
// "fake the JS clock" tools (timecut/timesnap) can't stay in sync with them.
// Instead this script uses the Web Animations API directly: it pauses every
// Animation on the page, then repeatedly sets each one's `.currentTime` to a
// specific millisecond offset and screenshots — deterministic, drops no
// frames, independent of how fast/slow the machine actually renders.
//
// See README.md in this folder for usage.

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const {
  DEVICE_SCALE_FACTOR,
  frameTimes,
  decodeBackgroundImages,
  pauseAllAnimations,
  captureFrames,
  encode,
} = require("./lib/video");

const BASE_URL = process.env.CAPTURE_URL || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "out");
// Hide nav/tagline/CTA/footer/mailing-list and capture just the animating
// logo, centered in frame — set to false to get the full hero section
// (nav visible, tagline/CTA fading in, etc.) like the site actually renders.
const ISOLATE_LOGO = process.env.CAPTURE_FULL_PAGE ? false : true;

// Entrance: letters finish settling ~2.92s in, tagline/CTA finish ~3.65s.
// Capture a bit past that so the float settles in before we cut.
const ENTRANCE_DURATION_MS = 5000;

// Loop variant: one full plFloat period (5s), offset so it starts after the
// one-shot entrance animations (plBlob/plMeltShadow/plFadeUp/plPop) have
// already finished and only the infinite plFloat is still running. Any
// 5000ms-wide window past that point loops seamlessly because plFloat's
// period is exactly 5000ms.
const LOOP_OFFSET_MS = 5000;
const LOOP_DURATION_MS = 5000;

const TARGETS = [
  { name: "vertical", width: 1080, height: 1920 },
  { name: "square", width: 1080, height: 1080 },
];

async function preparePage(browser, width, height) {
  // Fresh, cookie-less context every time: the hero is gated behind the
  // pl_hero_seen cookie, and a stale cookie would skip straight to the
  // static LOGO_3D.jpg fallback instead of playing the 12-letter entrance.
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: DEVICE_SCALE_FACTOR });
  // "load" (all discovered resources fetched) rather than "networkidle0":
  // this app's Vercel Analytics script 404s against a local server, and on
  // a loaded machine that retry traffic can keep the connection count above
  // zero long enough for networkidle0 to hang or resolve unpredictably late
  // — which was letting some frames get captured before every letter layer
  // had actually rasterized.
  await page.goto(BASE_URL, { waitUntil: "load" });

  // HeroLogo doesn't mount the 12 letter layers (or start their entrance
  // animation) until it's finished preloading their images client-side —
  // see the progress-ring loading state in components/HeroLogo.tsx. That
  // preload kicks off after hydration, outside anything the "load" event
  // above tracks, so without this wait decodeBackgroundImages/
  // pauseAllAnimations below could run before the letters even exist in
  // the DOM.
  await page.waitForFunction(() => document.querySelectorAll('[class*="__letter"]').length === 12, {
    timeout: 15000,
  });

  if (ISOLATE_LOGO) {
    // Social exports want just the animating logo, not the surrounding page
    // chrome. Rather than add a stripped-down route to the app for this,
    // hide everything else with injected CSS: nav/footer are position:fixed
    // overlays, the mailing-list section is a separate data-screen-label
    // block, and the tagline/CTA/scroll-arrow are Hero's other children.
    // Zeroing Hero's padding (reserved for the fixed nav/footer) lets
    // heroInner's flex centering re-center the logo in the full frame.
    //
    // HeroLogo.module.css caps the logo at `min(44vh, 70vw, 500px)` — sized
    // for it to sit alongside the tagline/CTA on a real browser window, not
    // to fill a 1080px export frame. Override that here (targeting
    // heroInner's surviving first child — the HeroLogo root — and its last
    // child, the shadow) so the logo reads as the subject of the clip
    // instead of a small watermark.
    //
    // Cap it at 72vh/72vw, not bigger: past ~75-80% of the viewport's
    // shorter side, the vertical (1080x1920 @ deviceScaleFactor 2) target
    // started silently dropping 1-2 of the 12 absolutely-positioned letter
    // layers from the screenshot — DOM/computed style for the missing
    // letters checked out identical to the visible ones (opacity 1, no
    // transform/blur), so this reads as a headless Chrome
    // raster/compositing limit tied to total physical viewport size, not a
    // logic bug. The square target never showed it even at 80%, only the
    // taller vertical one. Re-check this ceiling if TARGETS' dimensions or
    // DEVICE_SCALE_FACTOR change.
    await page.addStyleTag({
      content: `
        nav, footer { display: none !important; }
        [data-screen-label="Mailing List"] { display: none !important; }
        [data-screen-label="Hero"] { padding: 0 !important; }
        [data-screen-label="Hero"] > *:not([class*="__heroInner"]) { display: none !important; }
        [class*="__heroInner"] > *:not(:first-child) { display: none !important; }
        [class*="__heroInner"] > *:first-child { width: min(72vh, 72vw) !important; }
        [class*="__heroInner"] > *:first-child > *:last-child { width: min(48vh, 48vw) !important; }
      `,
    });
  }

  await decodeBackgroundImages(page);

  // Pause every animation immediately so real elapsed time stops mattering;
  // from here on the only thing that determines what's on screen is the
  // currentTime we assign per frame below.
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
    for (const target of TARGETS) {
      const { context, page } = await preparePage(browser, target.width, target.height);
      const entranceDir = await captureFrames({
        page,
        dir: path.join(OUT_DIR, `${target.name}-entrance`),
        times: frameTimes(ENTRANCE_DURATION_MS),
        label: `${target.name} entrance`,
      });
      await context.close();
      await encode(
        entranceDir,
        path.join(OUT_DIR, `hero-${target.name}-entrance.mp4`),
        target.width,
        target.height
      );
    }

    // Seamless loop variant, vertical only.
    const vertical = TARGETS.find((t) => t.name === "vertical");
    const { context, page } = await preparePage(browser, vertical.width, vertical.height);
    const loopDir = await captureFrames({
      page,
      dir: path.join(OUT_DIR, "vertical-loop"),
      times: frameTimes(LOOP_DURATION_MS),
      offsetMs: LOOP_OFFSET_MS,
      label: "vertical loop",
    });
    await context.close();
    await encode(
      loopDir,
      path.join(OUT_DIR, "hero-vertical-loop.mp4"),
      vertical.width,
      vertical.height
    );
  } finally {
    await browser.close();
  }

  console.log("\nDone. Output in capture/out/:");
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith(".mp4")) console.log(`  ${f}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
