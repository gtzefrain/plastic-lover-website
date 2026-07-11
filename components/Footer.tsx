"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

type FooterProps = {
  onReplay?: () => void;
  entranceDelay?: string;
};

export default function Footer({ onReplay, entranceDelay }: FooterProps) {
  return (
    <div
      className={entranceDelay ? `${styles.footer} ${styles.footerEntrance}` : styles.footer}
      style={
        entranceDelay
          ? { animation: "plFadeUp 0.8s ease forwards", animationDelay: entranceDelay }
          : undefined
      }
    >
      <div className={styles.imprint}>
        <a href="#" className={styles.imprintLink}>
          IMPRINT &amp; PRIVACY
        </a>
      </div>

      <div className={styles.socials}>
        <a href="#" aria-label="Facebook" className={styles.socialLink}>
          <span className={styles.facebookGlyph}>f</span>
        </a>
        <a href="#" aria-label="TikTok" className={styles.socialLink}>
          <span className={styles.tiktokGlyph}>♪</span>
        </a>
        <a href="#" aria-label="Instagram" className={styles.socialLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="17.6" cy="6.4" r="1.4" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a href="#" aria-label="YouTube" className={styles.socialLink}>
          <svg width="22" height="20" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1.5" y="5" width="23" height="14" rx="4" />
            <path d="M11 9.5 L16.5 12 L11 14.5 Z" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </div>

      <div className={styles.right}>
        {onReplay ? (
          <button type="button" onClick={onReplay} className={styles.rightLink}>
            ↻ REPLAY
          </button>
        ) : (
          <Link href="/" className={styles.rightLink}>
            ← HOME
          </Link>
        )}
      </div>
    </div>
  );
}
