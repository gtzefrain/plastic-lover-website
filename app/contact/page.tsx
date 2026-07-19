import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import rows from "@/components/RowList.module.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getServerLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: getDictionary(locale).pages.contact.title };
}

export default async function ContactPage() {
  notFound();
  const locale = await getServerLocale();
  const dict = getDictionary(locale).pages.contact;

  const CONTACTS = [
    { label: dict.management, email: "mgmt@plasticlover.band" },
    { label: dict.booking, email: "booking@plasticlover.band" },
    { label: dict.press, email: "press@plasticlover.band" },
  ];

  return (
    <PageShell screenLabel={dict.screenLabel} kicker={dict.kicker} maxWidth={760}>
      <ul className={rows.list}>
        {CONTACTS.map((c) => (
          <li key={c.label} className={`${rows.row} ${rows.rowContact}`}>
            <span className={rows.contactLabel}>{c.label}</span>
            <a href={`mailto:${c.email}`} className={rows.contactEmail}>
              {c.email}
            </a>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
