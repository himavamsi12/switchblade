import type { EmailNotification } from "@/types";
import { cn } from "@/lib/utils";
import { Mail, AlertCircle, Users, Bot } from "lucide-react";

interface Props { notifications: EmailNotification[] }

const TYPE_CONFIG = {
  client:    { icon: Mail,         color: "text-indigo-500", bg: "bg-indigo-50", label: "Client" },
  team:      { icon: Users,        color: "text-teal-500",   bg: "bg-teal-50",   label: "Team" },
  system:    { icon: Bot,          color: "text-slate-400",  bg: "bg-slate-50",  label: "System" },
  escalation:{ icon: AlertCircle,  color: "text-red-500",    bg: "bg-red-50",    label: "Escalation" },
};

export function NotificationsTab({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-16">
        <Mail size={28} className="text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">No emails on this project yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-3xl">
      {notifications.map(n => {
        const cfg = TYPE_CONFIG[n.type];
        const Icon = cfg.icon;
        return (
          <div key={n.id} className={cn("bg-white rounded-xl border overflow-hidden transition-all", !n.read ? "border-indigo-200 ring-1 ring-indigo-100/50" : "border-slate-200")}>
            <div className="flex items-start gap-4 px-5 py-4">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                <Icon size={15} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{n.subject}</span>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                    {n.priority === "urgent" && (
                      <span className="text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full border border-red-200">Urgent</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{n.date}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  <span className="font-medium">{n.from}</span>
                  {n.to.length > 0 && <span> → {n.to.join(", ")}</span>}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{n.preview}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
