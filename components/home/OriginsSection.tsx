"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SweepText } from "@/components/shared/SweepText";
import { SHOP_HIGHLIGHT_EVENT, SHOP_HIGHLIGHT_KEY } from "@/components/shared/SiteNav";

// Every paragraph the expanded story is made of, ONE ENTRY PER PARAGRAPH — matching the reference
// layout exactly, where each of these sits apart from its neighbours by the same single gap.
// Previously several of these were packed into one string joined by "\n" and rendered with
// `whiteSpace: pre-line`, which produced a tight LINE BREAK between them instead of a paragraph
// gap — so e.g. "That's reason number one to establish Switchblade." ran hard against the
// paragraph above it while others had full spacing. Splitting them into real entries means the
// single `marginBottom` on the rendered <p> is the only thing setting the rhythm, so every gap is
// identical by construction.
//
// That includes the closing Cosmos block: it used to be ONE entry whose three sentences were
// joined by "\n" and split apart again by hand inside StoryFull, so they sat on tight line breaks
// while every other pair of paragraphs had a full gap. They're three entries now, and the
// highlight works off index instead (see COSMOS_START / COSMOS_END below).
const STORY_PARAGRAPHS = [
  "There\u2019s a book I was reading, The Creative Act by Rick Rubin. He writes about how good ideas exist around us like signals in the air and the human antenna catches them. When you think of something and see it come to life later through someone else\u2019s hands, you wonder. But the truth is good ideas are bound to exist and they move towards the people willing to receive them and bring them to life.",
  "I read that and something settled in me. This logo has lived with me since I was 11. Not in a drawer \u2014 in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn\u2019t fully understand yet, I still don\u2019t think I do, but I\u2019ve carried it for over two decades \u2014 and at some point, carrying an idea this long becomes a responsibility.",
  "That\u2019s reason number one to establish Switchblade.",
  "Reason number two is simpler. You get one life. I\u2019ve spent enough time waiting to know everything before I begin. I don\u2019t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I\u2019ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.",
  "I want to be honest from the start \u2014 that\u2019s the only way I know how to do this.",
  "I am inspired by neatness, practicality & innovation. Palace Skateboards, JJJJound, Stone Island, Stussy, KITH, Oakley \u2014 these are brands I have immense respect for and they have shaped how I think about what a brand can be and mean.",
  "And I owe transparency about something - when I drew this logo at age 11, I had no idea what Stone Island\u2019s logo looked like and when I discovered the resemblance a couple of years ago, I had sleepless nights. I still think about it. But I believe the people at Stone Island would understand and I\u2019m certain that Massimo Osti would. They all will always be light years ahead of Switchblade. They will always keep inspiring me. And I genuinely hope someday we work together with them that have made possible for Switchblade to exist.",
  "As a personal belief, at the depth of the human heart, there is no competition - only compassion, strength, kindness, and love. That is the core belief Switchblade is built on. It is not a strategy. It is who I am.",
  "Switchblade is for people who carry competence without seeking validation.",
  "Who are just as sharp as they are kind and know those are not opposites.",
  "The builders, thinkers & doers who value depth & attention to detail.",
  "Who choose the edge not because it\u2019s cool, but because something in them simply cannot settle for less.",
  "And if anything about this gives you the courage to begin something you love \u2014 something you\u2019ve been carrying too long without acting on \u2014 that would be the highest thing this brand could ever achieve.",
  "More than any product. More than any collaboration. More than anything.",
  "This journey begins now \u2014 not fully formed, but fully committed.",
  "The vision will take shape across three phases: Cosmos, Classic, and Evolution.",
  "Each phase is a chapter of 1 to 2 years \u2014 of change, growth, and exploration.",
  "We begin with Cosmos. The first products are being built. Apparel comes first.",
  "To follow the inspiration and the ongoing research behind what\u2019s being made \u2014 explore Switchblade Classics.",
  "Love you Mom & Dad!",
];

// The Cosmos block is the last three paragraphs; the Shop link highlights the first two of them
// and leaves the "Love you Mom & Dad!" sign-off plain.
const COSMOS_START = STORY_PARAGRAPHS.length - 3;
const COSMOS_END   = STORY_PARAGRAPHS.length - 2;

// Where the MOBILE expanded story resumes. The preview reads all the way to "And I owe
// transparency about something - when I ..." and cuts mid-sentence, so on a phone the expansion
// starts at that very paragraph and continues — replaying the paragraphs already read would make
// the reader hunt for where they left off. Desktop still shows the story in full: there the
// expansion replaces the preview in place, so it reads as one continuous piece.
// Derived from the text rather than hardcoded, so re-ordering STORY_PARAGRAPHS can't silently
// point this at the wrong paragraph.
const MOBILE_RESUME_AT = STORY_PARAGRAPHS.findIndex(p => p.startsWith("And I owe transparency"));

// Desktop renders these in two columns, but there's no LEFT/RIGHT split here on purpose — the
// paragraphs are handed to CSS `columns-2` as one list and the browser balances them (see
// StoryFull). A hand-picked split index only lines the columns up by luck, and goes stale the
// moment the copy is edited.

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
      {/* max-md:aspect-[932/1166] — the source photo's own ratio. On mobile this column is a
          single grid cell with nothing to stretch against, so it fell back to the 280px
          min-height, which is far wider than tall relative to the photo: object-cover then had to
          crop the top and bottom (cutting off the head). Giving the box the image's real ratio
          means cover has nothing to crop. Desktop keeps stretching to match the text column
          beside it, so its ratio is set by that instead. */}
      <div className="max-md:aspect-[932/1166]" style={{ position: "relative", minHeight: "280px", overflow: "hidden" }}>
        {/* .jpg, not .png — it's a photograph, so PNG's lossless encoding cost 1.6MB in the repo
            for no visible benefit over a quality-94 JPEG at 197KB. */}
        <Image src="/founder-childhood.jpg" alt="Sanjam, founder of Switchblade, as a child" fill className="object-cover" sizes="530px" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0) 35%)" }} />
        <div style={{ position: "absolute", left: "clamp(16px,2vw,24px)", bottom: "clamp(16px,2vw,24px)" }}>
          <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 600, fontSize: 13, letterSpacing: "0.06em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>FOUNDER</p>
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
            {/* Shown at EVERY size now. Mobile used to swap this tag image for plain "......." and
                cut the preview off here, with its own inline Read More — mobile now runs the same
                preview as desktop, all the way to the "when I ..." cut-off below. */}
            <Image
              src="/age-11-tag.png"
              alt="Age 11"
              width={182}
              height={127}
              className="inline-block"
              style={{ verticalAlign: "middle", height: "3.6em", width: "auto" }}
            />
            <span>
              . Not in a drawer  in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn&rsquo;t fully understand yet, I still don&rsquo;t think I do, but I&rsquo;ve carried it for over two decades  and at some point, carrying an idea this long becomes a responsibility.
              <br />That&rsquo;s reason number one to establish Switchblade.
              <br />Reason number two is simpler. You get one life. I&rsquo;ve spent enough time waiting to know everything before I begin. I don&rsquo;t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I&rsquo;ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.
            </span>
          </p>
          <p style={{ marginTop: "1.4em" }}>
            I want to be honest from the start  that&rsquo;s the only way I know how to do this.
            <br />I am inspired by neatness, practicality &amp; innovation. Palace Skateboards, JJJJound, Stone Island, Stussy, KITH, Oakley — these are brands I have immense respect for and they have shaped how I think about what a brand can be and mean.
            {/* Desktop preview now CUTS OFF mid-sentence here, at "when I ...", with Read More
                sitting inline right after the ellipsis rather than as its own block underneath.
                The rest of the sentence ("drew this logo at [AGE 11], I had no idea what Stone
                Island's logo looked like...") is not repeated here — it lives in the expanded
                story only, as the tail of STORY_PARAGRAPHS' "And I owe transparency..." entry, so
                opening Read More is what
                completes the thought. */}
            <br />And I owe transparency about something - when I&nbsp;&hellip;{" "}
            <button
              type="button"
              onClick={onReadMore}
              // The top margin is MOBILE-ONLY (max-md:mt-5). There the button wraps onto its own
              // line and needs lifting off the text above it. On desktop it sits inline at the end
              // of the sentence, and a top margin still shifts it down there — an inline-flex
              // element is an atomic inline-level box, so margin-top is not the no-op it would be
              // on a pure inline. That's what knocked it out of line with the text.
              className="inline-flex items-center rounded-lg text-white font-medium hover:opacity-85 transition-opacity align-middle max-md:mt-5"
              style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: 15, padding: "6px 18px", border: "none", cursor: "pointer" }}
            >
              Read More
            </button>
          </p>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

// The expanded story keeps its paragraphs as plain strings (STORY_PARAGRAPHS), but the
// "…when I drew this logo at age 11, I had no idea what Stone Island's logo looked like…" sentence
// should show the same orange AGE-11 tag image the preview uses, not the literal words. Swapping it
// in at render time keeps the source text readable and searchable rather than splitting that
// paragraph into fragments in the array itself. Only that one occurrence matches — the earlier
// "since I was 11" line doesn't contain the "age 11" marker.
const AGE_TAG_MARKER = "age 11";

function withAgeTag(para: string) {
  const idx = para.indexOf(AGE_TAG_MARKER);
  if (idx === -1) return para;
  return (
    <>
      {para.slice(0, idx)}
      <Image
        src="/age-11-tag.png"
        alt="Age 11"
        width={182}
        height={127}
        // Smaller multiple than the preview's 3.6em: this column's type is smaller and its
        // line-height tighter (1.5), so a tag at that size would visibly push its own line apart.
        style={{ display: "inline-block", verticalAlign: "middle", height: "3.1em", width: "auto" }}
      />
      {para.slice(idx + AGE_TAG_MARKER.length)}
    </>
  );
}

function StoryFull({ highlightCosmos, cosmosRef, onClose, isMobile }: { highlightCosmos: boolean; cosmosRef: React.RefObject<HTMLParagraphElement | null>; onClose: () => void; isMobile: boolean }) {
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
          {/* CSS multi-column, not two hand-split arrays. The story was previously sliced into a
              fixed LEFT/RIGHT pair at a chosen index, which meant the two columns only lined up if
              that index happened to balance them — it didn't, and any edit to the copy would throw
              it off again. `columns-2` lets the browser fill and BALANCE the two columns itself,
              so they always end at the same depth no matter how the paragraphs change.
              break-inside-avoid on each paragraph stops one being split across the column gap. */}
          <div
            className="columns-1 md:columns-2 max-md:px-5 max-md:pb-7"
            style={{
              columnGap: "clamp(28px,4vw,64px)",
              fontFamily: "var(--font-archivo)", fontWeight: 400,
              fontSize: "clamp(14px,1.05vw,17px)", lineHeight: 1.5, color: "#0D0D0D",
            }}
          >
            {STORY_PARAGRAPHS.map((para, i) => {
              // Already shown in the mobile preview — see MOBILE_RESUME_AT.
              if (isMobile && i < MOBILE_RESUME_AT) return null;
              const isCosmos = i >= COSMOS_START && i <= COSMOS_END;
              return (
              <motion.p
                key={i}
                // Scroll target is the FIRST Cosmos paragraph, so the Shop link lands at the top
                // of the highlighted block rather than partway through it.
                ref={i === COSMOS_START ? cosmosRef : undefined}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="break-inside-avoid"
                style={{ marginBottom: "1.3em", whiteSpace: "pre-line" }}
              >
                {/* Only the two Cosmos paragraphs get the highlight — the "Love you Mom & Dad!"
                    sign-off after them stays plain, as does everything above. Black by default;
                    turns blue only when reached via the Shop link's auto-open-and-scroll flow
                    (see OriginsSection). */}
                {isCosmos ? (
                  <span
                    style={{
                      backgroundColor: highlightCosmos ? "rgba(4,86,221,0.22)" : "rgba(4,86,221,0)",
                      // box-decoration-break keeps the "highlighter" padding consistent on every
                      // wrapped line of this span, instead of only the first/last line getting
                      // the extra breathing room.
                      boxDecorationBreak: "clone",
                      WebkitBoxDecorationBreak: "clone",
                      padding: "0.05em 0.15em",
                      borderRadius: 3,
                      transition: "background-color 0.6s ease",
                    }}
                  >
                    {para}
                  </span>
                ) : withAgeTag(para)}
              </motion.p>
              );
            })}
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

  // Scroll position at the moment the story was opened, so closing can put the reader back exactly
  // where they clicked "Read More" (see closeStory).
  const openScrollYRef = useRef(0);

  const openStory = () => {
    openScrollYRef.current = window.scrollY;
    setStoryOpen(true);
  };

  // Closing the expanded story removes a LOT of in-flow height (desktop renders StoryFull inline).
  // Left alone the browser keeps the current scrollY, which is usually now past the end of the
  // much shorter document — so it clamps, and the reader is thrown somewhere they never chose.
  //
  // This used to answer that by scrolling to the top of the section, which is the "it moves up"
  // being reported: deliberate, but it discards where the reader actually was. Restoring the exact
  // scrollY captured in openStory is better — the page collapses and the reader is left looking at
  // the same thing they were looking at when they clicked Read More. That position is always valid
  // for the collapsed layout, since it was recorded while collapsed.
  //
  // Instant, not animated: any easing here would read as the very drift this is meant to remove.
  // Routed through Lenis (window.__lenis) when present so its internal target stays in sync — a
  // bare window.scrollTo would be overwritten by Lenis on the next frame.
  const closeStory = () => {
    // Only desktop needs the restore: there StoryFull renders IN-FLOW, so collapsing it is what
    // removes the height. On mobile it's a fixed bottom sheet with the page scroll-locked in place
    // underneath, so nothing moved and there's nothing to put back.
    setStoryOpen(false);
    if (isMobile) return;
    const y = openScrollYRef.current;
    requestAnimationFrame(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).__lenis;
      if (lenis?.scrollTo) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
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
      // Same capture as the Read More button (openStory): the Shop flow opens the story too, so
      // without this, closing afterwards would restore a stale position from an earlier open.
      openScrollYRef.current = window.scrollY;
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
          ? <StoryFull key="full" highlightCosmos={highlightCosmos} cosmosRef={cosmosRef} onClose={closeStory} isMobile={false} />
          : <StoryPreview key="preview" onReadMore={openStory} />}
      </AnimatePresence>

      {isMobile && (
        <AnimatePresence>
          {storyOpen && (
            <StoryFull key="full-mobile" highlightCosmos={highlightCosmos} cosmosRef={cosmosRef} onClose={closeStory} isMobile />
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
        <div className="hidden md:flex justify-center" style={{ marginTop: "clamp(-16px,-1.5vw,-8px)" }}>
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
