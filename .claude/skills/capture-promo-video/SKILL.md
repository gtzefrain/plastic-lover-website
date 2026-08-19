---
name: capture-promo-video
description: Build or update a frame-accurate MP4 capture script in capture/ for a Plastic Lover site animation, for social media (Instagram/TikTok/Reels/Stories promo clips). Use whenever asked to create, capture, export, or tweak a promo/social video of a page's animation or a specific visual moment — phrasings like "make a video of X," "export this animation," "capture the Y reveal for Instagram," or "redo/adjust that promo video." Builds on the existing capture/ tooling (capture.js, capture-url-cta.js, capture-las-olas.js, lib/video.js, quick-frame.js) instead of reinventing the deterministic frame-scrub approach from scratch.
---

# Capture a promo video

Read `capture/README.md` first — it's the living reference for every existing script's exact
usage, output files, and timing constants, and it must stay accurate after this job (see step 5).
Don't skip it even for a small tweak; the scripts share conventions that are easy to
almost-match and then subtly break.

## 1. Classify the target animation

Not every animation needs the same approach. Pick the closest match before writing code —
copy that script as your starting point rather than starting from a blank file.

| Target plays... | Pattern | Model after |
| --- | --- | --- |
| Automatically at mount, no user interaction (e.g. the hero entrance) | Single declarative timeline — everything starts together, one shared `.currentTime` scrub | `capture.js` |
| Only after real clicks/taps/timers (e.g. the original las-olas tap-to-reveal) | See below — this needs a decision, not just a template | `capture-las-olas.js` |
| Copy/graphic that isn't a real route (e.g. a URL fading in) | Self-contained local HTML file, captured via `file://` | `capture-url-cta.js` + `assets/url-cta.html` |
| A real video clip needs to appear in/finish the shot (e.g. crossfading into live-action footage) | `HTMLVideoElement`, seeked per frame — not part of `document.getAnimations()`, needs its own loop; see `references/capture-patterns.md` | `capture-las-olas.js`'s crossfade section |

**For the interactive case**, there are two real options — ask the user if it's not obvious
which they want:

- **Smooth bypass (default recommendation for promos)**: never dispatch the real
  click/tap. Since nothing changes React state, React never re-renders those elements after
  mount, so you can set a hand-written `@keyframes` directly on the real DOM nodes via
  `page.evaluate` (once) and let it ease continuously from the "before" look to the "after"
  look. This is what `capture-las-olas.js` does now — the real tap interaction is stepped
  (jumps between fixed states) and plays a per-tap "sway" bounce, which reads as touch-driven
  and janky on video, not like something a promo clip wants. Back to a single shared-clock
  scrub, same simplicity as the declarative case.
- **Faithful replay**: actually dispatch the interaction (real `page.mouse.click()` etc.) at
  chosen simulated times, preserving every stepped state/bounce/ripple. Meaningfully harder:
  each interaction creates new Animation objects at a *different* point on the timeline, so a
  single shared `.currentTime` no longer works — each one needs `.currentTime` driven relative
  to *when it was created*, not the capture's global clock. Real `setTimeout`s the interaction
  arms (cleanup timers, delayed callbacks) also run on the actual wall clock, which — because
  capturing hundreds of screenshots takes far longer in real time than the simulated seconds
  being scrubbed — fire "early" relative to the simulated timeline unless neutralized. See
  `references/capture-patterns.md` for the full per-animation-offset-tagging technique if this
  is genuinely what's wanted.

## 2. Confirm the creative call before building

Engineering details (fps, DSF, selectors, exact easing) are yours to decide. But anything with
real marketing consequences is the user's call — ask (`AskUserQuestion`) rather than guessing:

- Where the clip ends (does it show any CTA/subtitle, or cut earlier as a teaser?)
- Locale — this site defaults to Spanish (`es`); confirm if the target has visible copy.
- Pacing/duration, and whether smooth or faithful-replay (see above) is wanted.
- Vertical (1080x1920, the default), square (1080x1080), or both.
- Capture against a local prod build (default, reproducible) or the live site directly.
- If compositing in a real clip: how its runtime should align with the capture's (e.g.
  end-aligned so the clip's own ending lands on the capture's last frame — see
  `references/capture-patterns.md`), and whether to keep its audio (the other clips in this
  folder are all silent; keeping audio needs a different encode step, not just the frame scrub).

## 3. House conventions

- **1080x1920 @ 60fps** is the default target; add 1080x1080 only if asked. Match `TARGETS`
  array patterns already in `capture.js`.
- **Reuse `capture/lib/video.js`** — `DEVICE_SCALE_FACTOR`, `frameTimes`, `pauseAllAnimations`,
  `setAnimationTime`, `captureFrames`, `encode`. Only hand-roll a custom frame loop when the
  simple shared-clock scrub genuinely doesn't apply (faithful-replay case above).
- **Target CSS Modules classes by substring**: exact hashed names aren't known ahead of time —
  `[class*="__wrapperClassName"]` in an injected `page.addStyleTag`, with `!important`.
- **Force locale explicitly**: `page.setCookie({ name: "pl_locale", value: "es", url: BASE_URL })`
  before navigating — don't rely on Chromium's Accept-Language matching the site's default.
- **Isolating/recentering/enlarging a subject**: same injected-`<style>` technique as
  `ISOLATE_LOGO` in `capture.js` — hide everything else, zero out any offsetting margin, cap
  the subject's size with `min(Xvh, Xvw)`.
- **Positioning after resizing is an optical call, not a mathematical one.** Mathematically
  centering an enlarged element in its flex container can still look wrong if something else
  in frame unbalances it visually (see `references/capture-patterns.md`'s worked example — an
  opaque wave layer covering a third of the frame made true center look "too high"). Render a
  few candidate values and *look* — don't trust the arithmetic alone. Copy/adapt
  `quick-frame.js`'s pattern (jump straight to the end state, one screenshot, no full capture
  run) for fast iteration on a new target rather than re-running the whole capture every nudge.
- **Never run capture against `next dev`** — stop it, `npm run build && npm run start`, capture,
  then restart dev afterward so the environment is left as found (`AGENTS.md`'s dev/build rule).
  A `quick-frame.js`-style still-shot check is the exception — safe against dev since it doesn't
  need frame-perfect timing, only a settled final screenshot.
- Output goes to `capture/out/` (gitignored).

## 4. Wire it in

- Add an npm script to `capture/package.json`.
- Document it in `capture/README.md`: the script-listing bullet at the top, an entry in the
  Output table, an entry in "Key timing constants", and anything genuinely tunable in
  "Adjusting" — matching the existing entries' level of detail. This repo treats that README as
  the living spec for the tooling, not an afterthought; a script without a matching README
  update isn't done yet.

## 5. Always verify before calling it done

1. `ffprobe -show_entries stream=width,height,r_frame_rate,duration,codec_name` the output —
   confirm resolution/fps/duration match what you intended.
2. Sample frames across the *whole* timeline (start, a few midpoints, end/hold), downsize
   (`sips -Z 400 frame.png --out small.png`) and actually look at them via Read — don't trust
   that the script exiting cleanly means the output is right. Specifically check: nothing pops
   or disappears mid-animation (a sign a real-time timer fired mid-capture), motion is
   continuous where continuous was intended, and the composition actually looks
   right — not just mathematically centered (see the optical-centering note above).
3. Clean up scratch preview files afterward.
4. If something looks subtly wrong despite the CSS "obviously" being correct — verify the
   *actual* rendered geometry before changing anything. A quick Puppeteer snippet that logs
   `getBoundingClientRect()` or scans a captured frame's pixels for a bounding box (canvas +
   `getImageData`) is usually faster than guessing, and tells you whether the bug is really in
   your CSS or somewhere less obvious (source-image padding, a sibling's stacking order, a
   transition that hadn't finished when you screenshotted). See
   `references/capture-patterns.md` for the worked example.
