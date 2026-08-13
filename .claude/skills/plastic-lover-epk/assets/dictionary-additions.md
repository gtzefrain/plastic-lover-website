# Dictionary additions for the EPK page

`lib/i18n/dictionaries.ts` is one shared file with a single `Dictionary` type and one object
literal per locale — you're editing an existing file, not dropping in a new one. Three edits:

## 1. Add to the `Dictionary` type's `pages` block

```ts
press: {
  kicker: string;
  streamLabel: string;
  creditsLabel: string;
  photosLabel: string;
  downloadLabel: string;
  contactLabel: string;
  fallbackTitle: string;
  fallbackDescription: string;
  descriptionSuffix: string;
};
```

## 2. Add to the `en` locale object, inside `pages`

```ts
press: {
  kicker: "ELECTRONIC PRESS KIT",
  streamLabel: "STREAM",
  creditsLabel: "CREDITS",
  photosLabel: "PHOTOS",
  downloadLabel: "DOWNLOAD",
  contactLabel: "PRESS CONTACT",
  fallbackTitle: "Press Kit — Plastic Lover",
  fallbackDescription: "Electronic press kit for a Plastic Lover release.",
  descriptionSuffix: "Electronic press kit — bio, photos, and streaming links.",
},
```

## 3. Add to the `es` locale object, inside `pages`

```ts
press: {
  kicker: "KIT DE PRENSA ELECTRÓNICO",
  streamLabel: "ESCUCHAR",
  creditsLabel: "CRÉDITOS",
  photosLabel: "FOTOS",
  downloadLabel: "DESCARGAR",
  contactLabel: "CONTACTO DE PRENSA",
  fallbackTitle: "Kit de Prensa — Plastic Lover",
  fallbackDescription: "Kit de prensa electrónico de un lanzamiento de Plastic Lover.",
  descriptionSuffix: "Kit de prensa electrónico — bio, fotos y enlaces para escuchar.",
},
```

Keep the tone consistent with neighboring keys: short, mono-caps for UI labels, plain
sentence case for descriptions. Don't translate literally — match how the existing `es` block
phrases things (e.g. "ESCUCHAR" not "TRANSMITIR" for stream).
