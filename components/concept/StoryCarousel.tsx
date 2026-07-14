"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const stories = [
  {
    num: "01",
    label: ["ANYTHING BUT", "EVERYTHING"],
    caption: ["A PHILOSOPHY,", "NOT A PRODUCT"],
    desc: ["NOT A COMPANY THAT", "MAKES THINGS — A PHILOSOPHY", "EXPRESSED THROUGH", "FORM."],
    seed: "sw-meet-a",
  },
  {
    num: "02",
    label: ["BORN IN A SKETCH", "CARRIED 20 YEARS"],
    caption: ["FROM SKETCH", "TO SYMBOL"],
    desc: ["TWO DECADES OF CARRYING", "A MARK THAT KNEW WHAT", "IT WAS BEFORE", "WE DID."],
    seed: "sw-meet-b",
  },
  {
    num: "03",
    label: ["THE STANDARD IS", "THE ONLY CONSTANT"],
    caption: ["PRECISION IN", "EVERY DETAIL"],
    desc: ["THE PRODUCT CHANGES.", "THE INVISIBLE THREAD", "THAT HOLDS IT", "NEVER DOES."],
    seed: "sw-meet-c",
  },
  {
    num: "04",
    label: ["UNDERSTATED BUT", "NEVER UNNOTICED"],
    caption: ["CONFIDENCE", "WITHOUT NOISE"],
    desc: ["THE LOUDEST ROOMS", "ARE NOT ALWAYS THE", "MOST INFLUENTIAL", "ONES."],
    seed: "sw-meet-d",
  },
  {
    num: "05",
    label: ["KINDNESS IS NOT", "WEAKNESS"],
    caption: ["COMPASSION AS", "DESIGN RULE"],
    desc: ["EVERY DETAIL CARRIES", "AN INTENTION. EVERY", "CHOICE COMMUNICATES", "CARE."],
    seed: "sw-meet-e",
  },
];

const SPREAD_VW = 40;
const PEEK_K    = 0.85;

export function StoryCarousel() {
  const outerRef  = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardsRef  = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let st: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let meetSt: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gateSt: any = null;

    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      const cards = Array.from(
        cardsRef.current?.querySelectorAll<HTMLElement>(".meet-card") ?? []
      );
      const N = cards.length;
      if (!N || !outerRef.current) return;

      cards.forEach((card, i) => {
        const s    = 1 / (1 + i * PEEK_K);
        const dir  = i % 2 === 0 ? -1 : 1;          
        const tilt = dir * (4 + i * 1.5);            
        gsap.set(card, {
          x:        `${i * SPREAD_VW}vw`,
          scale:    s,
          rotation: tilt,
          opacity:  Math.max(0, 1 - i * 0.42),
          filter:   `grayscale(${i === 0 ? 0 : 100}%)`,
          zIndex:   N - i,
          force3D:  true,
        });
      });

      gsap.set(".meet-heading", { opacity: 0, y: 40 });

      let isCarouselVisible = false;

      gateSt = ScrollTrigger.create({
        trigger: outerRef.current,
        start:   "top 82%",
        end:     "bottom top",
        onEnter() {
          if (killed || isCarouselVisible) return;
          isCarouselVisible = true;
          gsap.killTweensOf(".meet-heading");
          gsap.to(".meet-heading", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
        },
        onLeaveBack() {
          if (killed || !isCarouselVisible) return;
          isCarouselVisible = false;
          gsap.killTweensOf(".meet-heading");
          gsap.set(".meet-heading", { opacity: 0, y: 40, scale: 1 });
        },
      });

      meetSt = ScrollTrigger.create({
        trigger: outerRef.current,
        start:   "75% top",
        end:     "bottom top",
        scrub:   0.6,
        onUpdate(self) {
          if (killed) return;
          gsap.set(".meet-heading", {
            scale:   1 - self.progress * 0.45,
            force3D: true,
          });
        },
      });

      st = ScrollTrigger.create({
        trigger: outerRef.current,
        start: "top top",
        end:   "bottom bottom",
        scrub: 0.45,
        onUpdate(self) {
          if (killed) return;
          const af = self.progress * (N - 1);
          setActiveIdx(Math.round(af));

          cards.forEach((card, i) => {
            const dist    = i - af;
            const absDist = Math.abs(dist);

            if (absDist > 2.4) {
              gsap.set(card, { opacity: 0, zIndex: 0 });
              return;
            }

            const scale     = 1 / (1 + absDist * PEEK_K);
            const opacity   = Math.max(0.12, 1 - absDist * 0.44);
            const grayscale = Math.min(100, absDist * 115);
            const dir       = i % 2 === 0 ? -1 : 1;
            const rotation  = dir * 4 + dist * 1.5;

            gsap.set(card, {
              x:        `${dist * SPREAD_VW}vw`,
              scale,
              rotation,
              opacity,
              filter:   `grayscale(${grayscale}%)`,
              zIndex:   Math.round(10 - absDist * 2),
              force3D:  true,
            });
          });
        },
      });
    });

    return () => { killed = true; st?.kill(); meetSt?.kill(); gateSt?.kill(); };
  }, []);

  const descCard = stories[Math.min(activeIdx + 1, stories.length - 1)];

  return (
    <section id="story-carousel" className="bg-white">
      <div
        ref={outerRef}
        style={{ height: `${stories.length * 100}vh` }}
        className="relative"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen overflow-hidden flex flex-col"
        >
          <div className="relative flex-1 min-h-0">

            <div className="absolute right-[5%] top-1/2 -translate-y-1/2 z-50 pointer-events-none select-none">
              {descCard.desc.map((line, i) => (
                <p key={i} className="text-[#0D0D0D] leading-relaxed"
                  style={{ fontFamily: "monospace", fontSize: "9px",
                    letterSpacing: "0.08em", opacity: 0.16 }}>
                  {line}
                </p>
              ))}
            </div>

            <div
              ref={cardsRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              {stories.map((s, i) => (
                <div
                  key={i}
                  className="meet-card absolute will-change-transform"
                  style={{ transformOrigin: "center center" }}
                >
                  <div style={{ width: "clamp(380px, 42vw, 600px)" }}>

                    <div className="flex items-end justify-between mb-[14px]">
                      <div className="flex flex-col gap-[5px]">
                        <div className="bg-[#0A1AFF]" style={{ width: 10, height: 10 }} />
                        {s.label.map((line, j) => (
                          <span key={j}
                            className="font-bold text-[#0A1AFF] leading-none"
                            style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.1em" }}>
                            {line}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "15px", lineHeight: 1 }}>
                        <span className="font-bold text-[#0D0D0D]">{s.num}</span>
                        <span className="text-[#0D0D0D]" style={{ opacity: 0.35 }}>/05</span>
                      </div>
                    </div>

                    <div
                      className="relative overflow-hidden bg-[#C8C5BF]"
                      style={{ aspectRatio: "3/4" }}
                    >
                      <div
                        className="absolute inset-x-0"
                        style={{ top: "-10%", height: "120%" }}
                      >
                        <Image
                          src={`https://picsum.photos/seed/${s.seed}/480/680`}
                          alt={s.label[0]}
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 80vw, 30vw"
                          priority={i === 0}
                        />
                      </div>
                    </div>

                    <div className="mt-[14px] text-right">
                      {s.caption.map((line, j) => (
                        <div key={j}
                          className="text-[#0D0D0D] font-bold leading-snug"
                          style={{ fontFamily: "monospace", fontSize: "13px", letterSpacing: "0.1em" }}>
                          {line}
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="meet-heading select-none pointer-events-none"
            style={{
              position:       "fixed",
              bottom:         "clamp(12px, 2.5vw, 28px)",
              left:           0,
              right:          0,
              display:        "flex",
              justifyContent: "center",
              zIndex:         40,
              opacity:        0,
            }}
          >
            <span
              className="font-black text-[#0D0D0D] leading-none"
              style={{ fontSize: "clamp(36px, 7vw, 100px)", letterSpacing: "-0.035em" }}
            >
              MEET
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
