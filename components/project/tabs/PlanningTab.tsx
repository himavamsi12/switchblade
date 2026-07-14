import type { PlanningData } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertTriangle, ChevronRight } from "lucide-react";

interface Props { planning: PlanningData }

const PHASE_STATUS: Record<string, { dot: string; label: string; labelColor: string }> = {
  completed: { dot: "bg-emerald-500", label: "Completed", labelColor: "text-emerald-600" },
  active:    { dot: "bg-indigo-500 animate-pulse", label: "Active", labelColor: "text-indigo-600" },
  delayed:   { dot: "bg-red-500", label: "Delayed", labelColor: "text-red-600" },
  pending:   { dot: "bg-slate-200", label: "Pending", labelColor: "text-slate-400" },
};

const IMPACT_COLOR = { high: "text-red-600 bg-red-50", medium: "text-amber-600 bg-amber-50", low: "text-slate-500 bg-slate-50" };

export function PlanningTab({ planning }: Props) {
  function daysLeft(d: string) {
    return Math.ceil((new Date(d).getTime() - new Date("2026-06-04").getTime()) / 86400000);
  }

  return (
    <div className="space-y-7 max-w-5xl">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Project Phases</h3>
          <span className="text-xs text-slate-400">Kickoff: {new Date(planning.kickoff_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <div className="p-6 space-y-5">
          {planning.phases.map((phase, i) => {
            const cfg = PHASE_STATUS[phase.status];
            return (
              <div key={phase.id} className={cn("flex gap-5 relative")}>
                {i < planning.phases.length - 1 && (
                  <div className="absolute left-[9px] top-7 bottom-0 w-px bg-slate-100" />
                )}
                <div className={cn("w-4.5 h-4.5 rounded-full mt-1 shrink-0 ring-2 ring-white z-10", cfg.dot, "w-[18px] h-[18px]")} />
                <div className="flex-1 min-w-0 pb-5">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{phase.name}</span>
                      <span className={cn("ml-2 text-xs font-medium", cfg.labelColor)}>{cfg.label}</span>
                    </div>
                    <div className="text-xs text-slate-400 shrink-0">
                      {new Date(phase.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {" "}—{" "}
                      {new Date(phase.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <ProgressBar value={phase.progress} size="md" showLabel className="mb-3" />
                  <div className="flex flex-wrap gap-1.5">
                    {phase.deliverables.map((d, j) => (
                      <span key={j} className={cn("text-xs px-2 py-1 rounded-md border", phase.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200 line-through opacity-60" : "bg-slate-50 text-slate-600 border-slate-200")}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Milestones</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {planning.milestones.map(m => {
            const days = daysLeft(m.due_date);
            return (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                {m.completed
                  ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  : <Circle size={16} className={cn("shrink-0", days <= 7 ? "text-red-300" : "text-slate-300")} />}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", m.completed ? "text-slate-400 line-through" : "text-slate-800")}>{m.title}</p>
                  <p className="text-xs text-slate-400">Owner: {m.owner}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500 font-medium">{new Date(m.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  {m.completed
                    ? <div className="text-[11px] text-emerald-500">Completed {new Date(m.completed_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    : <div className={cn("text-[11px] font-medium", days < 0 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-slate-400")}>{days < 0 ? "Overdue" : `in ${days} days`}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {planning.risks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Risk Register</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {planning.risks.map(risk => (
              <div key={risk.id} className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <p className="text-sm text-slate-800 font-medium leading-snug">{risk.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded", IMPACT_COLOR[risk.impact])}>Impact: {risk.impact}</span>
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded", IMPACT_COLOR[risk.probability])}>Prob: {risk.probability}</span>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-start gap-2">
                  <ChevronRight size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed">{risk.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
