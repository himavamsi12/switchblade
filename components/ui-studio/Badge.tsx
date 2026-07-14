import { cn } from "@/lib/utils";
import type { ProjectStatus, Priority, EscalationSeverity, ClientMentality } from "@/types";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; class: string }> = {
  discovery:  { label: "Discovery",  class: "bg-violet-50 text-violet-700 border-violet-200" },
  planning:   { label: "Planning",   class: "bg-blue-50 text-blue-700 border-blue-200" },
  execution:  { label: "Execution",  class: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  review:     { label: "Review",     class: "bg-amber-50 text-amber-700 border-amber-200" },
  delivered:  { label: "Delivered",  class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "on-hold":  { label: "On Hold",    class: "bg-slate-100 text-slate-500 border-slate-200" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string }> = {
  critical: { label: "Critical", dot: "bg-red-500" },
  high:     { label: "High",     dot: "bg-orange-500" },
  medium:   { label: "Medium",   dot: "bg-amber-400" },
  low:      { label: "Low",      dot: "bg-slate-300" },
};

const SEVERITY_CONFIG: Record<EscalationSeverity, { label: string; class: string }> = {
  critical: { label: "Critical", class: "bg-red-50 text-red-700 border-red-200" },
  high:     { label: "High",     class: "bg-orange-50 text-orange-700 border-orange-200" },
  medium:   { label: "Medium",   class: "bg-amber-50 text-amber-700 border-amber-200" },
  low:      { label: "Low",      class: "bg-slate-50 text-slate-600 border-slate-200" },
};

const MENTALITY_CONFIG: Record<ClientMentality, { label: string; class: string }> = {
  visionary:      { label: "Visionary",      class: "bg-purple-50 text-purple-700 border-purple-200" },
  collaborative:  { label: "Collaborative",  class: "bg-teal-50 text-teal-700 border-teal-200" },
  micromanager:   { label: "Micromanager",   class: "bg-red-50 text-red-700 border-red-200" },
  technical:      { label: "Technical",      class: "bg-blue-50 text-blue-700 border-blue-200" },
  "hands-off":    { label: "Hands-off",      class: "bg-slate-50 text-slate-600 border-slate-200" },
  "budget-focused": { label: "Budget-Focused", class: "bg-amber-50 text-amber-700 border-amber-200" },
};

interface StatusBadgeProps { status: ProjectStatus; className?: string }
interface PriorityBadgeProps { priority: Priority; className?: string }
interface SeverityBadgeProps { severity: EscalationSeverity; className?: string }
interface MentalityBadgeProps { mentality: ClientMentality; className?: string }

const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border";

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return <span className={cn(base, cfg.class, className)}>{cfg.label}</span>;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-white border-slate-200 text-slate-700", className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const cfg = SEVERITY_CONFIG[severity];
  return <span className={cn(base, cfg.class, className)}>{cfg.label}</span>;
}

export function MentalityBadge({ mentality, className }: MentalityBadgeProps) {
  const cfg = MENTALITY_CONFIG[mentality];
  return <span className={cn(base, cfg.class, className)}>{cfg.label}</span>;
}
