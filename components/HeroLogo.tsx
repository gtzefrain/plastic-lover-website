import type { CSSProperties } from "react";
import { d, HERO_FLOATING, HERO_SPEED, LETTERS } from "@/lib/heroChoreography";
import styles from "./HeroLogo.module.css";

type HeroLogoProps = {
  runKey: number;
  skipEntrance?: boolean;
};

export default function HeroLogo({ runKey, skipEntrance = false }: HeroLogoProps) {
  const floatDelay = skipEntrance ? "0s" : d(1.5);
  const floatKeyframe = HERO_FLOATING
    ? `plFloat ${5 / HERO_SPEED}s ease-in-out ${floatDelay} infinite`
    : null;

  return (
    <div key={`run-${runKey}`} className={styles.wrap} aria-hidden="true">
      <div
        className={styles.stack}
        style={{
          animation: HERO_FLOATING
            ? `plFloat ${5 / HERO_SPEED}s ease-in-out ${skipEntrance ? "0s" : d(2.6)} infinite`
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
                animation: skipEntrance
                  ? "none"
                  : `plBlob ${1.6 / HERO_SPEED}s cubic-bezier(0.25,0.8,0.3,1) both`,
                animationDelay: skipEntrance ? undefined : d(0.12 * i),
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div
        className={styles.shadow}
        style={
          skipEntrance
            ? {
                transform: "scaleX(1)",
                opacity: 0.45,
                animation: floatKeyframe ?? "none",
              }
            : {
                animation: [`plMeltShadow ${2.2 / HERO_SPEED}s ease both`, floatKeyframe]
                  .filter(Boolean)
                  .join(", "),
              }
        }
      />
    </div>
  );
}
