import { useRef, useEffect } from "react";

interface KageLandingPageProps {
  /** Override the source URL — defaults to the local packaged document */
  sourceUrl?: string;
  /** Optional ARIA label for the frame */
  title?: string;
}

/**
 * KageLandingPage
 *
 * Lazy-loads the complete Kage HTML document inside a full-size iframe.
 * The frame retains all authored scripts, forms, popups, same-origin
 * resources, and pointer / keyboard / scroll interactions.
 *
 * The host component is intentionally thin: the renderer, animations,
 * and asset lifecycle all live inside the iframe document where they
 * were authored, and nothing from the React graph enters the frame.
 */
export function KageLandingPage({
  sourceUrl = "/landing-pages/kage.html",
  title = "Kage — Where stillness reveals the unseen",
}: KageLandingPageProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  /* Relay document visibility into the iframe so the Three.js RAF loop
     honours tab-hidden state exactly as the original page does. */
  useEffect(() => {
    const relay = () => {
      try {
        const doc = frameRef.current?.contentDocument;
        if (!doc) return;
        doc.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
      } catch {
        /* cross-origin guard — should not occur on same-origin asset */
      }
    };
    document.addEventListener("visibilitychange", relay);
    return () => document.removeEventListener("visibilitychange", relay);
  }, []);

  return (
    <iframe
      ref={frameRef}
      src={sourceUrl}
      title={title}
      /*
       * allow-scripts       — Three.js runtime and all authored JS
       * allow-same-origin   — canvas texture uploads, font fetch, local asset XHR
       * allow-forms         — any form inside the page
       * allow-popups        — any <a target="_blank"> inside the page
       * allow-pointer-lock  — authored pointer-lock on cursor
       * allow-top-navigation-by-user-activation — internal hash-nav links
       */
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-top-navigation-by-user-activation"
      loading="lazy"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: "none",
        outline: "none",
        background: "#05070a",
      }}
      aria-label={title}
    />
  );
}
