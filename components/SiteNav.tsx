"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/nav";
import styles from "./SiteNav.module.css";

type SiteNavProps = {
  entranceDelay?: string;
};

export default function SiteNav({ entranceDelay }: SiteNavProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMenuOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      className={styles.nav}
      style={
        entranceDelay
          ? { opacity: 0, animation: "plFadeIn 0.7s ease forwards", animationDelay: entranceDelay }
          : undefined
      }
    >
      <div className={styles.bar}>
        <Link href="/" className={styles.wordmark}>
          PLASTIC&nbsp;LOVER
        </Link>

        {!isMobile && (
          <div className={styles.links}>
            {NAV_LINKS.map((lnk) => {
              const isActive = pathname === lnk.href;
              return (
                <Link
                  key={lnk.href}
                  href={lnk.href}
                  className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                >
                  {lnk.label}
                </Link>
              );
            })}
          </div>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className={styles.burger}
          >
            <div className={styles.burgerBar} />
            <div className={styles.burgerBar} />
            <div className={styles.burgerBar} />
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerBar}>
            <span className={styles.wordmark}>PLASTIC&nbsp;LOVER</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className={styles.drawerClose}
            >
              ✕
            </button>
          </div>
          <div className={styles.drawerLinks}>
            {NAV_LINKS.map((lnk) => {
              const isActive = pathname === lnk.href;
              return (
                <Link
                  key={lnk.href}
                  href={lnk.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ""}`}
                >
                  {lnk.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
