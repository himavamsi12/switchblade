import type { Escalation } from "@/types";
import { SeverityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface Props { escalations: Escalation[] }

const CATEGORY_COLOR: Record<string, string> = {
  scope: "bg-violet-50 text-violet-700",
  deadline: "bg-red-50 text-red-700",
  budget: "bg-amber-50 text-amber-700",
  quality: "bg-blue-50 text-blue-700",
  client: "bg-orange-50 text-orange-700",
  team: "bg-teal-50 text-teal-700",
};

const STATUS_CONFIG = {
  open:        { icon: AlertTriangle, color: "text-red-500",    label: "Open" },
  "in-progress": { icon: Clock,       color: "text-amber-500",  label: "In Progress" },
  resolved:    { icon: CheckCircle2,  color: "text-emerald-500", label: "Resolved" },
};

export function EscalationsTab({ escalations }: Props) {
  if (escalations.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 size={32} className="text-emerald-300 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No escalations on this project — clean run.</p>
      </div>
    );
  }

  const open = escalations.filter(e => e.status !== "resolved");
  const resolved = escalations.filter(e => e.status === "resolved");

  return (
    <div className="space-y-6 max-w-4xl">
      {open.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Open ({open.length})
          </h3>
          <div className="space-y-3">
            {open.map(e => <EscalationCard key={e.id} escalation={e} />)}
          </div>
        </div>
      )}
      {resolved.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Resolved ({resolved.length})
          </h3>
          <div className="space-y-3">
            {resolved.map(e => <EscalationCard key={e.id} escalation={e} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function EscalationCard({ escalation: e }: { escalation: Escalation }) {
  const cfg = STATUS_CONFIG[e.status];
  const Icon = cfg.icon;

  return (
    <div className={cn("bg-white rounded-xl border overflow-hidden", e.status === "resolved" ? "border-slate-200 opacity-70" : "border-slate-200")}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icon size={15} className={cn("shrink-0 mt-0.5", cfg.color)} />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{e.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", CATEGORY_COLOR[e.category] ?? "bg-slate-50 text-slate-600")}>{e.category}</span>
              <span className="text-xs text-slate-400">Raised by {e.raised_by}</span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400">{new Date(e.raised_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </div>
        <SeverityBadge severity={e.severity} />
      </div>

      <div className="px-5 py-4">
        <p className="text-sm text-slate-600 leading-relaxed">{e.description}</p>
        {e.resolution && (
          <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">Resolution</span>
              {e.resolved_at && <span className="text-xs text-emerald-500/60 ml-auto">{new Date(e.resolved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">{e.resolution}</p>
          </div>
        )}
      </div>
    </div>
  );
}
