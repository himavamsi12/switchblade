"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SparkleMark } from "@/components/SparkleMark";
import { SiteFooter } from "@/components/SiteFooter";

const PHOTOS = [
  { id: "a", seed: "winter-portrait/420/540", pos: { left: "7%",  top: "7%"  }, w: 205, rotate: -2, aspect: "4/5"  },
  { id: "b", seed: "red-abstract/320/320",   pos: { left: "63%", top: "5%"  }, w: 160, rotate:  2, aspect: "1/1"  },
  { id: "c", seed: "fabric-grey/220/360",    pos: { left: "76%", top: "36%" }, w: 145, rotate:  1, aspect: "2/3"  },
  { id: "d", seed: "christmas-tree/300/400", pos: { left: "2%",  top: "53%" }, w: 215, rotate: -1, aspect: "3/4"  },
  { id: "e", seed: "couple-selfie/400/320",  pos: { left: "58%", top: "51%" }, w: 170, rotate:  2, aspect: "4/3"  },
  { id: "f", seed: "wreath-hands/400/340",   pos: { left: "26%", top: "75%" }, w: 210, rotate: -1, aspect: "4/3"  },
] as const;

const FLOATS = [
  { id: "f1", text: "stories",  pos: { left: "36%", top: "4.5%" }, size: 14, mono: false, blue: false },
  { id: "f2", text: "culture",  pos: { left: "4%",  top: "44%"  }, size: 14, mono: false, blue: false },
  { id: "f3", text: "+",        pos: { left: "51%", top: "43%"  }, size: 22, mono: false, blue: false },
  { id: "f4", text: "ideas",    pos: { left: "56%", top: "47%"  }, size: 14, mono: false, blue: false },
  { id: "f5", text: "*",        pos: { left: "84%", top: "46%"  }, size: 20, mono: false, blue: true  },
  { id: "f6", text: "*",        pos: { left: "12%", top: "60%"  }, size: 20, mono: false, blue: true  },
  { id: "f7", text: "in",       pos: { left: "47%", top: "71%"  }, size: 14, mono: false, blue: false },
  { id: "f8", text: "2026",     pos: { left: "71%", top: "82%"  }, size: 14, mono: false, blue: false },
] as const;

function Nav() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 site-px flex items-center justify-between"
      style={{ height: 72 }}>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-white/80 font-normal hover:text-white transition-colors" style={{ fontSize: 14 }}>Home</Link>
        <Link href="/classics" className="text-white/80 font-normal hover:text-white transition-colors" style={{ fontSize: 14 }}>Classics</Link>
        <Link href="/collaborate" className="text-white/80 font-normal hover:text-white transition-colors" style={{ fontSize: 14 }}>Collaborate</Link>
      </div>
      <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white hover:text-[#FF802B] transition-colors">
        <SparkleMark className="h-[24px] w-auto shrink-0" />
        <span className="font-black tracking-[0.04em]" style={{ fontSize: 18 }}>SWITCHBLADE</span>
        <sup className="text-[9px] font-bold">TM</sup>
      </Link>
      <Link
        href="/collaborate"
        className="flex items-center gap-2 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
        style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: 14, padding: "10px 12px" }}
      >
        Contact
        <SparkleMark className="h-[16px] w-auto shrink-0" />
      </Link>
    </div>
  );
}

export default function JournalPage() {
  const titleRef  = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const floatsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let killed = false;
    const run = async () => {
      const { gsap } = await import("gsap");
      if (killed) return;

      const tl = gsap.timeline();

      const lines = titleRef.current?.querySelectorAll(".jt-line") ?? [];
      tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.0, ease: "power4.out", stagger: 0.12 }, 0.2);

      const imgs = photosRef.current?.querySelectorAll(".jt-photo") ?? [];
      tl.fromTo(imgs, { opacity: 0, y: 28, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.09 }, 0.3);

      const floats = floatsRef.current?.querySelectorAll(".jt-float") ?? [];
      tl.fromTo(floats, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.04 }, 0.5);
    };
    run();
    return () => { killed = true; };
  }, []);

  return (
    <>
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      <Nav />

      <div style={{ position: "relative", width: "100%", minHeight: "200vh", paddingTop: 62, overflow: "hidden" }}>

        <div
          ref={titleRef}
          style={{
            position: "absolute",
            left: "50%", top: "40%",
            transform: "translate(-50%, -50%)",
            textAlign: "left",
            zIndex: 5,
            userSelect: "none",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          <div style={{ overflow: "hidden", marginBottom: "0.04em" }}>
            <div className="jt-line" style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(72px, 12.5vw, 168px)",
              letterSpacing: "-0.03em",
              color: "#0D0D0D",
              lineHeight: 0.86,
              whiteSpace: "nowrap",
            }}>
              Switchblade
            </div>
          </div>

          <div style={{ overflow: "hidden", marginBottom: "0.02em" }}>
            <div className="jt-line" style={{
              fontFamily: "var(--font-ibm-mono)",
              fontWeight: 700,
              fontSize: "clamp(52px, 9vw, 124px)",
              letterSpacing: "-0.01em",
              color: "#0D0D0D",
              lineHeight: 0.88,
              whiteSpace: "nowrap",
            }}>
              Journal
            </div>
          </div>

          <div style={{ overflow: "hidden" }}>
            <div className="jt-line" style={{
              fontFamily: "var(--font-ibm-mono)",
              fontWeight: 700,
              fontSize: "clamp(44px, 7.5vw, 104px)",
              letterSpacing: "-0.005em",
              color: "#0D0D0D",
              lineHeight: 0.9,
              whiteSpace: "nowrap",
            }}>
              (2026)
            </div>
          </div>
        </div>

        <div ref={floatsRef}>
          {FLOATS.map((f) => (
            <div
              key={f.id}
              className="jt-float"
              style={{
                position: "absolute",
                left: f.pos.left,
                top: f.pos.top,
                fontSize: f.size,
                fontFamily: f.mono
                  ? "'Courier New', monospace"
                  : "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                color: f.blue ? "#0A1AFF" : "#0D0D0D",
                letterSpacing: "0.02em",
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 6,
              }}
            >
              {f.text}
            </div>
          ))}
        </div>

        <div ref={photosRef}>
          {PHOTOS.map((p) => (
            <div
              key={p.id}
              className="jt-photo"
              style={{
                position: "absolute",
                left: p.pos.left,
                top: p.pos.top,
                width: p.w,
                transform: `rotate(${p.rotate}deg)`,
                zIndex: 4,
              }}
            >
              <div style={{
                width: "100%",
                aspectRatio: p.aspect,
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 2px 20px rgba(0,0,0,0.12)",
              }}>
                <Image
                  src={`https://picsum.photos/seed/${p.seed}`}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={`${p.w}px`}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "3%", right: "4%", fontWeight: 900, fontSize: "clamp(80px,14vw,180px)", lineHeight: 1, letterSpacing: "-0.04em", color: "rgba(0,0,0,0.04)", userSelect: "none", pointerEvents: "none" }}>
          06
        </div>

      </div>

    </div>
    <SiteFooter />
    </>
  );
}
