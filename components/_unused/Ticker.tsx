"use client";

export function Ticker({ items }: { items: string[] }) {
  const text = items.join("  ·  ");
  return (
    <div className="overflow-hidden py-3.5 bg-[#111111] border-y border-black/10">
      <div className="animate-marquee whitespace-nowrap text-white t-label tracking-widest">
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
    </div>
  );
}
