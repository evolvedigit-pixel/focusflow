"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/animated-counter"
import {
  getProfile,
  getRecentSessions,
  getWeeklyActivity,
  type Profile,
  type FocusSession,
} from "@/lib/db"
import {
  Flame, Target, Clock, Zap, TrendingUp, Timer, ChevronRight, Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`
  if (diffInMinutes < 1440) return `il y a ${Math.floor(diffInMinutes / 60)}h`
  return `il y a ${Math.floor(diffInMinutes / 1440)}j`
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number; sessions: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProfile(), getRecentSessions(5), getWeeklyActivity()]).then(
      ([p, s, w]) => {
        setProfile(p)
        setSessions(s)
        setWeeklyData(w)
        setLoading(false)
      }
    )
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  const p = profile
  const statCards = [
    {
      title: "Score de productivité",
      value: p?.productivity_score ?? 0,
      suffix: "%",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      description: "Votre score",
    },
    {
      title: "Heures de focus",
      value: Math.round(p?.total_focus_hours ?? 0),
      suffix: "h",
      icon: Clock,
      color: "from-cyan-500 to-cyan-600",
      description: "Total",
    },
    {
      title: "Série en cours",
      value: p?.streak ?? 0,
      suffix: " jours",
      icon: Flame,
      color: "from-orange-500 to-red-500",
      description: "Continuez !",
    },
    {
      title: "XP total",
      value: p?.xp ?? 0,
      suffix: "",
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      description: `Niveau ${p?.level ?? 1}`,
    },
  ]

  const xpProgress = p ? (p.xp / p.xp_to_next_level) * 100 : 0

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Bon retour, {p?.name?.split(" ")[0] ?? "là"}.
            </h1>
            <p className="mt-2 text-white/50 text-lg">
              Build discipline. Stay focused. Keep growing.
            </p>
          </div>
          <Link href="/focus">
            <Button
              className="
                rounded-2xl
                border border-white/10
                bg-gradient-to-r
                from-violet-600
                via-violet-500
                to-cyan-500
                px-6 py-6
                shadow-[0_10px_40px_rgba(139,92,246,0.25)]
                hover:scale-[1.02]
                hover:shadow-[0_15px_50px_rgba(139,92,246,0.35)]
                transition-all
              "
            >
              <Timer className="mr-2 h-4 w-4" />
              Démarrer le focus
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Progression XP ── */}
      {p && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard
            glow="purple"
            className="
              relative overflow-hidden
              p-6 rounded-[32px]
            "
          >
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Niveau {p.level} → {p.level + 1}</span>
              <span className="text-sm font-medium">{(p.xp ?? 0).toLocaleString()} / {(p.xp_to_next_level ?? 1000).toLocaleString()} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2 relative" />
          </GlassCard>
        </motion.div>
      )}

      {/* ── Cartes de stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <GlassCard
              glow={i % 2 === 0 ? "purple" : "cyan"}
              className="
                p-6
                rounded-[28px]
                min-h-[150px]
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">
                    <AnimatedCounter value={card.value} />
                    {card.suffix}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div
                  className={`
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br ${card.color}
                    shadow-[0_8px_25px_rgba(0,0,0,0.25)]
                  `}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── Graphiques + Sessions ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Activité hebdomadaire */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard
            glow="purple"
            className="
              relative overflow-hidden
              p-7 rounded-[32px]
            "
          >
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h2 className="font-semibold">Activité de la semaine</h2>
            </div>
            {weeklyData.every((d) => d.hours === 0) ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                Aucune session cette semaine.{" "}
                <Link href="/focus" className="ml-1 text-purple-400 hover:underline">Commencez !</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
                      <stop offset="60%" stopColor="#A855F7" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    labelStyle={{ color: "white" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    fill="url(#colorHours)"
                    name="Heures"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>

        {/* Sessions récentes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard
            glow="cyan"
            className="
              relative overflow-hidden
              p-7 rounded-[32px]
            "
          >
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-cyan-400" />
                <h2 className="font-semibold">Sessions récentes</h2>
              </div>
              <Link href="/focus">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  Nouvelle <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {sessions.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Timer className="h-8 w-8 opacity-30" />
                <p>Aucune session pour l&apos;instant.</p>
                <Link href="/focus" className="text-purple-400 hover:underline text-xs">Commencez votre première session →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="
                      flex items-center justify-between
                      rounded-2xl
                      bg-white/[0.03]
                      border border-white/[0.06]
                      backdrop-blur-xl
                      px-4 py-3
                      hover:bg-white/[0.05]
                      hover:border-white/[0.10]
                      transition-all
                      duration-300
                    "
                  >
                    <div>
                      <p className="font-medium capitalize">{session.type.replace("-", " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(session.completed_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.duration} min</p>
                      <p className="text-xs text-yellow-400">+{session.xp_earned} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
