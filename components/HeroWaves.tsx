import WaveCrest, { CREST_PATH, CREST_PATH_B } from "@/components/WaveCrest";
import styles from "./HeroWaves.module.css";

// A quieter version of the settled /las-olas sea, sitting behind the home
// hero: same two crest silhouettes scrolling in opposite directions, but
// slowed down, washed out, and masked away toward the bottom of the section
// so it reads as background texture rather than the page's subject.
// Decorative only — the hero's meaning lives in the wordmark and <h1>.
//
// Six tiles per layer, not two: each is a fixed 1272px (see the CSS module),
// and `plHeroWave` slides the row a fixed 2544px, so the row has to stay wider
// than the viewport for the whole slide — six tiles covers windows to 5088px.
type HeroWavesProps = {
  /** Matches the rest of the hero entrance; "0s" when the animation is skipped. */
  entranceDelay?: string;
};

export default function HeroWaves({ entranceDelay = "0s" }: HeroWavesProps) {
  return (
    <div
      className={styles.waves}
      aria-hidden="true"
      style={{
        animation: "plFadeUp 1.6s cubic-bezier(0.2,0.8,0.2,1) forwards",
        animationDelay: entranceDelay,
      }}
    >
      <div className={`${styles.layer} ${styles.layerBack}`}>
        <div className={styles.crestRow} style={{ animation: "plHeroWave 42s linear infinite reverse" }}>
          <WaveCrest fill="#FFD1D7" fillOpacity={0.5} path={CREST_PATH_B} stroke="rgba(198,12,44,0.14)" strokeWidth={3} />
          <WaveCrest fill="#FFD1D7" fillOpacity={0.5} path={CREST_PATH_B} stroke="rgba(198,12,44,0.14)" strokeWidth={3} />
          <WaveCrest fill="#FFD1D7" fillOpacity={0.5} path={CREST_PATH_B} stroke="rgba(198,12,44,0.14)" strokeWidth={3} />
          <WaveCrest fill="#FFD1D7" fillOpacity={0.5} path={CREST_PATH_B} stroke="rgba(198,12,44,0.14)" strokeWidth={3} />
          <WaveCrest fill="#FFD1D7" fillOpacity={0.5} path={CREST_PATH_B} stroke="rgba(198,12,44,0.14)" strokeWidth={3} />
          <WaveCrest fill="#FFD1D7" fillOpacity={0.5} path={CREST_PATH_B} stroke="rgba(198,12,44,0.14)" strokeWidth={3} />
        </div>
        <div className={styles.bodyBack} />
      </div>

      <div className={`${styles.layer} ${styles.layerFront}`}>
        <div className={styles.crestRow} style={{ animation: "plHeroWave 26s linear infinite" }}>
          <WaveCrest fill="#FFE0E4" fillOpacity={0.85} path={CREST_PATH} stroke="rgba(198,12,44,0.2)" strokeWidth={3} />
          <WaveCrest fill="#FFE0E4" fillOpacity={0.85} path={CREST_PATH} stroke="rgba(198,12,44,0.2)" strokeWidth={3} />
          <WaveCrest fill="#FFE0E4" fillOpacity={0.85} path={CREST_PATH} stroke="rgba(198,12,44,0.2)" strokeWidth={3} />
          <WaveCrest fill="#FFE0E4" fillOpacity={0.85} path={CREST_PATH} stroke="rgba(198,12,44,0.2)" strokeWidth={3} />
          <WaveCrest fill="#FFE0E4" fillOpacity={0.85} path={CREST_PATH} stroke="rgba(198,12,44,0.2)" strokeWidth={3} />
          <WaveCrest fill="#FFE0E4" fillOpacity={0.85} path={CREST_PATH} stroke="rgba(198,12,44,0.2)" strokeWidth={3} />
        </div>
        <div className={styles.bodyFront} />
      </div>
    </div>
  );
}
