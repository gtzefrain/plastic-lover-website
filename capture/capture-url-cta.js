// Frame-accurate export of a "visit our site" call-to-action clip: the URL
// www.plasticlover.mx fades in and a mouse cursor swoops in and clicks it,
// using the same deterministic Puppeteer + Web Animations API
// scrub-and-screenshot approach as capture.js (see that file's header for
// why plain screen recording / timecut-style tools don't work here).
//
// This isn't a page on the live site. The hand-drawn letter PNGs used for
// the real wordmark only exist for P-l-a-s-t-i-c-L-o-v-e-r, so an arbitrary
// string like a URL has to be plain text instead — and rather than add a
// throwaway route to the Next.js app just to render it, the animation lives
// in a self-contained local file (assets/url-cta.html) that Puppeteer loads
// directly via file://.
//
// See README.md in this folder for usage.

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const {
  DEVICE_SCALE_FACTOR,
  frameTimes,
  pauseAllAnimations,
  captureFrames,
  encode,
} = require("./lib/video");

const HTML_PATH = path.join(__dirname, "assets", "url-cta.html");
const OUT_DIR = path.join(__dirname, "out");

// Text fades in over 0.8s, cursor swoops in from 0.9s-1.8s, clicks at 1.8s
// (press + ripple), then fades out by 2.8s — leaving a clean static hold
// for the rest of the clip.
const CAPTURE_DURATION_MS = 4000;

const TARGETS = [
  { name: "vertical", width: 1080, height: 1920 },
  { name: "square", width: 1080, height: 1080 },
];

async function preparePage(browser, width, height) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: DEVICE_SCALE_FACTOR });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: "load" });

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
      const dir = await captureFrames({
        page,
        dir: path.join(OUT_DIR, `${target.name}-url-cta`),
        times: frameTimes(CAPTURE_DURATION_MS),
        label: `${target.name} url-cta`,
      });
      await context.close();
      await encode(
        dir,
        path.join(OUT_DIR, `url-cta-${target.name}.mp4`),
        target.width,
        target.height
      );
    }
  } finally {
    await browser.close();
  }

  console.log("\nDone. Output in capture/out/:");
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.startsWith("url-cta")) console.log(`  ${f}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
