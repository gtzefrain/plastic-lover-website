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
  embed?: {
    provider: "youtube";
    videoId: string;
  };
  links: ReleaseLink[];
  collaboration?: boolean;
};

export const RELEASES: Release[] = [
  {
    slug: "las-olas",
    title: "Las Olas",
    artist: "Plastic Lover",
    // Out now — released August 20, 2026 (Deezer stamps it 2026-08-21 UTC).
    meta: "Single — 2026",
    // Spotify's CDN cover, same source as the other released singles. (Before release this
    // pointed at GitHub's raw content CDN for public/press/las-olas/cover-web.jpg, because
    // opengraph-image.tsx / twitter-image.tsx `fetch()` this URL directly during the build and
    // a plasticlover.mx self-reference 404s in the very build that adds the file. Any absolute
    // URL that already exists works; the DSP CDN is the stable one now that the single is up.)
    cover: "https://i.scdn.co/image/ab67616d0000b2735a48ec76ad23a3790b5cb653",
    embed: {
      provider: "youtube",
      videoId: "M33BJUQeDCM",
    },
    links: [
      // Real per-DSP links, replacing the old ditto.fm presave callback URL.
      // Apple Music hadn't indexed the single yet on release day (2026-08-20) — add it here
      // once it does.
      { label: "Spotify", href: "https://open.spotify.com/album/3CsrhRC81pZMACzEzsVDVV" },
      // Two separate YouTube destinations on purpose: the visualizer on the band's own channel
      // (same video as `embed` above), and the auto-generated "Plastic Lover - Topic" track that
      // the older releases link to as YouTube Music.
      { label: "YouTube", href: "https://www.youtube.com/watch?v=M33BJUQeDCM" },
      {
        label: "YouTube Music",
        href: "https://music.youtube.com/watch?v=-jGgpAOT_n8&list=OLAK5uy_lyuWY6WGj8-Kyc00-7TvY7RiTDrIDZmIc",
      },
      { label: "Deezer", href: "https://www.deezer.com/album/1024193601" },
      // Bare tidal.com (not listen.tidal.com like the older entries) — it serves the album page
      // directly with no redirect, and it's the form Tidal hands out when you share now.
      { label: "Tidal", href: "https://tidal.com/album/541320226" },
      // `fi-en`, not the `us-en` locale the older entries use: the US store 404s on this album
      // (it isn't in that region's catalog yet), while the Finnish/English one serves it.
      {
        label: "Qobuz",
        href: "https://www.qobuz.com/fi-en/album/las-olas-plastic-lover/fx62fnmaj8nas",
      },
    ],
  },
  {
    slug: "cuadrado",
    title: "Cuadrado",
    artist: "Plastic Lover",
    meta: "EP — 2025",
    cover: "https://cdn-images.dzcdn.net/images/cover/bf5950d8877af2e214617276c536ffe7/1000x1000-000000-80-0-0.jpg",
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/7aAk3hKP2ZDMcmEgABN4hm" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/cuadrado-ep/1799991613" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=UFiNPzDfU98" },
      { label: "Deezer", href: "https://www.deezer.com/album/721604911" },
      { label: "Tidal", href: "https://listen.tidal.com/album/421587292" },
      { label: "Qobuz", href: "https://www.qobuz.com/us-en/album/cuadrado-plastic-lover/b6328jv47vlcc" },
    ],
  },
  {
    slug: "sed-de-ti",
    title: "Sed (De Ti)",
    artist: "Plastic Lover",
    meta: "Single — 2024",
    cover: "https://i.scdn.co/image/ab67616d0000b27397e86cedad16e285029d82fb",
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/47iDXBMP9CLeVV0wRdvU8w" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/sed-de-ti-single/1767852113" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=IZtbd2Rg1u8" },
      { label: "Deezer", href: "https://www.deezer.com/album/641124511" },
      { label: "Tidal", href: "https://listen.tidal.com/album/386248216" },
      { label: "Qobuz", href: "https://www.qobuz.com/us-en/album/sed-de-ti-plastic-lover/cm7qaa70e7r0b" },
    ],
  },
  {
    slug: "oh-no",
    title: "Oh No",
    artist: "Plastic Lover",
    meta: "Single — 2024",
    cover: "https://cdn-images.dzcdn.net/images/cover/ad41c2e2cd714bfa212c0b41456496de/1000x1000-000000-80-0-0.jpg",
    embed: {
      provider: "youtube",
      videoId: "JAaX3cD2IRc",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/track/36chlxGh2B0EL830lUhdU3" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/oh-no-single/1740619132" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=dsVI5YnxPbI" },
      { label: "Deezer", href: "https://www.deezer.com/album/572404591" },
      { label: "Tidal", href: "https://listen.tidal.com/track/357350057" },
      { label: "Qobuz", href: "https://www.qobuz.com/us-en/album/oh-no-plastic-lover/gnsevu8zstm9b" },
    ],
  },
  {
    slug: "vision",
    title: "Visión",
    artist: "Plastic Lover",
    meta: "Single — 2024",
    cover: "https://i.scdn.co/image/ab67616d0000b27354f6411b40f84bfd2f91c844",
    embed: {
      provider: "youtube",
      videoId: "1FgRCnTdwIo",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/5i1wIHqheG0fteIrr93iBj" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/visi%C3%B3n-single/1727877112" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=7sErCbbBoZI" },
      { label: "Bandcamp", href: "https://myplasticlover.bandcamp.com/track/visi-n" },
      { label: "Deezer", href: "https://www.deezer.com/album/539248872" },
      { label: "Qobuz", href: "https://www.qobuz.com/us-en/album/vision-plastic-lover/efsuzljys69rb" },
    ],
  },
  {
    slug: "circulo",
    title: "Círculo",
    artist: "Plastic Lover",
    meta: "EP — 2023",
    cover: "https://cdn-images.dzcdn.net/images/cover/906aab1b8b531e7f91d74c94463b5a86/1000x1000-000000-80-0-0.jpg",
    embed: {
      provider: "youtube",
      videoId: "k_YpRK0QT1w",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/2fdAVHyntUCFZT4aaVZc3C" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/c%C3%ADrculo-ep/1691543790" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=vSzVXdB7lUg" },
      { label: "Bandcamp", href: "https://myplasticlover.bandcamp.com/album/c-rculo" },
      { label: "Deezer", href: "https://www.deezer.com/album/450640445" },
      { label: "Tidal", href: "https://listen.tidal.com/album/298794893" },
      { label: "Qobuz", href: "https://www.qobuz.com/us-en/album/circulo-plastic-lover/o7legk9tpqgpc" },
    ],
  },
  {
    slug: "ultramar",
    title: "Ultramar",
    artist: "Plastic Lover",
    meta: "Single — 2023",
    cover: "https://i.scdn.co/image/ab67616d0000b273f551bf4a0798809a5bf49f9a",
    embed: {
      provider: "youtube",
      videoId: "6cqLtl2ULac",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/2fdAVHyntUCFZT4aaVZc3C" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/ultramar-single/1691400279" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=b9dWmPrHvDI" },
      { label: "Bandcamp", href: "https://myplasticlover.bandcamp.com/track/ultramar" },
      { label: "Deezer", href: "https://www.deezer.com/album/450311065" },
      { label: "Tidal", href: "https://listen.tidal.com/album/298666431" },
      { label: "Qobuz", href: "https://www.qobuz.com/us-en/album/ultramar-plastic-lover/hxds1us313rzb" },
    ],
  },
  {
    slug: "como-tu",
    title: "Como Tú",
    artist: "Plastic Lover",
    meta: "Single — 2023",
    cover: "https://i.scdn.co/image/ab67616d0000b2734095ae1d02f09a43663894ca",
    embed: {
      provider: "youtube",
      videoId: "cIzuD1r4vIQ",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/0czp2tpqHe3i5un6QIe9i1" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/como-t%C3%BA-single/1682118015" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=5EnUFKKR1cU" },
      { label: "Bandcamp", href: "https://myplasticlover.bandcamp.com/track/como-t" },
      { label: "Deezer", href: "https://www.deezer.com/album/429101397" },
      { label: "Tidal", href: "https://listen.tidal.com/album/288821927" },
      { label: "Qobuz", href: "https://www.qobuz.com/us-en/album/como-tu-plastic-lover/umy55ftca3f7b" },
    ],
  },
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
      { label: "Amazon Music", href: "https://music.amazon.com/albums/B0C1XVB3PR" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=OyNpnWqqWhg" },
      { label: "Bandcamp", href: "https://myplasticlover.bandcamp.com/track/detalles-ft-sam-vazquez" },
      { label: "Deezer", href: "https://www.deezer.com/album/427703387" },
      {
        label: "Qobuz",
        href: "https://www.qobuz.com/us-en/album/detalles-plastic-lover-amp-sam-vazquez/dbtlq0s5u33wc",
      },
    ],
  },
  {
    slug: "sueno-en-stereo",
    title: "Sueño en Stereo",
    artist: "Plastic Lover",
    meta: "EP — 2020",
    cover: "https://i.scdn.co/image/ab67616d0000b27364846ea826151f945b395c9f",
    links: [
      { label: "Spotify", href: "https://open.spotify.com/album/7MyUzp6kZBDmQWhgz4g7kC" },
      { label: "Apple Music", href: "https://music.apple.com/mx/album/sue%C3%B1o-en-stereo-ep/1679817796" },
      { label: "Amazon Music", href: "https://music.amazon.com/albums/B0DYMQRW6V" },
      { label: "YouTube Music", href: "https://music.youtube.com/watch?v=83g0A_g_mI8" },
      { label: "Bandcamp", href: "https://myplasticlover.bandcamp.com/album/sue-o-en-stereo" },
      { label: "Deezer", href: "https://www.deezer.com/album/719370471" },
      { label: "Tidal", href: "https://listen.tidal.com/album/420609385" },
      {
        label: "Qobuz",
        href: "https://www.qobuz.com/us-en/album/sueno-en-stereo-plastic-lover/az4eu829p3aqa",
      },
    ],
  },
  {
    slug: "corriendo-hacia-ti",
    title: "Corriendo Hacia Ti",
    artist: "Plastic Lover, eccograms & VAAV Social Club",
    meta: "Single — 2024",
    cover: "https://i.scdn.co/image/ab67616d0000b273583eaebe43410fa2c8f7ebc1",
    links: [
      { label: "Spotify", href: "https://open.spotify.com/track/1vaecxuHmHjk32Xc55KCXn" },
      { label: "Tidal", href: "https://listen.tidal.com/track/495053657" },
      { label: "Pandora", href: "https://www.pandora.com/TR:127789396" },
    ],
    collaboration: true,
  },
  {
    slug: "hair-down",
    title: "hair down",
    artist: "Plastic Lover & s e r é n a t e",
    meta: "Single — 2023",
    cover: "https://i.scdn.co/image/ab67616d0000b273c02fcb2d65182ee2931a3179",
    links: [
      { label: "Spotify", href: "https://open.spotify.com/track/1VH1Uu03ZRnjGT72Kd9wsF" },
      { label: "Deezer", href: "https://www.deezer.com/track/2333963115" },
      { label: "Tidal", href: "https://listen.tidal.com/track/300893357" },
      { label: "Napster", href: "https://play.napster.com/track/tra.782073765" },
      { label: "Yandex Music", href: "https://music.yandex.ru/track/114851650" },
    ],
    collaboration: true,
  },
];

export function getReleaseBySlug(slug: string): Release | undefined {
  return RELEASES.find((r) => r.slug === slug);
}
