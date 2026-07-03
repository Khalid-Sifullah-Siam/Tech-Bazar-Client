import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-5">
        {children}
      </main>
    </div>
  );
}
