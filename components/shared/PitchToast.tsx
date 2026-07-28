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
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          style={{
            position: "fixed", right: "clamp(16px,3vw,32px)", top: "clamp(16px,3vw,32px)",
            zIndex: 2200, maxWidth: 320,
            display: "flex", alignItems: "flex-start", gap: 12,
            background: "#0D0D0D", color: "#fff", borderRadius: 12, padding: "16px 18px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
            fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 14, lineHeight: 1.4,
          }}
        >
          <span style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: "50%", background: "#0456DD",
            flexShrink: 0, marginTop: 1,
          }}>
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <motion.path
                d="M1 5L4.3 8.5L11 1"
                stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
              />
            </svg>
          </span>
          <span>Pitch received. We read everything — give us a bit to get back to you.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
