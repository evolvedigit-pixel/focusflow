"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/animated-counter"
import {
  getProfile, getRecentSessions, getWeeklyActivity, getTodos,
  getSessionName,
  type Profile, type FocusSession, type Todo,
} from "@/lib/db"
import { Flame, Target, Clock, Zap, TrendingUp, Timer, ChevronRight, Loader2, Play, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"

const QUOTES = [
  "Réviser les cours du jour, même 20 minutes par matière, installe les infos profondément dans ton cerveau.",
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

function RotatingQuotes() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(p => (p + 1) % QUOTES.length), 20000)
    return () => clearInterval(id)
  }, [])
  return (
    <GlassCard className="p-5 relative overflow-hidden h-full">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"/>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">💬</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Citation du moment</div>
          <AnimatePresence mode="wait">
            <motion.p key={index}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.5 }}
              className="text-sm leading-relaxed text-white/70 italic">
              « {QUOTES[index]} »
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-1 mt-3">
            {QUOTES.map((_,i) => (
              <button key={i} onClick={() => setIndex(i)}
                className="h-1 rounded-full transition-all duration-300"
                style={{ width:i===index?16:6, background:i===index?"#a855f7":"rgba(255,255,255,0.15)" }}/>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

function ProchaineMission({ todos }: { todos: Todo[] }) {
  const next     = todos.find(t => !t.completed)
  const upcoming = todos.filter(t => !t.completed).slice(1, 4)
  const catColors: Record<string,string> = {
    study:"#8b5cf6", work:"#06b6d4", fitness:"#22c55e",
    personal:"#f59e0b", meeting:"#ec4899", creative:"#ef4444",
  }
  const catNames: Record<string,string> = {
    study:"Étude", work:"Travail", fitness:"Sport",
    personal:"Personnel", meeting:"Réunion", creative:"Créatif",
  }
  return (
    <div className="rounded-2xl p-5 h-full flex flex-col gap-4"
      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2">
        <span className="text-base">🎯</span>
        <span className="text-sm font-bold text-white">Ta prochaine mission</span>
      </div>
      {next ? (
        <div className="rounded-xl p-4 flex items-center gap-4"
          style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:`${catColors[next.category]||"#8b5cf6"}20` }}>
            <span className="text-lg">📚</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm truncate">{next.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>
                {catNames[next.category]||next.category}
              </span>
              <span className="text-xs font-semibold" style={{ color:"#a78bfa" }}>
                +{next.xp_reward||25} XP
              </span>
            </div>
          </div>
          <Link href="/tasks">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 4px 12px rgba(124,58,237,0.4)" }}>
              <Play size={11}/> Commencer
            </button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl p-4 text-center" style={{ background:"rgba(255,255,255,0.02)" }}>
          <p className="text-sm text-white/30">Aucune tâche en attente 🎉</p>
        </div>
      )}
      <div>
        <div className="text-xs font-semibold mb-2" style={{ color:"rgba(255,255,255,0.35)" }}>À venir aujourd'hui</div>
        <div className="space-y-2">
          {upcoming.length===0 ? (
            <p className="text-xs" style={{ color:"rgba(255,255,255,0.2)" }}>Aucune autre tâche</p>
          ) : upcoming.map((todo,i) => (
            <motion.div key={todo.id}
              initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-4 h-4 rounded-full border flex-shrink-0" style={{ borderColor:"rgba(255,255,255,0.15)" }}/>
              <span className="flex-1 text-xs truncate" style={{ color:"rgba(255,255,255,0.6)" }}>{todo.title}</span>
              <span className="text-xs font-semibold flex-shrink-0" style={{ color:"#a78bfa" }}>+{todo.xp_reward||25} XP</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

type DayData = { date: string; minutes: number }

function getColor(minutes: number) {
  if (minutes === 0)  return "rgba(255,255,255,0.06)"
  if (minutes < 30)  return "rgba(139,92,246,0.3)"
  if (minutes < 60)  return "rgba(139,92,246,0.55)"
  if (minutes < 120) return "rgba(139,92,246,0.8)"
  return "#8b5cf6"
}

function ChainesDiscipline() {
  const [days, setDays]             = useState<DayData[]>([])
  const [streak, setStreak]         = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [activeDays, setActiveDays] = useState(0)
  const [tooltip, setTooltip]       = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const today = new Date()
      const start = new Date(today); start.setDate(today.getDate()-27)
      const { data: sessions } = await supabase
        .from("focus_sessions").select("duration, completed_at")
        .eq("user_id", user.id).gte("completed_at", start.toISOString())
      const map: Record<string,number> = {}
      for (const s of sessions??[]) {
        const key = s.completed_at.split("T")[0]
        map[key] = (map[key]??0) + (s.duration??0)
      }
      const arr: DayData[] = []
      for (let i=27; i>=0; i--) {
        const d = new Date(today); d.setDate(today.getDate()-i)
        const key = d.toISOString().split("T")[0]
        arr.push({ date:key, minutes:map[key]??0 })
      }
      setDays(arr)
      let cur=0
      for (let i=arr.length-1; i>=0; i--) { if (arr[i].minutes>0) cur++; else break }
      setStreak(cur)
      let best=0, tmp=0
      for (const d of arr) { if (d.minutes>0) { tmp++; best=Math.max(best,tmp) } else tmp=0 }
      setBestStreak(best)
      setActiveDays(arr.filter(d=>d.minutes>0).length)
    }
    load()
  }, [])

  const todayKey = new Date().toISOString().split("T")[0]
  const weeks: DayData[][] = []
  for (let i=0; i<days.length; i+=7) weeks.push(days.slice(i,i+7))
  const DAY_LABELS = ["L","M","M","J","V","S","D"]

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-400"/>
          <div>
            <div className="font-bold text-white text-sm">Chaîne de discipline</div>
            <div className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{activeDays} jours actifs ce mois-ci</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>Meilleur record :</div>
          <div className="text-sm font-bold" style={{ color:"#a855f7" }}>{bestStreak} jours</div>
        </div>
      </div>
      <div className="flex gap-4 items-start">
        <div className="flex-1 relative">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d,i) => (
              <div key={i} className="text-center text-[9px]" style={{ color:"rgba(255,255,255,0.2)" }}>{d}</div>
            ))}
          </div>
          <div className="flex flex-col gap-1 relative">
            {weeks.map((week,wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day,di) => {
                  const isToday = day.date===todayKey
                  const label   = new Date(day.date).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})
                  return (
                    <motion.div key={di} className="cursor-pointer"
                      style={{
                        height:16,
                        background: getColor(day.minutes),
                        borderRadius: 2,
                        border: isToday ? "1.5px solid rgba(168,85,247,0.9)" : "1px solid rgba(255,255,255,0.05)",
                        boxShadow: day.minutes>0 ? "0 0 4px rgba(139,92,246,0.15)" : "none",
                      }}
                      whileHover={{ scale:1.3, zIndex:10 }}
                      onMouseEnter={() => setTooltip(day.minutes===0 ? `${label} — aucune session` : `${label} — ${day.minutes} min`)}
                      onMouseLeave={() => setTooltip(null)}
                      initial={{ opacity:0, scale:0.5 }}
                      animate={{ opacity:1, scale:1 }}
                      transition={{ delay:(wi*7+di)*0.012 }}
                    />
                  )
                })}
              </div>
            ))}
            {tooltip && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap z-20 pointer-events-none"
                style={{ background:"rgba(0,0,0,0.9)", border:"1px solid rgba(255,255,255,0.1)" }}>
                {tooltip}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-3 h-3" style={{ background:getColor(0), borderRadius:2, border:"1px solid rgba(255,255,255,0.06)" }}/>
            <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.25)" }}>Jour inactif</span>
            <div className="w-3 h-3 ml-2" style={{ background:getColor(120), borderRadius:2, border:"1px solid rgba(255,255,255,0.06)" }}/>
            <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.25)" }}>Jour actif</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative flex items-center justify-center" style={{ width:72, height:72 }}>
            <svg width="72" height="72" style={{ transform:"rotate(-90deg)", position:"absolute" }}>
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="5"/>
              <motion.circle cx="36" cy="36" r="30" fill="none"
                stroke="url(#streakGrad2)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={188.5}
                initial={{ strokeDashoffset:188.5 }}
                animate={{ strokeDashoffset:188.5 - Math.min(streak/30,1)*188.5 }}
                transition={{ duration:1.2, ease:"easeOut" }}/>
              <defs>
                <linearGradient id="streakGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="relative z-10 text-center">
              <div className="font-black text-white" style={{ fontFamily:"'Sora',sans-serif", fontSize:20, lineHeight:1 }}>{streak}</div>
              <div className="text-[8px]" style={{ color:"rgba(255,255,255,0.4)", lineHeight:1.2 }}>jours</div>
            </div>
          </div>
          <div className="text-center text-[9px]" style={{ color:"rgba(255,255,255,0.25)" }}>
            {streak===0 ? "Lance ta chaîne\naujourd'hui !" : `${streak} jours\nconsécutifs`}
          </div>
          {streak>=7 && (
            <div className="text-center rounded-lg px-2 py-1" style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)" }}>
              <div className="text-[9px] font-bold" style={{ color:"#a78bfa" }}>→ +{streak*5} XP bonus</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(dateString: string) {
  try {
    const diff = Math.floor((Date.now()-new Date(dateString).getTime())/60000)
    if (diff<60) return `il y a ${diff} min`
    if (diff<1440) return `il y a ${Math.floor(diff/60)}h`
    return `il y a ${Math.floor(diff/1440)}j`
  } catch { return "" }
}

// ── BUG FIX 1 : Score productivité avec sessions du jour séparées ─────────────
function calcProductivityScore(
  todaySessions: FocusSession[],
  todos: Todo[],
  habitsDone: number,
  habitsTotal: number
): number {
  // Focus : objectif 2h = 120 min (sessions déjà filtrées sur aujourd'hui)
  const focusMin   = todaySessions.reduce((a,s) => a + (s.duration||0), 0)
  const focusScore = Math.min(focusMin / 120, 1) * 40

  // Tâches : ratio complétées
  const completed = todos.filter(t => t.completed).length
  const taskScore = todos.length > 0 ? (completed / todos.length) * 40 : 0

  // Habitudes
  const habitScore = habitsTotal > 0 ? (habitsDone / habitsTotal) * 20 : 0

  return Math.round(focusScore + taskScore + habitScore)
}

export default function DashboardPage() {
  const [profile, setProfile]           = useState<Profile|null>(null)
  const [sessions, setSessions]         = useState<FocusSession[]>([])
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>([])
  const [weeklyData, setWeeklyData]     = useState<{day:string;hours:number;sessions:number}[]>([])
  const [todos, setTodos]               = useState<Todo[]>([])
  const [habitsDone, setHabitsDone]     = useState(0)
  const [habitsTotal, setHabitsTotal]   = useState(0)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string|null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000)
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { clearTimeout(timeout); setLoading(false); return }

      const todayStart = new Date(); todayStart.setHours(0,0,0,0)
      const todayStr   = todayStart.toISOString()

      const [p, s, w, t, habitsRes, logsRes, todaySessionsRes] = await Promise.all([
        getProfile(),
        getRecentSessions(5),
        getWeeklyActivity(),
        getTodos(),
        supabase.from("habits").select("id").eq("user_id", user.id),
        supabase.from("habit_entries").select("habit_id")
          .eq("user_id", user.id)
          .eq("completed", true)
          .gte("date", todayStart.toISOString().split("T")[0]),
        // BUG FIX 1 : récupérer les sessions d'aujourd'hui séparément
        supabase.from("focus_sessions")
          .select("id, duration, xp_earned, session_type, completed_at")
          .eq("user_id", user.id)
          .gte("completed_at", todayStr),
      ])

      clearTimeout(timeout)
      setProfile(p)
      setSessions(s??[])
      setTodaySessions(todaySessionsRes.data ?? [])
      // BUG FIX 2 : arrondir les heures à 1 décimale dans weeklyData
      setWeeklyData((w??[]).map(d => ({ ...d, hours: Math.round(d.hours * 10) / 10 })))
      setTodos(t??[])
      setHabitsTotal(habitsRes.data?.length ?? 0)
      setHabitsDone(new Set((logsRes.data??[]).map((l:any) => l.habit_id)).size)
      setLoading(false)
    }
    load().catch(() => { clearTimeout(timeout); setError("Erreur de chargement"); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-400"/>
    </div>
  )
  if (error) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={() => window.location.reload()}>Réessayer</Button>
    </div>
  )

  const p           = profile
  const xp          = p?.xp ?? 0
  const xpToNext    = p?.xp_to_next_level ?? 100
  const xpProgress  = xpToNext > 0 ? Math.min((xp/xpToNext)*100, 100) : 0
  const displayName = p?.name ?? p?.full_name ?? "là"

  // Score calculé depuis les sessions du jour uniquement
  const productivityScore = calcProductivityScore(todaySessions, todos, habitsDone, habitsTotal)

  const statCards = [
    { title:"Score de productivité", value:productivityScore,                   suffix:"%",      icon:Target, color:"from-purple-500 to-purple-600", description:"Aujourd'hui"         },
    { title:"Heures de focus",       value:Math.round(p?.total_focus_hours??0), suffix:"h",      icon:Clock,  color:"from-cyan-500 to-cyan-600",    description:"Total"                },
    { title:"Série en cours",        value:p?.streak??0,                        suffix:" jours", icon:Flame,  color:"from-orange-500 to-red-500",   description:"Continuez !"          },
    { title:"XP total",              value:xp,                                  suffix:"",       icon:Zap,    color:"from-yellow-500 to-amber-500",  description:`Niveau ${p?.level??1}` },
  ]

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Bon retour, {displayName.split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground mt-1">Votre aperçu de productivité</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/share">
              <Button variant="outline" className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
                <Share2 className="mr-2 h-4 w-4"/> Partager
              </Button>
            </Link>
            <Link href="/focus">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90">
                <Timer className="mr-2 h-4 w-4"/> Démarrer le focus
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.03 }}>
          <GlassCard className="p-5 relative overflow-hidden h-full">
            <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none"/>
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">📝</div>
              <div>
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Rappel important</div>
                <p className="text-sm leading-relaxed text-white/70">
                  <span className="text-white font-semibold">Révise tes cours du jour</span> — même 20 minutes sur chaque matière.
                  La révision régulière installe les informations profondément dans ton cerveau et te fera{" "}
                  <span className="text-cyan-400 font-semibold">gagner énormément de temps</span> sur le long terme.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.06 }}>
          <RotatingQuotes/>
        </motion.div>
      </div>

      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Niveau {p?.level??1} → {(p?.level??1)+1}</span>
            <span className="text-sm font-medium">{xp.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2"/>
        </GlassCard>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card,i) => (
          <motion.div key={card.title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.05 }}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold"><AnimatedCounter value={card.value}/>{card.suffix}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} opacity-80`}>
                  <card.icon className="h-5 w-5 text-white"/>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <ProchaineMission todos={todos}/>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <ChainesDiscipline/>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-purple-400"/>
              <h2 className="font-semibold">Activité de la semaine</h2>
            </div>
            {weeklyData.every(d=>d.hours===0) ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                Aucune session cette semaine.{" "}
                <Link href="/focus" className="ml-1 text-purple-400 hover:underline">Commencez !</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12}/>
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(v) => `${v}h`}/>
                  <Tooltip
                    contentStyle={{ background:"rgba(0,0,0,0.8)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px" }}
                    labelStyle={{ color:"white" }}
                    formatter={(v: number) => [`${v}h`, "Focus"]}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#a855f7" strokeWidth={2} fill="url(#colorHours)" name="Heures"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-cyan-400"/>
                <h2 className="font-semibold">Sessions récentes</h2>
              </div>
              <Link href="/focus">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  Nouvelle <ChevronRight className="h-4 w-4 ml-1"/>
                </Button>
              </Link>
            </div>
            {sessions.length===0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Timer className="h-8 w-8 opacity-30"/>
                <p>Aucune session pour l'instant.</p>
                <Link href="/focus" className="text-purple-400 hover:underline text-xs">Commencez votre première session →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="font-medium capitalize">{getSessionName(session.session_type)}</p>
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
