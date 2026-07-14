"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { SparkleMark } from "@/components/shared/SparkleMark";
import { StoryCarousel } from "@/components/concept/StoryCarousel";
import { ParagraphReveal } from "@/components/shared/ParagraphReveal";
import { UniquenessReveal } from "@/components/shared/UniquenessReveal";
import { OnePlaceForAll } from "@/components/concept/OnePlaceForAll";
import { MembershipPreview } from "@/components/concept/MembershipPreview";
import { CollaboratorsSection } from "@/components/shared/CollaboratorsSection";
import dynamic from "next/dynamic";
import type React from "react";

const Star3D = dynamic(
  () => import("@/components/shared/Star3D").then(m => m.Star3D),
  { ssr: false, loading: () => null }
);

function Hero({ starRef }: { starRef: React.RefObject<HTMLDivElement | null> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const navRef     = useRef<HTMLDivElement>(null);
  const tagRef     = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const descRef    = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sts: any[] = [];

    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      const star    = starRef.current;
      const section = sectionRef.current;
      if (!star || !section) return;

      gsap.set(star,            { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.88, opacity: 0, force3D: true });
      gsap.set(navRef.current,  { opacity: 0, y: -20 });
      gsap.set(tagRef.current,  { opacity: 0, y: 10 });
      gsap.set(headRef.current, { opacity: 0, y: 28 });
      gsap.set(descRef.current, { opacity: 0 });

      tl = gsap.timeline({
        onComplete() {
          if (killed) return;

          const t1 = gsap.fromTo(
            star,
            { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
            {
              x: "26vw", y: 0, scale: 0.85, rotation: 16, opacity: 1,
              ease: "power2.inOut",
              immediateRender: false,
              scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 1.5 },
            }
          );
          sts.push(t1);

          const carousel = document.getElementById("story-carousel");
          if (carousel) {
            const t2 = gsap.to(star, {
              x: "150vw", opacity: 0,
              duration: 0.35,
              ease: "power3.in",
              immediateRender: false,
              scrollTrigger: {
                trigger: carousel,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            });
            sts.push(t2);
          }
        },
      });

      tl
        .to(star,            { scale: 1, opacity: 1, duration: 1.0, ease: "power3.out" }, 0)
        .to(navRef.current,  { opacity: 1, y: 0,    duration: 0.5,  ease: "power3.out" }, 0.6)
        .to(tagRef.current,  { opacity: 1, y: 0,    duration: 0.4,  ease: "power3.out" }, 0.85)
        .to(headRef.current, { opacity: 1, y: 0,    duration: 0.6,  ease: "power3.out" }, 0.95)
        .to(descRef.current, { opacity: 1,           duration: 0.5,  ease: "power2.out" }, 1.2);
    });

    return () => {
      killed = true;
      tl?.kill();
      sts.forEach(s => { s?.kill(); s?.scrollTrigger?.kill(); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[640px]"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #E2EAF8 7%, #BAC8E8 18%, #7088D0 36%, #3656C0 56%, #1C38AE 74%, #1130A2 100%)",
      }}
    >
      <div
        ref={navRef}
        className="absolute top-0 inset-x-0 z-40 site-px flex items-center justify-between"
        style={{ height: "72px", opacity: 0 }} 
      >
        <div className="flex items-center gap-6">
          <Link href="/concept/3" className="text-white font-medium hover:text-[#FF802B] transition-colors" style={{ fontSize: "14px" }}>
            Home
          </Link>
          <Link href="/classics" className="text-white/80 font-normal hover:text-white transition-colors" style={{ fontSize: "14px" }}>
            Classics
          </Link>
          <Link href="/collaborate" className="text-white/80 font-normal hover:text-white transition-colors" style={{ fontSize: "14px" }}>
            Collaborate
          </Link>
        </div>

        <Link
          href="/concept/3"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white hover:text-[#FF802B] transition-colors"
        >
          <SparkleMark className="h-[26px] w-auto shrink-0" />
          <span className="font-black tracking-[0.04em]" style={{ fontSize: "18px" }}>
            SWITCHBLADE
          </span>
          <sup className="text-[9px] font-bold">TM</sup>
        </Link>

        <Link
          href="/collaborate"
          className="flex items-center gap-2 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
          style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: "14px", padding: "10px 12px" }}
        >
          Contact
          <SparkleMark className="h-[16px] w-auto shrink-0" />
        </Link>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-30 site-px pb-24 flex items-end justify-between gap-8">
        <div className="flex flex-col gap-4">
          <div ref={tagRef} className="flex items-center gap-2" style={{ opacity: 0 }}>
            <span style={{
              fontFamily: "monospace", fontSize: "11px",
              letterSpacing: "0.16em", color: "white", fontWeight: 700,
            }}>BIRTH OF</span>
            <span style={{
              fontFamily: "monospace", fontSize: "11px",
              letterSpacing: "0.12em", color: "white",
              border: "1px solid rgba(255,255,255,0.45)",
              borderRadius: "999px", padding: "2px 12px",
            }}>STAR</span>
          </div>

          <div ref={headRef} style={{ opacity: 0 }}>
            <h1
              className="text-white"
              style={{
                fontSize: "clamp(48px, 9.5vw, 136px)",
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: "-0.01em",
              }}
            >
              BORN<br />NOT LAUNCHED
            </h1>
          </div>
        </div>

        <p
          ref={descRef}
          className="text-white text-right shrink-0"
          style={{
            fontFamily: "monospace",
            fontSize: "clamp(10px, 0.9vw, 13px)",
            lineHeight: 1.8,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            maxWidth: "300px",
            opacity: 0, 
          }}
        >
          A CLEAN, CONFIDENT REBRAND THAT ELEVATES
          UNDERSTATEMENT INTO A SYMBOL OF CULTURAL
          SOPHISTICATION.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  const globalStarRef   = useRef<HTMLDivElement>(null);
  const founderMeetRef  = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let killed = false;
    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      const founderMeet = founderMeetRef.current;
      if (!founderMeet) return;

      gsap.set(founderMeet, { opacity: 0 });

      let isFounderActive = false;

      ScrollTrigger.create({
        trigger: founderMeet,
        start: () => {
          const meetEl = document.querySelector<HTMLElement>(".meet-heading");
          if (!meetEl) return "top 85%";
          const rect = meetEl.getBoundingClientRect();
          const pct  = Math.round((rect.top / window.innerHeight) * 100);
          return `top ${pct}%`;
        },
        onEnter() {
          if (killed || isFounderActive) return;
          isFounderActive = true;
          gsap.killTweensOf(".meet-heading");
          gsap.set(".meet-heading", { opacity: 0 });
          gsap.set(founderMeet, { opacity: 1 });
        },
        onLeaveBack() {
          if (killed || !isFounderActive) return;
          isFounderActive = false;
          gsap.killTweensOf(".meet-heading");
          gsap.to(".meet-heading", { opacity: 1, y: 0, duration: 0.3 });
          gsap.set(founderMeet, { opacity: 0 });
        },
      });
    });
    return () => { killed = true; };
  }, []);

  return (
    <>
      <div
        ref={globalStarRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 20,
          top: "38%",
          left: "50%",
          width:  "clamp(380px, 58vw, 820px)",
          height: "clamp(380px, 78vh, 920px)",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <Star3D className="w-full h-full" />
        </div>
      </div>

      <Hero starRef={globalStarRef} />

      <UniquenessReveal />

      <ParagraphReveal />

      <StoryCarousel />

      <section className="bg-white overflow-hidden" style={{ paddingTop: "clamp(12px,2vw,24px)" }}>

        <div className="text-center select-none leading-none">
          <p
            ref={founderMeetRef}
            className="font-black"
            style={{
              fontFamily:    "var(--font-barlow)",
              fontSize:      "clamp(36px, 9vw, 140px)",
              letterSpacing: "0.12em",
              lineHeight:    0.86,
              color:         "#0A1AFF",
            }}
          >
            MEET
          </p>

          <p className="text-[#0D0D0D] font-black"
            style={{ fontSize: "clamp(36px, 9vw, 140px)", letterSpacing: "-0.02em", lineHeight: 0.86 }}>
            SANJAM
          </p>

          <p className="text-[#0D0D0D] font-black"
            style={{ fontSize: "clamp(36px, 9vw, 140px)", letterSpacing: "-0.02em", lineHeight: 0.86 }}>
            THAPPA
          </p>
        </div>

        <div className="relative flex items-center" style={{ margin: "clamp(16px,2.5vw,36px) 0" }}>
          <div className="flex-1 h-px bg-[#0D0D0D]/15" />
          <div className="flex items-center gap-0 shrink-0 px-4">
            <span className="text-[#0A1AFF] font-black select-none"
              style={{ fontSize: "clamp(18px, 2.2vw, 30px)", margin: "0 clamp(12px,2vw,28px)" }}>*</span>
            <span className="text-[#0D0D0D] font-light select-none"
              style={{ fontSize: "clamp(48px, 7vw, 100px)", lineHeight: 1 }}>(</span>
            <div className="relative overflow-hidden"
              style={{ width: "clamp(56px, 6vw, 88px)", height: "clamp(56px, 6vw, 88px)", margin: "0 4px" }}>
              <Image
                src="https://picsum.photos/seed/sf-bridge/400/400"
                alt="Landscape"
                fill
                className="object-cover grayscale"
                sizes="88px"
              />
            </div>
            <span className="text-[#0D0D0D] font-light select-none"
              style={{ fontSize: "clamp(48px, 7vw, 100px)", lineHeight: 1 }}>)</span>
            <span className="text-[#0A1AFF] font-black select-none"
              style={{ fontSize: "clamp(18px, 2.2vw, 30px)", margin: "0 clamp(12px,2vw,28px)" }}>*</span>
          </div>
          <div className="flex-1 h-px bg-[#0D0D0D]/15" />
        </div>

        <div className="text-center select-none leading-none">
          <p className="text-[#0D0D0D] font-black"
            style={{ fontSize: "clamp(36px, 9vw, 140px)", letterSpacing: "-0.02em", lineHeight: 0.86 }}>
            FOUNDER
          </p>
        </div>

        <div className="site-px" style={{ marginTop: "clamp(40px,6vw,80px)", paddingBottom: "clamp(56px,8vw,100px)" }}>
          <div className="flex items-start justify-between gap-8">

            <div className="shrink-0 pt-2" style={{ minWidth: "clamp(100px,12vw,160px)" }}>
              <p style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.16em", color: "#999", textTransform: "uppercase", marginBottom: "6px" }}>
                A JOURNEY
              </p>
              <p style={{ fontFamily: "monospace", fontSize: "clamp(11px,1vw,13px)", letterSpacing: "0.1em", color: "#0D0D0D", fontWeight: 700, textTransform: "uppercase" }}>
                FROM CHILDHOOD
              </p>
            </div>

            <div className="flex-1 text-center" style={{ maxWidth: "52%" }}>
              <p style={{
                fontFamily:    "var(--font-ibm-mono)",
                fontSize:      "clamp(12px, 1.15vw, 16px)",
                fontWeight:    700,
                lineHeight:    1.75,
                letterSpacing: "0.04em",
                color:         "#0D0D0D",
                textTransform: "uppercase",
              }}>
                &ldquo;We started this with a single sketch and a stubborn idea.
                After two decades of carrying the mark and building the philosophy,{" "}
                <span style={{ color: "#0054DE" }}>Switchblade</span> became exactly what it needed to be &mdash; understated,
                precise, and compassionate.&rdquo;
              </p>
            </div>

            <div className="shrink-0" style={{ width: "clamp(200px,22vw,310px)" }}>
              <div className="relative" style={{ width: "100%", paddingBottom: "79.4%" }}>
                <Image
                  src="/founder-portrait.png"
                  alt="Sanjam Thappa — Founder"
                  fill
                  className="object-contain"
                  sizes="310px"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <OnePlaceForAll />

      <MembershipPreview />

      <CollaboratorsSection />

    </>
  );
}
