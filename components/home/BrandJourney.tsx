"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SweepText } from "@/components/shared/SweepText";

const JourneyStar3D = dynamic(
  () => import("@/components/home/JourneyStar3D").then((m) => m.JourneyStar3D),
  { ssr: false, loading: () => null }
);

type Mode3D = "wire" | "classic" | "chrome";

const PHASES: { key: string; num: string; label: string; mode: Mode3D; lead: string; rest: string }[] = [
  {
    key: "cosmos", num: "01", label: "COSMOS", mode: "wire",
    lead: "The birth phase.",
    rest: " This is where the brand comes to life — the first products, the first mark made on the world. Everything is being learned & built from the ground up, with nothing but philosophy and conviction as the foundation.",
  },
  {
    key: "classics", num: "02", label: "CLASSIC", mode: "classic",
    lead: "The defining phase.",
    rest: " The mark finds its discipline — refined, weighted and intentional. Years of craft distill the idea into a form that feels permanent and unmistakably its own.",
  },
  {
    key: "evolution", num: "03", label: "EVOLUTION", mode: "chrome",
    lead: "The present phase.",
    rest: " Precision meets restraint — the definitive Switchblade star. Balanced, confident and quietly understated, ready for everything that comes next.",
  },
];

const N = PHASES.length;

function CornerBrackets() {
  const style: React.CSSProperties = { position: "absolute", width: 16, height: 16, background: "#0456DD" };
  return (
    <>
      <span style={{ ...style, top: -1, left: -1, borderTopLeftRadius: 12 }} />
      <span style={{ ...style, top: -1, right: -1, borderTopRightRadius: 12 }} />
      <span style={{ ...style, bottom: -1, left: -1, borderBottomLeftRadius: 12 }} />
      <span style={{ ...style, bottom: -1, right: -1, borderBottomRightRadius: 12 }} />
    </>
  );
}

export function BrandJourney() {
  const [active, setActive] = useState(0);
  const phase = PHASES[active];

  // Safety net for GlbModel's async /estar.glb load resolving after a fresh canvas's first
  // size measurement (each phase's model canvas remounts on every role change, since it's keyed
  // by phase inside the crossfade below). The canvas slots themselves are fixed-size and never
  // transformed, so this no longer needs to dodge a slide transition — just catches a possibly
  // late GLB load.
  useEffect(() => {
    const delays = [100, 400];
    const timers = delays.map((d) => window.setTimeout(() => window.dispatchEvent(new Event("resize")), d));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active]);

  const goPrev = () => setActive((a) => Math.max(0, a - 1));
  const goNext = () => setActive((a) => Math.min(N - 1, a + 1));


  return (
    <section className="site-px" style={{
      background: "#ffffff", padding: "clamp(16px,4vw,32px)",
      height: "100dvh", boxSizing: "border-box", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div className="flex items-start justify-between" style={{ flex: "0 0 auto" }}>
        <h2 style={{
          fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(30px,4.5vw,68px)",
          lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase",
        }}>
          <SweepText tone="dark" color="#0D0D0D">
            The Brand<br />Journey
          </SweepText>
        </h2>
        <AnimatePresence mode="wait">
          <motion.span
            key={phase.num}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-barlow)", fontWeight: 800, fontSize: "clamp(40px,7vw,110px)",
              lineHeight: 1, letterSpacing: "-0.02em", color: "#D6D6D6", flexShrink: 0,
            }}
          >
            {phase.num}
          </motion.span>
        </AnimatePresence>
      </div>

      <div style={{ position: "relative", flex: "1 1 auto", minHeight: 0 }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(13,13,13,0.12)" }} />

        <div style={{ position: "relative", height: "100%" }}>
          {PHASES.map((p, i) => {
            const offset = i - active;
            const role = offset === 0 ? "active" : offset === 1 ? "next" : offset === -1 ? "previous" : "hidden";
            const isActive = role === "active";
            const onRightSide = offset > 0;
            // The card CHROME (border/background/badge) slides via `transform: scale()` — a
            // compositor-only property, so this animates smoothly regardless of how many cards
            // are moving at once. The 3D canvases are handled separately below (see comment
            // there) because they can't live inside a scaled ancestor without breaking.
            const CARD_W = "clamp(220px,26vw,380px)";
            const SIDE_SCALE = 0.53; // ~ clamp(120px,14vw,200px) / clamp(220px,26vw,380px)
            const gap = "calc(clamp(110px,13vw,190px) + clamp(64px,8vw,130px))";
            const shift = `calc(${gap} + (${CARD_W} * ${SIDE_SCALE}) / 2)`;
            const sideTransform = `translate(-50%,-50%) translateX(${onRightSide ? shift : `calc(-1 * (${shift}))`}) scale(${SIDE_SCALE})`;
            return (
              <div
                key={p.key}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: isActive ? "translate(-50%,-50%)" : sideTransform,
                  width: CARD_W,
                  maxHeight: "100%",
                  aspectRatio: "364/452",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#EDEDED 0%,#F6F6F6 45%,#FBFBFB 100%)",
                  border: isActive ? "1px solid rgba(13,13,13,0.1)" : "1px solid rgba(13,13,13,0.08)",
                  opacity: role === "hidden" ? 0 : 1,
                  pointerEvents: role === "hidden" ? "none" : undefined,
                  transition: "opacity 0.45s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
                  zIndex: isActive ? 1 : 0,
                }}
              >
                {isActive && <CornerBrackets />}

                <span style={{ position: "absolute", top: "50%", left: -5, width: 10, height: 10, borderRadius: 3, transform: "translateY(-50%)", background: isActive ? "#0D0D0D" : "#C7C7C7" }} />
                <span style={{ position: "absolute", top: "50%", right: -5, width: 10, height: 10, borderRadius: 3, transform: "translateY(-50%)", background: isActive ? "#0D0D0D" : "#C7C7C7" }} />

                {/* Below md this sits centered above the card instead of to its right — at
                    mobile card widths, `left: calc(100% + 16px)` pushed it past the viewport
                    edge, where the section's `overflow: hidden` clipped it (the "/COSMOS" cutoff
                    in the screenshot that flagged this). md: and up restores the original
                    side placement, where there's room beside the card for it. */}
                <span
                  className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] md:bottom-auto md:top-0 md:left-[calc(100%+16px)] md:translate-x-0"
                  style={{
                  background: isActive ? "#0456DD" : "#fff",
                  border: isActive ? "none" : "1px solid rgba(13,13,13,0.18)",
                  borderRadius: 8,
                  color: isActive ? "#fff" : "#0D0D0D",
                  fontFamily: "var(--font-ibm-mono)", fontWeight: 700, whiteSpace: "nowrap",
                  fontSize: isActive ? 13 : 11, letterSpacing: "0.06em", padding: isActive ? "6px 14px" : "5px 10px",
                }}>
                  /{p.label}
                </span>
              </div>
            );
          })}

          {/* The 3D canvases size themselves off getBoundingClientRect(), which reflects every
              ancestor's CSS transform — so a canvas nested inside the scaled-down card above
              always measures itself at the shrunk size, then gets shrunk AGAIN by the card's
              own scale on top of that, rendering the model tiny and stuck in a corner.
              These are 3 fixed-size, never-transformed slots (previous/active/next) at the same
              resting positions the card chrome slides to — width here is real, not scale, so
              measurement is always correct. Only WHICH phase's model renders in each slot
              changes, via a crossfade, so the "movement" reads as the model traveling with its
              card even though the canvas box itself never moves or resizes. */}
          {(["previous", "active", "next"] as const).map((slot) => {
            const slotIndex = active + (slot === "previous" ? -1 : slot === "next" ? 1 : 0);
            const slotPhase = PHASES[slotIndex];
            if (!slotPhase) return null;
            const isActiveSlot = slot === "active";
            const onRightSide = slot === "next";
            const SIDE_W = "clamp(120px,14vw,200px)";
            const gap = "calc(clamp(110px,13vw,190px) + clamp(64px,8vw,130px))";
            const shift = `calc(${gap} + ${SIDE_W} / 2)`;
            return (
              <div
                key={slot}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: isActiveSlot
                    ? "translate(-50%,-50%)"
                    : `translate(-50%,-50%) translateX(${onRightSide ? shift : `calc(-1 * (${shift}))`})`,
                  width: isActiveSlot ? "clamp(220px,26vw,380px)" : SIDE_W,
                  maxHeight: "100%",
                  aspectRatio: "364/452",
                  zIndex: isActiveSlot ? 1 : 0,
                  pointerEvents: "none",
                }}
              >
                <AnimatePresence>
                  <motion.div
                    key={slotPhase.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActiveSlot ? 1 : 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <JourneyStar3D mode={slotPhase.mode} className="w-full h-full" speed={isActiveSlot ? 0.55 : 0} />
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center" style={{ flex: "0 0 auto", gap: "clamp(16px,2vw,24px)", marginTop: "clamp(16px,2.5vw,28px)" }}>
        <button
          onClick={goPrev}
          disabled={active === 0}
          aria-label="Previous phase"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48,
            border: "1px solid rgba(13,13,13,0.15)", borderRadius: 10, background: "#fff",
            cursor: active === 0 ? "default" : "pointer", opacity: active === 0 ? 0.35 : 1,
          }}
        >
          <Image src="/classics/icons/left-arrow.svg" alt="" width={18} height={16} />
        </button>
        <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 16, color: "#0D0D0D", minWidth: 32, textAlign: "center" }}>
          {active + 1}/{N}
        </span>
        <button
          onClick={goNext}
          disabled={active === N - 1}
          aria-label="Next phase"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48,
            border: "1px solid rgba(13,13,13,0.15)", borderRadius: 10, background: active === N - 1 ? "#fff" : "#0D0D0D",
            cursor: active === N - 1 ? "default" : "pointer", opacity: active === N - 1 ? 0.35 : 1,
          }}
        >
          <Image src="/classics/icons/right-arrow.svg" alt="" width={18} height={16} style={{ filter: active === N - 1 ? "none" : "invert(1)" }} />
        </button>
      </div>

      <div className="flex items-end justify-between flex-wrap" style={{ flex: "0 0 auto", gap: 24, marginTop: "clamp(16px,2.5vw,28px)" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", border: "1px solid rgba(13,13,13,0.2)", borderRadius: 999,
          padding: "8px 16px", fontFamily: "var(--font-ibm-mono)", fontWeight: 600, fontSize: 12,
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#0D0D0D",
        }}>
          Three phase journey of logo &amp; brand
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase.key}
            className="flex items-start"
            style={{ gap: "clamp(16px,2.5vw,32px)", maxWidth: 640 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>
              <span style={{ color: "#0456DD" }}>({phase.num})</span>{" "}
              <span style={{ color: "#0456DD" }}>{phase.label}</span>
            </p>
            <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(14px,1.1vw,17px)", lineHeight: 1.6, color: "#0D0D0D" }}>
              <span style={{ fontWeight: 600 }}>{phase.lead}</span>{phase.rest}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
