"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SweepText } from "@/components/shared/SweepText";
import { SHOP_HIGHLIGHT_EVENT, SHOP_HIGHLIGHT_KEY } from "@/components/shared/SiteNav";

const STORY_LEFT = [
  "There’s a book I was reading, The Creative Act by Rick Rubin. He writes about how good ideas exist around us like signals in the air and the human antenna catches them. When you think of something and see it come to life later through someone else’s hands, you wonder.",
  "But the truth is good ideas are bound to exist and they move towards the people willing to receive them and bring them to life.",
  "I read that and something settled in me. This logo has lived with me since I was 11. Not in a drawer — in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn’t fully understand yet, I still don’t think I do, but I’ve carried it for over two decades — and at some point, carrying an idea this long becomes a responsibility.\nThat’s reason number one to establish Switchblade.\nReason number two is simpler. You get one life. I’ve spent enough time waiting to know everything before I begin. I don’t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I’ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.",
  "I want to be honest from the start — that’s the only way I know how to do this.\nI am inspired by neatness, practicality & innovation. Palace Skateboards, JJJJound, Stone Island, Stussy, KITH, Oakley — these are brands I have immense respect for and they have shaped how I think about what a brand can be and mean.\nAnd I owe transparency about something - when I drew this logo at age 11, I had no idea what Stone Island’s logo looked like and when I discovered the resemblance a couple of years ago, I had sleepless nights. I still think about it. But I believe the people at Stone Island would understand and I’m certain that Massimo Osti would.",
];

const STORY_RIGHT = [
  "They all will always be light years ahead of Switchblade. They will always keep inspiring me. And I genuinely hope someday we work together with all them that have made possible for Switchblade to exist.\nAs a personal belief, at the depth of the human heart, there is no competition - only compassion, strength, kindness, and love. That is the core belief Switchblade is built on. It is not a strategy. It is who I am.\nSwitchblade is for people who carry competence without seeking validation.\nWho are just as sharp as they are kind and know those are not opposites.\nThe builders, thinkers & doers who value depth & attention to detail.\nWho choose the edge not because it’s cool, but because something in them simply cannot settle for less.",
  "And if anything about this gives you the courage to begin something you love — something you’ve been carrying too long without acting on — that would be the highest thing this brand could ever achieve.\nMore than any product. More than any collaboration. More than anything.\nThis journey begins now — not fully formed, but fully committed.\nThe vision will take shape across three phases: Cosmos, Classic, and Evolution.\nEach phase is a chapter of 1 to 2 years — of change, growth, and exploration.",
  "We begin with Cosmos. The first products are being built. Apparel comes first.\nTo follow the inspiration and the ongoing research behind what’s being made — explore Switchblade Classics.\nLove you Mom & Dad!",
];

// The two paragraphs after the first AGE-11 tag ("Not in a drawer..." through the second
// AGE-11 tag's trailing "....................."). On desktop these stay inline in the preview,
// visible without clicking anything. On mobile they're hidden there (see the two usages below)
// and instead only appear once "Read More" is clicked, at the top of StoryFull — reused as one
// component so the text/images aren't duplicated between the two spots.
function StoryContinuation() {
  return (
    <>
      Not in a drawer  in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn&rsquo;t fully understand yet, I still don&rsquo;t think I do, but I&rsquo;ve carried it for over two decades  and at some point, carrying an idea this long becomes a responsibility.
      <br />That&rsquo;s reason number one to establish Switchblade.
      <br />Reason number two is simpler. You get one life. I&rsquo;ve spent enough time waiting to know everything before I begin. I don&rsquo;t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I&rsquo;ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.
      <p style={{ marginTop: "1.4em" }}>
        I want to be honest from the start  that&rsquo;s the only way I know how to do this.
        <br />I am inspired by neatness, practicality &amp; innovation. Palace Skateboards, JJJJound, Stone Island, Stussy, KITH, Oakley — these are brands I have immense respect for and they have shaped how I think about what a brand can be and mean.
        <br />And I owe transparency about something - when I drew this logo at{" "}
        <Image
          src="/age-11-tag.png"
          alt="Age 11"
          width={182}
          height={127}
          style={{ display: "inline-block", verticalAlign: "middle", height: "3.6em", width: "auto" }}
        />
        ,.....................
      </p>
    </>
  );
}

function StoryPreview({ onReadMore }: { onReadMore: () => void }) {
  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: "clamp(5px,3vw,10px)" }}>
        <span style={{ width: 10, height: 10, background: "#0456DD", flexShrink: 0 }} />
        <p style={{
          fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: "clamp(13px,1vw,15px)",
          lineHeight: 1.3, textTransform: "uppercase", color: "#0456DD", maxWidth: "40ch",
        }}>
          Long before Switchblade became a brand, it was a way of seeing the world
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:[grid-template-columns:0.8fr_1fr]"
        style={{ gap: "clamp(56px,8vw,128px)", alignItems: "stretch" }}
      >
      <div style={{ position: "relative", minHeight: "280px", overflow: "hidden" }}>
        <Image src="/founder-childhood.png" alt="Sanjam, founder of Switchblade, as a child" fill className="object-cover" sizes="530px" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0) 35%)" }} />
        <div style={{ position: "absolute", left: "clamp(16px,2vw,24px)", bottom: "clamp(16px,2vw,24px)" }}>
          <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 600, fontSize: 13, letterSpacing: "0.06em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>/FOUNDER</p>
          <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(24px,2.8vw,34px)", letterSpacing: "-0.01em", textTransform: "uppercase", color: "#fff" }}>SANJAM</p>
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.2, color: "#0D0D0D" }}>
          <p style={{ marginBottom: "1.4em" }}>
            There&rsquo;s a book I was reading , The Creative Act by Rick Rubin. He writes about how good ideas exist around us like signals in the air and the human antenna catches them. When you think of something and see it come to life later through someone else&rsquo;s hands, you wonder.
          </p>
          <p style={{ marginBottom: "1.4em" }}>
            But the truth is good ideas are bound to exist and they move towards the people willing to receive them and bring them to life.
          </p>
          <p>
            I read that and something settled in me. This logo has lived with me since I was{" "}
            {/* Mobile: plain "......." instead of the AGE-11 tag image — the image is desktop-
                only here (md:inline-block); mobile gets the dots (md:hidden) instead, by
                request. Read More also moves inline right after the dots on mobile (see below)
                instead of sitting as its own block underneath the paragraph. */}
            <span className="md:hidden">.......</span>
            <Image
              src="/age-11-tag.png"
              alt="Age 11"
              width={182}
              height={127}
              className="hidden md:inline-block"
              style={{ verticalAlign: "middle", height: "3.6em", width: "auto" }}
            />
            <span className="hidden md:inline">
              . Not in a drawer  in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn&rsquo;t fully understand yet, I still don&rsquo;t think I do, but I&rsquo;ve carried it for over two decades  and at some point, carrying an idea this long becomes a responsibility.
              <br />That&rsquo;s reason number one to establish Switchblade.
              <br />Reason number two is simpler. You get one life. I&rsquo;ve spent enough time waiting to know everything before I begin. I don&rsquo;t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I&rsquo;ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.
            </span>{" "}
            <button
              type="button"
              onClick={onReadMore}
              className="md:hidden inline-flex items-center rounded-lg text-white font-medium hover:opacity-85 transition-opacity align-middle"
              style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: 14, padding: "6px 16px", marginTop: 8, border: "none", cursor: "pointer" }}
            >
              Read More
            </button>
          </p>
          <p className="hidden md:block" style={{ marginTop: "1.4em" }}>
            I want to be honest from the start  that&rsquo;s the only way I know how to do this.
            <br />I am inspired by neatness, practicality &amp; innovation. Palace Skateboards, JJJJound, Stone Island, Stussy, KITH, Oakley — these are brands I have immense respect for and they have shaped how I think about what a brand can be and mean.
            <br />And I owe transparency about something - when I drew this logo at{" "}
            <Image
              src="/age-11-tag.png"
              alt="Age 11"
              width={182}
              height={127}
              style={{ display: "inline-block", verticalAlign: "middle", height: "3.6em", width: "auto" }}
            />

          </p>
        </div>

        {/* Desktop only now — mobile's Read More moved inline into the paragraph above. */}
        <button
          type="button"
          onClick={onReadMore}
          className="hidden md:inline-flex items-center rounded-lg text-white font-medium hover:opacity-85 transition-opacity"
          style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: 15, padding: "10px 22px", marginTop: "clamp(16px,2.5vw,28px)", border: "none", cursor: "pointer" }}
        >
          Read More
        </button>
      </div>
      </div>
    </motion.div>
  );
}

function StoryFull({ highlightCosmos, cosmosRef, onClose }: { highlightCosmos: boolean; cosmosRef: React.RefObject<HTMLParagraphElement | null>; onClose: () => void }) {
  return (
    <motion.div
      key="full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Mobile-only backdrop behind the popup sheet below — tapping it closes the story, same as
          the sheet's own close button. Desktop never renders this (md:hidden). */}
      <div className="md:hidden fixed inset-0" style={{ background: "rgba(13,13,13,0.55)", zIndex: 1300 }} onClick={onClose} />

      {/* Mobile: fixed bottom-sheet with a hard maxHeight and its own scroll, so the full story
          doesn't just keep growing the page — desktop collapses this wrapper entirely
          (display:contents via md:contents) back to the plain in-flow layout it had before. */}
      <div className="md:contents fixed inset-x-0 bottom-0 flex flex-col" style={{ zIndex: 1301, maxHeight: "82vh", background: "#fff", borderRadius: "20px 20px 0 0" }}>
        <div className="flex md:hidden justify-end" style={{ padding: "14px 16px 0", flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 999, background: "#F2F2F2", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15 }}
          >
            ✕
          </button>
        </div>

        <div className="md:contents" style={{ overflowY: "auto" }}>
          {/* Mobile-only: StoryPreview hides this same continuation text (see the hidden md:inline
              span and hidden md:block paragraph there) so the collapsed preview ends right after the
              first Age-11 tag on small screens — it reappears here instead, once Read More is opened. */}
          <div className="block md:hidden" style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.2, color: "#0D0D0D", padding: "8px 20px 0", marginBottom: "clamp(28px,4vw,64px)" }}>
            <StoryContinuation />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-md:px-5 max-md:pb-7" style={{ gap: "clamp(28px,4vw,64px)" }}>
        {[STORY_LEFT, STORY_RIGHT].map((col, colIdx) => (
          <div key={colIdx} style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(14px,1.05vw,17px)", lineHeight: 1.5, color: "#0D0D0D" }}>
            {col.map((para, i) => (
              <motion.p
                key={i}
                ref={colIdx === 1 && i === STORY_RIGHT.length - 1 ? cosmosRef : undefined}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (colIdx * col.length + i) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ marginBottom: "1.3em", whiteSpace: "pre-line" }}
              >
                {/* Only the "We begin with Cosmos..." paragraph (STORY_RIGHT's last entry) can
                    get a highlight — everything except its final "Love you Mom & Dad!" line,
                    split off the shared array string rather than hardcoding the text a second
                    time. Stays plain black by default; only turns blue when reached via the
                    Shop link's auto-open-and-scroll flow (see OriginsSection). */}
                {colIdx === 1 && i === STORY_RIGHT.length - 1 ? (() => {
                  const lines = para.split("\n");
                  const signOff = lines[lines.length - 1];
                  const highlighted = lines.slice(0, -1).join("\n");
                  return (
                    <>
                      <span
                        style={{
                          backgroundColor: highlightCosmos ? "rgba(4,86,221,0.22)" : "rgba(4,86,221,0)",
                          // box-decoration-break keeps the "highlighter" padding consistent on
                          // every wrapped line of this multi-line span, instead of only the
                          // first/last line getting the extra breathing room.
                          boxDecorationBreak: "clone",
                          WebkitBoxDecorationBreak: "clone",
                          padding: "0.05em 0.15em",
                          borderRadius: 3,
                          transition: "background-color 0.6s ease",
                        }}
                      >
                        {highlighted}
                      </span>
                      {"\n"}{signOff}
                    </>
                  );
                })() : para}
              </motion.p>
            ))}
          </div>
        ))}
          </div>

          <p className="max-md:px-5 max-md:pb-7" style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "clamp(18px,1.6vw,24px)", marginTop: "clamp(20px,2.5vw,32px)", color: "#0D0D0D" }}>
            - Sanjam
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function OriginsSection() {
  const [storyOpen, setStoryOpen] = useState(false);
  const [highlightCosmos, setHighlightCosmos] = useState(false);
  const cosmosRef = useRef<HTMLParagraphElement>(null);

  // Mobile renders StoryFull as a fixed overlay ON TOP of a still-mounted StoryPreview, instead of
  // swapping one for the other (see the render block below) — so this needs to be a real JS branch,
  // not a CSS one. Starts false so SSR and the first client render agree; while storyOpen is false
  // both branches render exactly the same tree anyway, so flipping it on mount changes nothing
  // visually.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Closing the expanded story removes a LOT of in-flow height (desktop renders StoryFull inline),
  // so the browser keeps the same scrollY and the viewport snaps upward — the reported "jump".
  // Instead, on close, scroll back to the top of this section as one controlled motion: the
  // collapse then happens at/below where the reader lands, so there's no abrupt jump. Routed
  // through Lenis (window.__lenis) when present so it stays smooth and in sync with the homepage's
  // smooth-scroll/ScrollTrigger; falls back to native scrollIntoView (mobile / no Lenis).
  const closeStory = () => {
    // Only desktop needs the scroll-back: there StoryFull renders IN-FLOW, so collapsing it is
    // what removes the height and causes the jump. On mobile it's a fixed bottom sheet with the
    // page scroll-locked in place underneath, so it just closes where the reader already is.
    setStoryOpen(false);
    if (isMobile) return;
    requestAnimationFrame(() => {
      const el = document.getElementById("origins-section");
      if (!el) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).__lenis;
      if (lenis?.scrollTo) lenis.scrollTo(el, { offset: -80 });
      else el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Mobile only: with the sheet open, the page underneath must not scroll behind it. (The layout
  // collapse that used to accompany opening is handled separately, by keeping StoryPreview mounted
  // underneath — see the render block.) Desktop is unaffected: StoryFull renders in-flow there
  // (md:contents), and locking would block scrolling the story itself while it's expanded inline.
  //
  // overflow:hidden on body, NOT the position:fixed+top-offset trick some other lock
  // implementations use: that trick makes window.scrollY read as 0 the instant it's applied
  // (confirmed live) — the page LOOKS frozen at the right spot via the CSS offset, but the
  // reported scroll position genuinely changes to 0 underneath it. This homepage has GSAP
  // ScrollTrigger instances permanently mounted and reading real scroll position the whole time
  // (RadiatesSection's star travel/dock-into-the-O logic in page.tsx, always active regardless of
  // what section is in view) — they immediately saw "scrollY 0" and snapped the always-mounted,
  // fixed-position global star to its top-of-page resting state, which then rendered on top of
  // the still-visually-frozen (but not actually scroll-position-synced) Origins/BrandJourney
  // content behind it — exactly the overlapping "glitch" reported. Plain overflow:hidden blocks
  // further scrolling WITHOUT touching the current scrollY value at all (confirmed live: it
  // stayed exactly where it was), so nothing reads a false position and nothing desyncs.
  useLayoutEffect(() => {
    if (!storyOpen || !isMobile) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [storyOpen, isMobile]);

  // Auto-open the full story (the highlighted text otherwise only exists once "Read More" has
  // been clicked), then once that content has actually rendered, scroll the Cosmos paragraph
  // into view and turn its highlight on. Shop (SiteNav) triggers this two different ways,
  // because it can be clicked from two different situations:
  useEffect(() => {
    const run = () => {
      setStoryOpen(true);
      const id = window.setTimeout(() => {
        cosmosRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightCosmos(true);
      }, 350);
      return id;
    };

    // 1. Clicked from another page: Link does a full navigation, so this component mounts
    //    fresh — sessionStorage (set right before that navigation) survives the reload, checked
    //    once here on mount.
    let timeoutId: number | undefined;
    if (sessionStorage.getItem(SHOP_HIGHLIGHT_KEY) === "1") {
      sessionStorage.removeItem(SHOP_HIGHLIGHT_KEY);
      timeoutId = run();
    }

    // 2. Clicked while already on the homepage: Next.js's <Link> does a client-side hash-scroll
    //    WITHOUT a full reload, so this component never remounts and the mount-only check above
    //    would silently never fire. Listening for the live event instead means it fires
    //    regardless of whether a reload happened, as long as this component is still mounted.
    const onEvent = () => { timeoutId = run(); };
    window.addEventListener(SHOP_HIGHLIGHT_EVENT, onEvent);

    return () => {
      window.removeEventListener(SHOP_HIGHLIGHT_EVENT, onEvent);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section
      id="origins-section"
      // Top and bottom padding both pulled back down to 160px on mobile only — 320px read as too
      // much dead space both before this section's own heading and before "The Brand Journey"
      // heading below it. Desktop is untouched, still clamp(180px,14vw,320px) both sides.
      className="site-px max-md:pt-[160px] max-md:pb-[160px] md:pt-[clamp(180px,14vw,320px)] md:pb-[clamp(180px,14vw,320px)]"
      style={{ background: "#ffffff" }}
    >
      <div className="flex items-end justify-center flex-wrap" style={{ gap: "clamp(8px,1vw,14px)", marginBottom: "clamp(48px,5vw,72px)" }}>
        <h2 style={{
          position: "relative",
          fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(40px,7vw,96px)",
          lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase",
        }}>
          {/* The "O" of "Origins" gets its own id so page.tsx's star-tracking effect can measure
              its live on-screen position and dock the (fixed-position) star inside it. Kept as a
              plain inline span (no display:inline-block/block) — SweepText's gradient-wipe
              reveal works via background-clip:text on the parent, which only clips through
              normal inline content; a block-level child breaks out of that and just inherits
              color:transparent with no gradient of its own, rendering as literally invisible
              text (exactly what happened the first time this was tried). */}
          <SweepText tone="dark" color="#0D0D0D">
            The <span id="origins-o-letter">O</span>rigins
          </SweepText>
        </h2>
        <p style={{
          fontFamily: "var(--font-archivo)", fontWeight: 600, fontSize: "clamp(10px,1.1vw,16px)",
          lineHeight: 1.3, letterSpacing: "-0.01em", textTransform: "uppercase", color: "#0D0D0D",
          marginBottom: "clamp(6px,1vw,14px)",
        }}>
          {/* Two lines on desktop (matches the reference), one line on mobile — the <br>'s
              display is toggled instead of using a plain whiteSpace:nowrap/normal split, since a
              hidden <br> simply stops forcing the break rather than fighting it. Forcing this
              onto one long nowrap line unconditionally (an earlier mobile-only fix applied too
              broadly) also made this row wide enough to force the whole heading row to wrap on
              desktop, which is what made "The Origins" read as flush-left instead of centered —
              a full-width wrapped line centers with no visible margin either side. */}
          [A Story Before <br className="hidden md:block" />The Brand]
        </p>
      </div>

      {/* Desktop swaps preview -> full story in place (both are in-flow there, so the exchange is
          height-neutral enough). Mobile must NOT swap: StoryFull is a position:fixed bottom sheet,
          so it contributes zero in-flow height, and unmounting the preview would collapse a whole
          screenful of page height the instant it opens. That collapse is what made BrandJourney's
          3D star flash into view for a frame, and it also let the browser clamp scrollY to the
          now-shorter document — which is why closing landed the reader down at Brand Journey
          instead of back where they started. Keeping the preview mounted underneath means the
          document height never changes at all, so there is nothing to reflow and no scroll to
          restore. */}
      <AnimatePresence>
        {storyOpen && !isMobile
          ? <StoryFull key="full" highlightCosmos={highlightCosmos} cosmosRef={cosmosRef} onClose={closeStory} />
          : <StoryPreview key="preview" onReadMore={() => setStoryOpen(true)} />}
      </AnimatePresence>

      {isMobile && (
        <AnimatePresence>
          {storyOpen && (
            <StoryFull key="full-mobile" highlightCosmos={highlightCosmos} cosmosRef={cosmosRef} onClose={closeStory} />
          )}
        </AnimatePresence>
      )}

      {/* Desktop only — on mobile, StoryFull renders its own close button pinned to its popup
          sheet instead (see the md:hidden button inside StoryFull). Placed after the full story
          text (below the "- Sanjam" sign-off) rather than up by the heading — it used to sit
          absolutely-positioned there, which overlapped the heading's subtitle once that row
          wrapped on mobile. Here it's just a normal block after the content, so it can't overlap
          anything regardless of viewport width. */}
      {storyOpen && (
        <div className="hidden md:flex justify-center" style={{ marginTop: "clamp(24px,3vw,36px)" }}>
          <button
            type="button"
            onClick={closeStory}
            className="inline-flex items-center"
            style={{
              gap: 6, background: "#FF802B", color: "#fff",
              fontFamily: "var(--font-ibm-mono)", fontWeight: 700, fontSize: 14,
              borderRadius: 10, padding: "10px 18px", border: "none", cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </section>
  );
}
