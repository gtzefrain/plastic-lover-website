import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { PRESS_PHOTOS } from "@/lib/press";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.press;

  const title = `${dict.photosLabel} — Plastic Lover`;
  const description = dict.descriptionSuffix;
  const ogDict = getDictionary("es").pages.press;
  const path = "/press/photos";

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: buildOpenGraph({ title, description: ogDict.descriptionSuffix, path }),
    twitter: buildTwitter({ title, description: ogDict.descriptionSuffix }),
  };
}

export default async function PressPhotosPage({ searchParams }: Props) {
  const { site } = await searchParams;
  const showChrome = site === "1";
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.press;

  const categories = new Map<string, typeof PRESS_PHOTOS>();
  for (const photo of PRESS_PHOTOS) {
    const group = categories.get(photo.category) ?? [];
    group.push(photo);
    categories.set(photo.category, group);
  }

  return (
    <div className={showChrome ? `${styles.page} ${styles.pageWithChrome}` : styles.page}>
      {showChrome && <SiteNav locale={locale} />}

      <main id="main-content" className={styles.main}>
        <a href={`/press/las-olas${showChrome ? "?site=1" : ""}`} className={styles.backLink}>
          {dict.backToKitLabel}
        </a>

        <p className={styles.kicker}>{dict.artistBioHeading}</p>
        <h1 className={styles.title}>{dict.photosLabel}</h1>

        {[...categories.entries()].map(([category, photos]) => (
          <section key={category} className={styles.categoryGroup}>
            <h2 className={styles.categoryLabel}>{category}</h2>
            <ul className={styles.photoGrid}>
              {photos.map((photo) => (
                <li key={photo.src} className={styles.photoCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt={photo.alt} className={styles.photoImage} />
                  <div className={styles.photoMeta}>
                    {photo.credit && <span className={styles.photoCredit}>{photo.credit}</span>}
                    <a href={photo.downloadSrc ?? photo.src} download className={styles.photoDownload}>
                      {dict.downloadLabel}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {showChrome && <Footer locale={locale} />}
    </div>
  );
}
