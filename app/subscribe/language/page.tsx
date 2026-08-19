import type { Metadata } from "next";
import Footer from "@/components/Footer";
import LanguagePreferenceForm from "@/components/LanguagePreferenceForm";
import SiteNav from "@/components/SiteNav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.subscribeLanguage;
  const ogDict = getDictionary("es").pages.subscribeLanguage;
  return {
    title: dict.title,
    description: dict.description,
    robots: { index: false, follow: false },
    alternates: { canonical: "/subscribe/language" },
    openGraph: buildOpenGraph({
      title: ogDict.title,
      description: ogDict.description,
      path: "/subscribe/language",
    }),
    twitter: buildTwitter({ title: ogDict.title, description: ogDict.description }),
  };
}

export default async function SubscribeLanguagePage({ searchParams }: Props) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const { u, id } = await searchParams;
  const uuid = typeof u === "string" ? u : null;
  const subscriberId = typeof id === "string" ? id : null;

  return (
    <div className={styles.page}>
      <SiteNav locale={locale} />
      <main
        id="main-content"
        data-screen-label={dict.pages.subscribeLanguage.screenLabel}
        className={styles.content}
        style={{ animation: "plFadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both" }}
      >
        <LanguagePreferenceForm uuid={uuid} subscriberId={subscriberId} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
