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
  `subscribe`), plus `app/api/subscribe/route.ts` (POST, validates an email and `console.log`s
  it — not yet wired to a real mailing-list provider).
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
