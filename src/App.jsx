import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./components/Scene";
import { MinimapOverlay } from "./components/Minimap";
import { MODELS } from "./models";

gsap.registerPlugin(ScrollTrigger);

/* ── helpers ── */
function splitWords(text) {
  return text.split(" ").map((w, i) => (
    <span className="word" key={i}>{w}&nbsp;</span>
  ));
}
function splitChars(text) {
  return text.split("").map((c, i) =>
    c === " "
      ? <span className="space" key={i}>&nbsp;</span>
      : <span className="char" key={i}>{c}</span>
  );
}

function LoadingOverlay({ visible }) {
  return (
    <div className={`loading-overlay ${visible ? "" : "hidden"}`}>
      <div className="loading-bar-track"><div className="loading-bar-fill" /></div>
      <div className="loading-text">Loading scene...</div>
    </div>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const progressRef = useRef(null);

  const selectedModel = MODELS.find((m) => m.id === selectedId);
  const focusModel = selectedModel || null;

  const handleSelect = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const takeScreenshot = useCallback(() => {
    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), 400);
    setTimeout(() => {
      const c = document.querySelector("canvas");
      if (!c) return;
      const a = document.createElement("a");
      a.download = `scene-${Date.now()}.png`;
      a.href = c.toDataURL("image/png");
      a.click();
    }, 100);
  }, []);

  /* ══════════════════════════════════════
     GSAP SCROLL ANIMATIONS
     ══════════════════════════════════════ */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* progress bar */
      ScrollTrigger.create({
        trigger: "body", start: "top top", end: "bottom bottom",
        onUpdate: (s) => {
          if (progressRef.current) progressRef.current.style.width = `${s.progress * 100}%`;
        },
      });

      /* Hero — word reveal */
      gsap.to(".hero-section .word", {
        y: 0, opacity: 1, duration: 1.2,
        stagger: 0.08, ease: "power4.out", delay: 0.5,
      });
      gsap.to(".hero-sub", {
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 1.2,
      });

      /* Hero parallax out */
      gsap.to(".hero-section", {
        yPercent: -40, opacity: 0, ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1 },
      });
      gsap.to(".hero-swirl", {
        rotation: 50, scale: 1.4, ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 2 },
      });

      /* Halo */
      gsap.to(".halo", {
        opacity: 1, scale: 1.3, rotation: 90, ease: "none",
        scrollTrigger: { trigger: ".dark-transition", start: "top center", end: "bottom center", scrub: 2 },
      });

      /* Exploding text */
      const eWords = document.querySelectorAll(".explode-word");
      gsap.to(eWords, {
        opacity: 1, stagger: 0.04,
        scrollTrigger: { trigger: ".explode-section", start: "top bottom", end: "top 30%", scrub: 1 },
      });

      const dirs = [
        { x: -140, y: -90, scale: 5, rotation: -10 },
        { x: 70, y: -160, scale: 6, rotation: 6 },
        { x: -20, y: -50, scale: 4, rotation: -4 },
        { x: 160, y: -30, scale: 7, rotation: 12 },
        { x: -200, y: 40, scale: 5, rotation: -14 },
        { x: 50, y: 90, scale: 6, rotation: 7 },
        { x: -110, y: 130, scale: 5, rotation: -8 },
        { x: 130, y: 70, scale: 4, rotation: 5 },
        { x: -70, y: -120, scale: 8, rotation: -6 },
        { x: 90, y: 150, scale: 5, rotation: 9 },
        { x: -50, y: -80, scale: 6, rotation: -3 },
        { x: 180, y: 20, scale: 4, rotation: 11 },
      ];
      eWords.forEach((w, i) => {
        const d = dirs[i % dirs.length];
        gsap.to(w, {
          xPercent: d.x, yPercent: d.y, scale: d.scale,
          rotation: d.rotation, opacity: 0, ease: "power2.in",
          scrollTrigger: { trigger: ".explode-section", start: "25% top", end: "85% top", scrub: 1.5 },
        });
      });

      /* Parallax stack */
      document.querySelectorAll(".parallax-line").forEach((line, i) => {
        gsap.fromTo(line,
          { x: i % 2 === 0 ? -250 : 250 },
          { x: i % 2 === 0 ? 350 : -350, ease: "none",
            scrollTrigger: { trigger: ".parallax-section", start: "top bottom", end: "bottom top", scrub: 1 },
          }
        );
      });

      /* Char reveal */
      const chars = document.querySelectorAll(".reveal-text .char");
      ScrollTrigger.create({
        trigger: ".reveal-section", start: "top 60%", end: "bottom 40%",
        onUpdate: (s) => {
          const n = Math.floor(s.progress * chars.length);
          chars.forEach((c, i) => c.classList.toggle("active", i < n));
        },
      });

      /* Horizontal scroll */
      const track = document.querySelector(".horizontal-track");
      if (track) {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 100),
          ease: "none",
          scrollTrigger: {
            trigger: ".horizontal-section", start: "top top",
            end: () => `+=${track.scrollWidth}`, scrub: 1, pin: true,
          },
        });
      }

      /* Outro */
      gsap.to(".outro-title .word", {
        y: 0, rotateX: 0, opacity: 1, duration: 0.8,
        stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".outro", start: "top 70%", toggleActions: "play none none reverse" },
      });
      gsap.to(".outro-cta", {
        y: 0, opacity: 1, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".outro", start: "top 50%", toggleActions: "play none none reverse" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Fixed layers ── */}
      <div className="progress-bar" ref={progressRef} />
      <LoadingOverlay visible={!loaded} />
      {flashVisible && <div className="screenshot-flash" />}

      {/* ── Fixed 3D canvas (behind everything) ── */}
      <Canvas
        camera={{ position: [5, 3, 7], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
        onCreated={() => setTimeout(() => setLoaded(true), 2000)}
      >
        <color attach="background" args={[nightMode ? "#040410" : "#06080c"]} />
        <Suspense fallback={null}>
          <Scene
            selectedId={selectedId}
            onSelect={handleSelect}
            nightMode={nightMode}
            dragEnabled={dragEnabled}
            focusModel={focusModel}
          />
        </Suspense>
      </Canvas>

      {/* ── Fixed UI overlays ── */}
      <nav className="nav">
        <div className="nav-logo">YAK<span className="accent-dot">.</span></div>
        <div className="nav-links">
          <button className={`nav-btn pill ${dragEnabled ? "active" : ""}`} onClick={() => setDragEnabled(v => !v)}>
            {dragEnabled ? "✦ Drag ON" : "⊹ Drag"}
          </button>
          <button className={`nav-btn pill warm ${nightMode ? "active" : ""}`} onClick={() => setNightMode(v => !v)}>
            {nightMode ? "☽ Night" : "☀ Day"}
          </button>
          <button className="nav-btn pill accent" onClick={takeScreenshot}>⎙ Capture</button>
        </div>
      </nav>

      {selectedModel && (
        <div className="info-card" key={selectedModel.id}>
          <h3>{selectedModel.label}</h3>
          <p>{selectedModel.description}</p>
          <span className="info-tag">{selectedModel.tag}</span>
        </div>
      )}
      <MinimapOverlay models={MODELS} />

      <div className="model-bar">
        {MODELS.map((m) => (
          <button key={m.id} className={`model-btn ${selectedId === m.id ? "active" : ""}`}
            onClick={() => handleSelect(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          SCROLL CONTENT (overlays on canvas)
          ══════════════════════════════════════ */}
      <div className="scroll-content">

        {/* 1 — Hero */}
        <section className="hero-section">
          <div className="hero-swirl">
            <svg viewBox="0 0 600 800" fill="none">
              <path d="M300 -50 C500 100,100 300,350 450 S150 600,300 850"
                stroke="rgba(77,232,204,0.25)" strokeWidth="80" strokeLinecap="round" fill="none" />
              <path d="M450 -100 C200 150,550 350,250 500 S400 700,350 900"
                stroke="rgba(77,232,204,0.12)" strokeWidth="55" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="hero-content">
            <div className="hero-line">{splitWords("Explore Worlds")}</div>
            <div className="hero-line">{splitWords("Uniquely Crafted")}</div>
            <div className="hero-line">{splitWords("In Real-Time")}</div>
            <p className="hero-sub">
              Interactive 3D scenes with drag, orbit, day/night cycles,
              and cinematic scroll-driven animations.
            </p>
          </div>
          <div className="scroll-arrow">
            <span>↓</span>
            <span className="scroll-arrow-text">Scroll to explore</span>
          </div>
        </section>

        {/* 2 — Dark transition + halo */}
        <section className="dark-transition">
          <div className="halo" />
        </section>

        {/* 3 — Exploding text */}
        <section className="explode-section">
          <div className="explode-sticky">
            <div className="explode-text">
              <div>
                <span className="explode-word">STEP</span>{" "}
                <span className="explode-word">INTO</span>{" "}
                <span className="explode-word">A</span>{" "}
                <span className="explode-word">NEW</span>{" "}
                <span className="explode-word">WORLD</span>
              </div>
              <div>
                <span className="explode-word">AND</span>{" "}
                <span className="explode-word">LET</span>{" "}
                <span className="explode-word">YOUR</span>
              </div>
              <div>
                <span className="explode-word">IMAGINATION</span>{" "}
                <span className="explode-word">RUN</span>{" "}
                <span className="explode-word">WILD</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 — Parallax word stack */}
        <section className="parallax-section">
          <div className="parallax-sticky">
            <div className="parallax-line">INTERACTIVE</div>
            <div className="parallax-line">REAL-TIME</div>
            <div className="parallax-line">THREE.JS</div>
            <div className="parallax-line">IMMERSIVE</div>
            <div className="parallax-line">CREATIVE</div>
          </div>
        </section>

        {/* 5 — Char reveal */}
        <section className="reveal-section">
          <div className="reveal-text">
            {splitChars("We craft immersive digital experiences that push the boundaries of what's possible — blending design, motion, and technology into something extraordinary.")}
          </div>
        </section>

        {/* 6 — Horizontal scroll */}
        <section className="horizontal-section">
          <div className="horizontal-sticky">
            <div className="horizontal-track">
              <div className="horizontal-item">WEBGL</div>
              <div className="horizontal-item">REACT</div>
              <div className="horizontal-item">FIBER</div>
              <div className="horizontal-item">GSAP</div>
              <div className="horizontal-item">SHADERS</div>
              <div className="horizontal-item">MOTION</div>
              <div className="horizontal-item">FUTURE</div>
            </div>
          </div>
        </section>

        {/* 7 — Outro */}
        <section className="outro">
          <h2 className="outro-title">
            {splitWords("Ready to build something extraordinary?")}
          </h2>
          <button className="outro-cta">Start Exploring →</button>
        </section>
      </div>
    </>
  );
}
