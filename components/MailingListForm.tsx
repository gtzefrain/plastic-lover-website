"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import styles from "./MailingListForm.module.css";

type MailingListFormProps = {
  locale?: Locale;
  /** "h1" when this form is the primary heading of its page (e.g. /subscribe). Defaults to "h2". */
  headingLevel?: "h1" | "h2";
};

export default function MailingListForm({ locale = "en", headingLevel = "h2" }: MailingListFormProps) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dict = getDictionary(locale);
  const Headline = headingLevel;

  const onJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
    } finally {
      setSubmitting(false);
      setJoined(true);
    }
  };

  return (
    <>
      <p className={styles.kicker}>{dict.mailingList.kicker}</p>
      <Headline className={styles.headline}>{dict.mailingList.headline}</Headline>
      <div className={styles.formArea}>
        {!joined ? (
          <form onSubmit={onJoin} className={styles.form}>
            <label htmlFor="mailing-list-email" className="visually-hidden">
              {dict.mailingList.placeholder}
            </label>
            <input
              id="mailing-list-email"
              type="email"
              required
              placeholder={dict.mailingList.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.submit}>
              {dict.mailingList.submit}
            </button>
          </form>
        ) : (
          <div className={styles.joined} role="status">
            {dict.mailingList.joined}
          </div>
        )}
      </div>
      <div className={styles.footnote}>{dict.mailingList.footnote}</div>
    </>
  );
}
