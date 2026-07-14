"use client";

import { useState } from "react";
import Link from "next/link";
import { PROJECTS } from "@/data/mock";
import { StatusBadge, PriorityBadge } from "@/components/_unused/ui/Badge";
import { ProgressBar } from "@/components/_unused/ui/ProgressBar";
import { AvatarGroup } from "@/components/_unused/ui/Avatar";
import { ArrowUpRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const TABS: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Discovery", value: "discovery" },
  { label: "Planning", value: "planning" },
  { label: "Execution", value: "execution" },
  { label: "Review", value: "review" },
  { label: "Delivered", value: "delivered" },
  { label: "On Hold", value: "on-hold" },
];

function daysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - new Date("2026-06-04").getTime()) / 86400000);
}

export function ProjectsListPage() {
  const [activeTab, setActiveTab] = useState<ProjectStatus | "all">("all");

  const filtered = activeTab === "all" ? PROJECTS : PROJECTS.filter(p => p.status === activeTab);

  return (
    <div className="p-8">
      <div className="flex items-center gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
        {TABS.map(tab => {
          const count = tab.value === "all" ? PROJECTS.length : PROJECTS.filter(p => p.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5",
                activeTab === tab.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn("text-xs rounded-full px-1.5 py-0.5 font-medium", activeTab === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map(project => {
          const days = daysLeft(project.deadline);
          const openEsc = project.escalations.filter(e => e.status !== "resolved").length;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-5 px-6 py-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-base font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">{project.name}</span>
                    <StatusBadge status={project.status} />
                    <PriorityBadge priority={project.priority} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500">{project.code}</span>
                    <span>{project.type}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-600">{project.client.company}</span>
                    <span>·</span>
                    <span>{project.client.name}</span>
                  </div>
                  <ProgressBar value={project.progress} showLabel size="md" />
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <AvatarGroup members={project.team} max={4} />
                  <div className="text-[11px] text-slate-400">{project.lead.name}</div>
                </div>

                <div className="shrink-0 text-right space-y-2 w-36">
                  <div className={cn("text-sm font-semibold flex items-center justify-end gap-1", days < 0 ? "text-red-600" : days <= 14 ? "text-amber-600" : "text-slate-600")}>
                    <Clock size={13} />
                    {days < 0 ? "Overdue" : `${days} days left`}
                  </div>
                  <div className="text-xs text-slate-400">Due {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  <div className="text-xs text-slate-500">
                    ₹{(project.budget.spent / 100000).toFixed(1)}L <span className="text-slate-300">/</span> ₹{(project.budget.allocated / 100000).toFixed(1)}L
                  </div>
                </div>

                {openEsc > 0 && (
                  <div className="shrink-0 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                    {openEsc} escalation{openEsc > 1 ? "s" : ""}
                  </div>
                )}

                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
