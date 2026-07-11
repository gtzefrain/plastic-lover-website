import type { Metadata } from "next";
import Button from "@/components/Button";
import PageShell from "@/components/PageShell";
import grid from "@/components/CardGrid.module.css";

export const metadata: Metadata = {
  title: "Store — Plastic Lover",
};

const PRODUCTS = [
  { title: "Plastic Lover Tee", price: "€35", thumb: "TEE PHOTO" },
  { title: "Melting Point LP — Red Vinyl", price: "€28", thumb: "VINYL PHOTO" },
  { title: "Gloss Cap", price: "€25", thumb: "CAP PHOTO" },
];

export default function StorePage() {
  return (
    <PageShell screenLabel="Store" kicker="STORE" maxWidth={980}>
      <div className={grid.grid}>
        {PRODUCTS.map((p) => (
          <div key={p.title} className={grid.card}>
            <div className={grid.thumbSquare}>
              <span className={grid.thumbLabel}>{p.thumb}</span>
            </div>
            <div className={grid.title}>{p.title}</div>
            <div className={grid.metaRow}>
              <span className={grid.price}>{p.price}</span>
              <Button href="#" variant="outline">
                BUY
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
