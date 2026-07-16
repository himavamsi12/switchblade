"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const NAV_LINKS = [
  { label: "Home",          href: "/" },
  { label: "Classics",      href: "/classics" },
  { label: "Shop",          href: "/membership" },
  { label: "Collaboration", href: "/collaborate" },
  { label: "Help",          href: "#" },
];

export function SiteFooter() {
  const wordmarkWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkRef     = useRef<HTMLParagraphElement>(null);

  // Plain font-size (even tuned per-vw) can only approximate "SWITCHBLADE" spanning edge-to-edge
  // — actual glyph widths don't scale in perfect lockstep with the container across every
  // viewport width, so it always leaves a gap on one side or overflows on the other at some
  // breakpoint. Measuring the rendered text's natural width and correcting with a horizontal-only
  // scaleX guarantees it always exactly fills the wrapper's width, regardless of viewport size —
  // scaleX only stretches width, so the letter height still tracks the responsive font-size below
  // untouched (no vertical distortion).
  useEffect(() => {
    const wrapper  = wordmarkWrapRef.current;
    const wordmark = wordmarkRef.current;
    if (!wrapper || !wordmark) return;

    const fit = () => {
      wordmark.style.transform = "scaleX(1)";
      // clientWidth includes the wrapper's own left/right site-px padding, which the text sits
      // inside of — using it unadjusted overscales past the actual available space and pushes
      // the wordmark past the right edge (clipped by the site's global overflow-x: hidden).
      const style        = getComputedStyle(wrapper);
      const availWidth    = wrapper.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const textWidth    = wordmark.scrollWidth;
      if (textWidth > 0) {
        wordmark.style.transform = `scaleX(${availWidth / textWidth})`;
      }
    };

    fit();
    // The very first `fit()` call can run before the custom Barlow-replacement local font
    // (loaded via next/font/local) has finished swapping in — `scrollWidth` at that point still
    // reflects the fallback font's (narrower) glyph metrics, so the computed scale undershoots
    // and leaves a gap on the right once the real font paints in. Refitting once fonts.ready
    // resolves catches that swap.
    let cancelled = false;
    document.fonts?.ready.then(() => { if (!cancelled) fit(); });

    const ro = new ResizeObserver(fit);
    ro.observe(wrapper);
    return () => { cancelled = true; ro.disconnect(); };
  }, []);

  return (
    <footer
      // Mobile floor bumped to 80px (max-md, below Tailwind's 768px breakpoint): the
      // clamp(64px,9vw,120px) this used everywhere gave phones only ~64-70px of top space before
      // the "You got this" line — desktop (md: and up) keeps the original clamp untouched.
      className="site-px max-md:pt-20 md:pt-[clamp(64px,9vw,120px)]"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 2.2%, #E8EEF9 7.7%, #A8BCE6 26.3%, #7E9ADB 38.8%, #5174CC 55%, #2E51C0 75.8%, #143BB2 96%)",
        overflow:   "hidden",
        position:   "relative",
      }}>

      <div className="flex items-start justify-between flex-wrap" style={{ gap: 32, marginBottom: "clamp(48px,7vw,96px)" }}>
        <p style={{
          fontFamily:    "var(--font-archivo)",
          fontWeight:    900,
          fontSize:      "clamp(18px,1.8vw,24px)",
          lineHeight:    1.25,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color:         "#fefefe",
        }}>
          You got this.<br />Keep going. <br />Never give up
        </p>

        <div style={{ textAlign: "left" }}>
          <p style={{
            fontFamily:    "var(--font-archivo)",
            fontWeight:    700,
            fontSize:      12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         "#fefefe",
            marginBottom:  6,
          }}>
            Reach out / Let&rsquo;s collaborate
          </p>
          <a
            href="mailto:hello@switchblade.com"
            style={{
              fontFamily:     "var(--font-archivo)",
              fontWeight:     700,
              fontSize:       "clamp(18px,1.8vw,24px)",
              letterSpacing:  "0.06em",
              textTransform:  "uppercase",
              color:          "#fefefe",
              textDecoration: "none",
              transition:     "opacity 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            HELLO@WEARESWITCHBLADE.COM
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap" style={{ gap: 20, marginBottom: "clamp(40px,6vw,72px)" }}>
        <div className="flex flex-wrap items-center" style={{ gap: "clamp(20px,3vw,44px)" }}>
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href} style={{
              fontFamily:     "var(--font-ibm-mono)",
              fontWeight:     700,
              fontSize:       12,
              letterSpacing:  "0.1em",
              textTransform:  "uppercase",
              color:          "rgba(255,255,255,0.75)",
              textDecoration: "none",
              transition:     "color 0.15s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center" style={{ gap: 20 }}>
          <a href="#" style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           8,
            height:        32,
            padding:       "0 17px",
            borderRadius:  999,
            border:        "1px solid rgba(255,255,255,0.28)",
            fontFamily:    "var(--font-ibm-mono)",
            fontWeight:    700,
            fontSize:      12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:          "rgba(255,255,255,0.75)",
            textDecoration: "none",
            transition:     "all 0.15s",
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#fff";
              el.style.color       = "#fff";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(255,255,255,0.28)";
              el.style.color       = "rgba(255,255,255,0.75)";
            }}
          >
            Instagram
            <Image src="/instagram-icon.svg" alt="" width={16} height={16} />
          </a>

        </div>
      </div>

      <div ref={wordmarkWrapRef} style={{ overflow: "hidden" }}>
        <p
          ref={wordmarkRef}
          style={{
            fontFamily:    "var(--font-barlow)",
            fontWeight:    800,
            // Floor lowered from 48px: at 12vw that used to hit its floor on any viewport
            // narrower than ~400px, forcing "SWITCHBLADE" to a fixed 48px in a single
            // `nowrap` line that no longer fit a phone-width viewport and got clipped by
            // the site's global `overflow-x: hidden`. 28px still reads as a watermark at
            // phone widths while actually fitting. The scaleX fit-to-width above (see
            // useEffect) then stretches/compresses this exactly to the wrapper's width.
            fontSize:      "clamp(28px,12vw,138px)",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color:         "#ffffff",
            whiteSpace:    "nowrap",
            display:       "inline-block",
            transformOrigin: "left center",
            lineHeight:    1,
            userSelect:    "none",
            pointerEvents: "none",
          }}
        >
          SWITCHBLADE
        </p>
      </div>

      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        padding:        "clamp(20px,2.5vw,28px) 0",
        marginTop:      "clamp(20px,3vw,36px)",
        borderTop:      "1px solid rgba(255,255,255,0.08)",
      }}>
        <p style={{ fontFamily: "var(--font-ibm-mono)", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
          © 2026 Switchblade
        </p>
        <p style={{ fontFamily: "var(--font-ibm-mono)", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
          All rights reserved
        </p>
      </div>
    </footer>
  );
}
