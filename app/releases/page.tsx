import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import grid from "@/components/CardGrid.module.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { RELEASES, type Release } from "@/lib/releases";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.releases;
  const ogDict = getDictionary("es").pages.releases;
  return {
    title: dict.title,
    description: dict.description,
    alternates: { canonical: "/releases" },
    openGraph: buildOpenGraph({ title: ogDict.title, description: ogDict.description, path: "/releases" }),
    twitter: buildTwitter({ title: ogDict.title, description: ogDict.description }),
  };
}

function ReleaseGrid({ releases, stream }: { releases: Release[]; stream: string }) {
  return (
    <ul className={grid.grid}>
      {releases.map((r) => (
        <li key={r.slug} className={grid.card}>
          <div className={grid.thumbSquare}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.cover} alt={`${r.title} cover art`} className={grid.thumbImage} />
          </div>
          <div className={grid.title}>{r.title}</div>
          <div className={grid.metaRow}>
            <span className={grid.meta}>{r.meta}</span>
            <Button href={`/releases/${r.slug}?site=1`} variant="outline">
              {stream}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function ReleasesPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.releases;
  const releases = RELEASES.filter((r) => !r.collaboration);
  const collaborations = RELEASES.filter((r) => r.collaboration);

  return (
    <PageShell screenLabel={dict.screenLabel} kicker={dict.kicker} maxWidth={980}>
      <ReleaseGrid releases={releases} stream={dict.stream} />

      {collaborations.length > 0 && (
        <>
          <h2 className={styles.kicker}>{dict.collaborations}</h2>
          <ReleaseGrid releases={collaborations} stream={dict.stream} />
        </>
      )}
    </PageShell>
  );
}
