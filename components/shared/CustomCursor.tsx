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
        const sz = hoveredRef.current ? 56 : 32;
        ringRef.current.style.transform = `translate(${ring.current.x - sz / 2}px, ${ring.current.y - sz / 2}px)`;
        ringRef.current.style.width  = `${sz}px`;
        ringRef.current.style.height = `${sz}px`;
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
        className={`global-cursor fixed top-0 left-0 z-[9998] rounded-full pointer-events-none border transition-[width,height,border-color] duration-200 ${
          hovered ? "border-[#0A1AFF]" : "border-[#111111]/30"
        }`}
        style={{ willChange: "transform, width, height" }}
      />
    </>
  );
}
