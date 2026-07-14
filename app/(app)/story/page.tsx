"use client";
import Image from "next/image";
import { StarLogo } from "@/components/content/StarLogo";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/content/ScrollReveal";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SweepText } from "@/components/shared/SweepText";

export default function StoryPage() {
  return (
    <>
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        <Image src="https://picsum.photos/seed/story-hero/1920/1080" alt="The Story" fill priority className="object-cover grayscale" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white" />
        <div className="relative z-10 container-site pb-20 pt-32">
          <ScrollReveal>
            <span className="t-label text-[#6B7280]">The Story</span>
          </ScrollReveal>
          <h1 className="t-display mt-5 max-w-3xl"><SweepText tone="dark" color="#111111">Born from a child&apos;s vision.</SweepText></h1>
          <p className="t-body text-[#6B7280] mt-6 max-w-xl">The origin, the mark, and the philosophy. Two decades in the making.</p>
        </div>
      </section>

      <section className="bg-white section-gap">
        <div className="container-site grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          <div>
            <ScrollReveal>
              <span className="t-label text-[#6B7280]">The Mark</span>
            </ScrollReveal>
            <h2 className="t-heading mt-4"><SweepText tone="dark" color="#111111">A logo conceived at 11. Trademarked two decades later.</SweepText></h2>
            <ScrollReveal delay={0.08}>
              <div className="rule mt-8 mb-8" />
              <p className="t-body text-[#6B7280]">The logo has existed for over two decades — conceived at age 11 and carried forward as a personal mark of identity. It has never been sold. Never been diluted. It is the legacy. The logo is not decoration; it is the soul of the brand. Now trademarked and ready for the world.</p>
            </ScrollReveal>
          </div>

          <div className="flex flex-col gap-10">
            <ScrollReveal delay={0.15} className="flex justify-center lg:justify-start">
              <StarLogo size={100} />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="border border-black/8">
                {[
                  { label: "Form",          value: "Four-pointed star with elongated vertical axis" },
                  { label: "Dimensionality",value: "Faceted surface — light from upper right, shadow lower left" },
                  { label: "Facets",        value: "Each arm divided into two planes — blade-like sharpness" },
                  { label: "Metaphor",      value: "Star. Compass. Blade. All three simultaneously." },
                ].map((row, i) => (
                  <div key={row.label} className={`grid grid-cols-[100px_1fr] border-b border-black/8 last:border-0 ${i % 2 === 0 ? "bg-black/[0.02]" : ""}`}>
                    <div className="px-5 py-4 border-r border-black/8">
                      <span className="t-caption text-[#111111] font-medium">{row.label}</span>
                    </div>
                    <div className="px-5 py-4">
                      <span className="text-sm text-[#6B7280] leading-relaxed">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="relative h-[50vh] overflow-hidden">
        <Image src="https://picsum.photos/seed/story-mid/1920/900" alt="Origin" fill className="object-cover grayscale" sizes="100vw" />
        <div className="absolute inset-0 bg-black/30" />
      </section>

      <section className="bg-[#F7F7F6] section-gap">
        <div className="container-site">
          <ScrollReveal>
            <span className="t-label text-[#6B7280] block mb-14">Core Beliefs</span>
          </ScrollReveal>
          <StaggerReveal className="flex flex-col">
            {[
              "Switchblade is not loud. It does not announce itself.",
              "There is no competition at the depth of the human heart — only compassion, kindness and love.",
              "A Switchblade product earns its mark or it doesn't carry it.",
            ].map((belief, i) => (
              <StaggerItem key={i}>
                <div className="grid grid-cols-[56px_1fr] gap-6 py-12 lg:py-16 border-b border-black/8 last:border-0">
                  <span className="t-caption mt-2">{String(i + 1).padStart(2, "0")}</span>
                  <p className="t-subheading text-[#111111] leading-snug">&ldquo;{belief}&rdquo;</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="bg-white section-gap">
        <div className="container-site">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div>
              <ScrollReveal>
                <span className="t-label text-[#6B7280]">Brand Pillars</span>
              </ScrollReveal>
              <h2 className="t-heading mt-4"><SweepText tone="dark" color="#111111">Extended.</SweepText></h2>
            </div>
          </div>
          <StaggerReveal className="grid lg:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Understated Competence",  short: "Mastery without performance. The work speaks.", extended: "The switchblade doesn't draw attention until it's needed. Neither does the person who carries its philosophy. Competence is demonstrated through outcomes, not announcements." },
              { num: "02", title: "Subtle Super-Confidence", short: "Knowing what you are capable of without needing to prove it.", extended: "This is not arrogance. Arrogance requires an audience. Super-confidence is internal — a settled certainty about one's capabilities. That stillness is the signature." },
              { num: "03", title: "Kindness and Compassion", short: "The brand's ultimate differentiator. Strength through generosity.", extended: "The sharpest people are also the kindest. This is the paradox the brand is built on — and what sets it apart from any brand that mistakes coldness for premium." },
            ].map(pillar => (
              <StaggerItem key={pillar.num}>
                <div className="border border-black/8 p-8 lg:p-10 flex flex-col gap-5 h-full hover:border-black/20 transition-colors">
                  <span className="t-caption">{pillar.num}</span>
                  <div className="rule" />
                  <h3 className="text-[#111111] font-medium text-xl tracking-tight">{pillar.title}</h3>
                  <p className="t-body text-[#111111] text-sm">{pillar.short}</p>
                  <p className="t-body text-[#6B7280] text-sm">{pillar.extended}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="bg-[#F7F7F6] section-gap">
        <div className="container-site grid lg:grid-cols-2 gap-16 lg:gap-32">
          <div>
            <ScrollReveal>
              <span className="t-label text-[#6B7280]">The Manifesto</span>
            </ScrollReveal>
            <h2 className="t-heading mt-4"><SweepText tone="dark" color="#111111">Written for the ones who already know.</SweepText></h2>
          </div>
          <StaggerReveal className="flex flex-col gap-4 pt-2">
            {[
              "There are people who move through the world quietly.",
              "Who build things that outlast the noise.",
              "Who are okay not being the spotlight,",
              "but at the backbone of greatness.",
              "Who understand that kindness is not weakness —",
              "it is the sharpest tool.",
              "",
              "This brand is for them.",
              "This brand is you.",
            ].map((line, i) => (
              <StaggerItem key={i}>
                {line ? (
                  <p className="text-xl text-[#111111] leading-relaxed font-light">{line}</p>
                ) : (
                  <div className="h-3" />
                )}
              </StaggerItem>
            ))}
            <StaggerItem>
              <p className="text-xl font-semibold text-[#0A1AFF] mt-4 inline-block border-b-2 border-[#0A1AFF] pb-1">
                Switchblade is you.
              </p>
            </StaggerItem>
          </StaggerReveal>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
