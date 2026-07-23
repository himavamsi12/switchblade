"use client";
import { useEffect, useRef } from "react";

type GradientRevealProps = {
  /**
   * "load"   → falls as soon as the page paints (above-the-fold gradients, like the collab hero).
   * "scroll" → falls the first time the host section reaches ~85% down the viewport, so the reveal
   *            is actually witnessed rather than having already finished off-screen.
   */
  trigger?: "load" | "scroll";
  /** Seconds. Matches the homepage hero's 2.2s by default. */
  duration?: number;
  /** Seconds to hold before the cover starts falling. */
  delay?: number;
  /**
   * Stacking level of the cover. The homepage hero uses a positive z-index (its content is
   * absolutely positioned above it); sections whose content is static flow instead pass -1, which
   * paints the cover above the section's own gradient background but behind all of its content.
   * Requires the host section to establish a stacking context (`isolation: isolate`) so the
   * negative level stays scoped to it.
   */
  zIndex?: number;
  /**
   * "scroll" trigger only — how far up from the viewport bottom the fall fires, as a percentage
   * string for the IntersectionObserver's bottom rootMargin (e.g. "-15%" ≈ ScrollTrigger's
   * "top 85%"). Default -15% is tuned for short hero-style gradient sections whose whole height
   * comfortably fits inside that 85% window well before the page is scrolled to its end. Tall
   * hosts whose own box is close to (or taller than) the viewport — like the site footer — need a
   * much bigger margin: with the default, the observer doesn't fire until the host is nearly
   * entirely on screen, which on a short/tall page is essentially the same moment the user hits
   * the very bottom, leaving no scroll time left for `duration` to actually play out before they
   * stop and look — reading as the content staying blank/stuck rather than revealing.
   */
  triggerMarginBottom?: string;
};

/**
 * The homepage hero's "gradient falls in" reveal, as a drop-in overlay for any gradient section.
 *
 * A white cover sits over the gradient from first paint (so the gradient never flashes before the
 * animation runs), then slides straight DOWN and off (translateY 0 → 100% of its own height) over a
 * long sine.inOut — so the colour is revealed from the top down, pouring in, rather than flatly
 * cross-fading. Its top edge is feathered by a mask (transparent → opaque over the top 20%) so the
 * reveal line reads as a soft wash instead of a hard sliding panel.
 *
 * Implementation notes:
 * - The cover is taller than the host (top:-25%, height:125%) so that AT REST the feathered — i.e.
 *   partly transparent — top edge sits ABOVE the section (section fully covered, no gradient
 *   peeking through the feather), with white to spare as it slides clear. The outer wrapper clips
 *   that overhang, so hosts don't need their own `overflow: hidden` and nothing spills into the
 *   next section.
 * - Pure CSS transition on `transform` only (GPU-composited, no layout), so this stays independent
 *   of any GSAP/ScrollTrigger choreography a host page runs on its own.
 */
export const GradientReveal = ({
  trigger = "scroll",
  duration = 2.2,
  delay = 0,
  zIndex = -1,
  triggerMarginBottom = "-15%",
}: GradientRevealProps) => {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const cover = coverRef.current;
    if (!wrap || !cover) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cover.style.opacity = "0";
      return;
    }

    const fall = () => {
      // sine.inOut, as a bezier — the same easing the hero's GSAP timeline uses.
      cover.style.transition = `transform ${duration}s cubic-bezier(0.37, 0, 0.63, 1) ${delay}s`;
      cover.style.transform = "translateY(100%)";
    };

    if (trigger === "load") {
      // Next frame, so the browser registers the translateY(0) start before the change — setting
      // both in one frame just paints the end state with no animation.
      const id = requestAnimationFrame(fall);
      return () => cancelAnimationFrame(id);
    }

    // triggerMarginBottom ≈ ScrollTrigger's "top <100-N>%": fires once the section's top has come
    // up past that much of the viewport height. See the prop's own doc comment for why tall hosts
    // need a bigger margin than the -15% default.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fall();
          io.disconnect();
        }
      },
      { rootMargin: `0px 0px ${triggerMarginBottom} 0px`, threshold: 0 }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [trigger, duration, delay, triggerMarginBottom]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex, pointerEvents: "none" }}
    >
      <div
        ref={coverRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "-25%",
          height: "125%",
          background: "#ffffff",
          transform: "translateY(0)",
          willChange: "transform",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 20%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 20%)",
        }}
      />
    </div>
  );
};
