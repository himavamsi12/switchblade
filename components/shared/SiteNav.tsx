"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SparkleMark } from "@/components/shared/SparkleMark";
import { SwitchbladeLogo } from "@/components/shared/SwitchbladeLogo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/classics", label: "Classics" },
  { href: "/#origins-section", label: "Shop" },
] as const;

// Mobile drawer only (by request) — desktop's row keeps using LINKS above, unchanged. A separate
// array rather than conditionally inserting into LINKS, so the desktop nav can never pick this up.
const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/collaborate", label: "Collaboration" },
  { href: "/classics", label: "Classics" },
  { href: "/#origins-section", label: "Shop" },
] as const;

export type SiteNavVariant = "dark" | "light";

// Read by OriginsSection — Shop needs to land on the homepage, auto-open the "Read More" story,
// scroll to the Cosmos paragraph, and highlight it. Two separate signals, because Shop can be
// clicked in two different situations that need different handling:
// - From another page (Classics, Collaborate): Link does a full navigation, so OriginsSection
//   mounts fresh. sessionStorage survives that hard reload the same way a URL hash does, unlike
//   React state, which the reload would just reset — checked once on mount.
// - Already on the homepage: Next.js's <Link> does a client-side hash-scroll WITHOUT a full
//   reload, so OriginsSection never remounts and a mount-only check would silently never fire.
//   The custom event covers this — OriginsSection listens for it live the whole time it's
//   mounted, no reload required.
export const SHOP_HIGHLIGHT_KEY = "sb-shop-highlight-cosmos";
export const SHOP_HIGHLIGHT_EVENT = "sb:shop-highlight-cosmos";

// Exported so other Shop links elsewhere on the site (e.g. the footer) can trigger the exact same
// homepage-landing/highlight flow as the navbar's own Shop link, instead of just doing a plain
// navigation to "/#origins-section" that skips the auto-open-and-highlight behavior.
export function triggerShopHighlight() {
  sessionStorage.setItem(SHOP_HIGHLIGHT_KEY, "1");
  window.dispatchEvent(new Event(SHOP_HIGHLIGHT_EVENT));
}

/**
 * Standard site navbar — shared across Home, Classics, and Collaborate so all three render
 * identically in layout/behavior (Home/Classics/Shop links, centered wordmark, Collab CTA,
 * Archivo font, hamburger + drawer on mobile). Color scheme is the one thing that differs:
 * "dark" (default, Home/Collaborate) is transparent-at-top/solid-#1130A2-on-scroll over a blue
 * hero; "light" (Classics) is always a plain white bar with a bottom border, since Classics has
 * no blue hero for a transparent bar to sit over.
 */
export function SiteNav({ variant = "dark", animateIn = false }: { variant?: SiteNavVariant; animateIn?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  // On the homepage the navbar is the LAST beat of the staged hero intro: it slides down + fades
  // in from the top, timed (delay) to land just after the hero's gradient → star → text sequence
  // (see Hero in app/(app)/page.tsx). Off (default) everywhere else, and skipped under reduced
  // motion, so the bar is simply present at rest.
  const navIntro = animateIn && !shouldReduceMotion;
  // Becomes true once the staged intro's own animate target has actually been reached (see
  // onAnimationComplete below) — the hide-on-scroll-down/reveal-on-scroll-up behavior further
  // down must not engage before then, or a scroll during the intro would fight its timed reveal.
  // Starts true when there's no intro to wait for (every non-homepage mount).
  const [entranceSettled, setEntranceSettled] = useState(!navIntro);
  const pathname = usePathname();
  // "/" only matches the literal home route; every other link matches on prefix so nested
  // routes (e.g. a future /classics/[slug]) still highlight "Classics" as active.
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));
  const light = variant === "light";

  // Transparent at the very top of any "dark" page (letting that page's own blue hero show
  // through the nav's height), solid #1130A2 once scrolled even slightly — otherwise the white
  // content further down the page (e.g. most of Collaborate below its hero) would slide directly
  // under a transparent bar with nothing to keep the nav's white text/logo legible against it.
  // "light" variant skips this entirely — it's always plain white, matching Classics's own
  // white content underneath.
  useEffect(() => {
    if (light) return;
    // Threshold of 4px rather than a bare > 0: some mobile browsers report a tiny non-zero
    // scrollY on initial paint (address-bar collapse/URL-bar quirks), which flipped this solid
    // even at rest — visibly wrong on pages like Collaborate whose hero's top color (#0C40BE)
    // doesn't match this bar's solid scrolled color (#1130A2), instead of the intended
    // transparent-over-hero look at the top of the page.
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [light]);

  // Hide-on-scroll-down / reveal-on-scroll-up, by request — the bar used to be `position:absolute`
  // (positioned against the page's own initial containing block), which scrolls away with the
  // document like any other in-flow content once you scroll past it, with nothing to ever bring it
  // back. Now `fixed` (see the className below) so it stays pinned to the viewport, with THIS
  // effect deciding whether it's slid up out of view or not.
  //
  // Reveals on ANY upward scroll movement, however small (matching "on a little scroll up, show
  // it" exactly) — only HIDES once scrolled down past the bar's own height, so it doesn't vanish
  // on the first few px of scroll right at the top of the page, and never while the mobile drawer
  // is open (hiding the bar that owns the now-open hamburger/X button mid-interaction would read as
  // broken). Skipped entirely under reduced motion — the bar just stays put, matching how the
  // staged intro above is also skipped there.
  const [hiddenByScroll, setHiddenByScroll] = useState(false);
  useEffect(() => {
    if (shouldReduceMotion) return;
    let lastY = window.scrollY;
    const NAV_HEIGHT = 72;
    const onScroll = () => {
      if (menuOpen) return;
      const y = window.scrollY;
      if (y > lastY && y > NAV_HEIGHT) setHiddenByScroll(true);
      else if (y < lastY) setHiddenByScroll(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldReduceMotion, menuOpen]);
  // Opening the drawer while the bar happens to be scroll-hidden would strand the hamburger/X
  // button off-screen with no way to close it — force the bar back on screen the moment it opens.
  useEffect(() => {
    if (menuOpen) setHiddenByScroll(false);
  }, [menuOpen]);

  // The bar's animate target, unified across both features it now drives:
  //  - During the staged intro (navIntro && not yet settled), this must stay exactly {y:0,
  //    opacity:1} — the FIXED target the entrance's own initial→animate interpolation (with its
  //    long delay/duration, see the transition below) is already animating toward. Changing the
  //    target mid-flight would cut that timed reveal short.
  //  - Afterwards (or immediately, for pages with no intro at all), it tracks hiddenByScroll.
  const navAnimate = navIntro && !entranceSettled
    ? { y: 0, opacity: 1 }
    : { y: hiddenByScroll ? "-100%" : "0%", opacity: 1 };
  // Only the intro gets the long delay — once settled, scroll-triggered hide/reveal must react
  // immediately (no delay) and quickly, or it reads as sluggish against the reader's own scrolling.
  const navTransition = navIntro && !entranceSettled
    ? { duration: 0.6, delay: 3.5, ease: [0.22, 1, 0.36, 1] as const }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  const linkColor = light
    ? "text-[#090909] hover:opacity-60 transition-opacity"
    : "text-white/80 font-normal hover:text-white transition-colors";
  const activeLinkColor = light
    ? "text-[#0456DD] font-medium"
    : "text-white font-medium hover:text-[#FF802B] transition-colors";

  return (
    <>
      {/* z-[1200]: the Classics page's own 3D experience (ClassicsExperience) stacks a topbar,
          bottom dock, and contact modal at z-index 1000-1150 above its canvas — this needs to
          clear all of that so the shared nav isn't buried under Classics-page-only UI. Homepage
          and Collaborate have nothing near that z-index, so this is a no-op there. */}
      <motion.div
        initial={navIntro ? { y: "-100%", opacity: 0 } : false}
        animate={navAnimate}
        transition={navTransition}
        onAnimationComplete={() => setEntranceSettled(true)}
        // fixed (was absolute) — pinned to the viewport regardless of scroll, which the
        // hide-on-scroll-down/reveal-on-scroll-up behavior above requires: an absolutely
        // positioned bar scrolls away with the document like any other in-flow content, with
        // nothing to ever bring it back once you've scrolled past it.
        className={"fixed top-0 inset-x-0 z-[1200] site-px flex items-center justify-between" + (light ? " border-b border-black/8" : "")}
        style={{
          height: 72,
          background: light ? "#ffffff" : scrolled ? "#1130A2" : "transparent",
          transition: light ? undefined : "background-color 0.25s ease",
          fontFamily: "var(--font-archivo)",
          // Classics hides the real OS cursor site-wide (globals.css `cursor: none`) and shows
          // its own in-page dot cursor instead (ClassicsExperience's `.cursor`) — but that dot
          // doesn't reliably render over this fixed navbar. The original Classics-only nav (pre
          // shared-component refactor) explicitly forced the real cursor back on within its own
          // bounds for exactly this reason; restoring that here for the light variant only —
          // Home/Collaborate's dark variant never had or needed this override.
          cursor: light ? "default" : undefined,
        }}
      >
        {/* Text links hidden below md: at phone/tablet widths there isn't room for these
            alongside the always-centered logo and the Collab CTA without them colliding. The
            hamburger button takes this same slot on mobile so the row always has a left-side
            item and `justify-between` keeps Collab pinned right at every width. */}
        <div className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              // scroll={false} on Shop only: without it, Next's own scroll-to-hash (it targets
              // "#origins-section" once that element exists, on its own timing) raced against
              // OriginsSection's own scrollIntoView-to-the-Cosmos-paragraph below — whichever ran
              // last won, so the landing spot was inconsistent (sometimes the plain section top,
              // sometimes overshooting past it once more content above finished loading and
              // reflowed the page). This disables just that automatic scroll for this link;
              // OriginsSection's own effect (triggered by triggerShopHighlight) is what scrolls.
              scroll={l.label === "Shop" ? false : undefined}
              onClick={l.label === "Shop" ? triggerShopHighlight : undefined}
              className={isActive(l.href) ? activeLinkColor : linkColor}
              style={{ fontSize: 14, cursor: light ? "pointer" : undefined }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col items-center justify-center gap-[5px] w-8 h-8 -ml-1.5"
          style={{ cursor: light ? "pointer" : undefined }}
        >
          <span
            className={"block h-[2px] w-5 transition-transform duration-200" + (light ? " bg-[#090909]" : " bg-white")}
            style={{ transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }}
          />
          <span
            className={"block h-[2px] w-5 transition-opacity duration-200" + (light ? " bg-[#090909]" : " bg-white")}
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className={"block h-[2px] w-5 transition-transform duration-200" + (light ? " bg-[#090909]" : " bg-white")}
            style={{ transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }}
          />
        </button>

        <Link
          href="/"
          aria-label="Switchblade — Home"
          className={"absolute left-1/2 -translate-x-1/2 flex items-center transition-colors" + (light ? " text-[#090909] hover:opacity-60" : " text-white hover:text-[#FF802B]")}
        >
          {/* Full logo lockup (mark + wordmark + ™) as one SVG, using currentColor so it follows
              the nav variant colour. w-auto keeps its ~6.8:1 aspect ratio from the height. */}
          {/* 27/34px, not 26/32 — SwitchbladeLogo's viewBox is 41 units tall rather than the
              artwork's own 39, to fit its slightly enlarged star, so these are the base numbers
              scaled by 41/39. The rendered WORDMARK therefore stays exactly the size it has always
              been; only the star's size changes. */}
          <SwitchbladeLogo className="h-[27px] md:h-[34px] w-auto shrink-0" />
        </Link>

        <Link
          href="/collaborate"
          onClick={e => {
            // Next's client-side nav is a no-op when the target IS the current route (no
            // navigation event fires), so clicking this while already on /collaborate looked
            // broken — nothing happened. Forcing a full reload here gets the page back to its
            // top-of-hero starting state, same as landing on it fresh from anywhere else.
            if (pathname === "/collaborate") {
              e.preventDefault();
              window.location.href = "/collaborate";
            }
          }}
          className="flex items-center gap-2 rounded-lg text-white font-medium hover:opacity-85 transition-opacity pl-[6px] sm:pl-4"
          style={{ background: "#FF802B", fontSize: 14, paddingTop: 6, paddingRight: 6, paddingBottom: 6, cursor: light ? "pointer" : undefined }}
        >
          {/* "Collab" label hidden below sm: at phone widths, this button's full width plus the
              absolutely-centered logo/wordmark next to it don't both fit — they visibly overlap.
              Icon-only keeps the CTA present without the collision; sm: and up has room for both.
              Left padding moves to the pl-* classes above so it can shrink to match (6px, same as
              the button's other padding) when the label is hidden, instead of leaving the 16px
              gap meant for text next to a now-empty space. */}
          <span className="hidden sm:inline">Collaborate</span>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "#fff", borderRadius: 6 }}>
            <SparkleMark className="h-[21px] w-auto shrink-0 text-[#0F0E0C]" />
          </span>
        </Link>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          // Full-screen takeover instead of a small side drawer: covers the whole viewport so
          // the links can be the same scale as the site's own display headings (--font-barlow,
          // giant uppercase) rather than a generic list of small text links in a narrow panel.
          <motion.div
            key="site-nav-mobile-menu"
            className="md:hidden fixed inset-0 z-[1190] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: light ? "#ffffff" : "#0F1E7A" }}
          >
            {/* Empty row matching the navbar's own height, so the real hamburger button (still
                mounted underneath, now showing its X state) lines up exactly over this spot —
                no second close button needed. */}
            <div className="site-px" style={{ height: 72, flexShrink: 0 }} />

            <div className="flex-1 flex flex-col justify-center site-px" style={{ marginTop: "-10vh" }}>
              {MOBILE_LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.45,
                    delay: shouldReduceMotion ? 0 : 0.08 + i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <Link
                    href={l.href}
                    // scroll={false} on Shop only — see the matching comment on the desktop Shop
                    // Link above for why (avoids racing OriginsSection's own scrollIntoView).
                    scroll={l.label === "Shop" ? false : undefined}
                    onClick={() => {
                      setMenuOpen(false);
                      if (l.label === "Shop") triggerShopHighlight();
                    }}
                    className={
                      "block uppercase transition-opacity hover:opacity-70" +
                      (isActive(l.href)
                        ? (light ? " text-[#0456DD]" : " text-[#FF802B]")
                        : (light ? " text-[#090909]" : " text-white"))
                    }
                    style={{
                      fontFamily: "var(--font-barlow)", fontWeight: 800,
                      // Reduced from clamp(32px,10vw,56px) (by request, applies to every link here
                      // now, not just "Collaboration") — that floor was already tight for
                      // "Collaboration" (13 characters, one unbreakable word) on a narrow phone,
                      // clipped by this row's own overflow:hidden. Scaling every label down keeps
                      // them all visually consistent with each other.
                      fontSize: "clamp(24px,7.5vw,44px)",
                      lineHeight: 1.15, letterSpacing: "-0.02em",
                      // Safety net, not the primary fix: if a label is somehow still too wide for
                      // a very narrow phone, this lets it wrap/break mid-word instead of silently
                      // overflowing past the row and getting clipped again.
                      overflowWrap: "break-word",
                    }}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* No separate Collab CTA here — the header row (hamburger/logo/Collab) stays
                mounted above this overlay (z-[1200] vs this overlay's z-[1190]) the whole time
                it's open, so its Collab button is already visible; repeating it here would just
                be a duplicate. */}
            <div style={{ height: 24, flexShrink: 0 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
