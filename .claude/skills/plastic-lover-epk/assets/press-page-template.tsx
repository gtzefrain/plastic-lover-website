// Template for app/press/[slug]/page.tsx — copy into the repo, then:
//   1. Confirm PRESS_KITS has an entry whose slug matches a RELEASES slug (add both if new)
//   2. Add the `pages.press` dictionary block to lib/i18n/dictionaries.ts (see
//      assets/dictionary-additions.md in this skill) before this will compile — the dict
//      keys referenced below (dict.kicker, dict.streamLabel, etc.) don't exist yet otherwise
//   3. Drop real photo files under public/press/<slug>/ and point PressPhoto.src at them
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ReleasePlayer from "@/components/ReleasePlayer";
import SiteNav from "@/components/SiteNav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { getPressKitBySlug, PRESS_KITS } from "@/lib/press";
import { getReleaseBySlug } from "@/lib/releases";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export function generateStaticParams() {
  return PRESS_KITS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = getReleaseBySlug(slug);
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.press;

  if (!release) {
    return { title: dict.fallbackTitle, description: dict.fallbackDescription };
  }

  const title = `${release.title} — ${dict.kicker} — Plastic Lover`;
  const description = `${release.artist} · ${release.meta}. ${dict.descriptionSuffix}`;
  // og:title/description are always Spanish, matching every other route in this repo
  const ogDict = getDictionary("es").pages.press;
  const ogDescription = `${release.artist} · ${release.meta}. ${ogDict.descriptionSuffix}`;
  const path = `/press/${release.slug}`;

  return {
    title,
    description,
    // press kits are meant to be shared directly with journalists, not surfaced in search
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: buildOpenGraph({ title, description: ogDescription, path }),
    twitter: buildTwitter({ title, description: ogDescription }),
  };
}

export default async function PressKitPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { site } = await searchParams;
  const showChrome = site === "1";
  const release = getReleaseBySlug(slug);
  const kit = getPressKitBySlug(slug);
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.press;

  if (!release || !kit) notFound();

  const contactEmail = kit.contactEmail ?? "press@plasticlover.band";

  return (
    <div className={showChrome ? `${styles.page} ${styles.pageWithChrome}` : styles.page}>
      {showChrome && <SiteNav locale={locale} />}

      <main id="main-content" className={styles.content}>
        <p className={styles.kicker}>{dict.kicker}</p>

        <ReleasePlayer cover={release.cover} title={release.title} videoId={release.embed?.videoId} />

        <h1 className={styles.title}>{release.title}</h1>
        <div className={styles.meta}>
          {release.artist} · {release.meta}
        </div>

        <p className={styles.bio}>{locale === "es" ? kit.bio.es : kit.bio.en}</p>

        {kit.quotes && kit.quotes.length > 0 && (
          <ul className={styles.quoteList}>
            {kit.quotes.map((q) => (
              <li key={q.source} className={styles.quote}>
                <p className={styles.quoteText}>&ldquo;{q.text}&rdquo;</p>
                <p className={styles.quoteSource}>{q.source}</p>
              </li>
            ))}
          </ul>
        )}

        <h2 className={styles.sectionLabel}>{dict.streamLabel}</h2>
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

        {kit.credits && kit.credits.length > 0 && (
          <>
            <h2 className={styles.sectionLabel}>{dict.creditsLabel}</h2>
            <ul className={styles.creditsList}>
              {kit.credits.map((c) => (
                <li key={c.label} className={styles.creditRow}>
                  <span className={styles.creditLabel}>{c.label}</span>
                  <span className={styles.creditValue}>{c.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {kit.photos.length > 0 && (
          <>
            <h2 className={styles.sectionLabel}>{dict.photosLabel}</h2>
            <ul className={styles.photoGrid}>
              {kit.photos.map((photo) => (
                <li key={photo.src} className={styles.photoCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt={photo.alt} className={styles.photoImage} />
                  <div className={styles.photoMeta}>
                    {photo.credit && <span className={styles.photoCredit}>{photo.credit}</span>}
                    <a href={photo.src} download className={styles.photoDownload}>
                      {dict.downloadLabel}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className={styles.sectionLabel}>{dict.contactLabel}</h2>
        <a href={`mailto:${contactEmail}`} className={styles.contactEmail}>
          {contactEmail}
        </a>
      </main>

      {showChrome && <Footer locale={locale} />}
    </div>
  );
}
