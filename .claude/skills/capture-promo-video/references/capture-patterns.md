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

## Pattern D — crossfading in a real video clip

An `HTMLVideoElement` isn't part of `document.getAnimations()`, so none of the CSS-scrub
patterns above reach it. Drive it separately, in the same frame loop, seeking it like you'd
scrub a CSS animation's `.currentTime` — deterministic, not real playback:

```js
async function seekVideo(page, ms) {
  await page.evaluate((t) => {
    const video = document.getElementById("myVideo");
    return new Promise((resolve) => {
      const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
      video.addEventListener("seeked", onSeeked);
      video.currentTime = t / 1000;
    });
  }, ms);
}

// per frame, alongside whatever CSS-side scrub is also running:
await seekVideo(page, videoLocalMs);
await page.evaluate((o) => { document.getElementById("myVideo").style.opacity = o; }, opacity);
```

Loading the clip has its own gotcha: a `file://` `<video src>` gets blocked by Chromium when the
page itself is `http://` (mixed-origin restriction) — this doesn't come up for `capture-url-cta.js`
because *that whole page* is `file://`, not just one asset inside an `http://` page. For a clip
of any real size, base64-inlining it through `page.evaluate` isn't worth the risk either. Spin up
a throwaway local HTTP server for the duration of the capture instead — it only ever needs to
serve the one file, so skip real routing/URL-encoding entirely and just ignore the request path.

**This server must support HTTP Range requests, or seeking silently breaks.** Chromium's
`<video>` seeking fetches the byte range it needs for a given `currentTime` via a `Range`
header, and — this is the trap — if the server can't fulfill it, the element doesn't error, it
just silently keeps showing whatever was last successfully decoded. A capture built against a
naive `Range`-ignoring server will look completely correct for the first second or so of
seeking (whatever arrived on the initial request) and then freeze on that frame for the rest of
the clip, with no error anywhere in the pipeline — this happened when this pattern was first
built (`capture-las-olas.js`'s crossfade played correctly for ~1s after fading in, then held
static for the remaining ~6s; the run itself exited cleanly, the frame count and duration
checked out, ffprobe on the output looked fine — the only way to catch it was sampling frames
across the *entire* clip and noticing frames 60+ apart were pixel-identical). Always support
Range:

```js
function startAssetServer(filePath) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      fs.stat(filePath, (err, stat) => {
        if (err) { res.writeHead(404); res.end(); return; }
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
        if (!match) {
          res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": stat.size, "Accept-Ranges": "bytes" });
          fs.createReadStream(filePath).pipe(res);
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
        fs.createReadStream(filePath, { start, end }).pipe(res);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve(server)); // port 0 = OS-assigned, read it back via server.address().port
  });
}
```

Close it in the same `finally` block that closes the browser.

**Timing the clip against the capture**: if it should finish exactly as the capture ends
(the common case for "crossfade into this at the end"), derive the start point from the clip's
*own* duration at runtime — read it off `loadedmetadata`, don't hardcode it — so re-cutting the
source clip doesn't silently desync the timing:

```js
const videoDurationMs = await page.evaluate((src) => new Promise((resolve, reject) => {
  const video = document.createElement("video");
  video.muted = true; // keep this off document flow's autoplay-policy path — never call .play()
  video.addEventListener("loadedmetadata", () => resolve(video.duration * 1000), { once: true });
  video.addEventListener("error", () => reject(new Error("video failed to load")), { once: true });
  video.src = src;
  video.load();
}), videoUrl);

const crossfadeStartMs = CAPTURE_DURATION_MS - videoDurationMs;
```

**Audio**: every clip in this folder is silent by convention (edited together with music/
voiceover later) — mute the element and don't touch its audio track. If a job genuinely needs
the clip's own audio in the export, that's a real departure from how `lib/video.js`'s `encode()`
works (pure image-sequence → ffmpeg, no audio input) and needs its own ffmpeg pass to mux the
source audio in, time-aligned to when the clip starts in the timeline — confirm this is actually
wanted before building it, it's meaningfully more work than the silent case.

**Layering the clip behind existing content, not just on top of it**: a flat opacity fade (clip
on top of everything, full-bleed, rising 0→1) is the simple default, but "the clip should reveal
*through* the scene rather than just cover it" is a real, different look, and it's cheap to get
right with plain DOM stacking — no mask needed. Insert the video as a *child of* the element
you want it to appear behind (not `document.body`), `position: absolute; z-index: -1`. Per the
CSS painting-order spec, a child always paints above its own parent's background regardless of
z-index, but a negative-z-index child still paints *below* that parent's normal-flow content and
its `z-index: auto` positioned content. So the clip shows through wherever the foreground
content is absent or transparent, and stays hidden wherever it's opaque — for free. Force the
parent to formally establish its own stacking context (`z-index: 0` is enough, given it's
already `position: relative`) so the negative-z-index child can't leak out and interact with
unrelated siblings. To then reveal the clip *everywhere*, don't touch the clip's own z-index or
opacity further — just fade the foreground content's opacity to 0 on top of it, in a second
stage. (`capture-las-olas.js` does exactly this: `CROSSFADE_STAGE1_MS` controls the fade-in.
The fade-*out* of the remaining foreground element (the logo) isn't its own separate duration
though — it's tied to the clip's *own* built-in fade to black, measured from the clip itself
and re-used as the foreground's fade window too, so the two disappear together. See the
"target duration can silently overshoot" gotcha below for why a separate fixed duration was
the wrong call here.)

**Don't assume every occluded element belongs on the same fade timer.** The first version of
this tied the logo *and* the wave to one shared opacity value for stage 2, since both are
"foreground content sitting in front of the clip." But the wave, being fully opaque with no
transparency of its own, was already effectively "hidden vs. revealed" by the *background*
question alone — anywhere it wasn't, the clip was already showing by the end of stage 1. Leaving
it on the stage-2 timer meant it sat fully opaque, doing nothing, through all of stage 1, then
faded alongside the logo — visually lagging behind a transition that (in the open background
around it) had already happened. Once pointed out, the fix was to give the wave its own opacity
tied to *stage 1's own progress* (`waveOpacity = 1 - videoOpacity`) so it finishes fading at the
same moment the clip finishes fading in, and leave the logo on its own separate stage-2 timer.
Generalizes: when several elements sit in front of a revealing clip, each one's fade-out belongs
on whichever stage matches how it actually becomes redundant, not necessarily the same stage as
its visual neighbors.

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

## Related gotcha: long/heavy runs can fail from real machine load, not a code bug

A capture with hundreds of frames — especially one also seeking a real `<video>` per frame
(Pattern D) — is CPU/memory-heavy enough and long-running enough (minutes) that on a normal
daily-driver machine (a regular browser with many tabs, other apps, other Claude Code sessions)
it can fail partway through with a Puppeteer `ProtocolError` (`Runtime.callFunctionOn timed
out`) or a detached-frame error. This is the headless Chromium renderer stalling or crashing
under contention, not a logic bug — it can happen at a different frame number every time, or
fail differently between runs (timeout vs. detached frame) for the exact same script and code.
Set a generous `protocolTimeout` on `puppeteer.launch()` (e.g. `300000`) to absorb ordinary
slowness, check `uptime`/`top -l 1` if it fails more than once or twice in a row, and otherwise
just retry — don't start debugging the capture script itself until a retry under normal load
also fails.

## Related gotcha: `!important` in your own injected CSS can block your own later JS

If an injected `<style>` override sets a property with `!important` (needed to beat a real
competing value from the page's own stylesheet — e.g. forcing `position: absolute` on an element
that's normally a flex item), and `captureScene` later tries to animate that *same* property
frame-by-frame via plain `el.style.someProp = value`, the plain inline write silently loses. An
`!important` rule in a stylesheet beats a *non*-`!important` inline style, even though inline
style normally wins over a stylesheet rule — the common mental model ("inline style is always
highest priority") only holds once neither side has `!important`. The bug is quiet: the property
just never visibly changes across frames, with no console error and no exception, and it's easy
to miss if you only spot-check a couple of frames close together rather than the property's full
range.

Fix: don't put `!important` on any property your own frame loop will animate later — if a
property doesn't have a real competing value to beat (check first: does the *unmodified* page
set this property on this element at all?), it usually doesn't need `!important` in the first
place. If it genuinely does need both — beating a real value *and* being animatable — set it
once via `el.style.setProperty(prop, value, "important")` from JS instead of the injected
stylesheet, so your own later writes use the same mechanism and can keep overwriting it.

## Related gotcha: a target duration can silently overshoot an end-aligned deadline

When a fade/move duration is expressed as a fixed constant (e.g. `CROSSFADE_STAGE2_MS = 6000`)
but the moment it needs to *finish by* is itself derived from something else at runtime (here,
`crossfadeStartMs = CAPTURE_DURATION_MS - videoDurationMs`, since the clip is end-aligned), the
constant is only a wish, not a guarantee — the actual time available between the fade starting
and the deadline can be shorter than the constant asks for, and the visible result is the fade
stalling partway through: in this case the logo sat at ~6% opacity on the capture's last frame
instead of reaching 0, because a 6s fade target only had ~5.66s actually available before a
~7.66s clip (end-aligned in a 12s capture) ran out. Nothing errored; it just quietly looked wrong,
and only at the very last frame — easy to miss if you spot-check the middle of a transition
instead of its exact edges.

Quick fix: don't trust the constant directly in the per-frame calculation — clamp it against
however much time is actually available given the runtime-derived deadline, e.g.
`Math.min(TARGET_MS, deadlineMs - stageStartMs)`, so the fade always lands exactly on the deadline
(or earlier, if the constant is already short enough) instead of stalling short of it. This is
also why "should finish 1s before the clip ends" is a cleaner spec to implement than "should take
Nms" once anything upstream of the fade's start time is itself variable — a deadline stays correct
automatically as the clip changes; a fixed duration doesn't.

Better fix, when the thing you're syncing to is the clip's *own* content rather than an arbitrary
buffer: don't invent a duration or a deadline at all — measure the real event in the clip and use
its actual timing. Here, the "right" answer turned out to be neither a fixed 6s fade nor a
1s-before-end buffer, but "fade in sync with the clip's own built-in fade to black" — i.e. sample
the clip's own brightness curve (`ffmpeg -vf signalstats,metadata=print` and grep `YAVG`) to find
where its fade actually starts and ends, then drive the foreground element's opacity off those
same two timestamps. This sidesteps the overshoot bug category entirely (both ends are inside the
clip's own runtime by construction) and reads as more intentional on screen, since the two fades
are the *same* fade rather than two independently-timed ones that happen to land near each other.
The tradeoff: those two timestamps are specific to that one clip and have to be re-measured (not
re-derived automatically) if the clip is ever swapped — worth a comment pointing at the exact
`ffmpeg` command used, so re-measuring later doesn't require re-deriving the technique from
scratch.

**Also generalizes to move/slide timing, not just fades**: when a motion is supposed to *finish*
at the same moment some other trigger fires (e.g. the logo's slide-to-bottom-third needing to
land exactly when the wave's own fade completes), don't start the motion at the trigger and give
it its own duration — that makes it finish *after* the trigger, not at it. Instead derive the
motion's start time backward from the trigger: `moveStartMs = triggerMs - moveDurationMs`. If the
motion and the thing it's syncing to happen to share a duration, this naturally resolves to
starting at time zero — which looks like a coincidence but is really just the algebra working out,
and re-derives itself correctly if either duration changes later.
