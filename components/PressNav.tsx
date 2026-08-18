import Image from "next/image";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import styles from "./PressNav.module.css";

type PressNavProps = {
  locale: Locale;
  /** Match the max-width of the page's own <main> so the bar lines up with the content below it. */
  maxWidth: number;
};

export default function PressNav({ locale, maxWidth }: PressNavProps) {
  const dict = getDictionary(locale);

  return (
    <nav aria-label={dict.nav.primaryLabel} className={styles.nav} style={{ maxWidth }}>
      <Link href="/" className={styles.wordmark}>
        <Image src="/logo/logo-mini.png" alt="Plastic Lover" width={20} height={28} className={styles.logoMini} />
      </Link>
      <LanguageSelector locale={locale} label={dict.languageSelector.label} />
    </nav>
  );
}
