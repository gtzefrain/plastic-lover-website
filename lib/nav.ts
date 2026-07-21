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
