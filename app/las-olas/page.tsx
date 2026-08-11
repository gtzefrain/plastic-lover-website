import type { Metadata } from "next";
import LasOlas from "@/components/LasOlas";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.lasOlas;
  const ogDict = getDictionary("es").pages.lasOlas;
  return {
    title: dict.title,
    description: dict.description,
    robots: { index: false, follow: false },
    openGraph: buildOpenGraph({ title: ogDict.title, description: ogDict.description, path: "/las-olas" }),
    twitter: buildTwitter({ title: ogDict.title, description: ogDict.description }),
  };
}

export default async function LasOlasPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.lasOlas;

  return (
    <main id="main-content">
      <h1 className="visually-hidden">{dict.hiddenHeading}</h1>
      <LasOlas locale={locale} />
    </main>
  );
}
