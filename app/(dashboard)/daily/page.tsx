"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, Loader2, ChevronLeft, ChevronRight, Trash2, TrendingUp } from "lucide-react"
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
const MONTHS_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
const DAYS_SHORT = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]

function getWeekDates(weekOffset: number) {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d
  })
}

function dateStr(d: Date) { return d.toISOString().split("T")[0] }
function isToday(d: Date) { return dateStr(d) === dateStr(new Date()) }

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
  const supabase  = createClient()

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
    return completions.some(c => c.task_id===taskId && c.completed_date===dateStr(date))
  }

  async function toggleCell(taskId: string, date: Date) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const d    = dateStr(date)
    const done = isDone(taskId, date)
    if (done) {
      await supabase.from("daily_task_completions").delete().eq("task_id", taskId).eq("completed_date", d)
      setCompletions(prev => prev.filter(c => !(c.task_id===taskId && c.completed_date===d)))
    } else {
      await supabase.from("daily_task_completions").upsert({ task_id:taskId, user_id:user.id, completed_date:d })
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
    setTasks(prev => prev.filter(t => t.id!==taskId))
  }

  const startMonth = weekDates[0].getMonth()
  const endMonth   = weekDates[6].getMonth()
  const year       = weekDates[0].getFullYear()
  const weekTitle  = startMonth===endMonth
    ? `${MONTHS[startMonth]} ${year}`
    : `${MONTHS[startMonth]} – ${MONTHS[endMonth]} ${year}`

  const completedCells = completions.length
  const totalCells     = tasks.length * 7
  const weekScore      = totalCells>0 ? Math.round((completedCells/totalCells)*100) : 0

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
          <Plus className="h-4 w-4"/> Ajouter
        </button>
      </div>

      {/* ── TABLEAU PRINCIPAL ── */}
      <div className="rounded-xl overflow-hidden"
        style={{ border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.015)" }}>

        {/* Barre navigation */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor:"rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
          <button onClick={() => setWeekOffset(o => o-1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
            <ChevronLeft size={14}/>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/70">{weekTitle}</span>
            {tasks.length>0 && (
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold"
                style={{ background:"rgba(139,92,246,0.12)", color:"#a855f7", border:"1px solid rgba(139,92,246,0.2)" }}>
                {weekScore}%
              </span>
            )}
            {weekOffset!==0 && (
              <button onClick={() => setWeekOffset(0)}
                className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors">
                Aujourd'hui
              </button>
            )}
          </div>
          <button onClick={() => setWeekOffset(o => o+1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
            <ChevronRight size={14}/>
          </button>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          {/* En-têtes jours */}
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <th className="text-left px-4 py-3 w-52">
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Tâche</span>
              </th>
              {weekDates.map((date, i) => {
                const today = isToday(date)
                return (
                  <th key={i} className="py-3 text-center" style={{ width:72 }}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: today ? "#a855f7" : "rgba(255,255,255,0.25)" }}>
                        {DAYS_SHORT[i]}
                      </span>
                      <span className="text-sm font-bold flex items-center justify-center w-7 h-7 rounded-lg"
                        style={{
                          background: today ? "rgba(139,92,246,0.2)" : "transparent",
                          color: today ? "#a855f7" : "rgba(255,255,255,0.5)",
                          border: today ? "1px solid rgba(139,92,246,0.3)" : "none",
                        }}>
                        {date.getDate()}
                      </span>
                    </div>
                  </th>
                )
              })}
              <th className="text-center px-3 py-3" style={{ width:60 }}>
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">%</span>
              </th>
            </tr>
          </thead>

          {/* Lignes tâches */}
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="py-12 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-violet-400 mx-auto"/>
              </td></tr>
            ) : tasks.length===0 ? (
              <tr><td colSpan={10} className="py-12 text-center text-white/20 text-sm">
                Ajoute ta première tâche quotidienne
              </td></tr>
            ) : (
              tasks.map((task, ti) => {
                const taskDone  = weekDates.filter(d => isDone(task.id, d)).length
                const taskScore = Math.round((taskDone/7)*100)
                return (
                  <tr key={task.id}
                    style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}
                    className="group hover:bg-white/[0.015] transition-colors">

                    {/* Nom tâche */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor:task.color }}/>
                        <span className="text-sm text-white/75 truncate max-w-[160px]">{task.title}</span>
                        <button onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 ml-auto w-5 h-5 flex items-center justify-center rounded text-white/15 hover:text-red-400 transition-all flex-shrink-0">
                          <Trash2 size={11}/>
                        </button>
                      </div>
                    </td>

                    {/* Cases */}
                    {weekDates.map((date, di) => {
                      const done   = isDone(task.id, date)
                      const future = date > new Date() && !isToday(date)
                      const today  = isToday(date)
                      return (
                        <td key={di} className="py-3 text-center"
                          style={{ background: today ? "rgba(139,92,246,0.03)" : "transparent" }}>
                          <button
                            onClick={() => !future && toggleCell(task.id, date)}
                            disabled={future}
                            className="w-6 h-6 rounded-sm mx-auto flex items-center justify-center transition-all"
                            style={{
                              background: done ? `${task.color}18` : "rgba(255,255,255,0.03)",
                              border:     done ? `1px solid ${task.color}50` : "1px solid rgba(255,255,255,0.08)",
                              opacity:    future ? 0.2 : 1,
                              cursor:     future ? "not-allowed" : "pointer",
                            }}>
                            {done && (
                              <X size={11} style={{ color:task.color }} strokeWidth={2.5}/>
                            )}
                          </button>
                        </td>
                      )
                    })}

                    {/* Score ligne */}
                    <td className="py-3 text-center px-3">
                      <span className="text-xs font-semibold tabular-nums"
                        style={{
                          color: taskScore===100 ? "#22c55e"
                               : taskScore>=50  ? "#a855f7"
                               : taskScore>0    ? "rgba(255,255,255,0.3)"
                               : "rgba(255,255,255,0.12)"
                        }}>
                        {taskScore}%
                      </span>
                    </td>
                  </tr>
                )
              })
            )}

            {/* Ligne d'ajout */}
            {!loading && (
              <tr style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <td colSpan={10} className="px-4 py-2">
                  {adding ? (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 rounded-full bg-violet-500/30 flex-shrink-0"/>
                      <Input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        placeholder="Nom de la tâche…"
                        className="flex-1 h-7 text-sm bg-transparent border-0 border-b border-violet-500/40 rounded-none px-0 focus:ring-0 focus:border-violet-500 text-white/80 placeholder:text-white/20"
                        autoFocus
                        onKeyDown={e => { if (e.key==="Enter") addTask(); if (e.key==="Escape") { setAdding(false); setNewTitle("") } }}/>
                      <button onClick={addTask} disabled={saving || !newTitle.trim()}
                        className="text-[10px] px-3 py-1 rounded-lg font-semibold text-white disabled:opacity-30 transition-all"
                        style={{ background:"rgba(124,58,237,0.4)", border:"1px solid rgba(124,58,237,0.4)" }}>
                        {saving ? "…" : "Ajouter"}
                      </button>
                      <button onClick={() => { setAdding(false); setNewTitle("") }}
                        className="text-white/20 hover:text-white/50 transition-colors">
                        <X size={13}/>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setAdding(true)}
                      className="flex items-center gap-2 text-xs text-white/15 hover:text-white/40 transition-colors">
                      <Plus size={12}/> Nouvelle tâche
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>

          {/* Ligne total semaine */}
          {tasks.length>0 && !loading && (
            <tfoot>
              <tr style={{ borderTop:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.01)" }}>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Total</span>
                </td>
                {weekDates.map((date, di) => {
                  const dayDone  = tasks.filter(t => isDone(t.id, date)).length
                  const dayTotal = tasks.length
                  const dayPct   = Math.round((dayDone/dayTotal)*100)
                  const today    = isToday(date)
                  return (
                    <td key={di} className="py-2.5 text-center"
                      style={{ background: today ? "rgba(139,92,246,0.03)" : "transparent" }}>
                      <span className="text-[11px] font-bold tabular-nums"
                        style={{
                          color: dayPct===100 ? "#22c55e"
                               : dayPct>=50  ? "#a855f7"
                               : dayPct>0    ? "rgba(255,255,255,0.35)"
                               : "rgba(255,255,255,0.1)"
                        }}>
                        {dayDone}/{dayTotal}
                      </span>
                    </td>
                  )
                })}
                <td className="py-2.5 text-center px-3">
                  <span className="text-[11px] font-bold tabular-nums"
                    style={{ color: weekScore===100?"#22c55e":weekScore>=50?"#a855f7":"rgba(255,255,255,0.3)" }}>
                    {weekScore}%
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── SUIVI 30 JOURS ── */}
      {tasks.length>0 && <Stats30Days tasks={tasks}/>}
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

  const avg     = Math.round(data.reduce((a,d) => a+d.pct, 0)/data.length)
  const perfect = data.filter(d => d.pct===100).length
  const best7   = Math.round(data.slice(-7).reduce((a,d) => a+d.pct, 0)/7)

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.015)" }}>

      {/* En-tête */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor:"rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-violet-400"/>
          <span className="text-sm font-medium text-white/70">Productivité — 30 derniers jours</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span style={{ color:"rgba(255,255,255,0.3)" }}>
            Moyenne <span className="font-bold text-violet-400">{avg}%</span>
          </span>
          <span style={{ color:"rgba(255,255,255,0.3)" }}>
            7 jours <span className="font-bold text-cyan-400">{best7}%</span>
          </span>
          <span style={{ color:"rgba(255,255,255,0.3)" }}>
            Parfaits <span className="font-bold text-green-400">{perfect}j</span>
          </span>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <th className="text-left px-4 py-2.5 w-24">
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Date</span>
              </th>
              {tasks.map(task => (
                <th key={task.id} className="py-2.5 px-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor:task.color }}/>
                    <span className="text-[10px] font-medium whitespace-nowrap" style={{ color:task.color }}>
                      {task.title}
                    </span>
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-4 text-center w-16">
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Score</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const dt       = new Date(row.date)
              const isToday2 = row.date===new Date().toISOString().split("T")[0]
              const dayName  = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][dt.getDay()]
              return (
                <tr key={row.date}
                  style={{ borderTop:"1px solid rgba(255,255,255,0.03)",
                    background: isToday2 ? "rgba(139,92,246,0.04)" : i%2===0 ? "transparent" : "rgba(255,255,255,0.005)" }}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      {isToday2 && <span className="text-[8px] text-violet-400">●</span>}
                      <span className="text-[11px] tabular-nums whitespace-nowrap"
                        style={{ color: isToday2 ? "#a855f7" : "rgba(255,255,255,0.4)" }}>
                        <span className="text-white/20 mr-1">{dayName}</span>
                        {dt.getDate()} {["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][dt.getMonth()]}
                      </span>
                    </div>
                  </td>
                  {tasks.map(task => {
                    const done = row.byTask[task.id]
                    return (
                      <td key={task.id} className="py-2 px-3 text-center">
                        <div className="w-5 h-5 rounded-sm mx-auto flex items-center justify-center"
                          style={{
                            background: done ? `${task.color}15` : "rgba(255,255,255,0.02)",
                            border:     done ? `1px solid ${task.color}40` : "1px solid rgba(255,255,255,0.06)",
                          }}>
                          {done && <X size={10} style={{ color:task.color }} strokeWidth={2.5}/>}
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-2 px-4 text-center">
                    <span className="text-[11px] font-semibold tabular-nums"
                      style={{
                        color: row.pct===100 ? "#22c55e"
                             : row.pct>=75   ? "#4ade80"
                             : row.pct>=50   ? "#a855f7"
                             : row.pct>0     ? "rgba(255,255,255,0.25)"
                             : "rgba(255,255,255,0.1)"
                      }}>
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
