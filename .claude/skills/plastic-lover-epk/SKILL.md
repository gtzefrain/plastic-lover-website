---
name: plastic-lover-epk
description: Build an Electronic Press Kit (EPK) page on the plasticlover.band Next.js site for a Plastic Lover single/EP release, and draft personalized outreach emails (via Gmail) to a press/media contact list linking to it. Use this whenever the user mentions a new Plastic Lover single or release, an EPK, a press kit, press outreach, or wants to email press/blog/playlist contacts about a release — even if they just say "let's get press going for the new single" or "send out the kit for X." Also use it to update an existing press kit (new photos, a fixed bio, added credits) even if no email is being sent.
---

# Plastic Lover — Electronic Press Kit & Outreach

Two-part workflow, usually run together but each useful on its own:

1. **Press kit page** — a new `/press/<slug>` page on plasticlover.band with bio, streaming
   links, credits, quotes, and downloadable hi-res photos.
2. **Outreach email** — one personalized Gmail draft per contact on a press list, linking to
   the kit. Drafts only, never auto-sent (see "Sending emails" below — this isn't a workaround,
   it's the right level of caution for anything reaching real press contacts in bulk).

Read `references/site-conventions.md` before touching any code — it has the design tokens,
file conventions, and exact data shapes this workflow depends on. Don't skip it even if the
task seems small; the site has specific patterns (bilingual dictionaries, a particular route
style for shareable links, existing kits for lists/cards) that are easy to almost-match and
then subtly break.

## Step 1 — Clone fresh and get the single's press content

Clone `https://github.com/gtzefrain/plastic-lover-website.git` at the start of the job — don't
reuse an old checkout. Then check what the user already gave you before asking for the rest:

- **Slug/title** — must match (or be added to) `lib/releases.ts`. If this is a brand-new
  single not yet in `RELEASES`, you'll need streaming links and cover art too; ask for those
  or pull them from the DSP pages the user shares.
- **Not out yet?** The site sometimes runs a presave teaser ahead of a release (see the
  `/las-olas` pattern in site-conventions.md — a `noindex` page with a presave link). It's
  fine to build the press kit ahead of the release date using whatever presave link exists in
  place of the final streaming links — just flag clearly to the user that the `links` array is
  presave-only and needs a follow-up pass once the single actually drops with real per-DSP
  links. Confirm the actual release date with the user rather than trusting a date that might
  be stale in existing teaser copy.
- **Bio** — 2–3 sentences, ideally in Spanish (the site's default locale) with an English
  version too. **Don't invent biographical details, review quotes, or credits.** If the user
  hasn't supplied something, leave an explicit `[PLACEHOLDER]` marker rather than making up
  plausible-sounding copy — a fabricated quote attributed to a real publication is a much
  worse failure mode than an empty section.
- **Press photos** — actual files or a link to them. There's nothing to reuse from the repo;
  `public/` has no real band photos yet (see site-conventions.md). If none are supplied yet,
  ship the page with an empty photo section — it renders cleanly either way (see
  `assets/press-page-template.tsx`, the `kit.photos.length > 0` guard).
- **Quotes / credits** — optional, same rule: real or omitted, never invented.
- **Press contact email** — defaults to `press@plasticlover.band` unless told otherwise.

If most of this is missing, it's fine to build the page with placeholders for everything
except the parts you do have (title, links, cover) — that gives the user something concrete to
react to and fill in, rather than blocking on a long back-and-forth first.

## Step 2 — Build the page

1. Copy `assets/press-data-template.ts` → `lib/press.ts` (or add an entry to it if it already
   exists) and fill in the real content from Step 1.
2. Add the `pages.press` dictionary block to `lib/i18n/dictionaries.ts` — the exact type
   addition and both locale objects are spelled out in `assets/dictionary-additions.md`. This
   is a shared file; you're adding a key in three places (the type, the `en` object, the `es`
   object), not creating a new file.
3. Copy `assets/press-page-template.tsx` → `app/press/[slug]/page.tsx` and
   `assets/press-page-template.module.css` → `app/press/[slug]/page.module.css`. These were
   validated against a real build of this repo (paired with `lib/releases.ts`'s existing
   `"cuadrado"` entry) — `npm run build` compiles, type-checks, and statically generates the
   route cleanly, and the rendered HTML was spot-checked in both locales. Treat them as
   known-good; adapt content, not structure, unless the site's own patterns have changed.
4. Real photo files go under `public/press/<slug>/`.
5. Run `npm run lint` and `npm run build` before handing anything back. If `next build` fails
   trying to fetch an external cover-art image for `opengraph-image.tsx` — that's a sandbox
   network restriction on image CDNs, not a real bug; don't chase it if it's on a route you
   didn't touch. Confirm your own route compiles and appears in the build's route list.

The finished page is live at `https://plasticlover.band/press/<slug>` once deployed (Vercel
auto-deploys `main`). Hand the user the new/changed files (or a diff) — don't assume you have
push access to actually merge them.

## Step 3 — Draft the outreach emails

1. **Get the recipient list.** There's no live subscriber export to pull from — Listmonk isn't
   deployed yet (see site-conventions.md). The real list is a Google Sheet called "Medios"
   with columns `Nombre`, `Correo`, `Pronombre` (`singular`/`plural`), `Idioma` (`es`/`en`) —
   ask for the current sheet link rather than assuming an old copy is still accurate, since
   press contacts change. `Nombre` is often an outlet/show name, not a person's first name —
   use it verbatim rather than trying to extract a first name from it.
2. **Base the copy on `assets/email-template.md`.** This isn't a generic press-outreach
   template — it's built from a real email the band already sent (screenshot on file: Oct 3,
   "Sed (De Ti)," to IndieRocks), so match that voice exactly rather than "improving" it into
   something more polished. Warm, brief, exclusive-access framing ("wanted to share this
   before anyone else"), signs off as **Plastic Lover**, not a person's name.
3. **Personalize by `Pronombre`, not just name.** `plural` contacts get the "¡Hola amigos de
   {{Nombre}}!" treatment (group address, "ustedes" conjugation) exactly like the real
   example; `singular` contacts are one person, addressed directly with "tú" conjugation.
   Singular contacts also need gender-correct Spanish adjectives if any are used — infer from
   the first name when it's unambiguous, and **tell the user which contacts got an inferred
   gender** so they can correct anything wrong rather than that going out silently. Full rules
   and both language variants are in `assets/email-template.md`.
4. **Show one plural example and one singular example** (real recipients, not placeholders)
   before generating the full batch, since this is a voice-match job against a real prior
   email and worth a quick check before it goes out to the whole list.
5. Sender account is `myplasticlover@gmail.com` — confirm this is still the right account
   before drafting if it's been a while since the user last mentioned it.

### Sending emails

Use the Gmail connector's `create_draft` tool, once per recipient. If it's not connected yet,
that's a case for `suggest_connectors`, not for falling back to some other channel — the user
specifically wants Gmail drafts from `myplasticlover@gmail.com`. This connector doesn't expose
a send tool, which lines up well with how this should work anyway: one draft per recipient is
not something to send without a human looking at it first (typos in a merge field, a wrong
link, a recipient list that wasn't as clean as it looked, a misgendered greeting). After
drafting, tell the user how many drafts were created and that they're sitting in the Gmail
Drafts folder for review — never say or imply that anything was actually sent.

## Notes

- The site is bilingual (`es` default) — keep press-kit content in both languages where
  possible, matching every other page.
- Don't fabricate biographical facts, review quotes, or credits. This applies to the page copy
  and the email copy equally.
- If the user wants a browsable `/press` index (not just direct links to individual kits),
  mirror `app/releases/page.tsx` + `components/CardGrid.module.css` — not covered by the
  bundled templates here since kits are normally shared as direct links, not browsed.
