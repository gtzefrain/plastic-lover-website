"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlay } from "react-icons/fa6";
import styles from "./ReleasePlayer.module.css";

type ReleasePlayerProps = {
  cover: string;
  title: string;
  videoId: string;
};

export default function ReleasePlayer({ cover, title, videoId }: ReleasePlayerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className={styles.frame} onClick={() => setOpen(true)} aria-label={`Play ${title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={`${title} cover art`} className={styles.cover} />
        <span className={styles.playIcon} aria-hidden="true">
          <FaPlay />
        </span>
      </button>

      {open &&
        createPortal(
          <div className={styles.modalBackdrop} onClick={() => setOpen(false)}>
            <div className={styles.modalBody} onClick={(e) => e.stopPropagation()}>
              <button
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
