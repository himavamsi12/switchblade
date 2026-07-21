"use client";
import { useEffect, useRef } from "react";
import { Globe3D } from "@/components/shared/Globe3D";

function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(Switchblade|thinkers & doers)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === "Switchblade" || part === "thinkers & doers"
          ? <span key={i} style={{ color: "#0456DD" }}>{part}</span>
          : part
      )}
    </>
  );
}

export function ParagraphReveal() {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let leftColTrigger: any = null;

    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const badge = badgeRef.current;
      // 1024, not 768 — matches the isMobile threshold in RadiatesSection.tsx/page.tsx (see
      // their comments): the star only travels here at all above that width now, so tablets
      // between 768-1023 need this to agree or the badge would try to animate in for a star
      // that RadiatesSection never actually sends this way.
      if (badge && window.innerWidth >= 1024) {
        // Fading this in is owned by RadiatesSection's globeTravel timeline (see
        // components/home/RadiatesSection.tsx), not a separate ScrollTrigger here — this used to
        // be its own independently-created ScrollTrigger with a "top 45%" start chosen to match
        // globeTravel's end exactly, but two separately-measured triggers on the same element with
        // the same string can still resolve to different pixel positions (layout/measurement timing
        // differences), and live testing showed the badge appearing well before the star had
        // actually finished traveling to the globe. Driving it from the same timeline instance that
        // drives the star's x/y guarantees they can't drift apart — this effect now only sets the
        // hidden starting state; RadiatesSection finds this element by id and tweens it directly.
        gsap.set(badge, { opacity: 0, y: 8 });
      }

      // Left column (the "Switchblade is the beginning..." paragraph + Vision + Core Belief) fades
      // up as the reader scrolls it into reading position. This used to be a one-shot time-based
      // tween (toggleActions "play none none none", 0.9s) — fine for speed on its own, but the rest
      // of this second-section flow (RadiatesSection's labels + wordmark) was converted to be fully
      // scroll-SCRUBBED so it tracks scroll position at any speed, and a lone time-based fade here
      // read as inconsistent with that (it kept playing on its own clock right after a scrubbed
      // hand-off). Now scrubbed over its own scroll slice so the whole beat — wordmark out, then
      // this paragraph in — advances in lockstep with scroll, forward or back, at every speed.
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed || !leftColRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(leftColRef.current, { opacity: 0, y: 40 });
      leftColTrigger = gsap.to(leftColRef.current, {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: leftColRef.current,
          // Reveal spans from the column entering the lower viewport (top at 85%) up to it sitting
          // comfortably in the reading zone (top at 45%) — long enough that it's fully in before it
          // dominates the screen, scrubbed so it never plays ahead of or behind the scroll.
          start: "top 85%",
          end: "top 45%",
          scrub: 0.3,
        },
      }).scrollTrigger;
    });

    return () => {
      killed = true;
      leftColTrigger?.kill();
    };
  }, []);

  return (
    <div id="paragraph-reveal" style={{ background: "#ffffff", borderTop: "1px solid rgba(13,13,13,0.1)" }}>
      <div className="site-px grid grid-cols-1 lg:[grid-template-columns:1fr_1fr]" style={{ gap: "clamp(32px,5vw,64px)", paddingTop: "clamp(56px,7vw,100px)", paddingBottom: "clamp(90px,7vw,175px)", alignItems: "center" }}>

        <div ref={leftColRef}>
          <p style={{
            fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "clamp(24px,3vw,32px)",
            lineHeight: 1.12, color: "#0D0D0D", textAlign: "start",
          }}>
            <Highlighted text="Switchblade is the beginning of a journey for those who carry competence without seeking validation - the builders, thinkers & doers who value depth and attention to detail and those who refuse to get boxed in." />
          </p>

          <div style={{ borderTop: "1px solid rgba(13,13,13,0.15)", marginTop: "clamp(28px,3.5vw,24px)", paddingTop: "clamp(20px,2.5vw,28px)" }}>
            <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0456DD", marginBottom: 10 }}>Vision</p>
            <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: "clamp(20px,1.15vw,24px)", lineHeight: 1.2, color: "#0D0D0D" }}>
              To establish a standard that transcends categories, where every product, space, or experience reflects clarity, intent and lasting value.
            </p>
          </div>

          <div style={{ borderTop: "1px solid rgba(13,13,13,0.15)", marginTop: "clamp(24px,3vw,24px)", paddingTop: "clamp(20px,2.5vw,28px)" }}>
            <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0456DD", marginBottom: 10 }}>Core Belief</p>
            <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: "clamp(20px,1.15vw,24px)", lineHeight: 1.2, color: "#0D0D0D" }}>
              At the depth of human heart, there is no competition - only compassion, strength, kindness &amp; love.
            </p>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", aspectRatio: "548/499" }}>
          {/* Real rotating three.js globe (Globe3D) — replaces the former flat vision-globe.svg,
              which baked its continents (and the two "50%" callouts below) into one static image
              that could only ever be rotated as a flat tumbling card, not read as an actual
              sphere turning. The "50%" callouts now live as plain HTML overlays here instead of
              inside that SVG, so they stay upright and legible while the globe itself rotates
              underneath them. */}
          <Globe3D className="absolute inset-0" />

          <div className="flex flex-col gap-1" style={{ position: "absolute", top: "2%", left: 0 }}>
            <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(26px,3.3vw,40px)", lineHeight: 1, letterSpacing: "-0.02em", color: "#0D0D0D" }}>
              50<span style={{ fontSize: "0.42em", fontWeight: 700 }}>%</span>
            </span>
            <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "clamp(13px,1.15vw,16px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "#444", whiteSpace: "nowrap" }}>
              Individual Identity
            </span>
          </div>

          <div className="flex flex-col gap-1" style={{ position: "absolute", bottom: "2%", right: 0, textAlign: "right" }}>
            <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(26px,3.3vw,40px)", lineHeight: 1, letterSpacing: "-0.02em", color: "#0D0D0D" }}>
              50<span style={{ fontSize: "0.42em", fontWeight: 700 }}>%</span>
            </span>
            <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "clamp(13px,1.15vw,16px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "#444" }}>
              Collaborative<br />Effort
            </span>
          </div>

          {/* "SWITCHBLADE" tag beside the star once it's docked here (RadiatesSection's
              globeTravel parks it roughly over this image's upper-center area on desktop).
              Hidden on mobile — the star never travels into this section there at all (see
              RadiatesSection/page.tsx's isMobile guards), so there'd be nothing for this to
              label. Its fade-in is driven directly by RadiatesSection's globeTravel timeline
              (found by this id), not a ScrollTrigger here or the generic .scroll-entrance class —
              see the useEffect above for why. */}
          <span
            ref={badgeRef}
            id="switchblade-badge"
            className="hidden lg:inline-flex absolute"
            style={{
              top: "34%", left: "54%",
              background: "#0A1AFF", color: "#fff", borderRadius: 999,
              fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 14,
              padding: "8px 16px", whiteSpace: "nowrap", opacity: 0,
            }}
          >
            SWITCHBLADE
          </span>
        </div>

      </div>
    </div>
  );
}
