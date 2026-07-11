import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import rows from "@/components/RowList.module.css";

export const metadata: Metadata = {
  title: "Live — Plastic Lover",
};

const DATES = [
  { date: "AUG 14", city: "Berlin", venue: "SO36" },
  { date: "AUG 16", city: "Amsterdam", venue: "Paradiso Noord" },
  { date: "AUG 19", city: "Paris", venue: "La Maroquinerie" },
  { date: "AUG 21", city: "London", venue: "MOTH Club" },
  { date: "AUG 23", city: "Manchester", venue: "YES Basement" },
  { date: "SEP 04", city: "New York", venue: "Baby's All Right" },
];

export default function LivePage() {
  return (
    <PageShell screenLabel="Live" kicker="TOUR — SUMMER 2026" maxWidth={880}>
      <div className={rows.list}>
        {DATES.map((show) => (
          <div key={show.date + show.city} className={`${rows.row} ${rows.rowLive}`}>
            <span className={rows.index}>{show.date}</span>
            <span className={rows.name}>{show.city}</span>
            <span className={rows.sub}>{show.venue}</span>
            <Button href="#" variant="outline">
              TICKETS
            </Button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
