import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ReleasePlayer from "@/components/ReleasePlayer";
import SiteNav from "@/components/SiteNav";
import { getReleaseBySlug, RELEASES } from "@/lib/releases";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export function generateStaticParams() {
  return RELEASES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = getReleaseBySlug(slug);
  return {
    title: release ? `${release.title} — Plastic Lover` : "Release — Plastic Lover",
  };
}

export default async function ReleasePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { site } = await searchParams;
  const showChrome = site === "1";
  const release = getReleaseBySlug(slug);

  if (!release) notFound();

  return (
    <div className={showChrome ? `${styles.page} ${styles.pageWithChrome}` : styles.page}>
      {showChrome && <SiteNav />}

      <div className={styles.content}>
        <ReleasePlayer cover={release.cover} title={release.title} videoId={release.embed.videoId} />

        <h1 className={styles.title}>{release.title}</h1>
        <div className={styles.meta}>
          {release.artist} · {release.meta}
        </div>

        <div className={styles.linksTable}>
          {release.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkRow}
            >
              <span className={styles.linkLabel}>{link.label}</span>
              <span className={styles.linkArrow} aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
      </div>

      {showChrome && <Footer />}
    </div>
  );
}
