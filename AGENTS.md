<!-- BEGIN:nextjs-agent-rules -->
# Next.js version note

This project runs Next.js 16, npm's current stable `latest` release — not a fork or beta. It's
newer than most training data, so APIs, conventions, and file structure may differ from what
you'd expect. Before writing code that touches routing, data fetching, config, or other
framework APIs, check the relevant guide in `node_modules/next/dist/docs/`.
<!-- END:nextjs-agent-rules -->

# Project: Plastic Lover

Marketing site for the band Plastic Lover. Next.js 16 App Router, React 19, TypeScript, CSS
Modules — no UI or animation libraries; all motion is hand-written CSS keyframes triggered via
inline `style`/`animationDelay` props. Deployed on Vercel.

**Never run `next dev` at the same time as `next build`/`next start` in this repo.** Both read
and write the same `.next/` directory; dev's incremental compiler will prune chunk files from a
concurrent prod build that it doesn't recognize, and the prod server then either 500s on the
missing chunks or silently renders with partial CSS. Stop dev first if you need a local prod
build (e.g. for `capture/`, see its README).

## Layout

- `app/` — one route per page (`live`, `releases`, `lyrics`, `videos`, `store`, `contact`,
  `subscribe`), plus `app/api/subscribe/route.ts` (POST, validates an email and posts it to a
  self-hosted [Listmonk](https://listmonk.app) instance via `LISTMONK_URL`,
  `LISTMONK_API_USER`, `LISTMONK_API_TOKEN` env vars — falls back to `console.log` when those
  aren't set, which is currently every local dev environment since they're only in Vercel
  Production/Preview). **Listmonk is live** at `https://list.plasticlover.mx` (deployed 2026-07-21;
  see `README.md`'s mailing-list section) — treat it as a real production system with real
  subscriber data, not a stub. The request body includes the subscriber's `locale` (`"en" | "es"`,
  from `MailingListForm`'s `locale` prop); the route maps it to a per-language Listmonk list via
  `LISTMONK_LIST_ID_EN` / `LISTMONK_LIST_ID_ES`, falling back to `LISTMONK_LIST_ID`.
  `app/subscribe/language/page.tsx` + `app/api/subscribe/language/route.ts` let a subscriber move
  between the EN/ES lists via a `?u=<uuid>&id=<id>` link meant for campaign emails. Both params are
  required: the id does the lookup and the uuid authorizes it, because the Listmonk API user
  deliberately lacks `subscribers:sql_query` and so can't resolve a UUID on its own — see README
  for the full reasoning before "simplifying" it back to a UUID-only lookup.
- `app/page.tsx` is a server component that reads the `pl_hero_seen` cookie and hands off to
  `components/HomeClient.tsx` (client component) to decide whether to play or skip the hero
  entrance animation.
- `components/` — shared components. Notably `PageShell.tsx` (nav + titled content + footer,
  used by every inner page) and two presentational CSS-module "kits" with no `.tsx` wrapper —
  `RowList.module.css` (list rows: live dates, lyrics, contact) and `CardGrid.module.css` (card
  grids: releases, store, videos) — imported directly by pages.
- `lib/heroChoreography.ts` — scatter offsets/delays for the 12-layer hero logo
  (`components/HeroLogo.tsx`, one PNG per letter in `public/logo/`).
- `lib/photoSets.ts` — positions/timings for the looping photo collage
  (`components/PhotoCollage.tsx`).
- `lib/nav.ts` — single source of truth for nav links, consumed by `SiteNav.tsx`.
- `lib/press.ts` + `app/press/[slug]/page.tsx` (per-release EPK) and `app/press/photos/page.tsx`
  (band-level photo library) — press-kit content, kept separate from `lib/releases.ts` so the
  fan-facing `/releases/[slug]` page doesn't get cluttered with press copy. `PressKit.slug`
  **must** match a `Release.slug` in `lib/releases.ts`. Bio/body copy always ship in both `es`
  (write this one first — Spanish is the site's default) and `en`; `bio` and `content` paragraphs
  support inline `[label](url)` markdown-links via `renderRichText()` in the `[slug]` page. Photos
  (`PressPhoto`) need `src` (web-sized, under `public/press/`) and grouping `category`;
  `downloadSrc` is optional and falls back to `src`. `contactEmail` defaults to
  `myplasticlover@gmail.com` when omitted. See the `plastic-lover-epk` skill for building a new
  kit and drafting outreach email.

See `README.md` for the full route table and architecture notes.

## Accessibility

The site was audited for accessibility — preserve these conventions in future changes rather than
regressing back to div-soup:

- Every page has exactly one `<h1>` (the real headline, not the small eyebrow/kicker label) and
  exactly one `<main id="main-content">`. `PageShell` renders the kicker as an `<h1>` by default;
  pass `kickerAs="p"` when the page already has its own `<h1>` (see `lyrics/[slug]`, `live`).
  `MailingListForm` takes a `headingLevel` prop for the same reason.
- `SiteNav` is a `<nav aria-label>` with real `<ul>/<li>` link lists and `aria-current="page"` on
  the active link; `Footer` is a `<footer>`. Card/row grids (`CardGrid.module.css`,
  `RowList.module.css`) render as `<ul>/<li>`, not `<div>` soup — the global `ul, ol` reset in
  `globals.css` keeps them unstyled by default, so no bullets/indentation to fight.
  `app/layout.tsx` renders two skip links, both using the shared `.skip-link` class
  (off-screen until `:focus`): a skip-to-content link targeting `#main-content`, and
  `components/SkipToFooter.tsx` targeting the `<footer id="site-footer" tabIndex={-1}>` in
  `Footer.tsx` (the `tabIndex={-1}` is what lets focus actually land on a non-focusable
  landmark). The footer one is a client component because `Footer` is per-page and some routes
  (`/las-olas`, `/releases/[slug]` and the press pages without `?site=1`) have none — it renders
  by default so the link is in the server HTML on the pages that do, and removes itself after
  mount when there's no `#site-footer`. Both link labels are localized (`nav.skipToContent`,
  `nav.skipToFooter`) — the site's default locale is Spanish, so hardcoded English strings here
  get announced under `<html lang="es">`.
  When converting a `<div>` to a heading or list element, add an explicit CSS reset
  (`margin`, `font-weight`) on that class so it doesn't pick up the browser's default heading/list
  styling.
- Form inputs get a real (often visually-hidden via the `.visually-hidden` global class) `<label>`
  — placeholder text alone is not an accessible label. Status messages after submit (e.g. "you're
  on the list") use `role="status"`.
- The video modals (`ReleasePlayer`, `VideoCardPlayer`) and the mobile nav drawer are
  `role="dialog"` / `aria-modal="true"`, move focus to the close control on open, restore focus to
  the trigger on close, and close on `Escape`. Follow this pattern for any new modal/overlay.
- Decorative-only elements (e.g. `HeroLogo`'s animated letter blobs) are `aria-hidden="true"` since
  the band name is already exposed elsewhere — the nav wordmark's logo image carries it as `alt`
  text, and it's real text again in the hero `<h1>`.
- A non-form element with an `onClick` needs a keyboard equivalent, not just a bigger tap target:
  `role="button"`, `tabIndex={0}`, and an `onKeyDown` that fires on Enter and Space
  (`event.preventDefault()` on Space so the page doesn't scroll). See `LasOlas.tsx`'s tap-to-reveal
  scene — the `role`/`tabIndex` are only applied while the control is still "live" (`!isRevealed`)
  and dropped once the reveal panel's own focusable link/button render, since a `role="button"`
  with focusable descendants inside it isn't valid. Move focus into whatever the action revealed,
  and back to the control when it resets (see the `wasRevealed` ref there) — don't leave focus
  stranded on an element that just left the DOM.
- Animation must respect `prefers-reduced-motion: reduce`. `globals.css` has a blanket
  `animation-duration`/`transition-duration` override for the CSS side of this — it catches every
  keyframe regardless of whether it's applied via a class or an inline `style` prop, which is why a
  single blanket rule was used instead of gating each animation individually (see the comment
  above it). That override does *not* reach a JS-driven `scrollTo({ behavior: "smooth" })`, since an
  explicit `behavior` option on the call beats the CSS `scroll-behavior` property — call
  `lib/motion.ts`'s `prefersReducedMotion()` and pass `"auto"` instead when it's true (see
  `ScrollArrow.tsx` and the replay handler in `HomeClient.tsx`).

When adding new pages or components, keep to these patterns instead of introducing new
unlabeled-div layouts.
