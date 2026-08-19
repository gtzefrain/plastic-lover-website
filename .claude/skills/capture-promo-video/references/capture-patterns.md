# Capture patterns — code sketches and worked examples

This supplements `SKILL.md` with the actual code shapes for each pattern, and two worked
debugging examples worth recognizing if they come up again. For *why* the deterministic
scrub approach exists at all (vs. a screen recorder or timecut/timesnap), see
`capture/README.md`'s "Why not a screen recorder" section — not repeated here.

## Pattern A — single declarative timeline

Everything starts together at mount, so one shared `.currentTime` works for every animation.
This is `capture.js`'s whole approach:

```js
const { DEVICE_SCALE_FACTOR, frameTimes, pauseAllAnimations, captureFrames, encode } = require("./lib/video");

// preparePage(): goto, wait for the real DOM to exist (not just "load" —
// client components often mount/preload after that), decode images,
// then pauseAllAnimations(page).

const dir = await captureFrames({
  page,
  dir: path.join(OUT_DIR, "my-target"),
  times: frameTimes(DURATION_MS),
  label: "my target",
});
await encode(dir, path.join(OUT_DIR, "my-target.mp4"), WIDTH, HEIGHT);
```

## Pattern B1 — interactive, smooth bypass (recommended default)

Never dispatch the real interaction. Set a hand-written `@keyframes` directly on the actual
DOM nodes once; because nothing here changes React state, React never re-renders those
elements afterward, so the direct mutation sticks. This collapses back to Pattern A's simple
shared-clock scrub. See `capture-las-olas.js` in full for the working version; the shape is:

```js
await page.addStyleTag({
  content: `
    @keyframes myReveal {
      from { opacity: 0.12; filter: blur(14px); }
      to   { opacity: 1;    filter: blur(0px); }
    }
    [class*="__someWrapper"] { /* recenter/resize/hide overrides */ }
  `,
});

await page.evaluate((ms) => {
  const el = document.querySelector("...");
  el.style.animation = `myReveal ${ms}ms ease both`;
}, SMOOTH_MS);

// two rAFs so the new Animation object actually exists in getAnimations()
// before pauseAllAnimations() runs, then the normal captureFrames() scrub.
```

Use real `@keyframes` (`animation`, with explicit `both` fill), not a CSS `transition` you
trigger by setting the target style — a `Animation` object backing a *transition* has trickier
pause/currentTime lifecycle semantics than a keyframe animation with `fill: both`, and the
established, tested technique in this codebase is keyframes. If you only need a single still
screenshot (a `quick-frame.js`-style composition check, not a real capture), a transition is
fine — see the gotcha below on why you still have to defeat it even for a still shot.

## Pattern B2 — interactive, faithful replay

Only build this if the user specifically wants the real stepped/bounce/ripple choreography
preserved on video. Two problems to solve, both because each interaction fires at a
*different* point on the timeline instead of everything starting together at mount:

1. **Per-animation offset tagging.** Inject page-side state (via `page.evaluateOnNewDocument`)
   that tags every new `Animation` with the simulated ms offset it was created at, and scrubs
   each one relative to its own tag instead of one global value:

   ```js
   const offsets = new WeakMap();
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
     return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
   };
   ```

   Drive the real interaction with `page.mouse.click(x, y)` (or similar) at each chosen
   simulated time, waiting two rAFs then calling `__tagNewAnimations(thatTime)` immediately
   after each one, before continuing the frame loop.

2. **Real `setTimeout`s fire "early."** Capturing hundreds of screenshots takes far longer in
   wall-clock time than the simulated seconds being scrubbed, so any `setTimeout` the
   interaction arms (a cleanup timer, a delayed callback) will fire relative to *real* elapsed
   time, landing well before the simulated timeline reaches that point — e.g. an element gets
   unmounted while its animation is still simulated to be mid-fade, popping it out of the DOM
   instead of finishing cleanly. Stretch long delays before they can do damage:

   ```js
   const realSetTimeout = window.setTimeout.bind(window);
   window.setTimeout = (fn, delay, ...args) => {
     const d = typeof delay === "number" ? delay : 0;
     return realSetTimeout(fn, d >= 2000 ? d * 100 : d, ...args); // leave short/internal delays alone
   };
   ```

   Also stub anything the interaction might trigger that shouldn't really fire in a headless
   capture context (e.g. `window.open`).

`git log` / a previous version of `capture-las-olas.js` had a full working implementation of
this pattern if you need a complete reference — check history if the file's since moved on to
Pattern B1.

## Pattern C — standalone graphic, not a real route

For content that doesn't exist as an actual page (e.g. arbitrary text using letter art that
only exists for specific words), build a self-contained local HTML file under `capture/assets/`
and load it via `file://` instead of adding a throwaway route to the app. See
`capture-url-cta.js` + `assets/url-cta.html`.

## Worked example: "the logo doesn't look centered" (optical vs. mathematical centering)

When `capture-las-olas.js` was first changed to recenter and enlarge the logo (mirroring
`capture.js`'s `ISOLATE_LOGO` technique — zero the wrapper's offsetting margin, cap width with
`min(72vh, 72vw)`), the math checked out: `getBoundingClientRect()` showed the image element's
box perfectly centered in the 1920px-tall viewport, and even a pixel-scan of the source PNG's
non-transparent bounding box showed the glyphs sitting within ~1% of that center. But the
rendered frame visibly did **not** look centered — the wordmark read as sitting too high.

The reason: the waves fill roughly the bottom third of the frame once fully revealed. A
mathematically-centered logo leaves a huge empty gap between the frame's top edge and the
wordmark, and almost no gap between the wordmark and the wave crest below it — the *visible
composition* is lopsided even though the element's box is dead center. The fix wasn't a CSS
bug fix; it was picking a `margin-bottom` (25vh, versus 0 for true center) by rendering several
candidates and looking at them, landing on whichever gave the wordmark even breathing room
between the frame's top edge and the wave crest. `quick-frame.js` exists because of this — a
fast single-screenshot tool for exactly this kind of by-eye iteration, instead of re-running a
330-frame capture for every nudge.

**Lesson**: when a human says a rendered frame "doesn't look right" and your CSS math says it
should be fine, believe the screenshot over the arithmetic. Verify actual rendered geometry
(`getBoundingClientRect`, or a canvas `getImageData` pixel bounding-box scan of the output PNG)
before concluding there's no bug — but also be ready to conclude the *math is right and the
composition is still wrong*, which needs an eyeballed fix, not a debugging fix.

## Related gotcha: stacking order can hide an enlarged subject

A `position: absolute` element paints **after** normal-flow (static) siblings in the same
stacking context, regardless of DOM order and even with no `z-index` set (`z-index: auto` still
stacks above static content). If you enlarge a subject that used to be small enough to avoid a
later absolutely-positioned overlay (a background wave/panel/etc.), its new, larger box can
extend into territory that overlay will now paint on top of — even though DOM order alone would
suggest otherwise. Worth specifically checking whenever a capture script enlarges something
past its original footprint.

## Related gotcha: a still-shot screenshot can catch a transition mid-flight

If you bypass React by setting `.style.someProperty` directly (Pattern B1, or a
`quick-frame.js`-style debug check) and that property already has a CSS `transition` declared
on it in the stylesheet, setting the new value doesn't apply it instantly — the transition
starts playing in real wall-clock time from that moment. A `page.screenshot()` taken right
after will show whatever the transition has interpolated to in the real milliseconds that have
elapsed since — usually still very close to the *start* value, not the end value you just set.
For a real capture, this is a non-issue (the deterministic scrub pauses and drives
`.currentTime` explicitly). For a quick still-shot debug tool, neutralize the transition first
(`transition: none !important` via an injected `<style>` tag) so the value you set is what
actually renders.
