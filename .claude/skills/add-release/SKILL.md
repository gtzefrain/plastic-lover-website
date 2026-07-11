---
name: add-release
description: Add a new /releases/[slug] streaming landing page for the Plastic Lover site from structured release data (title, artist, meta, cover image, YouTube video, streaming links). Use when asked to add/create/wire up a release, single, or EP landing page.
---

# Add a release page

Adds one entry to the data-driven `/releases/[slug]` route — no new route file is
needed, since `app/releases/[slug]/page.tsx` already renders any entry found in
`lib/releases.ts`.

The page is intentionally minimal: a small cover-art square (188px on mobile, 240px at
≥641px) with a play icon on a red circular background (`components/ReleasePlayer.tsx`).
Clicking it opens a full-screen modal (dark backdrop, portaled to `document.body` so it
escapes the page's transformed ancestors) with a 16:9 YouTube embed that autoplays —
nothing loads until the icon is clicked. Below that: the title/meta, then a bordered
table of streaming links (row = label + `→`, no pill buttons).

## Required input

Ask for whatever is missing before proceeding:

- `title` — release title (required)
- `artist` — defaults to `"Plastic Lover"` if not given
- `meta` — e.g. `"Single — 2026"`, `"EP — 2026"` (required)
- `cover` — cover art image URL (required)
- `embed` — a YouTube video URL or ID for the official video/visualizer (required).
  Extract just the video ID (the `v=` param, or the path segment after `youtu.be/`).
- `links` — list of `{ label, href }` streaming links, at least one (Spotify, Apple
  Music, YouTube, Amazon Music, Deezer, Bandcamp, etc.)

Do not fetch external URLs to derive this data — the caller supplies it directly.

## Steps

1. **Derive a slug** from `title`: lowercase, kebab-case, strip punctuation (e.g.
   "Melting Point" → `melting-point`). Check `lib/releases.ts` for a collision; if the
   slug already exists, confirm with the user whether to overwrite or pick a new slug.
2. **Append to `lib/releases.ts`**: add a new object to the `RELEASES` array matching
   the existing `Release` shape (`slug`, `title`, `artist`, `meta`, `cover`,
   `embed: { provider: "youtube", videoId }`, `links`).
3. **Append to `app/releases/page.tsx`**: add a matching `{ slug, title, meta }` entry
   to that page's local `RELEASES` array so the index card and its STREAM button show
   up automatically — the button's `href` already resolves via `getReleaseBySlug`, no
   other edit needed there.
4. **Do not touch** `SiteNav`, `Footer`, `PageShell`, `components/ReleasePlayer.tsx`, or
   the `[slug]/page.tsx` / `page.module.css` files — release pages are intentionally
   standalone (no site header/footer, no wordmark), and the route template + player are
   generic.
5. **Verify**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - Start the dev server, `curl -s -o /dev/null -w '%{http_code}' localhost:3000/releases/<slug>`
     and confirm `200`, then stop the server.
6. Report the new route path back to the user.
