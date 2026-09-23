"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, Loader2, ChevronLeft, ChevronRight, Trash2, Check, TrendingUp, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DailyTask = {
  id: string
  title: string
  emoji: string
  color: string
  order_index: number
}

type Completion = {
  task_id: string
  completed_date: string
}

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
const DAYS_SHORT = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]

function getWeekDates(weekOffset: number) {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function dateStr(d: Date) {
  return d.toISOString().split("T")[0]
}

function isToday(d: Date) {
  return dateStr(d) === dateStr(new Date())
}

export default function DailyTasksPage() {
  const [tasks, setTasks]             = useState<DailyTask[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading]         = useState(true)
  const [weekOffset, setWeekOffset]   = useState(0)
  const [newTitle, setNewTitle]       = useState("")
  const [adding, setAdding]           = useState(false)
  const [saving, setSaving]           = useState(false)

  const weekDates = getWeekDates(weekOffset)
  const weekStart = dateStr(weekDates[0])
  const weekEnd   = dateStr(weekDates[6])

  const supabase = createClient()

  useEffect(() => { load() }, [weekOffset])

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("daily_tasks").select("*").eq("user_id", user.id).eq("active", true).order("order_index"),
      supabase.from("daily_task_completions").select("task_id, completed_date")
        .eq("user_id", user.id).gte("completed_date", weekStart).lte("completed_date", weekEnd),
    ])

    setTasks(t ?? [])
    setCompletions(c ?? [])
    setLoading(false)
  }

  function isDone(taskId: string, date: Date) {
    return completions.some(c => c.task_id === taskId && c.completed_date === dateStr(date))
  }

  async function toggleCell(taskId: string, date: Date) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const d = dateStr(date)
    const done = isDone(taskId, date)

    if (done) {
      await supabase.from("daily_task_completions")
        .delete().eq("task_id", taskId).eq("completed_date", d)
      setCompletions(prev => prev.filter(c => !(c.task_id===taskId && c.completed_date===d)))
    } else {
      await supabase.from("daily_task_completions")
        .upsert({ task_id:taskId, user_id:user.id, completed_date:d })
      setCompletions(prev => [...prev, { task_id:taskId, completed_date:d }])
    }
  }

  async function addTask() {
    if (!newTitle.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const maxIdx = Math.max(-1, ...tasks.map(t => t.order_index))
    const { data } = await supabase.from("daily_tasks")
      .insert({ title:newTitle.trim(), emoji:"✅", color:"#8b5cf6", user_id:user.id, order_index:maxIdx+1 })
      .select().single()
    if (data) setTasks(prev => [...prev, data])
    setNewTitle(""); setSaving(false); setAdding(false)
  }

  async function deleteTask(taskId: string) {
    await supabase.from("daily_task_completions").delete().eq("task_id", taskId)
    await supabase.from("daily_tasks").delete().eq("id", taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  // Titre de la semaine
  const startMonth = weekDates[0].getMonth()
  const endMonth   = weekDates[6].getMonth()
  const year       = weekDates[0].getFullYear()
  const weekTitle  = startMonth === endMonth
    ? `${MONTHS[startMonth]} ${year}`
    : `${MONTHS[startMonth]} – ${MONTHS[endMonth]} ${year}`

  // Score de la semaine
  const totalCells     = tasks.length * 7
  const completedCells = completions.length
  const weekScore      = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Tâches du jour</h1>
          <p className="text-sm text-white/40 mt-0.5">Suivi hebdomadaire de tes habitudes</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/40">
          <Plus className="h-4 w-4"/> Ajouter une tâche
        </button>
      </div>

      {/* Tableau */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.08]"
        style={{ background:"rgba(255,255,255,0.02)" }}>

        {/* Navigation semaine */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <button onClick={() => setWeekOffset(o => o-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <ChevronLeft size={16}/>
          </button>
          <div className="text-center">
            <div className="font-semibold text-white text-sm">{weekTitle}</div>
            <div className="text-[10px] text-white/30 mt-0.5">
              {weekDates[0].getDate()} – {weekDates[6].getDate()} {MONTHS[weekDates[6].getMonth()]}
              {tasks.length > 0 && <span className="ml-2 text-violet-400 font-semibold">{weekScore}% accompli</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)}
                className="text-[10px] px-2.5 py-1 rounded-lg text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all">
                Aujourd'hui
              </button>
            )}
            <button onClick={() => setWeekOffset(o => o+1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>

        {/* En-tête colonnes jours */}
        <div className="grid border-b border-white/[0.06]"
          style={{ gridTemplateColumns:"220px repeat(7, 1fr)" }}>
          <div className="px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wider">
            Tâche
          </div>
          {weekDates.map((date, i) => {
            const today = isToday(date)
            return (
              <div key={i} className={cn("flex flex-col items-center py-3 border-l border-white/[0.04]",
                today && "bg-violet-500/[0.05]")}>
                <span className={cn("text-[10px] font-medium uppercase tracking-wider",
                  today ? "text-violet-400" : "text-white/30")}>
                  {DAYS_SHORT[i]}
                </span>
                <span className={cn("text-sm font-bold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full",
                  today ? "bg-violet-500 text-white" : "text-white/60")}>
                  {date.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        {/* Lignes de tâches */}
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-violet-400"/>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/25">
            <p className="text-sm">Aucune tâche — ajoute-en une !</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task, ti) => (
              <motion.div key={task.id} layout
                initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                exit={{ opacity:0, height:0 }}
                className="grid border-b border-white/[0.04] last:border-b-0 group hover:bg-white/[0.01] transition-colors"
                style={{ gridTemplateColumns:"220px repeat(7, 1fr)" }}>

                {/* Nom de la tâche */}
                <div className="flex items-center gap-2 px-5 py-4">
                  <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ backgroundColor:task.color }}/>
                  <span className="text-sm font-medium text-white/80 flex-1 truncate">{task.title}</span>
                  <button onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-red-400 transition-all flex-shrink-0">
                    <Trash2 size={12}/>
                  </button>
                </div>

                {/* Cases à cocher */}
                {weekDates.map((date, di) => {
                  const done   = isDone(task.id, date)
                  const future = date > new Date() && !isToday(date)
                  return (
                    <div key={di} className={cn("flex items-center justify-center border-l border-white/[0.04] py-4",
                      isToday(date) && "bg-violet-500/[0.03]")}>
                      <button
                        onClick={() => !future && toggleCell(task.id, date)}
                        disabled={future}
                        className={cn(
                          "w-7 h-7 rounded-sm border-2 flex items-center justify-center transition-all",
                          done
                            ? "border-transparent"
                            : "border-white/[0.12] hover:border-white/30",
                          future && "opacity-20 cursor-not-allowed"
                        )}
                        style={done ? { backgroundColor:task.color } : {}}>
                        {done && (
                          <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                            transition={{ type:"spring", stiffness:500, damping:25 }}>
                            <X size={13} className="text-white"/>
                          </motion.div>
                        )}
                      </button>
                    </div>
                  )
                })}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Ligne d'ajout rapide */}
        <div className="px-5 py-3 border-t border-white/[0.05]">
          {adding ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full bg-violet-500/40 flex-shrink-0"/>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Nom de la tâche..."
                className="flex-1 h-8 text-sm bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-lg"
                autoFocus
                onKeyDown={e => { if (e.key==="Enter") addTask(); if (e.key==="Escape") setAdding(false) }}/>
              <button onClick={addTask} disabled={saving || !newTitle.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white disabled:opacity-40"
                style={{ background:"#7c3aed" }}>
                {saving ? <Loader2 size={13} className="animate-spin"/> : <Check size={13}/>}
              </button>
              <button onClick={() => { setAdding(false); setNewTitle("") }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06]">
                <X size={13}/>
              </button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full py-1.5 text-xs text-white/20 hover:text-white/50 transition-colors text-left flex items-center gap-2">
              <Plus size={12}/> Ajouter une tâche
            </button>
          )}
        </div>
      </div>

      {/* Barre progression semaine */}
      {tasks.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/60">Progression de la semaine</span>
            <span className="text-sm font-bold text-violet-400">{weekScore}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background:"linear-gradient(90deg,#7c3aed,#22d3ee)" }}
              initial={{ width:0 }} animate={{ width:`${weekScore}%` }}
              transition={{ duration:0.8, ease:"easeOut" }}/>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-white/25">
            <span>{completedCells} cases cochées sur {totalCells}</span>
            <span>{completedCells} / {totalCells}</span>
          </div>
        </div>
      )}

      {/* SUIVI 30 JOURS */}
      {tasks.length > 0 && <Stats30Days tasks={tasks}/>}
    </div>
  )
}

function Stats30Days({ tasks }: { tasks: DailyTask[] }) {
  const [data, setData] = useState<{date:string;byTask:Record<string,boolean>;pct:number}[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || tasks.length===0) return
      const start = new Date(); start.setDate(start.getDate()-29)
      const startStr = start.toISOString().split("T")[0]
      const todayStr = new Date().toISOString().split("T")[0]
      const { data: completions } = await supabase
        .from("daily_task_completions").select("task_id, completed_date")
        .eq("user_id", user.id).gte("completed_date", startStr).lte("completed_date", todayStr)

      const arr = Array.from({length:30}, (_,i) => {
        const d = new Date(); d.setDate(d.getDate()-29+i)
        const date = d.toISOString().split("T")[0]
        const byTask: Record<string,boolean> = {}
        let done = 0
        for (const task of tasks) {
          const completed = !!(completions??[]).find(c => c.task_id===task.id && c.completed_date===date)
          byTask[task.id] = completed
          if (completed) done++
        }
        const pct = tasks.length>0 ? Math.round((done/tasks.length)*100) : 0
        return { date, byTask, pct }
      })
      setData(arr)
    }
    load()
  }, [tasks.length])

  if (data.length===0) return null

  const avg     = Math.round(data.reduce((a,d)=>a+d.pct,0)/data.length)
  const perfect = data.filter(d=>d.pct===100).length
  const best7   = Math.round(data.slice(-7).reduce((a,d)=>a+d.pct,0)/7)
  const MONTHS_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-400"/>
          <h2 className="font-semibold text-white">Suivi de productivité — 30 jours</h2>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-white/30">Moyenne <span className="text-violet-400 font-bold">{avg}%</span></span>
          <span className="text-white/30">7 jours <span className="text-cyan-400 font-bold">{best7}%</span></span>
          <span className="text-white/30">Jours parfaits <span className="text-green-400 font-bold">{perfect}</span></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* En-tête tâches */}
          <thead>
            <tr>
              <th className="text-left py-2 pr-6 text-[10px] font-medium text-white/30 uppercase tracking-wider">
                Date
              </th>
              {tasks.map(task => (
                <th key={task.id} className="py-2 px-2 text-[10px] font-semibold text-center"
                  style={{ color:task.color, minWidth:80 }}>
                  {task.title}
                </th>
              ))}
              <th className="py-2 px-2 text-[10px] font-medium text-white/30 text-center">Score</th>
            </tr>
            <tr>
              <td colSpan={tasks.length+2} className="pb-2">
                <div className="h-px bg-white/[0.06]"/>
              </td>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const dt = new Date(row.date)
              const isToday2 = row.date === new Date().toISOString().split("T")[0]
              return (
                <tr key={row.date}
                  className={cn("border-t border-white/[0.03]", isToday2 && "bg-violet-500/[0.04]")}>
                  <td className="py-2 pr-6 text-[11px] whitespace-nowrap"
                    style={{ color: isToday2 ? "#a855f7" : "rgba(255,255,255,0.4)" }}>
                    {isToday2 && <span className="mr-1">●</span>}
                    {dt.getDate()} {MONTHS_SHORT[dt.getMonth()]}
                  </td>
                  {tasks.map(task => {
                    const done = row.byTask[task.id]
                    return (
                      <td key={task.id} className="py-2 px-2 text-center">
                        <div className="w-5 h-5 rounded-sm mx-auto flex items-center justify-center"
                          style={{
                            background: done ? `${task.color}25` : "rgba(255,255,255,0.03)",
                            border: `1px solid ${done ? task.color+"60" : "rgba(255,255,255,0.07)"}`,
                          }}>
                          {done && <X size={11} style={{ color:task.color }}/>}
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-2 px-2 text-center">
                    <span className="text-[11px] font-bold tabular-nums"
                      style={{ color: row.pct===100?"#22c55e":row.pct>=50?"#a855f7":"rgba(255,255,255,0.2)" }}>
                      {row.pct}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
