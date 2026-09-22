"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import {
  Plus, X, Loader2, Flame, Check, Trash2,
  Trophy, TrendingUp, Calendar, Star, Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

type DailyTask = {
  id: string
  user_id: string
  title: string
  emoji: string
  color: string
  order_index: number
  active: boolean
  streak?: number
  completedToday?: boolean
}

const TASK_EMOJIS = ["✅","📚","🏃","💧","🧘","💪","🎯","📖","🍎","😴","✏️","🎵","🌱","🔥","⚡","🧠"]
const TASK_COLORS = ["#8b5cf6","#06b6d4","#22c55e","#f59e0b","#ec4899","#ef4444","#f97316","#6366f1"]
const SUGGESTIONS = [
  { title:"Faire du sport",        emoji:"🏃", color:"#22c55e" },
  { title:"Lire 30 minutes",       emoji:"📚", color:"#06b6d4" },
  { title:"Méditer",               emoji:"🧘", color:"#8b5cf6" },
  { title:"Boire 2L d'eau",        emoji:"💧", color:"#3b82f6" },
  { title:"Réviser mes cours",     emoji:"✏️",  color:"#f59e0b" },
  { title:"Dormir 8h",             emoji:"😴", color:"#6366f1" },
  { title:"Manger équilibré",      emoji:"🍎", color:"#22c55e" },
  { title:"Pas de réseaux sociaux",emoji:"📵", color:"#ef4444" },
]

function getTodayStr() {
  return new Date().toISOString().split("T")[0]
}

function getDateStr(daysAgo: number) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split("T")[0]
}

// ── Carte tâche du jour ───────────────────────────────────────────────────────
function DailyTaskCard({
  task, onToggle, onDelete,
}: {
  task: DailyTask
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}) {
  const [animating, setAnimating] = useState(false)

  function handleToggle() {
    if (task.completedToday) { onToggle(task.id, false); return }
    setAnimating(true)
    setTimeout(() => {
      onToggle(task.id, true)
      setAnimating(false)
    }, 600)
  }

  return (
    <motion.div layout
      initial={{ opacity:0, y:16, scale:0.95 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, scale:0.9 }}
      whileHover={{ y:-2 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: task.completedToday
          ? `linear-gradient(135deg,${task.color}20,${task.color}08)`
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${task.completedToday ? task.color+"50" : "rgba(255,255,255,0.07)"}`,
        boxShadow: task.completedToday ? `0 0 20px ${task.color}15` : "none",
      }}
      onClick={handleToggle}>

      {/* Barre top */}
      <div className="h-1 w-full" style={{ background:task.completedToday ? task.color : "rgba(255,255,255,0.06)" }}>
        {task.completedToday && (
          <motion.div className="h-full" style={{ background:task.color }}
            initial={{ width:0 }} animate={{ width:"100%" }} transition={{ duration:0.5 }}/>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          {/* Checkbox */}
          <motion.div
            animate={animating ? { scale:[1,1.3,0.9,1.1,1], rotate:[0,10,-10,5,0] } : {}}
            transition={{ duration:0.6 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background:task.completedToday ? task.color : "rgba(255,255,255,0.05)",
              border:`2px solid ${task.completedToday ? task.color : "rgba(255,255,255,0.1)"}` }}>
            {task.completedToday ? (
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:500 }}>
                <Check size={18} className="text-white"/>
              </motion.div>
            ) : (
              <span>{task.emoji}</span>
            )}
          </motion.div>

          {/* Delete */}
          <button onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={12}/>
          </button>
        </div>

        <h3 className={cn("font-semibold text-sm mb-2 transition-all",
          task.completedToday ? "text-white/50 line-through" : "text-white/90")}>
          {task.title}
        </h3>

        <div className="flex items-center justify-between">
          {/* Streak */}
          <div className="flex items-center gap-1">
            {(task.streak??0) > 0 ? (
              <div className="flex items-center gap-1 text-xs font-bold" style={{ color:"#f97316" }}>
                <Flame size={12}/>
                {task.streak}j
              </div>
            ) : (
              <span className="text-[10px] text-white/20">Pas de série</span>
            )}
          </div>

          {/* Status */}
          {task.completedToday && (
            <motion.div initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }}
              className="text-[10px] font-bold" style={{ color:task.color }}>
              ✓ Fait !
            </motion.div>
          )}
        </div>
      </div>

      {/* Confetti quand on coche */}
      <AnimatePresence>
        {animating && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({length:8}).map((_,i) => (
              <motion.div key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ background:["#fff","#ffd700",task.color,"#22c55e"][i%4],
                  left:`${20+Math.random()*60}%`, top:"50%" }}
                initial={{ y:0, opacity:1, scale:1 }}
                animate={{ y:-60-Math.random()*40, x:(Math.random()-0.5)*60, opacity:0, scale:0 }}
                transition={{ duration:0.8, delay:i*0.05 }}/>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function DailyTasksPage() {
  const [tasks, setTasks]       = useState<DailyTask[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newEmoji, setNewEmoji] = useState("✅")
  const [newColor, setNewColor] = useState(TASK_COLORS[0])
  const [saving, setSaving]     = useState(false)
  const [stats30, setStats30]   = useState<{date:string;completed:number;total:number;pct:number}[]>([])
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = getTodayStr()
    const start30 = getDateStr(29)

    const [{ data: tasksData }, { data: completions }] = await Promise.all([
      supabase.from("daily_tasks").select("*").eq("user_id", user.id).eq("active", true).order("order_index"),
      supabase.from("daily_task_completions").select("*").eq("user_id", user.id).gte("completed_date", start30),
    ])

    const allTasks = tasksData ?? []
    const allCompletions = completions ?? []

    // Calculer streak et completedToday pour chaque tâche
    const enriched = allTasks.map(task => {
      const taskCompletions = allCompletions
        .filter(c => c.task_id === task.id)
        .map(c => c.completed_date)
        .sort().reverse()

      const completedToday = taskCompletions.includes(today)

      // Calculer streak
      let streak = 0
      let d = new Date()
      if (!completedToday) d.setDate(d.getDate() - 1)
      while (true) {
        const key = d.toISOString().split("T")[0]
        if (taskCompletions.includes(key)) { streak++; d.setDate(d.getDate()-1) }
        else break
        if (streak > 365) break
      }

      return { ...task, completedToday, streak }
    })

    setTasks(enriched)

    // Stats 30 jours
    const stats = Array.from({length:30}, (_,i) => {
      const date = getDateStr(29-i)
      const total = allTasks.length
      const completed = allCompletions.filter(c => c.completed_date===date).length
      const pct = total > 0 ? Math.round((completed/total)*100) : 0
      return { date, completed, total, pct }
    })
    setStats30(stats)
    setLoading(false)
  }

  const handleToggle = useCallback(async (taskId: string, completed: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = getTodayStr()

    if (completed) {
      await supabase.from("daily_task_completions")
        .upsert({ task_id:taskId, user_id:user.id, completed_date:today })
    } else {
      await supabase.from("daily_task_completions")
        .delete().eq("task_id", taskId).eq("completed_date", today)
    }

    setTasks(prev => prev.map(t => t.id===taskId ? {
      ...t, completedToday:completed,
      streak: completed ? (t.streak??0)+1 : Math.max(0,(t.streak??0)-1)
    } : t))

    // Update stats
    const today2 = getTodayStr()
    setStats30(prev => prev.map(s => s.date===today2 ? {
      ...s,
      completed: completed ? s.completed+1 : s.completed-1,
      pct: s.total > 0 ? Math.round(((completed ? s.completed+1 : s.completed-1)/s.total)*100) : 0
    } : s))
  }, [])

  async function handleAdd(override?: {title:string;emoji:string;color:string}) {
    const title = override?.title ?? newTitle.trim()
    if (!title) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const emoji = override?.emoji ?? newEmoji
    const color = override?.color ?? newColor
    const maxIdx = Math.max(-1, ...tasks.map(t => t.order_index))
    const { data } = await supabase.from("daily_tasks")
      .insert({ title, emoji, color, user_id:user.id, order_index:maxIdx+1 })
      .select().single()
    if (data) setTasks(prev => [...prev, { ...data, completedToday:false, streak:0 }])
    setNewTitle(""); setNewEmoji("✅"); setNewColor(TASK_COLORS[0])
    setShowAdd(false); setSaving(false)
  }

  async function handleDelete(taskId: string) {
    await supabase.from("daily_task_completions").delete().eq("task_id", taskId)
    await supabase.from("daily_tasks").delete().eq("id", taskId)
    setTasks(prev => prev.filter(t => t.id!==taskId))
  }

  const completedToday = tasks.filter(t => t.completedToday).length
  const totalTasks     = tasks.length
  const scoreToday     = totalTasks > 0 ? Math.round((completedToday/totalTasks)*100) : 0
  const bestStreak     = Math.max(0, ...tasks.map(t => t.streak??0))

  const avg30 = stats30.length > 0
    ? Math.round(stats30.reduce((a,s) => a+s.pct, 0) / stats30.length)
    : 0

  const last7 = stats30.slice(-7)
  const avg7  = last7.length > 0
    ? Math.round(last7.reduce((a,s) => a+s.pct, 0) / last7.length)
    : 0

  // Semaines pour le tableau résumé
  const weeks = Array.from({length:5}, (_,wi) => ({
    label: wi===4 ? "Cette sem." : `S-${4-wi}`,
    days: stats30.slice(wi*6, wi*6+6),
  }))

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">

      {/* En-tête */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Tâches du jour
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Tes habitudes quotidiennes — chaque jour compte</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/40">
          <Plus className="h-4 w-4"/> Nouvelle habitude
        </motion.button>
      </motion.div>

      {/* Score du jour */}
      {totalTasks > 0 && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
          <GlassCard className="p-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background:`radial-gradient(circle,${scoreToday===100?"#22c55e":"#8b5cf6"}20,transparent 70%)`, filter:"blur(16px)" }}/>
            <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
              <div>
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Score du jour</div>
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-black"
                    style={{ fontFamily:"'Sora',sans-serif",
                      color: scoreToday===100 ? "#22c55e" : scoreToday>=50 ? "#a855f7" : "rgba(255,255,255,0.8)" }}>
                    {scoreToday}%
                  </div>
                  {scoreToday===100 && (
                    <motion.div animate={{ rotate:[0,10,-10,0], scale:[1,1.2,1] }} transition={{ duration:0.5, repeat:Infinity, repeatDelay:2 }}
                      className="text-3xl">🎉</motion.div>
                  )}
                </div>
                <div className="text-sm text-white/40 mt-1">{completedToday} / {totalTasks} tâches complétées</div>
              </div>

              <div className="flex items-center gap-4">
                {[
                  { label:"Meilleure série",  value:`${bestStreak}j`, icon:Flame,   color:"#f97316" },
                  { label:"Moy. 7 jours",     value:`${avg7}%`,       icon:TrendingUp, color:"#06b6d4" },
                  { label:"Moy. 30 jours",    value:`${avg30}%`,      icon:Calendar,   color:"#a855f7" },
                ].map((s,i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-0.5">
                      <s.icon size={11} style={{ color:s.color }}/>
                      <span className="text-[10px] text-white/30">{s.label}</span>
                    </div>
                    <div className="font-bold text-sm" style={{ color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full overflow-hidden relative z-10" style={{ background:"rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: scoreToday===100
                  ? "linear-gradient(90deg,#22c55e,#4ade80)"
                  : "linear-gradient(90deg,#7c3aed,#a855f7)" }}
                initial={{ width:0 }} animate={{ width:`${scoreToday}%` }}
                transition={{ duration:1, ease:"easeOut" }}/>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* État vide */}
      {!loading && totalTasks===0 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="rounded-2xl p-8 text-center"
          style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.08)" }}>
          <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity }}>
            <span style={{ fontSize:52 }}>🌅</span>
          </motion.div>
          <h3 className="mt-4 text-lg font-bold text-white">Crée tes habitudes quotidiennes</h3>
          <p className="mt-2 text-sm text-white/40 max-w-sm mx-auto">
            Des petites actions répétées chaque jour créent de grands résultats.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((s,i) => (
              <motion.button key={i}
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1+i*0.04 }}
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                onClick={() => handleAdd(s)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
                style={{ background:`${s.color}15`, border:`1px solid ${s.color}30`, color:"rgba(255,255,255,0.7)" }}>
                {s.emoji} {s.title}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grille de tâches */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400"/>
        </div>
      ) : totalTasks > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {tasks.map(task => (
                <DailyTaskCard key={task.id} task={task}
                  onToggle={handleToggle} onDelete={handleDelete}/>
              ))}
            </AnimatePresence>

            {/* Bouton ajouter inline */}
            <motion.button
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              onClick={() => setShowAdd(true)}
              className="rounded-2xl flex flex-col items-center justify-center gap-2 p-5 text-white/20 hover:text-white/50 transition-all"
              style={{ border:"1px dashed rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.01)", minHeight:120 }}>
              <Plus size={20}/>
              <span className="text-xs">Ajouter</span>
            </motion.button>
          </div>

          {/* TABLEAU RÉSUMÉ 30 JOURS */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-5 w-5 text-violet-400"/>
                <h2 className="font-semibold">Productivité sur 30 jours</h2>
                <div className="ml-auto flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", color:"#a855f7" }}>
                    Moy. {avg30}%
                  </div>
                </div>
              </div>

              {/* Graphique en barres */}
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats30} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={9}
                    tickFormatter={d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}` }}
                    interval={4}/>
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickFormatter={v => `${v}%`} domain={[0,100]}/>
                  <Tooltip
                    contentStyle={{ background:"rgba(10,10,18,0.95)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px" }}
                    formatter={(v:number, _:any, p:any) => [`${v}% (${p.payload.completed}/${p.payload.total})`, "Complété"]}
                    labelFormatter={d => new Date(d).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}/>
                  <Bar dataKey="pct" radius={[3,3,0,0]}>
                    {stats30.map((s,i) => (
                      <Cell key={i} fill={s.pct===100?"#22c55e":s.pct>=50?"#8b5cf6":"rgba(139,92,246,0.25)"}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Grille heatmap 30 jours */}
              <div className="mt-5">
                <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Vue calendrier</div>
                <div className="grid gap-1.5" style={{ gridTemplateColumns:"repeat(10, 1fr)" }}>
                  {stats30.map((s,i) => {
                    const dt = new Date(s.date)
                    const isToday = s.date === getTodayStr()
                    return (
                      <motion.div key={i}
                        initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }}
                        transition={{ delay:i*0.01 }}
                        className="aspect-square rounded-md flex items-center justify-center"
                        style={{
                          background: s.total===0 ? "rgba(255,255,255,0.03)"
                            : s.pct===100 ? "#22c55e"
                            : s.pct>=75 ? "rgba(34,197,94,0.6)"
                            : s.pct>=50 ? "rgba(139,92,246,0.6)"
                            : s.pct>=25 ? "rgba(139,92,246,0.3)"
                            : "rgba(255,255,255,0.06)",
                          border: isToday ? "1.5px solid rgba(139,92,246,0.8)" : "1px solid rgba(255,255,255,0.04)",
                        }}
                        title={`${dt.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})} — ${s.pct}% (${s.completed}/${s.total})`}>
                        {s.pct===100 && <span style={{ fontSize:8 }}>✓</span>}
                      </motion.div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-white/25">
                  {[
                    { color:"rgba(255,255,255,0.06)", label:"0%" },
                    { color:"rgba(139,92,246,0.3)",  label:"25%" },
                    { color:"rgba(139,92,246,0.6)",  label:"50%" },
                    { color:"rgba(34,197,94,0.6)",   label:"75%" },
                    { color:"#22c55e",               label:"100%" },
                  ].map((l,i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ background:l.color }}/>
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats résumé */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  { label:"Jours parfaits",   value:stats30.filter(s=>s.pct===100).length, suffix:"j", color:"#22c55e", icon:Star },
                  { label:"Moy. hebdo",        value:avg7,  suffix:"%", color:"#06b6d4", icon:Calendar },
                  { label:"Moy. mensuelle",    value:avg30, suffix:"%", color:"#a855f7", icon:TrendingUp },
                  { label:"Meilleure série",   value:bestStreak, suffix:"j", color:"#f97316", icon:Flame },
                ].map((s,i) => (
                  <div key={i} className="rounded-xl p-3 text-center"
                    style={{ background:`${s.color}08`, border:`1px solid ${s.color}20` }}>
                    <s.icon size={14} className="mx-auto mb-1" style={{ color:s.color }}/>
                    <div className="text-xl font-black" style={{ color:s.color, fontFamily:"'Sora',sans-serif" }}>
                      {s.value}{s.suffix}
                    </div>
                    <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}

      {/* Modal ajout */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
            onClick={e => { if (e.target===e.currentTarget) setShowAdd(false) }}>
            <motion.div initial={{ scale:0.94, y:16, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }}
              exit={{ scale:0.94, y:8, opacity:0 }} transition={{ type:"spring", stiffness:400, damping:30 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden"
              style={{ background:"linear-gradient(135deg,rgba(20,20,35,0.98),rgba(10,10,20,0.98))",
                backdropFilter:"blur(24px)", boxShadow:"0 24px 80px rgba(0,0,0,0.7)" }}>

              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h3 className="font-semibold text-white">Nouvelle habitude quotidienne</h3>
                <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
                  onClick={() => setShowAdd(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08]">
                  <X className="h-4 w-4"/>
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                {/* Suggestions */}
                <div>
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 block">Suggestions</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s,i) => (
                      <button key={i} onClick={() => { setNewTitle(s.title); setNewEmoji(s.emoji); setNewColor(s.color) }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{ background:`${s.color}15`, border:`1px solid ${s.color}25`, color:"rgba(255,255,255,0.6)" }}>
                        {s.emoji} {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Emoji</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TASK_EMOJIS.map(e => (
                      <button key={e} onClick={() => setNewEmoji(e)}
                        className={cn("w-9 h-9 rounded-xl text-lg transition-all hover:scale-110",
                          newEmoji===e ? "bg-white/[0.15] ring-2 ring-violet-500/50" : "bg-white/[0.04] hover:bg-white/[0.08]")}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titre */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Titre</label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="Mon habitude quotidienne..."
                    className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"
                    autoFocus onKeyDown={e => e.key==="Enter" && handleAdd()}/>
                </div>

                {/* Couleur */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Couleur</label>
                  <div className="flex gap-2 flex-wrap">
                    {TASK_COLORS.map(color => (
                      <button key={color} onClick={() => setNewColor(color)}
                        className={cn("w-8 h-8 rounded-full transition-all",
                          newColor===color ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "hover:scale-105")}
                        style={{ backgroundColor:color }}/>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => handleAdd()} disabled={saving || !newTitle.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg transition-all disabled:opacity-50">
                    {saving ? "Création..." : "Créer l'habitude"}
                  </motion.button>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => setShowAdd(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                    Annuler
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
