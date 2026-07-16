"use client";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type Placement = {
  key: string;
  word: string;
  dotFirst: boolean; // dot renders before the word (dot sits on the star-facing side)
  // top/left moved out of `style` and into responsive Tailwind classes (posClass) — mobile wants
  // Strength/Love pushed nearer the top/bottom edges and Kindness/Compassion pushed further out
  // to the sides than the desktop layout, so these need a real breakpoint split rather than one
  // shared percentage. `style` keeps just the transform (identical at every size).
  posClass: string;
  style: React.CSSProperties;
  justify: React.CSSProperties["justifyContent"];
};

const LABELS: Placement[] = [
  {
    key: "strength",
    word: "Strength",
    dotFirst: true,
    justify: "center",
    // max-lg:/lg: (not max-md:/md:) — matches the isMobile JS threshold below (1024, not 768),
    // so tablet widths (768-1023) keep the same tuned label positions as phones instead of
    // jumping to values that were only ever tuned against real desktop widths.
    posClass: "max-lg:top-[21%] lg:top-[13%] left-1/2",
    style: { transform: "translate(-50%, 0)" },
  },
  {
    key: "compassion",
    word: "Compassion",
    dotFirst: true,
    justify: "flex-start",
    posClass: "top-[38%] max-lg:left-[68%] lg:left-[62%]",
    style: { transform: "translate(0, -50%)" },
  },
  {
    key: "love",
    word: "Love",
    dotFirst: true,
    justify: "center",
    posClass: "max-lg:top-[65%] lg:top-[74%] left-1/2",
    style: { transform: "translate(-50%, 0)" },
  },
  {
    key: "kindness",
    word: "Kindness",
    dotFirst: false,
    justify: "flex-end",
    posClass: "top-[38%] max-lg:left-[22%] lg:left-[38%]",
    style: { transform: "translate(-100%, -50%)" },
  },
];

const DOT: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 2,
  background: "#0D0D0D",
  flexShrink: 0,
};

// [SHARP EDGE] / [SOFT HEART] annotation style — merged in from the former UniquenessReveal
// section (kept identical) so the SWITCHBLADE wordmark now reveals inside THIS sticky scene.
const ANNO: React.CSSProperties = {
  fontFamily:    "var(--font-ibm-mono)",
  fontSize:      "clamp(13px, 1.15vw, 18px)",
  fontWeight:    700,
  letterSpacing: "0.10em",
  textTransform: "uppercase" as const,
  whiteSpace:    "nowrap",
};

export function RadiatesSection({
  starRef,
  spinRef,
  dampRef,
  shrinkRef,
}: {
  starRef: RefObject<HTMLDivElement | null>;
  spinRef: RefObject<number>;
  dampRef?: RefObject<number>;
  shrinkRef?: RefObject<number>;
}) {
  const outerRef    = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const charRefs   = useRef<Record<string, (HTMLSpanElement | null)[]>>({});
  const dotRefs    = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tlEnter: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tlExit: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let globeTravel: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scaleTween: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scaleTrigger: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wordmarkTween: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wordmarkTrigger: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let starHideTrigger: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let normalizer: any = null;
    let observer: IntersectionObserver | null = null;

    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      // Root cause of the persistent "jumping" report, found by measurement: it wasn't a bug in
      // the tween logic (frame data showed x/y/scale moving in perfect lockstep) — it was
      // `scrub`'s own catch-up lag. Raw wheel/trackpad scroll delivers scroll position in
      // irregular chunks, not a smooth stream, so a scrub tween is always choosing between two
      // bad options: track those chunks tightly (visible per-notch snapping) or ease toward them
      // with a second of lag (the star keeps drifting for a while after your hand/scroll stops —
      // reads as moving on its own, disconnected from the actual scroll). Tuning the scrub number
      // back and forth can't fix this since both symptoms come from the same root cause: the raw
      // input itself. normalizeScroll smooths that raw input at the platform level, so a much
      // tighter scrub can track it directly with neither problem. This changes scroll feel
      // page-wide (adds a bit of inertia to every scroll interaction, not just this section) —
      // it's the standard fix GSAP recommends for exactly this complaint.
      //
      // Desktop only. normalizeScroll intercepts touchmove itself to do the smoothing, which as
      // a side effect blocks the browser's native pull-to-refresh gesture site-wide — a mobile
      // affordance users expect to work everywhere, not just outside this one section. Desktop
      // has no such gesture to break, so it keeps the smoothing (with allowNestedScroll: true,
      // otherwise it also hijacks touches inside nested scrollable elements elsewhere on the
      // page, like OriginsSection's popup sheet, routing them to the page scroll instead of
      // letting that element scroll itself).
      // Threshold raised from 768 to 1024 (Tailwind's lg breakpoint) — see the matching comment
      // in Hero's own effect in page.tsx for why tablets (768-1023) now take the "mobile" branch
      // here too, consistently with there and with ParagraphReveal.
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) {
        normalizer = ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
      }

      const star = starRef.current;
      const section = outerRef.current;
      if (!section || !star) return;

      // 26vw parks the star beside the globe image on desktop's side-by-side layout. On mobile
      // that layout stacks into a single column (ParagraphReveal), so there's no globe beside the
      // text to park next to — 26vw would just push the star off-center toward the right edge.
      // Centered (0) is the right resting spot there instead.
      const globeX = isMobile ? "0vw" : "22vw";

      // Target shrink factor: the 3D star model shrinks to 70% of full size (about its OWN
      // center, inside the canvas — see the scaleTween/shrinkRef note below) as the reader scrolls
      // from RadiatesSection into the SWITCHBLADE wordmark section. `shrinkRef` is a FRACTION of
      // Star3D's base `scale` prop (app/(app)/page.tsx), so the absolute docked size = scale *
      // dockedScale. On the mobile/tablet branch the base scale itself is no longer a flat 3.4 —
      // page.tsx now interpolates it down to 2.2 across the tablet width range (see its own
      // comment for why) — so this has to divide by that SAME live base scale, not a hardcoded
      // 3.4, or the docked size would drift smaller than intended at tablet widths. Always
      // targets an absolute docked size of ~2.2 on mobile/tablet, matching what a flat 2.2/3.4
      // used to give phones exactly.
      const mobileBaseScale = window.innerWidth <= 428 ? 3.4 : window.innerWidth >= 1024 ? 2.2 : 3.4 + (2.2 - 3.4) * ((window.innerWidth - 428) / (1024 - 428));
      const dockedScale = isMobile ? 2.2 / mobileBaseScale : 0.7;

      gsap.set(headingRef.current, { opacity: 0, y: -14 });

      const labelGroups = LABELS.map((l) => {
        const chars = (charRefs.current[l.key] ?? []).filter(
          (el): el is HTMLSpanElement => el !== null
        );
        const dot = dotRefs.current[l.key];
        const sequence = l.dotFirst ? [...(dot ? [dot] : []), ...chars] : [...chars, ...(dot ? [dot] : [])];
        gsap.set(sequence, { opacity: 0, filter: "blur(3px)" });
        return sequence;
      });

      const spin = { v: 0 };
      spinRef.current = 0;

      // Plays once in real time as soon as the section reaches the top of the viewport — the
      // star does exactly one clean spin while the heading appears, then each label types in
      // one at a time. Not scroll-scrubbed: scrolling shouldn't drag the spin back and forth,
      // it should just trigger the sequence (and reverse it if you scroll back above it).
      //
      // IntersectionObserver instead of a GSAP ScrollTrigger onEnter/onLeaveBack pair: this
      // section's height depends on layout that shifts as the 3D model/fonts finish loading,
      // which can leave a scroll-trigger's cached pixel start/end stale. IntersectionObserver
      // re-checks against the live layout every time, so it can't miss the crossing. The
      // rootMargin collapses the "root" to a 0px sliver at the very top of the viewport, so
      // isIntersecting flips true exactly when the section's top edge reaches the top of the
      // viewport (same trigger point as ScrollTrigger's "top top"), and stays true for the
      // whole section since it's much taller than the viewport — flipping false again only
      // once scrolled back above it.
      tlEnter = gsap.timeline({ paused: true });

      // No TWEEN for the star's settle-down move (that's the part that caused the old
      // scroll-jump complaints — animating over wall-clock time while the reader is mid-scroll).
      // But removing the tween entirely left the star sitting at its Hero position (vertically
      // centered) for this section's whole entrance/spin phase, which is tall enough to overlap
      // the "A mark that Radiates" heading and the "Strength" label above it. gsap.set is instant
      // (zero duration) rather than animated, so it can push the star down the moment the section
      // is entered without reintroducing motion-during-scroll — it just snaps to the correct
      // resting spot for this section, same as it would have looked once the old tween finished.
      let firstCall = true;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (killed) return;
          if (firstCall) { firstCall = false; return; }
          if (entry.isIntersecting) {
            tlEnter.play();
            // Desktop only — mobile's whole settle motion is owned by scaleTween alone (start:
            // "top 60%", see below), one continuous tween with no competing move here.
            // This used to be an INSTANT gsap.set rather than a tween — that snapped the star to
            // 5vh in a single frame the moment the section engaged, which is exactly what read as
            // a jump/jerk right as the pinned scene locked in. It was originally made instant to
            // dodge a race with scaleTween's own y tween, but that one only starts later (52%
            // top, well past this trigger point), so a short real tween is safe here now and
            // reads as a settle instead of a snap.
            if (!isMobile) gsap.to(star, { y: "5vh", duration: 0.35, ease: "power2.out", overwrite: "auto" });
          } else if (entry.boundingClientRect.top > 0) {
            tlEnter.reverse();
            if (!isMobile) gsap.to(star, { y: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          }
        },
        { rootMargin: "0px 0px -100% 0px", threshold: 0 }
      );
      observer.observe(section);

      tlEnter
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0)
        .to(spin, {
          v: 1,
          duration: 1.6,
          ease: "power1.inOut",
          onUpdate() { spinRef.current = spin.v; },
        }, 0.2)
        .to(labelGroups[0], { opacity: 1, filter: "blur(0px)", duration: 0.35, stagger: { each: 0.045, from: "start" } }, 1.9)
        .to(labelGroups[1], { opacity: 1, filter: "blur(0px)", duration: 0.35, stagger: { each: 0.045, from: "start" } }, 2.5)
        .to(labelGroups[2], { opacity: 1, filter: "blur(0px)", duration: 0.35, stagger: { each: 0.045, from: "start" } }, 3.1)
        .to(labelGroups[3], { opacity: 1, filter: "blur(0px)", duration: 0.35, stagger: { each: 0.045, from: "start" } }, 3.7);

      // Scroll-scrubbed exit: once the reader keeps scrolling past the entrance dwell, the
      // heading/labels fade out. (The star's own shrink is handled separately by scaleTween
      // below — a time-based tween, not this scrub.) This fade stays scroll-tied since it's a
      // release keyed to scroll position, not a one-shot flourish.
      tlExit = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          // Mobile fades the labels out immediately (0%→20% of its own 500vh — see outerRef's
          // height below), leaving a full 2-screen GAP of nothing (20%→60%) before the
          // wordmark appears at 60%, so section 2 genuinely finishes disappearing before section
          // 3 starts — previously the fade (45%→64%) overlapped the wordmark's old 50% start,
          // so the wordmark began appearing WHILE labels were still mid-fade, reading as an
          // immediate cut instead of a clean handoff. Desktop keeps its original 45%→64%.
          start: isMobile ? "0% top" : "45% top",
          // Desktop end pulled up from 64% to 56% — the wordmark lives at 75% of this section
          // (see wordmarkTrigger below), and with the fade ending at 64% only ~57vh separated
          // the labels from the wordmark. Scrolling BACK from the wordmark, the labels started
          // reappearing almost immediately after the wordmark faded, so the two scenes read as
          // butted directly against each other. Ending at 56% leaves a full ~19% of 520vh
          // (~100vh — one screen of scroll) of genuinely empty gap between the labels and the
          // wordmark in BOTH directions: labels fully gone one screen before the wordmark
          // appears going down, and one screen of nothing after the wordmark disappears before
          // the labels return going back up.
          end: isMobile ? "20% top" : "56% top",
          // With normalizeScroll now smoothing the raw input above, this can track scroll much
          // more tightly than the old scrub: 1 (which existed to paper over raw wheel choppiness
          // that normalizeScroll now handles at the source) — a full second of catch-up lag was
          // itself the "star drifts on its own after you stop scrolling" complaint. 0.3 still
          // takes the hard edge off frame-to-frame noise without leaving a noticeable lag.
          scrub: 0.3,
          onEnter: () => {
            // tlEnter reveals the 4 labels over ~4s of real (wall-clock) time. tlExit's very
            // first tween fades those same elements' opacity back to 0 as soon as scroll crosses
            // this trigger point, independent of whether tlEnter's reveal has actually finished.
            // Scroll fast enough and you cross this point before all 4 labels have appeared —
            // tlEnter is still writing opacity:1 to some of them while tlExit is simultaneously
            // writing opacity:0 to all of them, and whichever tween last touched a given element
            // that frame wins. That's "sometimes two labels show, sometimes none," entirely
            // dependent on scroll speed. Snapping tlEnter to its end here guarantees every label
            // is already fully revealed (opacity 1) the instant before tlExit starts fading them
            // out — so the fade always has a consistent, complete starting point no matter how
            // fast the reader scrolled to reach it.
            tlEnter.progress(1);
          },
        },
      });

      tlExit.to(
        [headingRef.current, ...labelGroups.flat()],
        { opacity: 0, duration: 0.3, ease: "none" },
        0
      );

      // The star's shrink is SCRUBBED — locked to scroll position across a range, so the model
      // shrinks exactly in step with how far you've scrolled and stops the moment you stop.
      // (An earlier version was a time-based 0.9s tween that merely PLAYED when a trigger point
      // was crossed — which meant a single scroll flick crossed the point and the star then
      // visibly kept shrinking on its own clock AFTER the scroll had already stopped, reading
      // as disconnected from the scroll. That time-based approach predates normalizeScroll;
      // with the raw input now smoothed at the platform level, a tight scrub tracks scroll
      // smoothly without the per-notch choppiness that originally motivated going time-based.)
      //
      // Crucially the SIZE change animates shrinkRef — a factor Star3D applies to the 3D MODEL
      // about its own center — NOT a CSS scale on the wrapper box. CSS-scaling the box shrank the
      // star toward one side, because the star isn't centered inside its portrait canvas (it's
      // camera-framed), so the box's geometric center ≠ the star's visual center. Shrinking the
      // model in 3D scales it about its own geometry, so it collapses straight toward its center —
      // no side drift. A small upward CSS `y` move on the wrapper IS included here (unlike x, which
      // stays untouched) — y is a plain translate, not affected by the 3D-model transform-origin
      // issue that caused the x drift, so moving it is safe and is what puts clearance between the
      // star and the wordmark once both are visible together.
      const shrinkProxy = { v: 1 };
      scaleTween = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          // Desktop range sits after tlExit's label fade begins (start: "45% top" above) and
          // completes just before the wordmark reveal (75% below) — percentages are of this
          // section's own scroll height. Mobile shrinks DURING the incoming transition from
          // Hero ("top 60%" = section top at 60% viewport, still scrolling up into view),
          // finishing exactly as the sticky pin locks in ("top top") — same envelope the old
          // play/reverse version covered, now distributed across it instead of dumped at entry.
          start: isMobile ? "top 60%" : "52% top",
          end: isMobile ? "top top" : "70% top",
          scrub: 0.3,
        },
      })
        .to(shrinkProxy, {
          v: dockedScale,
          ease: "power2.inOut",
          onUpdate: () => { if (shrinkRef) shrinkRef.current = shrinkProxy.v; },
        }, 0)
        .to(star, {
          // Mobile owns its ENTIRE settle-down motion here (the entrance IntersectionObserver
          // above doesn't touch y on mobile at all) — one continuous scrubbed move from the
          // Hero baseline (0) straight to its final resting spot. 6vh matches the settle
          // amount originally tuned via an old instant set.
          y: isMobile ? "6vh" : "-6vh",
          ease: "power2.inOut",
          force3D: true,
        }, 0);
      scaleTrigger = scaleTween.scrollTrigger;

      // SWITCHBLADE wordmark reveal — the former UniquenessReveal section, now merged INTO this
      // sticky scene. Same time-based play/reverse pattern as the shrink: it fades + rises in,
      // and reverses on scroll-back. Not scrubbed, so it's smooth regardless of scroll speed.
      //
      // Pushed well after the shrink (was 68%, right on scaleTrigger's heels at 60% — close
      // enough in scroll distance that a normal scroll flick crossed both trigger points almost
      // at once, so the wordmark started appearing WHILE the star was still mid-shrink/labels
      // still fading, reading as "section 2 and 3 colliding". Now there's a full extra screen's
      // worth of scroll (~1 viewport) between the shrink finishing and the wordmark starting.
      gsap.set(wordmarkRef.current, { opacity: 0, y: 30 });
      wordmarkTween = gsap.to(wordmarkRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        paused: true,
      });
      wordmarkTrigger = ScrollTrigger.create({
        trigger: section,
        // Mobile is paced in explicit screen-fulls against its own 500vh total height (see
        // outerRef below): labels fade out over 0%→20%, then a full 2-screen GAP of nothing
        // (20%→60%) so section 2 has genuinely finished disappearing, THEN the wordmark appears
        // at 60% (300vh), stays fully visible for a full screen's dwell (up to starHideTrigger's
        // 80% below), then the star heads out over the screen after that. Desktop keeps 75%.
        start: isMobile ? "60% top" : "75% top",
        onEnter: () => wordmarkTween.play(),
        onLeaveBack: () => wordmarkTween.reverse(),
      });

      // Mobile only: the star disappears after the SWITCHBLADE wordmark, once its one-screen
      // dwell (60%→80% of the section, see wordmarkTrigger above) has played out — it no longer
      // rides down into paragraph-reveal at all (see the guard around Hero's own
      // paragraph-reveal-based fade-out in page.tsx, disabled on mobile so it can't fight this).
      if (isMobile) {
        starHideTrigger = ScrollTrigger.create({
          trigger: section,
          start: "80% top",
          onEnter: () => gsap.to(star, { opacity: 0, duration: 0.35, ease: "power3.in", overwrite: "auto" }),
          onLeaveBack: () => gsap.to(star, { opacity: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" }),
        });
      }

      // Travel-to-globe: once the reader leaves the SWITCHBLADE wordmark and scrolls into the
      // Vision/globe section (#paragraph-reveal), the star glides toward its resting spot beside
      // the globe on desktop (globeX). Skipped on mobile — the star is already hidden by
      // starHideTrigger above before it would ever reach paragraph-reveal, so there's nothing
      // left to animate into position. A plain `.to()` (no fromTo) reads the star's live x/y as
      // its own starting point (still Hero's x, since the shrink above only touched scale) so it
      // can't jump on activation regardless of what state the star's actually in.
      const globeTarget = isMobile ? null : document.getElementById("paragraph-reveal");
      if (globeTarget) {
        // Only x/y are animated here — scale is deliberately left untouched, so the star keeps
        // the docked size the shrink above gave it the whole way to the globe.
        //
        // A timeline (not a single tween) so rotation can have its own shape: the star tilts a
        // little as it travels, then straightens back out by the time it's fully docked — a
        // plain x/y tween can't do that (its rotation would just end wherever it started).
        // Since this is the SAME scrollTrigger driving both, the tilt and the straighten-out are
        // still frame-locked to the x/y travel, not a separate uncoordinated motion.
        // Same timeline that drives the star's x/y also owns the "SWITCHBLADE" badge's fade-in
        // (see ParagraphReveal.tsx) — that used to be a separately-created ScrollTrigger tied to
        // a matching "top 45%" string, but two independently-measured triggers on the same
        // element can still resolve to different pixel positions, and live testing showed the
        // badge appearing well before the star had actually finished traveling here. Driving both
        // off one timeline instance makes that impossible: the badge can only ever reach opacity
        // 1 exactly when the travel itself completes.
        const badge = document.getElementById("switchblade-badge");
        globeTravel = gsap.timeline({
          scrollTrigger: {
            // Start as soon as the paragraph-reveal section starts entering the viewport (its
            // top crossing the very bottom of the screen), so the star is already travelling
            // toward the globe well before the reader reaches that section — not snapping over
            // a short late window that reads as "going straight down, then jumping right."
            // end tightened from "top 20%" (80vh of travel) to "top 45%" (55vh) — combined with
            // the spacer before this section, the full trip from the wordmark dock to the star
            // parked beside the globe was taking too many scrolls. Mobile tightens further
            // still (start later, end sooner → ~20vh of travel instead of ~55vh): its stacked
            // text-then-globe layout is much taller than desktop's side-by-side one, so the
            // star was sitting still, overlapping the Vision/Core Belief text, for a long
            // stretch of scroll before the actual globe image caught up to it.
            trigger: globeTarget,
            start: isMobile ? "top 85%" : "top bottom",
            end: isMobile ? "top 65%" : "top 45%",
            // Tightened from 0.6 to 0.3 — matches tlExit's own scrub above (same reasoning: with
            // normalizeScroll now smoothing the raw scroll input at the platform level, this can
            // track scroll much more tightly without inheriting per-notch choppiness). 0.6 was
            // stale from before that change and was exactly what read as jerky/not-smooth during
            // the tilt (the star's rotation and x/y position both live on this one scrubbed
            // timeline, so any lag here shows up as the whole star stuttering while it travels
            // and tilts toward the globe).
            scrub: 0.3,
            // Re-record the .to() tween's start values at the moment the range is actually
            // entered. A .to() records starts on its very first render — for a scrubbed
            // timeline that's at page load (playhead set to 0), when the star's y is still 0.
            // By the time the reader reaches this transition, scaleTween has long since moved
            // the star to y:-6vh, so the first real scrubbed render snapped y from -6vh back
            // toward that stale recorded 0 — a visible ~40px vertical jump right as the tilt
            // began. invalidate() flushes the recorded starts; the very next scrub render
            // re-records them from the star's LIVE values, so the travel begins exactly where
            // the star actually is. Deliberately NOT also done on onEnterBack: re-entering from
            // below, the correct start is still the wordmark-side state recorded here — the
            // star's live values down there are the tween's END state, and re-recording the
            // start from those would collapse the whole travel to nothing.
            onEnter: () => globeTravel?.invalidate(),
          },
        })
          .to(star, { x: globeX, y: "8vh", ease: "none", duration: 1 }, 0)
          .fromTo(star, { rotation: 0 }, { rotation: -7, ease: "none", duration: 0.5 }, 0)
          .to(star, { rotation: 0, ease: "none", duration: 0.5 }, 0.5);

        if (badge) {
          // Fires in only the very last sliver of the timeline (0.92→1), not 0.75→1 — at 0.75 the
          // star's x/y tween (duration 1, starting at 0) is still just 75% travelled and its
          // rotation-straighten tween (0.5→1) is only half straightened, so the star was
          // visibly still moving/tilted while the badge had already finished fading in. Waiting
          // until 0.92 means both of those are essentially done first, so the badge only appears
          // once the star reads as actually arrived and settled, not mid-motion.
          globeTravel.fromTo(badge, { opacity: 0, y: 8 }, { opacity: 1, y: 0, ease: "none", duration: 0.08 }, 0.92);
        }
      }
    });

    return () => {
      killed = true;
      observer?.disconnect();
      tlEnter?.kill();
      tlExit?.scrollTrigger?.kill();
      tlExit?.kill();
      globeTravel?.scrollTrigger?.kill();
      globeTravel?.kill();
      scaleTrigger?.kill();
      scaleTween?.kill();
      wordmarkTrigger?.kill();
      wordmarkTween?.kill();
      starHideTrigger?.kill();
      normalizer?.kill();
      if (dampRef) dampRef.current = 0;
      if (shrinkRef) shrinkRef.current = 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={outerRef} style={{ background: "#ffffff" }} className="relative h-[500vh] lg:h-[520vh]">
      {/* Height grown from 380vh to 520vh: the extra scroll distance is what gives real separation
          between the shrink (scaleTrigger, ~42%) and the wordmark reveal (wordmarkTrigger, ~75%)
          below, plus dwell room after the wordmark appears before this section releases into
          ParagraphReveal — the old 380vh packed all three beats (labels fade → shrink → wordmark)
          into too little scroll distance, so a normal scroll flick blew through more than one beat
          at once and read as sections colliding. Mobile gets its OWN total height (500vh vs
          desktop's 520vh), sized to an explicit screen-fulls pacing: labels fade out over the
          first screen (tlExit 0%→20%), a full 2-screen GAP of nothing (20%→60%) so section 2 has
          genuinely finished disappearing before anything new starts, then the wordmark appears
          at 60% (wordmarkTrigger), stays fully visible for a full screen's dwell, then the star
          heads out over the screen after that (starHideTrigger at 80%), leaving one more screen
          before the section ends and releases into ParagraphReveal (via the buffer in page.tsx).
          All the percentage-based triggers below are computed live against whatever this height
          actually is, so it's the single place to retune the overall mobile pacing.

          Wordmark layer — its own sticky pin at z-10, BELOW the fixed star (z-20 in page.tsx) so
          the star sits OVER the SWITCHBLADE letters. The heading/labels live in the separate z-25
          layer below, above the star. Two sibling sticky layers pin together for the whole
          section; the star floats between them. `top: 54vh` (nudged down from 48vh) gives the
          star's -6vh upward shift room (see scaleTween) to actually clear the wordmark instead of
          overlapping it. */}
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none" style={{ zIndex: 10 }}>
        <div
          className="absolute left-1/2 select-none"
          style={{ top: "54vh", transform: "translateX(-50%)" }}
        >
          <div ref={wordmarkRef} className="relative" style={{ opacity: 0 }}>
            {/* [SHARP EDGE] top-left / [SOFT HEART] bottom-right, flush with the wordmark's own
                left/right edges — used to sit beside the word (left/right of it) on desktop
                (md:top-[8%]/md:right-[calc(100%+gap)] etc.), but the reference layout wants them
                above/below on every breakpoint, just like mobile already had. Desktop now reuses
                that same above/below placement, with a larger, viewport-scaled gap to suit the
                much bigger desktop wordmark instead of mobile's fixed -top-6/-bottom-6. */}
            <div
              className="absolute left-0 -top-6 md:top-auto md:bottom-[calc(100%+clamp(10px,1.4vw,24px))]"
              style={{ ...ANNO, color: "#888" }}
            >
              [SHARP EDGE]
            </div>

            <p
              className="text-[#0D0D0D] font-black text-center"
              style={{ fontSize: "clamp(40px, 10vw, 106px)", letterSpacing: "-0.04em", lineHeight: 0.92 }}
            >
              SWITCHBLADE
            </p>

            <div
              className="absolute right-0 -bottom-6 md:bottom-auto md:top-[calc(100%+clamp(10px,1.4vw,24px))]"
              style={{ ...ANNO, color: "#0A1AFF" }}
            >
              [SOFT HEART]
            </div>
          </div>
        </div>
      </div>

      {/* marginTop -100vh pulls this second sticky layer up to overlap the wordmark layer above
          it — two sibling stickies otherwise stack in normal flow (200vh apart) instead of
          occupying the same pinned viewport. Both now pin at top:0 together for the section, with
          the fixed star (z-20) floating between this layer (z-25) and the wordmark layer (z-10). */}
      <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: 25, marginTop: "-100vh" }}>
        <div
          ref={headingRef}
          className="absolute left-1/2 flex items-center gap-2 select-none"
          style={{ top: "3%", transform: "translateX(-50%)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(13px, 1.3vw, 18px)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#5C5C5C",
              whiteSpace: "nowrap",
            }}
          >
            A mark that Radiates
          </span>
          
        </div>

        {LABELS.map((l) => (
          <div
            key={l.key}
            className={"absolute flex items-center select-none pointer-events-none " + l.posClass}
            style={{ ...l.style, gap: 8, justifyContent: l.justify }}
          >
            {l.dotFirst && (
              <span ref={(el) => { dotRefs.current[l.key] = el; }} style={DOT} />
            )}
            <span
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 500,
                fontSize: "clamp(15px, 1.35vw, 19px)",
                color: "#0D0D0D",
                whiteSpace: "nowrap",
              }}
            >
              {l.word.split("").map((ch, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    if (!charRefs.current[l.key]) charRefs.current[l.key] = [];
                    charRefs.current[l.key][i] = el;
                  }}
                  style={{ display: "inline-block" }}
                >
                  {ch}
                </span>
              ))}
            </span>
            {!l.dotFirst && (
              <span ref={(el) => { dotRefs.current[l.key] = el; }} style={DOT} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
