"use client";
import { useEffect, useRef } from "react";

type SweepTone = "dark" | "light";
type SweepTrigger = "scroll" | "load";

const DURATION = 1300;
const START = -30;
const RANGE = 160;

function ease(p: number) {
  return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
}

function runSweep(el: HTMLElement, delayMs: number) {
  let raf = 0;
  let cancelled = false;
  const timeout = window.setTimeout(() => {
    if (cancelled) return;
    const start = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const p = Math.min((now - start) / DURATION, 1);
      el.style.setProperty("--sweep", `${START + ease(p) * RANGE}%`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }, delayMs);
  return () => {
    cancelled = true;
    window.clearTimeout(timeout);
    cancelAnimationFrame(raf);
  };
}

function toneVars(tone: SweepTone, color: string | undefined, glow: string, glow2: string) {
  const fg = color ?? (tone === "light" ? "#FFFFFF" : "var(--ink)");
  return {
    ["--sweep-fg" as string]: fg,
    ["--sweep-a1" as string]: glow,
    ["--sweep-a2" as string]: glow2,
  } as React.CSSProperties;
}

export type SweepTextProps = {
  /** Which kind of background this sits on — picks a legible default resting color if `color` isn't set. */
  tone?: SweepTone;
  trigger?: SweepTrigger;
  delay?: number;
  /** Final resting color once the sweep completes — should match the heading's original color. */
  color?: string;
  /** Blue leading-edge glow color(s) that travel ahead of the reveal, fading to transparent. */
  glow?: string;
  glow2?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** Gradient-wipe text reveal — ported from text-animation.html. Left-to-right only, no slide/fade. */
export function SweepText({
  tone = "dark",
  trigger = "scroll",
  delay = 0,
  color,
  glow = "#0456DD",
  glow2 = "#8FB2FF",
  className = "",
  style,
  children,
}: SweepTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Part of a SweepGroup — the group drives timing for all its members.
    if (el.closest("[data-sweep-group]")) return;

    if (trigger === "load") {
      return runSweep(el, delay);
    }

    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          stop = runSweep(el, delay);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stop?.();
    };
  }, [trigger, delay]);

  return (
    <span
      ref={ref}
      data-sweep
      className={`sweep-text ${className}`}
      style={{ ...toneVars(tone, color, glow, glow2), ...style }}
    >
      {children}
    </span>
  );
}

export type SweepGroupProps = {
  className?: string;
  stagger?: number;
  children: React.ReactNode;
};

/** Wrap multiple SweepText siblings to reveal together, staggered in source order. */
export function SweepGroup({ className = "", stagger = 300, children }: SweepGroupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const members = Array.from(el.querySelectorAll<HTMLElement>("[data-sweep]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stops: (() => void)[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          members.forEach((member, i) => stops.push(runSweep(member, i * stagger)));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stops.forEach((s) => s());
    };
  }, [stagger]);

  return (
    <div ref={ref} data-sweep-group className={className}>
      {children}
    </div>
  );
}
