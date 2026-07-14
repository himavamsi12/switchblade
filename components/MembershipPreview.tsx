"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SweepText } from "@/components/SweepText";

export function MembershipPreview() {
  const sectionRef   = useRef<HTMLElement>(null);
  const leftTopRef   = useRef<HTMLDivElement>(null);
  const leftBottomRef = useRef<HTMLDivElement>(null);
  const rightRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killed = false;
    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;

      gsap.fromTo([leftTopRef.current, leftBottomRef.current],
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );
      gsap.fromTo(rightRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.18,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } }
      );
    })();
    return () => { killed = true; };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #E2EAF8 6%, #C8D4F0 16%, #7088D0 36%, #3656C0 56%, #1130A2 100%)",
        overflow:   "hidden",
        position:   "relative",
      }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px clamp(24px,5vw,80px)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}>
        {["MEMBERSHIP — SWITCHBLADE", "100 MAX · EARLY ACCESS ONLY", "EST. 2006"].map(t => (
          <span key={t} style={{ fontFamily: "var(--font-ibm-mono)", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr clamp(300px,42%,560px)",
        gap:                 "clamp(40px,6vw,100px)",
        padding:             "clamp(60px,8vw,120px) clamp(24px,5vw,80px)",
        alignItems:          "center",
      }}>

        <div>
          <div ref={leftTopRef}>
            <p style={{
              fontFamily: "var(--font-ibm-mono)", fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", marginBottom: "clamp(16px,2vw,24px)",
            }}>
              Founding Member Circle
            </p>
          </div>

          <h2 style={{
            fontFamily:    "var(--font-barlow)",
            fontWeight:    900,
            fontSize:      "clamp(56px,10vw,144px)",
            letterSpacing: "-0.03em",
            lineHeight:    0.86,
            textTransform: "uppercase",
            marginBottom:  "clamp(32px,4vw,56px)",
          }}>
            <SweepText tone="light" color="#FFFFFF">
              FOUNDING<br />MEMBER<br />CIRCLE.
            </SweepText>
          </h2>

          <div ref={leftBottomRef}>
          <div style={{ marginBottom: "clamp(32px,4vw,52px)", maxWidth: 380 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,1.5vw,20px)", paddingBottom: "clamp(14px,1.8vw,24px)" }}>
              <span style={{
                fontFamily:    "var(--font-barlow)",
                fontWeight:    900,
                fontSize:      "clamp(44px,6vw,88px)",
                letterSpacing: "-0.04em",
                lineHeight:    1,
                color:         "#F97316",
                flexShrink:    0,
              }}>
                50%
              </span>
              <div>
                <p style={{
                  fontFamily:    "var(--font-ibm-mono)",
                  fontSize:      "clamp(10px,0.85vw,12px)",
                  fontWeight:    700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color:         "rgba(255,255,255,0.9)",
                  lineHeight:    1.4,
                }}>
                  Own<br />Product
                </p>
              </div>
            </div>

            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.15)", marginBottom: "clamp(14px,1.8vw,24px)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,1.5vw,20px)" }}>
              <span style={{
                fontFamily:    "var(--font-barlow)",
                fontWeight:    900,
                fontSize:      "clamp(44px,6vw,88px)",
                letterSpacing: "-0.04em",
                lineHeight:    1,
                color:         "#ffffff",
                flexShrink:    0,
              }}>
                50%
              </span>
              <div>
                <p style={{
                  fontFamily:    "var(--font-ibm-mono)",
                  fontSize:      "clamp(10px,0.85vw,12px)",
                  fontWeight:    700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color:         "rgba(255,255,255,0.55)",
                  lineHeight:    1.4,
                }}>
                  Collaborative<br />Model
                </p>
              </div>
            </div>
          </div>

          <p style={{
            fontFamily:    "var(--font-ibm-mono)",
            fontSize:      "clamp(14px,1.2vw,17px)",
            letterSpacing: "0.04em",
            lineHeight:    1.9,
            color:         "rgba(255,255,255,0.82)",
            textTransform: "uppercase",
            maxWidth:      460,
            marginBottom:  "clamp(36px,4.5vw,60px)",
          }}>
            Capped at 100 people.<br />
            No discounts. No gimmicks. Ever.<br />
            The only benefit: early access to<br />
            every drop before anyone else. Forever.
          </p>

          <p style={{
            fontFamily: "var(--font-ibm-mono)", fontSize: 10,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.38)", marginBottom: 14,
          }}>
            Get early access — join the list
          </p>

          <form onSubmit={e => e.preventDefault()} style={{ display: "flex", gap: 10, maxWidth: 500 }}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              style={{
                flex:          1,
                height:        52,
                background:    "rgba(255,255,255,0.10)",
                border:        "1px solid rgba(255,255,255,0.22)",
                borderRadius:  999,
                color:         "#ffffff",
                fontFamily:    "var(--font-ibm-mono)",
                fontSize:      14,
                letterSpacing: "0.03em",
                padding:       "0 22px",
                outline:       "none",
                minWidth:      0,
                transition:    "border-color 0.2s",
              }}
              onFocus={e  => (e.target.style.borderColor = "rgba(255,255,255,0.65)")}
              onBlur={e   => (e.target.style.borderColor = "rgba(255,255,255,0.22)")}
            />
            <button
              type="submit"
              style={{
                height:        52,
                padding:       "0 28px",
                borderRadius:  999,
                border:        "none",
                background:    "#F97316",
                color:         "#ffffff",
                fontFamily:    "var(--font-ibm-mono)",
                fontWeight:    700,
                fontSize:      12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor:        "pointer",
                whiteSpace:    "nowrap",
                flexShrink:    0,
                transition:    "background 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ea6c0a"; e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#F97316"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              Request Access →
            </button>
          </form>

          <p style={{
            fontFamily: "var(--font-ibm-mono)", fontSize: 10, letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.3)", marginTop: 12,
          }}>
            No spam. When it&apos;s time, you&apos;ll hear from us first.
          </p>

          <Link href="/membership" style={{
            display:        "inline-flex",
            alignItems:     "center",
            gap:            8,
            marginTop:      "clamp(28px,3.5vw,48px)",
            fontFamily:     "var(--font-ibm-mono)",
            fontWeight:     700,
            fontSize:       11,
            letterSpacing:  "0.14em",
            textTransform:  "uppercase",
            color:          "rgba(255,255,255,0.5)",
            textDecoration: "none",
            transition:     "color 0.15s",
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
          >
            View all membership details →
          </Link>
          </div>
        </div>

        <div ref={rightRef}>
          <p style={{
            fontFamily: "var(--font-ibm-mono)", fontWeight: 700,
            fontSize: 12, letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.7)", marginBottom: 14,
          }}>
            /BE EXCLUSIVE
          </p>

          <div style={{
            position:     "relative",
            width:        "100%",
            aspectRatio:  "3/4",
            overflow:     "hidden",
            borderRadius: "clamp(10px,1.2vw,18px)",
            boxShadow:    "0 28px 80px rgba(0,0,0,0.4)",
          }}>
            <Image
              src="/membership-cards.png"
              alt="Switchblade membership cards"
              fill
              className="object-cover"
              sizes="(max-width:768px) 90vw, 42vw"
            />
            <div style={{
              position:   "absolute",
              inset:      0,
              background: "linear-gradient(to bottom, transparent 55%, rgba(17,48,162,0.4) 100%)",
            }} />
          </div>

          <p style={{
            fontFamily: "var(--font-ibm-mono)", fontSize: 9,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", marginTop: 12, textAlign: "right",
          }}>
            Obsidian · Ivory · Ember · Citron
          </p>
        </div>
      </div>

      <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        {[
          { num: "100", label: "Maximum members" },
          { num: "01",  label: "Benefit: early access" },
          { num: "∞",   label: "Obsidian: no expiry" },
        ].map((s, i, arr) => (
          <div key={i} style={{
            flex:        1,
            padding:     "clamp(18px,2.5vw,36px) clamp(24px,5vw,80px)",
            borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
          }}>
            <p style={{
              fontFamily: "var(--font-barlow)", fontWeight: 900,
              fontSize: "clamp(28px,3.5vw,52px)", letterSpacing: "-0.03em",
              color: "#FFFFFF", lineHeight: 1, marginBottom: 6,
            }}>
              {s.num}
            </p>
            <p style={{
              fontFamily: "var(--font-ibm-mono)", fontSize: 10,
              letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
            }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
