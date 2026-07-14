"use client";
import Link from "next/link";

const NAV = ["WORKS", "ABOUT", "CONTACT"];
const SOCIALS = ["INSTAGRAM", "LINKEDIN", "X"];

export function Footer() {
  return (
    <footer
      style={{
        background: "#0D0D0D",
        padding: "clamp(10px, 1.2vw, 18px)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #E2EAF8 7%, #BAC8E8 18%, #7088D0 36%, #3656C0 56%, #1C38AE 74%, #1130A2 100%)",
          borderRadius: "clamp(16px, 2vw, 26px)",
          overflow: "hidden",
          position: "relative",
        }}
      >

        <div
          style={{
            paddingTop:  "clamp(40px, 5vw, 72px)",
            paddingBottom: 0,
            textAlign:   "center",
          }}
        >
          <p style={{
            fontFamily:    "monospace",
            fontSize:      "9px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color:         "rgba(0,0,0,0.45)",
            marginBottom:  "5px",
          }}>
            REACH OUT / GET A MEMBERSHIP
          </p>
          <p style={{
            fontFamily:    "monospace",
            fontSize:      "clamp(12px, 1.1vw, 16px)",
            fontWeight:    700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         "#0D0D0D",
          }}>
            HELLO@SWITCHBLADE.COM
          </p>

          <div style={{
            width:      "1px",
            height:     "clamp(20px, 2.5vw, 36px)",
            background: "rgba(0,0,0,0.2)",
            margin:     "clamp(14px, 1.8vw, 24px) auto",
          }} />

          <p style={{
            fontFamily:    "monospace",
            fontSize:      "9px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color:         "rgba(0,0,0,0.45)",
            marginBottom:  "5px",
          }}>
            SWITCHBLADE STUDIO / STORE
          </p>
          <p style={{
            fontFamily:    "monospace",
            fontSize:      "clamp(12px, 1.1vw, 16px)",
            fontWeight:    700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         "#0D0D0D",
            lineHeight:    1.6,
          }}>
            MUMBAI, INDIA<br />400 001
          </p>
        </div>

        <div style={{ height: "clamp(48px, 9vw, 130px)" }} />

        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "0 clamp(20px, 3vw, 48px)",
            marginBottom:   "clamp(4px, 0.6vw, 8px)",
          }}
        >
          <div style={{ display: "flex", gap: "clamp(14px, 2vw, 32px)" }}>
            {NAV.map(link => (
              <Link
                key={link}
                href="#"
                style={{
                  fontFamily:     "monospace",
                  fontSize:       "10px",
                  letterSpacing:  "0.12em",
                  textTransform:  "uppercase",
                  color:          "#FFFFFF",
                  fontWeight:     700,
                  textDecoration: "none",
                }}
              >
                {link}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: "clamp(5px, 0.6vw, 10px)" }}>
            {SOCIALS.map(s => (
              <a
                key={s}
                href="#"
                style={{
                  fontFamily:     "monospace",
                  fontSize:       "10px",
                  letterSpacing:  "0.1em",
                  textTransform:  "uppercase",
                  color:          "#FFFFFF",
                  fontWeight:     700,
                  textDecoration: "none",
                  border:         "1px solid rgba(255,255,255,0.45)",
                  borderRadius:   "999px",
                  padding:        "4px 14px",
                }}
              >
                {s}
              </a>
            ))}
          </div>

          <span style={{
            fontFamily:    "monospace",
            fontSize:      "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "#FFFFFF",
            fontWeight:    700,
          }}>
            INDIA / GLOBAL
          </span>
        </div>

        <div style={{ overflow: "hidden", lineHeight: 0 }}>
          <p
            style={{
              fontFamily:    "var(--font-barlow)",
              fontWeight:    900,
              fontSize:      "clamp(56px, 13.8vw, 210px)",
              letterSpacing: "-0.03em",
              lineHeight:    0.83,
              textTransform: "uppercase",
              color:         "#FFFFFF",
              textAlign:     "center",
              margin:        0,
              padding:       "0 clamp(4px, 0.5vw, 8px)",
            }}
          >
            SWITCHBLADE
          </p>
        </div>

        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            padding:        "clamp(6px, 0.8vw, 10px) clamp(20px, 3vw, 48px)",
          }}
        >
          <span style={{
            fontFamily:    "monospace",
            fontSize:      "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "rgba(0,0,0,0.45)",
          }}>
            © SWITCHBLADE — 2026
          </span>
          <span style={{
            fontFamily:    "monospace",
            fontSize:      "9px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         "rgba(0,0,0,0.45)",
          }}>
            MADE BY SIXJULY
          </span>
        </div>

      </div>
    </footer>
  );
}
