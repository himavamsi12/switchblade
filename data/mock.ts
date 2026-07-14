import type { Project, TeamMember } from "@/types";

export const TEAM: TeamMember[] = [
  { id: "t1", name: "Arjun Mehta", role: "Creative Lead", avatar: "AM", email: "arjun@studio.io", department: "creative" },
  { id: "t2", name: "Priya Sharma", role: "Brand Strategist", avatar: "PS", email: "priya@studio.io", department: "strategy" },
  { id: "t3", name: "Dev Kapoor", role: "Senior Designer", avatar: "DK", email: "dev@studio.io", department: "design" },
  { id: "t4", name: "Nisha Rao", role: "Project Manager", avatar: "NR", email: "nisha@studio.io", department: "pm" },
  { id: "t5", name: "Rahul Verma", role: "UX Designer", avatar: "RV", email: "rahul@studio.io", department: "design" },
  { id: "t6", name: "Meera Iyer", role: "Copywriter", avatar: "MI", email: "meera@studio.io", department: "creative" },
  { id: "t7", name: "Aditya Bose", role: "Motion Designer", avatar: "AB", email: "aditya@studio.io", department: "design" },
  { id: "t8", name: "Kavya Nair", role: "Strategy Director", avatar: "KN", email: "kavya@studio.io", department: "strategy" },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Nexus Bank — Brand Overhaul",
    code: "NXB-001",
    type: "Brand Identity",
    status: "execution",
    priority: "critical",
    lead: TEAM[0],
    team: [TEAM[0], TEAM[1], TEAM[2], TEAM[3]],
    client: {
      name: "Siddharth Rao",
      company: "Nexus Bank",
      role: "Chief Marketing Officer",
      email: "siddharth.rao@nexusbank.com",
      phone: "+91 98100 12345",
      mentality: "visionary",
      communication_preference: "calls",
      response_time: "fast",
      decision_style: "Top-down. Decisive once aligned. Values data to back creative decisions.",
      key_concerns: ["Modern but trustworthy", "Differentiation from HDFC", "Regulatory compliance in visuals"],
      expectations: "Full brand system — logo, guidelines, digital assets — delivered before Q3 board presentation.",
      relationship_notes: "Very involved. Attends all workshops. Has final sign-off authority. Prefers no surprises.",
      health: "good",
    },
    start_date: "2026-04-01",
    deadline: "2026-07-15",
    progress: 62,
    budget: { allocated: 4200000, spent: 2750000, currency: "INR" },
    tags: ["banking", "rebrand", "identity", "guidelines"],
    description: "Complete brand overhaul for Nexus Bank covering visual identity, tone of voice, digital design system, and brand guidelines for pan-India rollout.",
    questionnaire: [
      { id: "q1", category: "Brand Foundation", question: "What 3 words describe the brand you want to build?", answer: "Trusted, Modern, Accessible", answered_at: "2026-04-03" },
      { id: "q2", category: "Brand Foundation", question: "Who is your primary customer persona?", answer: "Urban professional aged 28–45, digitally savvy, values simplicity in financial services. Secondary: tier-2 city aspirational earners.", answered_at: "2026-04-03" },
      { id: "q3", category: "Competition", question: "Which competitors do you admire visually and why?", answer: "Revolut (boldness), Kotak (clean digital), Axis Burgundy (premium feel). We want to combine Revolut's modernity with Kotak's trust signals.", answered_at: "2026-04-03" },
      { id: "q4", category: "Visual Direction", question: "Are there colors you absolutely must avoid?", answer: "No orange (associated with Kotak). Green is acceptable but not preferred — too generic in fintech.", answered_at: "2026-04-03" },
      { id: "q5", category: "Deliverables", question: "Where will this brand appear first?", answer: "Mobile app redesign (March 2026), ATM UI refresh (Q4 2026), HQ signage, and nationwide branch refresh over 18 months.", answered_at: "2026-04-04" },
      { id: "q6", category: "Culture", question: "What is the internal culture like at Nexus Bank?", answer: "Traditional roots, actively modernising. Mid-management is conservative. C-suite is progressive. Brand must bridge both worlds.", answered_at: "2026-04-04" },
    ],
    workshops: [
      {
        id: "w1", title: "Brand Discovery Workshop", date: "2026-04-10", duration: 180, facilitator: "Priya Sharma",
        attendees: ["Siddharth Rao", "Arjun Mehta", "Priya Sharma", "Nisha Rao", "Brand Team (5)"],
        objectives: ["Uncover brand aspirations", "Map competitive landscape", "Align on visual direction"],
        outcomes: ["Agreed on 'Clarity in Complexity' as brand mantra", "Rejected dark color palettes", "Blue-led palette shortlisted"],
        next_steps: ["Moodboard 3 directions", "Stakeholder survey — internal 20 people", "Present at Week 3"],
        status: "completed"
      },
      {
        id: "w2", title: "Visual Direction Alignment", date: "2026-04-28", duration: 120, facilitator: "Arjun Mehta",
        attendees: ["Siddharth Rao", "Arjun Mehta", "Dev Kapoor"],
        objectives: ["Lock visual direction from 3 concepts", "Agree on logo exploration brief"],
        outcomes: ["Direction 2 (Geometric Clarity) selected", "Logo brief signed off", "Typography shortlist: Inter + Fraunces"],
        next_steps: ["Logo concepts — 5 options", "Color system exploration"],
        status: "completed"
      },
      {
        id: "w3", title: "Logo Presentation & Refinement", date: "2026-05-20", duration: 90, facilitator: "Dev Kapoor",
        attendees: ["Siddharth Rao", "Board Rep", "Arjun Mehta", "Dev Kapoor"],
        objectives: ["Present 5 logo options", "Gather structured feedback", "Shortlist to 2"],
        outcomes: ["Logo N3 and N5 shortlisted", "Preferred: N3 with N5's icon weight"],
        next_steps: ["Refinement round", "Color system application"],
        status: "completed"
      },
      {
        id: "w4", title: "Brand System Review", date: "2026-06-18", duration: 120, facilitator: "Priya Sharma",
        attendees: ["Siddharth Rao", "Arjun Mehta", "Full Brand Team"],
        objectives: ["Review full brand system", "Approve digital applications", "Agree guidelines structure"],
        outcomes: [],
        next_steps: [],
        status: "scheduled"
      },
    ],
    escalations: [
      {
        id: "e1", title: "Scope Creep — ATM UI Added Mid-Project",
        description: "Client requested ATM UI design scope in Week 4 without formal change order. Team absorbed 3 extra days unpaid.",
        raised_by: "Nisha Rao", raised_at: "2026-05-02", severity: "high", status: "resolved",
        resolved_at: "2026-05-05", resolution: "Change order signed. Budget increased by ₹3.5L. Timeline extended 2 weeks.",
        category: "scope"
      },
      {
        id: "e2", title: "Client Feedback Delay — Round 2",
        description: "Logo feedback due May 15 arrived May 22. Caused a 7-day timeline slip across all downstream tasks.",
        raised_by: "Arjun Mehta", raised_at: "2026-05-22", severity: "medium", status: "resolved",
        resolved_at: "2026-05-23", resolution: "Revised timeline issued. Buffer added to all remaining reviews.",
        category: "deadline"
      },
      {
        id: "e3", title: "Internal Approval Bottleneck",
        description: "Client's legal team is now requesting to review all brand marks for trademark conflicts before final approval.",
        raised_by: "Nisha Rao", raised_at: "2026-06-01", severity: "medium", status: "in-progress",
        category: "client"
      },
    ],
    planning: {
      kickoff_date: "2026-04-01",
      phases: [
        { id: "ph1", name: "Discovery & Research", start_date: "2026-04-01", end_date: "2026-04-18", progress: 100, status: "completed", deliverables: ["Brand audit", "Competitor analysis", "Stakeholder interviews", "Discovery report"] },
        { id: "ph2", name: "Strategy & Positioning", start_date: "2026-04-19", end_date: "2026-05-02", progress: 100, status: "completed", deliverables: ["Brand strategy doc", "Tone of voice guide", "Visual direction moodboards"] },
        { id: "ph3", name: "Visual Identity Design", start_date: "2026-05-03", end_date: "2026-06-10", progress: 80, status: "active", deliverables: ["Logo system", "Color palette", "Typography system", "Icon set"] },
        { id: "ph4", name: "Brand System & Guidelines", start_date: "2026-06-11", end_date: "2026-07-05", progress: 15, status: "active", deliverables: ["Brand guidelines PDF", "Digital design system", "Asset library"] },
        { id: "ph5", name: "Delivery & Handoff", start_date: "2026-07-06", end_date: "2026-07-15", progress: 0, status: "pending", deliverables: ["Final assets", "Guidelines training", "Handoff presentation"] },
      ],
      milestones: [
        { id: "m1", title: "Discovery Report Approved", due_date: "2026-04-18", completed: true, completed_at: "2026-04-17", owner: "Priya Sharma" },
        { id: "m2", title: "Visual Direction Locked", due_date: "2026-05-01", completed: true, completed_at: "2026-04-28", owner: "Arjun Mehta" },
        { id: "m3", title: "Logo System Approved", due_date: "2026-06-05", completed: false, owner: "Dev Kapoor" },
        { id: "m4", title: "Full Brand System Review", due_date: "2026-06-18", completed: false, owner: "Arjun Mehta" },
        { id: "m5", title: "Final Delivery", due_date: "2026-07-15", completed: false, owner: "Nisha Rao" },
      ],
      risks: [
        { id: "r1", description: "Legal trademark review may delay final logo approval", impact: "high", probability: "medium", mitigation: "Submit trademark brief in parallel; use provisional marks until clearance." },
        { id: "r2", description: "Stakeholder misalignment at board review", impact: "high", probability: "low", mitigation: "Pre-brief Siddharth 48hrs before board presentation." },
      ]
    },
    strategy: {
      objective: "Position Nexus Bank as India's most human-centric modern bank — trusted by families, chosen by professionals.",
      key_messages: ["Banking that understands you", "Clarity in every transaction", "Built for the next generation of India"],
      target_audience: "Urban professionals 28–45. Tier-2 aspirational earners. Digital-first but trust-seeking.",
      tone_of_voice: "Confident, warm, precise. Never jargon-heavy. Speaks like a knowledgeable friend, not a corporation.",
      brand_pillars: ["Trust", "Clarity", "Progress", "Human-First"],
      competitors: ["HDFC Bank", "Kotak Mahindra", "Axis Bank", "Revolut India"],
      differentiators: ["Simpler language than competitors", "Human warmth in visual system", "Strong digital-physical cohesion"],
      success_metrics: [
        { metric: "Brand recall (aided)", target: "45% in urban TG", current: "28%" },
        { metric: "App redesign NPS", target: "65+", current: "41" },
        { metric: "Internal brand adoption", target: "90% of branches", current: "0% (pre-launch)" },
      ],
      execution_notes: "Guidelines rollout is phased: digital first, branches Q4 2026. Internal brand training to be conducted by strategy team."
    },
    notifications: [
      { id: "n1", from: "Siddharth Rao", to: ["arjun@studio.io"], subject: "Re: Logo Round 3 — Quick Note", preview: "Love the direction. Just one thing on the icon weight — can we see the heavier version in context?", date: "2026-06-02 09:14", read: false, type: "client", priority: "urgent" },
      { id: "n2", from: "Nisha Rao", to: ["arjun@studio.io"], subject: "Brand System Review — Calendar Invite Sent", preview: "Sent June 18 invite to Siddharth's team. Please confirm your availability and brief the team.", date: "2026-06-01 17:30", read: true, type: "team", priority: "normal" },
      { id: "n3", from: "System", to: ["arjun@studio.io"], subject: "Milestone Due in 3 Days: Logo System Approved", preview: "Milestone 'Logo System Approved' is due on June 5. Current status: In Progress.", date: "2026-06-02 08:00", read: false, type: "system", priority: "urgent" },
    ],
    last_activity: "2026-06-02T09:14:00"
  },
  {
    id: "p2",
    name: "Lumina Skincare — Launch Campaign",
    code: "LMS-002",
    type: "Campaign Design",
    status: "review",
    priority: "high",
    lead: TEAM[4],
    team: [TEAM[4], TEAM[5], TEAM[6], TEAM[3]],
    client: {
      name: "Ananya Krishnan",
      company: "Lumina Skincare",
      role: "Founder & CEO",
      email: "ananya@luminaskincare.com",
      phone: "+91 90000 56789",
      mentality: "collaborative",
      communication_preference: "slack",
      response_time: "fast",
      decision_style: "Collaborative but opinionated. Trusts the team but wants to be in every loop. Approves via consensus.",
      key_concerns: ["Clean, minimal aesthetic", "Gen-Z appeal without alienating millennials", "Strong social-first design"],
      expectations: "Complete campaign assets for launch: OOH, digital, social, packaging. Deadline is firm — launch event June 30.",
      relationship_notes: "First-time client. Very enthusiastic. Needs confidence-building moments. Responds well to visual progress updates.",
      health: "excellent",
    },
    start_date: "2026-04-15",
    deadline: "2026-06-25",
    progress: 85,
    budget: { allocated: 1800000, spent: 1540000, currency: "INR" },
    tags: ["skincare", "launch", "campaign", "social", "ooh"],
    description: "Full campaign design for Lumina Skincare's India launch including OOH, digital banners, social media templates, and packaging mockups.",
    questionnaire: [
      { id: "q1", category: "Campaign", question: "What is the single most important emotion this campaign should evoke?", answer: "Confidence. The feeling of 'I've got this' when you look in the mirror.", answered_at: "2026-04-16" },
      { id: "q2", category: "Audience", question: "Describe your ideal customer in 3 sentences.", answer: "21–32 year old woman in metros. Educated, income >₹8L/year. Chooses brands that align with her values — sustainability, transparency, quality.", answered_at: "2026-04-16" },
      { id: "q3", category: "Aesthetic", question: "Share 5 visual references that excite you.", answer: "Glossier (minimal, playful), Aesop (editorial), Fenty (inclusive), Drunk Elephant (bold color blocks), Tatcha (luxury detail). We lean Glossier + Aesop.", answered_at: "2026-04-17" },
      { id: "q4", category: "Channels", question: "Rank channels by importance for this launch.", answer: "1. Instagram/Reels 2. OOH (Mumbai, Delhi, Bangalore) 3. YouTube pre-roll 4. Print (Vogue, Elle India) 5. E-commerce banners", answered_at: "2026-04-17" },
    ],
    workshops: [
      {
        id: "w1", title: "Campaign Concept Workshop", date: "2026-04-22", duration: 150,
        facilitator: "Rahul Verma",
        attendees: ["Ananya Krishnan", "Marketing Lead — Lumina", "Rahul Verma", "Meera Iyer"],
        objectives: ["Define campaign territory", "Agree on 2 concepts to develop", "Photo/video brief alignment"],
        outcomes: ["Concept 'Uncovered' selected as hero campaign", "Photography brief: natural light, diverse skin tones, no retouching", "Tagline direction: 'Your skin, amplified'"],
        next_steps: ["Develop creative boards", "Photography shortlist", "Concept presentation Week 3"],
        status: "completed"
      },
    ],
    escalations: [
      {
        id: "e1", title: "Photography Budget Overrun",
        description: "Approved photographer quoted 40% above budget. Team requested approval for additional ₹2.5L.",
        raised_by: "Rahul Verma", raised_at: "2026-05-10", severity: "medium", status: "resolved",
        resolved_at: "2026-05-11", resolution: "Client approved additional budget. Signed off within 24hrs.",
        category: "budget"
      },
    ],
    planning: {
      kickoff_date: "2026-04-15",
      phases: [
        { id: "ph1", name: "Strategy & Concept", start_date: "2026-04-15", end_date: "2026-04-30", progress: 100, status: "completed", deliverables: ["Campaign strategy", "2 creative concepts", "Photography brief"] },
        { id: "ph2", name: "Design & Production", start_date: "2026-05-01", end_date: "2026-06-05", progress: 95, status: "completed", deliverables: ["OOH designs", "Social templates", "Digital banners", "Packaging mockups"] },
        { id: "ph3", name: "Review & Amends", start_date: "2026-06-06", end_date: "2026-06-18", progress: 60, status: "active", deliverables: ["Client amends", "Final files"] },
        { id: "ph4", name: "Final Delivery", start_date: "2026-06-19", end_date: "2026-06-25", progress: 0, status: "pending", deliverables: ["Print-ready files", "Digital asset pack", "Usage guide"] },
      ],
      milestones: [
        { id: "m1", title: "Concept Approved", due_date: "2026-04-30", completed: true, completed_at: "2026-04-29", owner: "Rahul Verma" },
        { id: "m2", title: "Photography Complete", due_date: "2026-05-20", completed: true, completed_at: "2026-05-19", owner: "Aditya Bose" },
        { id: "m3", title: "All Designs Approved", due_date: "2026-06-18", completed: false, owner: "Rahul Verma" },
        { id: "m4", title: "Final Asset Delivery", due_date: "2026-06-25", completed: false, owner: "Nisha Rao" },
      ],
      risks: [
        { id: "r1", description: "Tight timeline for print production after final approval", impact: "high", probability: "medium", mitigation: "Pre-booked printer slot. Files to printer within 24hrs of sign-off." },
      ]
    },
    strategy: {
      objective: "Create a campaign that makes Lumina Skincare unmissable at launch — building instant brand recognition and driving trial among urban millennial and Gen-Z women.",
      key_messages: ["Your skin, amplified", "Science that loves your skin", "Real results, real confidence"],
      target_audience: "Women 21–35, urban metros, income >₹8L, values-driven consumer.",
      tone_of_voice: "Warm, honest, confident. A knowledgeable best friend. Never clinical or preachy.",
      brand_pillars: ["Transparency", "Confidence", "Science", "Inclusivity"],
      competitors: ["Plum", "Dot & Key", "Minimalist", "Foxtale"],
      differentiators: ["Editorial-quality visuals vs category", "No-retouch photography policy", "Ingredient-first storytelling"],
      success_metrics: [
        { metric: "Campaign reach (Instagram)", target: "5M in launch week" },
        { metric: "Trial packs sold in Month 1", target: "10,000 units" },
        { metric: "Press coverage", target: "8 tier-1 publications" },
      ],
      execution_notes: "All social assets sized for both Reels (9:16) and static (1:1, 4:5). OOH in 3 markets simultaneously on June 30."
    },
    notifications: [
      { id: "n1", from: "Ananya Krishnan", to: ["rahul@studio.io"], subject: "OOH Visuals — LOVED IT", preview: "Rahul, the outdoor visuals are exactly what I imagined. One small ask — can we try the logo placement on the bottom right instead?", date: "2026-06-02 11:45", read: false, type: "client", priority: "normal" },
      { id: "n2", from: "System", to: ["rahul@studio.io"], subject: "Deadline Alert: Final Asset Delivery in 23 Days", preview: "Project LMS-002 final delivery is due June 25. Current progress: 85%.", date: "2026-06-02 08:00", read: true, type: "system", priority: "normal" },
    ],
    last_activity: "2026-06-02T11:45:00"
  },
  {
    id: "p3",
    name: "Vantara Realty — Website Redesign",
    code: "VNT-003",
    type: "Digital Design",
    status: "planning",
    priority: "high",
    lead: TEAM[2],
    team: [TEAM[2], TEAM[4], TEAM[3]],
    client: {
      name: "Vikram Oberoi",
      company: "Vantara Realty",
      role: "Head of Digital",
      email: "vikram.oberoi@vantara.in",
      phone: "+91 88001 23456",
      mentality: "micromanager",
      communication_preference: "email",
      response_time: "moderate",
      decision_style: "Demands detailed proposals before approving. Needs to feel ownership. Dislikes surprises. Very detail-oriented.",
      key_concerns: ["Load speed (Google PageSpeed 90+)", "Mobile-first experience", "Lead generation optimization", "SEO structure"],
      expectations: "Full website redesign with new IA, visual design, and CMS integration. UAT must be completed before go-live.",
      relationship_notes: "Previous bad experience with another agency. Needs reassurance and detailed status reports. Document everything.",
      health: "at-risk",
    },
    start_date: "2026-05-10",
    deadline: "2026-08-30",
    progress: 22,
    budget: { allocated: 2800000, spent: 680000, currency: "INR" },
    tags: ["website", "ux", "digital", "cms", "realty"],
    description: "Complete redesign of Vantara Realty's digital presence — IA, UX/UI design, CMS build, and performance optimization.",
    questionnaire: [
      { id: "q1", category: "Business Goals", question: "What is the primary business goal of this redesign?", answer: "Increase qualified leads by 40%. Currently getting 200 leads/month, target is 280. Secondary: reduce bounce rate from 72% to under 50%.", answered_at: "2026-05-12" },
      { id: "q2", category: "Current Issues", question: "What are the 3 biggest problems with your current website?", answer: "1. Loads in 8 seconds on mobile. 2. Buyers can't filter projects by what matters to them. 3. The brand looks 2015 — doesn't reflect our premium positioning.", answered_at: "2026-05-12" },
      { id: "q3", category: "CMS", question: "Who will be managing content post-launch?", answer: "Internal marketing team of 2. They know WordPress but we're open to other CMS. Must be manageable without developer help for regular updates.", answered_at: "2026-05-13" },
    ],
    workshops: [
      {
        id: "w1", title: "Discovery & IA Workshop", date: "2026-05-20", duration: 180,
        facilitator: "Dev Kapoor",
        attendees: ["Vikram Oberoi", "Digital Team (3)", "Dev Kapoor", "Rahul Verma"],
        objectives: ["Map current user journeys", "Define new IA", "Agree on priority pages"],
        outcomes: ["Current IA has 47 pages — reducing to 22 key pages", "New IA map agreed", "Priority: Project listing, Project detail, Contact"],
        next_steps: ["Wireframes for 5 priority pages", "Competitor UX audit", "Present wireframes Week 3"],
        status: "completed"
      },
    ],
    escalations: [
      {
        id: "e1", title: "Client Demanding Weekly Written Reports",
        description: "Client has requested formal written status reports every Friday by 5pm. This was not in the original contract and adds 2-3 hrs/week.",
        raised_by: "Dev Kapoor", raised_at: "2026-05-28", severity: "low", status: "resolved",
        resolved_at: "2026-05-30", resolution: "Agreed to share a structured Notion status page (self-updates). No formal report but client has live visibility.",
        category: "client"
      },
    ],
    planning: {
      kickoff_date: "2026-05-10",
      phases: [
        { id: "ph1", name: "Discovery & IA", start_date: "2026-05-10", end_date: "2026-05-28", progress: 100, status: "completed", deliverables: ["IA map", "Competitor audit", "Analytics audit"] },
        { id: "ph2", name: "Wireframes & UX", start_date: "2026-05-29", end_date: "2026-06-20", progress: 40, status: "active", deliverables: ["Wireframes — 22 pages", "User flows", "Mobile wireframes"] },
        { id: "ph3", name: "Visual Design", start_date: "2026-06-21", end_date: "2026-07-25", progress: 0, status: "pending", deliverables: ["UI design — all pages", "Design system", "Interactive prototype"] },
        { id: "ph4", name: "Development & CMS", start_date: "2026-07-26", end_date: "2026-08-20", progress: 0, status: "pending", deliverables: ["Frontend build", "CMS integration", "SEO setup"] },
        { id: "ph5", name: "UAT & Launch", start_date: "2026-08-21", end_date: "2026-08-30", progress: 0, status: "pending", deliverables: ["UAT sign-off", "Go-live", "Handoff docs"] },
      ],
      milestones: [
        { id: "m1", title: "IA Approved", due_date: "2026-05-28", completed: true, completed_at: "2026-05-27", owner: "Dev Kapoor" },
        { id: "m2", title: "Wireframes Approved", due_date: "2026-06-20", completed: false, owner: "Rahul Verma" },
        { id: "m3", title: "Visual Design Approved", due_date: "2026-07-25", completed: false, owner: "Dev Kapoor" },
        { id: "m4", title: "UAT Sign-off", due_date: "2026-08-28", completed: false, owner: "Nisha Rao" },
      ],
      risks: [
        { id: "r1", description: "Client approval cycle historically slow — may compress development timeline", impact: "high", probability: "high", mitigation: "Hard deadlines in contract. Escalation SLA: 5 business days max per review." },
        { id: "r2", description: "CMS choice not confirmed — could require rework if changed mid-project", impact: "medium", probability: "medium", mitigation: "Lock CMS decision by end of wireframe phase." },
      ]
    },
    strategy: {
      objective: "Transform Vantara's digital presence into a conversion-optimised, premium real estate platform that turns visitors into qualified leads.",
      key_messages: ["Find your perfect home", "Premium properties, simplified", "Start your journey with Vantara"],
      target_audience: "HNI home buyers, 35–55, metro cities. Looking for 3BHK+. Values premium finish, location.",
      tone_of_voice: "Aspirational yet approachable. Premium without being pretentious.",
      brand_pillars: ["Trust", "Premium", "Simplicity", "Expertise"],
      competitors: ["DLF", "Prestige", "Godrej Properties"],
      differentiators: ["Curated portfolio vs mass developer", "Human experience through digital", "Content-rich project pages"],
      success_metrics: [
        { metric: "Lead volume/month", target: "280 leads", current: "200 leads" },
        { metric: "Bounce rate", target: "<50%", current: "72%" },
        { metric: "Mobile PageSpeed", target: "90+", current: "38" },
      ],
      execution_notes: "All pages to be designed mobile-first. Lead forms on every project page above the fold."
    },
    notifications: [
      { id: "n1", from: "Vikram Oberoi", to: ["dev@studio.io"], subject: "Wireframe Feedback — Section 3", preview: "Dev, the project listing page wireframe is good but I have 6 feedback points. Calling you at 2pm today.", date: "2026-06-01 10:20", read: true, type: "client", priority: "normal" },
    ],
    last_activity: "2026-06-01T10:20:00"
  },
  {
    id: "p4",
    name: "Orbis Tech — Product UI Kit",
    code: "OBT-004",
    type: "Design System",
    status: "delivered",
    priority: "medium",
    lead: TEAM[4],
    team: [TEAM[4], TEAM[2]],
    client: {
      name: "Rohan Ghosh",
      company: "Orbis Technologies",
      role: "VP Product",
      email: "rohan.ghosh@orbistech.io",
      phone: "+91 99990 88776",
      mentality: "technical",
      communication_preference: "slack",
      response_time: "fast",
      decision_style: "Data-driven and structured. Thinks in systems. Very comfortable with design tooling.",
      key_concerns: ["Component completeness", "Figma-to-code accuracy", "Accessibility compliance (WCAG AA)"],
      expectations: "Full UI kit with 80+ components, tokens, documentation, and Figma file ready for engineering handoff.",
      relationship_notes: "Excellent client. Clear briefs, fast decisions. High repeat potential. Flag any scope additions early.",
      health: "excellent",
    },
    start_date: "2026-02-01",
    deadline: "2026-05-30",
    progress: 100,
    budget: { allocated: 3500000, spent: 3420000, currency: "INR" },
    tags: ["design-system", "ui-kit", "figma", "components", "saas"],
    description: "Comprehensive product UI Kit and design system for Orbis's B2B SaaS platform — 85 components, token system, and full documentation.",
    questionnaire: [
      { id: "q1", category: "Scale", question: "How many components do you need?", answer: "Minimum 80 production-ready components. Priority: Forms, Tables, Navigation, Modals, Charts. The design team is 8 people who'll all use this.", answered_at: "2026-02-03" },
    ],
    workshops: [],
    escalations: [],
    planning: {
      kickoff_date: "2026-02-01",
      phases: [
        { id: "ph1", name: "Token & Foundation", start_date: "2026-02-01", end_date: "2026-02-21", progress: 100, status: "completed", deliverables: ["Token system", "Grid", "Typography", "Color system"] },
        { id: "ph2", name: "Core Components", start_date: "2026-02-22", end_date: "2026-04-11", progress: 100, status: "completed", deliverables: ["60 core components", "States & variants"] },
        { id: "ph3", name: "Complex Components", start_date: "2026-04-12", end_date: "2026-05-16", progress: 100, status: "completed", deliverables: ["Charts", "Tables", "Data grids", "Complex forms"] },
        { id: "ph4", name: "Documentation & Handoff", start_date: "2026-05-17", end_date: "2026-05-30", progress: 100, status: "completed", deliverables: ["Storybook docs", "Figma annotation layer", "Handoff guide"] },
      ],
      milestones: [
        { id: "m1", title: "Token System Approved", due_date: "2026-02-21", completed: true, completed_at: "2026-02-20", owner: "Rahul Verma" },
        { id: "m2", title: "60 Components Delivered", due_date: "2026-04-11", completed: true, completed_at: "2026-04-10", owner: "Rahul Verma" },
        { id: "m3", title: "Final Delivery & Handoff", due_date: "2026-05-30", completed: true, completed_at: "2026-05-28", owner: "Rahul Verma" },
      ],
      risks: []
    },
    strategy: {
      objective: "Deliver a world-class design system that accelerates Orbis's product development velocity by 40%.",
      key_messages: ["Consistency at scale", "Design and engineering in sync", "Built for growth"],
      target_audience: "Internal — Product designers and frontend engineers at Orbis.",
      tone_of_voice: "Precise, technical, efficient.",
      brand_pillars: ["Consistency", "Scalability", "Accessibility", "Speed"],
      competitors: ["Internal legacy system", "Bootstrap"],
      differentiators: ["Purpose-built for Orbis's product", "WCAG AA compliant from day one", "Token-first architecture"],
      success_metrics: [
        { metric: "Component coverage", target: "85 components", current: "87 components" },
        { metric: "Design-to-dev handoff time", target: "50% reduction", current: "Delivered" },
        { metric: "WCAG AA compliance", target: "100%", current: "100%" },
      ],
      execution_notes: "Delivered on May 28. Client gave 5-star feedback. Potential follow-up: motion guidelines and native mobile extension."
    },
    notifications: [
      { id: "n1", from: "Rohan Ghosh", to: ["rahul@studio.io"], subject: "Project Closed — Outstanding Work", preview: "Team, this is exactly what we needed. NPS would be 10/10. Looking forward to the next engagement.", date: "2026-05-29 15:00", read: true, type: "client", priority: "normal" },
    ],
    last_activity: "2026-05-29T15:00:00"
  },
  {
    id: "p5",
    name: "Zelara Foods — Packaging System",
    code: "ZLF-005",
    type: "Packaging Design",
    status: "on-hold",
    priority: "low",
    lead: TEAM[1],
    team: [TEAM[1], TEAM[2]],
    client: {
      name: "Fatima Shaikh",
      company: "Zelara Foods",
      role: "Brand Manager",
      email: "fatima@zelara.com",
      phone: "+91 87654 32100",
      mentality: "budget-focused",
      communication_preference: "email",
      response_time: "slow",
      decision_style: "Committee-driven. Multiple approvers. Budget always the primary lens.",
      key_concerns: ["Print cost per unit", "Shelf standout", "Regulatory compliance"],
      expectations: "Packaging for 6 SKUs. Must be production-ready with dielines.",
      relationship_notes: "On hold due to client internal budget freeze. Resuming Q3 2026. Keep warm.",
      health: "at-risk",
    },
    start_date: "2026-03-15",
    deadline: "2026-09-30",
    progress: 30,
    budget: { allocated: 950000, spent: 285000, currency: "INR" },
    tags: ["packaging", "fmcg", "print", "dielines"],
    description: "Packaging design system for Zelara's new snacks range — 6 SKUs across 2 product lines.",
    questionnaire: [
      { id: "q1", category: "Product", question: "Describe the 6 SKUs and their flavour variants.", answer: "2 product lines: Crunch Bites (3 flavours) and Protein Bars (3 flavours). All must feel like one family but be individually differentiated.", answered_at: "2026-03-18" },
    ],
    workshops: [],
    escalations: [
      {
        id: "e1", title: "Project On Hold — Client Budget Freeze",
        description: "Client informed that internal budget has been frozen pending Q2 results. Project paused indefinitely.",
        raised_by: "Priya Sharma", raised_at: "2026-04-28", severity: "low", status: "resolved",
        resolved_at: "2026-04-29", resolution: "Project on hold. Client confirmed resuming Q3 (July 2026). All work preserved. Monthly check-in scheduled.",
        category: "budget"
      },
    ],
    planning: {
      kickoff_date: "2026-03-15",
      phases: [
        { id: "ph1", name: "Research & Direction", start_date: "2026-03-15", end_date: "2026-03-31", progress: 100, status: "completed", deliverables: ["Category audit", "3 visual directions"] },
        { id: "ph2", name: "Design Development", start_date: "2026-04-01", end_date: "2026-05-15", progress: 45, status: "active", deliverables: ["6 SKU designs", "Dielines"] },
        { id: "ph3", name: "Production Files", start_date: "2026-05-16", end_date: "2026-06-15", progress: 0, status: "pending", deliverables: ["Print-ready files", "Printer briefing"] },
      ],
      milestones: [
        { id: "m1", title: "Visual Direction Approved", due_date: "2026-03-31", completed: true, completed_at: "2026-03-30", owner: "Priya Sharma" },
        { id: "m2", title: "All 6 SKU Designs Approved", due_date: "2026-05-15", completed: false, owner: "Dev Kapoor" },
      ],
      risks: [
        { id: "r1", description: "On hold — timeline likely to compress when resumed", impact: "medium", probability: "high", mitigation: "Maintain ready-to-go state. Re-kickoff call scheduled for July 2026." },
      ]
    },
    strategy: {
      objective: "Create a packaging system that makes Zelara stand out on shelf and communicate premium quality at accessible price points.",
      key_messages: ["Snacking, reimagined", "Real ingredients, real taste", "Better snacking starts here"],
      target_audience: "Health-conscious urban consumers 22–40.",
      tone_of_voice: "Energetic, honest, vibrant.",
      brand_pillars: ["Real ingredients", "Joy", "Better choices"],
      competitors: ["Too Yumm", "Yoga Bar", "Whole Farm"],
      differentiators: ["Bold color system per product line", "Ingredient callouts as hero design element"],
      success_metrics: [
        { metric: "Shelf standout score (focus group)", target: "Top 2 in category" },
        { metric: "Production cost per unit", target: "<₹12 per pack" },
      ],
      execution_notes: "On hold. Work resumes July 2026. Current progress: 3 SKU designs at 60%, 3 at 0%."
    },
    notifications: [],
    last_activity: "2026-04-29T14:00:00"
  },
  {
    id: "p6",
    name: "Horizon AI — Brand Identity",
    code: "HAI-006",
    type: "Brand Identity",
    status: "discovery",
    priority: "high",
    lead: TEAM[7],
    team: [TEAM[7], TEAM[1], TEAM[3]],
    client: {
      name: "Aryan Chopra",
      company: "Horizon AI",
      role: "Co-Founder & CEO",
      email: "aryan@horizonai.tech",
      phone: "+91 91234 56789",
      mentality: "visionary",
      communication_preference: "calls",
      response_time: "fast",
      decision_style: "Bold decisions, moves fast. Wants a brand that feels like the future. Open to risk.",
      key_concerns: ["Standing out in crowded AI space", "Not looking like every other AI startup (blue, purple, robot)", "Needs to attract enterprise clients AND talent"],
      expectations: "Brand identity ready in 8 weeks. Will be used for Series A deck, website, and conference presence.",
      relationship_notes: "First engagement. Referred by Orbis. High-energy founder. Very clear on what they DON'T want.",
      health: "good",
    },
    start_date: "2026-05-28",
    deadline: "2026-07-25",
    progress: 12,
    budget: { allocated: 2200000, spent: 265000, currency: "INR" },
    tags: ["ai", "startup", "brand", "identity", "series-a"],
    description: "Brand identity for Horizon AI — a Series A-stage AI infrastructure company. Covers naming rationale, visual identity, and Series A assets.",
    questionnaire: [
      { id: "q1", category: "Brand Vision", question: "If Horizon AI was a person at a dinner party, how would they behave?", answer: "The smartest person in the room who doesn't need to prove it. Listens more than talks. When they do speak, everyone leans in.", answered_at: "2026-05-30" },
      { id: "q2", category: "Visual", question: "Which AI brands do you find visually compelling?", answer: "Perplexity (clean, confident), Linear (sharp, developer-loved), Vercel (minimal power). Hate: anything with neural network illustrations or gradient brains.", answered_at: "2026-05-30" },
    ],
    workshops: [
      {
        id: "w1", title: "Brand Discovery — Day 1", date: "2026-06-03", duration: 240,
        facilitator: "Kavya Nair",
        attendees: ["Aryan Chopra", "CTO Horizon AI", "Kavya Nair", "Priya Sharma"],
        objectives: ["Deep dive brand positioning", "Market white space", "Visual territory exploration"],
        outcomes: [],
        next_steps: [],
        status: "scheduled"
      },
    ],
    escalations: [],
    planning: {
      kickoff_date: "2026-05-28",
      phases: [
        { id: "ph1", name: "Discovery", start_date: "2026-05-28", end_date: "2026-06-13", progress: 30, status: "active", deliverables: ["Brand discovery", "Positioning map", "Naming audit"] },
        { id: "ph2", name: "Strategy", start_date: "2026-06-14", end_date: "2026-06-27", progress: 0, status: "pending", deliverables: ["Brand strategy", "Naming recommendations", "Visual territory"] },
        { id: "ph3", name: "Identity Design", start_date: "2026-06-28", end_date: "2026-07-18", progress: 0, status: "pending", deliverables: ["Logo", "Color", "Typography", "Brand elements"] },
        { id: "ph4", name: "Applications", start_date: "2026-07-19", end_date: "2026-07-25", progress: 0, status: "pending", deliverables: ["Pitch deck template", "Website hero", "LinkedIn assets"] },
      ],
      milestones: [
        { id: "m1", title: "Discovery Complete", due_date: "2026-06-13", completed: false, owner: "Kavya Nair" },
        { id: "m2", title: "Strategy Approved", due_date: "2026-06-27", completed: false, owner: "Priya Sharma" },
        { id: "m3", title: "Identity Approved", due_date: "2026-07-18", completed: false, owner: "Kavya Nair" },
        { id: "m4", title: "Final Delivery", due_date: "2026-07-25", completed: false, owner: "Nisha Rao" },
      ],
      risks: [
        { id: "r1", description: "Founder's vision may be hard to translate — risk of multiple creative rounds", impact: "medium", probability: "medium", mitigation: "Use structured creative filters in workshops. Present only 2 directions max." },
      ]
    },
    strategy: {
      objective: "Create a brand identity that positions Horizon AI as the serious infrastructure choice — not a demo company, but a platform that enterprises trust.",
      key_messages: ["Infrastructure for the AI era", "Built for scale from day one", "The foundation serious teams choose"],
      target_audience: "Enterprise CTOs, engineering leads 30–50. Pragmatic, skeptical of hype.",
      tone_of_voice: "Precise, confident, quiet strength. No buzzwords. No excitement that hasn't been earned.",
      brand_pillars: ["Precision", "Scale", "Trust", "Edge"],
      competitors: ["Cohere", "Anthropic (competitor positioning)", "Scale AI", "Weights & Biases"],
      differentiators: ["Infrastructure-first vs application-first", "No hype positioning", "Built for enterprise from day one"],
      success_metrics: [
        { metric: "Series A deck response", target: "Investor calls within 2 weeks of deck send" },
        { metric: "Talent applications post-rebrand", target: "+30% increase" },
      ],
      execution_notes: "Discovery workshop on June 3. Brand needs to be enterprise-ready but attract top technical talent."
    },
    notifications: [
      { id: "n1", from: "Aryan Chopra", to: ["kavya@studio.io"], subject: "Pre-workshop Reading — Quick Question", preview: "Kavya, read the questionnaire back. Very aligned. Quick Q: is 'Horizon' too literal? Open to discussing a name review in the workshop.", date: "2026-06-01 22:30", read: false, type: "client", priority: "normal" },
    ],
    last_activity: "2026-06-01T22:30:00"
  },
];

export const STATS = {
  total_projects: PROJECTS.length,
  active: PROJECTS.filter(p => ["execution", "planning", "review", "discovery"].includes(p.status)).length,
  delivered: PROJECTS.filter(p => p.status === "delivered").length,
  on_hold: PROJECTS.filter(p => p.status === "on-hold").length,
  critical_priority: PROJECTS.filter(p => p.priority === "critical").length,
  open_escalations: PROJECTS.flatMap(p => p.escalations).filter(e => e.status !== "resolved").length,
  unread_notifications: PROJECTS.flatMap(p => p.notifications).filter(n => !n.read).length,
  upcoming_deadlines: PROJECTS.filter(p => {
    const d = new Date(p.deadline);
    const now = new Date("2026-06-04");
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff > 0 && p.status !== "delivered";
  }).length,
};
