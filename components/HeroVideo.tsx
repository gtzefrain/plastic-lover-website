"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./HeroVideo.module.css";

// The home hero's background: 0:09–0:15 of the "Sería Más Fácil Odiarte" video, played forward
// then backward (a boomerang baked into the file, so the `loop` seam is seamless). Pillarbox bars
// cropped off and downscaled to 1440px — see README for the ffmpeg recipe. A <video>, not the GIF
// the clip was first cut as: the GIF was ~13x the bytes at less than half the width.
//
// Decorative only — the hero's meaning lives in the wordmark and <h1>. Reduced-motion visitors get
// no video at all, just the page background: the blanket reduced-motion CSS override can't stop a
// video, so there's no `autoPlay` attribute — playback starts from the effect below only when
// motion is allowed, and the CSS module hides the whole layer under the media query.
type HeroVideoProps = {
  /** Matches the rest of the hero entrance; "0s" when the animation is skipped. */
  entranceDelay?: string;
};

export default function HeroVideo({ entranceDelay = "0s" }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion()) return;
    // Rejects if the browser blocks autoplay (e.g. iOS Low Power Mode) — the poster stays up.
    video.play().catch(() => {});
  }, []);

  return (
    <div
      className={styles.wrap}
      aria-hidden="true"
      style={{
        animation: "plFadeIn 1.6s ease forwards",
        animationDelay: entranceDelay,
      }}
    >
      <video
        ref={videoRef}
        className={styles.video}
        muted
        loop
        playsInline
        preload="none"
        poster="/home/seria-loop-poster.jpg"
        tabIndex={-1}
      >
        <source src="/home/seria-loop.webm" type="video/webm" />
        <source src="/home/seria-loop.mp4" type="video/mp4" />
      </video>
      <div className={styles.scrim} />
    </div>
  );
}
