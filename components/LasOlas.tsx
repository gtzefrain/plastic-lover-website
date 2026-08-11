"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import styles from "./LasOlas.module.css";

const REVEAL_AT = 6;
const REVEAL_HOLD_MS = 3000;
const STORAGE_KEY = "pl-las-olas-revealed";
const PRESAVE_URL =
  "https://ditto.fm/las-olas-plastic-lover/presavecallback?context=pre_save&service=spotify&redirecturl&actionid&order=6a7a28054700001200d01b91&fpEnabled=false&user=Efra%C3%ADn%20Fernando%20Guti%C3%A9rrez&status=success&origin=presavecallback";

type Bubble = {
  ox: string;
  size: string;
  drift: string;
  dur: string;
  delay: string;
};

type Ripple = {
  id: string;
  x: string;
  y: string;
  bubbles: Bubble[];
};

function createRipple(x: number, y: number): Ripple {
  const bubbleCount = 3 + Math.floor(Math.random() * 3);
  const bubbles: Bubble[] = Array.from({ length: bubbleCount }, () => ({
    ox: `${Math.random() * 120 - 60}px`,
    size: `${6 + Math.random() * 10}px`,
    drift: `${Math.random() * 80 - 40}px`,
    dur: `${(2.2 + Math.random() * 1.6).toFixed(2)}s`,
    delay: `${(Math.random() * 0.4).toFixed(2)}s`,
  }));
  return {
    id: `${Date.now()}-${Math.random()}`,
    x: `${x}px`,
    y: `${y}px`,
    bubbles,
  };
}

const CREST_PATH =
  "M0,192C120,150 240,150 360,192C480,234 600,234 720,192C840,150 960,150 1080,192C1200,234 1320,234 1440,192";
const CREST_PATH_B =
  "M0,224C120,264 240,264 360,224C480,184 600,184 720,224C840,264 960,264 1080,224C1200,184 1320,184 1440,224";

function subscribeNoop() {
  return () => {};
}

function getPersistedRevealed() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerRevealed() {
  return false;
}

function WaveSvg({ fill, fillOpacity, path, stroke, strokeWidth }: { fill: string; fillOpacity?: number; path: string; stroke: string; strokeWidth: number }) {
  return (
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className={styles.waveSvg}>
      <path fill={fill} fillOpacity={fillOpacity} d={`${path}L1440,320L0,320Z`} />
      <path fill="none" stroke={stroke} strokeWidth={strokeWidth} d={path} />
    </svg>
  );
}

type LasOlasProps = {
  locale?: Locale;
};

export default function LasOlas({ locale = "en" }: LasOlasProps) {
  const dict = getDictionary(locale).pages.lasOlas;
  const persistedRevealed = useSyncExternalStore(subscribeNoop, getPersistedRevealed, getServerRevealed);
  const [clicks, setClicks] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const revealedRef = useRef(false);

  const isRevealed = revealed || persistedRevealed;
  const effectiveClicks = persistedRevealed ? REVEAL_AT : clicks;

  const handleReveal = (event: MouseEvent<HTMLDivElement>) => {
    const ripple = createRipple(event.clientX, event.clientY);
    setRipples((prev) => [...prev, ripple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 4600);

    setClicks((prev) => {
      const next = Math.min(prev + 1, REVEAL_AT);
      if (!revealedRef.current && !persistedRevealed && next >= REVEAL_AT) {
        revealedRef.current = true;
        window.localStorage.setItem(STORAGE_KEY, "1");
        setRevealed(true);
        setTimeout(() => {
          window.open(PRESAVE_URL, "_blank");
        }, REVEAL_HOLD_MS);
      }
      return next;
    });
  };

  const handleReplay = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    window.localStorage.removeItem(STORAGE_KEY);
    revealedRef.current = false;
    setRevealed(false);
    setClicks(0);
    setRipples([]);
  };

  const t = Math.min(effectiveClicks / REVEAL_AT, 1);
  const logoFilter = `blur(${(1 - t) * 14}px) brightness(${0.9 + t * 0.1})`;
  const logoOpacity = 0.12 + t * 0.88;
  const waveTop = `${-20 + t * 64}%`;
  const waveTop2 = `${-14 + t * 60}%`;
  const depthPct = `${t * 100}%`;
  const swayAnimation =
    effectiveClicks === 0 || isRevealed
      ? "lasBreath 6s ease-in-out infinite"
      : `lasSway${effectiveClicks % 2 ? "A" : "B"} 1.4s ease-in-out both`;

  return (
    <div className={styles.scene} onClick={handleReveal}>
      <div className={styles.logoWrap} style={{ animation: swayAnimation }}>
        <div className={styles.logoFrame}>
          <Image
            src="/las-olas-logo.png"
            alt="Las Olas"
            width={2880}
            height={1620}
            priority
            draggable={false}
            className={styles.logoImage}
            style={{ filter: logoFilter, opacity: logoOpacity }}
          />
        </div>
      </div>

      <div className={styles.waveLayer} style={{ top: waveTop }}>
        <div className={styles.waveCrestRow} style={{ animation: "lasWave 9s linear infinite" }}>
          <WaveSvg fill="#FFE0E4" path={CREST_PATH} stroke="rgba(198,12,44,0.6)" strokeWidth={5} />
          <WaveSvg fill="#FFE0E4" path={CREST_PATH} stroke="rgba(198,12,44,0.6)" strokeWidth={5} />
        </div>
        <div className={styles.waveBodyA} />
      </div>

      <div className={styles.waveLayer} style={{ top: waveTop2 }}>
        <div className={styles.waveCrestRow} style={{ animation: "lasWave 15s linear infinite reverse" }}>
          <WaveSvg fill="#FFD1D7" fillOpacity={0.92} path={CREST_PATH_B} stroke="rgba(198,12,44,0.38)" strokeWidth={4} />
          <WaveSvg fill="#FFD1D7" fillOpacity={0.92} path={CREST_PATH_B} stroke="rgba(198,12,44,0.38)" strokeWidth={4} />
        </div>
        <div className={styles.waveBodyB} />
      </div>

      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className={styles.rippleAnchor}
          style={{ left: ripple.x, top: ripple.y }}
        >
          <div
            className={`${styles.ring} ${styles.ring1}`}
            style={{ animation: "lasRing 1.8s ease-out both" }}
          />
          <div
            className={`${styles.ring} ${styles.ring2}`}
            style={{ animation: "lasRing 1.8s ease-out 0.25s both" }}
          />
          <div
            className={`${styles.ring} ${styles.ring3}`}
            style={{ animation: "lasRing 1.8s ease-out 0.5s both" }}
          />
          <div className={styles.bloom} style={{ animation: "lasBloom 1.6s ease-out both" }} />
          {ripple.bubbles.map((bubble, i) => (
            <div
              key={i}
              className={styles.bubble}
              style={
                {
                  left: bubble.ox,
                  width: bubble.size,
                  height: bubble.size,
                  "--bx": bubble.drift,
                  animation: `lasBubble ${bubble.dur} ease-out ${bubble.delay} both`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}

      {isRevealed && (
        <div
          className={styles.revealPanel}
          style={{ animation: "lasRise 1.2s cubic-bezier(0.25,0.8,0.3,1) 0.6s both" }}
        >
          <div className={styles.kicker}>{dict.kicker}</div>
          <a
            href={PRESAVE_URL}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            className={styles.presaveButton}
          >
            {dict.presaveButton}
          </a>
          <button type="button" onClick={handleReplay} className={styles.replayButton}>
            {dict.replayButton}
          </button>
        </div>
      )}

      {!isRevealed && (
        <div className={styles.depthMeterWrap}>
          <div className={styles.depthMeterTrack}>
            <div className={styles.depthMeterFill} style={{ width: depthPct }} />
          </div>
        </div>
      )}

      <p className="visually-hidden" role="status">
        {isRevealed ? dict.revealedStatus : ""}
      </p>
    </div>
  );
}
