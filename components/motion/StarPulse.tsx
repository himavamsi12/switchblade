"use client";

const STAR_PATH =
  "M39.5 27.9749L31.7484 0.37668C31.6072 -0.12556 30.8956 -0.12556 30.7545 0.37668L23.0029 27.9749C22.9309 28.2294 22.734 28.4301 22.4795 28.505L0.369477 35.0446C-0.123159 35.1906 -0.123159 35.8888 0.369477 36.0347L22.3845 42.5465C22.6706 42.6311 22.8829 42.874 22.927 43.1688L30.7401 94.4376C30.8294 95.0224 31.6716 95.0224 31.7609 94.4376L39.5739 43.1688C39.6191 42.874 39.8303 42.6311 40.1165 42.5465L62.1305 36.0347C62.6232 35.8888 62.6232 35.1906 62.1305 35.0446L40.0214 28.505C39.7679 28.4301 39.5701 28.2294 39.4981 27.9749H39.5Z";

const RINGS = 4;          
const PERIOD = 3.2;       

export function StarPulse({ size = 220 }: { size?: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background:
          "linear-gradient(120deg, #1130A2 0%, #3B2F9E 28%, #7A2F9E 50%, #E0602F 74%, #F0457E 100%)",
        backgroundSize: "260% 260%",
        animation: "gradient-pan 14s ease-in-out infinite",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(60% 60% at 50% 50%, transparent 40%, rgba(4,8,30,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {Array.from({ length: RINGS }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 63 95"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: size,
            height: "auto",
            transform: "translate(-50%, -50%)",
            animation: `star-ripple ${PERIOD}s cubic-bezier(0.22,0.61,0.36,1) infinite`,
            animationDelay: `${(PERIOD / RINGS) * i}s`,
            pointerEvents: "none",
          }}
        >
          <path d={STAR_PATH} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.4} />
        </svg>
      ))}

      <svg
        viewBox="0 0 63 95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "relative",
          width: size,
          height: "auto",
          animation: `star-pulse ${PERIOD}s ease-in-out infinite`,
          zIndex: 2,
        }}
      >
        <defs>
          <linearGradient id="pulse-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.45" stopColor="#DCE7F5" />
            <stop offset="1" stopColor="#9DB2D2" />
          </linearGradient>
        </defs>
        <path d={STAR_PATH} fill="url(#pulse-metal)" />
      </svg>
    </div>
  );
}
