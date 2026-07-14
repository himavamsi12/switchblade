"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
}

export function TextReveal({ text, className = "", delay = 0, tag: Tag = "h2" }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const words = text.split(" ");

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <Tag className="flex flex-wrap gap-x-[0.3em]">
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block overflow-hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={isInView ? { clipPath: "inset(0 0 0% 0)" } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: delay + i * 0.06 }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    </div>
  );
}

export function LineReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        className={className}
        initial={{ y: "100%" }}
        animate={isInView ? { y: "0%" } : { y: "100%" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
