import type { StrategyData } from "@/types";
import { Target, MessageSquare, Users, Mic2, Layers, Swords, Zap, BarChart3, FileText, type LucideIcon } from "lucide-react";

interface Props { strategy: StrategyData }

function Card({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <Icon size={14} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Chip({ text, color = "slate" }: { text: string; color?: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    teal:   "bg-teal-50 text-teal-700 border-teal-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    slate:  "bg-slate-50 text-slate-600 border-slate-200",
    red:    "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border mr-1.5 mb-1.5 ${colors[color] ?? colors.slate}`}>{text}</span>
  );
}

export function StrategyTab({ strategy }: Props) {
  return (
    <div className="space-y-5 max-w-5xl">
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Strategic Objective</h3>
        </div>
        <p className="text-base font-medium text-indigo-900 leading-relaxed">{strategy.objective}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card icon={MessageSquare} title="Key Messages">
          <div className="space-y-2">
            {strategy.key_messages.map((msg, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
                <span className="text-xs font-bold text-indigo-400 w-5 shrink-0 mt-0.5">{`0${i + 1}`}</span>
                <p className="text-sm text-slate-700 font-medium leading-snug">&ldquo;{msg}&rdquo;</p>
              </div>
            ))}
          </div>
        </Card>

        <Card icon={Users} title="Target Audience">
          <p className="text-sm text-slate-700 leading-relaxed">{strategy.target_audience}</p>
        </Card>

        <Card icon={Mic2} title="Tone of Voice">
          <p className="text-sm text-slate-700 leading-relaxed">{strategy.tone_of_voice}</p>
        </Card>

        <Card icon={Layers} title="Brand Pillars">
          <div className="flex flex-wrap mt-1">
            {strategy.brand_pillars.map(p => <Chip key={p} text={p} color="indigo" />)}
          </div>
        </Card>

        <Card icon={Swords} title="Competitive Landscape">
          <div className="flex flex-wrap mt-1">
            {strategy.competitors.map(c => <Chip key={c} text={c} color="red" />)}
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">Our Differentiators</div>
            <div className="space-y-2">
              {strategy.differentiators.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <Zap size={12} className="text-teal-500 shrink-0 mt-0.5" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card icon={BarChart3} title="Success Metrics">
          <div className="space-y-3">
            {strategy.success_metrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                <div>
                  <div className="text-xs font-semibold text-slate-700">{m.metric}</div>
                  {m.current && <div className="text-xs text-slate-400 mt-0.5">Current: {m.current}</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-indigo-600">{m.target}</div>
                  <div className="text-[10px] text-slate-400">Target</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {strategy.execution_notes && (
        <Card icon={FileText} title="Execution Notes">
          <p className="text-sm text-slate-700 leading-relaxed">{strategy.execution_notes}</p>
        </Card>
      )}
    </div>
  );
}
