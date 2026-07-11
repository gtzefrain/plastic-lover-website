import {
  HERO_DROP_DURATION,
  HERO_ENTER_EASE,
  HERO_FLOATING,
  HERO_SPEED,
} from "@/lib/heroChoreography";
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
        className={styles.logo}
        style={{
          animation: `plMelt ${HERO_DROP_DURATION} ${HERO_ENTER_EASE} both${floatAnim}`,
        }}
      />
      <div
        className={styles.shadow}
        style={{
          animation: `plMeltShadow ${HERO_DROP_DURATION} ${HERO_ENTER_EASE} both${floatAnim}`,
        }}
      />
    </div>
  );
}
