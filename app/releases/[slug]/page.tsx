import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ReleasePlayer from "@/components/ReleasePlayer";
import SiteNav from "@/components/SiteNav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { getReleaseBySlug, RELEASES } from "@/lib/releases";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
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
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.releaseDetail;

  if (!release) {
    return { title: dict.fallbackTitle, description: dict.fallbackDescription };
  }

  const title = `${release.title} — Plastic Lover`;
  const description = `${release.artist} · ${release.meta}. ${dict.descriptionSuffix}`;
  const path = `/releases/${release.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: buildOpenGraph({ title, description, path, locale }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function ReleasePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { site } = await searchParams;
  const showChrome = site === "1";
  const release = getReleaseBySlug(slug);
  const locale = await getServerLocale();

  if (!release) notFound();

  return (
    <div className={showChrome ? `${styles.page} ${styles.pageWithChrome}` : styles.page}>
      {showChrome && <SiteNav locale={locale} />}

      <main id="main-content" className={styles.content}>
        <ReleasePlayer cover={release.cover} title={release.title} videoId={release.embed?.videoId} />

        <h1 className={styles.title}>{release.title}</h1>
        <div className={styles.meta}>
          {release.artist} · {release.meta}
        </div>

        <ul className={styles.linksTable}>
          {release.links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.linkRow}>
                <span className={styles.linkLabel}>{link.label}</span>
                <span className={styles.linkArrow} aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </main>

      {showChrome && <Footer locale={locale} />}
    </div>
  );
}
