import { Sidebar } from "./Sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
