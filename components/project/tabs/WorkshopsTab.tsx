import type { WorkshopSession } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Users, Calendar, ArrowRight } from "lucide-react";

interface Props { workshops: WorkshopSession[] }

const STATUS = {
  completed:  { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200", label: "Completed" },
  scheduled:  { icon: Clock,        color: "text-indigo-500",  bg: "bg-indigo-50 border-indigo-200",   label: "Scheduled" },
  cancelled:  { icon: XCircle,      color: "text-slate-400",   bg: "bg-slate-50 border-slate-200",     label: "Cancelled" },
};

export function WorkshopsTab({ workshops }: Props) {
  if (workshops.length === 0) {
    return <div className="text-center py-16 text-slate-400 text-sm">No workshops scheduled yet.</div>;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {workshops.map((ws, i) => {
        const cfg = STATUS[ws.status];
        const Icon = cfg.icon;
        return (
          <div key={ws.id} className={cn("bg-white rounded-xl border overflow-hidden", ws.status === "scheduled" ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-200")}>
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{ws.title}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(ws.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{ws.duration} mins</span>
                    <span className="flex items-center gap-1"><Users size={11} />Facilitated by {ws.facilitator}</span>
                  </div>
                </div>
              </div>
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", cfg.bg)}>
                <Icon size={11} className={cfg.color} />
                {cfg.label}
              </span>
            </div>

            {ws.status !== "cancelled" && (
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attendees</div>
                  <div className="space-y-1">
                    {ws.attendees.map((a, j) => (
                      <div key={j} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Objectives</div>
                  <div className="space-y-1.5">
                    {ws.objectives.map((o, j) => (
                      <div key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                        </span>
                        {o}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {ws.outcomes.length > 0 ? (
                    <>
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Key Outcomes</div>
                      <div className="space-y-1.5">
                        {ws.outcomes.map((o, j) => (
                          <div key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                            {o}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Outcomes pending — workshop upcoming.</div>
                  )}
                  {ws.next_steps.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Next Steps</div>
                      <div className="space-y-1.5">
                        {ws.next_steps.map((s, j) => (
                          <div key={j} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <ArrowRight size={11} className="text-indigo-400 shrink-0 mt-0.5" />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
