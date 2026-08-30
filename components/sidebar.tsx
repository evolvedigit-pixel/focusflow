"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Timer, Trophy, User, Menu, X,
  CalendarDays, LogOut, CheckSquare, Activity, BookOpen, Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/db"

const navItems = [
  { href:"/dashboard",   icon:LayoutDashboard, label:"Tableau de bord" },
  { href:"/planner",     icon:CalendarDays,    label:"Planificateur"   },
  { href:"/habits",      icon:Activity,        label:"Habitudes"       },
  { href:"/tasks",       icon:CheckSquare,     label:"Taches"          },
  { href:"/focus",       icon:Timer,           label:"Focus"           },
  { href:"/journal",     icon:BookOpen,        label:"Journal"         },
  { href:"/leaderboard", icon:Trophy,          label:"Classement"      },
  { href:"/profile",     icon:User,            label:"Profil"          },
]

function getPlantStage(h: number) {
  if (h < 3)   return { emoji:"🪴", name:"Graine" }
  if (h < 10)  return { emoji:"🌱", name:"Jeune pousse" }
  if (h < 25)  return { emoji:"🌿", name:"Plantule" }
  if (h < 50)  return { emoji:"🌲", name:"Arbre du calme" }
  if (h < 100) return { emoji:"🌳", name:"Gardien" }
  return              { emoji:"🐉", name:"Souverain" }
}

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile]       = useState<Profile|null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login"); router.refresh()
  }

  const displayName  = profile?.name ?? profile?.full_name ?? "Utilisateur"
  const displayXP    = profile?.xp ?? 0
  const displayLevel = profile?.level ?? 1
  const totalHours   = profile?.total_focus_hours ?? 0
  const xpToNext     = profile?.xp_to_next_level ?? 1000
  const xpPct        = Math.min((displayXP / xpToNext) * 100, 100)
  const initials     = displayName.slice(0, 2).toUpperCase()
  const plant        = getPlantStage(totalHours)

  const SidebarContent = () => (
    <div className="flex h-full flex-col relative overflow-hidden">
      {/* Fond avec relief — dégradé subtil */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:"linear-gradient(180deg, #0f0f1a 0%, #0d0d18 50%, #0a0a14 100%)",
      }}/>
      {/* Halo violet en haut */}
      <div className="absolute -top-20 -left-10 w-48 h-48 rounded-full pointer-events-none" style={{
        background:"radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        filter:"blur(20px)"
      }}/>
      {/* Halo cyan en bas */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{
        background:"radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
        filter:"blur(20px)"
      }}/>
      {/* Bordure droite subtile */}
      <div className="absolute right-0 top-0 bottom-0 w-px" style={{
        background:"linear-gradient(180deg, transparent, rgba(139,92,246,0.15) 30%, rgba(139,92,246,0.15) 70%, transparent)"
      }}/>

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-6 py-5" style={{
        borderBottom:"1px solid rgba(255,255,255,0.05)"
      }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
          style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 16px rgba(124,58,237,0.35)" }}>
          <Sparkles className="h-4 w-4 text-white"/>
        </div>
        <div>
          <span className="text-base font-bold text-white" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            FocusFlow
          </span>
          <div className="text-[9px] font-medium uppercase tracking-widest" style={{ color:"rgba(139,92,246,0.5)" }}>
            Productivity OS
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <motion.div whileHover={{ x:2 }} transition={{ type:"spring", stiffness:400, damping:30 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive ? "text-white" : "text-white/35 hover:text-white/70"
                  )}>
                  {/* Fond actif */}
                  {isActive && (
                    <motion.div layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:"linear-gradient(90deg, rgba(124,58,237,0.15), rgba(99,102,241,0.08))",
                        borderLeft:"2px solid rgba(139,92,246,0.7)",
                      }}
                      transition={{ type:"spring", stiffness:500, damping:30 }}/>
                  )}
                  {/* Hover glow */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background:"rgba(255,255,255,0.02)" }}/>
                  )}
                  <item.icon className={cn("relative z-10 h-4 w-4 flex-shrink-0", isActive && "text-violet-400")}/>
                  <span className="relative z-10 text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <div className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background:"#8b5cf6", boxShadow:"0 0 6px rgba(139,92,246,0.8)" }}/>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom — plante + user */}
      <div className="relative px-4 pb-4 space-y-3" style={{ borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:14 }}>

        {/* Plante XP */}
        <div className="rounded-xl px-3 py-2.5 relative overflow-hidden"
          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse at 100% 0%, rgba(139,92,246,0.06), transparent 60%)" }}/>
          <div className="relative flex items-center gap-2.5 mb-2">
            <motion.span animate={{ y:[0,-2,0] }} transition={{ duration:2.5, repeat:Infinity }}>
              <span style={{ fontSize:18 }}>{plant.emoji}</span>
            </motion.span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70 truncate">{plant.name}</span>
                <span className="text-[10px] text-violet-400 font-medium ml-1 flex-shrink-0">{displayXP.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background:"linear-gradient(90deg,#7c3aed,#a855f7,#c4b5fd)" }}
              initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ duration:1, ease:"easeOut" }}/>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.2)" }}>Niveau {displayLevel}</span>
            <span className="text-[9px]" style={{ color:"rgba(139,92,246,0.5)" }}>{displayXP}/{xpToNext} XP</span>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 relative overflow-hidden"
          style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 12px rgba(124,58,237,0.3)" }}>
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", border:"1.5px solid #0f0f1a" }}>
              {displayLevel}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-white/30">Membre FocusFlow</p>
          </div>
        </div>

        <button onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 group"
          style={{ color:"rgba(255,255,255,0.2)" }}
          onMouseEnter={e => e.currentTarget.style.color="rgba(255,255,255,0.6)"}
          onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.2)"}>
          <LogOut className="h-4 w-4"/>
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile topbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{ background:"rgba(13,13,24,0.95)", borderBottom:"1px solid rgba(255,255,255,0.05)", backdropFilter:"blur(12px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            <Sparkles className="h-3.5 w-3.5 text-white"/>
          </div>
          <span className="text-base font-bold text-white" style={{ fontFamily:"'Sora',sans-serif" }}>FocusFlow</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/50 hover:text-white transition-colors">
          {mobileOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            transition={{ type:"spring", stiffness:400, damping:30 }}
            className="fixed top-14 left-0 bottom-0 z-40 w-64 lg:hidden">
            <SidebarContent/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 lg:flex flex-col">
        <SidebarContent/>
      </aside>
    </>
  )
}
