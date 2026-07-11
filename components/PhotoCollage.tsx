import type { CSSProperties } from "react";
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
          className={styles.frame}
          style={{
            top: p.top,
            left: p.left,
            width: p.w,
            height: p.h,
            zIndex: p.z,
            animation: p.anim,
            animationDelay: p.delay,
            ["--frame-ratio" as string]: p.ratio,
          } as CSSProperties}
        >
          <span className={styles.frameLabel}>{p.label}</span>
        </div>
      ))}

      <ScrollArrow targetId={scrollTargetId} label="Scroll to mailing list" onWhite />
    </div>
  );
}
