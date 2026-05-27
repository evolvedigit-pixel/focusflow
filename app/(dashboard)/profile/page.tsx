"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/animated-counter"
import { getProfile, type Profile } from "@/lib/db"
import { Trophy, Flame, Clock, Zap, Target, Loader2, TrendingUp, Star, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts"
import { createClient } from "@/lib/supabase/client"

function getHeatmapColor(count: number) {
  if (count === 0) return "bg-white/[0.03]"
  if (count === 1) return "bg-purple-500/20"
  if (count === 2) return "bg-purple-500/40"
  if (count === 3) return "bg-purple-500/60"
  return "bg-purple-500/80"
}

function getBadge(level: number) {
  if (level >= 20) return { label: "Légende", color: "#f59e0b", emoji: "👑" }
  if (level >= 10) return { label: "Expert", color: "#8b5cf6", emoji: "💎" }
  if (level >= 5) return { label: "Avancé", color: "#06b6d4", emoji: "🏆" }
  if (level >= 3) return { label: "Intermédiaire", color: "#22c55e", emoji: "⭐" }
  return { label: "Débutant", color: "#6b7280", emoji: "🌱" }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [monthlyData, setMonthlyData] = useState<{ month: string; xp: number; hours: number; sessions: number }[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; xp: number; hours: number }[]>([])
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([])
  const [sessionTypes, setSessionTypes] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"semaine" | "mois">("semaine")

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      setProfile(p)

      if (p) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Données mensuelles (6 mois)
          const sixMonthsAgo = new Date()
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
          const { data: sessions } = await supabase
            .from("focus_sessions")
            .select("duration, xp_earned, completed_at, session_type")
            .eq("user_id", user.id)
            .gte("completed_at", sixMonthsAgo.toISOString())

          const months = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
          const monthMap: Record<string, { xp: number; hours: number; sessions: number }> = {}
          for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            monthMap[months[d.getMonth()]] = { xp: 0, hours: 0, sessions: 0 }
          }
          for (const s of sessions ?? []) {
            const m = months[new Date(s.completed_at).getMonth()]
            if (monthMap[m]) {
              monthMap[m].xp += s.xp_earned
              monthMap[m].hours += s.duration / 60
              monthMap[m].sessions += 1
            }
          }
          setMonthlyData(Object.entries(monthMap).map(([month, v]) => ({ month, ...v })))

          // Données hebdomadaires (7 jours)
          const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
          const weekMap: Record<string, { xp: number; hours: number }> = {}
          days.forEach(d => weekMap[d] = { xp: 0, hours: 0 })
          const weekAgo = new Date(Date.now() - 7 * 86400000)
          const { data: weekSessions } = await supabase
            .from("focus_sessions")
            .select("duration, xp_earned, completed_at")
            .eq("user_id", user.id)
            .gte("completed_at", weekAgo.toISOString())
          for (const s of weekSessions ?? []) {
            const d = new Date(s.completed_at)
            const dayIdx = (d.getDay() + 6) % 7
            weekMap[days[dayIdx]].xp += s.xp_earned
            weekMap[days[dayIdx]].hours += s.duration / 60
          }
          setWeeklyData(days.map(d => ({ day: d, ...weekMap[d] })))

          // Types de sessions
          const typeMap: Record<string, number> = {}
          for (const s of sessions ?? []) {
            const t = s.session_type ?? "autre"
            typeMap[t] = (typeMap[t] ?? 0) + 1
          }
          const typeColors: Record<string, string> = {
            "deep-work": "#8b5cf6",
            "pomodoro": "#06b6d4",
            "study": "#ec4899",
            "creative": "#f59e0b",
            "autre": "#6b7280",
          }
          const typeNames: Record<string, string> = {
            "deep-work": "Travail profond",
            "pomodoro": "Pomodoro",
            "study": "Études",
            "creative": "Créatif",
            "autre": "Autre",
          }
          setSessionTypes(Object.entries(typeMap).map(([k, v]) => ({
            name: typeNames[k] ?? k,
            value: v,
            color: typeColors[k] ?? "#6b7280",
          })))

          // Heatmap (84 jours)
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
  const xpProgress = p ? Math.min((p.xp / p.xp_to_next_level) * 100, 100) : 0
  const badge = getBadge(p?.level ?? 1)
  const displayName = p?.name ?? p?.full_name ?? "Utilisateur"
  const initials = displayName.slice(0, 2).toUpperCase()

  const stats = [
    { label: "Sessions totales", value: p?.sessions_completed ?? 0, icon: Target, color: "from-purple-500 to-purple-600" },
    { label: "Heures de focus", value: Math.round(p?.total_focus_hours ?? 0), icon: Clock, color: "from-cyan-500 to-cyan-600", suffix: "h" },
    { label: "Série en cours", value: p?.streak ?? 0, icon: Flame, color: "from-orange-500 to-red-500", suffix: "j" },
    { label: "Score productivité", value: p?.productivity_score ?? 0, icon: Trophy, color: "from-yellow-500 to-amber-500", suffix: "%" },
  ]

  const chartData = activeTab === "semaine" ? weeklyData.map(d => ({ name: d.day, xp: d.xp, heures: Math.round(d.hours * 10) / 10 }))
    : monthlyData.map(d => ({ name: d.month, xp: d.xp, heures: Math.round(d.hours * 10) / 10 }))

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
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">{badge.emoji}</span>
                  <span className="text-sm font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.color + "22", color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Membre depuis{" "}
                  {p?.joined_date ? new Date(p.joined_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
            <div className="sm:ml-auto sm:text-right">
              <div className="mb-2 flex items-center justify-between sm:justify-end gap-2">
                <span className="text-sm text-muted-foreground">Niveau {p?.level} → {(p?.level ?? 1) + 1}</span>
                <span className="text-sm font-medium">{(p?.xp ?? 0).toLocaleString()} / {(p?.xp_to_next_level ?? 1000).toLocaleString()} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2 w-48" />
              <p className="mt-1 text-xs text-muted-foreground">{Math.round(xpProgress)}% vers le niveau {(p?.level ?? 1) + 1}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <GlassCard className="p-5 text-center">
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} opacity-80`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={stat.value} />{stat.suffix ?? ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Graphique XP + onglets semaine/mois */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h2 className="font-semibold">Progression XP</h2>
            </div>
            <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
              {(["semaine", "mois"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                    activeTab === tab ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {tab === "semaine" ? "Cette semaine" : "6 derniers mois"}
                </button>
              ))}
            </div>
          </div>
          {chartData.every(d => d.xp === 0) ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              Aucune donnée. Complétez des sessions focus pour voir vos progrès.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelStyle={{ color: "white" }} />
                <Area type="monotone" dataKey="xp" stroke="#a855f7" strokeWidth={2} fill="url(#xpGrad)" name="XP" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </motion.div>

      {/* Types de sessions + Heatmap */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Types de sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-cyan-400" />
              <h2 className="font-semibold">Types de sessions</h2>
            </div>
            {sessionTypes.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                Aucune session pour le moment.
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={sessionTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {sessionTypes.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {sessionTypes.map((t, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-xs text-white/60">{t.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Heatmap */}
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

      {/* Progression mensuelle heures */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h2 className="font-semibold">Heures de focus par mois</h2>
          </div>
          {monthlyData.every(d => d.hours === 0) ? (
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
                <Bar dataKey="hours" fill="url(#barGrad2)" radius={[4, 4, 0, 0]} name="Heures" />
                <defs>
                  <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </motion.div>

    </div>
  )
}
