"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALE_COOKIE, locales, type Locale } from "@/lib/i18n/dictionaries";
import styles from "./LanguageSelector.module.css";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type LanguageSelectorProps = {
  locale: Locale;
  label: string;
  className?: string;
};

export default function LanguageSelector({ locale, label, className }: LanguageSelectorProps) {
  const router = useRouter();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const appliedLocale = useRef<Locale | null>(null);

  useEffect(() => {
    if (!pendingLocale || appliedLocale.current === pendingLocale) return;
    appliedLocale.current = pendingLocale;
    document.cookie = `${LOCALE_COOKIE}=${pendingLocale}; path=/; max-age=${LOCALE_MAX_AGE}`;
    router.refresh();
  }, [pendingLocale, router]);

  return (
    <div className={`${styles.selector} ${className ?? ""}`} role="group" aria-label={label}>
      {locales.map((lc) => (
        <button
          key={lc}
          type="button"
          onClick={() => setPendingLocale(lc)}
          aria-pressed={lc === locale}
          className={`${styles.option} ${lc === locale ? styles.optionActive : ""}`}
        >
          {lc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
