import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, ArrowUp, Menu, X, Pause, Play, Github, Linkedin } from "lucide-react";
import { CinematicWorld } from "./CinematicWorld";
import "./cinematic-portfolio.css";

const chapters = [
  { id: "hero", name: "The introduction", short: "Home" },
  { id: "about", name: "Behind the code", short: "About" },
  { id: "projects", name: "Selected work", short: "Work" },
  { id: "experience", name: "The practice", short: "Experience" },
  { id: "contact", name: "What comes next", short: "Contact" },
];
const projects = [
  { name: "Cashlio", category: "MOBILE APPLICATION", description: "A clearer view of everyday finances. Track transactions across profiles, explore summaries, and export reports.", stack: "Angular · Ionic · SQLite", href: "https://github.com/ML-CoderX/Cashlio", type: "finance", live: "" },
  { name: "DocuAI", category: "MACHINE LEARNING", description: "A clinical support prototype exploring how symptoms and patient data can inform disease predictions.", stack: "Python · Scikit-learn · Gemini", href: "https://github.com/subhankalgond/hackprix20", type: "health", live: "" },
  { name: "IPL Win Predictor", category: "PREDICTIVE ANALYTICS", description: "Turning match statistics into probabilities with a machine learning model and an interactive interface.", stack: "Python · Pandas · Streamlit", href: "https://github.com/ML-CoderX/IPL_win_predictor", live: "https://ipl-win-predictor-2tp0.onrender.com", type: "sport" },
  { name: "Laptop Price Predictor", category: "APPLIED DATA SCIENCE", description: "From hardware specifications to price estimates. Exploring real-world data with regression models.", stack: "Python · Scikit-learn · Streamlit", href: "https://github.com/ML-CoderX/Laptop-price-predictor", live: "https://laptop-price-predictor-v64x.onrender.com/", type: "price" },
];

export default function CinematicPortfolio() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(query.matches);
    change(); query.addEventListener("change", change);
    return () => { query.removeEventListener("change", change); clearTimeout(copyTimer.current); };
  }, []);
  useEffect(() => {
    const sections = chapters.map(c => document.getElementById(c.id)!);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    root.current!.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    let raf = 0;
    let smooth = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      smooth += (y - smooth) * 0.075;
      progress.current = y / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      root.current?.style.setProperty("--progress", String(progress.current));
      root.current?.style.setProperty("--travel", String(paused || reduced ? 0 : smooth / innerHeight));
      let current = 0;
      sections.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.5) current = i; });
      setActive(prev => prev === current ? prev : current);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    const move = (e: PointerEvent) => {
      pointer.current = { x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 };
      if (!paused && !reduced) {
        root.current?.style.setProperty("--mx", `${pointer.current.x * 24}px`);
        root.current?.style.setProperty("--my", `${pointer.current.y * 16}px`);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(raf); observer.disconnect(); window.removeEventListener("pointermove", move); };
  }, [paused, reduced]);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("rsaadt3@gmail.com");
      setCopied(true); clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch { window.location.href = "mailto:rsaadt3@gmail.com"; }
  };
  return <div ref={root} className={`portfolio-film ${paused || reduced ? "motion-paused" : ""}`}>
    <a className="skip-link" href="#about">Skip introduction</a>
    <div className="film-world" aria-hidden="true"><div className="mountain-plate"/><CinematicWorld progress={progress} pointer={pointer} paused={paused || reduced}/><div className="film-shade"/><div className="film-grain"/></div>
    <header className="film-header">
      <a href="#hero" className="film-brand" aria-label="Saad AR home"><img className="brand-logo" src="/logo.png" alt="ML-CoderX" width={64} height={64}/><span>SAAD AR<small>DEVELOPER & CREATIVE THINKER</small></span></a>
      <nav className="desktop-nav" aria-label="Main navigation">{chapters.slice(1).map((c, i) => <a className={active === i + 1 ? "current" : ""} href={`#${c.id}`} key={c.id}>{c.short}<span>0{i + 1}</span></a>)}<a href="/Saad_Resume.pdf" target="_blank" rel="noopener noreferrer">Resume <ArrowUpRight size={14}/></a></nav>
      <button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-navigation" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu(!menu)}>{menu ? <X size={22}/> : <Menu size={22}/>}</button>
    </header>
    {menu && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{chapters.map((c, i) => <a key={c.id} href={`#${c.id}`} onClick={() => setMenu(false)}><span>0{i}</span>{c.short}<ArrowUpRight size={22}/></a>)}<a href="/Saad_Resume.pdf" target="_blank" rel="noopener noreferrer" onClick={() => setMenu(false)}>Resume <ArrowUpRight size={22}/></a></nav>}
    <nav className="chapter-rail" aria-label="Chapter navigation">{chapters.map((c, i) => <a href={`#${c.id}`} key={c.id} aria-label={c.name} aria-current={active === i ? "location" : undefined}><span>{c.name}</span><i/></a>)}</nav>
    <main>
      <section id="hero" className="film-hero">
        <div className="hero-wordmark" aria-hidden="true">SAAD AR</div>
        <div className="hero-copy"><p className="eyebrow"><span className="accent-dash"/> SAAD AR — AI, WEB & MOBILE DEVELOPER</p><h1>Intelligence,<br/>built with <em>intention.</em></h1><p className="hero-description">I’m Saad AR. I turn ideas into thoughtful digital products<br className="desktop-break"/> through machine learning, web, and mobile development.</p><div className="hero-actions"><a href="#projects" className="text-link">Explore my work <ArrowUpRight size={18}/></a></div></div>
        <div className="hero-object" aria-hidden="true"><div className="object-orbit"/><img src="/cinematic/optimized/AI-compute-node.webp" alt="" className="compute-object"/><div className="object-caption"><span className="status-dot"/> AT THE INTERSECTION OF CODE & CURIOSITY</div></div>
        <div className="hero-bottom"><a href="#about" className="scroll-cue"><ArrowDown size={18}/><span>SCROLL TO DISCOVER</span></a><p>AI / ML &nbsp; · &nbsp; FULL-STACK &nbsp; · &nbsp; MOBILE</p><span className="edition">PORTFOLIO — 2026</span></div>
      </section>
      <section id="about" className="film-section about-section">
        <div className="section-label reveal"><span>01 — BEHIND THE CODE</span><span>A LITTLE CONTEXT</span></div>
        <div className="about-layout"><div className="reveal"><h2>Curiosity is<br/>where it <em>starts.</em></h2><div className="portrait-frame"><img src="/images/avatar.png" alt="Saad AR" loading="lazy"/><span>SAAD AR<br/><small>DEVELOPER · STUDENT · BUILDER</small></span></div></div><div className="about-copy reveal"><p className="lead">Technology means more when it solves something real.</p><p>I’m a Computer Science student and developer, building at the intersection of intelligent systems and everyday experiences.</p><p>My work spans machine learning, full-stack applications, and mobile products. I care about the details that make software useful: a clear interface, reliable logic, and a thoughtful experience.</p><p>Healthcare, productivity, education — I’m drawn to problems where a small idea can make a meaningful difference.</p><a href="#experience" className="text-link">The story so far <ArrowUpRight size={18}/></a></div></div>
        <div className="discipline-strip reveal"><div><span>01</span><h3>Intelligent systems</h3><p>AI & machine learning</p></div><div><span>02</span><h3>Digital experiences</h3><p>Web & mobile applications</p></div><div><span>03</span><h3>Connected ideas</h3><p>Hardware & IoT</p></div></div>
      </section>
      <section id="projects" className="film-section work-section">
        <div className="section-label reveal"><span>02 — SELECTED WORK</span><span>IDEAS, MADE REAL</span></div>
        <div className="section-intro reveal"><h2>A few things<br/>I’ve <em>built.</em></h2><p>Experiments in intelligence.<br/>Applications for everyday life.<br/>Each one, a step forward.</p></div>
        <div className="project-grid">{projects.map((p, i) => <article className={`project-card reveal project-${p.type}`} key={p.name}>
          <a href={p.href} target="_blank" rel="noreferrer" className="project-visual" aria-label={`View ${p.name} source on GitHub`}><span className="project-index">0{i + 1}</span><span className="visual-caption">{p.category}</span><div className={`project-art art-${p.type}`} aria-hidden="true">{p.type === "finance" ? <><div className="finance-symbol">c<span>↗</span></div><div className="art-bars">{[34,58,42,76,65,95,84].map((h,j)=><i key={j} style={{height:`${h}%`}}/>)}</div></> : p.type === "health" ? <><div className="health-orbit"/><span className="health-cross">+</span><span className="signal-line"/></> : p.type === "sport" ? <><div className="sport-ring"/><span className="sport-number">WIN<span>PROBABILITY</span></span></> : <><div className="laptop-shape"><span>predict<span>_</span></span></div><div className="laptop-base"/></>}</div><span className="project-open"><ArrowUpRight size={22}/></span></a>
          <div className="project-info"><div><h3><a href={p.href} target="_blank" rel="noreferrer">{p.name}</a></h3><span>{p.stack}</span></div>{p.live && <a className="live-link" href={p.live} target="_blank" rel="noreferrer">Live <ArrowUpRight size={14}/></a>}<p>{p.description}</p></div>
        </article>)}</div><a href="https://github.com/ML-CoderX" target="_blank" rel="noreferrer" className="text-link reveal">More on GitHub <Github size={17}/></a>
      </section>
      <section id="experience" className="film-section practice-section">
        <div className="section-label reveal"><span>03 — THE PRACTICE</span><span>ALWAYS LEARNING</span></div>
        <div className="practice-layout"><div className="practice-heading reveal"><h2>Good work.<br/>Deeper <em>roots.</em></h2><p>Learning by building.<br/>Growing through every challenge.</p></div><div className="timeline reveal"><div className="timeline-row"><span className="eyebrow">EXPERIENCE / FEB 2025 — APR 2026</span><h3>Machine Learning Intern</h3><h4>MY JOB GROW</h4><p>Hands-on training in machine learning algorithms, data analysis, and development workflows. Applied new knowledge through practical, on-the-job projects.</p></div><div className="timeline-row"><span className="eyebrow">EDUCATION / 2024 — 2028 · PURSUING</span><h3>B.Tech, Computer Science</h3><p>Anjuman Institute of Technology and Management, Bhatkal</p></div><div className="timeline-row"><span className="eyebrow">FOUNDATIONS / 2022 — 2024</span><h3>Pre-University · PCMC</h3><p>Green Valley International School and Junior College, Shiroor</p></div></div></div>
        <div className="toolbox reveal"><p className="eyebrow">THE TOOLKIT</p>{[{title:"AI & Data",items:"Python / Scikit-learn / Pandas / NumPy"},{title:"Web & Mobile",items:"Angular / Ionic / JavaScript / HTML / CSS"},{title:"Backend & Database",items:"Node.js / Express / REST APIs / MySQL / PostgreSQL"},{title:"Hardware & Workflow",items:"Arduino / Sensors / Bluetooth / Git / GitHub"}].map((s,i)=><div className="tool-row" key={s.title}><span>0{i+1}</span><h3>{s.title}</h3><p>{s.items}</p><ArrowUpRight size={18}/></div>)}</div>
      </section>
      <section id="contact" className="film-section contact-section"><p className="eyebrow reveal"><span className="accent-dash"/> CHAPTER 04 — WHAT COMES NEXT</p><h2 className="reveal">Let’s make<br/>something <em>matter.</em></h2><p className="reveal">Have an idea, an opportunity, or a good question?<br/>I’d love to hear it.</p><div className="contact-actions reveal"><a href="mailto:rsaadt3@gmail.com" className="contact-email">rsaadt3@gmail.com <ArrowUpRight/></a><button onClick={copyEmail} aria-live="polite">{copied ? "Copied!" : "Copy email"}</button></div><div className="social-links reveal"><a href="https://github.com/ML-CoderX" target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={14}/></a><a href="https://www.linkedin.com/in/saad-beary/" target="_blank" rel="noreferrer"><Linkedin size={17}/> LinkedIn <ArrowUpRight size={14}/></a><a href="https://wa.me/919972603508" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={14}/></a></div></section>
    </main>
    <footer className="film-footer"><a href="#hero" className="footer-name">SAAD AR<span>© {new Date().getFullYear()}</span></a><p>BUILT WITH CURIOSITY. REFINED WITH CARE.</p><a href="#hero">BACK TO TOP <ArrowUp size={15}/></a></footer>
    <div className="film-status"><span>0{active} <i/> 04</span><button onClick={()=>setPaused(!paused)} aria-label={paused ? "Resume motion" : "Pause motion"} aria-pressed={paused} disabled={reduced}>{paused || reduced ? <Play size={12}/> : <Pause size={12}/>}<span>{reduced ? "REDUCED MOTION" : paused ? "MOTION PAUSED" : "MOTION ON"}</span></button></div><div className="reading-progress" aria-hidden="true"/>
  </div>;
}

