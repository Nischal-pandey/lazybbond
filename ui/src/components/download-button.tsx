"use client";

import { ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";

type DownloadButtonProps = {
  className?: string;
};

const configuredPlayStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL;
const playStoreUrl = (() => {
  if (!configuredPlayStoreUrl) return null;

  try {
    const url = new URL(configuredPlayStoreUrl);
    const packageId = url.searchParams.get("id");
    if (
      url.protocol !== "https:"
      || url.hostname !== "play.google.com"
      || !url.pathname.startsWith("/store/apps/details")
      || !packageId
      || !/^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+$/.test(packageId)
    ) {
      return null;
    }

    return { webUrl: url.toString(), packageId };
  } catch {
    return null;
  }
})();

export function DownloadButton({ className = "" }: DownloadButtonProps) {
  function openPlayStore(event: MouseEvent<HTMLAnchorElement>) {
    if (!playStoreUrl || !/android/i.test(navigator.userAgent)) return;

    event.preventDefault();
    const fallbackUrl = encodeURIComponent(playStoreUrl.webUrl);
    const intentUrl =
      `intent://details?id=${playStoreUrl.packageId}` +
      `#Intent;scheme=market;package=com.android.vending;` +
      `S.browser_fallback_url=${fallbackUrl};end`;
    window.location.assign(intentUrl);
  }

  const content = (
    <>
      <svg className="play-mark" viewBox="0 0 32 36" aria-hidden="true">
        <path fill="#00A0FF" d="M2.4 1.8C1.5 2.4 1 3.4 1 4.8v26.4c0 1.4.5 2.4 1.4 3l15.1-16.2z" />
        <path fill="#00D26A" d="m2.4 34.2 18.3-10.6-4.9-5.6z" />
        <path fill="#FFCE00" d="m20.7 23.6 7.1-4.1c2.4-1.4 2.4-3.6 0-5l-7.1-4.1-5.1 5.9z" />
        <path fill="#F33A53" d="m2.4 1.8 18.3 10.6-4.9 5.6z" />
      </svg>
      <span className="play-label"><small>Get it on</small><b>Google Play</b></span>
      {playStoreUrl && <ArrowUpRight className="play-external" size={17} aria-hidden="true" />}
    </>
  );

  if (!playStoreUrl) {
    return (
      <button
        className={`download-button ${className} download-unavailable`}
        type="button"
        disabled
        title="The verified Google Play listing has not been configured yet."
      >
        {content}
      </button>
    );
  }

  return (
    <a
      className={`download-button ${className}`}
      href={playStoreUrl.webUrl}
      onClick={openPlayStore}
      aria-label="Get LazyBond on Google Play"
    >
      {content}
    </a>
  );
}
