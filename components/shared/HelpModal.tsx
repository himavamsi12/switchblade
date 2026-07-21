"use client";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, ArrowUp, X } from "lucide-react";
import Image from "next/image";
import { Star3D } from "@/components/shared/Star3D";

// Underline text field — same look as the collaborate page's pitch form fields.
const fieldStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "none", border: "none",
  borderBottom: "1px solid rgba(13,13,13,0.14)", padding: "0 0 10px",
  fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: 15,
  color: "#0D0D0D", outline: "none", transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 13,
  textTransform: "uppercase", letterSpacing: "0.08em", color: "#000", opacity: 0.5,
};

const EASE = [0.22, 1, 0.36, 1] as const;
// Time the card takes to slide up; the gradient reveal + content fade start once it lands.
const SLIDE = 0.5;

/**
 * Full-width help/contact modal, opened from the footer's Help link. Slides up
 * from the bottom into a near-full-viewport card; once it lands, the left panel's gradient reveals
 * (white → gradient, like the hero) and the rest of the content fades in. Left: chrome star +
 * "BORN NOT LAUNCHED" lockup. Right: book-a-call card + name/email/phone form. Stacks to a single
 * scrollable column on mobile.
 */
export function HelpModal({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();

  // Esc to close + lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Fade-in-after-slide props for the panels' content ("rest reveals" once the card has landed).
  const revealContent = reduce
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: SLIDE + 0.05, duration: 0.5, ease: EASE },
      };

  return (
    // Backdrop: dims the page; the card is anchored to the bottom and slides up into it.
    <motion.div
      className="fixed inset-0 z-[2000] flex flex-col justify-end"
      style={{ background: "rgba(18,22,40,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Join the community"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {/* Card: full width, near-full height (small gap at top showing the backdrop), slides up from
          the bottom. stopPropagation so clicks inside don't bubble to the backdrop-close. */}
      <motion.div
        className="relative w-full flex flex-col lg:flex-row overflow-y-auto"
        style={{
          height: "calc(100vh - clamp(40px,8vh,110px))",
          borderTopLeftRadius: 16, borderTopRightRadius: 16, background: "#ffffff",
        }}
        onClick={e => e.stopPropagation()}
        initial={reduce ? false : { y: "100%" }}
        animate={{ y: 0 }}
        exit={reduce ? undefined : { y: "100%" }}
        transition={{ duration: SLIDE, ease: EASE }}
      >
        {/* ── Left: blue gradient panel ── */}
        <div
          // Below lg the two panels STACK, so this one's height is subtracted directly from what
          // the form has left — 42vh there left the form's tail (phone + Submit) below the fold.
          // Capped much shorter when stacked; the side-by-side lg layout keeps the tall panel,
          // where its height costs the form nothing.
          className="relative overflow-hidden shrink-0 lg:w-[55%] max-lg:!min-h-[clamp(180px,26vh,300px)]"
          style={{
            background: "linear-gradient(180deg,#FFFFFF 0%,#E8EEF9 12%,#A8BCE6 34%,#6E8CD8 58%,#2E51C0 82%,#143BB2 100%)",
            minHeight: "clamp(300px,42vh,600px)",
            padding: "clamp(28px,3vw,44px)",
          }}
        >
          {/* Gradient reveal: a white cover over the gradient that fades out AFTER the card has
              slid up (delay), so the left panel's colour washes in the same fluid way the hero does. */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "#ffffff", zIndex: 2 }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: SLIDE, duration: 1.4, ease: [0.37, 0, 0.63, 1] }}
            />
          )}

          {/* Faint SWITCHBLADE watermark, top-left */}
          <motion.span
            {...revealContent}
            aria-hidden
            style={{
              position: "relative", zIndex: 1,
              fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(20,40,120,0.28)",
            }}
          >
            Switchblade
          </motion.span>

          {/* Star, centered in the panel */}
          <motion.div
            {...revealContent}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <div style={{ width: "clamp(150px,20vw,300px)", height: "clamp(200px,28vw,420px)" }}>
              <Star3D scale={4.6} cameraZ={5.9} />
            </div>
          </motion.div>

          {/* Bottom-left lockup: badge + heading */}
          <motion.div {...revealContent} className="absolute" style={{ left: "clamp(28px,3vw,44px)", bottom: "clamp(28px,3vw,44px)", zIndex: 1 }}>
            
            <h2
              style={{
                fontFamily: "var(--font-barlow)", fontWeight: 900,
                fontSize: "clamp(38px,6vw,88px)", lineHeight: 0.92, letterSpacing: "-0.02em",
                textTransform: "uppercase", color: "#ffffff",
              }}
            >
              Let's<br />Connect
            </h2>
          </motion.div>
        </div>

        {/* ── Right: white form panel ── */}
        {/* lg:min-h-0 (here and on the two nested columns below) lets these flex children shrink
            below their content height so the form fits the fixed-height card — without it a flex
            item's implicit `min-height:auto` keeps the column as tall as its content and the
            bottom of the form runs past the bottom of the viewport. Every vertical measurement
            below is height-aware (vh, or min(vw,vh)) for the same reason: on a short or portrait
            viewport, vw-only spacing has no idea it has run out of room.
            Deliberately lg-ONLY: below lg the panels stack, so a phone simply does not have the
            height to fit the gradient panel AND the whole form — forcing the shrink there just
            squeezed the column shorter than its content and let the Submit button spill out
            through the card's bottom border. At those sizes the content keeps its natural height
            and the modal card (overflow-y-auto) scrolls instead. */}
        <motion.div
          {...revealContent}
          className="relative flex flex-col grow lg:min-h-0 lg:overflow-y-auto"
          style={{
            padding: "clamp(20px,3vh,56px) clamp(28px,3vw,56px)",
            paddingTop: "clamp(16px,2.2vh,32px)",
          }}
        >
          {/* Close — in normal flow ABOVE the bordered card, not absolutely positioned over the
              panel. Floating it meant its box was laid out independently of the card's, so at some
              viewport sizes it landed on the card's top-right corner (its `right` offset is smaller
              than the panel's horizontal padding, so it also hung past the card's right edge).
              In-flow, the card simply starts below it and they can never collide. */}
          <div className="flex justify-end shrink-0" style={{ marginBottom: "clamp(10px,3vh,40px)" }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center"
              style={{
                gap: 8, background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 13,
                letterSpacing: "0.12em", textTransform: "uppercase", color: "#0D0D0D",
              }}
            >
              <X size={18} strokeWidth={2} />
              Close
            </button>
          </div>

          {/* Bordered card wrapping the whole form (book-a-call + fields + submit). */}
          {/* Sized to its content, NOT stretched to fill the panel — with the heading gone the
              form is short enough that growing to full height just opened a large void between
              the last field and the Submit button pinned at the bottom. shrink-0 keeps the flex
              parent from squeezing it instead.
              lg:my-auto centers it vertically in the space left under the Close row (auto margins
              on a flex item absorb the free space equally top and bottom) instead of leaving it
              top-aligned above a tall empty band. When there's no free space the auto margins
              resolve to 0, so a tight viewport just falls back to top-aligned + scroll. */}
          <div
            className="flex flex-col shrink-0 lg:my-auto"
            style={{
              border: "1px solid #E4E4E7", borderRadius: 16,
              padding: "clamp(18px,2.6vh,40px) clamp(24px,2.5vw,40px)",
            }}
          >
          {/* Book a quick call card */}
          <a
            href="#"
            className="flex items-center justify-between"
            style={{
              gap: 20, border: "1px solid #D8D8D8", borderRadius: 15,
              padding: "clamp(14px,2.2vh,22px) 24px", flexShrink: 0,
              marginBottom: "clamp(16px,2.6vh,40px)", textDecoration: "none",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#0456DD")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#D8D8D8")}
          >
            <div className="flex flex-col" style={{ gap: 14 }}>
              <div className="flex items-center" style={{ gap: 14 }}>
                <Image src="/collaborate/google-meet.svg" alt="Google Meet" width={40} height={33} />
                <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 600, fontSize: "clamp(18px,1.4vw,22px)", color: "#0D0D0D" }}>Book a quick call</span>
              </div>
              <div className="flex items-center" style={{ gap: 10 }}>
                <Clock size={16} color="#666565" strokeWidth={2} />
                <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: "#666565" }}>15 Minutes</span>
              </div>
            </div>
            <ArrowUp size={22} color="#0D0D0D" style={{ transform: "rotate(45deg)" }} />
          </a>

          {/* Fields */}
          {/* Natural height at every size now — Submit follows the last field with the form's own
              gap, rather than being pushed to the bottom of a stretched card. */}
          <form className="flex flex-col" style={{ gap: "clamp(14px,2.4vh,36px)" }} onSubmit={e => e.preventDefault()}>
            {["Name", "E-mail", "Phone"].map(label => (
              <div key={label} className="flex flex-col" style={{ gap: "clamp(6px,1.2vh,14px)" }}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="text"
                  style={fieldStyle}
                  onFocus={e => (e.target.style.borderBottomColor = "#0456DD")}
                  onBlur={e => (e.target.style.borderBottomColor = "rgba(13,13,13,0.14)")}
                />
              </div>
            ))}

            <button
              type="submit"
              style={{
                marginTop: "auto", height: "clamp(44px,6vh,52px)", flexShrink: 0,
                background: "#000", color: "#fff", border: "none",
                borderRadius: 4, fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 14,
                letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Submit
            </button>
          </form>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
