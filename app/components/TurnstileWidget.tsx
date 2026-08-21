"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ onToken, resetNonce = 0 }: { onToken: (token: string) => void; resetNonce?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const widgetIdRef = useRef<string | null>(null);
  const previousResetNonceRef = useRef(resetNonce);
  const id = useId();

  const tryRender = () => {
    if (renderedRef.current) return;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !window.turnstile || !containerRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onToken,
      "error-callback": () => onToken(""),
      "expired-callback": () => onToken(""),
      "timeout-callback": () => onToken(""),
    });
    renderedRef.current = true;
  };

  useEffect(() => {
    tryRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousResetNonceRef.current === resetNonce) return;
    previousResetNonceRef.current = resetNonce;
    onToken("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [onToken, resetNonce]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={tryRender}
      />
      <div ref={containerRef} id={`turnstile-${id}`} />
    </>
  );
}
