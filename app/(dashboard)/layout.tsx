import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-context"
import { AccentPicker } from "@/components/accent-picker"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="flex-1 lg:pl-64">
            <div className="fixed top-4 right-4 z-30 hidden lg:block">
              <AccentPicker />
            </div>
            <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
