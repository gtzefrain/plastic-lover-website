# Plastic Lover

Marketing site for the band Plastic Lover — a Next.js App Router site with an animated hero
entrance, tour dates, releases, and a mailing-list signup backed by a live, self-hosted Listmonk
instance (not a stub — see the `/api/subscribe` row in the route table below).

## Stack

- **Next.js 16** (App Router) on **React 19**, TypeScript, CSS Modules — no UI/animation
  libraries; all motion is hand-written CSS keyframes driven from inline `style` props.
- Deployed on Vercel (project linked via `.vercel/`).

## Getting started

```bash
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint (eslint-config-next, flat config)
```

## Routes

| Route         | File                        | Notes                                             |
| ------------- | --------------------------- | -------------------------------------------------- |
| `/`           | `app/page.tsx`               | Server component reads the `pl_hero_seen` cookie, hands off to `HomeClient` (see below). |
| `/live`       | `app/live/page.tsx`          | Tour dates, built on `PageShell` + `RowList`.       |
| `/releases`   | `app/releases/page.tsx`      | Release cards, built on `PageShell` + `CardGrid`.   |
| `/releases/[slug]` | `app/releases/[slug]/page.tsx` | Single-release landing page (title, streaming embed, service links). Standalone — no `SiteNav`/`Footer`. Data in `lib/releases.ts`. |
| `/lyrics`     | `app/lyrics/page.tsx`        | `PageShell` + `RowList`.                            |
| `/videos`     | `app/videos/page.tsx`        | `PageShell` + `CardGrid`.                           |
| `/store`      | `app/store/page.tsx`         | `PageShell` + `CardGrid`.                           |
| `/contact`    | `app/contact/page.tsx`       | `PageShell` + `RowList`.                            |
| `/subscribe`  | `app/subscribe/page.tsx`     | Standalone mailing-list page (nav + form + footer). |
| `/subscribe/language` | `app/subscribe/language/page.tsx` | Newsletter language-switch page, linked from campaign emails (`?u=<subscriber uuid>`). Bilingual EN/ES chooser — see below. |
| `/press/[slug]` | `app/press/[slug]/page.tsx` | Electronic press kit for one release. Shows the minimal `PressNav` (logo + language selector) by default; full `SiteNav`/`Footer` only with `?site=1`. Data in `lib/press.ts`, joined to `lib/releases.ts` by `slug`. |
| `/press/photos` | `app/press/photos/page.tsx` | Shared press-photo library, grouped by category — not tied to one release. Same `PressNav`/`?site=1` chrome rule as above. Data in `lib/press.ts`'s `PRESS_PHOTOS`. |
| `POST /api/subscribe` | `app/api/subscribe/route.ts` | Validates the email, creates/enrolls the subscriber in Listmonk. Live in production — see below. |
| `POST /api/subscribe/language` | `app/api/subscribe/language/route.ts` | Moves a subscriber between the EN/ES Listmonk lists by UUID. See below. |

## Architecture

- **Home page** (`app/page.tsx` → `components/HomeClient.tsx`): the server component checks
  for the `pl_hero_seen` cookie and passes `heroSeen` into the client component, which decides
  whether to play the full hero entrance animation or skip straight to the settled state (and
  sets the cookie so repeat visits skip the intro). A "↻ REPLAY" control in the footer lets a
  visitor re-trigger the entrance via a `run` counter that re-mounts the animated pieces
  (`SiteNav`, `HeroLogo`, footer) with fresh `key`s.
- **Hero entrance choreography** lives in `lib/heroChoreography.ts`: per-letter scatter offsets
  and stagger delays for the 12-layer logo (`components/HeroLogo.tsx`, one absolutely-positioned
  PNG per letter in `public/logo/`), plus the delay constants that stagger the nav, tagline, and
  CTA fade-ins on top of it. The letters must stay PNG — each is transparent except for its own
  ink and they're alpha-stacked to spell the wordmark, so a format without alpha (JPEG) makes
  each layer blot out the ones underneath it; the single static `LOGO_3D.jpg` (shown to repeat
  visitors instead of the animated entrance, and reused for the OG image) doesn't have that
  problem and is JPEG. `HeroLogo` preloads every image it needs client-side before mounting any
  of it — on a slow connection that can take a moment, so it shows a `ProgressRing` in the logo's
  place rather than starting the entrance animation on images that haven't arrived. Below the
  860px breakpoint it preloads from a downsized `public/logo/mobile/` copy instead of the
  desktop originals.
- **Photo collage** (`components/PhotoCollage.tsx`): `lib/photoSets.ts` defines three sets of 8
  positioned photo placeholders that loop continuously and cross-fade on a 16s cycle, offset by a
  third of the cycle per set so the section is never empty.
- **Inner pages share `components/PageShell.tsx`**, which renders `SiteNav` + a titled content
  area + `Footer`. Content is composed from two presentational CSS-module "kits" rather than
  per-page components:
  - `components/RowList.module.css` — list rows (live dates, lyrics, contact).
  - `components/CardGrid.module.css` — card grids (releases, store, videos).

  These are imported directly as CSS modules (`import rows from "@/components/RowList.module.css"`)
  with no accompanying `.tsx` wrapper — pages assemble the markup inline using the shared class
  names.
- **Navigation** is data-driven from `lib/nav.ts` (`NAV_LINKS`), consumed by `SiteNav` (desktop
  links + a mobile slide-out drawer above 860px/below breakpoint). The desktop link row and the
  mobile burger button are both always in the DOM and switched with a CSS media query
  (`SiteNav.module.css`) rather than a JS `matchMedia` check — the latter defaults to desktop
  until React hydrates, which on a slow connection left the burger button (and thus any way to
  open the nav) simply not existing yet. The brand mark in both the desktop bar and the drawer
  header is `public/logo/logo-mini.png` — a tightly-trimmed crop of the existing `LOGO_PL_3D.png`
  "PL" monogram art (produced once with `sharp`'s `.trim()`, not regenerated at build time) — used
  on every page, homepage included; there's no separate text wordmark anymore.
  `components/PressNav.tsx` (see Press kits below) renders the same image for its own bar.
- **Mailing list**: `components/MailingListForm.tsx` posts `{ name, email, locale }` to
  `/api/subscribe`, which enrolls the subscriber in a self-hosted Listmonk instance
  (`https://list.plasticlover.mx`, live as of 2026-07-21) on the EN or ES list per `locale`. Falls
  back to `console.log` when the `LISTMONK_*` env vars aren't set (e.g. local dev, which doesn't
  have them in `.env.local`).
  - **Newsletter language switch**: since a Listmonk subscriber can't change their own list from
    inside the newsletter, campaign emails should link to
    `https://plasticlover.mx/subscribe/language?u={{ .Subscriber.UUID }}&id={{ .Subscriber.ID }}`
    (both are merge tags Listmonk exposes in every campaign template).
    `app/subscribe/language/page.tsx` renders a bilingual EN/ES chooser (not driven by site
    locale, since the whole point is picking the *other* language) via
    `components/LanguagePreferenceForm.tsx`, which posts `{ uuid, id, locale }` to
    `POST /api/subscribe/language`. That route fetches `GET /api/subscribers/:id`, requires the
    returned record's `uuid` to match the link's, and only then moves the subscriber between
    lists via two `PUT /api/subscribers/lists` calls (add target list confirmed, remove the
    other).
  - **Why the link carries both an id and a UUID.** The obvious design — look the subscriber up
    by UUID alone — needs `GET /api/subscribers?query=subscribers.uuid='...'`, and Listmonk
    rejects that `query` parameter with a 403 unless the API user holds `subscribers:sql_query`.
    That permission lets this public-facing key run arbitrary SQL expressions against the
    subscribers table, so it is deliberately **not** granted (see the API-user note below). The
    admin API otherwise addresses subscribers only by numeric id — UUIDs appear just on Listmonk's
    public `/subscription/:campUUID/:subUUID` routes — so the link carries both: the id does the
    lookup (only needs `subscribers:get`), and the unguessable UUID is what authorizes the change,
    since a sequential integer id on its own would let anyone iterate ids and flip other people's
    language. A mismatched pair and a nonexistent subscriber return the same 404 on purpose, so
    ids can't be probed — note Listmonk reports a missing subscriber id as **400**, not 404, so
    the route treats any non-403 4xx as not-found. A Listmonk-side failure returns 502 instead, kept distinct from 404
    because collapsing the two is what made an earlier permissions bug look like "subscriber not
    found" for weeks. Note `{{ .Subscriber.ID }}` is **not** in Listmonk's templating docs (that
    table lists a subset) — it works because `models.Subscriber` embeds `Base`, which carries the
    exported `ID int`, and Go templates promote embedded fields. Don't drop it from the link
    because the docs page doesn't mention it.
  - **The `subscribe-api` Listmonk user is intentionally minimal**: `subscribers:get` +
    `subscribers:manage`, plus view/manage on lists 4 (EN) and 5 (ES). Anything the site needs
    beyond that has to be designed around, not granted. `POST /api/tx` (the welcome email in
    `app/api/subscribe/route.ts`) is the one call that genuinely needs a permission outside that
    set — `tx:send` — so it has to stay granted for welcome emails to work at all. It used to fail
    silently: the signup still succeeded, `sendWelcomeEmail` logged and swallowed the error, and
    the form still told people to check an inbox nothing was sent to. Now `sendWelcomeEmail`
    returns whether the send actually happened, `POST /api/subscribe` passes it back as
    `welcomeEmail`, and `MailingListForm` falls back to the `joinedNoEmail` copy ("YOU'RE ON THE
    LIST", no inbox promise) whenever it's false — which also covers repeat signups (Listmonk 409)
    and local dev, neither of which sends anything.
  - **Preview deployments can't send welcome emails.** `LISTMONK_TX_TEMPLATE_ID_EN`/`_ES` are set
    on Vercel Production only; the list IDs and credentials exist on both. So a preview deploy
    exercises signup and the language switch fully, but `sendWelcomeEmail` returns false and the
    form shows the no-inbox copy. Verify welcome emails on production, or add the two template
    vars to Preview. Note Vercel marks all these vars *Sensitive*, which makes them write-only —
    `vercel env pull` yields `[SENSITIVE]`, so their values can't be read back from the CLI or
    dashboard, only overwritten.
- **Performance**: a Lighthouse audit (production build, standard mobile throttling — the same
  profile PageSpeed Insights uses) found Total Blocking Time is already ~0ms on every route
  tested — no long tasks, lean per-page JS, and the video modals (`ReleasePlayer`,
  `VideoCardPlayer`) already use a click-to-load facade instead of an eager YouTube iframe. The
  routes that scored low were being dragged down by LCP from oversized images, not JS execution;
  see the `next/image` note below for the fix applied on the press routes. `lib/releases.ts`'s
  `las-olas` `cover` still points at `raw.githubusercontent.com` (a ~1.6MB fetch from a
  non-CDN host, ~10s LCP on `/releases/las-olas`) — that's a deliberate, documented placeholder
  (see the comment at its definition) tied to the Aug 20 2026 release, not something to "fix" by
  swapping hosts before then.
- **Press kits** (`/press/[slug]`, `/press/photos`): `lib/press.ts` holds each release's
  `PressKit` (bio, quotes, credits, `heroImage`, `previewAudio`) joined to `lib/releases.ts` by
  `slug`, plus two band-level exports reused across every kit — `ARTIST_BIO` and `SOCIAL_LINKS`
  (the latter mirrors `components/Footer.tsx`; keep them in sync if those links change). Both
  press routes default to the minimal `PressNav` (logo + language selector, no other links)
  instead of the full site nav — these pages get shared directly with journalists as a flat
  one-pager, and the full `NAV_LINKS` list would just pull them into browsing the rest of the
  site. `?site=1` swaps in the regular `SiteNav`/`Footer` instead, for browsing the kit from
  within the site itself; `PressNav`'s `maxWidth` prop is set per page to match that page's own
  `<main>` width so the bar lines up with the content below it. Press photos are a separate,
  non-release-specific `PRESS_PHOTOS` array, each tagged with a
  `category` that `/press/photos` groups by. Real files live under `public/press/portraits/`
  and `public/press/las-olas/`; large originals get a `sips`-resized copy for on-page display
  (`downloadSrc` on the `PressPhoto` points at the full-res original for the actual press
  download). Those "web-sized" copies are still full-frame (1600×1200) even though the grid/hero/
  portrait slots that show them are 240–340px wide, so the photo grid, the kit's hero image, and
  its bio portrait all render through `next/image` (`fill` + a `sizes` matching that layout's
  actual column width, wrapped in a `position: relative` element carrying the aspect-ratio that
  used to live on the `<img>` itself) rather than a plain `<img>` — Next generates a properly
  sized/re-encoded asset instead of shipping the full original to a thumbnail slot. This is what
  fixed the LCP regression noted above. `components/AudioPlayer.tsx` is a small hand-rolled `<audio>` player (no library)
  for the stream section's preview track — browsers defer loading its metadata until the user
  presses play, so a `0:00` duration before that is expected, not a bug.

### Las Olas press kit — known placeholders

`lib/press.ts`'s `las-olas` `PressKit` ships with lorem ipsum for content nobody's supplied yet.
Replace before actually sending this to press:

- `bio.es` / `bio.en` (the release description)
- `quotes` (one placeholder quote/source)
- `credits` (`WRITTEN BY` / `PRODUCED BY`, currently "Lorem Ipsum")
- The four `PRESS_PHOTOS` entries with `category: "Las Olas"` still credit "Lorem Ipsum" — the
  seven `category: "Portrait"` photos are real (Photo: Pablo Barrera)

Also worth knowing: `lib/seo.ts`'s `SITE_URL` used to be `https://plasticlover.band`, which
doesn't resolve — fixed to `https://plasticlover.mx` (the real live domain) across
canonical/OG metadata and `app/contact/page.tsx`'s addresses. If any bundled skill reference
under `.claude/skills/` still says `.band` is canonical, that's stale — trust `.mx`.

## Working in this repo

This project runs Next.js 16, the current stable release on npm — not a fork or beta. Because
it's newer than most training data, APIs, conventions, and file structure may differ from what's
expected. Before writing code that touches routing, data fetching, config, or any other
framework API, read the matching guide under `node_modules/next/dist/docs/`.
