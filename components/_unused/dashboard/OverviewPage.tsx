import Link from "next/link";
import { PROJECTS, STATS } from "@/data/mock";
import { StatusBadge, PriorityBadge } from "@/components/_unused/ui/Badge";
import { ProgressBar } from "@/components/_unused/ui/ProgressBar";
import { AvatarGroup } from "@/components/_unused/ui/Avatar";
import {
  AlertTriangle, CheckCircle2, Clock, TrendingUp,
  FolderOpen, Mail, ChevronRight, ArrowUpRight, Calendar, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: LucideIcon; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", color)}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function daysLeft(deadline: string) {
  const diff = (new Date(deadline).getTime() - new Date("2026-06-04").getTime()) / 86400000;
  return Math.ceil(diff);
}

export function OverviewPage() {
  const activeProjects = PROJECTS.filter(p => ["execution", "planning", "review", "discovery"].includes(p.status));
  const allEscalations = PROJECTS.flatMap(p => p.escalations.filter(e => e.status !== "resolved").map(e => ({ ...e, project: p })));
  const allNotifications = PROJECTS.flatMap(p => p.notifications.filter(n => !n.read).map(n => ({ ...n, project: p }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingMilestones = PROJECTS.flatMap(p => p.planning.milestones.filter(m => !m.completed).map(m => ({ ...m, project: p }))).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value={STATS.active} sub={`${STATS.total_projects} total`} icon={FolderOpen} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Delivered" value={STATS.delivered} sub="This quarter" icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Open Escalations" value={STATS.open_escalations} sub="Needs attention" icon={AlertTriangle} color="bg-red-50 text-red-600" />
        <StatCard label="Unread Emails" value={STATS.unread_notifications} sub="From clients & team" icon={Mail} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Active Projects</h2>
              <p className="text-xs text-slate-400">{activeProjects.length} projects in flight</p>
            </div>
            <Link href="/projects" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {activeProjects.map(project => {
              const days = daysLeft(project.deadline);
              const urgent = days <= 14;
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{project.name}</span>
                      <PriorityBadge priority={project.priority} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{project.code}</span>
                      <span>·</span>
                      <span>{project.type}</span>
                      <span>·</span>
                      <span>{project.client.company}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={project.progress} showLabel />
                    </div>
                  </div>
                  <div className="shrink-0 text-right space-y-1.5">
                    <StatusBadge status={project.status} />
                    <div className={cn("text-xs font-medium flex items-center gap-1 justify-end", urgent ? "text-red-500" : "text-slate-400")}>
                      <Clock size={11} />
                      {days > 0 ? `${days}d left` : "Overdue"}
                    </div>
                  </div>
                  <AvatarGroup members={project.team} max={3} />
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                Open Escalations
              </h2>
              <span className="text-xs bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full">{allEscalations.length}</span>
            </div>
            {allEscalations.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">All clear — no open escalations.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {allEscalations.map(esc => (
                  <Link key={esc.id} href={`/projects/${esc.project.id}?tab=escalations`} className="block px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", esc.severity === "critical" ? "bg-red-500" : esc.severity === "high" ? "bg-orange-500" : "bg-amber-400")} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 leading-snug">{esc.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{esc.project.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Calendar size={14} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Milestones</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingMilestones.map(m => {
                const days = daysLeft(m.due_date);
                return (
                  <Link key={m.id} href={`/projects/${m.project.id}?tab=planning`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={cn("text-xs font-bold w-8 text-center rounded py-1", days <= 7 ? "bg-red-50 text-red-600" : days <= 14 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500")}>{days}d</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{m.title}</p>
                      <p className="text-xs text-slate-400 truncate">{m.project.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Mail size={14} className="text-indigo-500" />
              Unread Emails
            </h2>
            <Link href="/notifications" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ChevronRight size={12} /></Link>
          </div>
          {allNotifications.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">Inbox zero — all caught up.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {allNotifications.slice(0, 5).map(n => (
                <Link key={n.id} href={`/projects/${n.project.id}?tab=notifications`} className="flex items-start gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.type === "client" ? "bg-indigo-500" : n.type === "escalation" ? "bg-red-500" : "bg-slate-300")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">{n.subject}</p>
                      {n.priority === "urgent" && <span className="text-[10px] bg-red-50 text-red-500 font-medium px-1.5 py-0.5 rounded shrink-0">Urgent</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{n.from} · {n.project.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{n.preview}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <TrendingUp size={14} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900">Budget Overview</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {PROJECTS.filter(p => p.status !== "on-hold").map(p => {
              const pct = Math.round((p.budget.spent / p.budget.allocated) * 100);
              const over = pct > 90;
              return (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-700 truncate">{p.name}</span>
                      <span className={cn("text-xs font-semibold", over ? "text-red-500" : "text-slate-500")}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-slate-400">₹{(p.budget.spent / 100000).toFixed(1)}L spent</span>
                      <span className="text-[11px] text-slate-400">of ₹{(p.budget.allocated / 100000).toFixed(1)}L</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
