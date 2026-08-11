import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Las Olas — Plastic Lover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/las-olas-logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "radial-gradient(ellipse 90% 70% at 50% 45%, #ffffff 0%, #fff6f7 60%, #ffecef 100%)",
        }}
      >
        <img src={logoSrc} width={980} height={551} alt="" />
        <span
          style={{
            fontSize: 26,
            fontFamily: "monospace",
            letterSpacing: 6,
            color: "rgba(198, 12, 44, 0.8)",
          }}
        >
          EL NUEVO SENCILLO — 20 DE AGOSTO
        </span>
      </div>
    ),
    { ...size },
  );
}
