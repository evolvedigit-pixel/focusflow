"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Timer,
  Trophy,
  User,
  Sparkles,
  Menu,
  X,
  CalendarDays,
  LogOut,
  CheckSquare,
  Activity,
  BookOpen,
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/db"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/planner", icon: CalendarDays, label: "Planificateur" },
  { href: "/habits", icon: Activity, label: "Habitudes" },
  { href: "/tasks", icon: CheckSquare, label: "Taches" },
  { href: "/focus", icon: Timer, label: "Focus" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/leaderboard", icon: Trophy, label: "Classement" },
  { href: "/profile", icon: User, label: "Profil" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(data)
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const displayName = profile?.name ?? profile?.full_name ?? "Utilisateur"
  const displayXP = profile?.xp ?? 0
  const displayLevel = profile?.level ?? 1
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-background/80 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold">FocusFlow</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-white/[0.05]"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 border-b border-white/[0.08] bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/[0.04] hover:text-white transition-all duration-200 text-left"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Se deconnecter</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/[0.08] bg-background/50 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold">FocusFlow</span>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive ? "text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl bg-white/[0.08]"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon className="relative z-10 h-5 w-5" />
                  <span className="relative z-10 font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-white/[0.08] p-4 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-sm font-bold text-white">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-[10px] font-bold text-white">
                {displayLevel}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayXP.toLocaleString()} XP</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Se deconnecter
          </button>
        </div>
      </aside>
    </>
  )
}
