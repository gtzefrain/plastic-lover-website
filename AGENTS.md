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

## Layout

- `app/` — one route per page (`live`, `releases`, `lyrics`, `videos`, `store`, `contact`,
  `subscribe`), plus `app/api/subscribe/route.ts` (POST, validates an email and posts it to a
  self-hosted [Listmonk](https://listmonk.app) instance via `LISTMONK_URL`,
  `LISTMONK_API_USER`, `LISTMONK_API_TOKEN` env vars — falls back to `console.log` when those
  aren't set. **Listmonk itself is not deployed/self-hosted yet**; that's still TODO, so the env
  vars are unset in every environment for now). The request body includes the subscriber's
  `locale` (`"en" | "es"`, from `MailingListForm`'s `locale` prop); the route maps it to a
  per-language Listmonk list via `LISTMONK_LIST_ID_EN` / `LISTMONK_LIST_ID_ES`, falling back to
  `LISTMONK_LIST_ID` for an unset/unrecognized locale — set that as a default list, or set both
  per-language vars, when Listmonk is finally deployed.
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
  `app/layout.tsx` has a skip-to-content link targeting `#main-content`.
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
  the band name is already exposed as real text elsewhere (nav wordmark, hero `<h1>`).

When adding new pages or components, keep to these patterns instead of introducing new
unlabeled-div layouts.
