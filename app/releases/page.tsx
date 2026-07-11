import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import grid from "@/components/CardGrid.module.css";

export const metadata: Metadata = {
  title: "Releases — Plastic Lover",
};

const RELEASES = [
  { title: "Melting Point", meta: "EP — 2026" },
  { title: "Plastic Lover", meta: "Single — 2026" },
  { title: "Demos, Vol. 1", meta: "Mixtape — 2025" },
];

export default function ReleasesPage() {
  return (
    <PageShell screenLabel="Releases" kicker="RELEASES" maxWidth={980}>
      <div className={grid.grid}>
        {RELEASES.map((r) => (
          <div key={r.title} className={grid.card}>
            <div className={grid.thumbSquare}>
              <span className={grid.thumbLabel}>COVER ART</span>
            </div>
            <div className={grid.title}>{r.title}</div>
            <div className={grid.metaRow}>
              <span className={grid.meta}>{r.meta}</span>
              <Button href="#" variant="outline">
                STREAM
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
