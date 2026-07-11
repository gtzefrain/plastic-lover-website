"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import HeroLogo from "@/components/HeroLogo";
import MailingListForm from "@/components/MailingListForm";
import PhotoCollage from "@/components/PhotoCollage";
import ScrollArrow from "@/components/ScrollArrow";
import SiteNav from "@/components/SiteNav";
import { CTA_DELAY, NAV_DELAY, TAGLINE_DELAY } from "@/lib/heroChoreography";
import styles from "./page.module.css";

export default function Home() {
  const [run, setRun] = useState(0);

  return (
    <div className={styles.page}>
      <SiteNav entranceDelay={NAV_DELAY} />

      <div data-screen-label="Hero" className={styles.hero}>
        <div className={styles.heroInner}>
          <HeroLogo runKey={run} />

          <div
            className={styles.tagline}
            style={{
              animation: `plFadeUp 0.8s cubic-bezier(0.2,0.8,0.2,1) forwards`,
              animationDelay: TAGLINE_DELAY,
            }}
          >
            <div className={styles.taglineText}>New single melting soon. Get it first.</div>
          </div>

          <div
            className={styles.ctaWrap}
            style={{
              animation: `plPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards`,
              animationDelay: CTA_DELAY,
            }}
          >
            <Button href="/subscribe">LISTEN NOW</Button>
          </div>
        </div>

        <ScrollArrow targetId="pl-release" label="Scroll to latest release" fadeDelay={CTA_DELAY} />
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

      <Footer onReplay={() => setRun((r) => r + 1)} entranceDelay={CTA_DELAY} />
    </div>
  );
}
