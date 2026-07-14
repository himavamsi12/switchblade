import type { ClientProfile } from "@/types";
import { MentalityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Mail, Phone, MessageCircle, Zap, AlertTriangle, Heart } from "lucide-react";

interface Props { client: ClientProfile }

const HEALTH: Record<string, { label: string; class: string; dot: string }> = {
  excellent: { label: "Excellent", class: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  good:      { label: "Good",      class: "text-teal-700 bg-teal-50 border-teal-200",         dot: "bg-teal-500" },
  "at-risk": { label: "At Risk",   class: "text-amber-700 bg-amber-50 border-amber-200",       dot: "bg-amber-500" },
  critical:  { label: "Critical",  class: "text-red-700 bg-red-50 border-red-200",             dot: "bg-red-500" },
};

const COMM: Record<string, string> = {
  email: "Email",
  calls: "Phone Calls",
  slack: "Slack / Chat",
  "in-person": "In-Person",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 w-40 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-slate-700">{value}</span>
    </div>
  );
}

export function ClientTab({ client }: Props) {
  const health = HEALTH[client.health];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 shrink-0">
          {client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
          <p className="text-sm text-slate-500">{client.role} · {client.company}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <MentalityBadge mentality={client.mentality} />
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", health.class)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", health.dot)} />
              Relationship: {health.label}
            </span>
          </div>
        </div>
        <div className="shrink-0 space-y-2">
          <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
            <Mail size={14} /> {client.email}
          </a>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone size={14} /> {client.phone}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Client Profile</h3>
          </div>
          <div className="px-5 py-2">
            <Row label="Communication pref." value={COMM[client.communication_preference]} />
            <Row label="Response time" value={client.response_time.charAt(0).toUpperCase() + client.response_time.slice(1)} />
            <Row label="Decision style" value={client.decision_style} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={13} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Key Concerns</h3>
          </div>
          <div className="px-5 py-4 space-y-2">
            {client.key_concerns.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] text-amber-500 font-bold">{i + 1}</span>
                </span>
                <p className="text-sm text-slate-700">{c}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Zap size={13} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-900">Expectations</h3>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-slate-700 leading-relaxed">{client.expectations}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Heart size={13} className="text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-900">Relationship Notes</h3>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-slate-700 leading-relaxed">{client.relationship_notes}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={14} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-700">How to work with this client</h3>
        </div>
        {client.mentality === "visionary" && (
          <p className="text-sm text-slate-600 leading-relaxed">This client is a <strong>Visionary</strong> — they think in big pictures. Lead with impact and ambition. Use storytelling over data. Give them 2 bold options, not 5 safe ones. Let them feel like they&apos;re shaping the direction.</p>
        )}
        {client.mentality === "collaborative" && (
          <p className="text-sm text-slate-600 leading-relaxed">This client is <strong>Collaborative</strong> — they want to co-create. Include them in process. Share WIP often. Ask their opinion on decisions. They&apos;ll reward you with fast approvals when they feel heard.</p>
        )}
        {client.mentality === "micromanager" && (
          <p className="text-sm text-slate-600 leading-relaxed">This client is a <strong>Micromanager</strong> — they need control. Give it to them through structured check-ins. Document every decision. Surprise is the enemy. Structured visibility = trust = autonomy over time.</p>
        )}
        {client.mentality === "technical" && (
          <p className="text-sm text-slate-600 leading-relaxed">This client is <strong>Technical</strong> — they respect competence. Show your work. Explain the &lsquo;why&rsquo; behind decisions. Back aesthetic choices with logic. They&apos;ll push back if something feels like decoration.</p>
        )}
        {client.mentality === "hands-off" && (
          <p className="text-sm text-slate-600 leading-relaxed">This client is <strong>Hands-off</strong> — they trust you. Don&apos;t mistake this for disengagement. Send crisp updates at key milestones. Prepare decision packages so approvals are easy and fast.</p>
        )}
        {client.mentality === "budget-focused" && (
          <p className="text-sm text-slate-600 leading-relaxed">This client is <strong>Budget-Focused</strong> — every ask is evaluated through cost. Lead with ROI. Any scope change needs a value justification. Keep finances visible so they don&apos;t feel surprised.</p>
        )}
      </div>
    </div>
  );
}
