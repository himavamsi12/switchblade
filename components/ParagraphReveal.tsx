"use client";
import Image from "next/image";

function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(Switchblade|thinkers & doers)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === "Switchblade" || part === "thinkers & doers"
          ? <span key={i} style={{ color: "#0456DD" }}>{part}</span>
          : part
      )}
    </>
  );
}

export function ParagraphReveal() {
  return (
    <div id="paragraph-reveal" style={{ background: "#ffffff", borderTop: "1px solid rgba(13,13,13,0.1)" }}>
      <div className="site-px grid grid-cols-1 md:[grid-template-columns:1fr_1fr]" style={{ gap: "clamp(32px,5vw,64px)", paddingTop: "clamp(56px,7vw,100px)", paddingBottom: "clamp(56px,7vw,100px)", alignItems: "center" }}>

        <div>
          <p style={{
            fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "clamp(24px,3vw,40px)",
            lineHeight: 1.12, color: "#0D0D0D", textAlign: "start",
          }}>
            <Highlighted text="Switchblade is the beginning of a journey for those who carry competence without seeking validation - the builders, thinkers & doers who value depth and attention to detail and those who refuse to get boxed in." />
          </p>

          <div style={{ borderTop: "1px solid rgba(13,13,13,0.15)", marginTop: "clamp(28px,3.5vw,40px)", paddingTop: "clamp(20px,2.5vw,28px)" }}>
            <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0456DD", marginBottom: 10 }}>Vision</p>
            <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(20px,1.15vw,24px)", lineHeight: 1.2, color: "#0D0D0D" }}>
              To establish a standard that transcends categories, where every product, space, or experience reflects clarity, intent and lasting value.
            </p>
          </div>

          <div style={{ borderTop: "1px solid rgba(13,13,13,0.15)", marginTop: "clamp(24px,3vw,32px)", paddingTop: "clamp(20px,2.5vw,28px)" }}>
            <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0456DD", marginBottom: 10 }}>Core Belief</p>
            <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(20px,1.15vw,24px)", lineHeight: 1.2, color: "#0D0D0D" }}>
              At the depth of human heart, there is no competition - only compassion, strength, kindness &amp; love.
            </p>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", aspectRatio: "548/499" }}>
          <Image src="/vision-globe.svg" alt="Globe" fill className="object-contain" sizes="(max-width:768px) 90vw, 45vw" />
        </div>

      </div>
    </div>
  );
}
