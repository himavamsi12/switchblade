"use client";
import { AnimatePresence, motion } from "framer-motion";

// Shared between the collaborate page's pitch form and HelpModal's identical copy of it (see the
// "kept byte-for-byte in sync" comment in HelpModal.tsx) — one confirmation toast for both,
// rather than duplicating this markup alongside the form markup they already duplicate.
export function PitchToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          // key is required here, not just style: without one, AnimatePresence has nothing
          // stable to key the enter/exit pair off, and a fast re-open of the toast (submit again
          // right as the previous one is fading out) could reuse the outgoing instance instead of
          // mounting a fresh one — which is exactly what would make the checkmark's OWN entrance
          // (below) silently skip replaying, reading as "the animation isn't working" even though
          // the toast itself still shows up correctly.
          key="pitch-toast"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          style={{
            position: "fixed", right: "clamp(16px,3vw,32px)", top: "clamp(16px,3vw,32px)",
            zIndex: 2200,
            // min(380px, ...) rather than a flat maxWidth — on a narrow phone a flat 380px ran
            // past the viewport (right offset above pushes it further right still), overflowing
            // off the left/bottom edge. The calc() term guarantees at least 16px of clearance on
            // BOTH sides regardless of screen width.
            maxWidth: "min(380px, calc(100vw - 32px))",
            display: "flex", alignItems: "flex-start", gap: "clamp(10px,3vw,14px)",
            background: "#0D0D0D", color: "#fff", borderRadius: 14,
            padding: "clamp(14px,4vw,20px) clamp(16px,4vw,22px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.32)",
            fontFamily: "var(--font-archivo)", fontWeight: 500,
            fontSize: "clamp(13px,3.2vw,16px)", lineHeight: 1.45,
          }}
        >
          {/* The circle POPS in with a spring (separate from the checkmark's own draw-in below) —
              a second, more obviously "alive" motion layer so the reveal reads as unmistakably
              animated even at a glance, rather than leaning on the checkmark's stroke-draw alone
              (a very short path like this one only travels ~15px, which a quick/subtle draw can
              make hard to actually perceive as "drawing" rather than just appearing). */}
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.1 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "clamp(24px,6vw,30px)", height: "clamp(24px,6vw,30px)",
              borderRadius: "50%", background: "#0456DD",
              flexShrink: 0, marginTop: 1,
            }}
          >
            <svg width="14" height="12" viewBox="0 0 12 10" fill="none" style={{ width: "clamp(13px,3.2vw,16px)", height: "clamp(11px,2.7vw,14px)" }}>
              <motion.path
                d="M1 5L4.3 8.5L11 1"
                stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                // Delay lands just after the circle's own spring pop (0.1s) has visibly landed,
                // so the sequence reads as "circle appears, THEN the check draws in" rather than
                // both fighting for attention at once. Slowed from 0.4s so the draw is long
                // enough to actually register as a stroke sweeping in, not just a flash.
                transition={{ duration: 0.55, delay: 0.28, ease: "easeOut" }}
              />
            </svg>
          </motion.span>
          <span>Pitch received. We read everything — give us a bit to get back to you.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
