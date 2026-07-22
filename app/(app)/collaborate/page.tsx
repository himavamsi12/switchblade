"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { Clock, ArrowUp } from "lucide-react";
import { SparkleMark } from "@/components/shared/SparkleMark";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteNav } from "@/components/shared/SiteNav";
import { SweepText } from "@/components/shared/SweepText";
import { GradientReveal } from "@/components/shared/GradientReveal";

const Star3D = dynamic(
  () => import("@/components/shared/Star3D").then(m => m.Star3D),
  { ssr: false, loading: () => null }
);

const VISION_TESTS = [
  { num: "(03)", q: "Does this make both partners better?", icon: "/collaborate/vision-icon-03.svg", border: "#0456DD" },
  { num: "(04)", q: "Does this help people get inspired?", icon: "/collaborate/vision-icon-04.svg", border: "#C7D1E2" },
] as const;

const STANDARD = [
  { num: "(01)", tag: "Quality",  title: "Craft first",       desc: "We partner for the work, never teh reach. The Object has to be undeniable on its own" },
  { num: "(02)", tag: "Winning",  title: "Mutual Elevation",  desc: "Every collaboration must take both names better - not just bigger. Greater than the sum" },
  { num: "(03)", tag: "Interest", title: "Cultural fit",      desc: "Shared interests make it fun to work together and explore. Different interests makes it exciting" },
  { num: "(04)", tag: "Rooted",   title: "Built to Last",     desc: "Considered objects over fast drops. We make fewer, better things - together" },
] as const;

const CASES = [
  { kind: "Sound & ART", title: "Shared - Archive Capsule",   desc: "A release across sound, image and motion - one story, many media",        chip: "#2755C5" },
  { kind: "Object",      title: "One Made-TO-Last Object",    desc: "A single considered product, engineered to outlast trend",                 chip: "#0F0E0C" },
  { kind: "Apparel",     title: "Shared - Archive Capsule",   desc: "Limited garments drawn from two design languages, made as one",             chip: "#2755C5" },
] as const;

const SCENARIO_TEXT = "wins only in one scenario: when what we build together helps people to stay and get inspired.";

const PX = "clamp(20px,5vw,80px)";
const SECTION = "clamp(80px,10vw,160px)";

function Tag({ children, tone = "dark", pill = false }: { children: React.ReactNode; tone?: "dark" | "light"; pill?: boolean }) {
  return (
    <span
      className="rise"
      style={{
        display: "inline-flex", alignItems: "center", alignSelf: "flex-start", border: `1px solid ${pill ? "#D8D8D8" : tone === "dark" ? "#363636" : "#A3A3A3"}`,
        borderRadius: pill ? 6 : 6, padding: pill ? "5px 10px" : "4px 6px",
        boxShadow: pill ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
        fontFamily: "var(--font-archivo)", fontWeight: pill ? 600 : 700,
        fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: tone === "dark" ? "#363636" : "#444",
      }}
    >
      {children}
    </span>
  );
}

export default function CollaboratePage() {
  const travelStarRef    = useRef<HTMLDivElement>(null);
  const scenarioAnchorRef = useRef<HTMLDivElement>(null);
  const collabAnchorRef   = useRef<HTMLDivElement>(null);
  const shrinkRef         = useRef<number>(1);
  // Both blue gradient areas on this page reveal through <GradientReveal> (see the JSX) — the
  // shared "the gradient falls in" overlay from the homepage hero: a white cover that slides down
  // out of view behind a feathered edge, rather than a flat opacity cross-fade. It's a pure CSS
  // transform transition (no gsap), so it stays independent of the star choreography's own async
  // gsap setup below. The hero's falls on page OPEN; the Collaboration-Standard one falls when
  // that section scrolls INTO VIEW.

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggers: any[] = [];
    let removeTravelTicker: (() => void) | null = null;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      // Single traveling star: this page used to have TWO separate, independent Star3D instances
      // — one static in the "wins only in one scenario" section, one static in "Let's
      // Collaborate" — each just fading in/out with its own section via the .rise class, with no
      // connection between them. Now there's ONE star, fixed-position, that visually rests at the
      // first anchor's spot, then travels down to dock at the second anchor's spot as the reader
      // scrolls between the two sections — same "live-rect ticker" approach as the homepage's O-
      // letter dock (page.tsx): no lifecycle callbacks own any state (those proved flaky under
      // scroll momentum elsewhere in this codebase — see RadiatesSection/page.tsx's own notes);
      // instead a gsap.ticker callback reads a ScrollTrigger's progress FRESH every frame and
      // derives position by convex-blending the two anchors' LIVE getBoundingClientRect() centers
      // — before the range starts that blend collapses to exactly the scenario anchor's live
      // position (so the star just tracks it at rest, robust to layout shifts/resize), and once
      // the range ends it collapses to exactly the collab anchor's live position (so the star
      // rides along with it, "docked", for as long as that section stays on screen).
      const star = travelStarRef.current;
      const scenarioAnchor = scenarioAnchorRef.current;
      const collabAnchor = collabAnchorRef.current;
      // Desktop only (1024, matching the collab anchor's own lg: breakpoint) — the collab anchor
      // is display:none below that, so its rect is degenerate (0,0,0,0) and there's nowhere for
      // the star to travel TO on mobile anyway. Mobile keeps the scenario section's own Star3D
      // visible instead (see its lg:invisible class above).
      if (star && scenarioAnchor && collabAnchor && window.innerWidth >= 1024) {
        gsap.set(star, { xPercent: -50, yPercent: -50, opacity: 0, transformOrigin: "50% 50%" });

        const travelTrigger = ScrollTrigger.create({
          // The star's travel speed IS this range: the tween is scrubbed, so the same journey
          // spread over more scroll distance reads slower. Widened at BOTH ends (was "bottom 70%"
          // → "top 30%") because the trip still read too fast — starting earlier, while the
          // scenario section's bottom is still low in the viewport, and finishing later, once the
          // collab section is higher up. Worth ~40vh of extra scroll for the same distance.
          // History: "bottom 65%"→"top 55%" too fast; "bottom 70%"→"bottom 25%" too slow;
          // "bottom 70%"→"bottom 50%" still a bit slow; "bottom 70%"→"top 75%" too fast;
          // "bottom 70%"→"top 30%" still too fast.
          trigger: scenarioAnchor.closest("section") ?? scenarioAnchor,
          start: "bottom 95%",
          endTrigger: collabAnchor.closest("section") ?? collabAnchor,
          end: "top 15%",
        });

        const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
        // Base scale/cameraZ are the scenario star's own tuned values (18.2 / 28) — the box stays
        // this fixed size the whole trip; only the MODEL shrinks (via shrinkRef) to visually
        // settle at this fraction once docked. 0.5 (bumped up from the original static collab
        // star's own ratio, 6.2/18.2 ≈ 0.34) — confirmed live as reading too small next to the
        // "Let's Collaborate" heading, wanted a bit bigger.
        const DOCKED_SHRINK = 0.5;
        let smoothP = 0;
        let visible = false;

        const travelTicker = (_time: number, deltaTime: number) => {
          const raw = travelTrigger.progress;
          const dt = Math.min(deltaTime / 1000, 0.1);
          smoothP += (raw - smoothP) * (1 - Math.exp(-dt / 0.1));
          const p = raw <= 0 && smoothP < 0.005 ? 0 : raw >= 1 && smoothP > 0.995 ? 1 : smoothP;
          const e = easeInOut(Math.max(0, Math.min(1, p)));

          const sRect = scenarioAnchor.getBoundingClientRect();
          const cRect = collabAnchor.getBoundingClientRect();
          const startX = sRect.left + sRect.width / 2, startY = sRect.top + sRect.height / 2;
          const targetX = cRect.left + cRect.width / 2, targetY = cRect.top + cRect.height / 2;

          gsap.set(star, {
            x: startX * (1 - e) + targetX * e,
            y: startY * (1 - e) + targetY * e,
          });
          shrinkRef.current = 1 + (DOCKED_SHRINK - 1) * e;

          // Only visible while at least one anchor is reasonably near the viewport — hidden
          // before the scenario section ever scrolls into view, and hidden again once the reader
          // has scrolled well past the collab section into the footer below it.
          const vh = window.innerHeight;
          const shouldShow = sRect.top < vh && cRect.bottom > -vh * 0.3;
          if (shouldShow !== visible) {
            visible = shouldShow;
            gsap.to(star, { opacity: visible ? 1 : 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
          }
        };
        gsap.ticker.add(travelTicker);
        removeTravelTicker = () => gsap.ticker.remove(travelTicker);
        triggers.push(travelTrigger);
      }

      gsap.fromTo(".hero-rise",
        { opacity: 0, y: 54 },
        { opacity: 1, y: 0, duration: 1.05, ease: "power3.out", stagger: 0.12, delay: 0.1 });

      gsap.utils.toArray<HTMLElement>(".rise").forEach((el) => {
        const tw = gsap.fromTo(el,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.95, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" } });
        if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
      });

      gsap.utils.toArray<HTMLElement>(".rise-group").forEach((grp) => {
        const items = grp.querySelectorAll(".rise-item");
        const tw = gsap.fromTo(items,
          { opacity: 0, y: 56 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.14,
            scrollTrigger: { trigger: grp, start: "top 82%" } });
        if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
      });

      // Color-only scroll scrub for the "wins only in one scenario..." text, word by word —
      // deliberately NOT a reveal (no opacity/position change, that's what .rise above already
      // does for the whole paragraph on entry). Animating the words as ONE span changed every
      // word's color together, all at once, the instant scroll crossed the trigger — reading as
      // an "immediate" flip rather than a gradual change. A timeline with each word's color tween
      // staggered across it, scrubbed by a single ScrollTrigger spanning the whole paragraph,
      // makes each word grey→darken in sequence as you scroll instead of all together.
      const scenarioWords = gsap.utils.toArray<HTMLElement>(".scenario-dim-word");
      if (scenarioWords.length) {
        gsap.set(scenarioWords, { color: "#B5B5B5" });
        const wordTl = gsap.timeline({
          scrollTrigger: {
            trigger: scenarioWords[0].closest("p"),
            start: "top 75%",
            end: "top 15%",
            scrub: true,
          },
        });
        wordTl.to(scenarioWords, { color: "#0D0D0D", ease: "none", stagger: 1 }, 0);
        if (wordTl.scrollTrigger) triggers.push(wordTl.scrollTrigger);
      }

      gsap.utils.toArray<HTMLElement>(".vision-cards").forEach((grp) => {
        const items = grp.querySelectorAll(".vision-card");
        const tw = gsap.fromTo(items,
          { opacity: 0, y: 110 },
          { opacity: 1, y: 0, duration: 0.85, ease: "power2.out", stagger: 0.35,
            scrollTrigger: { trigger: grp, start: "top 80%" } });
        if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
      });

      // The shuffle/stack effect below measures each card's on-page rect once and animates from
      // a computed off-screen stack position — on mobile this section's grid collapses to a
      // single column, and the stacked/rotated cards ended up visibly overlapping each other's
      // content mid-animation (one card's title bleeding into the previous card's image) instead
      // of resolving cleanly. Removed on mobile: cards just render in place, no animation.
      const isMobileCraftCards = window.innerWidth < 768;
      gsap.utils.toArray<HTMLElement>(".craft-cards").forEach((grp) => {
        const items = grp.querySelectorAll<HTMLElement>(".craft-card");
        if (isMobileCraftCards) {
          gsap.set(items, { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 });
          items.forEach(item => item.classList.add("craft-card-settled"));
          return;
        }
        const groupRect = grp.getBoundingClientRect();
        const centerX = groupRect.left + groupRect.width / 2;
        const centerY = groupRect.top + groupRect.height / 2;
        const n = items.length;

        const stackPos = Array.from(items).map((item, i) => {
          const r = item.getBoundingClientRect();
          const itemCenterX = r.left + r.width / 2;
          const itemCenterY = r.top + r.height / 2;
          const stackX = centerX - itemCenterX;
          const stackY = centerY - itemCenterY + 24;
          const rotation = (i - (n - 1) / 2) * 11;
          const offscreenY = stackY + window.innerHeight * 0.6;
          gsap.set(item, { opacity: 0, x: stackX, y: offscreenY, rotation, scale: 0.92, zIndex: i });
          return { x: stackX, y: stackY, rotation };
        });

        // Deal into a fanned stack one card at a time, then spread all cards to their final
        // grid positions together in one beat — that's the "shuffle" itself (dealing individual
        // cards into a stack); the spread is a single simultaneous release, not staggered.
        const tl = gsap.timeline({ scrollTrigger: { trigger: grp, start: "top 78%" }, defaults: { ease: "power2.out" } });
        items.forEach((item, i) => {
          tl.to(item, { opacity: 1, y: stackPos[i].y, scale: 0.96, duration: 0.4 }, i === 0 ? 0 : "+=0.07");
        });
        tl.to(items, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.5, ease: "power3.out" }, "+=0.08");
        tl.eventCallback("onComplete", () => items.forEach(item => item.classList.add("craft-card-settled")));
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      });

      ScrollTrigger.refresh();
    })();
    return () => { killed = true; triggers.forEach(t => t.kill()); removeTravelTicker?.(); };
  }, []);

  return (
    <>
      <SiteNav />

      {/* Fixed traveling star — desktop only (hidden below lg, matching the collab anchor's own
          breakpoint and the isMobile guard in the effect above). Starts invisible (opacity:0 set
          in the effect) and is positioned entirely by the travel ticker; box size matches the
          scenario anchor's own size since that's this star's resting/base scale (18.2/cameraZ
          28) — only the MODEL shrinks via shrinkRef as it travels, not this box. */}
      <div
        ref={travelStarRef}
        className="hidden lg:block fixed pointer-events-none"
        style={{ zIndex: 30, top: 0, left: 0, width: "clamp(320px,14vw,420px)", aspectRatio: "129.133/193.7" }}
      >
        <Star3D className="w-full h-full" scale={18.2} cameraZ={28} shrinkRef={shrinkRef} />
      </div>

      <style>{`
        .hero-rise,.rise,.rise-item{opacity:0;will-change:transform,opacity;}
        .vision-card{opacity:0;}
        .craft-card{opacity:0;will-change:transform,opacity;}
        .craft-card-settled.collab-scatter-card{transition:transform .35s ease;}
        .craft-card-settled.collab-scatter-card:hover{transform:scale(1.04) !important;}
      `}</style>

      {/* ── Hero ── */}
      <section
        // Mobile gets its own, more compressed gradient stops than desktop's. This section is
        // `minHeight` + flow content (not the homepage Hero's fixed `h-screen` with absolutely
        // positioned content), so on mobile its heavy stacked content (heading + description +
        // buttons) pushes its ACTUAL height well past one screen. Desktop's stops (white only
        // reached at 100%) are fine there since the box stays close to 100vh, but on mobile that
        // same 100%-white stop lands far below the fold — the visible portion never finishes
        // transitioning to white, reading as the gradient "stopping" mid-blue. Reaching white by
        // 55% instead keeps the transition complete within roughly one screen's worth of height
        // regardless of how tall the box actually grows, matching the homepage Hero's look.
        className="relative flex flex-col justify-end overflow-hidden bg-[linear-gradient(180deg,#0C40BE_0%,#0456DD_15%,#7C97E8_30%,#F4F6FC_45%,#FFFFFF_55%)] md:bg-[linear-gradient(180deg,#0C40BE_0%,#0456DD_28%,#7C97E8_55%,#F4F6FC_82%,#FFFFFF_100%)]"
        style={{
          minHeight: "100vh",
          padding: `112px ${PX} clamp(56px,7vw,96px)`,
          // Stacking context so the mask overlay's z-index:-1 stays above this section's own
          // gradient background but behind its content.
          isolation: "isolate",
        }}
      >
        {/* White cover over the gradient — z-index:-1 (above the section's gradient background,
            behind the static content), falling away on page open so the gradient pours in from the
            top. Present from first paint so there's no flash before it runs. */}
        <GradientReveal trigger="load" />
        {/* `maxWidth: 14ch` used to force this onto two lines, but `ch` is measured from the
            font's "0" glyph — for this bold/uppercase/tight-tracking font that glyph is narrower
            than the actual word "COLLABORATIONS" renders at. Since it's one unbreakable word, it
            overflowed past that width instead of wrapping, and this section's `overflow-hidden`
            clipped the overflow (the cut-off "S"). An explicit line break gives the same two-line
            layout deterministically, with no risk of a word overflowing its box. */}
        <h1
          style={{
            fontFamily: "var(--font-barlow)", fontWeight: 900,
            // Floor lowered from 44px: at that size "Collaborations" (one unbreakable word, 14
            // characters) rendered wider than a phone viewport's available width, overflowing
            // and getting clipped by this section's own overflow-hidden (the cut-off "S"/"TIONS").
            fontSize: "clamp(30px,7.5vw,64px)", lineHeight: 0.92, letterSpacing: "-0.02em",
            textTransform: "uppercase", marginBottom: "clamp(40px,6vw,60px)",
          }}
        >
          <SweepText tone="light" color="#FFFFFF">Collaborations<br />that Elevate</SweepText>
        </h1>

        {/* Below md this stacks and centers instead of relying on flex-wrap: with the row's two
            items each wider than a phone viewport, flex-wrap put each on its own line, but
            `justify-between` with a single item on a line falls back to flex-start — which put
            the star flush left instead of centered. */}
        <div className="flex flex-col items-center md:flex-row md:items-end md:justify-between gap-10 md:flex-wrap">
          <div className="hero-rise relative shrink-0" style={{ width: "clamp(190px,21.5vw,278px)", aspectRatio: "277.868/516.802" }}>
            <Star3D className="w-full h-full" scale={10} cameraZ={14} />
          </div>

          <div className="hero-rise flex flex-col items-start gap-[18px]" style={{ maxWidth: 560, flex: "1 1 420px" }}>
            <p style={{
              fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "clamp(15px,1.5vw,16px)",
              lineHeight: 1.4, color: "#363636", textTransform: "uppercase",
            }}>
              A major part of <span style={{ color: "#0456DD" }}>Switchblade&apos;s vision</span> is to explore categories and get comfortable with something not yet done.<br/> This calls for people/brands to come together and make something together which has not been done yet and explore new boundaries
            </p>
            <div className="flex items-center gap-[18px] flex-wrap">
              <a
                href="#pitch"
                className="flex items-center gap-3 rounded-xl text-white font-medium hover:opacity-85 transition-opacity"
                style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: 15, padding: "8px 8px 8px 20px" }}
              >
                Send Pitch
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "#fff", borderRadius: 8 }}>
                  <SparkleMark className="h-[16px] w-auto shrink-0 text-[#0F0E0C]" />
                </span>
              </a>
              <a
                href="#standard"
                className="flex items-center gap-3 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{ border: "1px solid #0F0E0C", color: "#0F0E0C", fontFamily: "var(--font-archivo)", fontSize: 15, padding: "12px 16px 12px 20px" }}
              >
                See the standard
                <Image src="/collaborate/icon-standard-arrow.svg" alt="" width={13} height={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision / single test ── */}
      <section style={{ background: "#FFFFFF", padding: `${SECTION} ${PX}` }}>
        <div className="mx-auto flex flex-col items-center text-center" style={{ maxWidth: 900 }}>
          <div className="rise" style={{ display: "inline-flex", border: "1px solid #363636", borderRadius: 6, padding: "4px 6px", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", color: "#363636" }}>Vision</span>
          </div>
          <h2 className="uppercase" style={{
            fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(32px,5vw,64px)",
            lineHeight: 1, letterSpacing: "-0.02em", width: "100%"
          }}>
            {/* Non-breaking space (not a plain " ") between "a" and "single": the reference
                keeps "single" glued to "must pass a" on the same line and only wraps "test"
                alone onto the next line — a plain space there lets the browser break exactly
                between "a" and "single" instead, which is the wrong split. */}
            <SweepText tone="dark" color="#0F0E0C" style={{ display: "inline" }}>{"Every collaboration must pass a "}</SweepText>
            <SweepText tone="dark" color="#0456DD" delay={150} style={{ display: "inline" }}>single test</SweepText>
          </h2>
        </div>

        <div className="vision-cards flex flex-wrap justify-center mx-auto" style={{ gap: "clamp(60px,10vw,160px)", marginTop: "clamp(56px,7vw,96px)", maxWidth: 900 }}>
          {VISION_TESTS.map((v, i) => (
            <div key={v.num} className="vision-card flex flex-col items-start" style={{
              position: "relative",
              // Bumped up from the original fixed 224x143 — clamp keeps it from overshooting on
              // very wide screens while giving noticeably more room than the old fixed size
              // everywhere else. Height follows the same ~1.566:1 ratio as the original 224/143.
              width: "clamp(224px,26vw,320px)", height: "clamp(143px,17vw,205px)", padding: "18px 19px",
              marginTop: i % 2 === 1 ? "clamp(24px,3.5vw,56px)" : 0, boxSizing: "border-box",
            }}>
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                borderTop: `1px solid ${v.border}`,
                borderLeft: `1px solid ${v.border}`,
                borderRight: `1px solid ${v.border}`,
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 82%)",
                maskImage: "linear-gradient(to bottom, black 0%, transparent 82%)",
              }} />
              {/* Was a fixed 98.28px (≈68.7% of the old fixed 143px height) — a percentage keeps
                  the same proportion now that the card's own height is responsive via clamp. */}
              <div className="flex flex-col justify-between" style={{ height: "69%", width: "100%", boxSizing: "border-box" }}>
                <div className="flex flex-col gap-[3px] uppercase" style={{ color: "#0F0E0C" }}>
                  <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: "clamp(7.5px,0.85vw,10px)" }}>{v.num}</span>
                  <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "clamp(15px,1.7vw,20px)" }}>{v.q}</span>
                </div>
                <Image src={v.icon} alt="" width={38} height={38} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Collaboration Standard ── */}
      <section
        id="standard"
        style={{
          padding: `${SECTION} ${PX}`, scrollMarginTop: 62,
          background: "linear-gradient(180deg,#0C40BE 0%,#0456DD 22%,#8FA6EA 48%,#FFFFFF 100%)",
          position: "relative",
          // Stacking context so the mask overlay's z-index:-1 stays above this section's gradient
          // background but behind its content.
          isolation: "isolate",
        }}
      >
        {/* White cover over the gradient — z-index:-1 (above the gradient background, behind the
            static content), falling away when this section scrolls into view. GradientReveal clips
            its own overhang, so this section doesn't need overflow:hidden (it deliberately has
            none — see the heading comment below). */}
        <GradientReveal trigger="scroll" />
        {/* Same fragile `ch`-based maxWidth pattern as the Hero heading above — "Collaboration"
            alone is 13 characters, leaving almost no margin before `14ch` under- or over-shoots
            depending on this font's actual glyph widths vs. its "0" glyph. Explicit break instead
            of relying on ch-unit wrapping. */}
        <h2 style={{
          fontFamily: "var(--font-barlow)", fontWeight: 900,
          // Floor lowered from 40px: same overflow as the Hero heading above — "Collaboration"
          // (13 characters, one unbreakable word) still didn't fit a phone viewport at 40px and
          // got clipped by this section's lack of horizontal room (no overflow-hidden here even,
          // so it just bled into/past the edge instead).
          fontSize: "clamp(30px,7vw,74px)",
          lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase",
          marginBottom: "clamp(48px,6vw,88px)",
        }}>
          <SweepText tone="light" color="#F9F8F6">Collaboration<br />Standard</SweepText>
        </h2>

        <div className="rise-group grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(16px,2vw,28px)" }}>
          {STANDARD.map((s) => (
            <div key={s.num} className="rise-item" style={{ background: "#fff", padding: "23px 22px", display: "flex", flexDirection: "column", minHeight: 220 }}>
              <div className="flex items-start justify-between">
                <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 600, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase", color: "#0456DD" }}>{s.num}</span>
                <Tag tone="light">{s.tag}</Tag>
              </div>
              {/* Fixed spacer instead of `justify-content: space-between` on the card: with
                  space-between, the title/desc block's own height (which varies card to card
                  depending on how many lines its description wraps to) determines how far it
                  sits from the top, since space-between only pins it flush to the bottom — a
                  shorter block reads as starting lower than a taller one. A fixed-height spacer
                  pins every card's title to the same top offset regardless of description length. */}
              <div style={{ height: "clamp(48px,7vw,72px)" }} />
              <div className="flex flex-col gap-4">
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", color: "#0F0E0C" }}>{s.title}</h3>
                <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, lineHeight: 1.35, letterSpacing: "-0.015em", color: "#444" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Where craft meets philosophy ── */}
      <section style={{ background: "#FFFFFF", padding: `${SECTION} ${PX}`, overflow: "hidden" }}>
        <div className="flex flex-col items-center text-center" style={{ marginBottom: "clamp(56px,7vw,96px)" }}>
          <div className="rise" style={{ display: "inline-flex", border: "1px solid #D3D3D3", borderRadius: 6, padding: "4px 6px", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", color: "#444" }}>Introducing</span>
          </div>
          <h2 className="uppercase" style={{
            fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(34px,6vw,74px)",
            lineHeight: 0.92, letterSpacing: "-0.02em", maxWidth: "22ch",
          }}>
            <SweepText tone="dark" color="#0F0E0C">Where Craft meets Philosophy</SweepText>
          </h2>
        </div>

        <div className="craft-cards grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(20px,2.5vw,28px)", maxWidth: 1160, margin: "0 auto" }}>
          {CASES.map((c) => (
            <article key={c.title + c.kind} className="craft-card collab-scatter-card" style={{
              background: "#fff", border: "1px solid #AAAAAA", borderRadius: 12, overflow: "hidden",
              display: "flex", flexDirection: "column", padding: "16px 17px 0",
              height: "100%", minHeight: 380,
            }}>
              <Tag pill>{c.kind}</Tag>
              <div className="relative flex items-center justify-center" style={{ height: 156, margin: "24px 0" }}>
                <div style={{ position: "absolute", width: 163, height: 156, borderRadius: 15, background: c.chip }} />
                <div className="relative" style={{ width: 82, height: 122 }}>
                  <Image src="/collaborate/collab-image.png" alt="" fill className="object-cover" sizes="82px" />
                </div>
              </div>
              <div className="flex flex-col gap-3 uppercase" style={{ paddingBottom: 24 }}>
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#0F0E0C" }}>{c.title}</h3>
                <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 16, lineHeight: 1.3, letterSpacing: "-0.02em", color: "#444", textTransform: "none" }}>{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Wins in one scenario ── */}
      {/* Had both a fixed `height` (capped at 400px) and a larger `minHeight` (up to 600px) at
          the same time — the explicit `height` always wins over `minHeight`, so combined with
          `overflow: hidden` this was clipping its own content (the paragraph + star box) any
          time they needed more than ~400px, which is routine on mobile where the paragraph wraps
          to more lines and the star's tall aspect-ratio box alone needs ~370-450px. Dropping the
          fixed `height` and keeping only `minHeight` lets the section grow to fit its content
          instead of truncating it, on every viewport. */}
      {/* minHeight lowered from clamp(360px,42vw,600px) — that floor, combined with this
          section's flex justify-content:center, was what was actually forcing the extra
          top/bottom space (filled with invisible centering slack), NOT the padding above.
          Lowering it is safe against the clipping bug described above: that was caused by a
          hard `height` CAP fighting minHeight, not by minHeight's own value — a floor only sets
          a MINIMUM, so content taller than it (the enlarged star) still grows past it exactly
          like before. */}
      {/* Bottom padding is much larger than the top's: the star's long lower spike reaches almost
          the full height of its box, so with the symmetric clamp(12px,1.5vw,24px) it ended up
          nearly touching the next section. The extra space below is measured from the star's tip,
          not from the box, which is why it doesn't look symmetric in the code. */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ background: "#FFFFFF", padding: "clamp(12px,1.5vw,24px) 0 clamp(120px,14vw,240px)", minHeight: "clamp(280px,30vw,460px)" }}>
        <p className="rise text-center" style={{
          fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: "clamp(22px,2.6vw,36px)",
          lineHeight: 1.3, letterSpacing: "-0.02em", color: "#0D0D0D", maxWidth: 700,
        }}>
          <span style={{ color: "#0456DD" }}>Switchblade</span>{" "}
          {SCENARIO_TEXT.split(" ").map((word, i) => (
            <span key={i} className="scenario-dim-word">
              {word}{i < SCENARIO_TEXT.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        {/* Desktop: this box is a layout anchor only — the fixed traveling star (see
            travelStarRef near the top of this component) reads it live via
            getBoundingClientRect() to know where to rest before traveling down to the "Let's
            Collaborate" anchor, and the actual Star3D inside is invisible there (lg:invisible)
            so it doesn't double up with the traveling copy. Mobile has no travel (the collab
            anchor below is lg-only, so there's nowhere to travel TO) and keeps showing this
            Star3D directly, exactly as before. */}
        <div ref={scenarioAnchorRef} className="rise shrink-0" style={{ width: "clamp(320px,14vw,420px)", aspectRatio: "129.133/193.7", marginTop: "clamp(24px,3vw,24px)" }}>
          <Star3D className="w-full h-full lg:invisible" scale={18.2} cameraZ={28} />
        </div>
      </section>

      {/* ── Let's collaborate ── */}
      <section id="pitch" style={{
        background: "#FFFFFF", paddingLeft: PX, paddingRight: PX,
        // Top padding reduced from SECTION (clamp(80px,10vw,160px), matching bottom) — this
        // section sat with too much dead space above "Let's Collaborate" before reaching it.
        paddingTop: "clamp(40px,5vw,80px)", paddingBottom: SECTION,
        scrollMarginTop: 62,
      }}>
        <div className="grid gap-16 grid-cols-1 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <h2 className="uppercase" style={{
              fontFamily: "var(--font-barlow)", fontWeight: 900,
              // Floor lowered from 40px: same overflow as the other headings on this page —
              // "Collaborate" (11 characters, one unbreakable word) still didn't fit a phone
              // viewport at 40px and got clipped past the edge.
              fontSize: "clamp(30px,7vw,74px)",
              lineHeight: 0.92, letterSpacing: "-0.02em", marginBottom: "clamp(20px,2.5vw,32px)",
            }}>
              <SweepText tone="dark" color="#0F0E0C">Let&rsquo;s<br />Collaborate</SweepText>
            </h2>
            <div className="rise">
              <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, color: "#929292", maxWidth: 440 }}>
                Tell us what we&apos;d make together. If it elevates both of us, we&apos;ll build it
              </p>
              {/* Layout anchor only (no Star3D) — see the matching comment on scenarioAnchorRef
                  above. The traveling star docks here (reading this box's live rect) and rides
                  along with it for the rest of the page. Mobile keeps this hidden, same as
                  before, since the desktop-only travel never brings the star here on mobile. */}
              <div ref={collabAnchorRef} className="hidden lg:block shrink-0" style={{ width: "clamp(250px,13.5vw,350px)", aspectRatio: "189.133/293.7", marginTop: "clamp(24px,3vw,40px)" }} />
            </div>

            <div className="rise flex items-center flex-wrap gap-4" style={{
              border: "1px solid #D9D9D9", borderRadius: 6, padding: "24px 24px 24px 17px",
              marginTop: "clamp(10px,6vw,20px)", width: "fit-content", maxWidth: "100%",
            }}>
              <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, color: "#929292" }}>
                Not ready to pitch? Stay in the orbit -
              </span>
              <Link href="/journal" style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, color: "#0456DD", textDecoration: "underline" }}>
                Follow the archive
              </Link>
            </div>
          </div>

          <div className="rise-group flex flex-col gap-11">
            <div className="rise-item" style={{ background: "#fff", border: "1px solid #D8D8D8", borderRadius: 15, padding: "24px 24px 18px" }}>
              <div className="flex items-center justify-between gap-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-[14px]">
                    <Image src="/collaborate/google-meet.svg" alt="Google Meet" width={44} height={36} />
                    <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 600, fontSize: 24, color: "rgba(0,0,0,0.5)" }}>Book a quick call</span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <Clock size={18} color="#666565" strokeWidth={2} />
                    <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 18, textTransform: "uppercase", color: "#666565" }}>15 Minutes</span>
                  </div>
                </div>
                <ArrowUp size={22} color="#0D0D0D" style={{ transform: "rotate(48deg)" }} />
              </div>
            </div>

            <div className="rise-item flex items-center justify-between gap-4 flex-wrap">
              <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>Book a meeting</span>
              <span style={{ flex: 1, minWidth: 40, height: 1, background: "#D8D8D8" }} />
              <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>or</span>
              <span style={{ flex: 1, minWidth: 40, height: 1, background: "#D8D8D8" }} />
              <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>Drop a Pitch</span>
            </div>

            <form className="rise-item flex flex-col gap-[18px]" style={{ border: "1px solid #D8D8D8", borderRadius: 12, padding: "32px 24px" }} onSubmit={e => e.preventDefault()}>
              {[
                { label: "You OR Your Craft",             type: "input" },
                { label: "Portfolio link",                type: "input" },
                { label: "What would we make together",  type: "input" },
                { label: "E-mail or phone number",        type: "input" },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-11">
                  <label style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>{f.label}</label>
                  <input type="text" style={fieldStyle} onFocus={e => (e.target.style.borderBottomColor = "#0456DD")} onBlur={e => (e.target.style.borderBottomColor = "rgba(13,13,13,0.14)")} />
                </div>
              ))}
              <button type="submit" style={{
                height: 40, background: "#000", color: "#fff", border: "none", borderRadius: 8,
                fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 16, letterSpacing: "-0.02em",
                cursor: "pointer", transition: "opacity 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Send the pitch
              </button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "none", border: "none",
  borderBottom: "1px solid rgba(13,13,13,0.14)", padding: "0 0 8px",
  fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: 15,
  color: "#0D0D0D", outline: "none", resize: "none", transition: "border-color 0.2s",
};
