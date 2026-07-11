import Footer from "./Footer";
import SiteNav from "./SiteNav";
import styles from "./PageShell.module.css";

type PageShellProps = {
  screenLabel: string;
  kicker: string;
  maxWidth: number;
  children: React.ReactNode;
};

export default function PageShell({ screenLabel, kicker, maxWidth, children }: PageShellProps) {
  return (
    <div className={styles.page}>
      <SiteNav />
      <div
        data-screen-label={screenLabel}
        className={styles.content}
        style={{ maxWidth, animation: "plFadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both" }}
      >
        <div className={styles.kicker}>{kicker}</div>
        {children}
      </div>
      <Footer />
    </div>
  );
}
