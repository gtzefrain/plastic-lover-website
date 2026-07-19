"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import styles from "./Footer.module.css";

type FooterProps = {
  onReplay?: () => void;
  entranceDelay?: string;
  locale?: Locale;
};

export default function Footer({ onReplay, entranceDelay, locale = "en" }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer
      className={entranceDelay ? `${styles.footer} ${styles.footerEntrance}` : styles.footer}
      style={
        entranceDelay
          ? { animation: "plFadeUp 0.8s ease forwards", animationDelay: entranceDelay }
          : undefined
      }
    >
      <ul className={styles.socials}>
        <li>
          <a
            href="https://www.facebook.com/myplasticlover"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={styles.socialLink}
          >
            <FaFacebookF size={18} />
          </a>
        </li>
        <li>
          <a
            href="https://www.tiktok.com/@myplasticlover"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className={styles.socialLink}
          >
            <FaTiktok size={18} />
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/myplasticlover"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={styles.socialLink}
          >
            <FaInstagram size={20} />
          </a>
        </li>
        <li>
          <a
            href="https://www.youtube.com/@myplasticlover"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className={styles.socialLink}
          >
            <FaYoutube size={22} />
          </a>
        </li>
      </ul>

      <div className={styles.right}>
        {onReplay ? (
          <button type="button" onClick={onReplay} className={styles.rightLink}>
            {dict.footer.replay}
          </button>
        ) : (
          <Link href="/" className={styles.rightLink}>
            {dict.footer.home}
          </Link>
        )}
      </div>
    </footer>
  );
}
