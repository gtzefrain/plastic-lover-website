import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import VideoCardPlayer from "@/components/VideoCardPlayer";
import grid from "@/components/CardGrid.module.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.videos;
  return {
    title: dict.title,
    description: dict.description,
    alternates: { canonical: "/videos" },
    openGraph: buildOpenGraph({ title: dict.title, description: dict.description, path: "/videos", locale }),
    twitter: buildTwitter({ title: dict.title, description: dict.description }),
  };
}

// Sourced from youtube.com/@myplasticlover, ordered by view count (most to least).
const VIDEOS = [
  { id: "1FgRCnTdwIo", title: "Plastic Lover - Visión [MV]", duration: "4:48" },
  { id: "iH14HLzseKU", title: "Plastic Lover - Detalles ft. Sam Vazquez [MV]", duration: "4:02" },
  { id: "cIzuD1r4vIQ", title: "Plastic Lover - Como Tú [Visualizer]", duration: "2:45" },
  { id: "6cqLtl2ULac", title: "Plastic Lover - Ultramar [Visualizer]", duration: "3:07" },
  { id: "JAaX3cD2IRc", title: "Plastic Lover - Oh No [MV]", duration: "3:53" },
  { id: "k_YpRK0QT1w", title: "Plastic Lover - Círculo (EP)", duration: "13:30" },
];

export default async function VideosPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.videos;

  return (
    <PageShell screenLabel={dict.screenLabel} kicker={dict.kicker} maxWidth={980}>
      <ul className={`${grid.grid} ${grid.gridWide}`}>
        {VIDEOS.map((v) => (
          <li key={v.id} className={grid.card}>
            <VideoCardPlayer videoId={v.id} title={v.title} />
            <div className={grid.metaRowBaseline}>
              <span className={grid.title}>{v.title}</span>
              <span className={grid.meta}>{v.duration}</span>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
