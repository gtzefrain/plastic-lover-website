import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import grid from "@/components/CardGrid.module.css";
import { getReleaseBySlug } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Releases — Plastic Lover",
};

const RELEASES = [
  { slug: "detalles", title: "Detalles", meta: "Single — 2023" },
  { slug: "melting-point", title: "Melting Point", meta: "EP — 2026" },
  { slug: "plastic-lover", title: "Plastic Lover", meta: "Single — 2026" },
  { slug: "demos-vol-1", title: "Demos, Vol. 1", meta: "Mixtape — 2025" },
];

export default function ReleasesPage() {
  return (
    <PageShell screenLabel="Releases" kicker="RELEASES" maxWidth={980}>
      <div className={grid.grid}>
        {RELEASES.map((r) => {
          const hasPage = Boolean(getReleaseBySlug(r.slug));
          return (
            <div key={r.slug} className={grid.card}>
              <div className={grid.thumbSquare}>
                <span className={grid.thumbLabel}>COVER ART</span>
              </div>
              <div className={grid.title}>{r.title}</div>
              <div className={grid.metaRow}>
                <span className={grid.meta}>{r.meta}</span>
                <Button href={hasPage ? `/releases/${r.slug}?site=1` : "#"} variant="outline">
                  STREAM
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
