"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlay } from "react-icons/fa6";
import styles from "./VideoCardPlayer.module.css";

type VideoCardPlayerProps = {
  videoId: string;
  title: string;
};

export default function VideoCardPlayer({ videoId, title }: VideoCardPlayerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.frame}
        onClick={() => setOpen(true)}
        aria-label={`Play ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={`${title} video still`}
          className={styles.cover}
        />
        <span className={styles.playIcon} aria-hidden="true">
          <FaPlay />
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} video`}
          >
            <div className={styles.modalBody} onClick={(e) => e.stopPropagation()}>
              <button
                ref={closeRef}
                type="button"
                className={styles.modalClose}
                onClick={() => setOpen(false)}
                aria-label="Close video"
              >
                ×
              </button>
              <div className={styles.modalVideo}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={`${title} video`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
