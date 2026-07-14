"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { StarLogo } from "@/components/StarLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/ScrollReveal";
import { SweepText } from "@/components/SweepText";

export default function MembershipPage() {
  const [form, setForm]         = useState({ name: "", email: "", source: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name && form.email) setSubmitted(true);
  }

  return (
    <>
      <section className="relative min-h-[60vh] flex flex-col justify-end overflow-hidden">
        <Image src="https://picsum.photos/seed/member-hero/1920/1080" alt="Inner Circle" fill priority className="object-cover grayscale" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-white" />
        <div className="relative z-10 container-site pb-20 pt-32 flex flex-col gap-5">
          <ScrollReveal className="flex items-center gap-3">
            <div className="animate-spin-slow"><StarLogo size={28} /></div>
            <span className="t-label text-[#6B7280]">Inner Circle</span>
          </ScrollReveal>
          <h1 className="t-display max-w-2xl"><SweepText tone="dark" color="#111111">The Inner Circle.</SweepText></h1>
          <p className="t-body text-[#6B7280] max-w-lg">100 people. No discounts. No noise. Just first.</p>
        </div>
      </section>

      <section className="bg-white section-gap">
        <div className="container-site grid lg:grid-cols-2 gap-16 lg:gap-32">
          <div className="flex flex-col gap-10">
            <ScrollReveal>
              <span className="t-label text-[#6B7280]">The philosophy</span>
            </ScrollReveal>
            <h2 className="t-heading mt-4"><SweepText tone="dark" color="#111111">A founding relationship.</SweepText></h2>
            <ScrollReveal delay={0.08}>
              <p className="t-body text-[#6B7280] mt-6">The membership is not a loyalty programme. It is not a discount club. There will never be discounts in Switchblade. The only benefit is early access to every drop.</p>
              <p className="t-body text-[#6B7280] mt-4">We are extending this to the first 100 people — those who are here from the beginning, who understand the philosophy, and who have already chosen their edge.</p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <StaggerReveal className="flex flex-col">
                {[
                  { num: "01", text: "Early access to every drop" },
                  { num: "02", text: "No promotions. No noise." },
                  { num: "03", text: "First 100. That's all." },
                ].map(item => (
                  <StaggerItem key={item.num}>
                    <div className="flex gap-8 py-5 border-b border-black/8 last:border-0">
                      <span className="t-caption">{item.num}</span>
                      <p className="text-[#111111] font-medium">{item.text}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </ScrollReveal>
          </div>

          <div>
            <ScrollReveal delay={0.1}>
              <span className="t-label text-[#6B7280]">Request access</span>
            </ScrollReveal>

            <AnimatePresence mode="wait">
              {submitted ? (
                <div key="success" className="flex flex-col items-start gap-6 py-16">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <StarLogo size={44} />
                  </motion.div>
                  <h2 className="t-heading"><SweepText tone="dark" color="#111111">Request received.</SweepText></h2>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col items-start gap-6">
                    <p className="t-body text-[#6B7280] max-w-sm">We have you. We will be in touch when it&apos;s time.</p>
                    <p className="t-label text-[#0A1AFF] mt-4">Made for those who already know.</p>
                  </motion.div>
                </div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="flex flex-col gap-8 mt-9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <div className="flex flex-col gap-2">
                    <label className="t-caption">Your name</label>
                    <input type="text" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-transparent border-0 border-b border-black/15 py-3.5 text-[#111111] text-base placeholder:text-[#9CA3AF] focus:outline-none focus:border-black/40 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="t-caption">Email address</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="bg-transparent border-0 border-b border-black/15 py-3.5 text-[#111111] text-base placeholder:text-[#9CA3AF] focus:outline-none focus:border-black/40 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="t-caption">How did you find us?</label>
                    <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="bg-transparent border-0 border-b border-black/15 py-3.5 text-base focus:outline-none focus:border-black/40 transition-colors appearance-none cursor-pointer" style={{ color: form.source ? "#111111" : "#9CA3AF" }}>
                      <option value="" disabled>Select one</option>
                      <option value="word-of-mouth">Word of mouth</option>
                      <option value="instagram">Instagram</option>
                      <option value="referral">Referral</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-[#111111] text-white py-4 text-sm font-medium hover:bg-[#0A1AFF] transition-colors mt-2">
                    Request access
                  </button>
                  <p className="text-xs text-[#9CA3AF] text-center leading-relaxed">We will never sell your data. We will contact you when it&apos;s time.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="relative h-[45vh] overflow-hidden">
        <Image src="https://picsum.photos/seed/member-footer/1920/800" alt="Switchblade" fill className="object-cover grayscale" sizes="100vw" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <p className="t-label text-white">Made for those who already know.</p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
