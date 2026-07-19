import { getServerLocale } from "@/lib/i18n/locale";
import Footer from "./Footer";
import SiteNav from "./SiteNav";
import styles from "./PageShell.module.css";

type PageShellProps = {
  screenLabel: string;
  kicker?: string;
  /** Set to "p" when a page already renders its own <h1> (e.g. lyrics detail). Defaults to "h1". */
  kickerAs?: "h1" | "p";
  maxWidth: number;
  children: React.ReactNode;
};

export default async function PageShell({
  screenLabel,
  kicker,
  kickerAs = "h1",
  maxWidth,
  children,
}: PageShellProps) {
  const locale = await getServerLocale();
  const Kicker = kickerAs;

  return (
    <div className={styles.page}>
      <SiteNav locale={locale} />
      <main
        id="main-content"
        data-screen-label={screenLabel}
        className={styles.content}
        style={{ maxWidth, animation: "plFadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both" }}
      >
        {kicker && <Kicker className={styles.kicker}>{kicker}</Kicker>}
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
