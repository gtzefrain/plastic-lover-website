import type { Metadata } from "next";
import Footer from "@/components/Footer";
import MailingListForm from "@/components/MailingListForm";
import SiteNav from "@/components/SiteNav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.subscribe;
  return {
    title: dict.title,
    description: dict.description,
    alternates: { canonical: "/subscribe" },
    openGraph: buildOpenGraph({ title: dict.title, description: dict.description, path: "/subscribe", locale }),
    twitter: buildTwitter({ title: dict.title, description: dict.description }),
  };
}

export default async function SubscribePage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);

  return (
    <div className={styles.page}>
      <SiteNav locale={locale} />
      <main
        id="main-content"
        data-screen-label={dict.pages.subscribe.screenLabel}
        className={styles.content}
        style={{ animation: "plFadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both" }}
      >
        <MailingListForm locale={locale} headingLevel="h1" />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
