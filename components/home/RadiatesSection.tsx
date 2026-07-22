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
    posClass: "max-lg:top-[21%] lg:top-[20%] left-1/2",
    style: { transform: "translate(-50%, 0)" },
  },
  {
    key: "compassion",
    word: "Compassion",
    dotFirst: true,
    justify: "flex-start",
    // max-lg left nudged 68% → 71% to clear the star's right arm. Careful going much further:
    // this label is left-anchored and "Compassion" is the longest word here (~25% of a small
    // phone's width), so past ~72% it starts running off the right edge.
    posClass: "max-lg:top-[39.5%] lg:top-[45%] max-lg:left-[74%] lg:left-[62%]",
    style: { transform: "translate(0, -50%)" },
  },
  {
    key: "love",
    word: "Love",
    dotFirst: true,
    justify: "center",
    posClass: "max-lg:top-[65%] lg:top-[81%] left-1/2",
    style: { transform: "translate(-50%, 0)" },
  },
  {
    key: "kindness",
    word: "Kindness",
    dotFirst: false,
    justify: "flex-end",
    posClass: "max-lg:top-[40%] lg:top-[45%] max-lg:left-[22%] lg:left-[38%]",
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
  const labelsWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const wordmarkStickyRef = useRef<HTMLDivElement>(null);
  const wordmarkCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sharpEdgeRef = useRef<HTMLDivElement>(null);
  const softHeartRef = useRef<HTMLDivElement>(null);
  const charRefs   = useRef<Record<string, (HTMLSpanElement | null)[]>>({});
  const dotRefs    = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tlEnter: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fadeTl: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fadeTrigger: any = null;
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
    // Set while the entrance scroll-hold is active (see holdForEntrance); calling it resumes
    // scrolling. Must be invoked from cleanup as well, so an unmount mid-hold can't strand the
    // page with scrolling disabled.
    let releaseHold: (() => void) | null = null;
    let rafId = 0;

    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      // Scroll input smoothing (so the scroll-scrubbed star animations below don't step/stutter
      // on slow discrete wheel scroll) is now handled globally on the homepage by Lenis — see
      // components/shared/SmoothScroll.tsx, mounted in page.tsx. This used to set up
      // ScrollTrigger.normalizeScroll() here instead; that was removed because Lenis and
      // normalizeScroll both hijack the scroll and must never run together. Lenis is scoped to
      // the same desktop-only (>= 1024) range this isMobile check gates everything else in this
      // file to, so behavior below is unchanged on mobile.
      // Threshold: 1024 (Tailwind's lg breakpoint) — see the matching comment in Hero's own
      // effect in page.tsx for why tablets (768-1023) take the "mobile" branch here too,
      // consistently with there and with ParagraphReveal.
      const isMobile = window.innerWidth < 1024;

      const star = starRef.current;
      const section = outerRef.current;
      if (!section || !star) return;

      // Parks the star over the globe image on desktop's side-by-side layout — 24vw sits it
      // centered on the globe (22vw left it a touch to the globe's left). On mobile that layout
      // stacks into a single column (ParagraphReveal), so there's no globe beside the text to park
      // next to — a right offset would just push the star toward the edge. Centered (0) is right there.
      // NOTE: the O-dock ticker's hardcoded startX in page.tsx must match this (its 0.24*vw term).
      const globeX = isMobile ? "0vw" : "24vw";

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
      // Wrapper starts fully "open" (opacity 1, no blur) — the labels' own hidden state comes
      // from the per-character gsap.set below, not from this wrapper, so tlEnter's reveal is
      // visible through it. fadeTl (beat 2) only ever closes this wrapper back down.
      gsap.set(labelsWrapRef.current, { opacity: 1, filter: "blur(0px)" });

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
      // Driven by a plain requestAnimationFrame poll of section.getBoundingClientRect().top,
      // not an IntersectionObserver (what this used to be) or a GSAP ScrollTrigger onEnter/
      // onLeaveBack pair. ScrollTrigger's cached pixel start/end can go stale as this section's
      // height shifts while the 3D model/fonts finish loading — the original reason
      // IntersectionObserver was chosen instead, since it re-checks against live layout on every
      // callback. But confirmed live: IntersectionObserver only re-fires on a CHANGE of
      // intersection ratio, and with rootMargin collapsing the root to a 0px-tall sliver (needed
      // to fire exactly at "top top"), a fast scroll can cross that sliver between two of the
      // browser's own (throttled/coalesced) IntersectionObserver checks — the callback simply
      // never fires again afterward, so tlEnter never played for the rest of that visit. Polling
      // getBoundingClientRect() every frame reads the SAME always-live layout IntersectionObserver
      // was chosen for, but can't miss a crossing the way an event-based callback can: every
      // frame independently re-evaluates "is top <= 0" against current reality, so there's no
      // state transition to coalesce away.
      tlEnter = gsap.timeline({ paused: true });

      // No TWEEN for the star's settle-down move (that's the part that caused the old
      // scroll-jump complaints — animating over wall-clock time while the reader is mid-scroll).
      // But removing the tween entirely left the star sitting at its Hero position (vertically
      // centered) for this section's whole entrance/spin phase, which is tall enough to overlap
      // the "A mark that Radiates" heading and the "Strength" label above it. gsap.set is instant
      // (zero duration) rather than animated, so it can push the star down the moment the section
      // is entered without reintroducing motion-during-scroll — it just snaps to the correct
      // resting spot for this section, same as it would have looked once the old tween finished.
      // Holds the page still for the length of the entrance (tlEnter) the FIRST time this section
      // engages, then hands scrolling straight back.
      //
      // Why: tlEnter is time-based (~1.5s on its own clock) while every beat after it is
      // scroll-SCRUBBED. So a hard scroll flick moves the scroll position deep into the section
      // while the labels are still typing in — the reader lands at the wordmark's scrubbed range
      // (40%) having never seen the star spin or the labels form. Freezing the scroll for that
      // ~1.5s is what makes the entrance unskippable without making the section itself longer.
      //
      // Routed through Lenis (window.__lenis, desktop-only — see SmoothScroll.tsx) because Lenis
      // owns the scroll on desktop: its .stop() discards wheel input outright rather than queuing
      // it, so the page doesn't lurch forward by the buffered delta the moment it resumes.
      // Skipped entirely on mobile/tablet: there's no Lenis there, and blocking a native momentum
      // flick mid-gesture reads as the page having frozen/broken rather than as a deliberate hold.
      //
      // ONCE only (heldOnce): re-locking every time the reader scrolls back up and re-enters would
      // feel like the page fighting them. And `releaseHold` is called from the effect cleanup too —
      // unmounting mid-hold must never leave the page permanently unscrollable.
      let heldOnce = false;
      const holdForEntrance = () => {
        if (isMobile || heldOnce) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lenis = (window as any).__lenis;
        if (!lenis?.stop) return;
        heldOnce = true;
        lenis.stop();
        releaseHold = () => {
          releaseHold = null;
          lenis.start();
        };
        // +0.15s of settle after the last character lands, so scrolling doesn't resume on the
        // exact frame the animation ends.
        gsap.delayedCall(tlEnter.duration() + 0.15, () => releaseHold?.());
      };

      let wasIntersecting = false;
      const checkIntersection = () => {
        if (killed) return;
        const top = section.getBoundingClientRect().top;
        const isIntersecting = top <= 0;
        if (isIntersecting !== wasIntersecting) {
          wasIntersecting = isIntersecting;
          if (isIntersecting) {
            tlEnter.play();
            holdForEntrance();
            // Desktop only — mobile's whole settle motion is owned by scaleTween alone (start:
            // "top 60%", see below), one continuous tween with no competing move here.
            // This used to be an INSTANT gsap.set rather than a tween — that snapped the star to
            // 5vh in a single frame the moment the section engaged, which is exactly what read as
            // a jump/jerk right as the pinned scene locked in. It was originally made instant to
            // dodge a race with scaleTween's own y tween, but that one only starts later (52%
            // top, well past this trigger point), so a short real tween is safe here now and
            // reads as a settle instead of a snap.
            // 14vh (was 5vh) — moved down with the heading and labels so the whole composition
            // sits centred in the viewport instead of hugging the top. Tuned so the star's
            // CROSSING POINT lands near the Kindness/Compassion axis (lg:top-[45%]): the model is
            // camera-framed rather than centred in its canvas, so its visual centre sits well
            // above the element's middle. 12vh left the crossing high enough that the long upper
            // spike hit the "Strength" label; 20vh dropped it below the axis and into "Love".
            // Only the RESTING spot changes;
            // scaleTween still takes the star to -6vh for its wordmark clearance later, so
            // nothing downstream shifts.
            if (!isMobile) gsap.to(star, { y: "14vh", duration: 0.35, ease: "power2.out", overwrite: "auto" });
          } else if (top > 0) {
            tlEnter.reverse();
            if (!isMobile) gsap.to(star, { y: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          }
        }
        rafId = requestAnimationFrame(checkIntersection);
      };
      rafId = requestAnimationFrame(checkIntersection);

      // ── Beat 1: heading + spin + labels FORM (time-based, plays once on enter) ────────────────
      // This beat is intentionally NOT scroll-scrubbed — by request. When the section arrives at
      // the top of the viewport, the heading fades in, the star does one decorative half-turn, and
      // the four labels type in one word at a time on their own clock, exactly like a self-playing
      // entrance. checkIntersection above plays this on enter and reverses it on scroll-back above
      // the section. Making the FORMING time-based can't reintroduce the old labels-over-wordmark
      // overlap: that overlap is prevented entirely by beats 2 and 3 being scroll-SCRUBBED on
      // disjoint ranges (fadeTl hides the labels' wrapper by 28%/34%, the wordmark's scrubbed range
      // doesn't begin until 40%), and the wrapper fade masks the labels no matter what state their
      // per-character forming tween happens to be in. So forming feel is free to be time-based
      // while the anti-overlap guarantee stays purely scroll-position-based.
      tlEnter
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0)
        .to(spin, {
          v: 1,
          duration: 0.88,
          ease: "power1.inOut",
          onUpdate() { spinRef.current = spin.v; },
        }, 0.2)
        // All four labels reveal AT THE SAME TIME, each with its own left-to-right typewriter
        // stagger — so the four words type in parallel (not one word after another), each char
        // fading/un-blurring in sequence within its own word. Each group gets its own .to() with a
        // per-character stagger, but all are placed at the SAME timeline position (1.9) so they
        // start together. (A single .to(labelGroups.flat()) with a stagger would instead type all
        // four words as one continuous left-to-right sequence across the whole group — which is the
        // one-by-one look we don't want here.)
        // Start position tracks the spin's end (0.2 + 0.88 = 1.08), landing a hair before it so the
        // two overlap slightly instead of running strictly back to back — if the spin's duration
        // changes again, move this with it. Per-char stagger and duration are tuned to match.
        .to(labelGroups[0], { opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "none", stagger: { each: 0.03, from: "start" } }, 1.0)
        .to(labelGroups[1], { opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "none", stagger: { each: 0.03, from: "start" } }, 1.0)
        .to(labelGroups[2], { opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "none", stagger: { each: 0.03, from: "start" } }, 1.0)
        .to(labelGroups[3], { opacity: 1, filter: "blur(0px)", duration: 0.26, ease: "none", stagger: { each: 0.03, from: "start" } }, 1.0);

      // ── Beat 2: heading + labels FADE OUT (scroll-scrubbed) ───────────────────────────────────
      // A scrubbed timeline over a non-overlapping slice (desktop 20%→28%, mobile 24%→34%). This
      // is the beat that actually enforces "no labels while the wordmark is up": because it's
      // scrubbed, at any scroll depth past its end the labels' wrapper is guaranteed at opacity 0,
      // and the wordmark's own scrubbed range doesn't start until 40% — disjoint, so they can never
      // co-exist regardless of the (time-based) forming above. Fades the labels' WRAPPER (opacity +
      // blur), never the per-character spans beat 1 animates — two tweens writing opacity/blur to
      // the SAME nodes would race frame-to-frame on a fast scroll-direction flip (historically seen
      // as one stray char stuck visible while its neighbours hid). Wrapper-vs-spans keeps beat 1 and
      // beat 2 on disjoint DOM targets, so nothing races there either.
      fadeTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: isMobile ? "24% top" : "20% top",
          end: isMobile ? "34% top" : "28% top",
          scrub: 0.3,
        },
      })
        .to(headingRef.current, { opacity: 0, ease: "none", duration: 1 }, 0)
        .to(labelsWrapRef.current, { opacity: 0, filter: "blur(3px)", ease: "none", duration: 1 }, 0);
      fadeTrigger = fadeTl.scrollTrigger;

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
          // Desktop range sits right after tlExit's label fade ends (25% top — see its own
          // comment for the full retiming) and completes well before the wordmark reveal (44%
          // top below) — percentages are of this section's own scroll height. Re-anchored here
          // (was 52%→58%, back when tlExit itself ended at 56%) to stay in the same relative
          // spot — after the labels clear, before SWITCHBLADE appears — now that both of those
          // moved much earlier to kill a long dead scroll hold. Mobile shrinks DURING the
          // incoming transition from Hero ("top 60%" = section top at 60% viewport, still
          // scrolling up into view), finishing exactly as the sticky pin locks in ("top top") —
          // same envelope the old play/reverse version covered, now distributed across it
          // instead of dumped at entry; untouched by this change.
          start: isMobile ? "top 60%" : "27% top",
          end: isMobile ? "top top" : "33% top",
          scrub: 0.3,
        },
      })
        .to(shrinkProxy, {
          v: dockedScale,
          // ease: "none" (LINEAR), not power2.inOut — this tween is scroll-SCRUBBED, so its ease
          // is a mapping from scroll position to shrink amount, not a time curve. A non-linear
          // ease here makes the star shrink slow→fast→slow at a CONSTANT scroll speed (it
          // accelerates through the middle of the scroll range), which reads as the shrink not
          // being smooth/uniform — and stopping in that steep middle makes scrub's catch-up cover
          // a large shrink delta in one settle, the visible "jump on stop". The power2.inOut was
          // a leftover from when this was a TIME-based tween (where an ease-in-out over ~0.9s
          // wall-clock looks nice); once it became scrubbed it should have gone linear, matching
          // globeTravel's own ease:"none" below. Linear = shrink advances in lockstep with scroll,
          // uniform rate, no acceleration to jerk on.
          ease: "none",
          onUpdate: () => { if (shrinkRef) shrinkRef.current = shrinkProxy.v; },
        }, 0)
        .to(star, {
          // Mobile owns its ENTIRE settle-down motion here (the entrance IntersectionObserver
          // above doesn't touch y on mobile at all) — one continuous scrubbed move from the
          // Hero baseline (0) straight to its final resting spot. 6vh matches the settle
          // amount originally tuned via an old instant set. ease:"none" for the same
          // scrubbed-tween reason as the shrink above — linear w.r.t. scroll.
          y: isMobile ? "6vh" : "-6vh",
          ease: "none",
          force3D: true,
        }, 0);
      scaleTrigger = scaleTween.scrollTrigger;

      // ── Beat 3: SWITCHBLADE wordmark reveal (scroll-scrubbed) ─────────────────────────────────
      // The former UniquenessReveal, merged into this sticky scene. Was a time-based play/reverse
      // fired by onEnter/onLeaveBack — that is exactly what could still be mid-reveal (or mid-
      // reverse) at a scroll depth where the labels' own beat wasn't yet in its "hidden" state on
      // a fast flick, which is what put the labels and the wordmark on screen together. Now it's a
      // scrubbed timeline over its own DISJOINT slice (desktop 40%→52%, mobile 40%→52%), well after
      // fadeTl has fully hidden the labels (ends 28%/34%) and after the star's shrink (scaleTween,
      // 27%→33% desktop) has settled. Since beat 2 is guaranteed at progress 1 (labels fully gone)
      // for the entire stretch before this range even begins, and this reveal is itself locked to
      // scroll, the two are mutually exclusive by construction at every scroll position and every
      // speed — no runtime gate required.
      //
      // Sequence within the scrub: SWITCHBLADE TYPES in letter-by-letter — each character snaps
      // fully visible in turn with NO opacity fade and NO slide, a pure typewriter reveal — THEN
      // [SHARP EDGE] / [SOFT HEART] fade in together once the last letter has landed.
      const wordmarkChars = wordmarkCharRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      gsap.set(wordmarkChars, { opacity: 0 });
      gsap.set([sharpEdgeRef.current, softHeartRef.current], { opacity: 0 });
      wordmarkTween = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          // Desktop 40%: one clear screen of gap after fadeTl's 28% end and the shrink's 33% end,
          // so the star has visibly settled before the word starts typing. Mobile 40%: sits after
          // fadeTl's 34% end, and comfortably before starHideTrigger (58%) carries the whole
          // wordmark back off-screen, leaving a ~one-screen dwell where it's fully readable.
          start: "40% top",
          end: "52% top",
          scrub: 0.3,
        },
      })
        .to(wordmarkChars, {
          opacity: 1,
          // Hard on/off per letter: duration ~0 with ease "steps(1)" makes each character POP
          // fully visible at its stagger point instead of fading in — a true typewriter. No y, so
          // letters don't slide either. The stagger (0.09) spaces the pops out across the scrub.
          duration: 0.001,
          ease: "steps(1)",
          stagger: { each: 0.09, from: "start" },
        }, 0)
        .to([sharpEdgeRef.current, softHeartRef.current], {
          opacity: 1,
          ease: "power2.out",
          duration: 0.3,
        }); // no position arg — starts right after the last letter tween in the stagger above ends
      wordmarkTrigger = wordmarkTween.scrollTrigger;

      // Mobile only: the STAR alone travels down and out after the wordmark's one-screen dwell
      // (38%→58% of the section) — the SWITCHBLADE wordmark itself stays put, by request. It's a
      // sticky-pinned layer, so leaving it untouched here means it simply holds its position for
      // the rest of the section and then scrolls away naturally when the pin releases into
      // ParagraphReveal, rather than sliding down in lockstep with the star (which read as the
      // text being dragged along by the model). The star's downward travel + fade is scrubbed to
      // scroll across 58%→82% so it tracks the reader's own pace and is fully gone before Origins
      // arrives. Hero's own paragraph-reveal-based fade-out is guarded off on mobile (see page.tsx)
      // so it can't fight this.
      if (isMobile) {
        starHideTrigger = ScrollTrigger.create({
          trigger: section,
          start: "58% top",
          end: "82% top",
          scrub: 0.3,
          onUpdate: (self: any) => {
            const p = self.progress;
            gsap.set(star, { y: `${6 + p * 60}vh`, opacity: 1 - p });
          },
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
      // Before anything else: if we unmount while the entrance hold is still active, scrolling
      // must be handed back — otherwise the page stays frozen with nothing left alive to free it.
      releaseHold?.();
      cancelAnimationFrame(rafId);
      tlEnter?.kill();
      fadeTrigger?.kill();
      fadeTl?.kill();
      globeTravel?.scrollTrigger?.kill();
      globeTravel?.kill();
      scaleTrigger?.kill();
      scaleTween?.kill();
      wordmarkTrigger?.kill();
      wordmarkTween?.kill();
      starHideTrigger?.kill();
      if (dampRef) dampRef.current = 0;
      if (shrinkRef) shrinkRef.current = 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={outerRef} style={{ background: "#ffffff", marginTop: "clamp(180px,14vw,204px)" }} className="relative h-[500vh] lg:h-[400vh]">
      {/* Height grown from an original 380vh to 520vh: the extra scroll distance is what gives
          every scrubbed beat its own non-overlapping slice of scroll, so a normal scroll flick
          can't blow through more than one at once (which read as sections colliding at 380vh).
          The text choreography: labels form as a time-based entrance the moment the section pins
          (tlEnter, plays once — by request, not scrubbed), then a chain of DISJOINT scroll-scrubbed
          ranges (all percentages of this height) enforces the rest: labels fade out (fadeTl,
          20%→28%), star shrink (scaleTween, 27%→33%), wordmark types in (wordmarkTween, 40%→52%),
          dwell, then release into ParagraphReveal. Because those ranges are disjoint and scrubbed,
          the labels are guaranteed hidden before the wordmark's range begins — so the two can't
          overlap at any speed even though the forming itself is time-based. Mobile gets its OWN
          total height (500vh vs desktop's 520vh): fade 24%→34%, wordmark
          40%→52%, then the star + wordmark head out together (starHideTrigger, 58%→82%), leaving
          the remaining scroll before the section releases into ParagraphReveal (via the buffer in
          page.tsx). All the percentage-based triggers below are computed live against whatever
          this height actually is, so it's the
          single place to retune the overall mobile pacing.

          Wordmark layer — its own sticky pin at z-10, BELOW the fixed star (z-20 in page.tsx) so
          the star sits OVER the SWITCHBLADE letters. The heading/labels live in the separate z-25
          layer below, above the star. Two sibling sticky layers pin together for the whole
          section; the star floats between them. `top: 54vh` (nudged down from 48vh) gives the
          star's -6vh upward shift room (see scaleTween) to actually clear the wordmark instead of
          overlapping it. */}
      <div ref={wordmarkStickyRef} className="sticky top-0 h-screen overflow-hidden pointer-events-none" style={{ zIndex: 10 }}>
        <div
          className="absolute left-1/2 select-none"
          style={{ top: "54vh", transform: "translateX(-50%)" }}
        >
          {/* wordmarkRef itself stays visible (opacity always 1) — the reveal now animates each
              letter of SWITCHBLADE and the two annotations individually (see wordmarkTween
              above), not this wrapper as a whole, so it can't be the thing hiding them. */}
          <div ref={wordmarkRef} className="relative">
            {/* [SHARP EDGE] top-left / [SOFT HEART] bottom-right, flush with the wordmark's own
                left/right edges — used to sit beside the word (left/right of it) on desktop
                (md:top-[8%]/md:right-[calc(100%+gap)] etc.), but the reference layout wants them
                above/below on every breakpoint, just like mobile already had. Desktop now reuses
                that same above/below placement, with a larger, viewport-scaled gap to suit the
                much bigger desktop wordmark instead of mobile's fixed -top-6/-bottom-6. Both fade
                in AFTER the SWITCHBLADE letters finish typing in (see wordmarkTween). */}
            <div
              ref={sharpEdgeRef}
              className="absolute left-0 -top-6 md:top-auto md:bottom-[calc(100%+clamp(10px,1.4vw,24px))]"
              style={{ ...ANNO, color: "#888" }}
            >
              [SHARP EDGE]
            </div>

            {/* Each letter of SWITCHBLADE gets its own span/ref so wordmarkTween above can
                stagger them in one at a time (rise + fade), reading as a letter-by-letter type
                effect rather than the whole word fading in at once. inline-block is required for
                the y-offset transform to actually move each letter independently — but browsers
                treat adjacent inline-block boxes as breakable between them by default (the same
                as between words), so splitting one word into 11 of them made the line wrap mid-
                word on narrower viewports. whiteSpace:"nowrap" here forbids that break, same as
                it was implicitly forbidden before when this was one plain text node. */}
            <p
              className="text-[#0D0D0D] font-black text-center"
              style={{ fontSize: "clamp(40px, 10vw, 106px)", letterSpacing: "-0.04em", lineHeight: 0.92, whiteSpace: "nowrap" }}
            >
              {"SWITCHBLADE".split("").map((ch, i) => (
                <span
                  key={i}
                  ref={(el) => { wordmarkCharRefs.current[i] = el; }}
                  style={{ display: "inline-block" }}
                >
                  {ch}
                </span>
              ))}
            </p>

            <div
              ref={softHeartRef}
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
          // Desktop `top` lives here as a class rather than in `style` so it can differ from
          // mobile's: the whole group (heading + labels + star) used to sit in the upper ~78% of
          // the viewport with dead space beneath it, so every desktop position below is shifted
          // down ~7% to centre the composition. Mobile's percentages were tuned separately and
          // are left alone.
          className="absolute left-1/2 flex items-center gap-2 select-none max-lg:top-[11%] lg:top-[10%]"
          style={{ transform: "translateX(-50%)" }}
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

        {/* absolute inset-0 (not a plain unstyled wrapper): gsap animates this wrapper's `filter`
            (see tlExit above), and any non-"none" CSS filter — even blur(0px) — makes an element
            a new containing block for its absolutely-positioned descendants, same as a
            transform. Without inset-0 giving this wrapper the sticky parent's full box, the
            labels' percentage-based top/left (posClass) would suddenly resolve against this
            wrapper's own (contentless, near-zero) box the instant tlExit sets any filter value,
            instead of against the sticky container they were positioned against before. */}
        <div ref={labelsWrapRef} className="absolute inset-0">
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
    </div>
  );
}
