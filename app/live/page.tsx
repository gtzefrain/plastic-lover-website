import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ShowRequestForm from "@/components/ShowRequestForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";
import { buildOpenGraph, buildTwitter } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.live;
  return {
    title: dict.title,
    description: dict.description,
    alternates: { canonical: "/live" },
    openGraph: buildOpenGraph({ title: dict.title, description: dict.description, path: "/live", locale }),
    twitter: buildTwitter({ title: dict.title, description: dict.description }),
  };
}

// No confirmed tour dates right now. Keeping the row-list design and data shape
// commented out here so it's ready to restore once dates are booked again.
//
// import Button from "@/components/Button";
// import rows from "@/components/RowList.module.css";
//
// const DATES = [
//   { date: "AUG 14", city: "Berlin", venue: "SO36" },
//   { date: "AUG 16", city: "Amsterdam", venue: "Paradiso Noord" },
//   { date: "AUG 19", city: "Paris", venue: "La Maroquinerie" },
//   { date: "AUG 21", city: "London", venue: "MOTH Club" },
//   { date: "AUG 23", city: "Manchester", venue: "YES Basement" },
//   { date: "SEP 04", city: "New York", venue: "Baby's All Right" },
// ];
//
// <div className={rows.list}>
//   {DATES.map((show) => (
//     <div key={show.date + show.city} className={`${rows.row} ${rows.rowLive}`}>
//       <span className={rows.index}>{show.date}</span>
//       <span className={rows.name}>{show.city}</span>
//       <span className={rows.sub}>{show.venue}</span>
//       <Button href="#" variant="outline">
//         {dict.tickets}
//       </Button>
//     </div>
//   ))}
// </div>

export default async function LivePage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.live;

  return (
    <PageShell screenLabel={dict.screenLabel} kicker={dict.kicker} kickerAs="p" maxWidth={880}>
      <ShowRequestForm locale={locale} />
    </PageShell>
  );
}
