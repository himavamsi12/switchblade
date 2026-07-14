"use client";
import Image from "next/image";

const PRODUCTS = [
  { src: "/products/product-1.png", alt: "Clothing",        w: 231, h: 237 },
  { src: "/products/product-2.png", alt: "Case",            w: 231, h: 237 },
  { src: "/products/product-3.png", alt: "Desk Lamp",       w: 231, h: 237 },
  { src: "/products/product-4.png", alt: "Bottles",         w: 231, h: 237 },
  { src: "/products/product-5.png", alt: "Electronics",     w: 231, h: 277 },
  { src: "/products/product-6.png", alt: "Headphones",      w: 247, h: 277 },
  { src: "/products/product-7.png", alt: "Model Cars",      w: 247, h: 237 },
  { src: "/products/product-8.png", alt: "Special Edition", w: 231, h: 237 },
  { src: "/products/product-9.png", alt: "Speakers",        w: 231, h: 277 },
];

export function OnePlaceForAll() {
  const CARD_H = "clamp(140px, 18vw, 250px)";

  return (
    <section style={{ background: "#ffffff", overflow: "hidden" }}>

      <div
        className="site-px"
        style={{
          paddingTop:     "clamp(52px, 6vw, 84px)",
          paddingBottom:  "clamp(36px, 4vw, 56px)",
          display:        "flex",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          gap:            "clamp(20px, 3vw, 48px)",
        }}
      >
        <h2
          style={{
            fontFamily:    "var(--font-barlow)",
            fontWeight:    900,
            fontSize:      "clamp(52px, 9.8vw, 142px)",
            letterSpacing: "-0.03em",
            lineHeight:    0.85,
            textTransform: "uppercase",
            color:         "#0D0D0D",
            flexShrink:    0,
          }}
        >
          ONE PLACE
          <br />
          FOR ALL
        </h2>

        <div style={{ paddingTop: "clamp(8px, 1vw, 16px)", maxWidth: "clamp(180px, 21vw, 300px)" }}>
          <svg
            viewBox="0 0 63 95"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "clamp(22px, 2.4vw, 36px)", height: "auto", marginBottom: "clamp(10px, 1.2vw, 18px)", display: "block", opacity: 0.7 }}
          >
            <path d="M39.5 27.9749L31.7484 0.37668C31.6072 -0.12556 30.8956 -0.12556 30.7545 0.37668L23.0029 27.9749C22.9309 28.2294 22.734 28.4301 22.4795 28.505L0.369477 35.0446C-0.123159 35.1906 -0.123159 35.8888 0.369477 36.0347L22.3845 42.5465C22.6706 42.6311 22.8829 42.874 22.927 43.1688L30.7401 94.4376C30.8294 95.0224 31.6716 95.0224 31.7609 94.4376L39.5739 43.1688C39.6191 42.874 39.8303 42.6311 40.1165 42.5465L62.1305 36.0347C62.6232 35.8888 62.6232 35.1906 62.1305 35.0446L40.0214 28.505C39.7679 28.4301 39.5701 28.2294 39.4981 27.9749H39.5ZM31.251 92.2145V35.5402L23.5743 42.0674V42.0626L1.5228 35.5402H31.2519L23.5503 28.9918L31.2519 1.5713V35.5402L38.9536 28.9918L38.9632 29.0274L60.9801 35.5402H31.2519L38.9296 42.0674L31.2529 92.2145H31.251Z" fill="#C3D0DB" />
          </svg>

          <p style={{ fontFamily: "var(--font-ibm-mono)", fontSize: "clamp(10px, 0.82vw, 13px)", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", lineHeight: 1.85, color: "#0D0D0D", opacity: 0.75 }}>
            GET THE BEST PRODUCTS LIMITED EDITION AND QUALITY WITHOUT ANY DOUBT FROM A SINGLE PLACE YOUR SWITCHBLADE
          </p>
        </div>
      </div>

      <div className="relative" style={{ height: "clamp(560px, 72vw, 960px)" }}>

        <div
          className="absolute left-0 right-0 overflow-hidden"
          style={{
            height: "clamp(160px, 20vw, 270px)",
            bottom: "clamp(240px, 32vw, 480px)",
          }}
        >
          <div
            className="animate-marquee"
            style={{
              display:    "flex",
              alignItems: "flex-end",
              width:      "max-content",
              height:     "100%",
              gap:        "clamp(10px, 1.2vw, 18px)",
            }}
          >
            {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  style={{
                    height:    CARD_H,
                    width:     "auto",
                    display:   "block",
                    objectFit: "contain",
                  }}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute"
          style={{
            bottom:        0,
            left:          "52%",
            transform:     "translateX(-50%)",
            zIndex:        10,
            pointerEvents: "none",
            userSelect:    "none",
          }}
        >
          <Image
            src="/products/girl.png"
            alt="Switchblade"
            width={512}
            height={873}
            style={{
              width:   "clamp(220px, 28vw, 390px)",
              height:  "auto",
              display: "block",
            }}
            unoptimized
          />
        </div>

      </div>

    </section>
  );
}
