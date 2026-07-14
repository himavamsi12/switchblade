"use client";
import Link from "next/link";
import Image from "next/image";

const BAR: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "13px clamp(20px,5vw,72px)",
  borderBottom: "1px solid rgba(13,13,13,0.1)",
};

const MONO = (size = "9px", opacity = 1): React.CSSProperties => ({
  fontFamily: "monospace",
  fontSize: size,
  letterSpacing: "0.11em",
  lineHeight: 1.55,
  color: `rgba(13,13,13,${opacity})`,
});

const HERO: React.CSSProperties = {
  fontFamily: "var(--font-barlow)",
  fontWeight: 900,
  letterSpacing: "-0.03em",
  lineHeight: 0.86,
  color: "#0D0D0D",
  textTransform: "uppercase",
};

function Thumb({
  seed, w = "100%", aspect = "75%", caption, counter, align = "left",
}: {
  seed: string; w?: string; aspect?: string; caption: string; counter: string; align?: "left" | "right";
}) {
  return (
    <div style={{ width: w }}>
      {align === "right" && (
        <p style={{ ...MONO("9px"), marginBottom: 8, textAlign: "right" }}>{caption}</p>
      )}
      {align === "left" && (
        <p style={{ ...MONO("9px"), marginBottom: 8 }}>{caption}</p>
      )}
      <div style={{ position: "relative", width: "100%", paddingBottom: aspect, overflow: "hidden", background: "#D8D4CE" }}>
        <Image src={`https://picsum.photos/seed/${seed}/480/360`} alt={caption} fill className="object-cover grayscale" sizes="200px" />
      </div>
      <p style={{ ...MONO("9px", 0.35), marginTop: 7, textAlign: align }}>{counter}</p>
    </div>
  );
}

import type React from "react";

export function EditorialMembership() {
  return (
    <section style={{ background: "#F8F7F4", overflow: "hidden" }}>

      <div style={{ borderTop: "1px solid rgba(13,13,13,0.1)" }}>

        <div style={BAR}>
          <span style={MONO("9px")}>MEMBERSHIP #01 SWITCHBLADE</span>
          <span style={MONO("9px")}>EST. 2006 — (PHILOSOPHY FIRST)</span>
          <span style={MONO("9px")}>TIERS (3)</span>
          <span style={{ ...MONO("12px"), letterSpacing: 3 }}>≡</span>
        </div>

        <div style={{ position: "relative", padding: "0 clamp(20px,5vw,72px)", minHeight: "86vh" }}>

          <h2 style={{ ...HERO, fontSize: "clamp(64px,13.5vw,210px)", paddingTop: "clamp(18px,2.5vw,40px)", maxWidth: "72%" }}>
            FOUNDING<br />MEMBER<br />CIRCLE&rdquo;
          </h2>

          <div style={{ position: "absolute", top: "clamp(16px,2.5vw,36px)", right: "clamp(20px,5vw,72px)", width: "clamp(100px,11vw,150px)" }}>
            <Thumb seed="sw-obsidian-a" aspect="75%" caption={"OBSIDIAN /\nLIFETIME ACCESS"} counter="(1'1)" align="right" />
          </div>

          <div style={{ position: "absolute", top: "clamp(220px,28vw,380px)", right: "clamp(20px,5vw,72px)", textAlign: "right" }}>
            <p style={{ ...MONO("9px", 0.5), lineHeight: 1.7 }}>
              ACCESS — FOUNDING<br />CIRCLE / 2026
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(16px,2.5vw,40px)", marginTop: "clamp(20px,3.5vw,52px)", paddingBottom: "clamp(24px,3.5vw,52px)" }}>

            <div style={{ flexShrink: 0, width: "clamp(80px,9vw,130px)" }}>
              <Thumb seed="sw-carbon-b" aspect="100%" caption={"CARBON /\nANNUAL"} counter="(1'2)" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ width: "clamp(28px,2.8vw,38px)", height: "clamp(28px,2.8vw,38px)", border: "1px solid rgba(13,13,13,0.18)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "clamp(14px,1.8vw,24px)" }}>
                <span style={{ fontSize: 13, color: "#0D0D0D", opacity: 0.35 }}>+</span>
              </div>
              <p style={{ ...MONO("clamp(9px,0.72vw,11px)"), lineHeight: 1.85, marginBottom: "clamp(12px,1.6vw,22px)", opacity: 0.6 }}>
                FOUNDING MEMBER PROGRAM /<br />
                CAPPED AT 100 PEOPLE — NO<br />
                DISCOUNTS. NO GIMMICKS.<br />
                JUST EARLY ACCESS TO EVERY DROP.
              </p>
              <p style={{ ...MONO("clamp(9px,0.72vw,11px)"), lineHeight: 1.85 }}>
                BE ONE<br />OF 100 /<br />APPLY 26&apos;
              </p>
            </div>

            <div style={{ flexShrink: 0, width: "clamp(180px,26vw,360px)" }}>
              <div style={{ position: "relative", width: "100%", paddingBottom: "133%", overflow: "hidden", background: "#C4C0BB" }}>
                <Image src="https://picsum.photos/seed/sw-member-port/480/640" alt="Founding member" fill className="object-cover grayscale" sizes="380px" />
              </div>
              <p style={{ ...MONO("9px", 0.35), marginTop: 7, textAlign: "right" }}>(1&apos;3)</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "clamp(16px,2vw,28px)" }}>
            <p style={{ ...MONO("9px"), lineHeight: 1.7 }}>
              ACCESS IS<br />EARNED.<br />NOT BOUGHT.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px clamp(20px,5vw,72px)", borderTop: "1px solid rgba(13,13,13,0.1)" }}>
          <span style={MONO("9px")}>MEMBERSHIP #01 SWITCHBLADE</span>
          <Link href="/membership" style={{ ...MONO("9px"), color: "#0A1AFF", textDecoration: "none" }}>APPLY NOW →</Link>
          <span style={{ ...HERO, fontSize: "clamp(28px,4.5vw,64px)" }}>COL 1</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(13,13,13,0.1)" }}>

        <div style={BAR}>
          <span style={MONO("9px")}>COLLABORATION #01 SWITCHBLADE</span>
          <span style={MONO("9px")}>WHO WE SPEAK TO — (DISPOSITIONS NOT DEMOGRAPHICS)</span>
          <span style={MONO("9px")}>CIRCLES (4)</span>
          <span style={{ ...MONO("12px"), letterSpacing: 3 }}>≡</span>
        </div>

        <div style={{ position: "relative", padding: "0 clamp(20px,5vw,72px)", minHeight: "86vh" }}>

          <h2 style={{ ...HERO, fontSize: "clamp(64px,13.5vw,210px)", paddingTop: "clamp(18px,2.5vw,40px)", maxWidth: "72%" }}>
            UNDER<br />STATED<br />WORKS&rdquo;
          </h2>

          <div style={{ position: "absolute", top: "clamp(16px,2.5vw,36px)", right: "clamp(20px,5vw,72px)", width: "clamp(100px,11vw,150px)" }}>
            <Thumb seed="sw-designer" aspect="75%" caption={"THE DESIGNER /\n22'23"} counter="(2'1)" align="right" />
          </div>

          <div style={{ position: "absolute", top: "clamp(220px,28vw,380px)", right: "clamp(20px,5vw,72px)", textAlign: "right" }}>
            <p style={{ ...MONO("9px", 0.5), lineHeight: 1.7 }}>
              SW — COLLABORATION<br />CIRCLE / 2026
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(16px,2.5vw,40px)", marginTop: "clamp(20px,3.5vw,52px)", paddingBottom: "clamp(24px,3.5vw,52px)" }}>

            <div style={{ flexShrink: 0, width: "clamp(80px,9vw,130px)" }}>
              <Thumb seed="sw-artist-b" aspect="100%" caption={"THE ARTIST /\n24'25"} counter="(2'2)" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ width: "clamp(28px,2.8vw,38px)", height: "clamp(28px,2.8vw,38px)", border: "1px solid rgba(13,13,13,0.18)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "clamp(14px,1.8vw,24px)" }}>
                <span style={{ fontSize: 13, color: "#0D0D0D", opacity: 0.35 }}>+</span>
              </div>
              <p style={{ ...MONO("clamp(9px,0.72vw,11px)"), lineHeight: 1.85, marginBottom: "clamp(12px,1.6vw,22px)", opacity: 0.6 }}>
                UNDERSTATED COMPETENCE /<br />
                SUBTLE SUPER-CONFIDENCE —<br />
                KINDNESS &amp; COMPASSION /<br />
                THE THREE PILLARS OF SWITCHBLADE.
              </p>
              <p style={{ ...MONO("clamp(9px,0.72vw,11px)"), lineHeight: 1.85 }}>
                THE KIND<br />&amp; CAPABLE /<br />COLLABORATE 26&apos;
              </p>
            </div>

            <div style={{ flexShrink: 0, width: "clamp(180px,26vw,360px)" }}>
              <div style={{ position: "relative", width: "100%", paddingBottom: "133%", overflow: "hidden", background: "#C4C0BB" }}>
                <Image src="https://picsum.photos/seed/sw-collab-port/480/640" alt="Collaboration" fill className="object-cover grayscale" sizes="380px" />
              </div>
              <p style={{ ...MONO("9px", 0.35), marginTop: 7, textAlign: "right" }}>(2&apos;3)</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "clamp(6px,0.8vw,12px)", flexWrap: "wrap", paddingBottom: "clamp(16px,2vw,28px)" }}>
            {["THE DESIGNER / ARCHITECT", "THE ARTIST", "THE KIND & CAPABLE", "THE EDGE-CHOOSER"].map((label, i) => (
              <span key={i} style={{ ...MONO("9px"), border: "1px solid rgba(13,13,13,0.15)", padding: "5px 12px", opacity: 0.65 }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px clamp(20px,5vw,72px)", borderTop: "1px solid rgba(13,13,13,0.1)" }}>
          <span style={MONO("9px")}>COLLABORATION #01 SWITCHBLADE</span>
          <Link href="/collaborate" style={{ ...MONO("9px"), color: "#0A1AFF", textDecoration: "none" }}>COLLABORATE →</Link>
          <span style={{ ...HERO, fontSize: "clamp(28px,4.5vw,64px)" }}>COL 2</span>
        </div>
      </div>

    </section>
  );
}
