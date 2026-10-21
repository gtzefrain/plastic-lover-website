import styles from "./WaveCrest.module.css";

// The wave silhouettes from the /las-olas scene, shared with the home hero's
// background so both seas keep the same shape. Each path is drawn as one full
// period across the 1440-wide viewBox, which is what lets two side-by-side
// copies inside a 200%-wide row scroll seamlessly under the `lasWave`
// keyframe (it translates the row by exactly -50%).
export const CREST_PATH =
  "M0,192C120,150 240,150 360,192C480,234 600,234 720,192C840,150 960,150 1080,192C1200,234 1320,234 1440,192";
export const CREST_PATH_B =
  "M0,224C120,264 240,264 360,224C480,184 600,184 720,224C840,264 960,264 1080,224C1200,184 1320,184 1440,224";

type WaveCrestProps = {
  fill: string;
  fillOpacity?: number;
  path: string;
  stroke: string;
  strokeWidth: number;
};

export default function WaveCrest({ fill, fillOpacity, path, stroke, strokeWidth }: WaveCrestProps) {
  return (
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className={styles.waveSvg}>
      <path fill={fill} fillOpacity={fillOpacity} d={`${path}L1440,320L0,320Z`} />
      <path fill="none" stroke={stroke} strokeWidth={strokeWidth} d={path} />
    </svg>
  );
}
