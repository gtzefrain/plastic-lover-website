"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import ProgressRing from "@/components/ProgressRing";
import { d, HERO_FLOATING, HERO_SPEED, LETTERS } from "@/lib/heroChoreography";
import styles from "./HeroLogo.module.css";

type HeroLogoProps = {
  skipEntrance?: boolean;
};

// Matches SiteNav's mobile breakpoint — below it we preload the downsized
// asset set from public/logo/mobile/ so phones on slow networks aren't
// pulling the same ~3246px source PNGs as desktop.
const MOBILE_QUERY = "(max-width: 860px)";

// Only show the ring once a load is taking a noticeable moment — avoids a
// flash of the spinner on connections fast enough that images resolve
// almost instantly (including cached repeat views / the replay button).
const RING_GRACE_MS = 300;

// HomeClient remounts this component (via a `key` on run/heroPlaying) any
// time the entrance needs to restart, rather than this effect resetting
// state on a dependency change — keeps every setState call here tied to an
// actual async callback instead of a synchronous reset at the top.
export default function HeroLogo({ skipEntrance = false }: HeroLogoProps) {
  const [progress, setProgress] = useState(0);
  const [showRing, setShowRing] = useState(false);
  // Resolved, already-preloaded image URLs — null until every image the
  // current mode needs has actually finished downloading. The letter divs
  // below never get a backgroundImage before that, so a slow connection
  // shows the ring instead of blank/broken boxes mid-animation.
  const [sources, setSources] = useState<string[] | null>(null);

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const base = mobile ? "/logo/mobile" : "/logo";
    const urls = skipEntrance
      ? [`${base}/LOGO_3D.jpg`]
      : LETTERS.map(([src]) => `${base}/${src}`);
    const total = urls.length;

    let cancelled = false;
    let loaded = 0;

    const graceTimer = window.setTimeout(() => {
      if (!cancelled && loaded < total) setShowRing(true);
    }, RING_GRACE_MS);

    urls.forEach((src) => {
      const img = new window.Image();
      const onSettle = () => {
        if (cancelled) return;
        loaded += 1;
        setProgress(loaded / total);
        if (loaded === total) {
          window.clearTimeout(graceTimer);
          setShowRing(false);
          setSources(urls);
        }
      };
      img.onload = onSettle;
      img.onerror = onSettle;
      img.src = src;
    });

    return () => {
      cancelled = true;
      window.clearTimeout(graceTimer);
    };
  }, [skipEntrance]);

  const floatDelay = skipEntrance ? "0s" : d(1.5);
  const floatKeyframe = HERO_FLOATING
    ? `plFloat ${5 / HERO_SPEED}s ease-in-out ${floatDelay} infinite`
    : null;
  const ready = sources !== null;

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div
        className={styles.stack}
        style={{
          animation:
            ready && HERO_FLOATING
              ? `plFloat ${5 / HERO_SPEED}s ease-in-out ${skipEntrance ? "0s" : d(2.6)} infinite`
              : "none",
        }}
      >
        {ready &&
          (skipEntrance ? (
            <div
              className={styles.letter}
              style={{ backgroundImage: `url(${sources[0]})` }}
            />
          ) : (
            LETTERS.map(([, dx, dy, rot], i) => (
              <div
                key={sources[i]}
                className={styles.letter}
                style={
                  {
                    backgroundImage: `url(${sources[i]})`,
                    "--dx": `${dx}vw`,
                    "--dy": `${dy}vh`,
                    "--rot": `${rot}deg`,
                    animation: `plBlob ${1.6 / HERO_SPEED}s cubic-bezier(0.25,0.8,0.3,1) both`,
                    animationDelay: d(0.12 * i),
                  } as CSSProperties
                }
              />
            ))
          ))}

        {showRing && (
          <div className={styles.ringOverlay}>
            <ProgressRing progress={progress} />
          </div>
        )}
      </div>
      <div
        className={styles.shadow}
        style={
          !ready
            ? { opacity: 0 }
            : skipEntrance
              ? {
                  transform: "scaleX(1)",
                  opacity: 0.45,
                  animation: floatKeyframe ?? "none",
                }
              : {
                  animation: [`plMeltShadow ${2.2 / HERO_SPEED}s ease both`, floatKeyframe]
                    .filter(Boolean)
                    .join(", "),
                }
        }
      />
    </div>
  );
}
