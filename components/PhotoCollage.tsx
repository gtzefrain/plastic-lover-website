import type { CSSProperties } from "react";
import Image from "next/image";
import { buildLoopedPhotos } from "@/lib/photoSets";
import styles from "./PhotoCollage.module.css";
import ScrollArrow from "./ScrollArrow";

type PhotoCollageProps = {
  scrollTargetId: string;
};

export default function PhotoCollage({ scrollTargetId }: PhotoCollageProps) {
  const photos = buildLoopedPhotos();

  return (
    <div id="pl-photos" data-screen-label="Photos" className={styles.section}>
      <div className={styles.labelRow}>
        <span className={styles.label}>PLASTIC MOMENTS</span>
      </div>

      {photos.map((p, i) => (
        <div
          key={i}
          className={p.posInSet % 4 === 3 ? `${styles.frame} ${styles.frameAlt}` : styles.frame}
          style={{
            top: p.top,
            left: p.left,
            zIndex: p.z,
            animation: p.anim,
            animationDelay: p.delay,
            ["--frame-w" as string]: p.w,
            ["--frame-h" as string]: p.h,
            ["--frame-ratio" as string]: p.ratio,
            ["--frame-left" as string]: p.left,
          } as CSSProperties}
        >
          <Image
            src={p.src}
            alt={p.label}
            fill
            sizes="(max-width: 640px) 60vw, 26vw"
            className={styles.frameImage}
            preload={i === 0}
          />
          <span className={styles.frameLabel}>{p.label}</span>
        </div>
      ))}

      <ScrollArrow targetId={scrollTargetId} label="Scroll to mailing list" onWhite />
    </div>
  );
}
