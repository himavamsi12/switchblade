"use client";

import { Bell, Search } from "lucide-react";
import { STATS } from "@/data/mock";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold text-slate-900 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search projects..."
            className="h-9 pl-9 pr-4 w-56 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 transition-all"
          />
        </div>

        <button className="relative h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
          <Bell size={15} className="text-slate-500" />
          {STATS.unread_notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {STATS.unread_notifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
