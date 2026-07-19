import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { getSongBySlug, getSpotifyLinkForSong, SONGS } from "@/lib/songs";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SONGS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  const locale = await getServerLocale();
  return {
    title: song ? `${song.title} — Plastic Lover` : getDictionary(locale).pages.lyricsDetail.fallbackTitle,
  };
}

export default async function LyricsDetailPage({ params }: Props) {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  if (!song) notFound();

  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.lyricsDetail;
  const spotifyHref = getSpotifyLinkForSong(song);

  return (
    <PageShell screenLabel={song.title} maxWidth={760}>
      <h1 className={styles.title}>{song.title}</h1>
      <p className={styles.lyrics}>{song.lyrics}</p>

      <p className={styles.footnote}>
        {dict.writtenBy} <strong>{song.authors.join(", ")}</strong>
      </p>

      {spotifyHref && (
        <Button href={spotifyHref} target="_blank" rel="noopener noreferrer" className={styles.spotifyLink}>
          {dict.listenOnSpotify}
        </Button>
      )}
    </PageShell>
  );
}
