import type { Metadata } from "next";
import type { Locale } from "./i18n/dictionaries";

export const SITE_URL = "https://plasticlover.band";
export const SITE_NAME = "Plastic Lover";

function ogLocale(locale: Locale): string {
  return locale === "es" ? "es_ES" : "en_US";
}

export function buildOpenGraph({
  title,
  description,
  path,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
}): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    locale: ogLocale(locale),
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
