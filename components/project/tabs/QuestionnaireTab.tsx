import type { QuestionAnswer } from "@/types";

interface Props { questionnaire: QuestionAnswer[] }

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    return { ...acc, [k]: [...(acc[k] ?? []), item] };
  }, {} as Record<string, T[]>);
}

export function QuestionnaireTab({ questionnaire }: Props) {
  if (questionnaire.length === 0) {
    return <div className="text-center py-16 text-slate-400 text-sm">No questionnaire data yet.</div>;
  }

  const grouped = groupBy(questionnaire, "category");

  return (
    <div className="space-y-6 max-w-4xl">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{category}</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {items.map(item => (
              <div key={item.id} className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] text-indigo-500 font-bold">Q</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 mb-2">{item.question}</p>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                      <p className="text-sm text-slate-700 leading-relaxed">{item.answer}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Answered {new Date(item.answered_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
