# plasticlover.band — site conventions

Repo: https://github.com/gtzefrain/plastic-lover-website.git
Live site: https://plasticlover.band (canonical — `lib/seo.ts`'s `SITE_URL`, used for all
og:url/canonical metadata). `https://plasticlover.mx` is also live and serves the same
deployment — use `.band` for links you generate (press kits, emails) to match the site's own
metadata, but don't be surprised to see `.mx` in the wild (socials, older material).
Stack: Next.js 16 (App Router), React 19, TypeScript, CSS Modules — no UI/animation
libraries. Deployed on Vercel (auto-deploys on push to `main`). Bilingual: Spanish is the
default locale, English is secondary (`lib/i18n`).

Clone fresh at the start of every EPK job (`git clone --depth 1 <repo>`) rather than reusing
a stale checkout — don't assume yesterday's file contents are still accurate.

## Design tokens (`app/globals.css`)

```css
--pl-bg: #ffffff;
--pl-primary: #c60c2c;           /* the brand red — text, links, accents */
--pl-primary-hover: #8f0820;
--pl-button-hover: #e8283f;
--pl-button-text: #fff3f4;
--pl-placeholder: #ffecef;
--pl-shadow-button: 0 12px 28px rgba(198, 12, 44, 0.32);
--pl-shadow-frame: 0 18px 44px rgba(198, 12, 44, 0.16);
--pl-font-display: "Helvetica Neue", Helvetica, sans-serif;   /* headlines, body */
--pl-font-mono: "SF Mono", Menlo, monospace;                  /* eyebrow labels, links, meta */
--pl-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

Voice/visual identity: white background, one saturated red, generous whitespace, mono-caps
letterspaced labels ("KICKER" style) contrasted against normal-case display type. Playful but
not cluttered — no gradients, no drop shadows beyond the two defined above, no icons besides
`react-icons/fa6` where the site already uses one (play button, close ×).

## Bilingual content

- `lib/i18n/dictionaries.ts` — one `Dictionary` type, one object per locale (`en`, `es`).
  `defaultLocale = "es"`. Every page pulls copy from `getDictionary(locale).pages.<page>`,
  never hardcoded strings.
- `lib/i18n/locale.ts` — `getServerLocale()` reads the `pl_locale` cookie server-side.
- New page copy needs a new key added to **both** locale blocks in `dictionaries.ts` (search
  for the closing `es: {` — don't add the English copy only). Match the existing tone: short,
  imperative, occasionally warm ("LEEMOS CADA SOLICITUD" / "WE READ EVERY REQUEST"), never
  corporate.
- `og:title`/`og:description` are always passed as Spanish copy regardless of the viewer's
  locale (see `releases/[slug]/page.tsx generateMetadata` — it builds `ogDescription` from
  `getDictionary("es")` even when the page itself renders in `en`). Follow that pattern for
  any new route's `generateMetadata`.

## SEO helper (`lib/seo.ts`)

`buildOpenGraph({ title, description, path })` and `buildTwitter({ title, description })` —
always use these rather than hand-rolling `openGraph`/`twitter` metadata objects.
`SITE_URL = "https://plasticlover.band"`, `SITE_NAME = "Plastic Lover"`.

## Route patterns — pick the right one

Two different page shapes exist; **the EPK route follows the standalone pattern**, not
`PageShell`:

1. **`PageShell`-wrapped inner pages** (`live`, `lyrics`, `videos`, `store`, `contact`) — nav +
   kicker + content + footer, composed from `components/PageShell.tsx`. Content itself is
   built from two headless CSS-module "kits" imported directly with no `.tsx` wrapper:
   - `components/RowList.module.css` — list rows (`.rowLyrics`, `.rowLive`, `.rowContact`
     grid-template variants already exist; add a new modifier class rather than repurposing
     one of these if the shape doesn't fit).
   - `components/CardGrid.module.css` — card grids (`.thumbSquare`/`.thumbWide` render a
     diagonal-stripe brand-red placeholder via CSS `repeating-linear-gradient` when there's no
     image yet — reuse this for photos that haven't been supplied instead of a gray box or
     broken `<img>`).
2. **Standalone single-release pages** (`app/releases/[slug]/page.tsx`) — own full-bleed
   layout, no `SiteNav`/`Footer` unless the URL has `?site=1` (used when the page is opened
   from inside the main site rather than shared as a bare link). `generateStaticParams()`
   pre-renders one static page per entry in the underlying data array. **The EPK page should
   copy this pattern** — a press contact opening a bare link shouldn't be dropped into full
   site chrome by default.

## Existing release data (`lib/releases.ts`)

```ts
export type ReleaseLink = { label: string; href: string };
export type Release = {
  slug: string;
  title: string;
  artist: string;
  meta: string;               // e.g. "Single — 2024" or "EP — 2025"
  cover: string;               // external CDN URL (Spotify/Deezer cover art), not /public
  embed?: { provider: "youtube"; videoId: string };
  links: ReleaseLink[];        // streaming service links, order = display order
  collaboration?: boolean;
};
export const RELEASES: Release[];
export function getReleaseBySlug(slug: string): Release | undefined;
```

A brand-new single that hasn't been added to `RELEASES` yet has no streaming links and no
cover art in the codebase — get those from the user (or from the DSP pages directly) and add
a `Release` entry as part of the EPK job if one doesn't already exist. **The press kit's
`slug` should match the `Release.slug` it's paired with** so the two can be joined instead of
duplicating title/artist/cover/links.

## Contact addresses

`press@plasticlover.band`, `booking@plasticlover.band`, `mgmt@plasticlover.band` — defined in
`app/contact/page.tsx`. That page currently opens with `notFound();` as its first line (it's
disabled while contact info gets finalized) but the addresses themselves are the real,
intended ones — use `press@plasticlover.band` as the EPK's default press contact unless told
otherwise.

## Mailing list / subscriber data

`components/MailingListForm.tsx` collects `{ name, email, locale }` and posts to
`app/api/subscribe/route.ts`, which is meant to forward to a self-hosted Listmonk instance —
**Listmonk is not deployed yet**, so the route currently just validates and `console.log`s.
**There is no live, exportable subscriber list to pull from.** Always get the recipient list
for an outreach send directly from the user (pasted, or an uploaded CSV/spreadsheet) rather
than assuming one can be fetched from the site.

## Images

`public/` currently only holds the logo assets below — **there are no real press/band photos
in the repo**. `lib/photoSets.ts` references paths like `/photos/live-melt-tour.jpg` for the
homepage's looping photo collage, but those files don't exist on disk — they're placeholders.
Don't treat anything under `/photos/` as real; always ask the user for actual press photo
files (or a Drive/Dropbox link) rather than assuming stock images are available.

- `public/logo/LOGO_2D.png` — clean flat logo mark, safest default for a press-kit header or
  email signature.
- `public/logo/LOGO_3D.jpg`, `LOGO_PL_3D.png` — glossier variants.
- `public/logo/{P,L,a,S,t,i,c,L,o,v,e,R,l1}.png` (plus downsized copies under
  `public/logo/mobile/`) — individual hand-drawn letters used only by the animated homepage
  wordmark (`components/HeroLogo.tsx`); not general-purpose assets. Must stay PNG — each is
  transparent except for that one letter's ink and they're alpha-stacked to spell the wordmark.

New press photos for a release should live at `public/press/<slug>/`.

## Accessibility conventions (preserve these — don't regress)

- Exactly one `<h1>` and one `<main id="main-content">` per page.
- Real `<label>` elements for form inputs (`.visually-hidden` class if visually redundant with
  a placeholder) — never rely on placeholder text alone.
- Status messages after an async action use `role="status"`.
- Lists render as `<ul>/<li>`, not `<div>` soup (the global `ul, ol` reset in `globals.css`
  keeps them unstyled).
- Any new modal/overlay follows the `ReleasePlayer`/mobile-nav-drawer pattern: `role="dialog"`,
  `aria-modal="true"`, focus moves to the close control on open and back to the trigger on
  close, `Escape` closes it.

## Before handing work back

Run `npm run lint` and `npm run build` from the repo root — the build's static generation
(`generateStaticParams`) will catch a missing/misspelled slug reference immediately.
