import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  size?: "sm" | "md";
  className?: string;
  showLabel?: boolean;
}

function getColor(v: number) {
  if (v === 100) return "bg-emerald-500";
  if (v >= 70) return "bg-indigo-500";
  if (v >= 40) return "bg-amber-400";
  return "bg-slate-300";
}

export function ProgressBar({ value, size = "sm", className, showLabel }: ProgressBarProps) {
  const height = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 rounded-full bg-slate-100 overflow-hidden", height)}>
        <div
          className={cn("h-full rounded-full transition-all duration-300", getColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 w-8 text-right font-medium">{value}%</span>
      )}
    </div>
  );
}
