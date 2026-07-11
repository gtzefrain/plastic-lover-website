import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import grid from "@/components/CardGrid.module.css";

export const metadata: Metadata = {
  title: "Videos — Plastic Lover",
};

const VIDEOS = [
  { title: "Melting Point (Official Video)", duration: "3:42" },
  { title: "Plastic Lover (Live at SO36)", duration: "4:15" },
  { title: "Gloss (Visualizer)", duration: "3:08" },
  { title: "Static Heart (Official Video)", duration: "3:55" },
];

export default function VideosPage() {
  return (
    <PageShell screenLabel="Videos" kicker="VIDEOS" maxWidth={980}>
      <div className={`${grid.grid} ${grid.gridWide}`}>
        {VIDEOS.map((v) => (
          <div key={v.title} className={grid.card}>
            <div className={grid.thumbWide}>
              <span className={grid.thumbLabel}>VIDEO STILL</span>
            </div>
            <div className={grid.metaRowBaseline}>
              <span className={grid.title}>{v.title}</span>
              <span className={grid.meta}>{v.duration}</span>
            </div>
            <div>
              <Button href="#" variant="outline">
                WATCH
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
