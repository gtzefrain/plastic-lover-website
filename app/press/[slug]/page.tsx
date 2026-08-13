import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AudioPlayer from "@/components/AudioPlayer";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { ARTIST_BIO, getPressKitBySlug, PRESS_KITS, PRESS_PHOTOS, SOCIAL_LINKS } from "@/lib/press";
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

  const contactEmail = kit.contactEmail ?? "myplasticlover@gmail.com";
  const artistBio = locale === "es" ? ARTIST_BIO.es : ARTIST_BIO.en;
  // Main image of the press kit (Section 1) — DSCF5471, not the release cover art.
  const heroPhoto = PRESS_PHOTOS[0];
  // Right column of the BIO section — the live performance shot (IMG_6544).
  const portrait = PRESS_PHOTOS[6] ?? PRESS_PHOTOS[0];

  return (
    <div className={showChrome ? `${styles.page} ${styles.pageWithChrome}` : styles.page}>
      {showChrome && <SiteNav locale={locale} />}

      <main id="main-content" className={styles.main}>
        {/* Section 1 — left: hero image, right: rich text */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageCol}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroPhoto.src} alt={heroPhoto.alt} className={styles.heroImage} />
          </div>
          <div className={styles.heroTextCol}>
            <div className={styles.heroTitleBlock}>
              <h1 className={styles.title}>{release.title}</h1>
              <div className={styles.meta}>
                {release.artist} · {release.meta}
              </div>
            </div>
            <p className={styles.bio}>{locale === "es" ? kit.bio.es : kit.bio.en}</p>
          </div>
        </section>

        {/* Section 1b — full width: stream links */}
        <section className={styles.streamSection}>
          <h2 className={styles.sectionLabel}>{dict.streamLabel}</h2>

          {kit.previewAudio && <AudioPlayer src={kit.previewAudio.src} title={kit.previewAudio.title} />}

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
        </section>

        {/* Section 2 (Content) — left: release text, right: image, two-column grid on desktop */}
        <section className={styles.contentSection}>
          <div className={styles.contentTextCol}>
            <p className={styles.bio}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod nisl eget aliquam
              ultricies, nunc nisl aliquet nunc, eget aliquam nunc nisl eget nunc.
            </p>

            <p className={styles.bio}>
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className={styles.contentImageCol}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={release.cover} alt={`${release.title} cover art`} className={styles.contentImage} />
          </div>
        </section>

        {/* Section 3 (BIO) — left: bio text + social links, right: portrait image */}
        <section className={styles.bioSection}>
          <div className={styles.bioTextCol}>
            <h2 className={styles.artistBioHeading}>{dict.artistBioHeading}</h2>
            <p className={styles.bio}>{artistBio}</p>

            <h2 className={styles.sectionLabel}>{dict.socialLabel}</h2>
            <ul className={styles.linksTable}>
              {SOCIAL_LINKS.map((link) => (
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

            <h2 className={styles.sectionLabel}>{dict.photosLabel}</h2>
            <a href={`/press/photos${showChrome ? "?site=1" : ""}`} className={styles.linkRow}>
              <span className={styles.linkLabel}>{dict.viewPhotosLabel}</span>
              <span className={styles.linkArrow} aria-hidden="true">
                →
              </span>
            </a>
          </div>

          {portrait && (
            <div className={styles.bioImageCol}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portrait.src} alt={portrait.alt} className={styles.bioImage} />
            </div>
          )}
        </section>

        {/* Section 4 — center: contact */}
        <section className={styles.contactSection}>
          <h2 className={styles.sectionLabel}>{dict.contactLabel}</h2>
          <a href={`mailto:${contactEmail}`} className={styles.contactEmail}>
            {contactEmail}
          </a>
        </section>
      </main>

      {showChrome && <Footer locale={locale} />}
    </div>
  );
}
