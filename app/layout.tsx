import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import SkipToFooter from "@/components/SkipToFooter";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { buildOpenGraph, buildTwitter, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const description = getDictionary(locale).site.description;
  const ogDescription = getDictionary("es").site.description;

  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_NAME,
    description,
    robots: { index: true, follow: true },
    openGraph: buildOpenGraph({ title: SITE_NAME, description: ogDescription, path: "/" }),
    twitter: buildTwitter({ title: SITE_NAME, description: ogDescription }),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <a href="#main-content" className="skip-link">
          {dict.nav.skipToContent}
        </a>
        <SkipToFooter locale={locale} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
