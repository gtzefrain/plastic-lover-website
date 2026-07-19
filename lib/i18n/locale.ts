import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./dictionaries";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerList = await headers();
  return parseAcceptLanguage(headerList.get("accept-language"));
}

function parseAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const preferred = acceptLanguage
    .split(",")[0]
    ?.split(";")[0]
    ?.split("-")[0]
    ?.trim()
    .toLowerCase();

  return preferred === "en" ? "en" : defaultLocale;
}
