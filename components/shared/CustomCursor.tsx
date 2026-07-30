"use client";
import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR = "a, button, [data-cursor]";

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const pos  = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  // Lerped like the ring's position rather than transitioned in CSS: the ring's transform is
  // rewritten every frame to follow the pointer, so a CSS transition on `transform` would lag the
  // POSITION too, not just the size. Keeping the scale on the same lerp means one transform write
  // per frame and no competing transition.
  const ringScale = useRef(1);
  const raf  = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE_SELECTOR)) {
        hoveredRef.current = true;
        setHovered(true);
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE_SELECTOR)) {
        hoveredRef.current = false;
        setHovered(false);
      }
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    const loop = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`;
      }
      ring.current.x += (pos.current.x - ring.current.x) * 0.4;
      ring.current.y += (pos.current.y - ring.current.y) * 0.4;
      if (ringRef.current) {
        // Size via `scale`, NOT width/height. This loop runs every frame for as long as the page
        // is open, and width/height are layout properties — writing them here forced a layout pass
        // 60x/sec, and wrote the SAME value on the vast majority of frames since the size only
        // changes on hover. scale is compositor-only, so the whole loop is now transform-only.
        // Box stays a fixed 32px (see className) and scales about its own centre, so the -16
        // centring offset is constant and the ring still tracks the pointer exactly.
        const target = hoveredRef.current ? 56 / 32 : 1;
        ringScale.current += (target - ringScale.current) * 0.2;
        ringRef.current.style.transform =
          `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px) scale(${ringScale.current.toFixed(3)})`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="global-cursor fixed top-0 left-0 z-[9999] w-1.5 h-1.5 rounded-full bg-[#111111] pointer-events-none"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ringRef}
        // Fixed 32px box — the hover size change is a transform scale in the rAF loop above, not a
        // width/height change, so only border-color transitions here now (paint-only, cheap).
        className={`global-cursor fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full pointer-events-none border transition-[border-color] duration-200 ${
          hovered ? "border-[#0A1AFF]" : "border-[#111111]/30"
        }`}
        // will-change lists only what actually animates now (was also claiming width/height,
        // which the perf guidance warns against — they're layout props, hinting them buys nothing).
        style={{ willChange: "transform" }}
      />
    </>
  );
}
