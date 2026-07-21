import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import rows from "@/components/RowList.module.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { SONGS } from "@/lib/songs";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.lyrics;
  return {
    title: dict.title,
    description: dict.description,
    alternates: { canonical: "/lyrics" },
    openGraph: buildOpenGraph({ title: dict.title, description: dict.description, path: "/lyrics", locale }),
    twitter: buildTwitter({ title: dict.title, description: dict.description }),
  };
}

export default async function LyricsPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.lyrics;

  return (
    <PageShell screenLabel={dict.screenLabel} kicker={dict.kicker} maxWidth={760}>
      <ul className={rows.list}>
        {SONGS.map((song) => (
          <li key={song.slug} className={`${rows.row} ${rows.rowLyrics}`}>
            <span className={rows.name}>{song.title}</span>
            <Button href={`/lyrics/${song.slug}`} variant="outline">
              {dict.read}
            </Button>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
