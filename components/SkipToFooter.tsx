"use client";

import { useEffect, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

type SkipToFooterProps = {
  locale: Locale;
};

/**
 * Skip link that jumps past the page body to the footer's social links / home link.
 *
 * Unlike the skip-to-content link in `app/layout.tsx`, this one can't be rendered
 * unconditionally: `Footer` is per-page, and several routes don't have one at all
 * (`/las-olas`, and `/releases/[slug]` + the press pages without `?site=1`). A skip link
 * pointing at an anchor that isn't on the page is worse than no skip link, so this removes
 * itself after mount when there's no footer to jump to.
 *
 * It starts out rendered rather than hidden-until-verified so that the common case (a page
 * that does have a footer) ships the link in the server HTML and it works on the very first
 * Tab, before hydration. The initial value matches on both sides, so there's no mismatch —
 * the effect only ever removes it, on the handful of footer-less routes.
 */
export default function SkipToFooter({ locale }: SkipToFooterProps) {
  const [hasFooter, setHasFooter] = useState(true);

  useEffect(() => {
    setHasFooter(document.getElementById("site-footer") !== null);
  }, []);

  if (!hasFooter) return null;

  return (
    <a href="#site-footer" className="skip-link">
      {getDictionary(locale).nav.skipToFooter}
    </a>
  );
}
