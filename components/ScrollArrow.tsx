"use client";

import styles from "./ScrollArrow.module.css";

type ScrollArrowProps = {
  targetId: string;
  label: string;
  onWhite?: boolean;
  fadeDelay?: string;
};

export default function ScrollArrow({ targetId, label, onWhite, fadeDelay }: ScrollArrowProps) {
  const scrollToTarget = () => {
    const el = document.getElementById(targetId);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const wrapClass = onWhite
    ? `${styles.wrap} ${styles.wrapSolid}`
    : `${styles.wrap} ${styles.wrapHero}`;

  return (
    <div
      className={wrapClass}
      style={
        !onWhite
          ? { animation: "plFadeIn 0.8s ease forwards", animationDelay: fadeDelay }
          : undefined
      }
    >
      <button
        type="button"
        onClick={scrollToTarget}
        aria-label={label}
        className={`${styles.circle} ${onWhite ? styles.circleSolid : ""}`}
        style={{ animation: "plArrowBob 2.2s ease-in-out infinite" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9 L12 17 L20 9" />
        </svg>
      </button>
    </div>
  );
}
