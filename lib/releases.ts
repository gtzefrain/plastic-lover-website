export type ReleaseLink = {
  label: string;
  href: string;
};

export type Release = {
  slug: string;
  title: string;
  artist: string;
  meta: string;
  cover: string;
  embed: {
    provider: "youtube";
    videoId: string;
  };
  links: ReleaseLink[];
};

export const RELEASES: Release[] = [
  {
    slug: "detalles",
    title: "Detalles",
    artist: "Plastic Lover (feat. Sam Vazquez)",
    meta: "Single — 2023",
    cover: "https://v2.amp-cdn.net/images/links/488144328dea36e0d98206d7363827d0ead48552d60ea3",
    embed: {
      provider: "youtube",
      videoId: "iH14HLzseKU",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/3JMqmkCa4W1QkkBgfdYN1x" },
      {
        label: "Apple Music",
        href: "https://music.apple.com/us/album/detalles-feat-sam-vazquez-single/1681494200",
      },
      { label: "YouTube", href: "https://www.youtube.com/watch?v=iH14HLzseKU" },
      { label: "Amazon Music", href: "https://music.amazon.com/albums/B0C1XVB3PR" },
      { label: "Deezer", href: "https://www.deezer.com/album/427703387" },
      { label: "Bandcamp", href: "https://myplasticlover.bandcamp.com/track/detalles-ft-sam-vazquez" },
    ],
  },
];

export function getReleaseBySlug(slug: string): Release | undefined {
  return RELEASES.find((r) => r.slug === slug);
}
