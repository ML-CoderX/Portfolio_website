import { useRef, useEffect } from "react";

interface KageLandingPageProps {
  /** Override the source URL — defaults to the local packaged document */
  sourceUrl?: string;
  /** Optional ARIA label for the frame */
  title?: string;
  /** If true, runs Kage purely as an ambient 3D background behind content */
  backgroundOnly?: boolean;
  className?: string;
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
  sourceUrl,
  title = "Kage — Where stillness reveals the unseen",
  backgroundOnly = false,
  className,
}: KageLandingPageProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const resolvedUrl =
    sourceUrl ??
    (backgroundOnly
      ? "/landing-pages/kage.html?bg=1"
      : "/landing-pages/kage.html");

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
      src={resolvedUrl}
      title={title}
      className={className}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-top-navigation-by-user-activation"
      loading={backgroundOnly ? "eager" : "lazy"}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: "none",
        outline: "none",
        background: "#05070a",
        pointerEvents: backgroundOnly ? "none" : "auto",
      }}
      aria-hidden={backgroundOnly ? "true" : undefined}
      aria-label={backgroundOnly ? undefined : title}
    />
  );
}
