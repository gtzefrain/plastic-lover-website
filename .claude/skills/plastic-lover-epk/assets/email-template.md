# Outreach email template

Sent from `myplasticlover@gmail.com` via the Gmail connector's `create_draft` tool — one draft
per recipient, never auto-sent (see SKILL.md, "Sending emails").

## Source of truth for tone

The band has sent these before. A real example (Oct 3, "Sed (De Ti)" release, to IndieRocks):

> ¡Hola amigos de Indie Rocks!
>
> Espero que estén muy bien.
>
> Estaré sacando un nuevo sencillo este próximo 10 de Octubre llamado **Sed (De Ti)**; y se
> los quería compartir antes que a nadie.
>
> Les adjunto el press kit del lanzamiento, mi EPK de artista y fotos de prensa.
>
> ¡Espero sea de su agrado!
> Un abrazo,
> Plastic Lover

Match this exactly in register: warm, brief, a little informal ("se los quería compartir antes
que a nadie" — the hook is early/exclusive access, not a hard sell), signs off as **Plastic
Lover** (the project, not a person's name), "Un abrazo" not "Saludos" or "Atentamente". Don't
upgrade this into something more polished or corporate — the informality is the brand voice,
not a gap to fix. Subject line follows the same pattern: `Nuevo Release: {{release_title}}`.

The one change from that example: it attached files directly. Since the EPK now lives at
`https://plasticlover.band/press/<slug>`, link to it instead of attaching — same sentence
shape, swap "adjunto" (I attach) for "comparto" (I'm sharing) and the file names for the link.

## Recipient sheet schema

The recipient list is a Google Sheet ("Medios") with these columns — always ask for the
current sheet rather than assuming this one's contents are still current:

| Column | Meaning |
| --- | --- |
| `Nombre` | The contact's name **as it should appear in the greeting** — often an outlet or show name ("IndieRocks", "Radio Modulada"), sometimes a person ("Nicolas Chapa"). Use it verbatim; don't try to extract a "first name" out of an outlet name. |
| `Correo` | Email address. |
| `Pronombre` | `plural` or `singular` — whether to address them as a group ("ustedes") or a single person ("tú"). This is what the real example's "amigos de Indie Rocks" (plural) reflects. Rows with no value: default to `plural`, the safer/more common case in this list. |
| `Idioma` | `es` or `en`. Use the matching template variant below. |

## Personalization rules

- **`plural`** → greet exactly like the real example: `¡Hola amigos de {{Nombre}}!`, and
  conjugate the rest for "ustedes" (`espero que estén`, `les comparto`, `espero sea de su
  agrado`) — copy the reference email's verb forms.
- **`singular`** → this is one person, not a team, so drop "amigos de" and greet them directly:
  `¡Hola {{Nombre}}!`, conjugated for "tú" (`espero que estés bien`, `te comparto`, `espero te
  guste`).
- **Gender agreement for `singular` contacts**: Spanish adjectives addressing one person need
  to agree in gender (e.g. "querido" vs "querida", if you use a word like that anywhere).
  The sheet doesn't have a gender column, so infer it from the first name when it's a common,
  unambiguous one (e.g. "Nicolas" → masculine) and **say explicitly in your reply to the user
  which contacts you inferred a gender for**, so they can correct any that are wrong — don't
  silently guess on a name that could go either way. When genuinely unclear, or when `Nombre`
  is a project/outlet name rather than a person even though marked `singular`, stick to
  gender-neutral phrasing (the template as written below doesn't actually require a gendered
  adjective at all — only add one, like "querido/a," if it fits naturally, and only when you're
  confident of the gender).
- Never invent a name if `Nombre` is blank — skip the greeting line entirely rather than
  writing "Hi there."

## Template — Spanish (`Idioma` = es)

**Subject:** Nuevo Release: {{release_title}}

**Plural:**
```
¡Hola amigos de {{Nombre}}!

Espero que estén muy bien.

Estaré sacando un nuevo sencillo este próximo {{release_date}} llamado {{release_title}}; y
se los quería compartir antes que a nadie.

Les comparto el press kit del lanzamiento — bio, fotos en alta resolución y enlaces para
escuchar: {{press_kit_url}}

¡Espero sea de su agrado!
Un abrazo,
Plastic Lover
```

**Singular:**
```
¡Hola {{Nombre}}!

Espero que estés muy bien.

Estaré sacando un nuevo sencillo este próximo {{release_date}} llamado {{release_title}}; y
te lo quería compartir antes que a nadie.

Te comparto el press kit del lanzamiento — bio, fotos en alta resolución y enlaces para
escuchar: {{press_kit_url}}

¡Espero te guste!
Un abrazo,
Plastic Lover
```

## Template — English (`Idioma` = en)

No real historical example to mirror here, so this is adapted from the Spanish version, same
length and warmth, not a literal translation:

**Subject:** New release: {{release_title}}

**Plural:**
```
Hi {{Nombre}},

Hope you're all doing well.

I'm putting out a new single on {{release_date}} called {{release_title}}, and wanted to
share it with you before anyone else.

Here's the press kit — bio, high-res photos, and streaming links: {{press_kit_url}}

Hope you like it!
Plastic Lover
```

**Singular:**
```
Hi {{Nombre}},

Hope you're doing well.

I'm putting out a new single on {{release_date}} called {{release_title}}, and wanted to
share it with you before anyone else.

Here's the press kit — bio, high-res photos, and streaming links: {{press_kit_url}}

Hope you like it!
Plastic Lover
```

## Merge fields

| Field | Source |
| --- | --- |
| `{{Nombre}}` | Recipient sheet, column `Nombre` |
| `{{release_title}}` | The release's `title` from `lib/releases.ts` |
| `{{release_date}}` | The release date, in the recipient's language ("10 de Octubre" / "October 10") |
| `{{press_kit_url}}` | `https://plasticlover.band/press/<slug>` |

## Before drafting, show a sample

Draft one plural example and one singular example (real recipients from the sheet, not
placeholders) and show both to the user before generating the full batch — this is a voice
match against a real prior email, worth a quick sanity check before it's applied to the whole
list.
