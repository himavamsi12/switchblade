"use client";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type Placement = {
  key: string;
  word: string;
  dotFirst: boolean; // dot renders before the word (dot sits on the star-facing side)
  style: React.CSSProperties;
  justify: React.CSSProperties["justifyContent"];
};

const LABELS: Placement[] = [
  {
    key: "strength",
    word: "Strength",
    dotFirst: true,
    justify: "center",
    style: { top: "13%", left: "50%", transform: "translate(-50%, 0)" },
  },
  {
    key: "compassion",
    word: "Compassion",
    dotFirst: true,
    justify: "flex-start",
    style: { top: "38%", left: "68%", transform: "translate(0, -50%)" },
  },
  {
    key: "love",
    word: "Love",
    dotFirst: true,
    justify: "center",
    style: { top: "74%", left: "50%", transform: "translate(-50%, 0)" },
  },
  {
    key: "kindness",
    word: "Kindness",
    dotFirst: false,
    justify: "flex-end",
    style: { top: "38%", left: "32%", transform: "translate(-100%, -50%)" },
  },
];

const DOT: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 2,
  background: "#0D0D0D",
  flexShrink: 0,
};

export function RadiatesSection({
  starRef,
  spinRef,
}: {
  starRef: RefObject<HTMLDivElement | null>;
  spinRef: RefObject<number>;
}) {
  const outerRef   = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
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
      normalizer = ScrollTrigger.normalizeScroll(true);

      const star = starRef.current;
      const section = outerRef.current;
      if (!section || !star) return;

      const isMobile = window.innerWidth < 768;

      // On phones the docked star (parked above the SWITCHBLADE wordmark through Uniqueness
      // Reveal) reads as sitting too high/close to the top of that section. -4vh was tuned for
      // desktop's much wider, shorter viewport; nudging it down a bit on mobile only. (2vh was
      // then nudged back up slightly to -1vh — 2vh sat a little too close to the wordmark.)
      const dockedY = isMobile ? "-1vh" : "-4vh";
      // On mobile the star should stay the same size as it was in the Hero — no shrink into
      // this section's docked pose. Desktop keeps the shrink to 0.75.
      const dockedScale = isMobile ? 1 : 0.75;
      // 26vw parks the star beside the globe image on desktop's side-by-side layout. On mobile
      // that layout stacks into a single column (ParagraphReveal), so there's no globe beside the
      // text to park next to — 26vw would just push the star off-center toward the right edge.
      // Centered (0) is the right resting spot there instead.
      const globeX = isMobile ? "0vw" : "26vw";
      // Matches the constant resting x baked into the star in Hero (page.tsx) — x is never
      // animated within this section, so it's still sitting at that same resting value the
      // whole time we get here. globeTravel's fromTo needs its "from" to match reality exactly,
      // or it'll snap on activation.
      const restX = isMobile ? "0vw" : "2vw";

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
            gsap.set(star, { y: "5vh" });
          } else if (entry.boundingClientRect.top > 0) {
            tlEnter.reverse();
            gsap.set(star, { y: 0 });
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
      // heading/labels fade and the star shrinks into its docked size. This part stays tied
      // to scroll position since it's a release/transition, not a one-shot flourish.
      tlExit = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "45% top",
          end: "bottom bottom",
          // With normalizeScroll now smoothing the raw input above, this can track scroll much
          // more tightly than the old scrub: 1 (which existed to paper over raw wheel choppiness
          // that normalizeScroll now handles at the source) — a full second of catch-up lag was
          // itself the "star drifts on its own after you stop scrolling" complaint. 0.3 still
          // takes the hard edge off frame-to-frame noise without leaving a noticeable lag.
          scrub: 0.3,
          // Make this scrub the SOLE owner of the star's transform from the moment it takes
          // over. Frame-by-frame measurement showed the jump was a tween fight over `scale`:
          // the Hero entrance tween (scale 0.88→1, nominally 1s) runs on GSAP's rAF ticker,
          // and the heavy GLB/canvas init stalls rAF at page load — stretching that "1 second"
          // over many real seconds, so it was often STILL writing scale toward 1 when this
          // scrub activated. Both tweens then wrote scale on every tick (x/y moved while scale
          // stalled near 1), and when the entrance tween finally died, scale snapped to the
          // scrub's value in one frame — the visible "jump, then shrink". Killing every other
          // x/y/scale tween on the star and re-capturing this tween's start values (invalidate)
          // guarantees the shrink starts from the star's true current pose with nothing
          // fighting it. The kill MUST spare this timeline's own child tween (a killed tween
          // stays dead and invalidate() can't resurrect it — a blanket killTweensOf made the
          // shrink silently never run again after scrolling back up and re-entering) and the
          // globeTravel tween (same permanent-death failure, one section later).
          onEnter: (self) => {
            const tl = self.animation;
            gsap.getTweensOf(star).forEach((t) => {
              if (t.parent !== tl && t !== globeTravel) t.kill(undefined, "x,y,scale");
            });
            tl?.invalidate();

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

      tlExit
        .to(
          [headingRef.current, ...labelGroups.flat()],
          { opacity: 0, duration: 0.3, ease: "none" },
          0
        )
        // No x movement — the star stays at its constant resting x (restX, set once in Hero,
        // never touched again) through the whole shrink/grow. There used to be a small rightward
        // nudge meant to compensate for the rotating star "reading" slightly left of center at
        // its docked size, but any version of that correction riding the same scroll progress
        // as the shrink itself put the star visibly off-center for part of the transition and
        // only "centered-looking" at one specific point — which is what reads as "drifts to the
        // side, then snaps to center" no matter how that drift is timed. Simplest fix, confirmed
        // by repeated reports of this exact symptom whenever x moves at all: no x compensation,
        // no side drift — the star just scales in place, dead center, the entire time.
        .to(
          star,
          {
            scale: dockedScale,
            y: dockedY,
            // Linear ease on a scrubbed tween: the shrink maps 1:1 to scroll distance so it
            // reads perfectly smooth. An ease curve here (power2 etc.) fights the scrub and
            // makes the scale accelerate/decelerate, which is what read as a jerk/jump.
            ease: "none",
            immediateRender: false,
            force3D: true,
          },
          0.05
        );

      // Travel-to-globe: once the reader leaves the SWITCHBLADE wordmark and scrolls into the
      // Vision/globe section (#paragraph-reveal), the docked star glides toward its resting spot
      // beside the globe on desktop (globeX), or back to horizontal center on mobile where the
      // globe stacks below the text instead of beside it. A fromTo starting from the exact
      // docked values (matching tlExit's end) so there's no jump; scrubbed to the section's
      // entrance so it arrives as the globe comes into view. Reverses cleanly on scroll-back.
      const globeTarget = document.getElementById("paragraph-reveal");
      if (globeTarget) {
        // Only x/y are animated here — scale is deliberately left untouched so the star keeps
        // its docked size (dockedScale — 0.75 on desktop, 1 on mobile) the whole way to the
        // globe, travelling right without shrinking further.
        globeTravel = gsap.fromTo(
          star,
          { x: restX, y: dockedY },
          {
            x: globeX,
            y: "8vh",
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              // Start only once the SWITCHBLADE wordmark has scrolled up out of the way, so the
              // star holds its docked pose above the wordmark first, then travels to the globe.
              trigger: globeTarget,
              start: "top 50%",
              end: "top 12%",
              scrub: 0.6,
            },
          }
        );
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
      normalizer?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={outerRef} style={{ height: "380vh", background: "#ffffff" }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: 25 }}>
        <div
          ref={headingRef}
          className="absolute left-1/2 flex items-center gap-2 select-none"
          style={{ top: "3%", transform: "translateX(-50%)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 800,
              fontSize: "clamp(13px, 1.3vw, 18px)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#5C5C5C",
              whiteSpace: "nowrap",
            }}
          >
            A mark that
          </span>
          <span
            style={{
              fontFamily: "var(--font-ibm-mono)",
              fontWeight: 700,
              fontSize: "clamp(11px, 1.05vw, 14px)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#5C5C5C",
              border: "1px solid rgba(13,13,13,0.3)",
              borderRadius: 6,
              padding: "3px 12px",
              whiteSpace: "nowrap",
            }}
          >
            Radiates
          </span>
        </div>

        {LABELS.map((l) => (
          <div
            key={l.key}
            className="absolute flex items-center select-none pointer-events-none"
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
