"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LanguageSelector from "@/components/LanguageSelector";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { NAV_LINKS } from "@/lib/nav";
import styles from "./SiteNav.module.css";

type SiteNavProps = {
  entranceDelay?: string;
  locale?: Locale;
};

export default function SiteNav({ entranceDelay, locale = "en" }: SiteNavProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dict = getDictionary(locale);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;

    const burger = burgerRef.current;
    drawerCloseRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      burger?.focus();
    };
  }, [menuOpen]);

  return (
    <nav
      aria-label={dict.nav.primaryLabel}
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
          <ul className={styles.links}>
            {NAV_LINKS.map((lnk) => {
              const isActive = pathname === lnk.href;
              return (
                <li key={lnk.href}>
                  <Link
                    href={lnk.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                  >
                    {dict.nav[lnk.key]}
                  </Link>
                </li>
              );
            })}
            <li>
              <LanguageSelector locale={locale} label={dict.languageSelector.label} />
            </li>
          </ul>
        )}

        {isMobile && (
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={dict.nav.openMenu}
            aria-expanded={menuOpen}
            className={styles.burger}
          >
            <div className={styles.burgerBar} />
            <div className={styles.burgerBar} />
            <div className={styles.burgerBar} />
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={dict.nav.openMenu}>
          <div className={styles.drawerBar}>
            <span className={styles.wordmark}>PLASTIC&nbsp;LOVER</span>
            <button
              ref={drawerCloseRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={dict.nav.closeMenu}
              className={styles.drawerClose}
            >
              ✕
            </button>
          </div>
          <ul className={styles.drawerLinks}>
            {NAV_LINKS.map((lnk) => {
              const isActive = pathname === lnk.href;
              return (
                <li key={lnk.href}>
                  <Link
                    href={lnk.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ""}`}
                  >
                    {dict.nav[lnk.key]}
                  </Link>
                </li>
              );
            })}
            <li>
              <LanguageSelector
                locale={locale}
                label={dict.languageSelector.label}
                className={styles.drawerLangSelector}
              />
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
