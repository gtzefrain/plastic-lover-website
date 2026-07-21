import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { getSongBySlug, SONGS } from "@/lib/songs";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
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
  const dict = getDictionary(locale).pages.lyricsDetail;

  if (!song) {
    return { title: dict.fallbackTitle, description: dict.fallbackDescription };
  }

  const title = `${song.title} — Plastic Lover`;
  const description = `${dict.descriptionPrefix} "${song.title}" — Plastic Lover.`;
  const path = `/lyrics/${song.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: buildOpenGraph({ title, description, path, locale }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function LyricsDetailPage({ params }: Props) {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  if (!song) notFound();

  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.lyricsDetail;

  return (
    <PageShell screenLabel={song.title} maxWidth={760}>
      <h1 className={styles.title}>{song.title}</h1>
      <p className={styles.lyrics}>{song.lyrics}</p>

      <p className={styles.footnote}>
        {dict.writtenBy} <strong>{song.authors.join(", ")}</strong>
      </p>
    </PageShell>
  );
}
