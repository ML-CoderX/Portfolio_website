import { useEffect, useState, type ReactNode } from "react";
import "./opening-loader.css";

/** A bounded introduction: slow or failed assets never block the portfolio. */
export default function OpeningLoader({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let minimumElapsed = motion.matches;
    let loaded = document.readyState === "complete";
    const finish = () => { if (minimumElapsed && loaded) setLeaving(true); };
    const onLoad = () => { loaded = true; finish(); };
    const minimum = window.setTimeout(() => { minimumElapsed = true; finish(); }, 1400);
    const deadline = window.setTimeout(() => setLeaving(true), 4500);
    window.addEventListener("load", onLoad);
    finish();
    return () => {
      clearTimeout(minimum);
      clearTimeout(deadline);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [visible]);

  return <>
    {visible && <div className={`opening-loader${leaving ? " is-leaving" : ""}`}>
      <div className="opening-orbit" aria-hidden="true" />
      <div className="opening-content" role="status" aria-live="polite">
        <p className="opening-kicker">CODE. CURIOSITY. POSSIBILITY.</p>
        <p className="opening-name" aria-label="Saad AR"><span>SAAD</span> <em>AR</em></p>
        <div className="opening-track" aria-hidden="true"><span /></div>
        <p className="opening-caption">Opening my world<span aria-hidden="true">…</span></p>
      </div>
      <button className="opening-skip" onClick={() => setVisible(false)}>Skip intro ↗</button>
      <span className="opening-edition" aria-hidden="true">PORTFOLIO / {new Date().getFullYear()}</span>
    </div>}
    <div ref={node => { if (node) node.inert = visible; }} aria-hidden={visible || undefined}>{children}</div>
  </>;
}
