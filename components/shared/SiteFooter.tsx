"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Star3D } from "@/components/shared/Star3D";
import { HelpModal } from "@/components/shared/HelpModal";
import { GradientReveal } from "@/components/shared/GradientReveal";

// "Help" has no href — it opens the HelpModal instead (see `action: "help"`); the rest are links.
const NAV_LINKS = [
  { label: "Home",          href: "/" },
  { label: "Classics",      href: "/classics" },
  { label: "Shop",          href: "/membership" },
  { label: "Collaboration", href: "/collaborate" },
  { label: "Help",          action: "help" as const },
];

const NAV_LINK_STYLE: React.CSSProperties = {
  fontFamily:     "var(--font-ibm-mono)",
  fontWeight:     700,
  fontSize:       12,
  letterSpacing:  "0.1em",
  textTransform:  "uppercase",
  color:          "rgba(255,255,255,0.75)",
  textDecoration: "none",
  transition:     "color 0.15s",
  background:     "none",
  border:         "none",
  padding:        0,
  cursor:         "pointer",
};

// Rendered twice below: once beside "You got this..." (mobile only), once in the nav row
// (desktop only, hidden on mobile) — extracted so the two spots share one copy of the styling
// instead of duplicating this whole block.
function InstagramLink({ className = "" }: { className?: string }) {
  return (
    // `inline-flex` is a CLASS, not an inline `display` style, so that callers' visibility
    // utilities can actually win. As an inline style it beat the `md:hidden` on the copy beside
    // "You got this..." — inline styles outrank any class — so the mobile-only pill kept
    // rendering on desktop too, under the text. Any utility passed in (md:hidden, max-md:hidden)
    // now overrides this the way it reads like it should.
    <a href="#" className={"inline-flex " + className} style={{
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
  );
}

export function SiteFooter() {
  const wordmarkWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkRef     = useRef<HTMLParagraphElement>(null);
  const footerRef       = useRef<HTMLElement>(null);
  const starWrapRef     = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  // Lazily mount the footer's WebGL star only when its wrapper nears the viewport (see the JSX
  // comment) — one-viewport buffer so it's ready just before it scrolls in, not popping late.
  const [starVisible, setStarVisible] = useState(false);
  useEffect(() => {
    const el = starWrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarVisible(true); },
      { rootMargin: "100% 0px 100% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // Gradient reveal is handled by <GradientReveal> in the JSX below — the shared "the gradient
  // falls in" overlay from the homepage hero (white cover slides down out of view, feathered top
  // edge), triggered the first time the footer scrolls into view. It replaces the plain opacity
  // cross-fade this used to run through its own GSAP ScrollTrigger.

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
      ref={footerRef}
      // Mobile floor bumped to 80px (max-md, below Tailwind's 768px breakpoint): the
      // clamp(64px,9vw,120px) this used everywhere gave phones only ~64-70px of top space before
      // the "You got this" line — desktop (md: and up) keeps the original clamp untouched.
      className="site-px max-md:pt-20 md:pt-[clamp(64px,9vw,120px)]"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 2.2%, #E8EEF9 6.7%, #A8BCE6 15.3%, #7E9ADB 22.8%, #5174CC 38%, #2E51C0 75.8%, #143BB2 96%)",
        overflow:   "hidden",
        position:   "relative",
        // Establishes a stacking context so the gradient-mask overlay's z-index:-1 is scoped to
        // this footer — it paints above this element's own gradient background but behind all the
        // (static) content — instead of leaking behind the footer into the page's root context.
        isolation:  "isolate",
      }}>

      {/* White cover over the gradient — z-index:-1 places it above the footer's gradient
          background but behind all the content (text/star, which are static → paint above a
          negative-z child), so it hides the gradient without hiding the content. Falls away
          downward the first time the footer scrolls into view, the same reveal the homepage hero
          plays on load.
          triggerMarginBottom widened from the -15% default to -45%, and duration shortened
          1.6s (was 2.2s): the footer's own box is tall enough (roughly viewport-height) that the
          default margin didn't fire until the footer was nearly entirely on screen — on a page
          that ends right after it, that's essentially the same moment the reader stops scrolling
          at the very bottom, so the 2.2s fall was still mid-animation with nothing left to scroll
          through, reading as the footer staying blank/stuck rather than revealing. Firing earlier
          leaves scroll time for the (now quicker) fall to actually finish before they arrive. */}
      <GradientReveal trigger="scroll" triggerMarginBottom="-45%" duration={1.6} />

      <div className="flex items-start justify-between flex-wrap" style={{ gap: 32, marginBottom: "clamp(48px,7vw,96px)" }}>
        {/* md:block collapses this back to a single stacked child on desktop (InstagramLink is
            md:hidden there) — the flex row is only meant to place the Instagram pill beside this
            text on mobile, matching where it used to sit in the nav row lower down. */}
        <div className="flex items-start justify-between gap-4 w-full md:block md:w-auto">
          <p style={{
            fontFamily:    "var(--font-archivo)",
            fontWeight:    900,
            fontSize:      "clamp(18px,1.8vw,24px)",
            lineHeight:    1.25,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color:         "#fefefe",
          }}>
            You got this.<br />Keep going. <br />Never give up.
          </p>
          <InstagramLink className="md:hidden shrink-0" />
        </div>

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
          {NAV_LINKS.map(link =>
            "action" in link ? (
              <button
                key={link.label}
                type="button"
                onClick={() => setHelpOpen(true)}
                style={NAV_LINK_STYLE}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)")}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                style={NAV_LINK_STYLE}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)")}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Hidden on mobile — moved up beside "You got this..." above (see InstagramLink there). */}
        <div className="max-md:hidden flex items-center" style={{ gap: 20 }}>
          <InstagramLink />
        </div>
      </div>

      {/* Small rotating chrome Compass.glb, now sitting directly above the SWITCHBLADE wordmark
          (moved down from above the nav row) — reuses Star3D at a much smaller footprint than
          its other placements on the site. cameraZ is pulled back far enough (see Star3D's
          fov=44 vertical frustum) that the full model height fits inside the small square canvas
          instead of clipping top/bottom. */}
      {/* position:relative wrapper so the star can be positioned absolutely against the
          wordmark's own box (via bottom:100%) instead of pushing it down through normal-flow
          margin — the star now floats on top of/overlapping the wordmark's top edge (the
          negative marginBottom below pulls it down by a fixed amount so its tip pokes into the
          text) rather than sitting in its own separate flow slot above it. */}
      {/* Mobile-only clearance above the star (the collision was only flagged on mobile — desktop
          stays untouched). This padding lives on a SEPARATE outer wrapper, not the position:
          relative div below — putting it directly on that div did nothing visible, because the
          star's `bottom:100%` is measured against that div's own padding-box top edge, which
          padding-top on the SAME element doesn't move; only content in normal flow (the wordmark)
          shifted down, widening the star-to-wordmark gap while leaving the star exactly as
          overlapped with the nav row as before. An outer wrapper's padding instead pushes the
          relative div's own top edge down bodily, carrying the star down WITH it. (A plain
          marginTop on that div was tried even earlier and also did nothing — it just collapsed
          with the nav row's own marginBottom above, adjoining block margins take the larger of
          the two, not the sum.) */}
      <div className="max-md:pt-24">
        <div style={{ position: "relative" }}>
          <div
            className="flex justify-center"
            style={{
              position:     "absolute",
              left:         0,
              right:        0,
              bottom:       "100%",
              marginBottom: "clamp(-5px,-2vw,6px)",
              pointerEvents: "none",
            }}
          >
            {/* Only mount the WebGL <Star3D> once the footer is near the viewport — browsers cap
                the number of live WebGL contexts per page, and this footer sits far below several
                other canvases (hero star, globe, etc.); mounting it unconditionally on load kept
                one more context alive the whole time for no benefit and risked one being dropped
                (a broken/blank canvas). This keeps concurrent contexts low. */}
            <div ref={starWrapRef} style={{ width: "clamp(120px,12vw,200px)", height: "clamp(120px,12vw,200px)" }}>
              {starVisible && <Star3D scale={4.6} cameraZ={5.9} />}
            </div>
          </div>

          <div ref={wordmarkWrapRef} style={{ overflow: "hidden" }}>
        {/* fontSize and letterSpacing live in CLASSES, not the inline style below, purely so they
            can differ on mobile — an inline value would outrank any utility.
            Mobile gets normal letter-spacing (the shared -0.02em is what read as cramped at phone
            size) and a smaller 10vw instead of 12vw. Note the interaction with the scaleX
            fit-to-width in the effect above: it always stretches this to the wrapper's exact
            width, so font-size sets the wordmark's HEIGHT and how much it's stretched, never how
            wide it ends up. Smaller font therefore = shorter, slightly wider-stretched letters. */}
        <p
          ref={wordmarkRef}
          className="max-md:text-[clamp(24px,10vw,64px)] max-md:tracking-normal md:text-[clamp(28px,12vw,138px)] md:tracking-[-0.02em]"
          style={{
            fontFamily:    "var(--font-barlow)",
            fontWeight:    800,
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
        </div>
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

      {/* Help/community modal — opened by the "Help" nav button above. AnimatePresence lets it
          fade out on close (it's unmounted when helpOpen is false). */}
      <AnimatePresence>
        {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      </AnimatePresence>
    </footer>
  );
}
