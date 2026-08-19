// Fast composition check for /las-olas: jumps straight to the fully-settled
// end state (no 5.5s scrub, one screenshot) so you can eyeball logo
// size/position against the waves without waiting on a full capture run.
// Works against `next dev` (unlike capture-las-olas.js) since it only needs
// a single still frame, not a real-time-independent scrub — see note below
// on why the transition still has to be neutralized even for a still shot.
//
// Usage (dev server running on :3000):
//   node quick-frame.js <marginBottomVh> [outPath]
//   node quick-frame.js 25 /tmp/check.png
//
// The margin-bottom value only matters for /las-olas' vertical placement;
// if you're checking a different page/property, edit the injected <style>
// and the final-state evaluate() below directly.

const puppeteer = require("puppeteer");

const MARGIN_VH = Number(process.argv[2] || 0);
const OUT = process.argv[3] || "/tmp/quick-frame.png";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.setCookie({ name: "pl_locale", value: "es", url: "http://localhost:3000" });
  await page.goto("http://localhost:3000/las-olas", { waitUntil: "load" });
  await page.addStyleTag({
    content: `
      [class*="__logoWrap"] { margin-bottom: ${MARGIN_VH}vh !important; }
      [class*="__logoImage"] { width: min(72vh, 72vw) !important; transition: none !important; }
      [class*="__waveLayer"] { transition: none !important; }
      [class*="__tapHint"] { display: none !important; }
      [class*="__depthMeterWrap"] { display: none !important; }
      [class*="__revealPanel"] { display: none !important; }
    `,
  });
  await page.waitForSelector('img[alt="Las Olas"]');
  await page.evaluate(() => {
    const img = document.querySelector('img[alt="Las Olas"]');
    return img.complete ? img.decode().catch(() => {}) : new Promise((r) => { img.onload = () => img.decode().then(r, r); img.onerror = r; });
  });
  // Setting the target values alone isn't enough for a still shot: the
  // page's own `transition: filter 1.4s ease, ...` would still be mid-flight
  // at whatever instant the screenshot lands, so the CSS override above
  // also neutralizes those transitions before this runs.
  await page.evaluate(() => {
    const img = document.querySelector('img[alt="Las Olas"]');
    img.style.filter = "blur(0px) brightness(1)";
    img.style.opacity = "1";
    const [a, b] = document.querySelectorAll('[class*="__waveLayer"]');
    a.style.top = "44%";
    b.style.top = "46%";
  });
  await page.screenshot({ path: OUT });
  await browser.close();
})();
