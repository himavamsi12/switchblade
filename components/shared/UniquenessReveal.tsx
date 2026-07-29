"use client";
import { SweepText } from "@/components/shared/SweepText";

const ANNO: React.CSSProperties = {
  fontFamily:    "var(--font-ibm-mono)",
  fontSize:      "clamp(13px, 1.15vw, 18px)",
  fontWeight:    700,
  letterSpacing: "0.10em",
  textTransform: "uppercase" as const,
  whiteSpace:    "nowrap",
};

export function UniquenessReveal() {
  return (
    <div className="relative" style={{ height: "170vh", background: "#ffffff" }}>
      <div className="sticky top-0 h-screen flex flex-col items-center overflow-hidden">
        {/* Below md the labels used to sit at `right/left: calc(100% + ...)` — entirely outside
            the giant SWITCHBLADE text's own width, which on a phone-width viewport pushed them
            past the screen edge (clipped by this container's overflow-hidden, so they just never
            rendered). Below md they instead sit just above/below the text itself, aligned to its
            left/right edges — SHARP EDGE over the "SWI" the word starts with, SOFT HEART under
            the "ADE" it ends with — since this wrapper div shrink-wraps to the text's own
            rendered width (it's a flex item with align-items:center, not stretched), `left-0`/
            `right-0` land exactly on those edges. md: and up reverts to the original side-flanking
            position, where there's room beside the text instead of only above/below it. */}
        <div className="relative select-none" style={{ marginTop: "48vh" }}>
          <div
            className="absolute left-0 -top-6 md:top-[8%] md:left-auto md:right-[calc(100%+clamp(12px,1.8vw,28px))]"
            style={{ ...ANNO, color: "#888" }}
          >
            [SHARP EDGE]
          </div>

          <p
            className="text-[#0D0D0D] font-black text-center"
            // lineHeight was 0.82, tuned tight for Barlow's specific vertical metrics. The new
            // display font (TBJ One More Demo, swapped in site-wide for --font-barlow) has taller
            // glyphs relative to its em box, so that same tight line-height clipped the tops of
            // the letters against the line box (visible as a flat-sheared cut across S/W/T/H/etc
            // at this component's giant scale). 0.92 gives the glyphs enough vertical room.
            // Floor/slope lowered from 60px/15vw: that sizing let "SWITCHBLADE" (11 characters,
            // bold) grow wider than a phone viewport itself, overflowing past both edges of this
            // container's overflow-hidden instead of just reading as a big display word.
            style={{ fontSize: "clamp(40px, 10vw, 106px)", letterSpacing: "-0.04em", lineHeight: 0.92 }}
          >
            <SweepText tone="dark" color="#0D0D0D">
              SWITCHBLADE
            </SweepText>
          </p>

          <div
            className="absolute right-0 -bottom-6 md:bottom-[8%] md:right-auto md:left-[calc(100%+clamp(12px,1.8vw,28px))]"
            style={{ ...ANNO, color: "#0A1AFF" }}
          >
            [SOFT HEART]
          </div>
        </div>
      </div>
    </div>
  );
}
