import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import rows from "@/components/RowList.module.css";

export const metadata: Metadata = {
  title: "Lyrics — Plastic Lover",
};

const SONGS = [
  { num: "01", title: "Melting Point" },
  { num: "02", title: "Plastic Lover" },
  { num: "03", title: "Gloss" },
  { num: "04", title: "Static Heart" },
  { num: "05", title: "Vinyl Skin" },
  { num: "06", title: "Soft Machine" },
];

export default function LyricsPage() {
  return (
    <PageShell screenLabel="Lyrics" kicker="LYRICS — MELTING POINT" maxWidth={760}>
      <div className={rows.list}>
        {SONGS.map((song) => (
          <div key={song.num} className={`${rows.row} ${rows.rowLyrics}`}>
            <span className={rows.index}>{song.num}</span>
            <span className={rows.name}>{song.title}</span>
            <Button href="#" variant="outline">
              READ
            </Button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
