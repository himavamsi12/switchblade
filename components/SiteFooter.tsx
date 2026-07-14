"use client";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home",          href: "/" },
  { label: "Classics",      href: "/classics" },
  { label: "Shop",          href: "/membership" },
  { label: "Collaboration", href: "/collaborate" },
  { label: "Help",          href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="site-px" style={{
      background: "linear-gradient(180deg, #FFFFFF 3.2%, #FFFFFF 5.4%, #E8EEF9 12.7%, #A8BCE6 26.3%, #7E9ADB 38.8%, #5174CC 55%, #2E51C0 75.8%, #143BB2 96%)",
      overflow:   "hidden",
      position:   "relative",
      paddingTop: "clamp(64px,9vw,120px)",
    }}>

      <div className="flex items-start justify-between flex-wrap" style={{ gap: 32, marginBottom: "clamp(48px,7vw,96px)" }}>
        <p style={{
          fontFamily:    "var(--font-barlow)",
          fontWeight:    900,
          fontSize:      "clamp(18px,1.8vw,24px)",
          lineHeight:    1.25,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color:         "#fefefe",
        }}>
          You got this.<br />Keep going. <br />Never give up
        </p>

        <div style={{ textAlign: "right" }}>
          <p style={{
            fontFamily:    "var(--font-ibm-mono)",
            fontWeight:    700,
            fontSize:      12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         "#fefefe",
            marginBottom:  6,
          }}>
            Reach out / Let&rsquo;s collaborate
          </p>
          <a
            href="mailto:hello@switchblade.com"
            style={{
              fontFamily:     "var(--font-barlow)",
              fontWeight:     700,
              fontSize:       "clamp(18px,1.8vw,24px)",
              letterSpacing:  "0.06em",
              textTransform:  "uppercase",
              color:          "#fefefe",
              textDecoration: "none",
              transition:     "opacity 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            HELLO@SWITCHBLADE.COM
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap" style={{ gap: 20, marginBottom: "clamp(40px,6vw,72px)" }}>
        <div className="flex flex-wrap items-center" style={{ gap: "clamp(20px,3vw,44px)" }}>
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href} style={{
              fontFamily:     "var(--font-ibm-mono)",
              fontWeight:     700,
              fontSize:       12,
              letterSpacing:  "0.1em",
              textTransform:  "uppercase",
              color:          "rgba(255,255,255,0.75)",
              textDecoration: "none",
              transition:     "color 0.15s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center" style={{ gap: 20 }}>
          <a href="#" style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           8,
            height:        32,
            padding:       "0 17px",
            borderRadius:  999,
            border:        "1px solid rgba(255,255,255,0.28)",
            fontFamily:    "var(--font-ibm-mono)",
            fontWeight:    700,
            fontSize:      12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color:          "rgba(255,255,255,0.75)",
            textDecoration: "none",
            transition:     "all 0.15s",
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#fff";
              el.style.color       = "#fff";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(255,255,255,0.28)";
              el.style.color       = "rgba(255,255,255,0.75)";
            }}
          >
            Instagram
            <Image src="/instagram-icon.svg" alt="" width={16} height={16} />
          </a>

        </div>
      </div>

      <p
        className="site-px"
        style={{
          fontFamily:    "var(--font-barlow)",
          fontWeight:    900,
          // Floor lowered from 48px: at 12vw that used to hit its floor on any viewport
          // narrower than ~400px, forcing "SWITCHBLADE" to a fixed 48px in a single
          // `nowrap` line that no longer fit a phone-width viewport and got clipped by
          // the site's global `overflow-x: hidden`. 28px still reads as a watermark at
          // phone widths while actually fitting.
          fontSize:      "clamp(28px,12vw,180px)",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color:         "#ffffff",
          whiteSpace:    "nowrap",
          textAlign:     "center",
          lineHeight:    1,
          userSelect:    "none",
          pointerEvents: "none",
        }}
      >
        SWITCHBLADE
      </p>

      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        padding:        "clamp(20px,2.5vw,28px) 0",
        marginTop:      "clamp(20px,3vw,36px)",
        borderTop:      "1px solid rgba(255,255,255,0.08)",
      }}>
        <p style={{ fontFamily: "var(--font-ibm-mono)", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
          © 2026 Switchblade
        </p>
        <p style={{ fontFamily: "var(--font-ibm-mono)", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
          All rights reserved
        </p>
      </div>
    </footer>
  );
}
