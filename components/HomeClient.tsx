"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import HeroLogo from "@/components/HeroLogo";
import MailingListForm from "@/components/MailingListForm";
import PhotoCollage from "@/components/PhotoCollage";
import ScrollArrow from "@/components/ScrollArrow";
import SiteNav from "@/components/SiteNav";
import { CTA_DELAY, NAV_DELAY, TAGLINE_DELAY } from "@/lib/heroChoreography";
import styles from "@/app/page.module.css";

const HERO_SEEN_COOKIE = "pl_hero_seen";
const HERO_SEEN_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type HomeClientProps = {
  heroSeen: boolean;
};

export default function HomeClient({ heroSeen }: HomeClientProps) {
  const [run, setRun] = useState(0);
  const [heroPlaying, setHeroPlaying] = useState(!heroSeen);

  useEffect(() => {
    if (!heroSeen) {
      document.cookie = `${HERO_SEEN_COOKIE}=1; path=/; max-age=${HERO_SEEN_MAX_AGE}`;
    }
  }, [heroSeen]);

  const navDelay = heroPlaying ? NAV_DELAY : "0s";
  const taglineDelay = heroPlaying ? TAGLINE_DELAY : "0s";
  const ctaDelay = heroPlaying ? CTA_DELAY : "0s";

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setHeroPlaying(true);
    setRun((r) => r + 1);
  };

  return (
    <div className={styles.page}>
      <SiteNav key={`nav-${run}`} entranceDelay={navDelay} />

      <div data-screen-label="Hero" className={styles.hero}>
        <div className={styles.heroInner}>
          <HeroLogo runKey={run} skipEntrance={!heroPlaying} />

          <div
            key={`tagline-${run}`}
            className={styles.tagline}
            style={{
              animation: `plFadeUp 0.8s cubic-bezier(0.2,0.8,0.2,1) forwards`,
              animationDelay: taglineDelay,
            }}
          >
            <div className={styles.taglineText}>New single melting soon. Get it first.</div>
          </div>

          <div
            key={`cta-${run}`}
            className={styles.ctaWrap}
            style={{
              animation: `plPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards`,
              animationDelay: ctaDelay,
            }}
          >
            <Button href="/subscribe">LISTEN NOW</Button>
          </div>
        </div>

        <ScrollArrow
          key={`arrow-${run}`}
          targetId="pl-release"
          label="Scroll to latest release"
          fadeDelay={ctaDelay}
        />
      </div>

      <div data-screen-label="Latest Release" id="pl-release" className={styles.release}>
        <div className={styles.releaseGrid}>
          <div className={styles.videoFrame}>
            <iframe
              src="https://www.youtube.com/embed/jNQXAC9IVRw"
              title="Latest release video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className={styles.releaseCopy}>
            <div className={styles.kicker}>LATEST RELEASE</div>
            <div className={styles.releaseHeadline}>Plastic Lover — the new single, out now.</div>
            <div className={styles.releaseBody}>
              Watch the official video, then take it with you — streaming on every platform.
            </div>
            <Button href="/releases">STREAM EVERYWHERE</Button>
          </div>
        </div>

        <ScrollArrow targetId="pl-photos" label="Scroll to photos" onWhite />
      </div>

      <PhotoCollage scrollTargetId="pl-join" />

      <div data-screen-label="Mailing List" id="pl-join" className={styles.join}>
        <MailingListForm />
      </div>

      <Footer key={`footer-${run}`} onReplay={handleReplay} entranceDelay={ctaDelay} />
    </div>
  );
}
