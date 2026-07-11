import type { Metadata } from "next";
import Footer from "@/components/Footer";
import MailingListForm from "@/components/MailingListForm";
import SiteNav from "@/components/SiteNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Subscribe — Plastic Lover",
};

export default function SubscribePage() {
  return (
    <div className={styles.page}>
      <SiteNav />
      <div
        data-screen-label="Subscribe"
        className={styles.content}
        style={{ animation: "plFadeUp 0.7s cubic-bezier(0.2,0.8,0.2,1) both" }}
      >
        <MailingListForm />
      </div>
      <Footer />
    </div>
  );
}
