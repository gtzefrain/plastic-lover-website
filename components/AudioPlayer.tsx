"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FaPause, FaPlay } from "react-icons/fa6";
import styles from "./AudioPlayer.module.css";

type AudioPlayerProps = {
  src: string;
  title: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended", onEnded);
    // Metadata can load (and the event fire) before this effect subscribes —
    // e.g. on localhost the audio tag is in the initial HTML and the browser
    // starts fetching it before React finishes hydrating. Catch that case.
    if (audio.readyState >= audio.HAVE_METADATA) onDuration();
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const clamped = Math.min(Math.max(time, 0), duration);
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  // Safari's native range input only seeks on thumb drag, not on a click
  // elsewhere on the track — compute the position from the pointer directly
  // so click-to-seek works the same across browsers.
  const handlePointerDown = (e: ReactPointerEvent<HTMLInputElement>) => {
    const bar = seekBarRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    seekTo(ratio * duration);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.player}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className={styles.playButton}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
      >
        {playing ? <FaPause /> : <FaPlay />}
      </button>

      <div className={styles.trackInfo}>
        <div className={styles.seekRow}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <input
            ref={seekBarRef}
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            onPointerDown={handlePointerDown}
            className={styles.seekBar}
            style={{ "--progress": `${progress}%` } as CSSProperties}
            aria-label="Seek"
          />
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
