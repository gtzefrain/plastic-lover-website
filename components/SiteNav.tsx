"use client";

import Image from "next/image";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const dict = getDictionary(locale);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  // The desktop link row vs. the mobile burger button are both always in
  // the DOM and switched with a CSS media query (see .links/.burger in
  // SiteNav.module.css) rather than a JS matchMedia check — a JS-computed
  // isMobile flag defaults to "desktop" until React hydrates, so on a slow
  // connection the burger button (and thus any way to open the nav) simply
  // wouldn't appear for as long as hydration was still pending. This effect
  // now only has to close the drawer if the viewport crosses back over the
  // breakpoint while it's open.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const closeOnDesktop = () => {
      if (!mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
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
          <Image
            src="/logo/logo-mini.png"
            alt="Plastic Lover"
            width={20}
            height={28}
            className={styles.logoMini}
            priority
            fetchPriority="high"
          />
        </Link>

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
      </div>

      {menuOpen && (
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={dict.nav.openMenu}>
          <div className={styles.drawerBar}>
            <span className={styles.wordmark}>
              <Image src="/logo/logo-mini.png" alt="Plastic Lover" width={20} height={28} className={styles.logoMini} />
            </span>
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
