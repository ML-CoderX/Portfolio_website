import { useEffect, useRef, useState } from "react";
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
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (!isTouchDevice) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);

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
        />
      ) : (
        <div className="cinematic-fallback absolute inset-0 w-full h-full" />
      )}

      <div className="cinematic-vignette absolute inset-0 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: "url('/images/paper-texture.png')",
          backgroundSize: "360px 360px",
        }}
      />
    </div>
  );
}

export default PortfolioBackground;
