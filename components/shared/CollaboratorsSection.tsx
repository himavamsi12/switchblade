"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { SparkleMark } from "@/components/shared/SparkleMark";
import { SweepText } from "@/components/shared/SweepText";

const CARDS = [
  { num: "(01)", title: "Shared\nStorytelling",   icon: "/collaborate/icon-shared-storytelling.svg", w: 33, h: 34, gridClass: "md:col-start-1 md:row-start-1" },
  { num: "(03)", title: "A Co-Authored\nRelease",  icon: "/collaborate/icon-co-authored-release.svg", w: 38, h: 38, gridClass: "md:col-start-3 md:row-start-1" },
  { num: "(02)", title: "A Real\nFriendship",      icon: "/collaborate/icon-real-friendship.svg",     w: 35, h: 31, gridClass: "md:col-start-2 md:row-start-2" },
] as const;

export function CollaboratorsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let killed = false;
    import("gsap").then(async ({ gsap }) => {
      if (killed) return;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll(".col-reveal"),
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.09, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );
    });
    return () => { killed = true; };
  }, []);

  return (
    <section ref={sectionRef} className="site-px" style={{
      background: "#FFFFFF", overflow: "hidden",
      // paddingBlock (top/bottom only), not the `padding` shorthand — that used to set
      // padding-left/right to a literal 0 as well, which silently overrode the site-px
      // className's own padding-inline (an inline style always wins over a class for the same
      // property, pseudo-class or not), leaving the card grid flush against the screen edges on
      // mobile with no left/right breathing room at all.
      paddingBlock: "clamp(64px,9vw,120px)",
    }}>
      <h2 style={{
        fontFamily:    "var(--font-barlow)",
        fontWeight:    900,
        // Floor lowered from 38px and vw bumped from 6.5 to 7 — same overflow the /collaborate
        // page's own "Let's Collaborate" heading had: "Collaborate" (11 characters, one
        // unbreakable word, and now with the section's horizontal padding actually applying —
        // see the paddingBlock fix above — less available width than before) was getting clipped
        // past the edge on phone viewports at the old floor.
        fontSize:      "clamp(34px,7vw,64px)",
        letterSpacing: "-0.03em",
        lineHeight:    0.9,
        textTransform: "uppercase",
        marginBottom:  "clamp(56px,7vw,110px)",
        marginLeft:    "clamp(18px,2vw,26px)",
      }}>
        <SweepText tone="dark" color="#0D0D0D">
          Let&rsquo;s<br />Collaborate
        </SweepText>
      </h2>

      {/* Desktop arranges the 3 cards in a staggered checkerboard across a 3x2 grid via each
          card's explicit md: grid placement (gridClass above). Below md that placement is
          dropped and the grid falls back to a single column, so the cards just stack in order
          instead of leaving blank filler cells between them (which is what the old fixed 6-cell
          index mapping produced once the column count changed). */}
      <div className="col-reveal grid grid-cols-1 md:grid-cols-3" style={{ maxWidth: 920, margin: "0 auto", gap: "0" }}>
        {CARDS.map((card) => {
          return (
            <div
              key={card.num}
              className={card.gridClass}
              style={{
                aspectRatio: "361/191",
                border:       "1px solid rgba(13,13,13,0.1)",
                padding:      "clamp(18px,2vw,26px)",
                display:      "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Image src={card.icon} alt="" width={card.w} height={card.h} style={{ height: "clamp(22px,2vw,30px)", width: "auto" }} />
              <div>
                <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 12, color: "#0A1AFF", marginBottom: 6 }}>{card.num}</p>
                <h3 style={{
                  fontFamily:    "var(--font-archivo)",
                  fontWeight:    700,
                  fontSize:      "clamp(17px,1.7vw,22px)",
                  lineHeight:    1.15,
                  letterSpacing: "-0.01em",
                  color:         "#0D0D0D",
                  textTransform: "uppercase",
                  whiteSpace:    "pre-line",
                }}>
                  {card.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <p className="col-reveal" style={{
        fontFamily:    "var(--font-archivo)",
        fontWeight:    400,
        fontSize:      "clamp(14px,1.15vw,17px)",
        lineHeight:    1.5,
        color:         "#0D0D0D",
        textAlign:     "center",
        maxWidth:      560,
        margin:        "clamp(40px,5vw,64px) auto 0",
      }}>
        The first 100 minutes when we connect aren&apos;t about selling — they&apos;re about discovering whether we&apos;re truly aligned.
      </p>

      <div className="col-reveal" style={{ display: "flex", justifyContent: "center", marginTop: "clamp(24px,3vw,36px)" }}>
        <a
          href="/collaborate#pitch"
          className="flex items-center gap-3 rounded-lg text-white font-medium hover:opacity-85 transition-opacity"
          style={{ background: "#FF802B", fontSize: 14, padding: "8px 8px 8px 16px", fontFamily: "var(--font-archivo)", }}
        >
          Request for collaboration
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "#fff", borderRadius: 6 }}>
            <SparkleMark className="h-[20px] w-auto shrink-0 text-[#0D0D0D]" />
          </span>
        </a>
      </div>
    </section>
  );
}
