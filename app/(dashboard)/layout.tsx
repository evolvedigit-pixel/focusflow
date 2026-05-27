import { Sidebar } from "@/components/sidebar"
import { LevelUpNotification } from "@/components/level-up-notification"
import { XPToast } from "@/components/xp-toast"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <LevelUpNotification />
      <XPToast />
      <main className="pt-14 lg:pl-64 lg:pt-0">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
