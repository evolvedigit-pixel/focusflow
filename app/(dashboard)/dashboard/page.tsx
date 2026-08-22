"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/animated-counter"
import {
  getProfile, getRecentSessions, getWeeklyActivity,
  type Profile, type FocusSession,
} from "@/lib/db"
import { Flame, Target, Clock, Zap, TrendingUp, Timer, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const QUOTES = [
  "Réviser les cours du jour, même 20 minutes par matière, va t'installer les infos profondément dans ton cerveau.",
  "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
  "Chaque minute de concentration aujourd'hui est une victoire de demain.",
  "Tu n'as pas besoin d'être parfait. Tu as besoin d'être constant.",
  "Les petites actions répétées chaque jour créent des résultats extraordinaires.",
  "Travaille en silence. Laisse ton succès faire le bruit.",
  "La régularité bat le talent quand le talent ne travaille pas.",
  "Commence là où tu es. Utilise ce que tu as. Fais ce que tu peux.",
  "Chaque session de focus est un investissement dans ta future réussite.",
  "Ce que tu fais aujourd'hui peut améliorer tous tes demains.",
]

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diff < 60) return `il y a ${diff} min`
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`
    return `il y a ${Math.floor(diff / 1440)}j`
  } catch { return "" }
}

// Composant citations rotatives
function RotatingQuotes() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(p => (p + 1) % QUOTES.length)
    }, 20000)
    return () => clearInterval(id)
  }, [])

  return (
    <GlassCard className="p-5 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"/>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">💬</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
            Citation du moment
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="text-sm leading-relaxed text-white/70 italic">
              « {QUOTES[index]} »
            </motion.p>
          </AnimatePresence>
          {/* Points de progression */}
          <div className="flex gap-1 mt-3">
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className="h-1 rounded-full transition-all duration-300"
                style={{ width: i === index ? 16 : 6, background: i === index ? "#a855f7" : "rgba(255,255,255,0.15)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

// Note motivante fixe
function MotivationalNote() {
  return (
    <GlassCard className="p-5 relative overflow-hidden">
      <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none"/>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">📝</div>
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            Rappel important
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            <span className="text-white font-semibold">Révise tes cours du jour</span> — même 20 minutes sur chaque matière.
            La révision régulière installe les informations profondément dans ton cerveau et te fera{" "}
            <span className="text-cyan-400 font-semibold">gagner énormément de temps</span> sur le long terme.
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number; sessions: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000)
    Promise.all([getProfile(), getRecentSessions(5), getWeeklyActivity()])
      .then(([p, s, w]) => {
        clearTimeout(timeout)
        setProfile(p)
        setSessions(s ?? [])
        setWeeklyData(w ?? [])
        setLoading(false)
      })
      .catch((err) => {
        clearTimeout(timeout)
        console.error("Dashboard error:", err)
        setError("Erreur de chargement")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    )
  }

  const p = profile
  const xp = p?.xp ?? 0
  const xpToNext = p?.xp_to_next_level ?? 1000
  const xpProgress = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0
  const displayName = p?.name ?? p?.full_name ?? "là"

  const statCards = [
    { title: "Score de productivité", value: p?.productivity_score ?? 0, suffix: "%", icon: Target, color: "from-purple-500 to-purple-600", description: "Votre score" },
    { title: "Heures de focus", value: Math.round(p?.total_focus_hours ?? 0), suffix: "h", icon: Clock, color: "from-cyan-500 to-cyan-600", description: "Total" },
    { title: "Série en cours", value: p?.streak ?? 0, suffix: " jours", icon: Flame, color: "from-orange-500 to-red-500", description: "Continuez !" },
    { title: "XP total", value: xp, suffix: "", icon: Zap, color: "from-yellow-500 to-amber-500", description: `Niveau ${p?.level ?? 1}` },
  ]

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Bon retour, {displayName.split(" ")[0]} 👋
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

      {/* Note motivante + Citation côte à côte */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
          <MotivationalNote />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <RotatingQuotes />
        </motion.div>
      </div>

      {/* XP */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Niveau {p?.level ?? 1} → {(p?.level ?? 1) + 1}</span>
            <span className="text-sm font-medium">{xp.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold">
                    <AnimatedCounter value={card.value} />{card.suffix}
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

      {/* Graphiques + Sessions */}
      <div className="grid gap-6 lg:grid-cols-2">
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
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelStyle={{ color: "white" }} />
                  <Area type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={2} fill="url(#colorHours)" name="Heures" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>

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
                <p>Aucune session pour l'instant.</p>
                <Link href="/focus" className="text-purple-400 hover:underline text-xs">Commencez votre première session →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="font-medium capitalize">{(session.session_type ?? "").replace("-", " ")}</p>
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
