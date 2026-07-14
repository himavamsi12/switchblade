"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SparkleMark } from "@/components/shared/SparkleMark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/classics", label: "Classics" },
  { href: "/membership", label: "Shop" },
] as const;

export type SiteNavVariant = "dark" | "light";

/**
 * Standard site navbar — shared across Home, Classics, and Collaborate so all three render
 * identically in layout/behavior (Home/Classics/Shop links, centered wordmark, Collab CTA,
 * Archivo font, hamburger + drawer on mobile). Color scheme is the one thing that differs:
 * "dark" (default, Home/Collaborate) is transparent-at-top/solid-#1130A2-on-scroll over a blue
 * hero; "light" (Classics) is always a plain white bar with a bottom border, since Classics has
 * no blue hero for a transparent bar to sit over.
 */
export function SiteNav({ variant = "dark" }: { variant?: SiteNavVariant }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
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
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [light]);

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
      <div
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
          className={"absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 transition-colors" + (light ? " text-[#090909] hover:opacity-60" : " text-white hover:text-[#FF802B]")}
        >
          <SparkleMark className="h-5 w-auto md:h-[26px] shrink-0" />
          <span className="font-black tracking-[0.04em] text-sm md:text-lg">
            SWITCHBLADE
          </span>
          <sup className="text-[9px] font-bold">TM</sup>
        </Link>

        <Link
          href="/collaborate"
          className="flex items-center gap-2 rounded-lg text-white font-medium hover:opacity-85 transition-opacity"
          style={{ background: "#FF802B", fontSize: 14, padding: "6px 6px 6px 16px" }}
        >
          Collab
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: "#fff", borderRadius: 6 }}>
            <SparkleMark className="h-[16px] w-auto shrink-0 text-[#0F0E0C]" />
          </span>
        </Link>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop: tapping outside the panel closes it, same as tapping the hamburger again. */}
            <motion.div
              key="site-nav-mobile-menu-backdrop"
              className="md:hidden fixed inset-0 z-[1190]"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
              style={{ background: "rgba(0,0,0,0.35)" }}
            />
            {/* Left-side drawer: slides in along x (GPU-composited transform), not a top dropdown. */}
            <motion.div
              key="site-nav-mobile-menu"
              className="md:hidden fixed inset-y-0 left-0 z-[1200]"
              initial={{ x: shouldReduceMotion ? 0 : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: shouldReduceMotion ? 0 : "-100%" }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: light ? "#ffffff" : "#0F1E7A",
                width: "clamp(240px, 72vw, 320px)",
                paddingTop: 88,
                paddingLeft: 24,
                paddingRight: 24,
                fontFamily: "var(--font-archivo)",
              }}
            >
              <div className="flex flex-col">
                {LINKS.map((l, i) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={
                      (isActive(l.href)
                        ? (light ? "text-[#0456DD] font-medium" : "text-white font-medium")
                        : (light ? "text-[#090909] font-normal" : "text-white/80 font-normal")) +
                      (i < LINKS.length - 1 ? (light ? " border-b border-black/10" : " border-b border-white/10") : "")
                    }
                    style={{ fontSize: 16, padding: "14px 0" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
