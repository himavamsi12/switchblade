"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const JourneyStar3D = dynamic(
  () => import("@/components/home/JourneyStar3D").then((m) => m.JourneyStar3D),
  { ssr: false, loading: () => null }
);

type Mode = "wire" | "classic" | "chrome";
const PHASES: { key: string; label: string; mode: Mode; copy: string }[] = [
  { key: "cosmos", label: "/COSMOS", mode: "wire",
    copy: "The birth phase. This is where the brand comes to life — the first products, the first mark made on the world. Everything is being learned & built from the ground up, with nothing but philosophy and conviction as the foundation." },
  { key: "classic", label: "/CLASSIC", mode: "classic",
    copy: "The defining phase. The mark finds its discipline — refined, weighted and intentional. Years of craft distill the idea into a form that feels permanent and unmistakably its own." },
  { key: "evolution", label: "/EVOLUTION", mode: "chrome",
    copy: "The present phase. Precision meets restraint — the definitive Switchblade star. Balanced, confident and quietly understated, ready for everything that comes next." },
];

const N = PHASES.length;
const RX = 30, RY = 9, CY = 62;     
const SPACING = 1.3;                
const FRONT_FRAC = 0.5;             
const ASPECT = 1.4;

const SIL = "M50 10 L56 48.3 L85.1 54.9 L56 61.5 L50 130 L44 61.5 L14.9 54.9 L44 48.3 Z";

export function LogoOrbit() {
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cur = useRef({ v: 0 });
  const lastActive = useRef(-1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tween = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gsapRef = useRef<any>(null);

  const sizeMarks = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const baseH = FRONT_FRAC * stage.clientHeight;
    const baseW = baseH / ASPECT;
    wrapRefs.current.forEach((w) => { if (w) { w.style.width = baseW + "px"; w.style.height = baseH + "px"; } });
  };

  const render = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const SW = stage.clientWidth, SH = stage.clientHeight;
    const baseH = FRONT_FRAC * SH, baseW = baseH / ASPECT;
    const current = cur.current.v;
    let active = 0, best = -2;

    for (let i = 0; i < N; i++) {
      const theta = (i - current) * SPACING;
      const s = Math.sin(theta), c = Math.cos(theta);
      const px = SW * (50 + RX * s) / 100;
      const py = SH * (CY + RY * c) / 100;
      const k = (c + 1) / 2;
      const scale = 0.3 + 0.7 * Math.pow(k, 2.2);
      const op = 0.06 + 0.94 * Math.pow(k, 1.5);
      const z = Math.round((c + 1) * 500);

      const wrap = wrapRefs.current[i];
      if (wrap) {
        wrap.style.transform = `translate(${px - baseW / 2}px, ${py - baseH}px) scale(${scale})`;
        wrap.style.opacity = String(op);
        wrap.style.zIndex = String(z);
      }
      const dot = dotRefs.current[i];
      if (dot) {
        dot.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%)`;
        dot.style.opacity = String(Math.max(0.15, op));
      }
      if (c > best) { best = c; active = i; }
    }

    if (active !== lastActive.current) {
      lastActive.current = active;
      tabRefs.current.forEach((t, j) => {
        if (!t) return;
        const on = j === active;
        t.style.background = on ? "#0A1AFF" : "transparent";
        t.style.color = on ? "#FFFFFF" : "#0D0D0D";
        t.style.borderColor = on ? "#0A1AFF" : "rgba(13,13,13,0.25)";
      });
      const a = active;
      if (descRef.current) descRef.current.style.opacity = "0";
      setTimeout(() => { if (descRef.current) { descRef.current.textContent = PHASES[a].copy; descRef.current.style.opacity = "1"; } }, 130);
    }
  };

  const goTo = (i: number) => {
    const gsap = gsapRef.current;
    if (!gsap) { cur.current.v = i; render(); return; }
    tween.current?.kill();
    tween.current = gsap.to(cur.current, { v: i, duration: 1.05, ease: "power3.inOut", onUpdate: render });
  };

  useEffect(() => {
    let killed = false;
    const onResize = () => { sizeMarks(); render(); };
    (async () => {
      const { gsap } = await import("gsap");
      if (killed) return;
      gsapRef.current = gsap;
      sizeMarks(); render();
      window.addEventListener("resize", onResize);
    })();
    return () => { killed = true; tween.current?.kill(); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: "680px", background: "#ffffff", borderTop: "1px solid rgba(13,13,13,0.1)", overflow: "hidden" }}>
      <div className="site-px" style={{ position: "absolute", top: "clamp(28px,3.4vw,52px)", left: 0, zIndex: 30 }}>
        <div style={{ display: "inline-flex", alignItems: "stretch", gap: "10px", background: "#0A1AFF", borderRadius: "20px", padding: "12px", width: "fit-content" }}>
          <svg viewBox="0 0 100 140" style={{ width: "clamp(50px,4.4vw,70px)", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="badge-chrome" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.5" stopColor="#C8D6EC" /><stop offset="1" stopColor="#8298BC" />
              </linearGradient>
            </defs>
            <path d={SIL} fill="url(#badge-chrome)" />
          </svg>
          <div style={{ background: "#fff", borderRadius: "12px", width: "clamp(150px,16vw,240px)" }} />
        </div>
      </div>

      <div className="site-px" style={{ position: "absolute", top: "clamp(30px,3.6vw,54px)", right: 0, zIndex: 30, display: "flex", gap: "10px" }}>
        {PHASES.map((p, i) => (
          <button
            key={p.key}
            ref={(el) => { tabRefs.current[i] = el; }}
            onMouseEnter={() => goTo(i)}
            onClick={() => goTo(i)}
            style={{
              fontFamily: "var(--font-ibm-mono)", fontSize: "clamp(11px,0.9vw,14px)", fontWeight: 700, letterSpacing: "0.04em",
              padding: "8px 16px", borderRadius: "999px", cursor: "pointer", whiteSpace: "nowrap",
              background: i === 0 ? "#0A1AFF" : "transparent", color: i === 0 ? "#fff" : "#0D0D0D",
              border: `1px solid ${i === 0 ? "#0A1AFF" : "rgba(13,13,13,0.25)"}`, transition: "background 0.3s ease, color 0.3s ease, border-color 0.3s ease",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div ref={stageRef} style={{ position: "absolute", inset: 0 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs>
            <linearGradient id="orbit-ring" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0D0D0D" stopOpacity="0" />
              <stop offset="0.5" stopColor="#0D0D0D" stopOpacity="0.3" />
              <stop offset="1" stopColor="#0D0D0D" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy={CY} rx={RX} ry={RY} fill="none" stroke="url(#orbit-ring)" strokeWidth="0.14" vectorEffect="non-scaling-stroke" />
        </svg>

        <div style={{ position: "absolute", left: "50%", top: `${CY + RY}%`, transform: "translate(-50%,-50%)", width: "26px", height: "26px", borderRadius: "999px", border: "2px solid rgba(13,13,13,0.3)", background: "#fff", zIndex: 6 }} />

        {PHASES.map((p, i) => (
          <div key={"dot-" + p.key} ref={(el) => { dotRefs.current[i] = el; }} style={{ position: "absolute", top: 0, left: 0, width: "10px", height: "10px", borderRadius: "999px", border: "1.5px solid rgba(13,13,13,0.38)", background: "#fff", zIndex: 5, willChange: "transform,opacity" }} />
        ))}

        {PHASES.map((p, i) => (
          <div key={p.key} ref={(el) => { wrapRefs.current[i] = el; }} style={{ position: "absolute", top: 0, left: 0, transformOrigin: "50% 100%", opacity: 0, willChange: "transform,opacity", pointerEvents: "none" }}>
            <JourneyStar3D mode={p.mode} align="ground" speed={0.5} className="w-full h-full" />
          </div>
        ))}
      </div>

      <div className="site-px" style={{ position: "absolute", bottom: "clamp(36px,5vw,72px)", left: 0, zIndex: 20 }}>
        <h2 style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(40px,5.4vw,88px)", lineHeight: 0.9, letterSpacing: "-0.02em", color: "#0D0D0D" }}>
          The Brand<br />Journey
        </h2>
      </div>

      <div className="site-px" style={{ position: "absolute", bottom: "clamp(40px,5.4vw,80px)", right: 0, zIndex: 20, display: "flex", justifyContent: "flex-end" }}>
        <p ref={descRef} style={{ maxWidth: "min(46vw,560px)", fontFamily: "var(--font-barlow)", fontSize: "clamp(14px,1.2vw,19px)", fontWeight: 500, lineHeight: 1.55, color: "#0D0D0D", transition: "opacity 0.25s ease" }}>
          {PHASES[0].copy}
        </p>
      </div>
    </section>
  );
}
