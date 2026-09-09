"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Loader2, TrendingUp, Clock, Zap, Target, Flame, BarChart2, Sun, Moon, Sunset } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell,
} from "recharts"

// ── Types ─────────────────────────────────────────────────────────────────────
type Session = {
  duration: number
  xp_earned: number
  session_type: string
  completed_at: string
}

type Todo = {
  completed: boolean
  priority: string
  created_at: string
}

// ── Utilitaires ───────────────────────────────────────────────────────────────
function getWeekLabel(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return `${d.getDate()}/${d.getMonth()+1}`
}

function getDayName(index: number) {
  return ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"][index]
}

const CATEGORY_COLORS: Record<string,string> = {
  "deep-work": "#8b5cf6",
  "pomodoro":  "#06b6d4",
  "study":     "#ec4899",
  "creative":  "#f59e0b",
}
const CATEGORY_NAMES: Record<string,string> = {
  "deep-work": "Travail profond",
  "pomodoro":  "Pomodoro",
  "study":     "Études",
  "creative":  "Créatif",
}

// ── Composant tooltip custom ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs"
      style={{ background:"rgba(10,10,18,0.95)", border:"1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color:p.color ?? "#a855f7" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{unit ?? ""}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [loading, setLoading]             = useState(true)
  const [sessions, setSessions]           = useState<Session[]>([])
  const [todos, setTodos]                 = useState<Todo[]>([])

  // Données calculées
  const [productivityCurve, setProductivityCurve] = useState<any[]>([])
  const [hourlyData, setHourlyData]               = useState<any[]>([])
  const [weekdayData, setWeekdayData]             = useState<any[]>([])
  const [weekComparison, setWeekComparison]       = useState<any[]>([])
  const [categoryData, setCategoryData]           = useState<any[]>([])
  const [bestHour, setBestHour]                   = useState<number|null>(null)
  const [bestDay, setBestDay]                     = useState<number|null>(null)
  const [totalStats, setTotalStats]               = useState({ sessions:0, hours:0, xp:0, avgPerDay:0 })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      const [{ data: sessData }, { data: todoData }] = await Promise.all([
        supabase.from("focus_sessions")
          .select("duration, xp_earned, session_type, completed_at")
          .eq("user_id", user.id)
          .gte("completed_at", threeMonthsAgo.toISOString())
          .order("completed_at", { ascending: true }),
        supabase.from("todos")
          .select("completed, priority, created_at")
          .eq("user_id", user.id)
          .gte("created_at", threeMonthsAgo.toISOString()),
      ])

      const sess  = sessData ?? []
      const todos = todoData ?? []
      setSessions(sess)
      setTodos(todos)

      // ── 1. Courbe productivité sur 90 jours (par semaine) ──────────────────
      const weekMap: Record<string, { hours:number; xp:number; count:number }> = {}
      for (const s of sess) {
        const d    = new Date(s.completed_at)
        const week = getWeekLabel(d)
        if (!weekMap[week]) weekMap[week] = { hours:0, xp:0, count:0 }
        weekMap[week].hours += s.duration / 60
        weekMap[week].xp    += s.xp_earned
        weekMap[week].count += 1
      }
      const curve = Object.entries(weekMap).map(([week, v]) => ({
        week,
        heures: Math.round(v.hours * 10) / 10,
        xp:     v.xp,
        sessions: v.count,
      }))
      setProductivityCurve(curve)

      // ── 2. Meilleure heure de la journée ──────────────────────────────────
      const hourMap: Record<number, { minutes:number; count:number }> = {}
      for (let h = 0; h < 24; h++) hourMap[h] = { minutes:0, count:0 }
      for (const s of sess) {
        const h = new Date(s.completed_at).getHours()
        hourMap[h].minutes += s.duration
        hourMap[h].count   += 1
      }
      const hourly = Object.entries(hourMap)
        .filter(([h]) => parseInt(h) >= 6 && parseInt(h) <= 23)
        .map(([h, v]) => ({
          heure: `${h}h`,
          minutes: v.minutes,
          sessions: v.count,
        }))
      setHourlyData(hourly)
      const bestH = Object.entries(hourMap).reduce((best, [h, v]) =>
        v.minutes > hourMap[parseInt(best)].minutes ? h : best, "0")
      setBestHour(parseInt(bestH))

      // ── 3. Jours les plus productifs de la semaine ────────────────────────
      const dayMap: Record<number, { minutes:number; count:number }> = {}
      for (let d = 0; d < 7; d++) dayMap[d] = { minutes:0, count:0 }
      for (const s of sess) {
        const day = (new Date(s.completed_at).getDay() + 6) % 7 // 0=Lun
        dayMap[day].minutes += s.duration
        dayMap[day].count   += 1
      }
      const weekdays = Array.from({ length:7 }, (_,i) => ({
        jour:     getDayName(i),
        minutes:  dayMap[i].minutes,
        sessions: dayMap[i].count,
        heures:   Math.round(dayMap[i].minutes/60*10)/10,
      }))
      setWeekdayData(weekdays)
      const bestD = Object.entries(dayMap).reduce((best, [d, v]) =>
        v.minutes > dayMap[parseInt(best)].minutes ? d : best, "0")
      setBestDay(parseInt(bestD))

      // ── 4. Comparaison semaine vs semaine précédente ───────────────────────
      const now        = new Date()
      const thisMonday = new Date(now)
      const day        = now.getDay()
      thisMonday.setDate(now.getDate() - (day===0?6:day-1))
      thisMonday.setHours(0,0,0,0)
      const lastMonday = new Date(thisMonday)
      lastMonday.setDate(thisMonday.getDate() - 7)

      const thisWeek = sess.filter(s => new Date(s.completed_at) >= thisMonday)
      const lastWeek = sess.filter(s => {
        const d = new Date(s.completed_at)
        return d >= lastMonday && d < thisMonday
      })

      const weekDays = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
      const comparison = weekDays.map((jour, i) => {
        const thisDayMin = thisWeek
          .filter(s => (new Date(s.completed_at).getDay()+6)%7===i)
          .reduce((a,s) => a+s.duration, 0)
        const lastDayMin = lastWeek
          .filter(s => (new Date(s.completed_at).getDay()+6)%7===i)
          .reduce((a,s) => a+s.duration, 0)
        return {
          jour,
          "Cette semaine": Math.round(thisDayMin/60*10)/10,
          "Semaine passée": Math.round(lastDayMin/60*10)/10,
        }
      })
      setWeekComparison(comparison)

      // ── 5. Répartition par type de session ────────────────────────────────
      const catMap: Record<string, number> = {}
      for (const s of sess) {
        catMap[s.session_type] = (catMap[s.session_type]??0) + s.duration
      }
      const cats = Object.entries(catMap).map(([type, min]) => ({
        name:    CATEGORY_NAMES[type] ?? type,
        type,
        valeur:  Math.round(min/60*10)/10,
        color:   CATEGORY_COLORS[type] ?? "#8b5cf6",
      })).sort((a,b) => b.valeur - a.valeur)
      setCategoryData(cats)

      // ── 6. Stats globales ─────────────────────────────────────────────────
      const totalHours = sess.reduce((a,s) => a+s.duration, 0) / 60
      const totalXP    = sess.reduce((a,s) => a+s.xp_earned, 0)
      const days       = Math.ceil((Date.now() - threeMonthsAgo.getTime()) / 86400000)
      setTotalStats({
        sessions: sess.length,
        hours:    Math.round(totalHours * 10) / 10,
        xp:       totalXP,
        avgPerDay: Math.round(totalHours / days * 60 * 10) / 10,
      })

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-400"/>
    </div>
  )

  const getBestHourLabel = () => {
    if (bestHour === null) return "—"
    if (bestHour >= 5  && bestHour < 12) return `${bestHour}h — Matin 🌅`
    if (bestHour >= 12 && bestHour < 18) return `${bestHour}h — Après-midi ☀️`
    return `${bestHour}h — Soir 🌙`
  }

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-2xl font-bold sm:text-3xl">Analyse</h1>
        <p className="text-muted-foreground mt-1">Tes statistiques sur les 3 derniers mois</p>
      </motion.div>

      {/* ── STATS RAPIDES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon:Target, label:"Sessions totales",    value:totalStats.sessions,        suffix:"",    color:"from-purple-500 to-violet-600" },
          { icon:Clock,  label:"Heures de focus",     value:totalStats.hours,           suffix:"h",   color:"from-cyan-500 to-teal-600"    },
          { icon:Zap,    label:"XP gagnés",           value:totalStats.xp.toLocaleString(), suffix:"", color:"from-yellow-500 to-amber-600" },
          { icon:Flame,  label:"Moy. par jour",       value:totalStats.avgPerDay,       suffix:"min", color:"from-orange-500 to-red-600"   },
        ].map((s,i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} opacity-80`}>
                  <s.icon className="h-5 w-5 text-white"/>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{s.value}{s.suffix}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── INSIGHTS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { emoji:"⏰", label:"Meilleure heure",   value:getBestHourLabel(),                    color:"#8b5cf6" },
          { emoji:"📅", label:"Meilleur jour",     value:bestDay!==null ? getDayName(bestDay) : "—", color:"#06b6d4" },
          { emoji:"🏆", label:"Type favori",       value:categoryData[0] ? categoryData[0].name : "—", color:"#f59e0b" },
        ].map((s,i) => (
          <motion.div key={i} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1+i*0.05 }}>
            <div className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <div className="text-xs text-white/40 mb-0.5">{s.label}</div>
                <div className="text-sm font-bold" style={{ color:s.color }}>{s.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── COURBE PRODUCTIVITÉ 3 MOIS ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-violet-400"/>
            <h2 className="font-semibold">Courbe de productivité — 3 mois</h2>
          </div>
          {productivityCurve.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-white/30 text-sm">
              Pas encore assez de données
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productivityCurve}>
                <defs>
                  <linearGradient id="gradHeures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradXP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={11}/>
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11}/>
                <Tooltip content={<CustomTooltip unit="h"/>}/>
                <Area type="monotone" dataKey="heures" stroke="#a855f7" strokeWidth={2}
                  fill="url(#gradHeures)" name="Heures"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </motion.div>

      {/* ── COMPARAISON SEMAINES ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="h-5 w-5 text-cyan-400"/>
            <h2 className="font-semibold">Cette semaine vs semaine passée</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekComparison} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="jour" stroke="rgba(255,255,255,0.3)" fontSize={11}/>
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={v => `${v}h`}/>
              <Tooltip content={<CustomTooltip unit="h"/>}/>
              <Bar dataKey="Cette semaine"  fill="#a855f7" radius={[4,4,0,0]} name="Cette semaine"/>
              <Bar dataKey="Semaine passée" fill="rgba(168,85,247,0.25)" radius={[4,4,0,0]} name="Semaine passée"/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background:"#a855f7" }}/>
              <span className="text-xs text-white/40">Cette semaine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background:"rgba(168,85,247,0.25)" }}/>
              <span className="text-xs text-white/40">Semaine passée</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── MEILLEURE HEURE ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="h-5 w-5 text-amber-400"/>
              <h2 className="font-semibold">Meilleure heure de travail</h2>
            </div>
            {hourlyData.every(h => h.minutes === 0) ? (
              <div className="flex h-40 items-center justify-center text-white/30 text-sm">
                Pas encore de données
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="heure" stroke="rgba(255,255,255,0.3)" fontSize={10}
                    interval={2} tick={{ fontSize:10 }}/>
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={v => `${v}m`}/>
                  <Tooltip content={<CustomTooltip unit=" min"/>}/>
                  <Bar dataKey="minutes" radius={[3,3,0,0]} name="Minutes">
                    {hourlyData.map((entry, index) => (
                      <Cell key={index}
                        fill={parseInt(entry.heure) === bestHour ? "#f59e0b" : "rgba(245,158,11,0.2)"}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>

        {/* ── JOURS LES PLUS PRODUCTIFS ── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Flame className="h-5 w-5 text-orange-400"/>
              <h2 className="font-semibold">Jours les plus productifs</h2>
            </div>
            {weekdayData.every(d => d.minutes === 0) ? (
              <div className="flex h-40 items-center justify-center text-white/30 text-sm">
                Pas encore de données
              </div>
            ) : (
              <div className="space-y-2.5">
                {weekdayData.map((d, i) => {
                  const max = Math.max(...weekdayData.map(x => x.minutes))
                  const pct = max > 0 ? (d.minutes / max) * 100 : 0
                  const isBest = i === bestDay
                  return (
                    <div key={d.jour} className="flex items-center gap-3">
                      <span className={`text-xs font-medium w-8 flex-shrink-0 ${isBest ? "text-orange-400" : "text-white/40"}`}>
                        {d.jour}
                      </span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background: isBest ? "linear-gradient(90deg,#f97316,#ef4444)" : "rgba(249,115,22,0.35)" }}
                          initial={{ width:0 }} animate={{ width:`${pct}%` }}
                          transition={{ duration:0.8, delay:i*0.05 }}/>
                      </div>
                      <span className="text-xs text-white/30 w-12 text-right flex-shrink-0">
                        {d.heures}h
                      </span>
                      {isBest && <span className="text-xs">🏆</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* ── RÉPARTITION PAR TYPE ── */}
      {categoryData.length > 0 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="h-5 w-5 text-pink-400"/>
              <h2 className="font-semibold">Répartition par type de session</h2>
            </div>
            <div className="space-y-3">
              {categoryData.map((cat, i) => {
                const total = categoryData.reduce((a,c) => a+c.valeur, 0)
                const pct   = total > 0 ? Math.round((cat.valeur/total)*100) : 0
                return (
                  <div key={cat.type} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background:cat.color }}/>
                    <span className="text-sm text-white/70 flex-1">{cat.name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden max-w-40" style={{ background:"rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background:cat.color }}
                        initial={{ width:0 }} animate={{ width:`${pct}%` }}
                        transition={{ duration:0.8, delay:i*0.1 }}/>
                    </div>
                    <span className="text-xs text-white/40 w-16 text-right">{cat.valeur}h ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
