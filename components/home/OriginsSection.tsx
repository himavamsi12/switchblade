"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SweepText } from "@/components/shared/SweepText";
import { SHOP_HIGHLIGHT_EVENT, SHOP_HIGHLIGHT_KEY } from "@/components/shared/SiteNav";
import { beginShopDeepLink, endShopDeepLink } from "@/components/shared/shopDeepLink";

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
// scroll target works off index instead (see COSMOS_START below).
const STORY_PARAGRAPHS = [
  "There\u2019s a book I was reading, The Creative Act by Rick Rubin. He writes about how good ideas exist around us like signals in the air and the human antenna catches them. When you think of something and see it come to life later through someone else\u2019s hands, you wonder. But the truth is good ideas are bound to exist and they move towards the people willing to receive them and bring them to life.",
  "I read that and something settled in me. This logo has lived with me since I was 11. Not in a drawer \u2014 in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn\u2019t fully understand yet, I still don\u2019t think I do, but I\u2019ve carried it for over two decades \u2014 and at some point, carrying an idea this long becomes a responsibility.",
  "That\u2019s reason number one to establish Switchblade.",
  "Reason number two is simpler. You get one life. I\u2019ve spent enough time waiting to know everything before I begin. I don\u2019t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I\u2019ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.",
  "I want to be honest from the start \u2014 that\u2019s the only way I know how to do this.",
  "I am inspired by neatness, practicality & innovation. Palace Skateboards, JJJJound, Stone Island, Stussy, KITH, Oakley \u2014 these are brands I have immense respect for and they have shaped how I think about what a brand can be.",
  "And I owe transparency about something - when I drew this logo at age 11 I had no idea what Stone Island\u2019s logo looked like and when I discovered the resemblance a couple of years ago,I had sleepless nights. I still think about it. But I believe the people at Stone Island would understand and I\u2019m certain that Massimo Osti would. They all will always be light years ahead of Switchblade. They will always keep inspiring me. And I genuinely hope someday we work together with them that have made possible for Switchblade to exist.",
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

// The Cosmos block is the last two paragraphs before the "Love you Mom & Dad!" sign-off — the
// Shop link's auto-open-and-scroll flow scrolls to COSMOS_START and turns this highlight on
// (see highlightCosmos in OriginsSection/StoryFull); it stays off otherwise.
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

// A brief "start reading here" highlight for the sentence the mobile preview cut off at, so a
// reader who's just opened the full story can find their place instead of re-reading from the
// top. Only this span — not scroll/toggle-triggered like the Cosmos highlight — and it fades out
// on its own after READ_HERE_MS (see the showReadHere state in StoryFull), it isn't a permanent
// marker like the Cosmos one.
const READ_HERE_START = "when I drew this logo at";
const READ_HERE_END   = " understand";
const READ_HERE_MS = 4000;

// The scroll position that frames this section the way a reader should first meet it: the heading
// row sitting just under the top of the viewport, heading and founder photo on screen together.
//
// Targets the HEADING ROW rather than the #origins-section box, because the section carries its
// own clamp(180px,14vw,320px) top padding — landing on the box's top just puts that whole padding
// band on screen above the heading, i.e. the same dead space, only now inside the section.
//
// Shared by both places that need to "arrive" here: the Shop deep-link jump, and closing the
// expanded story (which collapses a lot of in-flow height and otherwise leaves the reader
// mid-section). Measure this AFTER any layout change, since it reads live geometry.
const ORIGINS_HEADROOM = 24;
function originsFramedScrollY(): number | null {
  const el = document.getElementById("origins-heading-row");
  if (!el) return null;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - ORIGINS_HEADROOM);
}

// Where the SHOP deep-link lands: the top of the expanded story's text body, one step further
// down than the framed heading shot above. Shop's whole purpose is to drop the reader INTO the
// story (it auto-opens it and highlights the Cosmos block further down), so landing on the
// heading + founder photo meant an extra scroll before any of that was even on screen. Falls back
// to the framed shot if the body isn't mounted yet — it only exists while the story is open.
function originsStoryScrollY(): number | null {
  const el = document.getElementById("origins-story-body");
  if (!el) return originsFramedScrollY();
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - ORIGINS_HEADROOM);
}

// Desktop renders these in two columns, but there's no LEFT/RIGHT split here on purpose — the
// paragraphs are handed to CSS `columns-2` as one list and the browser balances them (see
// StoryFull). A hand-picked split index only lines the columns up by luck, and goes stale the
// moment the copy is edited.

function StoryPreview({ onReadMore }: { onReadMore: () => void }) {
  // Desktop only: match the image's height to the text column's LIVE rendered height (measured,
  // not guessed) instead of either extreme this went through before —
  //   1) grid alignItems:stretch made the box match text height, but at the box's fixed COLUMN
  //      WIDTH that ratio was far narrower than the photo's own (0.8), so object-cover had to
  //      scale up to cover the height and crop deep into the sides (the original "cutting" bug).
  //   2) aspect-[932/1166] fixed the crop but let the box grow to whatever height that ratio gives
  //      at the column's width, which is TALLER than the text — the image ran on past it.
  // Capping height to the measured text height, keeping the aspect-ratio class as the pre-measurement
  // fallback (so there's no flash before JS runs), is what lets both hold at once: no crop bug (2),
  // and no overshoot past the text (this fix). Any crop that DOES occur under this cap is anchored
  // to the top via objectPosition below, so it trims from the bottom/feet, never the head.
  const textColRef = useRef<HTMLDivElement>(null);
  const [imgHeight, setImgHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (window.innerWidth < 768) return; // mobile stacks single-column; aspect-ratio class governs
    const el = textColRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setImgHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      {/* aspect-[932/1166] (the photo's own ratio) is the pre-measurement / mobile fallback ONLY —
          it's dropped entirely once imgHeight is known, not just overridden. Per spec, once one
          axis (height) is definite, aspect-ratio computes the OTHER axis (width) from it rather
          than letting grid's normal stretch fill the column — that's what shrank the box's width
          and opened a gap before it reached the text column. width:"100%" (only once measured)
          forces it back to the column's full track width regardless. alignSelf:"start" keeps it
          pinned to the top of the row either way, never centered or stretched. */}
      <div
        className={imgHeight ? "" : "aspect-[932/1166]"}
        style={{
          position: "relative", alignSelf: "start", minHeight: "280px", overflow: "hidden",
          height: imgHeight ? `${imgHeight}px` : undefined,
          width: imgHeight ? "100%" : undefined,
        }}
      >
        {/* .jpg, not .png — it's a photograph, so PNG's lossless encoding cost 1.6MB in the repo
            for no visible benefit over a quality-94 JPEG at 197KB. objectPosition "50% 0%" anchors
            any crop (from the height cap above) to the TOP — so the crop trims off the bottom of
            the photo, never the boy's head/face at the top. */}
        <Image src="/founder-childhood.jpg" alt="Sanjam, founder of Switchblade, as a child" fill className="object-cover" style={{ objectPosition: "50% 0%" }} sizes="530px" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0) 35%)" }} />
        <div style={{ position: "absolute", left: "clamp(16px,2vw,24px)", bottom: "clamp(16px,2vw,24px)" }}>
          <p style={{ fontFamily: "var(--font-ibm-mono)", fontWeight: 600, fontSize: 13, letterSpacing: "0.06em", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>FOUNDER</p>
          <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(24px,2.8vw,34px)", letterSpacing: "-0.01em", textTransform: "uppercase", color: "#fff" }}>SANJAM</p>
        </div>
      </div>

      {/* alignSelf:"start" is the actual fix for the image still measuring too tall: the grid's
          alignItems:"stretch" (set on the parent above) was stretching THIS column to match the
          row height too — and the row height was set by the image's own tall pre-measurement
          aspect-ratio box. So the ResizeObserver was reading back the STRETCHED height (which
          already equalled the oversized image), not this column's true content height — a
          feedback loop that pinned the image at its original size instead of shrinking it.
          Un-stretching this column gives it its real, shorter, content-only height to measure. */}
      <div ref={textColRef} style={{ alignSelf: "start" }}>
        <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.2, color: "#0D0D0D" }}>
          <p style={{ marginBottom: "1.4em" }}>
            There&rsquo;s a book I was reading , The Creative Act by Rick Rubin. He writes about how good ideas exist around us like signals in the air and the human antenna catches them. When you think of something and see it come to life later through someone else&rsquo;s hands, you wonder.
          </p>
          <p style={{ marginBottom: "1.4em" }}>
            But the truth is, good ideas are bound to exist and they move towards the people willing to receive them and bring them to life.
          </p>
          <p>
            I read that and something settled in me. This logo has lived with me since I was{" "}
            {/* Shown at EVERY size now. Mobile used to swap this tag image for plain "......." and
                cut the preview off here, with its own inline Read More — mobile now runs the same
                preview as desktop, all the way to the "when I ..." cut-off below. */}
            {/* nowrap wrapper keeps the sentence's closing period glued to the tag. The tag sits
                at the very end of its line, so without this the browser is free to break between
                the image and the ".", stranding a lone full stop at the start of the next line. */}
            <span style={{ whiteSpace: "nowrap" }}>
              <Image
                src="/age-11-tag.png"
                alt="Age 11"
                width={182}
                height={127}
                className="inline-block"
                // Negative vertical margins cancel the tag's height (2.8em) against this
                // paragraph's own 1.2em line-height — without them the browser grows just this
                // one line's box to fit the tag, reading as extra gap above/below only this line
                // versus every other line in the paragraph (see the matching fix on the full-story
                // version of this tag, `withAgeTag` below).
                style={{ verticalAlign: "middle", height: "2.8em", width: "auto", marginTop: "-0.8em", marginBottom: "-0.8em" }}
              />.
            </span>
            <br/>
            <br />
            <span>
              Not in a drawer  in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn&rsquo;t fully understand yet, I still don&rsquo;t think I do, but I&rsquo;ve carried it for over two decades  and at some point, carrying an idea this long becomes a responsibility.
              <br /><br />That&rsquo;s reason number one to establish Switchblade.
              <br /><br />Reason number two is simpler. You get one life. I&rsquo;ve spent enough time waiting to know everything before I begin. I don&rsquo;t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I&rsquo;ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.
            </span>
          </p>
          <p style={{ marginTop: "1.4em" }}>
            I want to be honest from the start,  that&rsquo;s the only way I know how to do this.
            <br />I am inspired by neatness, practicality &amp; innovation. Palace Skateboards, JJJJound, Stone Island, Stussy, KITH, Oakley — these are brands I have immense respect for and they have shaped how I think about what a brand can be.
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

// Same swap-at-render approach as the age tag above, for the "…explore Switchblade Classics."
// sign-off — turns just that phrase into a link to the Classics page without splitting the
// sentence apart in the source array.
const CLASSICS_LINK_MARKER = "Switchblade Classics";

function withAgeTag(para: string) {
  const classicsIdx = para.indexOf(CLASSICS_LINK_MARKER);
  if (classicsIdx !== -1) {
    return (
      <>
        {para.slice(0, classicsIdx)}
        <Link href="/classics" style={{ color: "#0456DD", textDecoration: "underline" }}>
          {CLASSICS_LINK_MARKER}
        </Link>
        {para.slice(classicsIdx + CLASSICS_LINK_MARKER.length)}
      </>
    );
  }

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
        // line-height tighter (1.5). Even at 3.1em the tag is still taller than the paragraph's
        // own 1.5em line-height, so the browser was growing just THIS line's box to fit it —
        // reading as extra gap above and below this one line versus every other line in the
        // paragraph. Negative vertical margins cancel that growth (pulling the line box back down
        // to its normal 1.5em) without shrinking the tag image itself, which keeps its visible
        // size but stops it from disturbing the paragraph's rhythm.
        style={{ display: "inline-block", verticalAlign: "middle", height: "3.1em", width: "auto", marginTop: "-0.8em", marginBottom: "-0.8em" }}
      />
      {para.slice(idx + AGE_TAG_MARKER.length)}
    </>
  );
}

function StoryFull({ highlightCosmos, cosmosRef, onClose, isMobile }: { highlightCosmos: boolean; cosmosRef: React.RefObject<HTMLParagraphElement | null>; onClose: () => void; isMobile: boolean }) {
  // On (fresh mount every time Read More opens), off after READ_HERE_MS — a one-shot "start
  // reading here" cue, not a persistent marker.
  const [showReadHere, setShowReadHere] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShowReadHere(false), READ_HERE_MS);
    return () => window.clearTimeout(t);
  }, []);

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

        {/* min-h-0: without it, this flex child (in the flex-col sheet above) defaults to
            min-height:auto — its own CONTENT height — so it never actually shrinks to fit the
            sheet's maxHeight, and overflowY:auto never gets a bounded box to scroll within.
            Content (like the "- Sanjam" sign-off at the very end) just overflowed silently past
            the fixed sheet instead of being reachable by scrolling. Same fix as HelpModal.tsx's
            lg:min-h-0 on its own form column. */}
        <div className="md:contents min-h-0" style={{ overflowY: "auto" }}>
          {/* CSS multi-column, not two hand-split arrays. The story was previously sliced into a
              fixed LEFT/RIGHT pair at a chosen index, which meant the two columns only lined up if
              that index happened to balance them — it didn't, and any edit to the copy would throw
              it off again. `columns-2` lets the browser fill and BALANCE the two columns itself,
              so they always end at the same depth no matter how the paragraphs change.
              break-inside-avoid on each paragraph stops one being split across the column gap. */}
          <div
            // Scroll target for the Shop deep-link — it lands on the story BODY rather than the
            // section heading, so the reader arrives already reading (see originsStoryScrollY).
            id="origins-story-body"
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
              // Only the "And I owe transparency..." paragraph carries the READ_HERE_START
              // marker — the sentence the mobile preview cut off at, so this is where a reader
              // opening the full story actually needs the "start here" cue.
              const readHereIdx = para.indexOf(READ_HERE_START);
              // box-decoration-break keeps the "highlighter" padding consistent on every wrapped
              // line of a span, instead of only the first/last line getting the extra breathing
              // room — shared by both highlight styles below.
              const highlightBase: React.CSSProperties = {
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
                padding: "0.05em 0.15em",
                borderRadius: 3,
                transition: "background-color 0.6s ease",
              };
              const highlightStyle: React.CSSProperties = {
                ...highlightBase,
                backgroundColor: showReadHere ? "rgba(4,86,221,0.22)" : "rgba(4,86,221,0)",
              };
              // Only the two Cosmos paragraphs — highlighted only once the Shop link's
              // auto-open-and-scroll flow has actually reached them (highlightCosmos), unlike
              // the "read here" cue above which is on immediately and fades on its own.
              const isCosmos = i >= COSMOS_START && i <= COSMOS_END;
              const cosmosStyle: React.CSSProperties = {
                ...highlightBase,
                backgroundColor: highlightCosmos ? "rgba(4,86,221,0.22)" : "rgba(4,86,221,0)",
              };
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
                {readHereIdx !== -1 ? (
                  // The highlighted span runs from READ_HERE_START up to (not including)
                  // READ_HERE_END — everything before and after stays plain, so only the
                  // sentence the mobile preview cut off at gets the "start here" cue.
                  (() => {
                    const endIdx = para.indexOf(READ_HERE_END, readHereIdx);
                    const highlighted = endIdx === -1 ? para.slice(readHereIdx) : para.slice(readHereIdx, endIdx);
                    const tail = endIdx === -1 ? "" : para.slice(endIdx);
                    return (
                      <>
                        {para.slice(0, readHereIdx)}
                        <span style={highlightStyle}>{withAgeTag(highlighted)}</span>
                        {tail}
                      </>
                    );
                  })()
                ) : isCosmos ? (
                  <span style={cosmosStyle}>{withAgeTag(para)}</span>
                ) : withAgeTag(para)}
                {/* Signature sits INSIDE the last paragraph's own block (not a separate element
                    after the columns div) so it's guaranteed to render directly under "Love you
                    Mom & Dad!" regardless of which column that line balances into — a standalone
                    paragraph after the two-column block could land under whichever column ended
                    up taller, not necessarily this one. */}
                {i === STORY_PARAGRAPHS.length - 1 && (
                  <span
                    className="uppercase"
                    style={{
                      display: "block", fontFamily: "var(--font-barlow)", fontWeight: 900,
                      fontSize: "clamp(18px,1.6vw,24px)", letterSpacing: "-0.01em",
                      marginTop: "clamp(20px,2.5vw,32px)", color: "#0D0D0D",
                    }}
                  >
                    - Sanjam
                  </span>
                )}
              </motion.p>
              );
            })}
          </div>
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

  const openStory = () => {
    setStoryOpen(true);
  };

  // Closing the expanded story removes a LOT of in-flow height (desktop renders StoryFull inline).
  // Left alone the browser keeps the current scrollY, which is usually now past the end of the
  // much shorter document — so it clamps, and the reader is thrown somewhere they never chose.
  //
  // Re-frames the section (originsFramedScrollY) rather than restoring the scrollY captured when
  // Read More was clicked. That restore looked right on paper — "put them back where they were" —
  // but "Read More" sits at the BOTTOM of the preview, so reaching it means the reader has already
  // scrolled the section's heading up off the top of the screen. Returning them to that exact
  // offset left the collapsed section straddling the viewport with its heading cut off, which is
  // the "not fit in screen" being reported. Framing it puts the heading and founder photo back on
  // screen together, the same resting shot the Shop deep-link lands on.
  //
  // Measured inside the rAF, i.e. AFTER the collapse has been laid out — measuring before it would
  // read the still-expanded geometry and land far too low.
  //
  // Instant, not animated: any easing here would read as the very drift this is meant to remove.
  // Routed through Lenis (window.__lenis) when present so its internal target stays in sync — a
  // bare window.scrollTo would be overwritten by Lenis on the next frame.
  const closeStory = () => {
    // Only desktop needs this: there StoryFull renders IN-FLOW, so collapsing it is what removes
    // the height. On mobile it's a fixed bottom sheet with the page scroll-locked in place
    // underneath, so nothing moved and there's nothing to put back.
    setStoryOpen(false);
    if (isMobile) return;
    requestAnimationFrame(() => {
      const y = originsFramedScrollY();
      if (y === null) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).__lenis;
      if (lenis?.scrollTo) lenis.scrollTo(y, { immediate: true, force: true });
      // Object form + explicit behavior:"instant" — the legacy (x, y) form here would silently
      // inherit globals.css's site-wide `scroll-behavior: smooth` and animate through every
      // pinned section between the current position and y, which is exactly the drift this
      // is supposed to prevent.
      else window.scrollTo({ top: y, behavior: "instant" });
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
      // Tell the sections between here and the top to skip their scroll-freezing entrance holds
      // for this landing — set BEFORE the jump below, which is what trips their triggers. This is
      // the single entry point for the flow, so it covers both ways it can start (full navigation
      // from another page, and a click while already on the homepage). See shopDeepLink.ts.
      beginShopDeepLink();

      // Jumping scrollY instantly (see scrollToCosmos below) does NOT mean the page instantly
      // looks right. Every pinned section between the top of the page and Cosmos (Hero, "A Mark
      // That Radiates", the SWITCHBLADE wordmark reveal, the globe travel) is driven by a
      // scroll-SCRUBBED GSAP tween — several with a numeric `scrub` lag (their deliberate, tuned
      // smoothing for normal scrolling). A scrub tween doesn't snap its own playhead to match a
      // sudden scroll jump; it eases toward the new progress over that lag, same as it would for
      // a real scroll. So an instant scrollY jump from the very top still played out as every one
      // of those tweens visibly catching up in sequence — heading fading, star repositioning,
      // wordmark revealing, globe travel — which is exactly the "stopping in each section" look,
      // even though the scroll POSITION itself never animated. Retuning every scrub value across
      // several independently-authored sections to react instantly would be invasive and risks
      // breaking their normal-scroll feel. Simpler and non-invasive: hide the viewport behind a
      // plain white cover for the brief moment all of that catch-up actually happens, then reveal
      // once it's done — the reader never sees the in-between state, only the direct cut.
      const cover = document.createElement("div");
      cover.style.cssText = "position:fixed;inset:0;z-index:2500;background:#fff;opacity:0;transition:opacity 0.15s ease;pointer-events:none;";
      document.body.appendChild(cover);
      requestAnimationFrame(() => { cover.style.opacity = "1"; });
      let revealed = false;
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        cover.style.opacity = "0";
        window.setTimeout(() => cover.remove(), 200);
      };
      // Absolute worst case (something above never settles) — never leave the reader staring at
      // a blank white screen forever.
      window.setTimeout(reveal, 7000);

      setStoryOpen(true);
      // Plain scrollIntoView fights Lenis on desktop (same issue closeStory routes around below,
      // and the reason SmoothScroll.tsx exposes window.__lenis in the first place): Lenis owns
      // scroll there and re-applies its OWN target every animation frame, so a native
      // scrollIntoView call gets silently overwritten back to wherever Lenis last thought the
      // scroll was — the highlight would turn on (a plain state update) but the viewport never
      // actually moved. Asking Lenis itself to scroll to the element's position keeps it in sync
      // instead of racing it. Mobile has no Lenis instance (see SmoothScroll.tsx), so the
      // scrollIntoView fallback covers that case exactly as before.
      // instant=true for every pass AFTER the first: an instant re-center is an imperceptible
      // blip if the target barely moved, whereas re-triggering a full eased 1.2s animation on
      // every corrective pass (the original bug here) reads as the scroll repeatedly decelerating
      // and re-accelerating section by section — "sticky", not smooth. Only the very first pass
      // should be the one animated journey the reader actually watches.
      // Lands on the story BODY (originsStoryScrollY — see its own comment), so Shop drops the
      // reader straight into the text it just opened. Deliberately NOT cosmosRef centered in the
      // viewport: that paragraph sits deep in a tall single section (heading, hero photo, and most
      // of the story all come before it), so centering it put roughly a section-and-a-half of
      // content above the target — a mid-scroll no-man's-land with nothing reading as "arrived".
      // The highlighted Cosmos paragraphs are simply further down in the same reading flow.
      const scrollToCosmos = (instant = false) => {
        const targetY = originsStoryScrollY();
        if (targetY === null) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lenis = (window as any).__lenis;
        if (lenis?.scrollTo) {
          // force:true is essential, not defensive — Lenis IGNORES scrollTo entirely while it is
          // stopped (its `force` option defaults to false), and this page deliberately calls
          // lenis.stop() from two different entrance holds on the way down (RadiatesSection,
          // ParagraphReveal). Those are now skipped on a deep-link (see shopDeepLink.ts), but any
          // future/edge-case stop would otherwise make these jumps silently no-op — the exact
          // failure mode that left the reader stranded partway down the page.
          lenis.scrollTo(targetY, instant ? { duration: 0, force: true } : { duration: 1.2, force: true });
        } else if (instant) {
          // The legacy (x, y) form of scrollTo always follows the page's CSS scroll-behavior —
          // and globals.css sets `html { scroll-behavior: smooth }` site-wide. Calling it that
          // way here silently turned this "instant" jump into a real native smooth-scroll THROUGH
          // every pinned ScrollTrigger section on the way down (RadiatesSection, ParagraphReveal)
          // — each pin holding the view still while the native scroll eats through its spacer is
          // exactly what read as "stopping in each section." The object form's explicit
          // behavior:"instant" overrides the CSS default and actually jumps, no travel through
          // anything in between.
          window.scrollTo({ top: targetY, behavior: "instant" });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      };
      // Polls the paragraph's DOCUMENT position (not viewport-relative — this section isn't
      // scrolling yet during the poll, so window.scrollY is stable and rect.top + scrollY reads
      // as a fixed page coordinate) instead of firing the scroll on a blind fixed delay.
      // Everything ABOVE the Cosmos paragraph (hero media, other section images, the founder
      // photo, embedded 3D canvases, web fonts) can still be loading/reflowing well after this
      // component mounts, each reflow shifting where the paragraph actually sits — a fixed delay
      // either fired too early (landed correctly for that instant, then got carried away from the
      // target as more content above finished loading and pushed it further down) or, if long
      // enough to be safe, made every click feel sluggish. Polling until the measured position
      // stops moving between two consecutive checks means it scrolls the moment layout has
      // ACTUALLY settled, whether that's 200ms or 3s in, and gives up after a generous 6s cap so a
      // pathological page still always ends up scrolling somewhere rather than never firing.
      let lastY: number | null = null;
      let stableTicks = 0;
      let elapsed = 0;
      const POLL_MS = 150;
      const STABLE_TICKS_NEEDED = 2;
      const MAX_MS = 6000;
      const poll = () => {
        const el = cosmosRef.current;
        if (!el) { window.setTimeout(poll, POLL_MS); elapsed += POLL_MS; return; }
        const y = el.getBoundingClientRect().top + window.scrollY;
        if (lastY !== null && Math.abs(y - lastY) < 1) {
          stableTicks++;
        } else {
          stableTicks = 0;
        }
        lastY = y;
        elapsed += POLL_MS;
        if (stableTicks >= STABLE_TICKS_NEEDED || elapsed >= MAX_MS) {
          // instant=true, always — by request. This flow is triggered from Shop, often from a
          // full page navigation (another page → home), and an animated multi-second scroll
          // through every intervening section (hero, "A Mark That Radiates", the wordmark, the
          // globe...) read as "stopping in every section on the way" even once each individual
          // leg was smooth — the reader doesn't want a guided tour, they want to just land on the
          // Cosmos block immediately. A straight instant jump shows the destination directly, no
          // scroll journey at all.
          scrollToCosmos(true);
          setHighlightCosmos(true);
          // Reveal once the jump has landed AND a brief buffer has let every scrub tween's own
          // catch-up (see the cover's creation above) actually finish while still hidden. 350ms
          // comfortably covers this page's scrub lag values (all well under 1s) without leaving
          // the reader staring at blank white for long.
          window.setTimeout(reveal, 350);
          // Several corrective passes, not just one — on a COLD first load (uncached JS chunks,
          // slower parse/hydrate) the sections above this one (RadiatesSection's pinned
          // ScrollTriggers especially) can keep reflowing well past the point the poll judged
          // things "stable", each reflow silently carrying the target further down the page. A
          // single 800ms follow-up wasn't always late enough to catch the last of those shifts,
          // which is why this only ever landed short on the very first load of the session (a
          // second click right after has everything already warm/settled). All instant, same as
          // the initial jump — never a re-animated scroll, just a silent re-snap if anything
          // above has shifted since.
          [400, 900, 1600, 2600, 4000].forEach(ms => window.setTimeout(() => scrollToCosmos(true), ms));
          // Landing is over — let the rest of the session behave normally (the entrance holds
          // this suppressed are "once only" anyway, so this mainly keeps the flag honest).
          window.setTimeout(endShopDeepLink, 4200);
        } else {
          window.setTimeout(poll, POLL_MS);
        }
      };
      // Deliberately not started synchronously — a beat to let setStoryOpen(true) actually commit
      // and StoryFull mount before the first measurement, same reasoning the old fixed-delay
      // version had for its initial wait.
      window.setTimeout(poll, 200);
    };

    // 1. Clicked from another page: Link does a full navigation, so this component mounts
    //    fresh — sessionStorage (set right before that navigation) survives the reload, checked
    //    once here on mount.
    if (sessionStorage.getItem(SHOP_HIGHLIGHT_KEY) === "1") {
      sessionStorage.removeItem(SHOP_HIGHLIGHT_KEY);
      run();
    }

    // 2. Clicked while already on the homepage: Next.js's <Link> does a client-side navigation
    //    WITHOUT a full reload, so this component never remounts and the mount-only check above
    //    would silently never fire. Listening for the live event instead means it fires
    //    regardless of whether a reload happened, as long as this component is still mounted.
    const onEvent = () => { run(); };
    window.addEventListener(SHOP_HIGHLIGHT_EVENT, onEvent);

    return () => {
      window.removeEventListener(SHOP_HIGHLIGHT_EVENT, onEvent);
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
      {/* id used as the Shop-flow's scroll target (see scrollToCosmos in the effect above) —
          the SECTION's own box (#origins-section) includes its own clamp(180px,14vw,320px) top
          padding, so landing on that box's top left that whole padding band as dead space above
          the heading. This row is the first thing actually meant to be visible. */}
      <div id="origins-heading-row" className="flex items-end justify-center flex-wrap" style={{ gap: "clamp(8px,1vw,14px)", marginBottom: "clamp(48px,5vw,72px)" }}>
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
        <div className="hidden md:flex justify-center" style={{ marginTop: "clamp(24px,3vw,40px)" }}>
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
