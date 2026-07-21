import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { RELEASES } from "@/lib/releases";
import { SONGS } from "@/lib/songs";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/live`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/releases`, changeFrequency: "weekly", priority: 0.9 },
    ...RELEASES.map((r) => ({
      url: `${SITE_URL}/releases/${r.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/lyrics`, changeFrequency: "monthly", priority: 0.7 },
    ...SONGS.map((s) => ({
      url: `${SITE_URL}/lyrics/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    { url: `${SITE_URL}/videos`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/subscribe`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
