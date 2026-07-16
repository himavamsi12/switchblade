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
      // 100svh ("small" viewport height), not 100dvh — dvh grows live as the mobile address bar
      // collapses mid-scroll, and since the browser animates that collapse over ~300ms, this
      // section's height (and everything positioned relative to it below) visibly jumps/reflows
      // while the user is still scrolling, reading as the cards briefly overlapping the heading
      // above. svh stays pinned to the smallest possible viewport (address bar always assumed
      // visible), so it never changes mid-scroll — the one-time tradeoff is slightly less height
      // once the bar actually hides, not a live jump.
      height: "100svh", boxSizing: "border-box", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div className="flex items-start justify-between max-md:mb-16" style={{ flex: "0 0 auto" }}>
        <h2 style={{
          fontFamily: "var(--font-barlow)", fontWeight: 800, fontSize: "clamp(30px,4.5vw,64px)",paddingBottom: "",
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
              ancestor's CSS transform — so a canvas nested inside a SCALED-down ancestor always
              measures itself at the shrunk size, then gets shrunk AGAIN by that scale on top of
              that, rendering the model tiny and stuck in a corner. That's why this can't just
              share the card chrome's transform (which uses `scale()` for its side positions)
              directly.
              This used to render 3 fixed, never-transformed slots (previous/active/next) that
              only crossfaded opacity on click — so the card visibly slid but its star just faded
              in place, never actually traveling with it. Now every phase mounts once, persists,
              and its own wrapper animates `transform: translateX(...)` (translation only, never
              scale — safe for the canvas measurement) plus a real `width` change (not a scale)
              between the active/side sizes, using the exact same offset math and transition
              timing as the card chrome above, so the model now visibly travels together with its
              card instead of just crossfading in place. */}
          {PHASES.map((p, i) => {
            const offset = i - active;
            const role = offset === 0 ? "active" : offset === 1 ? "next" : offset === -1 ? "previous" : "hidden";
            const isActive = role === "active";
            const onRightSide = offset > 0;
            const CANVAS_W_ACTIVE = "clamp(220px,26vw,380px)";
            const CANVAS_W_SIDE = "clamp(120px,14vw,200px)";
            const gap = "calc(clamp(110px,13vw,190px) + clamp(64px,8vw,130px))";
            const shift = `calc(${gap} + ${CANVAS_W_SIDE} / 2)`;
            return (
              <div
                key={p.key}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: isActive
                    ? "translate(-50%,-50%)"
                    : `translate(-50%,-50%) translateX(${onRightSide ? shift : `calc(-1 * (${shift}))`})`,
                  width: isActive ? CANVAS_W_ACTIVE : CANVAS_W_SIDE,
                  maxHeight: "100%",
                  aspectRatio: "364/452",
                  opacity: role === "hidden" ? 0 : isActive ? 1 : 0.5,
                  zIndex: isActive ? 1 : 0,
                  pointerEvents: "none",
                  transition: "opacity 0.45s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1), width 0.55s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <JourneyStar3D mode={p.mode} className="w-full h-full" speed={isActive ? 0.55 : 0} />
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
          // active: (real :active, not media-gated) alongside hover: — Tailwind v4 wraps hover:
          // in @media (hover: hover) to avoid iOS/Android's "sticky hover after tap" bug, which
          // means it silently never applies at all on touch devices (they report hover:none).
          // active: covers touch (fires on touchstart→touchend) so tapping still gets the same
          // black-background/white-icon feedback a mouse hover gives on desktop.
          // bg-white is a CLASS, not inline style, on purpose — an inline `background` (even a
          // static, non-conditional one) always wins over a stylesheet :hover/:active rule for
          // that same property regardless of specificity, which is exactly what was silently
          // blocking both of them here.
          className={active === 0 ? "group/prev relative bg-white" : "group/prev relative bg-white hover:bg-[#0D0D0D] active:bg-[#0D0D0D] transition-colors duration-200"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48,
            border: "1px solid rgba(13,13,13,0.15)", borderRadius: 10,
            cursor: active === 0 ? "default" : "pointer", opacity: active === 0 ? 0.35 : 1,
          }}
        >
          <Image
            src="/classics/icons/left-arrow.svg" alt="" width={18} height={16}
            className={active === 0 ? "" : "transition-opacity duration-200 group-hover/prev:opacity-0 group-active/prev:opacity-0"}
          />
          {active !== 0 && (
            <svg
              className="absolute inset-0 m-auto opacity-0 transition-opacity duration-200 group-hover/prev:opacity-100 group-active/prev:opacity-100"
              width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 6.75V9H0L0 6.75H18ZM4.5 9V11.25H2.25V9H4.5ZM6.75 11.25L6.75 13.5H4.5L4.5 11.25H6.75ZM9 13.5V15.75H6.75V13.5H9ZM4.5 6.75V4.5H2.25V6.75H4.5Z" fill="white" />
              <path d="M6.75 11.25L6.75 2.25H4.5L4.5 11.25H6.75ZM9 13.5V0H6.75L6.75 13.5H9Z" fill="white" />
            </svg>
          )}
        </button>
        <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 16, color: "#0D0D0D", minWidth: 32, textAlign: "center" }}>
          {active + 1}/{N}
        </span>
        <button
          onClick={goNext}
          disabled={active === N - 1}
          aria-label="Next phase"
          // Black background/inverted icon used to be the *default* look for this button
          // (only the disabled end-state was white) — now it starts white like the prev button
          // and only turns black on hover/tap. active: (real :active, not media-gated) sits
          // alongside hover: — Tailwind v4 wraps hover: in @media (hover: hover) to avoid
          // iOS/Android's "sticky hover after tap" bug, which means it silently never applies at
          // all on touch devices (they report hover:none). active: covers touch (fires on
          // touchstart→touchend) so tapping still gets the same feedback a mouse hover gives on
          // desktop. bg-white is a CLASS, not inline style — an inline `background` (even a
          // static, non-conditional one) always wins over a stylesheet :hover/:active rule for
          // that same property regardless of specificity, which is exactly what was silently
          // blocking both of them here.
          className={active === N - 1 ? "group/next relative bg-white" : "group/next relative bg-white hover:bg-[#0D0D0D] active:bg-[#0D0D0D] transition-colors duration-200"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48,
            border: "1px solid rgba(13,13,13,0.15)", borderRadius: 10,
            cursor: active === N - 1 ? "default" : "pointer", opacity: active === N - 1 ? 0.35 : 1,
          }}
        >
          <Image
            src="/classics/icons/right-arrow.svg" alt="" width={18} height={16}
            className={active === N - 1 ? "" : "transition-opacity duration-200 group-hover/next:opacity-0 group-active/next:opacity-0"}
          />
          {active !== N - 1 && (
            // Swapped in on hover/tap instead of filter-inverting the dark arrow image above — a
            // dedicated white-fill SVG so the hover state matches exactly, not just an
            // approximation via CSS invert().
            <svg
              className="absolute inset-0 m-auto opacity-0 transition-opacity duration-200 group-hover/next:opacity-100 group-active/next:opacity-100"
              width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.8">
                <path d="M0 6.75V9H18V6.75H0ZM13.5 9V11.25H15.75V9H13.5ZM11.25 11.25V13.5H13.5V11.25H11.25ZM9 13.5V15.75H11.25V13.5H9ZM13.5 6.75V4.5H15.75V6.75H13.5Z" fill="white" />
                <path d="M11.25 11.25V2.25H13.5V11.25H11.25ZM9 13.5V0H11.25V13.5H9Z" fill="white" />
              </g>
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-end justify-between flex-wrap max-md:gap-8 md:gap-6 max-md:mt-16 md:mt-[clamp(16px,2.5vw,28px)]" style={{ flex: "0 0 auto" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", border: "1px solid rgba(13,13,13,0.2)", borderRadius: 8,
          padding: "8px 16px", fontFamily: "var(--font-archivo)", fontWeight: 600, fontSize: 12,
          letterSpacing: "0.08em", textTransform: "uppercase", color: "#0D0D0D",
        }}>
          Three phase journey of logo &amp; brand
        </span>

        {/* All 3 phases' text stacked in the same CSS grid cell (grid-area: 1 / 1 on every
            child), only the active one visible via opacity — this makes the container's own
            height equal to the TALLEST phase's text automatically (a plain grid sizing rule, no
            measurement needed), instead of resizing to whichever phase happens to be showing.
            Cosmos's description is noticeably longer than Classic's or Evolution's, so switching
            phases used to change this row's height and reflow the fixed-height section above it
            (the star card visibly jumping) every time the arrows were clicked. Replaces the old
            AnimatePresence mount/unmount swap — this crossfades all three in place instead,
            which also sidesteps any exit/enter timing gap between phases. */}
        <div className="grid" style={{ maxWidth: 640 }}>
          {PHASES.map((p, i) => (
            <motion.div
              key={p.key}
              className="flex items-start"
              style={{ gridArea: "1 / 1", gap: "clamp(16px,2.5vw,32px)", pointerEvents: i === active ? "auto" : "none" }}
              initial={false}
              animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : (i < active ? -12 : 12) }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>
                <span style={{ color: "#0456DD" }}>({p.num})</span>{" "}
                <span style={{ color: "#0456DD" }}>{p.label}</span>
              </p>
              <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(14px,1.1vw,17px)", lineHeight: 1.6, color: "#0D0D0D" }}>
                <span style={{ fontWeight: 600 }}>{p.lead}</span>{p.rest}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
