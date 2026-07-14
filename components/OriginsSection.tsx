"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { SweepText } from "@/components/SweepText";

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
        style={{ gap: "clamp(40px,6vw,96px)", alignItems: "stretch" }}
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
            <Image
              src="/age-11-tag.png"
              alt="Age 11"
              width={182}
              height={127}
              style={{ display: "inline-block", verticalAlign: "middle", height: "3.6em", width: "auto" }}
            />
            . Not in a drawer  in my mind. I drew it in 9th grade, in the back of a classroom after a friend showed me a new way to draw 3D text. I tried it in my own way and what came out was a four-pointed star I didn&rsquo;t fully understand yet, I still don&rsquo;t think I do, but I&rsquo;ve carried it for over two decades  and at some point, carrying an idea this long becomes a responsibility.
            <br />That&rsquo;s reason number one to establish Switchblade.
            <br />Reason number two is simpler. You get one life. I&rsquo;ve spent enough time waiting to know everything before I begin. I don&rsquo;t have it 100% figured out. But I have confidence in my taste which I would like to share with the World and I&rsquo;ve decided to walk this path with faith and find out the rest as I go. If I hold out for the ideal moment when all conditions are perfect, I will end up never starting.
          </p>
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
        </div>

        <button
          type="button"
          onClick={onReadMore}
          className="inline-flex items-center rounded-lg text-white font-medium hover:opacity-85 transition-opacity"
          style={{ background: "#FF802B", fontFamily: "var(--font-archivo)", fontSize: 15, padding: "10px 22px", marginTop: "clamp(16px,2.5vw,28px)", border: "none", cursor: "pointer" }}
        >
          Read More
        </button>
      </div>
      </div>
    </motion.div>
  );
}

function StoryFull() {
  return (
    <motion.div
      key="full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "clamp(28px,4vw,64px)" }}>
        {[STORY_LEFT, STORY_RIGHT].map((col, colIdx) => (
          <div key={colIdx} style={{ fontFamily: "var(--font-archivo)", fontWeight: 400, fontSize: "clamp(14px,1.05vw,17px)", lineHeight: 1.5, color: "#0D0D0D" }}>
            {col.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (colIdx * col.length + i) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ marginBottom: "1.3em", whiteSpace: "pre-line" }}
              >
                {para}
              </motion.p>
            ))}
          </div>
        ))}
      </div>

      <p style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "clamp(18px,1.6vw,24px)", marginTop: "clamp(20px,2.5vw,32px)", color: "#0D0D0D" }}>
        - Sanjam
      </p>
    </motion.div>
  );
}

export function OriginsSection() {
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <section id="origins-section" className="site-px" style={{ background: "#ffffff", paddingTop: "clamp(56px,9vw,110px)", paddingBottom: "clamp(96px,9vw,160px)" }}>
      <div className="flex items-end justify-center flex-wrap" style={{ gap: "clamp(16px,2vw,28px)", marginBottom: "clamp(24px,3.5vw,44px)" }}>
        <h2 style={{
          position: "relative",
          fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(40px,7vw,96px)",
          lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase",
        }}>
          <SweepText tone="dark" color="#0D0D0D">The Origins</SweepText>
        </h2>
        <p style={{
          fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "clamp(13px,1.1vw,16px)",
          lineHeight: 1.3, letterSpacing: "-0.01em", textTransform: "uppercase", color: "#0D0D0D",
          marginBottom: "clamp(6px,1vw,14px)",
        }}>
          [A Story Before<br />The Brand]
        </p>
      </div>

      <AnimatePresence mode="wait">
        {storyOpen
          ? <StoryFull key="full" />
          : <StoryPreview key="preview" onReadMore={() => setStoryOpen(true)} />}
      </AnimatePresence>

      {/* Placed after the full story text (below the "- Sanjam" sign-off) rather than up by the
          heading — it used to sit absolutely-positioned there, which overlapped the heading's
          subtitle once that row wrapped on mobile. Here it's just a normal block after the
          content, so it can't overlap anything regardless of viewport width. */}
      {storyOpen && (
        <div className="flex justify-center" style={{ marginTop: "clamp(24px,3vw,36px)" }}>
          <button
            type="button"
            onClick={() => setStoryOpen(false)}
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
