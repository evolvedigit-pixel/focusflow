"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/animated-counter"
import { getProfile, type Profile } from "@/lib/db"
import { Trophy, Flame, Clock, Zap, Target, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { createClient } from "@/lib/supabase/client"

function getHeatmapColor(count: number) {
  if (count === 0) return "bg-white/[0.03]"
  if (count === 1) return "bg-purple-500/20"
  if (count === 2) return "bg-purple-500/40"
  if (count === 3) return "bg-purple-500/60"
  return "bg-purple-500/80"
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [monthlyData, setMonthlyData] = useState<{ month: string; xp: number; hours: number }[]>([])
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      setProfile(p)

      if (p) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const sixMonthsAgo = new Date()
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
          const { data: sessions } = await supabase
            .from("focus_sessions")
            .select("duration, xp_earned, completed_at")
            .eq("user_id", user.id)
            .gte("completed_at", sixMonthsAgo.toISOString())

          const months = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
          const monthMap: Record<string, { xp: number; hours: number }> = {}
          for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            monthMap[months[d.getMonth()]] = { xp: 0, hours: 0 }
          }
          for (const s of sessions ?? []) {
            const m = months[new Date(s.completed_at).getMonth()]
            if (monthMap[m]) {
              monthMap[m].xp += s.xp_earned
              monthMap[m].hours += s.duration / 60
            }
          }
          setMonthlyData(Object.entries(monthMap).map(([month, v]) => ({ month, ...v })))

          const today = new Date()
          const heatmapArr: { date: string; count: number }[] = []
          const { data: heatSessions } = await supabase
            .from("focus_sessions")
            .select("completed_at")
            .eq("user_id", user.id)
            .gte("completed_at", new Date(Date.now() - 84 * 86400000).toISOString())
          const countMap: Record<string, number> = {}
          for (const s of heatSessions ?? []) {
            const d = s.completed_at.split("T")[0]
            countMap[d] = (countMap[d] ?? 0) + 1
          }
          for (let i = 83; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().split("T")[0]
            heatmapArr.push({ date: key, count: countMap[key] ?? 0 })
          }
          setHeatmap(heatmapArr)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  const p = profile
  const xpProgress = p ? (p.xp / p.xp_to_next_level) * 100 : 0

  const stats = [
    { label: "Sessions totales", value: p?.sessions_completed ?? 0, icon: Target },
    { label: "Heures de focus", value: Math.round(p?.total_focus_hours ?? 0), icon: Clock },
    { label: "Série en cours", value: p?.streak ?? 0, icon: Flame, suffix: " jours" },
    { label: "Productivité", value: p?.productivity_score ?? 0, icon: Trophy, suffix: "%" },
  ]

  const displayName = p?.name ?? "Utilisateur"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      {/* En-tête du profil */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6 sm:p-8" glow="purple">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-3xl font-bold text-white shadow-[0_0_30px_rgba(147,51,234,0.4)]">
                  {initials}
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-sm font-bold text-white shadow-lg">
                  {p?.level ?? 1}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <p className="text-muted-foreground text-sm">
                  Membre depuis{" "}
                  {p?.joined_date
                    ? new Date(p.joined_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
            <div className="sm:ml-auto sm:text-right">
              <div className="mb-2 flex items-center justify-between sm:justify-end gap-2">
                <span className="text-sm text-muted-foreground">Niveau {p?.level}</span>
                <span className="text-sm font-medium">{p?.xp?.toLocaleString()} / {p?.xp_to_next_level?.toLocaleString()} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2 w-48" />
              <p className="mt-1 text-xs text-muted-foreground">{Math.round(xpProgress)}% vers le niveau {(p?.level ?? 1) + 1}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Grille de stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <GlassCard className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                <stat.icon className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={stat.value} />
                {stat.suffix ?? ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Progression mensuelle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h2 className="font-semibold">Progression mensuelle</h2>
          </div>
          {monthlyData.every((d) => d.xp === 0) ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              Aucune donnée. Complétez des sessions focus pour voir vos progrès.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="xp" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="XP" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </motion.div>

      {/* Carte de chaleur d'activité */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-cyan-400" />
            <h2 className="font-semibold">Carte d&apos;activité</h2>
          </div>
          <div className="grid grid-cols-[repeat(12,1fr)] gap-1 overflow-x-auto">
            {heatmap.map((item) => (
              <div
                key={item.date}
                className={cn("aspect-square rounded-sm cursor-default transition-colors", getHeatmapColor(item.count))}
                title={`${item.date} : ${item.count} session${item.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Moins</span>
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className={cn("h-3 w-3 rounded-sm", getHeatmapColor(n))} />
            ))}
            <span className="text-xs text-muted-foreground">Plus</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
