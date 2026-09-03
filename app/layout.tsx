import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/sidebar"
import { MorningPopup } from "@/components/morning-popup"
import { WeeklyReport } from "@/components/weekly-report"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 lg:pl-64">
          <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      {/* Popups globaux */}
      <MorningPopup />
      <WeeklyReport />
    </SidebarProvider>
  )
}
