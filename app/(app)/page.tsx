"use client";
import { useEffect, useRef, useState } from "react";
import { ParagraphReveal } from "@/components/shared/ParagraphReveal";
import { RadiatesSection } from "@/components/home/RadiatesSection";
import { OriginsSection } from "@/components/home/OriginsSection";
import { BrandJourney } from "@/components/home/BrandJourney";
import { ClassicsGlobeSection } from "@/components/home/ClassicsGlobeSection";
import { CollaboratorsSection } from "@/components/shared/CollaboratorsSection";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteNav } from "@/components/shared/SiteNav";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { SweepText } from "@/components/shared/SweepText";
import dynamic from "next/dynamic";
import type React from "react";

const Star3D = dynamic(
  () => import("@/components/shared/Star3D").then(m => m.Star3D),
  { ssr: false, loading: () => null }
);

function Hero({ starRef, shrinkRef, entranceRef }: { starRef: React.RefObject<HTMLDivElement | null>; shrinkRef: React.RefObject<number>; entranceRef: React.RefObject<number> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const tagRef     = useRef<HTMLDivElement>(null);
  const descRef    = useRef<HTMLParagraphElement>(null);
  // White cover that sits over the hero's gradient on first paint and wipes away on load, so the
  // gradient reads as "spreading in from white" as the first beat of the intro sequence.
  const gradientMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sts: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hideTrigger: any = null;
    let tickerFn: (() => void) | null = null;
    // Set alongside tickerFn — cleanup needs gsap.ticker.remove, but gsap itself only exists
    // inside the dynamic import below, so the remover closes over it.
    let removeTicker: (() => void) | null = null;

    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      const star    = starRef.current;
      const section = sectionRef.current;
      if (!star || !section) return;

      // Small constant rightward offset (desktop only): the canvas box is mathematically
      // centered, but the continuously-rotating star's own asymmetric silhouette reads as
      // slightly left of center once you have something nearby to compare it against (the
      // Kindness/Compassion labels in RadiatesSection, the wordmark later). A previous version
      // of this correction only appeared partway through the scroll-tied shrink in
      // RadiatesSection, ramping in as the star scaled down — which itself read as the star
      // drifting sideways then snapping to center. Baking it in here instead, once, before the
      // star is ever visible (opacity starts at 0), means it's a fixed part of the star's resting
      // position everywhere on the page — nothing ever animates it, so there's a correction but
      // zero motion from it.
      // Threshold raised from 768 to 1024 (Tailwind's lg breakpoint) — tablets in the 768-1023
      // range were falling into the "desktop" branch everywhere this file, RadiatesSection, and
      // ParagraphReveal check window width, getting the side-by-side/globe-travel choreography
      // that was only ever tuned and tested against real desktop widths (1024+ with a mouse), not
      // validated at tablet widths. Matching the split to 1024 across all three files gives
      // tablets the already-proven stacked/mobile layout instead of a half-working desktop one.
      const isMobile = window.innerWidth < 1024;
      // No horizontal nudge — the star now settles at a deterministic front-facing (bilaterally
      // symmetric) pose on every load (see Star3D's gated ambient rotation), so its box being
      // dead-centered in the viewport is genuinely centered. The old per-load left/right variance
      // was the star settling at a random rotation angle, not a position offset, so a fixed nudge
      // could never fix it — this removes the nudge entirely.
      const restX = 0;
      // transformOrigin MUST be the element's own center, explicitly. Without it, RadiatesSection's
      // scale-down was shrinking the star toward its LEFT EDGE instead of its center — measured as
      // the star drifting ~130px left as it scaled to 0.7 (exactly (1-0.7)×halfWidth for an ~820px
      // box, the signature of a left-edge origin). Pinning the origin to 50% 50% makes the scale
      // shrink symmetrically about the center, so the star stays put horizontally while it resizes.
      // Wrapper scale stays 1 (no CSS box scale) — the entrance "grow" is now done in 3D via the
      // model's entranceRef, which is crisper than CSS-scaling the whole canvas. Only opacity fades.
      gsap.set(star,            { xPercent: -50, yPercent: -50, x: `${restX}vw`, y: 0, scale: 1, opacity: 0, force3D: true, transformOrigin: "50% 50%" });
      gsap.set(tagRef.current,  { opacity: 0, y: 10 });
      gsap.set(descRef.current, { opacity: 0 });

      // The scroll-driven hide/show behavior below used to live inside the entrance timeline's
      // onComplete, so it only ever got set up once the ~1.7s intro animation finished. That's
      // fragile for no real reason — a live browser test found a case where the intro animation
      // never completed at all, which silently skipped ALL of this (the star never hid, and its
      // canvas — which also ignores the wrapper's pointer-events-none, fixed separately — sat
      // there blocking clicks on everything under it for the rest of the page). Setting this up
      // immediately means it's never held hostage by the intro animation's completion.

      // Docking the star into the "O" of "Origins" (desktop only — on mobile the star already
      // hides right after the SWITCHBLADE wordmark, see RadiatesSection's starHideTrigger).
      // After the star finishes its stay beside the globe (globeTravel in RadiatesSection), it
      // travels down into the "O" of the "The Origins" heading, shrinking to sit inside the
      // letter, and then RIDES the O as it scrolls (staying inside it for good).
      //
      // A previous attempt at this feature failed in several distinct ways; this implementation
      // is structured specifically around those findings:
      // - NO lifecycle callbacks (onEnter/onLeaveBack) own any state — under normalizeScroll's
      //   momentum those proved flaky (onLeaveBack fired spuriously). Instead a gsap.ticker
      //   callback reads `dockTrigger.progress` FRESH every frame and derives everything from it.
      // - NO fixed-start-to-moving-target lerp — that produces a quadratic path that can
      //   overshoot and reverse. Instead: star position = live O center + (entry offset that
      //   DECAYS to zero as progress→1). The offset is captured once on entry; the target is
      //   re-read live every frame, so the star always converges exactly onto the O no matter
      //   how the O moves during the travel.
      // - The end is anchored to the O LETTER itself (endTrigger), not origins-section — that
      //   section is mostly story text below the heading, so a section-based end point put the
      //   completion way past the heading being on screen at all.
      // - Because the ticker runs every frame (not only inside the trigger's active range), the
      //   "ride the O after docking" phase needs no extra machinery: past the end, progress
      //   stays 1 and the star is glued to the O's live position each frame as it scrolls away.
      const paragraphRevealTarget = isMobile ? null : document.getElementById("paragraph-reveal");
      const oLetter = isMobile ? null : document.getElementById("origins-o-letter");
      if (paragraphRevealTarget && oLetter) {
        // Anchored to the O letter (in OriginsSection, below the now only BRIEFLY-pinned
        // paragraph-reveal). start "top bottom": the star begins descending the moment the O
        // enters from the bottom of the viewport — which, with the short +25% pin, is right as the
        // globe section releases and scrolls away, so the star travels DOWN in sync with the
        // section scrolling out rather than after it. end "top 45%": the dock completes as the O
        // reaches a bit above centre, spreading the descent across roughly a screen of scroll so
        // it reads as one continuous, scroll-linked glide.
        hideTrigger = ScrollTrigger.create({
          trigger: oLetter,
          start: "top bottom",
          endTrigger: oLetter,
          end: "top 45%",
        });
        const dockTrigger = hideTrigger;

        const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
        // The docked-beside-the-globe rest state the star is guaranteed to be in when this
        // trigger's range begins (globeTravel finishes well before it — see `start` above):
        // globeTravel parks it at x:22vw / y:8vh, and RadiatesSection's scaleTween holds the
        // model shrink at 0.7 on desktop. startX/startY below hardcode that same resting point
        // as an analytic formula (0.5vw+0.22vw, 0.38vh+0.08vh) rather than reading it live off
        // the star, specifically because a fast scroll can cross this boundary while globeTravel's
        // own GSAP `scrub` proxy (its internal easing lag) is still catching up — capturing
        // "live" at that moment would sample a transient mid-flight position, poisoning the
        // whole path with a start point the star was only ever passing through.
        const DOCK_START_SHRINK = 0.7;
        // Whether the previous frame wrote to the star — lets the exit path below run its
        // one-time final write on the exact frame the range is left, then go fully idle.
        let wasActive = false;

        // The star's docked position is a PURE FUNCTION of the current scroll position and the O's
        // current on-screen rect. No temporal smoothing, deliberately — this is the fix for the
        // "star drifts sideways when I scroll slowly or stop" bug, and it's worth recording why,
        // because the smoothing looked obviously correct:
        //
        // This ticker used to exponentially ease BOTH the trigger progress and the O's rect toward
        // their live values. Any such filter lags behind its input by an amount proportional to
        // input VELOCITY, and that lag decays to zero once the input stops changing. While
        // scrolling fast the lag is invisible — it's swamped by the star's own large frame-to-frame
        // motion. But when scrolling slowly or stopping, the decaying lag becomes the ONLY motion
        // left, so the star kept sliding after the reader had stopped. Horizontally that's
        // especially visible: wantX blends startX→targetX by `e`, so any post-stop change in
        // progress moves the star sideways with nothing else going on to mask it.
        //
        // The smoothing was originally compensating for raw progress arriving in discrete
        // per-wheel-notch steps under ScrollTrigger.normalizeScroll. That's stale: normalizeScroll
        // was replaced by Lenis (components/shared/SmoothScroll.tsx), which interpolates scroll
        // into a continuous per-frame stream BEFORE ScrollTrigger sees it. Progress read here is
        // therefore already smooth, and filtering it a second time only re-introduced lag. Lenis is
        // desktop-only (>= 1024) — exactly the same branch this whole dock is gated behind — so
        // there is no viewport where this runs against unsmoothed scroll.
        tickerFn = () => {
          const raw = dockTrigger.progress;

          // Below the range: go idle immediately and hand ownership of x/y back to globeTravel.
          // One final write at exactly p=0 (the parked-beside-globe state, which is what the dead
          // zone between this range and globeTravel's expects), then full silence — otherwise this
          // ticker keeps clobbering globeTravel's own reverse-scrub renders every frame, and once
          // both settle nothing re-renders x again, leaving the star stuck at the globe-side
          // offset all the way back up to the hero.
          if (raw <= 0) {
            if (!wasActive) return;
            wasActive = false;
            // fall through once with p = 0 for the final parked-state write
          } else {
            wasActive = true;
          }
          const p = raw;

          const vw = window.innerWidth, vh = window.innerHeight;
          const oRect = oLetter.getBoundingClientRect();
          const targetX = oRect.left + oRect.width / 2;
          const targetY = oRect.top + oRect.height / 2;
          const startX = 0.5 * vw + 0.24 * vw;
          const startY = 0.38 * vh + 0.08 * vh;
          // The wrapper's transform-less layout center — what a given gsap x/y is relative to.
          const baseX = 0.5 * vw;
          const baseY = 0.38 * vh;

          const e = easeInOut(Math.min(1, Math.max(0, p)));
          // Convex blend between the fixed canonical start and the LIVE target: always lands
          // exactly on the O no matter how the O moves mid-travel, and can never overshoot (the
          // position is by construction between the two endpoints).
          const wantX = startX * (1 - e) + targetX * e;
          const wantY = startY * (1 - e) + targetY * e;
          gsap.set(star, {
            x: wantX - baseX,
            y: wantY - baseY,
            // Tilts partway through the travel and straightens back out by the time it docks.
            rotation: -14 * Math.sin(Math.PI * e),
          });
          // Final model shrink derived from live layout so it responds to font size / viewport:
          // the model visually fills ~78% of its wrapper box at shrink 1. Docked ratio lowered
          // from 1.5x to 0.85x the O's glyph height — 1.5x left the star towering well above/
          // below the letter instead of sitting inside it. The wrapper's height is computed from
          // its own CSS clamp (see the style on this element) rather than getBoundingClientRect —
          // the rect is the ROTATED bounding box, which grows up to ~30% while the star is tilted
          // mid-travel, and that wobble fed straight into the shrink target (the "not properly
          // shrinking" pumping effect).
          const wrapH = Math.min(940, Math.max(280, Math.min(0.84 * vh, vw)));
          const finalShrink = Math.min(0.35, Math.max(0.05, (oRect.height * 0.85) / (wrapH * 0.78)));
          shrinkRef.current = DOCK_START_SHRINK + (finalShrink - DOCK_START_SHRINK) * e;
        };
        gsap.ticker.add(tickerFn);
        removeTicker = () => { if (tickerFn) gsap.ticker.remove(tickerFn); };
      }

      // Staged page-load intro, in this order (by request):
      //   1. the background gradient "spreads in" from an all-white hero,
      //   2. then the 3D star fades/scales in,
      //   3. then the heading + tagline below it appear,
      //   4. (the navbar slides down + fades in from the top last — that's owned by SiteNav's
      //      own `animateIn` entrance in page.tsx, timed to land right after this sequence).
      // The star stays centered through the hero exit — no corner-parking/tilt — handing off at
      // scale 1 into RadiatesSection's scroll-driven choreography right below the hero.
      const mask = gradientMaskRef.current;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Proxy the star's 3D entrance grow (0→1) so it lives on THIS timeline (driving Star3D's
      // entranceRef) rather than Star3D's own R3F clock — keeping the visible grow perfectly in
      // step with the opacity reveal below. Linear here; Star3D applies its own easeOutCubic.
      const entranceProxy = { v: 0 };
      const writeEntrance = () => { entranceRef.current = entranceProxy.v; };

      if (reduceMotion) {
        // No staged motion — reveal everything at its rest state immediately.
        if (mask) gsap.set(mask, { autoAlpha: 0 });
        entranceProxy.v = 1; writeEntrance();
        gsap.set(star, { opacity: 1 });
        gsap.set(tagRef.current, { opacity: 1, y: 0 });
        gsap.set(descRef.current, { opacity: 1 });
      } else {
        tl = gsap.timeline();
        tl
          // 1) Gradient fades in: the white cover simply dissolves (opacity 1→0), so the gradient
          //    itself smoothly materializes in place — no moving/wiping edge (a clip-path wipe read
          //    as a white panel sliding down). Crossfading from an all-white first-paint state to
          //    the gradient underneath is the smoothest way to "animate the gradient" itself.
          // 1) Gradient "falls" in: the white cover slides straight DOWN and off (translateY 0 →
          //    100% of its own height) over a long 2.2s sine.inOut, so the gradient is revealed
          //    from the top down — colour pouring in — rather than a flat opacity fade. Its
          //    feathered top edge (see the mask on this element) keeps the reveal line soft.
          .fromTo(mask,
            { yPercent: 0 },
            { yPercent: 100, duration: 2.2, ease: "sine.inOut" }, 0)
          // 2) Star GROWS in from tiny → full (entranceProxy → Star3D's entranceRef) while it
          //    fades up — both run together on this one timeline so the grow is fully visible, not
          //    finished behind the opacity. Positioned during the gradient wash so it reads as one
          //    continuous flow.
          .to(entranceProxy, { v: 1, duration: 1.15, ease: "none", onUpdate: writeEntrance }, 0.9)
          .to(star, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.9)
          // 3) Tagline block below (the heading itself is SweepText trigger="load" delay=2400,
          //    landing between these — see its JSX comment).
          .to(tagRef.current,  { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 3.0)
          .to(descRef.current, { opacity: 1,       duration: 0.5, ease: "power2.out" }, 3.2);
      }
    });

    return () => {
      killed = true;
      tl?.kill();
      sts.forEach(s => { s?.kill(); s?.scrollTrigger?.kill(); });
      hideTrigger?.kill();
      removeTicker?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[640px]"
      style={{
        background: "linear-gradient(180deg, #1130A2 0%, #1C38AE 14%, #7088D0 38%, #BAC8E8 52%, #ffffff 73%, #FFFFFF 100%)",
      }}
    >
      {/* White cover over the gradient — present from first paint (so there's never a flash of the
          gradient before JS runs), then it "falls" DOWNWARD out of view on load (translateY, see
          the intro timeline) so the gradient is revealed from the top down like colour pouring in,
          rather than a flat opacity fade. Its top edge is FEATHERED via a mask (transparent→opaque
          over the top ~20%) so the reveal line is soft, not a hard sliding panel. Made taller than
          the hero and offset up (top:-25%, height:125%) so at rest the feathered edge sits above
          the hero (hero fully covered) and there's white to spare as it slides fully clear. z-10:
          above the gradient background, below the z-30 tagline + z-20 star. */}
      <div
        ref={gradientMaskRef}
        aria-hidden
        className="absolute left-0 right-0 z-10 pointer-events-none"
        style={{
          top: "-25%",
          height: "125%",
          background: "#ffffff",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 20%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 20%)",
          willChange: "transform",
        }}
      />

      <div className="absolute bottom-0 inset-x-0 z-30 site-px pb-12 flex flex-col items-center text-center gap-3">
        <h1
          style={{
            fontSize: "clamp(40px, 7.5vw, 64px)",
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.01em",
          }}
        >
          {/* delay 2400ms — the intro now runs a long, fluid gradient fade (0–2.2s) then the star
              (1.3–2.3s) before this; the heading sweeps in once the star has visibly landed, just
              ahead of the tagline block (3.0s), not overlapping the star's reveal. */}
          <SweepText tone="dark" color="#0F0E0C" trigger="load" delay={2400}>
            {/* &nbsp; plus the normal space = a double-width gap between the two words. A second
                plain space would just be collapsed away by HTML whitespace handling. */}
            ANYTHING&nbsp; BUT<br />EVERYTHING
          </SweepText>
        </h1>

        <p
          ref={descRef}
          style={{
            color: "#0F0E0C",
            fontFamily: "var(--font-archivo)",
            fontWeight: 500,
            fontSize: "clamp(12px, 1.15vw, 16px)",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            maxWidth: "500px",
            opacity: 0,
          }}
        >
          {/* Explicit breaks so each sentence gets its own line, rather than the three of them
              flowing together and re-wrapping wherever maxWidth happens to land. */}
          The superpower that you carry everywhere.<br />
          <span style={{ color: "var(--blue)" }}>Invisible, until the world demands it.</span><br />
          A philosophy applied to whatever it touches. Maximum impact.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  const globalStarRef   = useRef<HTMLDivElement>(null);
  const spinProgressRef = useRef<number>(0);
  // Extra rotation (radians), added on top of the star's own always-on spin, driven directly by
  // RadiatesSection's scroll-scrubbed shrink/grow progress rather than wall-clock time — 0 at
  // rest, ramping up as you scroll through the shrink so the star visibly spins faster exactly
  // in step with how far you've scrolled, regardless of scroll speed (see RadiatesSection's
  // onUpdate hook, which is the only thing that ever writes to this).
  const rotationDampRef = useRef<number>(0);
  // 1 = full size, animated down toward 0.7 by RadiatesSection as the reader scrolls toward the
  // SWITCHBLADE wordmark. This shrinks the 3D star MODEL itself (about its own center, inside the
  // canvas) rather than CSS-scaling the wrapper box — CSS-scaling the box dragged the star to one
  // side because the star isn't centered in its portrait canvas. See Star3D's useFrame.
  const shrinkRef = useRef<number>(1);
  // Star entrance grow (0→1), driven by Hero's intro timeline so the model's "grow in" is
  // perfectly in step with its opacity reveal (see Star3D's entranceRef).
  const entranceProgressRef = useRef<number>(0);

  // The star's CSS wrapper box being bigger on mobile didn't actually make the star itself look
  // bigger — Star3D's camera uses a fixed FOV, so the model only fills a fixed FRACTION of
  // whatever box it's given; growing the box just gave it more empty margin. Enlarging the model
  // itself means bumping the `scale` prop (3D units), which is what actually determines how much
  // of the canvas the star fills, regardless of box size. Desktop's 2.2 (Star3D's own default)
  // stays untouched.
  const [starScale, setStarScale] = useState(2.2);
  useEffect(() => {
    // 3.1 was tuned specifically for narrow phone widths (~375-428px), where the star's CSS
    // wrapper box (sized via vw/vh clamps in the star's own style below) is small. That same flat
    // value was previously applied to the ENTIRE <1024 range as a step function — fine on phones,
    // but on a tablet-width screen (e.g. 1023px) the wrapper box itself is already much bigger
    // (it scales fluidly with viewport width), so reusing the phone's scale on top of an
    // already-large box rendered a hugely oversized star that overlapped the labels and pushed
    // "Love" off the bottom of the screen. Interpolating linearly from 3.1 at 428px down to 2.2
    // at 1024px (Star3D's own desktop default) keeps both endpoints tuned per breakpoint, while
    // giving the tablet range in between a proportionate size instead of a cliff.
    const computeScale = () => {
      const w = window.innerWidth;
      if (w <= 428) return 2.8;
      if (w >= 1024) return 1.95;
      return 2.8 + (1.95 - 2.8) * ((w - 428) / (1024 - 428));
    };
    setStarScale(computeScale());
    const onResize = () => setStarScale(computeScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let killed = false;
    (async () => {
      const { gsap }           = await import("gsap");
      const { ScrollTrigger }  = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      document.querySelectorAll<HTMLElement>(".scroll-entrance").forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 48 },
          {
            opacity: 1, y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    })();
    return () => { killed = true; };
  }, []);

  return (
    <>
      {/* Desktop-only Lenis smooth scroll — makes the scroll-scrubbed star animations below
          smooth at all scroll speeds by feeding ScrollTrigger a continuous (rather than
          browser-stepped) scroll value. Replaces RadiatesSection's former normalizeScroll. */}
      <SmoothScroll />
      {/* animateIn: the navbar is the final beat of the homepage's staged load intro — it slides
          down + fades in from the top after the gradient/star/text sequence (see Hero). */}
      <SiteNav animateIn />

      <div
        ref={globalStarRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 20,
          top: "38%",
          left: "50%",
          // Floor stays 280px (not higher): pushing the floor itself past ~320px would make it
          // exceed the viewport width on the smallest phones (iPhone SE class, ~320-375px) and
          // clip at the screen edges again — the same bug the aspect-ratio fix below solves for
          // height. Instead the vw coefficient carries the size increase, since it scales with
          // the viewport and can't overshoot it the way a flat floor can.
          width:  "clamp(280px, 84vw, 860px)",
          // Height used to be a flat 78vh, independent of width. On a tall mobile portrait
          // screen that produced a box far taller than it is wide (e.g. ~226px wide by ~660px
          // tall on a 390x844 phone) — the <Canvas> derives its camera aspect from that box, so
          // the horizontal field of view got squeezed and the star's side arms rendered clipped
          // at the container edges. Capping height at 100vw keeps the same ~0.78 width/height
          // ratio as the 84vw width above (this is what stopped the clipping — the ratio matters
          // more than the absolute size) instead of letting it run away on narrow/tall
          // viewports; 84vh still wins on normal desktop aspect ratios since it's the smaller
          // value there.
          // 100vw -> 115vw bumps the mobile-only height cap (on desktop 84vh already wins this
          // min() regardless, so this only affects narrow/portrait viewports where 100vw was the
          // binding term) — gives the star's canvas box more vertical room, not a bigger model:
          // Star3D's camera keeps a fixed vertical FOV, so a taller box just reveals more of the
          // scene above/below, it doesn't rescale the star itself.
          height: "clamp(280px, min(84vh, 125vw), 940px)",
          // Centering transform applied in plain CSS from FIRST PAINT — not left for GSAP alone.
          // Hero's gsap.set (xPercent:-50, yPercent:-50, x:0, y:0) runs only after gsap is
          // dynamically imported (async), so before it lands the wrapper sits at left:50%/top:38%
          // with NO centering offset — and R3F measures the canvas at that stale, off-centre
          // position on mount, rendering the star slightly left until a resize/scroll forced a
          // re-measure. Baking the same translate(-50%,-50%) into the initial style means the box
          // is already centred when R3F first measures it; gsap.set then sets the identical
          // transform (plus its entrance scale), so there's no jump and the first paint is correct.
          transform: "translate(-50%, -50%)",
          willChange: "transform",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          {/* Reduced-perspective camera (cameraZ 9 + fov ~20.5, chosen so cameraZ·tan(fov/2) ≈
              4·tan(22°) — same on-screen size as the default 44° lens): a middle ground between the
              original dramatic 44° lens and full near-ortho. It roughly halves the arms' uneven
              foreshortening as the star spins (so it reads far more centred) while keeping enough
              depth that the star still looks full/large rather than flat. */}
          <Star3D className="w-full h-full" scale={starScale} cameraZ={9} fov={20.5} spinRef={spinProgressRef} dampRef={rotationDampRef} shrinkRef={shrinkRef} entranceRef={entranceProgressRef} />
        </div>
      </div>

      <Hero starRef={globalStarRef} shrinkRef={shrinkRef} entranceRef={entranceProgressRef} />

      {/* RadiatesSection now also contains the SWITCHBLADE wordmark reveal (formerly the separate
          UniquenessReveal section) — the star shrinks in place and the wordmark fades in within
          the same sticky scene, so they read as one merged section. */}
      <RadiatesSection starRef={globalStarRef} spinRef={spinProgressRef} dampRef={rotationDampRef} shrinkRef={shrinkRef} />

      {/* Buffer so RadiatesSection's sticky wordmark scene has fully unpinned and scrolled out of
          view before ParagraphReveal starts entering — without this gap the two sections'
          transition reads as overlapping since ParagraphReveal begins right where the sticky
          section's pin releases. 150vh made the following globe-travel handoff (see
          globeTravel's scrollTrigger in RadiatesSection) take too many scrolls end-to-end;
          60vh was still too much stacked on top of that travel distance on mobile, so mobile
          gets a smaller 30vh buffer here while desktop keeps 60vh. */}
      <div className="h-[30vh] lg:h-[20vh]" style={{ background: "#ffffff" }} />

      <ParagraphReveal />

      <OriginsSection />

      <BrandJourney />

      <div style={{ height: "120px", background: "#ffffff" }} />

      <ClassicsGlobeSection />

      <div id="collaboration" className="scroll-entrance" style={{ background: "#ffffff", padding: "120px 0", scrollMarginTop: "62px" }}>
        <CollaboratorsSection />
      </div>

      <SiteFooter />
    </>
  );
}
