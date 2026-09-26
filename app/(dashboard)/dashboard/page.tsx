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
  Star, CheckSquare, Sun, ChevronDown, ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
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

// ── Widget Objectifs ─────────────────────────────────────────────────────────
function GoalsWidget() {
  const [goals, setGoals] = useState<any[]>([])
  const [expanded, setExpanded] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: goalsData } = await supabase.from("goals")
        .select("id, title, emoji, color, target_date, completed")
        .eq("user_id", user.id).eq("completed", false)
        .order("created_at", { ascending: false }).limit(4)
      const { data: stepsData } = await supabase.from("goal_steps")
        .select("goal_id, completed").eq("user_id", user.id)
      const enriched = (goalsData??[]).map(g => {
        const steps    = (stepsData??[]).filter(s => s.goal_id===g.id)
        const done     = steps.filter(s => s.completed).length
        const total    = steps.length
        const progress = total>0 ? Math.round((done/total)*100) : 0
        const daysLeft = g.target_date
          ? Math.ceil((new Date(g.target_date).getTime()-Date.now())/86400000)
          : null
        return { ...g, progress, done, total, daysLeft }
      })
      setGoals(enriched)
      setLoading(false)
    }
    load()
  }, [])

  if (!loading && goals.length===0) return null

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400"/>
            <span className="font-semibold text-white">Objectifs en cours</span>
            {!loading && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.2)" }}>
                {goals.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/goals" onClick={e => e.stopPropagation()}
              className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Voir tout →
            </Link>
            {expanded ? <ChevronUp size={14} className="text-white/30"/> : <ChevronDown size={14} className="text-white/30"/>}
          </div>
        </button>

        {expanded && (
          <div className="border-t border-white/[0.06]">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-violet-400"/>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {goals.map(goal => (
                  <div key={goal.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.01] transition-colors">
                    {/* Emoji */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background:`${goal.color}15`, border:`1px solid ${goal.color}25` }}>
                      {goal.emoji}
                    </div>

                    {/* Titre + progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white/80 truncate">{goal.title}</span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0"
                          style={{ color:goal.progress===100?"#22c55e":goal.color }}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background:`linear-gradient(90deg,${goal.color}80,${goal.color})` }}
                          initial={{ width:0 }} animate={{ width:`${goal.progress}%` }}
                          transition={{ duration:0.8 }}/>
                      </div>
                      {goal.total>0 && (
                        <div className="text-[10px] text-white/25 mt-0.5">
                          {goal.done}/{goal.total} étapes
                          {goal.daysLeft!==null && (
                            <span className="ml-2" style={{
                              color:goal.daysLeft<0?"#ef4444":goal.daysLeft<7?"#f59e0b":"rgba(255,255,255,0.25)"
                            }}>
                              {goal.daysLeft<0?`${Math.abs(goal.daysLeft)}j de retard`:goal.daysLeft===0?"Aujourd'hui !":goal.daysLeft===1?"Demain":`${goal.daysLeft}j restants`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
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
      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Bon retour, {p?.name?.split(" ")[0] ?? "là"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Votre aperçu de productivité</p>
          </div>
          <Link href="/focus">
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90">
              <Timer className="mr-2 h-4 w-4" />
              Démarrer le focus
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Progression XP */}
      {p && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Niveau {p.level} → {p.level + 1}</span>
              <span className="text-sm font-medium">{(p.xp ?? 0).toLocaleString()} / {(p.xp_to_next_level ?? 1000).toLocaleString()} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </GlassCard>
        </motion.div>
      )}

      {/* Cartes de stats */}
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

      {/* ── RAPPEL QUOTIDIEN ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}>
        <div className="rounded-2xl px-5 py-4 flex items-start gap-4 relative overflow-hidden"
          style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.04))",
            border:"1px solid rgba(139,92,246,0.2)" }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none"
            style={{ background:"radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%)", filter:"blur(12px)" }}/>
          <div className="text-2xl flex-shrink-0 mt-0.5">💡</div>
          <div className="flex-1 relative z-10">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">Rappel du jour</div>
            <p className="text-sm text-white/70 leading-relaxed">
              Ta progression se construit <span className="text-white font-semibold">chaque jour</span>, pas de temps en temps.
              Pense à cocher tes <Link href="/daily" className="text-violet-400 hover:text-violet-300 font-semibold underline-offset-2 hover:underline">tâches quotidiennes</Link> et
              tes <Link href="/habits" className="text-cyan-400 hover:text-cyan-300 font-semibold underline-offset-2 hover:underline">habitudes</Link> — même les petits jours comptent.
              La régularité bat toujours l'intensité ponctuelle.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── OBJECTIFS EN COURS ── */}
      <GoalsWidget />

      {/* Graphiques + Sessions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Graphique d'activité hebdomadaire */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
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
                  <Area type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={2} fill="url(#colorHours)" name="Heures" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>

        {/* Sessions récentes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
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
                  <div key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
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
