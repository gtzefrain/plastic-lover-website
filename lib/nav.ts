import type { NavKey } from "./i18n/dictionaries";

export type NavLink = {
  key: NavKey;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { key: "live", href: "/live" },
  { key: "releases", href: "/releases" },
  { key: "videos", href: "/videos" },
  { key: "lyrics", href: "/lyrics" },
];

/**
 * A nav link is "active" on its own page *and* on anything nested under it, so
 * `/releases/las-olas` and `/lyrics/las-olas` still light up Releases / Lyrics.
 * The exact page keeps `aria-current="page"`; an ancestor section gets
 * `aria-current="true"`, which is the correct value for "in the current path
 * but not the page itself" — both get the same highlight styling.
 */
export function navLinkCurrent(pathname: string | null, href: string): "page" | "true" | undefined {
  if (!pathname) return undefined;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === href) return "page";
  return path.startsWith(`${href}/`) ? "true" : undefined;
}
