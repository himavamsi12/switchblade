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
    let tlExit: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tlExitTrigger: any = null;
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
      // Wrapper starts fully "open" (opacity 1, no blur) — the labels' own hidden state comes
      // from the per-character gsap.set below, not from this wrapper, so tlEnter's reveal is
      // visible through it. tlExit only ever closes this wrapper back down.
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
      let wasIntersecting = false;
      const checkIntersection = () => {
        if (killed) return;
        const top = section.getBoundingClientRect().top;
        const isIntersecting = top <= 0;
        if (isIntersecting !== wasIntersecting) {
          wasIntersecting = isIntersecting;
          if (isIntersecting) {
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
          } else if (top > 0) {
            tlEnter.reverse();
            if (!isMobile) gsap.to(star, { y: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          }
        }
        rafId = requestAnimationFrame(checkIntersection);
      };
      rafId = requestAnimationFrame(checkIntersection);

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

      // Once the reader keeps scrolling past the entrance dwell, the heading/labels fade out.
      // (The star's own shrink is handled separately by scaleTween below.) This fade stays
      // scroll-tied since it's a release keyed to scroll position, not a one-shot flourish.
      //
      // NOT using GSAP's automatic `scrub` here (this timeline is `paused: true`, and progress
      // is instead set by hand in the standalone ScrollTrigger's onUpdate below) — a real bug,
      // confirmed live, was that `scrub` makes GSAP attach its OWN internal smoothing proxy tween
      // that independently eases the timeline's progress toward the raw scroll-computed value on
      // every frame. Calling tlExit.progress(1) inside onUpdate to freeze the labels hidden (see
      // the wordmarkTween.progress() gate below) only won for that ONE frame — GSAP's own proxy tween
      // kept fighting it back toward the real (unfrozen) value on every subsequent frame of a
      // fast, multi-frame scroll, so the freeze couldn't actually hold: the labels visibly leaked
      // back in while the wordmark was still reverse-animating, reading as a collision. Driving
      // tlExit.progress() ENTIRELY by hand, with no competing auto-driver, is the only way this
      // freeze can be absolute rather than "usually wins."
      // Split into two .to() calls (not one shared array) because the label dots/chars carry a
      // `filter: blur(...)` that headingRef never has (see tlEnter's `gsap.set` above — only the
      // label sequences get blur:3px as their hidden state). A single shared tween only ever
      // animates `opacity`, so on reverse scroll it correctly restores opacity to 1 but leaves
      // whatever blur value was last on the labels untouched — confirmed live as labels reading
      // "invisible" (heavily blurred small text is functionally unreadable) while the heading,
      // which has no blur to get stuck, reappeared normally. Explicitly round-tripping filter
      // here guarantees blur is back to 0 exactly when opacity is back to 1, symmetric with how
      // tlEnter reveals them (fade + un-blur together) in both directions.
      // Targets labelsWrapRef (a single wrapper around all 4 labels) rather than the labels'
      // own per-character spans (labelGroups.flat()) — those same spans are what tlEnter's
      // typewriter reveal animates with its own per-label stagger. Two separate tweens writing
      // opacity/filter to the SAME character nodes race on every frame during fast scroll-
      // direction changes: whichever tween renders a given character last that frame wins,
      // confirmed live as one stray character sitting at full opacity while its neighbors (and
      // whole other words) stayed hidden or vice versa. Fading the wrapper here instead means
      // tlExit never touches an element tlEnter also animates, so there's nothing left to race —
      // tlEnter fully owns each character's reveal, tlExit only ever owns the group's overall
      // visibility.
      tlExit = gsap.timeline({ paused: true })
        .to(headingRef.current, { opacity: 0, duration: 0.3, ease: "none" }, 0)
        .to(labelsWrapRef.current, { opacity: 0, filter: "blur(3px)", duration: 0.3, ease: "none" }, 0);

      // Shared by tlExitTrigger's onUpdate below AND by tlEnter's own onComplete callback further
      // down — see that callback's comment for why both need to drive the exact same logic.
      const syncTlExit = (direction: number, raw: number) => {
        // raw === 0 means we've scrolled back UP past this trigger's own START (6% top on
        // desktop, 8% on mobile) — fully out the other side of the fade range, not merely
        // somewhere inside it. That's unambiguous: the labels should be fully visible, full
        // stop, regardless of whatever the wordmark or tlEnter's own entrance animation is
        // doing. Checked FIRST — ScrollTrigger's onUpdate only fires while progress is actually
        // CHANGING, so once progress flatlines at 0 there are no more calls to correct a wrong
        // freeze later; falling into a later branch on this exact update would leave it stuck
        // there indefinitely.
        // Also gated on wordmarkTween's own progress — a fast enough reverse scroll can rush
        // scroll position all the way back past this trigger's own start (raw hits exactly 0)
        // before the wordmark's real-time reverse-out tween has actually finished, and this
        // branch used to force the labels back to fully visible unconditionally right then,
        // confirmed live as the labels and the still-mid-reverse wordmark both on screen at
        // once. Holding tlExit hidden until the wordmark reports back to progress 0 closes that.
        if (raw === 0 && wordmarkTween.progress() === 0) {
          tlEnter.progress(1);
          tlExit.progress(0);
          return;
        }
        if (raw === 0) {
          tlEnter.progress(1);
          tlExit.progress(1);
          return;
        }
        // Scrolling back UP (direction === -1) while still inside the range: don't let the
        // labels start reappearing until the SWITCHBLADE wordmark has FULLY finished its own
        // reverse-out. Reads wordmarkTween's own LIVE progress() directly rather than a
        // separately-maintained boolean flag (a flag flipped only inside an onReverseComplete
        // callback could get permanently stuck if that reverse was ever interrupted before
        // finishing — confirmed live, historically, as labels staying frozen hidden for the
        // rest of the session). The ~one-scroll gap to the wordmark (see wordmarkTrigger's own
        // comment) comfortably fits the reverse-out's real-time duration under normal scroll
        // speeds, so this rarely has to hold anything back in practice.
        if (direction === -1 && wordmarkTween.progress() > 0) {
          tlEnter.progress(1);
          tlExit.progress(1);
          return;
        }
        // Otherwise (scrolling forward into/through the range, or scrolling back up once the
        // wordmark is confirmed gone): do NOT force tlEnter's own real-time entrance (the star's
        // one-shot spin + each label's per-character typewriter reveal, ~4s) to complete early.
        // This trigger's start sits fairly early in the section (see its own comment on why)
        // specifically to remove a long dead scroll hold — but a fast, continuous scroll can
        // cross that early start before ~4 real seconds have actually elapsed, and forcibly
        // snapping tlEnter to "done" right then skipped the whole spin/typewriter animation,
        // jumping straight to "revealed" and starting the fade in the same instant (confirmed
        // live: the entrance effect not visibly playing at all). Holding tlExit at 0 (fully
        // visible, not fading) for as long as tlEnter's own progress() hasn't yet reached 1
        // guarantees the entrance always plays out in full first, no matter how fast the reader
        // scrolls past this trigger's start — the fade only ever begins once it's genuinely
        // finished.
        if (tlEnter.progress() < 1) {
          tlExit.progress(0);
          return;
        }
        // tlEnter is confirmed fully settled — map the fade directly to raw scroll progress.
        // There's no scrub-smoothing here (see the comment above tlExit's own definition), but
        // Lenis already smooths the raw scroll input this is computed from, so a direct 1:1
        // mapping still reads as smooth rather than stepped.
        tlExit.progress(raw);
      };

      tlExitTrigger = ScrollTrigger.create({
        trigger: section,
        // Mobile: 8% top (not 0%) — a real, if brief, DWELL before the fade starts. At 0% this
        // trigger's onEnter fired at the exact same scroll position that snaps tlEnter to its
        // fully-revealed end (see the onEnter callback below), so the heading+labels appeared
        // and immediately began fading within the same instant — confirmed live as reading like
        // the whole section "rushing past" without ever settling, since there was no scroll
        // distance where a reader could actually see the fully-revealed state before it started
        // disappearing again. 8% (~1/12 of a screen) is enough to read as an intentional pause.
        //
        // Desktop: 6% (down from 45%) — that 45% left a huge ~2.3-screen dead hold after the
        // labels finished forming, where nothing happened at all as you kept scrolling, before
        // the fade even started (confirmed live as "too many scrolls"). 6% keeps just enough of
        // the same brief settle-pause as mobile's 8% (proportionally, against 520vh vs 500vh)
        // without the long dead stretch.
        start: isMobile ? "8% top" : "6% top",
        // Desktop end: 25% (down from 56%) — paired with the new 6% start above, this keeps the
        // fade itself spanning roughly one screen's worth of scroll (~19% of 520vh ≈ 99vh), same
        // as before, just moved earlier so the whole "labels visible → gone" beat now takes
        // about one scroll from when they finish forming, not two-plus. The onUpdate below is
        // still what actually GUARANTEES the wordmark is gone before the labels can reappear on
        // scroll-back — this distance just needs to comfortably fit the reverse-out animation's
        // own real-time duration under normal scroll speeds so that gate rarely has to hold
        // anything back (see its own comment).
        end: isMobile ? "26% top" : "25% top",
        onUpdate: (self: { direction: number; progress: number }) => syncTlExit(self.direction, self.progress),
      });

      // tlEnter's own real-time entrance (star spin + per-label typewriter reveal, ~4s) can
      // still be mid-flight at the moment scroll reaches tlExitTrigger's END — syncTlExit's
      // "hold tlExit at 0 until tlEnter finishes" branch (below) correctly keeps the labels open
      // through that. But ScrollTrigger's onUpdate only fires while progress is actually
      // CHANGING — once scroll goes past this trigger's end, progress flatlines at 1 and onUpdate
      // never fires again, so nothing was left to re-check tlExit once tlEnter DID finish a
      // moment later. Confirmed live: scroll fast enough to reach the wordmark while the
      // entrance was still finishing, and the labels stayed stuck fully visible (frozen at
      // whatever syncTlExit last set) forever afterward, overlapping the wordmark once IT
      // finished revealing too. This completion callback re-runs the exact same sync, driven by
      // tlEnter itself finishing rather than by a scroll event, using the ScrollTrigger's own
      // current (still-live) direction/progress at that moment — closing the gap.
      tlEnter.eventCallback("onComplete", () => {
        syncTlExit(tlExitTrigger.direction, tlExitTrigger.progress);
      });

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

      // SWITCHBLADE wordmark reveal — the former UniquenessReveal section, now merged INTO this
      // sticky scene. Same time-based play/reverse pattern as the shrink: it plays out on its own
      // clock and reverses on scroll-back. Not scrubbed, so it's smooth regardless of scroll speed.
      //
      // Starts at 44% (see wordmarkTrigger's own comment for the full tuning history) — well
      // after the shrink above finishes (33%), so the star has genuinely settled before
      // SWITCHBLADE begins typing in, and with enough real scroll distance before it that the
      // reverse-out (played at its natural, full pace — NOT sped up) reliably finishes before a
      // reader scrolling back up reaches the labels' own zone.
      //
      // Sequence: SWITCHBLADE types in letter-by-letter (each char rises + fades in with a short
      // stagger, like the LABELS chars above), THEN — only once the last letter has landed —
      // [SHARP EDGE] and [SOFT HEART] fade in together. Built as one timeline (not three separate
      // tweens) so the whole sequence plays/reverses as a single unit under wordmarkTween.play()/
      // .reverse() below, same as before.
      const wordmarkChars = wordmarkCharRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      gsap.set(wordmarkChars, { opacity: 0, y: 16 });
      gsap.set([sharpEdgeRef.current, softHeartRef.current], { opacity: 0 });
      wordmarkTween = gsap.timeline({ paused: true })
        .to(wordmarkChars, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: { each: 0.045, from: "start" },
        }, 0)
        .to([sharpEdgeRef.current, softHeartRef.current], {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        }); // no position arg — starts right after the last letter tween in the stagger above ends
      wordmarkTrigger = ScrollTrigger.create({
        trigger: section,
        // Mobile is paced against its own 500vh total height (see outerRef below): labels fade
        // out over 8%→26%, then the wordmark appears at 38% (a ~0.6-screen gap — shrunk down
        // from an original full 2-screen gap of nothing, which read as "too many scrolls" between
        // the labels disappearing and SWITCHBLADE appearing), stays fully visible for a one-screen
        // dwell (up to starHideTrigger's 58% below), then the star heads out over the remaining
        // scroll before this section releases into ParagraphReveal. The wordmarkTween.progress()
        // gate below (see tlExit's onUpdate) is what actually guarantees the reverse-out still has
        // room to finish before a fast scroll-back reaches the labels' zone, NOT scroll distance —
        // shrinking this gap is safe because that gate doesn't depend on a generous buffer.
        //
        // Desktop: 44% — a ~100vh (one full scroll/screen) gap after tlExit's new 25% end (see
        // tlExitTrigger's own comment: its start/end both moved much earlier to kill a long dead
        // hold after the labels finished forming). Kept the SAME one-scroll gap size that was
        // separately tuned/confirmed live as the right amount of breathing room between "labels
        // gone" and "SWITCHBLADE appears" (a tighter gap read as the wordmark appearing
        // "immediately" on top of the labels on scroll-back) — just re-anchored to the new,
        // earlier tlExit end instead of the old 56%. Net result: forming → labels gone is one
        // scroll, labels gone → SWITCHBLADE is another, instead of the ~4 screens of mostly dead
        // scrolling this used to take. Correctness doesn't depend on this gap's exact size (see
        // tlExit's onUpdate, which reads wordmarkTween.progress() live rather than a wall-clock
        // flag), so this is purely a pacing/feel choice.
        start: isMobile ? "38% top" : "44% top",
        // Force the labels fully hidden the INSTANT the wordmark starts revealing, rather than
        // trusting the gap between this trigger's start (44%/38%) and tlExitTrigger's end
        // (25%/26%) to have already finished the fade in real time. A scroll fast enough to
        // reach here well within tlEnter's own ~4s wall-clock entrance duration used to leave
        // syncTlExit's "hold tlExit at 0 until tlEnter finishes" branch still active — the
        // labels stayed fully visible, confirmed live as reading simultaneously with the fully-
        // revealed SWITCHBLADE wordmark. Snapping both progresses here guarantees the two states
        // are mutually exclusive no matter how fast the reader gets here.
        onEnter: () => {
          tlEnter.progress(1);
          tlExit.progress(1);
          wordmarkTween.play();
        },
        onLeaveBack: () => wordmarkTween.reverse(),
      });

      // Mirrors tlEnter's own onComplete hookup above: ScrollTrigger's onUpdate only fires while
      // progress is actually CHANGING, so a fast reverse scroll that reaches tlExitTrigger's raw
      // === 0 before wordmarkTween's reverse-out has finished leaves nothing to re-check once it
      // DOES finish a moment later (see the raw === 0 branch's own comment above). This re-runs
      // the same sync at that moment, using ScrollTrigger's still-live direction/progress.
      wordmarkTween.eventCallback("onReverseComplete", () => {
        syncTlExit(tlExitTrigger.direction, tlExitTrigger.progress);
      });

      // Mobile only: the star AND the whole SWITCHBLADE wordmark section travel down and out
      // together after the wordmark's one-screen dwell (38%→58% of the section, see
      // wordmarkTrigger above) has played out — it no longer rides down into paragraph-reveal at
      // all (see the guard around Hero's own paragraph-reveal-based fade-out in page.tsx,
      // disabled on mobile so it can't fight this).
      //
      // This used to be a fixed-duration (0.6s) onEnter/onLeaveBack tween on the star alone,
      // triggered once at "58% top" — that read as the star snapping into a fast, scroll-
      // independent animation while the wordmark section just sat frozen in place, since a sticky
      // pin never moves on its own. Rebuilt as a scrub tied directly to scroll progress across a
      // real range (58%→82% of the section) so both travel down and fade out together, at the
      // reader's own scroll pace — reaching fully gone at 82%, comfortably before this section's
      // pin releases into ParagraphReveal/OriginsSection, so it's mid-transit-invisible rather
      // than still visible when Origins arrives.
      if (isMobile) {
        starHideTrigger = ScrollTrigger.create({
          trigger: section,
          start: "58% top",
          end: "82% top",
          scrub: 0.3,
          onUpdate: (self: any) => {
            const p = self.progress;
            gsap.set(star, { y: `${6 + p * 60}vh`, opacity: 1 - p });
            gsap.set(wordmarkStickyRef.current, { y: `${p * 60}vh`, opacity: 1 - p });
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
      cancelAnimationFrame(rafId);
      tlEnter?.kill();
      tlExitTrigger?.kill();
      tlExit?.kill();
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
    <div ref={outerRef} style={{ background: "#ffffff", marginTop: "clamp(180px,14vw,204px)" }} className="relative h-[500vh] lg:h-[520vh]">
      {/* Height grown from an original 380vh to 520vh: the extra scroll distance is what gave
          real separation between the shrink (scaleTrigger) and the wordmark reveal
          (wordmarkTrigger) below, plus dwell room after the wordmark appears before this section
          releases into ParagraphReveal — the old 380vh packed all three beats (labels fade →
          shrink → wordmark) into too little scroll distance, so a normal scroll flick blew
          through more than one beat at once and read as sections colliding. (Those triggers'
          own percentages have since moved much earlier — see tlExitTrigger/scaleTween/
          wordmarkTrigger's own comments — to kill a later-discovered dead scroll hold; this
          520vh total and its "why" are otherwise unchanged.) Mobile gets its OWN total height (500vh vs
          desktop's 520vh), paced as: labels fade out over tlExit's 8%→26%, then the wordmark
          appears at 38% (a short ~0.6-screen gap — shrunk down from an original full 2-screen gap
          of nothing, which read as "too many scrolls" between the labels disappearing and
          SWITCHBLADE appearing), stays fully visible for a one-screen dwell, then the star heads
          out (starHideTrigger at 58%), leaving the remaining scroll before the section ends and
          releases into ParagraphReveal (via the buffer in page.tsx). All the percentage-based
          triggers below are computed live against whatever this height actually is, so it's the
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
