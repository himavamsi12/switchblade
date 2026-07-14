"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TIERS = [
  {
    num: "01", name: "OBSIDIAN", sub: "Lifetime · Most exclusive",
    benefits: [
      "Early access to every product drop",
      "Lifetime archive — every collection",
      "Direct line to Sanjam Thappa",
      "Priority invitations to private events",
      "Annual inner circle conclave",
      "No expiry. No renewal. Lifetime.",
    ],
  },
  {
    num: "02", name: "CARBON", sub: "Annual · Inner circle",
    benefits: [
      "Access to seasonal product drops",
      "Three-year rolling archive",
      "Quarterly dispatches from Sanjam",
      "Invitations to select private events",
      "Annual member gathering",
      "Renews each year.",
    ],
  },
  {
    num: "03", name: "STEEL", sub: "Founding · Entry access",
    benefits: [
      "Entry access to public launches",
      "Founding member recognition",
      "Seasonal curated newsletter",
      "Access to open events",
      "Community archive access",
      "Annual renewal.",
    ],
  },
] as const;

const QUADS = [
  { clip: "inset(0 50% 50% 0)",  xPct: -115, yPct: -115 }, 
  { clip: "inset(0 0 50% 50%)",  xPct:  115, yPct: -115 }, 
  { clip: "inset(50% 50% 0 0)",  xPct: -115, yPct:  115 }, 
  { clip: "inset(50% 0 0 50%)",  xPct:  115, yPct:  115 }, 
] as const;

export function MembershipSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const quadRefs   = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const switchTier = (i: number) => {
    if (i === active) return;
    setFading(true);
    setTimeout(() => { setActive(i); setFading(false); }, 110);
  };

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
      if (!quads.length || !sectionRef.current) return;

      QUADS.forEach((q, i) => gsap.set(quads[i], { xPercent: q.xPct, yPercent: q.yPct }));

      const trigger = {
        trigger: sectionRef.current,
        start: "top 82%",
        end:   "top 12%",
        scrub: 1.8,
      };

      QUADS.forEach((q, i) => {
        const st = gsap.fromTo(
          quads[i],
          { xPercent: q.xPct, yPercent: q.yPct },
          { xPercent: 0, yPercent: 0, ease: "power2.inOut", immediateRender: false, scrollTrigger: trigger }
        );
        sts.push(st);
      });
    });

    return () => {
      killed = true;
      sts.forEach(s => { s?.kill(); s?.scrollTrigger?.kill(); });
    };
  }, []);

  const tier = TIERS[active];

  return (
    <section
      ref={sectionRef}
      className="bg-white"
      style={{ padding: "clamp(72px, 9vw, 130px) clamp(20px, 5vw, 72px)" }}
    >
      <p
        className="select-none"
        style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.22em", color: "#5C5C5C", marginBottom: "clamp(44px, 6vw, 80px)" }}
      >
        MEMBERSHIP
      </p>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 items-start">

        <div className="w-full lg:w-[50%] xl:w-[52%] shrink-0">
          <div
            className="relative overflow-hidden"
            style={{ paddingBottom: "100%", maxWidth: "580px" }}
          >
            {QUADS.map((q, i) => (
              <div
                key={i}
                ref={el => { quadRefs.current[i] = el; }}
                className="absolute inset-0 will-change-transform"
                style={{ clipPath: q.clip }}
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
            className="select-none"
            style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.2em", color: "#5C5C5C", opacity: 0.4, marginTop: "14px" }}
          >
            ACCESS IS EARNED. NOT BOUGHT.
          </p>
        </div>

        <div className="flex-1 min-w-0">

          <div>
            {TIERS.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between group"
                style={{
                  padding: "22px 0",
                  borderTop: "1px solid rgba(13,13,13,0.09)",
                  cursor: "default",
                  opacity: active === i ? 1 : 0.32,
                  transition: "opacity 200ms ease",
                }}
                onMouseEnter={() => switchTier(i)}
              >
                <div className="flex items-center gap-5">
                  <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.08em", color: "#5C5C5C", minWidth: "20px" }}>
                    {t.num}
                  </span>
                  <div>
                    <p
                      className="font-black text-[#0D0D0D] leading-none"
                      style={{ fontSize: "clamp(26px, 3.1vw, 44px)", letterSpacing: "-0.03em" }}
                    >
                      {t.name}
                    </p>
                    <p style={{ fontSize: "11px", letterSpacing: "0.06em", color: "#5C5C5C", marginTop: "5px", fontWeight: 500 }}>
                      {t.sub}
                    </p>
                  </div>
                </div>
                <span
                  className="transition-transform duration-150 group-hover:translate-x-1"
                  style={{ fontSize: "16px", color: "#0D0D0D", opacity: active === i ? 0.55 : 0.12 }}
                >
                  →
                </span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid rgba(13,13,13,0.09)" }} />
          </div>

          <div
            className="mt-8 bg-[#0D0D0D]"
            style={{ padding: "clamp(28px, 3vw, 40px)", transition: "opacity 110ms ease", opacity: fading ? 0 : 1 }}
          >
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>
              Featured tier
            </p>
            <p
              className="text-white font-black leading-none"
              style={{ fontSize: "clamp(24px, 3vw, 42px)", letterSpacing: "-0.03em", marginBottom: "28px" }}
            >
              {tier.name}
            </p>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "24px" }} />

            <div className="flex flex-col gap-4">
              {tier.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0A1AFF", marginTop: "6px", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.62)", lineHeight: 1.55 }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "32px" }}>
              <Link
                href="/membership"
                className="inline-flex items-center gap-2 bg-white text-[#0D0D0D] font-semibold hover:bg-[#0A1AFF] hover:text-white transition-colors duration-150"
                style={{ fontFamily: "var(--font-archivo)", fontSize: "12px", letterSpacing: "0.05em", padding: "12px 24px" }}
              >
                APPLY FOR ACCESS →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
