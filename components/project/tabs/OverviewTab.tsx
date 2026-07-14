import type { Project } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SeverityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertTriangle, Calendar, Users, Target, type LucideIcon } from "lucide-react";

interface Props { project: Project }

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
        <Icon size={14} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function OverviewTab({ project }: Props) {
  const completedMilestones = project.planning.milestones.filter(m => m.completed).length;
  const openEsc = project.escalations.filter(e => e.status !== "resolved");

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
        <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="Team" icon={Users}>
          <div className="space-y-3">
            {project.team.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar initials={member.avatar} department={member.department} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{member.name}</div>
                  <div className="text-xs text-slate-400">{member.role}</div>
                </div>
                {member.id === project.lead.id && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">Lead</span>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Phase Progress" icon={Target}>
          <div className="space-y-4">
            {project.planning.phases.map(phase => (
              <div key={phase.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", phase.status === "completed" ? "bg-emerald-500" : phase.status === "active" ? "bg-indigo-500" : phase.status === "delayed" ? "bg-red-500" : "bg-slate-200")} />
                    <span className="text-xs font-medium text-slate-700">{phase.name}</span>
                  </div>
                  <span className={cn("text-xs font-semibold", phase.status === "completed" ? "text-emerald-600" : phase.status === "active" ? "text-indigo-600" : "text-slate-400")}>{phase.progress}%</span>
                </div>
                <ProgressBar value={phase.progress} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Milestones" icon={Calendar}>
          <div className="space-y-2.5">
            {project.planning.milestones.map(m => (
              <div key={m.id} className="flex items-start gap-2.5">
                {m.completed
                  ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  : <Circle size={15} className="text-slate-300 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-medium leading-snug", m.completed ? "text-slate-400 line-through" : "text-slate-700")}>{m.title}</p>
                  <p className="text-[11px] text-slate-400">{new Date(m.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {m.owner}</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
              {completedMilestones} of {project.planning.milestones.length} completed
            </div>
          </div>
        </Section>
      </div>

      {openEsc.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-red-700">Open Escalations — Needs Attention</h3>
          </div>
          <div className="space-y-3">
            {openEsc.map(e => (
              <div key={e.id} className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{e.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.description}</p>
                    <p className="text-xs text-slate-400 mt-1.5">Raised by {e.raised_by} · {new Date(e.raised_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <SeverityBadge severity={e.severity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Budget Tracking</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-slate-400 mb-1">Allocated</div>
            <div className="text-xl font-bold text-slate-900">₹{(project.budget.allocated / 100000).toFixed(2)}L</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Spent</div>
            <div className="text-xl font-bold text-indigo-600">₹{(project.budget.spent / 100000).toFixed(2)}L</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Remaining</div>
            <div className={cn("text-xl font-bold", project.budget.allocated - project.budget.spent < 0 ? "text-red-600" : "text-emerald-600")}>
              ₹{((project.budget.allocated - project.budget.spent) / 100000).toFixed(2)}L
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={Math.round((project.budget.spent / project.budget.allocated) * 100)} size="md" showLabel />
        </div>
      </div>
    </div>
  );
}
