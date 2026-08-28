"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, ChevronLeft, ChevronRight, Flame, TrendingUp,
  X, Check, Loader2, Sparkles, Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const COLORS = [
  "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#ef4444", "#f97316",
]

const HABIT_SUGGESTIONS = [
  { name:"Méditation", emoji:"🧘", color:"#8b5cf6" },
  { name:"Sport 30 min", emoji:"🏃", color:"#22c55e" },
  { name:"Lecture", emoji:"📚", color:"#06b6d4" },
  { name:"Boire 2L d'eau", emoji:"💧", color:"#3b82f6" },
  { name:"Réviser les cours", emoji:"✏️", color:"#f59e0b" },
  { name:"Pas de réseaux sociaux", emoji:"📵", color:"#ef4444" },
]

type Habit = { id:string; user_id:string; name:string; color:string; created_at:string }
type HabitEntry = { id:string; habit_id:string; date:string; completed:boolean }

function getWeekDates(offset: number) {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + offset * 7)
  return Array.from({ length:7 }, (_,i) => {
    const d = new Date(monday); d.setDate(monday.getDate()+i); return d
  })
}

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,"0")
  const day = String(d.getDate()).padStart(2,"0")
  return `${y}-${m}-${day}`
}

function isToday(d: Date) {
  return formatDate(d) === formatDate(new Date())
}

function formatWeekLabel(dates: Date[], offset: number) {
  if (offset === 0) return "Cette semaine"
  if (offset === -1) return "Semaine dernière"
  if (offset === 1) return "Semaine prochaine"
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR",{month:"short",day:"numeric"})
  return `${fmt(dates[0])} – ${fmt(dates[6])}`
}

export default function HabitsPage() {
  const [habits, setHabits]         = useState<Habit[]>([])
  const [entries, setEntries]       = useState<HabitEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAdd, setShowAdd]       = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitColor, setNewHabitColor] = useState(COLORS[0])
  const [saving, setSaving]         = useState(false)

  const weekDates = getWeekDates(weekOffset)
  const weekLabel = formatWeekLabel(weekDates, weekOffset)
  const weekStart = formatDate(weekDates[0])
  const weekEnd   = formatDate(weekDates[6])

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: habitsData }, { data: entriesData }] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id",user.id).order("created_at"),
      supabase.from("habit_entries").select("*").eq("user_id",user.id).gte("date",weekStart).lte("date",weekEnd),
    ])
    setHabits(habitsData??[])
    setEntries(entriesData??[])
    setLoading(false)
  }, [weekStart, weekEnd])

  useEffect(() => { setLoading(true); loadData() }, [loadData])

  const isCompleted = (habitId: string, date: Date) =>
    entries.some(e => e.habit_id===habitId && e.date===formatDate(date) && e.completed)

  const toggleEntry = async (habitId: string, date: Date) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const dateStr = formatDate(date)
    const existing = entries.find(e => e.habit_id===habitId && e.date===dateStr)
    if (existing) {
      const newCompleted = !existing.completed
      await supabase.from("habit_entries").update({completed:newCompleted}).eq("id",existing.id)
      setEntries(prev => prev.map(e => e.id===existing.id ? {...e,completed:newCompleted} : e))
    } else {
      const { data } = await supabase.from("habit_entries")
        .insert({habit_id:habitId, user_id:user.id, date:dateStr, completed:true})
        .select().single()
      if (data) setEntries(prev => [...prev, data])
    }
  }

  const addHabit = async (name?: string, color?: string) => {
    const habitName = name ?? newHabitName.trim()
    const habitColor = color ?? newHabitColor
    if (!habitName) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { data } = await supabase.from("habits")
      .insert({name:habitName, color:habitColor, user_id:user.id})
      .select().single()
    if (data) setHabits(prev => [...prev,data])
    setNewHabitName(""); setNewHabitColor(COLORS[0])
    setShowAdd(false); setSaving(false)
  }

  const deleteHabit = async (id: string) => {
    const supabase = createClient()
    await supabase.from("habit_entries").delete().eq("habit_id",id)
    await supabase.from("habits").delete().eq("id",id)
    setHabits(prev => prev.filter(h => h.id!==id))
    setEntries(prev => prev.filter(e => e.habit_id!==id))
  }

  const totalPossible  = habits.length * 7
  const totalCompleted = entries.filter(e => e.completed).length
  const successRate    = totalPossible > 0 ? Math.round((totalCompleted/totalPossible)*100) : 0

  const getStreak = () => {
    if (habits.length===0) return 0
    let streak = 0
    const today = new Date()
    for (let i=0; i<30; i++) {
      const d = new Date(today); d.setDate(today.getDate()-i)
      const dayEntries = entries.filter(e => e.date===formatDate(d) && e.completed)
      if (dayEntries.length>0) streak++
      else if (i>0) break
    }
    return streak
  }

  // Score message
  const getScoreMessage = () => {
    if (successRate === 0) return { msg:"Lance-toi ! Chaque habitude compte 💪", color:"rgba(255,255,255,0.3)" }
    if (successRate < 30)  return { msg:"Bon début, continue sur ta lancée 🌱", color:"#22c55e" }
    if (successRate < 60)  return { msg:"Tu es sur la bonne voie, ne lâche pas ! 🔥", color:"#f59e0b" }
    if (successRate < 80)  return { msg:"Excellente semaine, tu es en feu ! ⚡", color:"#8b5cf6" }
    return                        { msg:"Semaine parfaite ! Tu es inarrêtable 👑", color:"#a855f7" }
  }

  const scoreMsg = getScoreMessage()

  return (
    <div className="flex flex-col gap-5">

      {/* ── EN-TÊTE ── */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Suivi des Habitudes
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Ta seule habitude à prendre, c'est celle de remplir ce tableau !</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/40 transition-all">
          <Plus className="h-4 w-4"/> Nouvelle habitude
        </motion.button>
      </motion.div>

      {/* ── STATS ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md px-5 py-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
            <Flame className="h-5 w-5 text-orange-400"/>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">{getStreak()}</p>
            <p className="text-xs text-white/40">Jours de suite</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md px-5 py-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-400"/>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{successRate}%</p>
            <p className="text-xs text-white/40">Réussite cette semaine</p>
          </div>
        </div>
      </motion.div>

      {/* Message score */}
      {habits.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.08 }}
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", color:scoreMsg.color }}>
          {scoreMsg.msg}
        </motion.div>
      )}

      {/* ── ÉTAT VIDE ENGAGEANT ── */}
      {!loading && habits.length === 0 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-8 text-center"
          style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.08)" }}>
          <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity }}>
            <span style={{ fontSize:52 }}>🌱</span>
          </motion.div>
          <h3 className="mt-4 text-lg font-bold text-white">Commence ta première habitude</h3>
          <p className="mt-2 text-sm text-white/40 max-w-sm mx-auto">
            Les grandes transformations commencent par de petites habitudes quotidiennes. Choisis-en une et ne brise jamais la chaîne.
          </p>

          {/* Suggestions rapides */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Suggestions populaires</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {HABIT_SUGGESTIONS.map((s,i) => (
                <motion.button key={i}
                  initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15+i*0.05 }}
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => addHabit(s.name, s.color)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background:`${s.color}15`, border:`1px solid ${s.color}30`, color:"rgba(255,255,255,0.7)" }}>
                  <span>{s.emoji}</span> {s.name}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowAdd(true)}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white mx-auto bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/40">
            <Plus className="h-4 w-4"/> Créer une habitude personnalisée
          </motion.button>
        </motion.div>
      )}

      {/* ── TABLEAU ── */}
      {(loading || habits.length > 0) && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md overflow-hidden">

          {/* Navigation semaine */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <motion.button whileHover={{ scale:1.1, x:-2 }} whileTap={{ scale:0.9 }}
              onClick={() => setWeekOffset(o => o-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
              <ChevronLeft className="h-5 w-5"/>
            </motion.button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-white">Semaine : </span>
              <span className="text-xs text-white/40">
                {weekDates[0].toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} –{" "}
                {weekDates[6].toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {weekOffset !== 0 && (
                <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }}
                  onClick={() => setWeekOffset(0)}
                  className="text-xs px-2.5 py-1 rounded-lg text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all">
                  Aujourd'hui
                </motion.button>
              )}
              <motion.button whileHover={{ scale:1.1, x:2 }} whileTap={{ scale:0.9 }}
                onClick={() => setWeekOffset(o => o+1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <ChevronRight className="h-5 w-5"/>
              </motion.button>
            </div>
          </div>

          {/* En-têtes jours */}
          <div className="grid border-b border-white/[0.06]" style={{ gridTemplateColumns:"200px repeat(7, 1fr)" }}>
            <div className="px-5 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Habitudes</div>
            {DAYS.map((day,i) => {
              const date = weekDates[i]
              const today = isToday(date)
              return (
                <div key={day} className={cn("flex flex-col items-center py-3 border-l border-white/[0.04]", today && "bg-violet-500/[0.06]")}>
                  <span className={cn("text-[10px] font-medium uppercase tracking-wider", today ? "text-violet-400" : "text-white/40")}>{day}</span>
                  <span className={cn("text-sm font-bold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full",
                    today ? "bg-violet-500 text-white shadow-lg shadow-violet-500/40" : "text-white/70")}>
                    {date.getDate()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Lignes habitudes */}
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-violet-400"/>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {habits.map((habit, hi) => (
                <motion.div key={habit.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}
                  transition={{ delay:hi*0.03 }}
                  className="grid border-b border-white/[0.04] last:border-b-0 group hover:bg-white/[0.01] transition-colors"
                  style={{ gridTemplateColumns:"200px repeat(7, 1fr)" }}>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor:habit.color }}/>
                    <span className="text-sm font-medium text-white/90 truncate flex-1">{habit.name}</span>
                    <button onClick={() => deleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-white/30 hover:text-red-400 transition-all flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5"/>
                    </button>
                  </div>
                  {weekDates.map((date, di) => {
                    const completed = isCompleted(habit.id, date)
                    const future = date > new Date() && !isToday(date)
                    return (
                      <div key={di} className={cn("flex items-center justify-center border-l border-white/[0.04] py-4", isToday(date) && "bg-violet-500/[0.03]")}>
                        <motion.button
                          whileHover={!future ? { scale:1.15 } : {}}
                          whileTap={!future ? { scale:0.9 } : {}}
                          onClick={() => !future && toggleEntry(habit.id, date)}
                          disabled={future}
                          className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                            completed ? "border-transparent shadow-lg" : "border-white/[0.15] hover:border-white/30",
                            future && "opacity-30 cursor-not-allowed")}
                          style={completed ? { backgroundColor:habit.color, boxShadow:`0 0 12px ${habit.color}60` } : {}}>
                          {completed && (
                            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:500, damping:25 }}>
                              <Check className="h-4 w-4 text-white"/>
                            </motion.div>
                          )}
                        </motion.button>
                      </div>
                    )
                  })}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Bouton ajouter bas */}
          <div className="px-5 py-3 border-t border-white/[0.06]">
            <button onClick={() => setShowAdd(true)}
              className="w-full py-2 rounded-xl border border-dashed border-white/[0.1] text-xs text-white/30 hover:text-white/60 hover:border-white/20 transition-all">
              + Ajouter une nouvelle habitude
            </button>
          </div>
        </motion.div>
      )}

      {/* ── MODAL AJOUT ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
            onClick={e => { if (e.target===e.currentTarget) setShowAdd(false) }}>
            <motion.div
              initial={{ scale:0.94, y:16, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }}
              exit={{ scale:0.94, y:8, opacity:0 }} transition={{ type:"spring", stiffness:400, damping:30 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden"
              style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))", backdropFilter:"blur(24px)", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h3 className="text-sm font-semibold text-white">Nouvelle habitude</h3>
                <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
                  onClick={() => setShowAdd(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors">
                  <X className="h-4 w-4"/>
                </motion.button>
              </div>

              {/* Suggestions rapides dans modal */}
              <div className="px-6 pt-4">
                <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2">Suggestions rapides</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {HABIT_SUGGESTIONS.map((s,i) => (
                    <button key={i} onClick={() => { setNewHabitName(s.name); setNewHabitColor(s.color) }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                      style={{ background:`${s.color}15`, border:`1px solid ${s.color}25`, color:"rgba(255,255,255,0.6)" }}>
                      {s.emoji} {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Nom de l'habitude</label>
                  <Input value={newHabitName} onChange={e => setNewHabitName(e.target.value)}
                    placeholder="Ex: Méditation, Sport, Lecture..."
                    className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"
                    autoFocus onKeyDown={e => e.key==="Enter" && addHabit()}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Couleur</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button key={color} onClick={() => setNewHabitColor(color)}
                        className={cn("w-8 h-8 rounded-full transition-all", newHabitColor===color ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "hover:scale-105")}
                        style={{ backgroundColor:color }}/>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => addHabit()}
                    disabled={saving || !newHabitName.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg transition-all disabled:opacity-50">
                    {saving ? "Ajout..." : "Créer l'habitude"}
                  </motion.button>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => setShowAdd(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80 transition-all">
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
