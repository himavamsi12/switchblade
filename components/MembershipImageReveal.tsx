"use client";
import { useEffect, useRef } from "react";

const QUADRANTS = [
  { clip: "inset(0 50% 50% 0)",  fromX: "-55vw", fromY: "-55vh", z: 1 }, 
  { clip: "inset(0 0 50% 50%)",  fromX:  "55vw", fromY: "-55vh", z: 2 }, 
  { clip: "inset(50% 50% 0 0)",  fromX: "-55vw", fromY:  "55vh", z: 3 }, 
  { clip: "inset(50% 0 0 50%)",  fromX:  "55vw", fromY:  "55vh", z: 4 }, 
] as const;

export function MembershipImageReveal() {
  const outerRef  = useRef<HTMLDivElement>(null);
  const quadRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sts: any[] = [];

    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      const quads = quadRefs.current.filter(Boolean) as HTMLDivElement[];
      if (quads.length < 4 || !outerRef.current) return;

      QUADRANTS.forEach((q, i) => gsap.set(quads[i], { x: q.fromX, y: q.fromY }));

      const trigger = {
        trigger: outerRef.current,
        start: "top 85%",
        end:   "top 8%",
        scrub: 1.6,
      };

      QUADRANTS.forEach((q, i) => {
        const st = gsap.fromTo(
          quads[i],
          { x: q.fromX, y: q.fromY },
          { x: 0, y: 0, ease: "power2.inOut", immediateRender: false, scrollTrigger: trigger }
        );
        sts.push(st);
      });
    });

    return () => {
      killed = true;
      sts.forEach(s => { s?.kill(); s?.scrollTrigger?.kill(); });
    };
  }, []);

  return (
    <section style={{ background: "#F2EDE4" }}>
      <div ref={outerRef} style={{ height: "200vh" }} className="relative">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

          <div className="flex items-center gap-3 mb-10 select-none pointer-events-none">
            <div style={{ width: "24px", height: "1px", background: "#0D0D0D", opacity: 0.2 }} />
            <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.22em", color: "#5C5C5C" }}>
              MEMBERSHIP
            </span>
            <div style={{ width: "24px", height: "1px", background: "#0D0D0D", opacity: 0.2 }} />
          </div>

          <div
            className="relative"
            style={{
              width:  "min(84vw, 82vh, 840px)",
              height: "min(84vw, 82vh, 840px)",
            }}
          >
            {QUADRANTS.map((q, i) => (
              <div
                key={i}
                ref={el => { quadRefs.current[i] = el; }}
                className="absolute inset-0 will-change-transform"
                style={{ clipPath: q.clip, zIndex: q.z }}
              >
                <img
                  src="/membership-assembled.png"
                  alt="Switchblade membership cards"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          <p
            className="mt-10 select-none pointer-events-none"
            style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.2em", color: "#5C5C5C", opacity: 0.45 }}
          >
            ACCESS IS EARNED. NOT BOUGHT.
          </p>

        </div>
      </div>
    </section>
  );
}
