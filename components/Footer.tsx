"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
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
      <div className={styles.socials}>
        <a href="#" aria-label="Facebook" className={styles.socialLink}>
          <FaFacebookF size={18} />
        </a>
        <a href="#" aria-label="TikTok" className={styles.socialLink}>
          <FaTiktok size={18} />
        </a>
        <a href="#" aria-label="Instagram" className={styles.socialLink}>
          <FaInstagram size={20} />
        </a>
        <a href="#" aria-label="YouTube" className={styles.socialLink}>
          <FaYoutube size={22} />
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
