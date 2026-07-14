import { cn } from "@/lib/utils";

const DEPT_COLORS: Record<string, string> = {
  creative:  "bg-violet-100 text-violet-700",
  strategy:  "bg-teal-100 text-teal-700",
  design:    "bg-indigo-100 text-indigo-700",
  pm:        "bg-amber-100 text-amber-700",
  development: "bg-blue-100 text-blue-700",
};

interface AvatarProps {
  initials: string;
  department?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { xs: "w-6 h-6 text-[10px]", sm: "w-7 h-7 text-xs", md: "w-8 h-8 text-xs", lg: "w-10 h-10 text-sm" };

export function Avatar({ initials, department = "design", size = "md", className }: AvatarProps) {
  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold shrink-0", SIZES[size], DEPT_COLORS[department] ?? "bg-slate-100 text-slate-600", className)}>
      {initials}
    </div>
  );
}

export function AvatarGroup({ members, max = 3 }: { members: { avatar: string; department: string; name: string }[]; max?: number }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className="flex -space-x-1.5">
      {shown.map((m, i) => (
        <div key={i} title={m.name} className="ring-2 ring-white rounded-full">
          <Avatar initials={m.avatar} department={m.department} size="sm" />
        </div>
      ))}
      {extra > 0 && (
        <div className="w-7 h-7 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500">
          +{extra}
        </div>
      )}
    </div>
  );
}
