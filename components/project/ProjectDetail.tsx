"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup } from "@/components/ui/Avatar";
import { OverviewTab } from "./tabs/OverviewTab";
import { QuestionnaireTab } from "./tabs/QuestionnaireTab";
import { WorkshopsTab } from "./tabs/WorkshopsTab";
import { EscalationsTab } from "./tabs/EscalationsTab";
import { PlanningTab } from "./tabs/PlanningTab";
import { StrategyTab } from "./tabs/StrategyTab";
import { ClientTab } from "./tabs/ClientTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { ChevronLeft } from "lucide-react";

type Tab = "overview" | "questionnaire" | "workshops" | "escalations" | "planning" | "strategy" | "client" | "notifications";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "questionnaire", label: "Questionnaire" },
  { id: "workshops", label: "Workshops" },
  { id: "escalations", label: "Escalations" },
  { id: "planning", label: "Planning" },
  { id: "strategy", label: "Strategy" },
  { id: "client", label: "Client Profile" },
  { id: "notifications", label: "Emails" },
];

function daysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - new Date("2026-06-04").getTime()) / 86400000);
}

interface ProjectDetailProps { project: Project }

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const days = daysLeft(project.deadline);
  const openEsc = project.escalations.filter(e => e.status !== "resolved").length;
  const unread = project.notifications.filter(n => !n.read).length;

  const badgeCounts: Partial<Record<Tab, number>> = {
    escalations: openEsc || 0,
    notifications: unread || 0,
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 pt-6 pb-0">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-4 transition-colors">
            <ChevronLeft size={13} /> Back to Projects
          </Link>

          <div className="flex items-start gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="font-mono text-xs bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{project.code}</span>
                <span>{project.type}</span>
                <span>·</span>
                <span className="font-medium text-slate-600">{project.client.company}</span>
                <span>·</span>
                <span>{project.client.name}, {project.client.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{project.progress}%</div>
                <div className="text-xs text-slate-400">Progress</div>
              </div>
              <div className="text-center">
                <div className={cn("text-xl font-bold", days < 0 ? "text-red-600" : days <= 14 ? "text-amber-600" : "text-slate-900")}>
                  {days < 0 ? "Overdue" : `${days}d`}
                </div>
                <div className="text-xs text-slate-400">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">
                  ₹{(project.budget.spent / 100000).toFixed(1)}L
                </div>
                <div className="text-xs text-slate-400">of ₹{(project.budget.allocated / 100000).toFixed(1)}L</div>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <AvatarGroup members={project.team} max={5} />
            </div>
          </div>

          <div className="mb-5">
            <ProgressBar value={project.progress} size="md" />
          </div>

          <div className="flex items-center gap-0 -mb-px overflow-x-auto">
            {TABS.map(tab => {
              const cnt = badgeCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  {tab.label}
                  {cnt != null && cnt > 0 && (
                    <span className={cn("text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold", activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-red-100 text-red-600")}>
                      {cnt}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-8 py-7">
        {activeTab === "overview"       && <OverviewTab project={project} />}
        {activeTab === "questionnaire"  && <QuestionnaireTab questionnaire={project.questionnaire} />}
        {activeTab === "workshops"      && <WorkshopsTab workshops={project.workshops} />}
        {activeTab === "escalations"    && <EscalationsTab escalations={project.escalations} />}
        {activeTab === "planning"       && <PlanningTab planning={project.planning} />}
        {activeTab === "strategy"       && <StrategyTab strategy={project.strategy} />}
        {activeTab === "client"         && <ClientTab client={project.client} />}
        {activeTab === "notifications"  && <NotificationsTab notifications={project.notifications} />}
      </div>
    </div>
  );
}
