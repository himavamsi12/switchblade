"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Clock, ArrowUp } from "lucide-react";
import { SparkleMark } from "@/components/shared/SparkleMark";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteNav } from "@/components/shared/SiteNav";
import { SweepText } from "@/components/shared/SweepText";

const Star3D = dynamic(
  () => import("@/components/shared/Star3D").then(m => m.Star3D),
  { ssr: false, loading: () => null }
);

const VISION_TESTS = [
  { num: "(03)", q: "Does this make both parties bEtter?", icon: "/collaborate/vision-icon-03.svg", border: "#0456DD" },
  { num: "(04)", q: "Does this help people get inspired?", icon: "/collaborate/vision-icon-04.svg", border: "#C7D1E2" },
] as const;

const STANDARD = [
  { num: "(01)", tag: "Quality",  title: "/Craft first",       desc: "We partner for the work, never teh reach. The Object has to be undeniable on its own" },
  { num: "(02)", tag: "Winning",  title: "/Mutual Elevation",  desc: "Every collaboration must take both names better - not just bigger. Greater than the sum" },
  { num: "(03)", tag: "Interest", title: "/Cultural fit",      desc: "Shared interests make it fun to work together and explore. Different interests makes it exciting" },
  { num: "(04)", tag: "Rooted",   title: "/Built to Last",     desc: "Considered objects over fast drops. We make fewer, better things - together" },
] as const;

const CASES = [
  { kind: "/Sound & ART", title: "Shared - Archive Capsule",   desc: "A release across sound, image and motion - one story, many media",        chip: "#2755C5" },
  { kind: "/Object",      title: "One Made-TO-Last Object",    desc: "A single considered product, engineered to outlast trend",                 chip: "#0F0E0C" },
  { kind: "/Apparel",     title: "Shared - Archive Capsule",   desc: "Limited garments drawn from two design languages, made as one",             chip: "#2755C5" },
] as const;

const PX = "clamp(20px,5vw,80px)";
const SECTION = "clamp(80px,10vw,160px)";

function Tag({ children, tone = "dark", pill = false }: { children: React.ReactNode; tone?: "dark" | "light"; pill?: boolean }) {
  return (
    <span
      className="rise"
      style={{
        display: "inline-flex", alignItems: "center", alignSelf: "flex-start", border: `1px solid ${pill ? "#D8D8D8" : tone === "dark" ? "#363636" : "#A3A3A3"}`,
        borderRadius: pill ? 999 : 6, padding: pill ? "5px 10px" : "4px 6px",
        boxShadow: pill ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
        fontFamily: "var(--font-ibm-mono)", fontWeight: pill ? 600 : 700,
        fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: tone === "dark" ? "#363636" : "#444",
      }}
    >
      {children}
    </span>
  );
}

export default function CollaboratePage() {
  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggers: any[] = [];
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(".hero-rise",
        { opacity: 0, y: 54 },
        { opacity: 1, y: 0, duration: 1.05, ease: "power3.out", stagger: 0.12, delay: 0.1 });

      gsap.utils.toArray<HTMLElement>(".rise").forEach((el) => {
        const tw = gsap.fromTo(el,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.95, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" } });
        if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
      });

      gsap.utils.toArray<HTMLElement>(".rise-group").forEach((grp) => {
        const items = grp.querySelectorAll(".rise-item");
        const tw = gsap.fromTo(items,
          { opacity: 0, y: 56 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.14,
            scrollTrigger: { trigger: grp, start: "top 82%" } });
        if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
      });

      gsap.utils.toArray<HTMLElement>(".vision-cards").forEach((grp) => {
        const items = grp.querySelectorAll(".vision-card");
        const tw = gsap.fromTo(items,
          { opacity: 0, y: 110 },
          { opacity: 1, y: 0, duration: 0.85, ease: "power2.out", stagger: 0.35,
            scrollTrigger: { trigger: grp, start: "top 80%" } });
        if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
      });

      // The shuffle/stack effect below measures each card's on-page rect once and animates from
      // a computed off-screen stack position — on mobile this section's grid collapses to a
      // single column, and the stacked/rotated cards ended up visibly overlapping each other's
      // content mid-animation (one card's title bleeding into the previous card's image) instead
      // of resolving cleanly. Removed on mobile: cards just render in place, no animation.
      const isMobileCraftCards = window.innerWidth < 768;
      gsap.utils.toArray<HTMLElement>(".craft-cards").forEach((grp) => {
        const items = grp.querySelectorAll<HTMLElement>(".craft-card");
        if (isMobileCraftCards) {
          gsap.set(items, { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 });
          items.forEach(item => item.classList.add("craft-card-settled"));
          return;
        }
        const groupRect = grp.getBoundingClientRect();
        const centerX = groupRect.left + groupRect.width / 2;
        const centerY = groupRect.top + groupRect.height / 2;
        const n = items.length;

        const stackPos = Array.from(items).map((item, i) => {
          const r = item.getBoundingClientRect();
          const itemCenterX = r.left + r.width / 2;
          const itemCenterY = r.top + r.height / 2;
          const stackX = centerX - itemCenterX;
          const stackY = centerY - itemCenterY + 24;
          const rotation = (i - (n - 1) / 2) * 11;
          const offscreenY = stackY + window.innerHeight * 0.6;
          gsap.set(item, { opacity: 0, x: stackX, y: offscreenY, rotation, scale: 0.92, zIndex: i });
          return { x: stackX, y: stackY, rotation };
        });

        // Deal into a fanned stack one card at a time, then spread all cards to their final
        // grid positions together in one beat — that's the "shuffle" itself (dealing individual
        // cards into a stack); the spread is a single simultaneous release, not staggered.
        const tl = gsap.timeline({ scrollTrigger: { trigger: grp, start: "top 78%" }, defaults: { ease: "power2.out" } });
        items.forEach((item, i) => {
          tl.to(item, { opacity: 1, y: stackPos[i].y, scale: 0.96, duration: 0.4 }, i === 0 ? 0 : "+=0.07");
        });
        tl.to(items, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.5, ease: "power3.out" }, "+=0.08");
        tl.eventCallback("onComplete", () => items.forEach(item => item.classList.add("craft-card-settled")));
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      });

      ScrollTrigger.refresh();
    })();
    return () => { killed = true; triggers.forEach(t => t.kill()); };
  }, []);

  return (
    <>
      <SiteNav />

      <style>{`
        .hero-rise,.rise,.rise-item{opacity:0;will-change:transform,opacity;}
        .vision-card{opacity:0;}
        .craft-card{opacity:0;will-change:transform,opacity;}
        .craft-card-settled.collab-scatter-card{transition:transform .35s ease;}
        .craft-card-settled.collab-scatter-card:hover{transform:scale(1.04) !important;}
      `}</style>

      {/* ── Hero ── */}
      <section
        className="relative flex flex-col justify-end overflow-hidden"
        style={{
          minHeight: "100vh",
          padding: `112px ${PX} clamp(56px,7vw,96px)`,
          background: "linear-gradient(180deg,#0C40BE 0%,#0456DD 28%,#7C97E8 55%,#F4F6FC 82%,#FFFFFF 100%)",
        }}
      >
        {/* `maxWidth: 14ch` used to force this onto two lines, but `ch` is measured from the
            font's "0" glyph — for this bold/uppercase/tight-tracking font that glyph is narrower
            than the actual word "COLLABORATIONS" renders at. Since it's one unbreakable word, it
            overflowed past that width instead of wrapping, and this section's `overflow-hidden`
            clipped the overflow (the cut-off "S"). An explicit line break gives the same two-line
            layout deterministically, with no risk of a word overflowing its box. */}
        <h1
          style={{
            fontFamily: "var(--font-barlow)", fontWeight: 900,
            fontSize: "clamp(44px,7.5vw,110px)", lineHeight: 0.92, letterSpacing: "-0.02em",
            textTransform: "uppercase", marginBottom: "clamp(40px,6vw,60px)",
          }}
        >
          <SweepText tone="light" color="#FFFFFF">Collaborations<br />that Elevate</SweepText>
        </h1>

        {/* Below md this stacks and centers instead of relying on flex-wrap: with the row's two
            items each wider than a phone viewport, flex-wrap put each on its own line, but
            `justify-between` with a single item on a line falls back to flex-start — which put
            the star flush left instead of centered. */}
        <div className="flex flex-col items-center md:flex-row md:items-end md:justify-between gap-10 md:flex-wrap">
          <div className="hero-rise relative shrink-0" style={{ width: "clamp(190px,21.5vw,278px)", aspectRatio: "277.868/416.802" }}>
            <Star3D className="w-full h-full" scale={9.5} cameraZ={14} />
          </div>

          <div className="hero-rise flex flex-col items-start gap-[18px]" style={{ maxWidth: 560, flex: "1 1 420px" }}>
            <p style={{
              fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: "clamp(15px,1.5vw,18px)",
              lineHeight: 1.4, color: "#363636", textTransform: "uppercase",
            }}>
              A major part of <span style={{ color: "#0456DD" }}>Switchblade&apos;s vision</span> is to explore categories and get comfortable with something not yet done. This calls for people/brands to come together and make something together which has not been done yet and explore new boundaries
            </p>
            <div className="flex items-center gap-[18px] flex-wrap">
              <a
                href="#pitch"
                className="flex items-center gap-3 rounded-xl text-white font-medium hover:opacity-85 transition-opacity"
                style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: 15, padding: "8px 8px 8px 20px" }}
              >
                Send Pitch
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "#fff", borderRadius: 8 }}>
                  <SparkleMark className="h-[16px] w-auto shrink-0 text-[#0F0E0C]" />
                </span>
              </a>
              <a
                href="#standard"
                className="flex items-center gap-3 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{ border: "1px solid #0F0E0C", color: "#0F0E0C", fontFamily: "var(--font-archivo)", fontSize: 15, padding: "12px 16px 12px 20px" }}
              >
                See the standard
                <Image src="/collaborate/icon-standard-arrow.svg" alt="" width={13} height={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision / single test ── */}
      <section style={{ background: "#FFFFFF", padding: `${SECTION} ${PX}` }}>
        <div className="mx-auto flex flex-col items-center text-center" style={{ maxWidth: 900 }}>
          <div className="rise" style={{ display: "inline-flex", border: "1px solid #363636", borderRadius: 6, padding: "4px 6px", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#363636" }}>Vision</span>
          </div>
          <h2 className="uppercase" style={{
            fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(32px,5vw,72px)",
            lineHeight: 1, letterSpacing: "-0.02em", width: "100%"
          }}>
            <SweepText tone="dark" color="#0F0E0C" style={{ display: "inline-block" }}>Every collaboration must pass a </SweepText>
            <SweepText tone="dark" color="#0456DD" delay={150} style={{ display: "inline-block" }}>single test</SweepText>
          </h2>
        </div>

        <div className="vision-cards flex flex-wrap justify-center mx-auto" style={{ gap: "clamp(60px,10vw,160px)", marginTop: "clamp(56px,7vw,96px)", maxWidth: 900 }}>
          {VISION_TESTS.map((v, i) => (
            <div key={v.num} className="vision-card flex flex-col items-start" style={{
              position: "relative",
              width: 224, height: 143, padding: "14px 14.835px",
              marginTop: i % 2 === 1 ? "clamp(24px,3.5vw,56px)" : 0, boxSizing: "border-box",
            }}>
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                borderTop: `1px solid ${v.border}`,
                borderLeft: `1px solid ${v.border}`,
                borderRight: `1px solid ${v.border}`,
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 82%)",
                maskImage: "linear-gradient(to bottom, black 0%, transparent 82%)",
              }} />
              <div className="flex flex-col justify-between" style={{ height: "98.28px", width: "100%", boxSizing: "border-box" }}>
                <div className="flex flex-col gap-[2.5px] uppercase" style={{ color: "#0F0E0C" }}>
                  <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 7.5 }}>{v.num}</span>
                  <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 15 }}>{v.q}</span>
                </div>
                <Image src={v.icon} alt="" width={30} height={30} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Collaboration Standard ── */}
      <section
        id="standard"
        style={{
          padding: `${SECTION} ${PX}`, scrollMarginTop: 62,
          background: "linear-gradient(180deg,#0C40BE 0%,#0456DD 22%,#8FA6EA 48%,#FFFFFF 100%)",
        }}
      >
        {/* Same fragile `ch`-based maxWidth pattern as the Hero heading above — "Collaboration"
            alone is 13 characters, leaving almost no margin before `14ch` under- or over-shoots
            depending on this font's actual glyph widths vs. its "0" glyph. Explicit break instead
            of relying on ch-unit wrapping. */}
        <h2 style={{
          fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(40px,7vw,96px)",
          lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase",
          marginBottom: "clamp(48px,6vw,88px)",
        }}>
          <SweepText tone="light" color="#F9F8F6">Collaboration<br />Standard</SweepText>
        </h2>

        <div className="rise-group grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(16px,2vw,28px)" }}>
          {STANDARD.map((s) => (
            <div key={s.num} className="rise-item" style={{ background: "#fff", padding: "23px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 322 }}>
              <div className="flex items-start justify-between">
                <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 600, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: "#0456DD" }}>{s.num}</span>
                <Tag tone="light">{s.tag}</Tag>
              </div>
              <div className="flex flex-col gap-4">
                <h3 style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", color: "#0F0E0C" }}>{s.title}</h3>
                <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, lineHeight: 1.2, letterSpacing: "-0.015em", color: "#444" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Where craft meets philosophy ── */}
      <section style={{ background: "#FFFFFF", padding: `${SECTION} ${PX}`, overflow: "hidden" }}>
        <div className="flex flex-col items-center text-center" style={{ marginBottom: "clamp(56px,7vw,96px)" }}>
          <div className="rise" style={{ display: "inline-flex", border: "1px solid #D3D3D3", borderRadius: 6, padding: "4px 6px", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#444" }}>Introducing</span>
          </div>
          <h2 className="uppercase" style={{
            fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(34px,6vw,88px)",
            lineHeight: 0.92, letterSpacing: "-0.02em", maxWidth: "22ch",
          }}>
            <SweepText tone="dark" color="#0F0E0C">Where Craft meets Philosophy</SweepText>
          </h2>
        </div>

        <div className="craft-cards grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(20px,2.5vw,28px)", maxWidth: 1160, margin: "0 auto" }}>
          {CASES.map((c) => (
            <article key={c.title + c.kind} className="craft-card collab-scatter-card" style={{
              background: "#fff", border: "1px solid #AAAAAA", borderRadius: 12, overflow: "hidden",
              display: "flex", flexDirection: "column", padding: "16px 17px 0",
              height: "100%", minHeight: 380,
            }}>
              <Tag pill>{c.kind}</Tag>
              <div className="relative flex items-center justify-center" style={{ height: 156, margin: "24px 0" }}>
                <div style={{ position: "absolute", width: 163, height: 156, borderRadius: 15, background: c.chip }} />
                <div className="relative" style={{ width: 82, height: 122 }}>
                  <Image src="/collaborate/collab-image.png" alt="" fill className="object-cover" sizes="82px" />
                </div>
              </div>
              <div className="flex flex-col gap-3 uppercase" style={{ paddingBottom: 24 }}>
                <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#0F0E0C" }}>{c.title}</h3>
                <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 16, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#444", textTransform: "none" }}>{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Wins in one scenario ── */}
      {/* Had both a fixed `height` (capped at 400px) and a larger `minHeight` (up to 600px) at
          the same time — the explicit `height` always wins over `minHeight`, so combined with
          `overflow: hidden` this was clipping its own content (the paragraph + star box) any
          time they needed more than ~400px, which is routine on mobile where the paragraph wraps
          to more lines and the star's tall aspect-ratio box alone needs ~370-450px. Dropping the
          fixed `height` and keeping only `minHeight` lets the section grow to fit its content
          instead of truncating it, on every viewport. */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ background: "#FFFFFF", padding: "clamp(40px,5vw,80px) 0", minHeight: "clamp(360px,42vw,600px)" }}>
        <p className="rise text-center" style={{
          fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: "clamp(22px,2.6vw,36px)",
          lineHeight: 1.3, letterSpacing: "-0.02em", color: "#0D0D0D", maxWidth: 700,
        }}>
          <span style={{ color: "#0456DD" }}>Switchblade</span> wins only in one scenario: when what we build together helps people to stay and get inspired
        </p>
        <div className="rise shrink-0" style={{ width: "clamp(250px,10vw,300px)", aspectRatio: "129.133/193.7", marginTop: "clamp(24px,3vw,40px)" }}>
          <Star3D className="w-full h-full" scale={16.2} cameraZ={28} />
        </div>
      </section>

      {/* ── Let's collaborate ── */}
      <section id="pitch" style={{ background: "#FFFFFF", padding: `${SECTION} ${PX}`, scrollMarginTop: 62 }}>
        <div className="grid gap-16" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
          <div>
            <h2 className="uppercase" style={{
              fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(40px,7vw,96px)",
              lineHeight: 0.92, letterSpacing: "-0.02em", marginBottom: "clamp(20px,2.5vw,32px)",
            }}>
              <SweepText tone="dark" color="#0F0E0C">Let&rsquo;s<br />Collaborate</SweepText>
            </h2>
            <div className="rise">
              <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, color: "#929292", maxWidth: 440 }}>
                Tell us what we&apos;d make together. If it elevates both of us, we&apos;ll build it
              </p>
              <div className="hidden lg:block shrink-0" style={{ width: "clamp(250px,13.5vw,350px)", aspectRatio: "189.133/293.7", marginTop: "clamp(24px,3vw,40px)" }}>
                <Star3D className="w-full h-full" scale={6.2} cameraZ={10.5} />
              </div>
            </div>

            <div className="rise flex items-center flex-wrap gap-4" style={{
              border: "1px solid #D9D9D9", borderRadius: 6, padding: "24px 24px 24px 17px",
              marginTop: "clamp(10px,6vw,20px)",
            }}>
              <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, color: "#929292" }}>
                Not ready to pitch? Stay in the orbit -
              </span>
              <Link href="/journal" style={{ fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 18, color: "#0456DD", textDecoration: "underline" }}>
                Follow the archive
              </Link>
            </div>
          </div>

          <div className="rise-group flex flex-col gap-11">
            <div className="rise-item" style={{ background: "#fff", border: "1px solid #D8D8D8", borderRadius: 15, padding: "24px 24px 18px" }}>
              <div className="flex items-center justify-between gap-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-[14px]">
                    <Image src="/collaborate/google-meet.svg" alt="Google Meet" width={44} height={36} />
                    <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 600, fontSize: 24, color: "rgba(0,0,0,0.5)" }}>Book a quick call</span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <Clock size={18} color="#666565" strokeWidth={2} />
                    <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 18, textTransform: "uppercase", color: "#666565" }}>15 Minutes</span>
                  </div>
                </div>
                <ArrowUp size={22} color="#0D0D0D" style={{ transform: "rotate(48deg)" }} />
              </div>
            </div>

            <div className="rise-item flex items-center justify-between gap-4 flex-wrap">
              <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>Book a meeting</span>
              <span style={{ flex: 1, minWidth: 40, height: 1, background: "#D8D8D8" }} />
              <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>or</span>
              <span style={{ flex: 1, minWidth: 40, height: 1, background: "#D8D8D8" }} />
              <span style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>Drop a Pitch</span>
            </div>

            <form className="rise-item flex flex-col gap-[18px]" style={{ border: "1px solid #D8D8D8", borderRadius: 12, padding: "32px 24px" }} onSubmit={e => e.preventDefault()}>
              {[
                { label: "You OR Your Craft",             type: "input" },
                { label: "Portfolio link",                type: "input" },
                { label: "What would we make together",  type: "input" },
                { label: "E-mail or phone number",        type: "input" },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-11">
                  <label style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 500, fontSize: 14, textTransform: "uppercase", color: "#000", opacity: 0.5 }}>{f.label}</label>
                  <input type="text" style={fieldStyle} onFocus={e => (e.target.style.borderBottomColor = "#0456DD")} onBlur={e => (e.target.style.borderBottomColor = "rgba(13,13,13,0.14)")} />
                </div>
              ))}
              <button type="submit" style={{
                height: 40, background: "#000", color: "#fff", border: "none", borderRadius: 8,
                fontFamily: "var(--font-archivo)", fontWeight: 500, fontSize: 16, letterSpacing: "-0.02em",
                cursor: "pointer", transition: "opacity 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                /Send the pitch
              </button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "block", width: "100%", background: "none", border: "none",
  borderBottom: "1px solid rgba(13,13,13,0.14)", padding: "0 0 8px",
  fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: 15,
  color: "#0D0D0D", outline: "none", resize: "none", transition: "border-color 0.2s",
};
