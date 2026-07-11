"use client";

import { useState } from "react";
import styles from "./MailingListForm.module.css";

export default function MailingListForm() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setSubmitting(false);
      setJoined(true);
    }
  };

  return (
    <>
      <div className={styles.kicker}>MAILING LIST</div>
      <div className={styles.headline}>
        New singles, tour dates and secret shows. Straight to your inbox, nothing else.
      </div>
      <div className={styles.formArea}>
        {!joined ? (
          <form onSubmit={onJoin} className={styles.form}>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.submit}>
              JOIN THE LIST
            </button>
          </form>
        ) : (
          <div className={styles.joined}>YOU&apos;RE ON THE LIST. STAY PLASTIC.</div>
        )}
      </div>
      <div className={styles.footnote}>NO SPAM. UNSUBSCRIBE ANYTIME.</div>
    </>
  );
}
