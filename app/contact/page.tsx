import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import rows from "@/components/RowList.module.css";

export const metadata: Metadata = {
  title: "Contact — Plastic Lover",
};

const CONTACTS = [
  { label: "MANAGEMENT", email: "mgmt@plasticlover.band" },
  { label: "BOOKING", email: "booking@plasticlover.band" },
  { label: "PRESS", email: "press@plasticlover.band" },
];

export default function ContactPage() {
  return (
    <PageShell screenLabel="Contact" kicker="CONTACT" maxWidth={760}>
      <div className={rows.list}>
        {CONTACTS.map((c) => (
          <div key={c.label} className={`${rows.row} ${rows.rowContact}`}>
            <span className={rows.contactLabel}>{c.label}</span>
            <a href={`mailto:${c.email}`} className={rows.contactEmail}>
              {c.email}
            </a>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
