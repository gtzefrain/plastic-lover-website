"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import styles from "./ShowRequestForm.module.css";

type ShowRequestFormProps = {
  locale?: Locale;
};

export default function ShowRequestForm({ locale = "en" }: ShowRequestFormProps) {
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dict = getDictionary(locale).pages.live;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/request-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, email }),
      });
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.headline}>{dict.requestHeadline}</h1>
      {!sent ? (
        <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor="show-request-city" className="visually-hidden">
            {dict.requestCityPlaceholder}
          </label>
          <input
            id="show-request-city"
            type="text"
            required
            placeholder={dict.requestCityPlaceholder}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.input}
          />
          <label htmlFor="show-request-email" className="visually-hidden">
            {dict.requestEmailPlaceholder}
          </label>
          <input
            id="show-request-email"
            type="email"
            required
            placeholder={dict.requestEmailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.submit}>
            {dict.requestSubmit}
          </button>
        </form>
      ) : (
        <div className={styles.sent} role="status">
          {dict.requestSent}
        </div>
      )}
      <div className={styles.footnote}>{dict.requestFootnote}</div>
    </div>
  );
}
