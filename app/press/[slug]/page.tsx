import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import AudioPlayer from "@/components/AudioPlayer";
import Footer from "@/components/Footer";
import PressNav from "@/components/PressNav";
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

// Parses `[label](url)` markdown-link syntax out of PressKit.bio/content copy into real
// anchor tags — the only rich-text feature press copy needs, so a full markdown parser is overkill.
function renderRichText(text: string) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(
      <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
        {match[1]}
      </a>,
    );
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}

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
  // Main image of the press kit (Section 1) — not the release cover art.
  const heroPhoto = kit.heroImage ?? PRESS_PHOTOS[0];
  // Right column of the BIO section — the live performance shot (IMG_6544).
  const portrait = PRESS_PHOTOS[6] ?? PRESS_PHOTOS[0];

  return (
    <div className={showChrome ? `${styles.page} ${styles.pageWithChrome}` : styles.page}>
      {showChrome ? <SiteNav locale={locale} /> : <PressNav locale={locale} maxWidth={880} />}

      <main id="main-content" className={styles.main}>
        {/* Section 1 — left: hero image, right: rich text */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageCol}>
            <div className={styles.heroImage}>
              <Image
                src={heroPhoto.src}
                alt={heroPhoto.alt}
                fill
                sizes="(max-width: 720px) 90vw, 340px"
                className={styles.heroImageEl}
                priority
              />
            </div>
          </div>
          <div className={styles.heroTextCol}>
            <div className={styles.heroTitleBlock}>
              <h1 className={styles.title}>{release.title}</h1>
              <div className={styles.meta}>
                {release.artist} · {release.meta}
              </div>
            </div>
            <p className={styles.bio}>{renderRichText(locale === "es" ? kit.bio.es : kit.bio.en)}</p>
          </div>
        </section>

        {/* Section 1b — full width: stream links */}
        <section className={styles.streamSection}>
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
            {(locale === "es" ? kit.content?.es : kit.content?.en)?.map((paragraph, i) => (
              <p key={i} className={styles.bio}>
                {renderRichText(paragraph)}
              </p>
            ))}
          </div>

          <div className={styles.contentImageCol}>
            <div className={styles.contentVideo}>
              <iframe
                src="https://www.youtube.com/embed/QfgRF2Kfsos"
                title={`${release.title} video`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className={styles.contentVideoFrame}
              />
            </div>
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
              <div className={styles.bioImage}>
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(max-width: 720px) 90vw, 300px"
                  className={styles.bioImageEl}
                />
              </div>
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
