"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/dictionaries";
import styles from "./LanguagePreferenceForm.module.css";

type LanguagePreferenceFormProps = {
  uuid: string | null;
  // Listmonk's admin API only looks subscribers up by numeric id; the uuid is what
  // proves the link is really theirs. The campaign link carries both — see the route.
  subscriberId: string | null;
};

const OPTIONS: { locale: Locale; label: string; confirmed: string }[] = [
  { locale: "en", label: "English", confirmed: "Done — you'll now get the newsletter in English." },
  { locale: "es", label: "Español", confirmed: "Listo — ahora recibirás el boletín en español." },
];

type Status = "idle" | "saving" | "done" | "error";

export default function LanguagePreferenceForm({
  uuid,
  subscriberId,
}: LanguagePreferenceFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [chosen, setChosen] = useState<Locale | null>(null);
  const isLinkComplete = Boolean(uuid && subscriberId);

  const onChoose = async (locale: Locale) => {
    if (!isLinkComplete || status === "saving") return;
    setChosen(locale);
    setStatus("saving");
    try {
      const res = await fetch("/api/subscribe/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, id: subscriberId, locale }),
      });
      if (!res.ok) throw new Error("Update failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <h1 className={styles.headline}>
        Choose your newsletter language
        <br />
        <span lang="es">Elige el idioma de tu boletín</span>
      </h1>

      {!isLinkComplete ? (
        <>
          <p className={styles.message}>
            This link is missing information — please use the link from your newsletter email.
          </p>
          <p className={styles.message} lang="es">
            A este enlace le falta información — usa el enlace de tu correo del boletín.
          </p>
        </>
      ) : status === "done" && chosen ? (
        <div className={styles.message} role="status" lang={chosen}>
          {OPTIONS.find((option) => option.locale === chosen)?.confirmed}
        </div>
      ) : (
        <>
          <div className={styles.options}>
            {OPTIONS.map((option) => (
              <button
                key={option.locale}
                type="button"
                onClick={() => onChoose(option.locale)}
                disabled={status === "saving"}
                className={styles.option}
                lang={option.locale}
              >
                {option.label}
              </button>
            ))}
          </div>
          {status === "error" && (
            <div className={styles.error} role="alert">
              <p>Something went wrong. Please try again.</p>
              <p lang="es">Algo salió mal. Inténtalo de nuevo.</p>
            </div>
          )}
        </>
      )}

      <a href="/subscribe" className={styles.backLink}>
        ← plasticlover.mx
      </a>
    </>
  );
}
