import React, { useEffect, useRef, useState } from "react";
import { createBackgroundScene, BackgroundSceneController } from "./backgroundScene";

export function PortfolioBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<BackgroundSceneController | null>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    try {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Initialize custom Three.js environment
    const controller = createBackgroundScene({
      canvas,
      reducedMotion,
    });
    controllerRef.current = controller;

    // Track sections for scroll waypoint interpolation
    const sectionIds = [
      "hero",
      "about",
      "education",
      "experience",
      "projects",
      "skills",
      "contact",
    ];

    const getScrollData = () => {
      const docEl = document.documentElement;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight);
      const scrollProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

      // Find currently active section
      let activeIndex = 0;
      const windowMid = scrollY + window.innerHeight * 0.4;
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (windowMid >= top) {
            activeIndex = i;
          }
        }
      }

      return { scrollProgress, activeIndex };
    };

    const handleScroll = () => {
      if (!controllerRef.current) return;
      const { scrollProgress, activeIndex } = getScrollData();
      controllerRef.current.updateScroll(scrollProgress, activeIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call
    handleScroll();

    // Mouse movement interaction (desktop only)
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDevice || !controllerRef.current) return;
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = -(e.clientY / window.innerHeight - 0.5) * 2;
      controllerRef.current.updatePointer(normX, normY);
    };

    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // Resize handling
    const handleResize = () => {
      if (!controllerRef.current) return;
      controllerRef.current.resize(window.innerWidth, window.innerHeight);
      handleScroll();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (!isTouchDevice) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("resize", handleResize);

      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{
            background: "#030508",
          }}
        />
      ) : (
        /* Graceful CSS animated atmospheric fallback */
        <div className="absolute inset-0 w-full h-full bg-[#030508] bg-gradient-to-b from-[#060c18] via-[#03060d] to-[#020306] animate-pulse" />
      )}

      {/* Layer 2: Vignette Depth Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 35%, rgba(2, 4, 8, 0.65) 75%, #020407 100%)",
        }}
      />

      {/* Layer 3: Subtle Noise Grain Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

export default PortfolioBackground;
