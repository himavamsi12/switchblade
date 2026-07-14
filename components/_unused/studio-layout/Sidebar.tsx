"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderKanban, Bell, Users, BarChart2,
  ChevronRight, Settings, LogOut
} from "lucide-react";
import { STATS } from "@/data/mock";

const NAV = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban, badge: STATS.active },
  { label: "Notifications", href: "/notifications", icon: Bell, badge: STATS.unread_notifications },
  { label: "Team", href: "/team", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 flex flex-col z-40">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 shrink-0">
          <rect width="36" height="36" rx="9" fill="#6366F1"/>
          <rect x="9" y="9" width="7" height="18" rx="2" fill="white"/>
          <rect x="20" y="9" width="7" height="11" rx="2" fill="white" opacity="0.7"/>
          <rect x="20" y="23" width="7" height="4" rx="2" fill="white" opacity="0.35"/>
        </svg>
        <div>
          <div className="text-white text-sm font-semibold tracking-tight">Studio Command</div>
          <div className="text-slate-500 text-xs">Creative Director</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Workspace</span>
        </div>
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                active
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon size={16} className={cn(active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="flex-1 font-medium">{label}</span>
              {badge != null && badge > 0 && (
                <span className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 font-medium min-w-[20px] text-center",
                  active ? "bg-indigo-500/30 text-indigo-300" : "bg-slate-700 text-slate-300"
                )}>{badge}</span>
              )}
              {active && <ChevronRight size={12} className="text-indigo-400/60" />}
            </Link>
          );
        })}
      </nav>

      {STATS.open_escalations > 0 && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="text-red-400 text-xs font-semibold uppercase tracking-wide">Active Escalations</div>
          <div className="text-white text-lg font-bold">{STATS.open_escalations}</div>
          <div className="text-red-400/70 text-xs">Require your attention</div>
        </div>
      )}

      <div className="px-3 pb-4 border-t border-white/5 pt-3 space-y-0.5">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 text-sm transition-all">
          <Settings size={15} />
          <span>Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 text-sm transition-all">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="px-4 pb-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">CD</div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-semibold truncate">Creative Director</div>
          <div className="text-slate-500 text-xs truncate">dinesh@sixjuly.com</div>
        </div>
      </div>
    </aside>
  );
}
