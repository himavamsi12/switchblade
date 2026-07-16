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
import { SweepText } from "@/components/shared/SweepText";
import dynamic from "next/dynamic";
import type React from "react";

const Star3D = dynamic(
  () => import("@/components/shared/Star3D").then(m => m.Star3D),
  { ssr: false, loading: () => null }
);

function Hero({ starRef, shrinkRef }: { starRef: React.RefObject<HTMLDivElement | null>; shrinkRef: React.RefObject<number> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const tagRef     = useRef<HTMLDivElement>(null);
  const descRef    = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sts: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hideTrigger: any = null;
    let tickerFn: ((time: number, deltaTime: number) => void) | null = null;
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
      const restX = isMobile ? 0 : 1;
      // transformOrigin MUST be the element's own center, explicitly. Without it, RadiatesSection's
      // scale-down was shrinking the star toward its LEFT EDGE instead of its center — measured as
      // the star drifting ~130px left as it scaled to 0.7 (exactly (1-0.7)×halfWidth for an ~820px
      // box, the signature of a left-edge origin). Pinning the origin to 50% 50% makes the scale
      // shrink symmetrically about the center, so the star stays put horizontally while it resizes.
      gsap.set(star,            { xPercent: -50, yPercent: -50, x: `${restX}vw`, y: 0, scale: 0.88, opacity: 0, force3D: true, transformOrigin: "50% 50%" });
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
        // start: "bottom 90%" of paragraph-reveal — safely AFTER globeTravel's scrub range ends
        // (its end is paragraph-reveal's top at 45% viewport; the section is ~780px tall, so its
        // bottom is still well below the viewport at that moment), so the two never fight over
        // the star's x/y. end: the O's own top reaching 60% down the viewport — the star is
        // fully docked while the heading sits in the lower half of the screen.
        hideTrigger = ScrollTrigger.create({
          trigger: paragraphRevealTarget,
          start: "bottom 90%",
          endTrigger: oLetter,
          end: "top 60%",
        });
        const dockTrigger = hideTrigger;

        const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
        // The docked-beside-the-globe rest state the star is guaranteed to be in when this
        // trigger's range begins (globeTravel finishes well before it — see `start` above):
        // globeTravel parks it at x:22vw / y:8vh, and RadiatesSection's scaleTween holds the
        // model shrink at 0.7 on desktop. These are CONSTANTS, deliberately not captured from
        // the star's live position on entry — a first attempt did capture on entry, and a fast
        // scroll (or scrollTo jump) that crosses the boundary while the earlier scrubbed tweens
        // are still catching up sampled a transient mid-flight position, poisoning the whole
        // path. Deriving the start analytically makes every frame a pure function of scroll
        // progress + live layout, with no state to poison.
        const DOCK_START_SHRINK = 0.7;
        // Smoothed copy of the trigger's raw progress. Raw scroll progress arrives in discrete
        // per-event steps (a wheel notch can move several % of this range at once) — mapping it
        // straight to position/shrink made the star visibly step/jump whenever scrolling paused
        // mid-travel. Every scrubbed animation on this page smooths this with `scrub: 0.3`; this
        // ticker isn't a scrub, so it applies the equivalent itself: an exponential ease toward
        // the raw value each frame (~0.15s time constant), frame-rate independent via deltaTime.
        let smoothP = 0;
        // Whether the previous frame wrote to the star — lets the exit path below run its
        // one-time final write on the exact frame the range is left, then go fully idle.
        let wasActive = false;

        tickerFn = (_time: number, deltaTime: number) => {
          const raw = dockTrigger.progress;

          // Below the range: go idle IMMEDIATELY — do NOT let the smoothing tail keep decaying
          // and writing for another ~0.5s. On a fast reverse scroll, globeTravel's own reverse
          // scrub finishes its catch-up within that window, and every frame it rendered was
          // being clobbered by this ticker's later-in-frame write; once both settled, nothing
          // ever re-rendered x again, leaving the star stuck at the globe-side offset all the
          // way back up to the hero. One final write at exactly p=0 (the parked-beside-globe
          // state, which is what the dead zone between this range and globeTravel's expects)
          // and then full silence hands ownership back to globeTravel cleanly.
          if (raw <= 0) {
            smoothP = 0;
            if (!wasActive) return;
            wasActive = false;
            // fall through once with p = 0 for the final parked-state write
          } else {
            wasActive = true;
            const dt = Math.min(deltaTime / 1000, 0.1);
            // 0.1s time constant (was 0.15) — just enough to round off per-wheel-notch steps,
            // tight enough that shrink/position read as locked to the scroll rather than
            // continuing to drift for a beat after scrolling stops. Roughly matches the feel of
            // the scrub: 0.3 used by the page's other scrubbed animations.
            smoothP += (raw - smoothP) * (1 - Math.exp(-dt / 0.1));
          }
          // Snap the last imperceptible sliver so the docked state is EXACTLY glued to the O
          // (otherwise the asymptote leaves the star a fraction of a pixel behind the O forever).
          const p = raw >= 1 && smoothP > 0.995 ? 1 : smoothP;

          const vw = window.innerWidth, vh = window.innerHeight;
          const oRect = oLetter.getBoundingClientRect();
          const targetX = oRect.left + oRect.width / 2;
          const targetY = oRect.top + oRect.height / 2;
          // Canonical pre-dock star center in viewport coords: wrapper layout center is at
          // (50vw, 38vh) (left:50% + xPercent:-50, top:38% + yPercent:-50), plus the
          // globeTravel-applied transforms of x:22vw / y:8vh.
          const startX = 0.5 * vw + 0.22 * vw;
          const startY = 0.38 * vh + 0.08 * vh;
          // The wrapper's transform-less layout center — what a given gsap x/y is relative to.
          const baseX = 0.5 * vw;
          const baseY = 0.38 * vh;

          const e = easeInOut(Math.min(1, Math.max(0, p)));
          // Convex blend between the fixed canonical start and the LIVE target: always lands
          // exactly on the O no matter how the O moves mid-travel, and can never overshoot
          // (the position is by construction between the two endpoints).
          const wantX = startX * (1 - e) + targetX * e;
          const wantY = startY * (1 - e) + targetY * e;
          gsap.set(star, {
            x: wantX - baseX,
            y: wantY - baseY,
            // Tilts partway through the travel and straightens back out by the time it docks.
            rotation: -14 * Math.sin(Math.PI * e),
          });
          // Final model shrink derived from live layout so it responds to font size / viewport:
          // the model visually fills ~78% of its wrapper box at shrink 1, and the docked star
          // should stand ~1.5x the O's glyph height (vertical tips poking above/below the
          // letter, per the reference image). The wrapper's height is computed from its own CSS
          // clamp (see the style on this element) rather than getBoundingClientRect — the rect
          // is the ROTATED bounding box, which grows up to ~30% while the star is tilted
          // mid-travel, and that wobble fed straight into the shrink target (the "not properly
          // shrinking" pumping effect).
          const wrapH = Math.min(940, Math.max(280, Math.min(0.84 * vh, vw)));
          const finalShrink = Math.min(0.35, Math.max(0.05, (oRect.height * 1.5) / (wrapH * 0.78)));
          shrinkRef.current = DOCK_START_SHRINK + (finalShrink - DOCK_START_SHRINK) * e;
        };
        gsap.ticker.add(tickerFn);
        removeTicker = () => { if (tickerFn) gsap.ticker.remove(tickerFn); };
      }

      // The star stays centered through the hero exit — no more corner-parking/tilt. It hands
      // off, still centered at scale 1, straight into RadiatesSection's own scroll-driven
      // rotate/shrink choreography right below the hero.
      tl = gsap.timeline();
      tl
        .to(star,            { scale: 1, opacity: 1, duration: 1.0, ease: "power3.out" }, 0)
        .to(tagRef.current,  { opacity: 1, y: 0,    duration: 0.4,  ease: "power3.out" }, 0.85)
        .to(descRef.current, { opacity: 1,           duration: 0.5,  ease: "power2.out" }, 1.2);
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
      <div className="absolute bottom-0 inset-x-0 z-30 site-px pb-12 flex flex-col items-center text-center gap-3">
        <h1
          style={{
            fontSize: "clamp(40px, 7.5vw, 64px)",
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.01em",
          }}
        >
          <SweepText tone="dark" color="#0F0E0C" trigger="load" delay={950}>
            ANYTHING BUT<br />EVERYTHING
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
          The superpower that you carry everywhere.{" "}
          <span style={{ color: "var(--blue)" }}>Invisible, until the world demands it.</span>{" "}
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

  // The star's CSS wrapper box being bigger on mobile didn't actually make the star itself look
  // bigger — Star3D's camera uses a fixed FOV, so the model only fills a fixed FRACTION of
  // whatever box it's given; growing the box just gave it more empty margin. Enlarging the model
  // itself means bumping the `scale` prop (3D units), which is what actually determines how much
  // of the canvas the star fills, regardless of box size. Desktop's 2.2 (Star3D's own default)
  // stays untouched.
  const [starScale, setStarScale] = useState(2.2);
  useEffect(() => {
    // 3.4 was tuned specifically for narrow phone widths (~375-428px), where the star's CSS
    // wrapper box (sized via vw/vh clamps in the star's own style below) is small. That same flat
    // 3.4 was previously applied to the ENTIRE <1024 range as a step function — fine on phones,
    // but on a tablet-width screen (e.g. 1023px) the wrapper box itself is already much bigger
    // (it scales fluidly with viewport width), so reusing the phone's scale on top of an
    // already-large box rendered a hugely oversized star that overlapped the labels and pushed
    // "Love" off the bottom of the screen. Interpolating linearly from 3.4 at 428px down to 2.2
    // at 1024px (Star3D's own desktop default) keeps both original endpoints exactly as tuned,
    // while giving the tablet range in between a proportionate size instead of a cliff.
    const computeScale = () => {
      const w = window.innerWidth;
      if (w <= 428) return 3.4;
      if (w >= 1024) return 2.2;
      return 3.4 + (2.2 - 3.4) * ((w - 428) / (1024 - 428));
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
      <SiteNav />

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
          height: "clamp(280px, min(84vh, 100vw), 940px)",
          willChange: "transform",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <Star3D className="w-full h-full" scale={starScale} spinRef={spinProgressRef} dampRef={rotationDampRef} shrinkRef={shrinkRef} />
        </div>
      </div>

      <Hero starRef={globalStarRef} shrinkRef={shrinkRef} />

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
      <div className="h-[30vh] lg:h-[60vh]" style={{ background: "#ffffff" }} />

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
