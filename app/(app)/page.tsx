"use client";
import { useEffect, useRef } from "react";
import { ParagraphReveal } from "@/components/shared/ParagraphReveal";
import { UniquenessReveal } from "@/components/shared/UniquenessReveal";
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

function Hero({ starRef }: { starRef: React.RefObject<HTMLDivElement | null> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const tagRef     = useRef<HTMLDivElement>(null);
  const descRef    = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sts: any[] = [];
    let observer: IntersectionObserver | null = null;

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
      const isMobile = window.innerWidth < 768;
      const restX = isMobile ? 0 : 2;
      gsap.set(star,            { xPercent: -50, yPercent: -50, x: `${restX}vw`, y: 0, scale: 0.88, opacity: 0, force3D: true });
      gsap.set(tagRef.current,  { opacity: 0, y: 10 });
      gsap.set(descRef.current, { opacity: 0 });

      // The scroll-driven hide/show behavior below used to live inside the entrance timeline's
      // onComplete, so it only ever got set up once the ~1.7s intro animation finished. That's
      // fragile for no real reason — a live browser test found a case where the intro animation
      // never completed at all, which silently skipped ALL of this (the star never hid, and its
      // canvas — which also ignores the wrapper's pointer-events-none, fixed separately — sat
      // there blocking clicks on everything under it for the rest of the page). Setting this up
      // immediately means it's never held hostage by the intro animation's completion.

      // IntersectionObserver instead of a second ScrollTrigger: this only depends on the live
      // viewport position of #origins-section, never on cached trigger pixel offsets, so it
      // can't be thrown off by layout shifts elsewhere on the page (which was causing the hero
      // star to reappear mid-page). Targeting the section AFTER #paragraph-reveal keeps the
      // star visible through the Vision/globe section and only hides it once scrolled into
      // Origins.
      //
      // IntersectionObserver always fires once synchronously on `.observe()` with whatever the
      // current state is — at page load that's always "not intersecting" (Origins is far below
      // the fold), which would otherwise fire a redundant opacity:1 tween with overwrite:"auto"
      // right as the entrance animation is independently fading the star in, cutting that fade
      // short too. Skipping that first call avoids it; every real, scroll-driven call after it
      // still runs normally.
      const target = document.getElementById("origins-section");
      if (target) {
        let firstCall = true;
        observer = new IntersectionObserver(
          ([entry]) => {
            if (killed) return;
            if (firstCall) { firstCall = false; return; }
            if (entry.isIntersecting) {
              gsap.to(star, { opacity: 0, duration: 0.35, ease: "power3.in", overwrite: "auto" });
            } else if (entry.boundingClientRect.top > 0) {
              // target is below the viewport again → we scrolled back up above it.
              // Only touch opacity here — x/y/scale/rotation stay owned exclusively by
              // RadiatesSection's scrub tweens, so it can keep tracking scroll progress
              // uninterrupted (fixes the star getting stuck off-center on scroll-back-up).
              gsap.to(star, { opacity: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
            }
          },
          { rootMargin: "0px 0px -25% 0px", threshold: 0 }
        );
        observer.observe(target);
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
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[640px]"
      style={{
        background: "linear-gradient(180deg, #1130A2 0%, #1C38AE 16%, #7088D0 34%, #BAC8E8 52%, #ffffff 73%, #FFFFFF 100%)",
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
          width:  "clamp(280px, 78vw, 820px)",
          // Height used to be a flat 78vh, independent of width. On a tall mobile portrait
          // screen that produced a box far taller than it is wide (e.g. ~226px wide by ~660px
          // tall on a 390x844 phone) — the <Canvas> derives its camera aspect from that box, so
          // the horizontal field of view got squeezed and the star's side arms rendered clipped
          // at the container edges. Capping height at 100vw keeps the same ~0.78 width/height
          // ratio as the 78vw width above (this is what stopped the clipping — the ratio matters
          // more than the absolute size) instead of letting it run away on narrow/tall
          // viewports; 78vh still wins on normal desktop aspect ratios since it's the smaller
          // value there.
          height: "clamp(280px, min(78vh, 100vw), 920px)",
          willChange: "transform",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <Star3D className="w-full h-full" spinRef={spinProgressRef} />
        </div>
      </div>

      <Hero starRef={globalStarRef} />

      <RadiatesSection starRef={globalStarRef} spinRef={spinProgressRef} />

      <UniquenessReveal />

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
