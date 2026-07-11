import type { CSSProperties } from "react";
import { d, HERO_FLOATING, HERO_SPEED, LETTERS } from "@/lib/heroChoreography";
import styles from "./HeroLogo.module.css";

type HeroLogoProps = {
  runKey: number;
};

export default function HeroLogo({ runKey }: HeroLogoProps) {
  const floatAnim = HERO_FLOATING
    ? `, plFloat ${5 / HERO_SPEED}s ease-in-out ${1.5 / HERO_SPEED}s infinite`
    : "";

  return (
    <div key={`run-${runKey}`} className={styles.wrap}>
      <div
        className={styles.stack}
        style={{
          animation: HERO_FLOATING
            ? `plFloat ${5 / HERO_SPEED}s ease-in-out ${2.6 / HERO_SPEED}s infinite`
            : "none",
        }}
      >
        {LETTERS.map(([src, dx, dy, rot], i) => (
          <div
            key={src}
            className={styles.letter}
            style={
              {
                backgroundImage: `url(/logo/${src})`,
                "--dx": `${dx}vw`,
                "--dy": `${dy}vh`,
                "--rot": `${rot}deg`,
                animation: `plBlob ${1.6 / HERO_SPEED}s cubic-bezier(0.25,0.8,0.3,1) both`,
                animationDelay: d(0.12 * i),
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div
        className={styles.shadow}
        style={{
          animation: `plMeltShadow ${2.2 / HERO_SPEED}s ease both${floatAnim}`,
        }}
      />
    </div>
  );
}
