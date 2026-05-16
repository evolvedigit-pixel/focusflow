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
  Flame,
  Target,
  Clock,
  Zap,
  TrendingUp,
  Timer,
  ChevronRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
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
      title: "Productivity Score",
      value: p?.productivity_score ?? 0,
      suffix: "%",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      description: "Your score",
    },
    {
      title: "Focus Hours",
      value: Math.round(p?.total_focus_hours ?? 0),
      suffix: "h",
      icon: Clock,
      color: "from-cyan-500 to-cyan-600",
      description: "Total",
    },
    {
      title: "Current Streak",
      value: p?.streak ?? 0,
      suffix: " days",
      icon: Flame,
      color: "from-orange-500 to-red-500",
      description: "Keep it going!",
    },
    {
      title: "Total XP",
      value: p?.xp ?? 0,
      suffix: "",
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      description: `Level ${p?.level ?? 1}`,
    },
  ]

  const xpProgress = p ? (p.xp / p.xp_to_next_level) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome back, {p?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here&apos;s your productivity overview</p>
          </div>
          <Link href="/focus">
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90">
              <Timer className="mr-2 h-4 w-4" />
              Start Focus
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* XP Progress */}
      {p && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Level {p.level} → {p.level + 1}</span>
              <span className="text-sm font-medium">{(p.xp ?? 0).toLocaleString()} / {(p.xp_to_next_level ?? 1000).toLocaleString()} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </GlassCard>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold">
                    <AnimatedCounter value={card.value} />
                    {card.suffix}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} opacity-80`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts + Sessions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h2 className="font-semibold">Weekly Activity</h2>
            </div>
            {weeklyData.every((d) => d.hours === 0) ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                No sessions yet this week. <Link href="/focus" className="ml-1 text-purple-400 hover:underline">Start one!</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    labelStyle={{ color: "white" }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={2} fill="url(#colorHours)" name="Hours" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-cyan-400" />
                <h2 className="font-semibold">Recent Sessions</h2>
              </div>
              <Link href="/focus">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  New <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {sessions.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Timer className="h-8 w-8 opacity-30" />
                <p>No sessions yet.</p>
                <Link href="/focus" className="text-purple-400 hover:underline text-xs">Start your first focus session →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="font-medium capitalize">{session.type.replace("-", " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(session.completed_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.duration}m</p>
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
