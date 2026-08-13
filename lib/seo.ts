import type { Metadata } from "next";

export const SITE_URL = "https://plasticlover.mx";
export const SITE_NAME = "Plastic Lover";

// og:title/og:description are always Spanish regardless of viewer locale — see callers,
// which pass in getDictionary("es") copy rather than the page's own locale-aware dict.
export function buildOpenGraph({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    locale: "es_ES",
    type: "website",
  };
}

export function buildTwitter({
  title,
  description,
}: {
  title: string;
  description: string;
}): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
  };
}
