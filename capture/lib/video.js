// Shared frame-scrub + ffmpeg-encode helpers for the capture scripts in
// this folder. The deterministic-scrub approach (pause every Web Animation,
// set .currentTime per frame, screenshot) is documented in capture.js's
// header — this module just factors out the parts that don't differ
// between "capture the real hero page" and "capture a standalone local
// HTML animation".

const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const FPS = 60;
const DEVICE_SCALE_FACTOR = 2;

function frameTimes(durationMs, fps = FPS) {
  const count = Math.round((durationMs / 1000) * fps);
  const times = [];
  for (let i = 0; i < count; i++) {
    times.push(Math.round((i * 1000) / fps));
  }
  return times;
}

// Force-decode every CSS background-image on the page before touching the
// animation clock — without this the first scrubbed frames can render
// blank. No-op if the page has none.
async function decodeBackgroundImages(page) {
  await page.evaluate(async () => {
    const urls = new Set();
    document.querySelectorAll("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      const match = bg && bg.match(/url\(["']?(.*?)["']?\)/);
      if (match) urls.add(match[1]);
    });
    await Promise.all(
      Array.from(urls).map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => img.decode().then(resolve, resolve);
            img.onerror = resolve;
            img.src = src;
          })
      )
    );
  });
}

async function pauseAllAnimations(page) {
  await page.evaluate(() => {
    document.getAnimations().forEach((a) => a.pause());
  });
}

async function setAnimationTime(page, ms) {
  await page.evaluate((t) => {
    document.getAnimations().forEach((a) => {
      a.currentTime = t;
    });
  }, ms);
}

async function captureFrames({ page, dir, times, offsetMs = 0, label }) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < times.length; i++) {
    await setAnimationTime(page, offsetMs + times[i]);
    const framePath = path.join(dir, `frame_${String(i).padStart(5, "0")}.png`);
    await page.screenshot({ path: framePath, type: "png" });
    if (i % 30 === 0 || i === times.length - 1) {
      process.stdout.write(`\r[${label}] frame ${i + 1}/${times.length}`);
    }
  }
  process.stdout.write("\n");
  return dir;
}

async function encode(framesDir, outFile, width, height, fps = FPS) {
  const args = [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    path.join(framesDir, "frame_%05d.png"),
    "-vf",
    `scale=${width}:${height}:flags=lanczos`,
    "-c:v",
    "libx264",
    "-crf",
    "16",
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outFile,
  ];
  console.log(`[ffmpeg] encoding ${path.basename(outFile)}`);
  await execFileAsync("ffmpeg", args);
}

module.exports = {
  FPS,
  DEVICE_SCALE_FACTOR,
  frameTimes,
  decodeBackgroundImages,
  pauseAllAnimations,
  setAnimationTime,
  captureFrames,
  encode,
};
