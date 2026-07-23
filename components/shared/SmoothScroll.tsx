"use client";
import { useEffect } from "react";

/**
 * Desktop-only smooth scroll (Lenis) wired into GSAP ScrollTrigger.
 *
 * Why this exists: the homepage's star animations (travel to the globe, shrink into the
 * wordmark, dock into the "O") are scroll-SCRUBBED — their progress is locked directly to scroll
 * position. The browser delivers wheel/trackpad scroll in discrete steps with gaps between them,
 * so on a SLOW scroll a scrubbed animation faithfully follows those steps → visible step/hold/
 * step stutter (fast scroll hides it because the steps arrive nearly continuously). No scrub
 * value fixes this: tighter tracks the steps more closely (jerkier slow), looser bridges them but
 * drifts after you stop. The real fix is upstream — interpolate the discrete scroll into a
 * CONTINUOUS stream, which is exactly what Lenis does. Every scrubbed animation then tracks that
 * smooth value and is buttery at all scroll speeds.
 *
 * Desktop-only (>= 1024, matching the isMobile split used across page.tsx / RadiatesSection /
 * ParagraphReveal), for two reasons: (1) Lenis smooths touch too, which would break the native
 * mobile pull-to-refresh gesture — the same reason the old normalizeScroll was desktop-only;
 * (2) the star's scroll choreography only runs on desktop anyway, so mobile has nothing to
 * smooth here. This REPLACES RadiatesSection's former ScrollTrigger.normalizeScroll — the two
 * both hijack scroll and must never run together.
 *
 * Scoped to the homepage (mounted in page.tsx), NOT the root layout, so it never touches the
 * Classics page, which drives its own custom wheel/touch 3D scroll and locks body overflow.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Guard mobile/tablet: no smooth scroll there (see comment above). Not reactive to resize —
    // matching the rest of the codebase's one-shot isMobile reads; a resize across the breakpoint
    // is an edge case not worth a full Lenis teardown/re-init cycle mid-session.
    if (window.innerWidth < 1024) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        // Duration bumped from 0.9 → 1.15: a longer ease is heavier drag, so a hard flick decays
        // onto its target over more time instead of snapping there — the scroll feels weightier and
        // more controlled at speed. This is the smoothing/settle knob.
        duration: 1.15,
        // Standard eased curve; the exact shape matters less than that it's a continuous stream.
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // THE drag knob. wheelMultiplier scales every wheel delta before Lenis applies it, so a
        // hard flick contributes proportionally LESS distance — the input is resisted rather than
        // banked-and-replayed (which is what made the previous velocity cap feel like it scrolled
        // for miles). 0.6 = a firm, deliberate drag. Lower = heavier/slower; 1 = native sensitivity.
        // Reliable and Lenis-native — no input interception, so it can't fight the scene holds or
        // programmatic scrolls.
        wheelMultiplier: 0.6,
      });

      // Exposed so other components can do a Lenis-smooth programmatic scroll (e.g. OriginsSection
      // scrolling back to itself when the expanded story closes). Native scrollTo/scrollIntoView
      // fights Lenis; going through the instance keeps it smooth and in sync with ScrollTrigger.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__lenis = lenis;

      // Drive ScrollTrigger off Lenis's smoothed scroll position — every scroll frame Lenis
      // computes, ScrollTrigger re-evaluates against it, so scrubbed tweens track the smooth
      // value rather than the raw stepped one.
      lenis.on("scroll", ScrollTrigger.update);

      // Run Lenis's own RAF from GSAP's ticker (one shared loop, no competing rAFs) — gsap.ticker
      // hands time in seconds, Lenis.raf wants milliseconds.
      // prioritize=true (3rd arg) puts this at the FRONT of the ticker queue so Lenis advances the
      // smooth-scroll position — and fires its "scroll" → ScrollTrigger.update — BEFORE any other
      // gsap.ticker callback runs that frame. Critical for the star's O-dock ticker (page.tsx):
      // it reads the O letter's live getBoundingClientRect() each frame, so it must run AFTER this
      // frame's scroll is applied, otherwise it reads the O's PREVIOUS-frame position and the star
      // trails/jitters behind the O by one frame while riding inside it.
      const raf = (time: number) => { lenis.raf(time * 1000); };
      gsap.ticker.add(raf, false, true);
      // lagSmoothing(0): GSAP normally "catches up" after a frame spike by jumping time forward,
      // which would desync Lenis's integration — disable it so time stays continuous.
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).__lenis === lenis) (window as any).__lenis = undefined;
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
