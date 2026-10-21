import { ImageResponse } from "next/og";
import { getReleaseBySlug, RELEASES } from "@/lib/releases";

export const alt = "Plastic Lover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return RELEASES.map((r) => ({ slug: r.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const release = getReleaseBySlug(slug);
  // A cover URL that 404s (e.g. a pre-release raw.githubusercontent.com cover not yet on `main`)
  // renders the card without art instead of failing the whole build.
  const coverBuffer = release
    ? await fetch(release.cover)
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .catch(() => null)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          padding: 72,
          background: "#ffffff",
        }}
      >
        {coverBuffer && (
          <img
            // @ts-expect-error Satori accepts ArrayBuffer for <img src> at runtime
            src={coverBuffer}
            width={486}
            height={486}
            style={{ borderRadius: 12, boxShadow: "0 18px 44px rgba(198, 12, 44, 0.32)" }}
            alt=""
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
          <span style={{ fontSize: 64, fontWeight: 700, color: "#c60c2c", lineHeight: 1.1 }}>
            {release?.title ?? "Plastic Lover"}
          </span>
          {release && (
            <span style={{ fontSize: 32, color: "#8f0820", marginTop: 20 }}>
              {release.artist} · {release.meta}
            </span>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
