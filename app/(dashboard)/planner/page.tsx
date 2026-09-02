"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, CheckCircle2, Circle, Trash2, Edit3, Clock,
  ChevronLeft, ChevronRight, X, Loader2, Zap, Calendar,
  Flag, Tag, Sparkles, AlarmClock, Repeat,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getTodos, createTodo, updateTodo, deleteTodo,
  getPlannerTasks, createPlannerTask, updatePlannerTask, deletePlannerTask,
  getWeekStart, taskCategories, priorities,
  type Todo, type PlannerTask,
} from "@/lib/db"
import { cn } from "@/lib/utils"

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7)
const CELL_HEIGHT = 56

function getCategoryColor(id: string) {
  return taskCategories.find((c) => c.id === id)?.color ?? "#8b5cf6"
}
function getPriorityColor(id: string) {
  return priorities.find((p) => p.id === id)?.color ?? "#f59e0b"
}
function formatHour(h: number) {
  return `${h}h`
}
function formatWeekRange(weekStart: string, offset: number) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
  if (offset === 0) return `Cette semaine`
  if (offset === -1) return `Semaine dernière`
  if (offset === 1) return `Semaine prochaine`
  return `${fmt(start)} – ${fmt(end)}`
}
function getWeekDates(weekStart: string) {
  const start = new Date(weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}
function isToday(date: Date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// ── Valeurs initiales tâche ───────────────────────────────────────────────────
const DEFAULT_TASK = {
  title: "", category: "work", day: 0, startHour: 9, duration: 1,
  repeat: false, repeatDays: [] as number[],
}

export default function PlannerPage() {
  const [weekOffset, setWeekOffset]   = useState(0)
  const [weekStart, setWeekStart]     = useState(() => getWeekStart(0))
  const [tasks, setTasks]             = useState<PlannerTask[]>([])
  const [todos, setTodos]             = useState<Todo[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [loadingTodos, setLoadingTodos] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [todoFilter, setTodoFilter]   = useState<"all"|"active"|"done">("all")
  const [newTask, setNewTask]         = useState(DEFAULT_TASK)
  const [newTodo, setNewTodo]         = useState({
    title: "", category: "work", priority: "medium" as const,
    due_date: new Date().toISOString().split("T")[0],
  })
  const gridRef = useRef<HTMLDivElement>(null)
  const weekDates = getWeekDates(weekStart)

  useEffect(() => {
    const ws = getWeekStart(weekOffset)
    setWeekStart(ws)
    setLoadingTasks(true)
    getPlannerTasks(ws).then((data) => { setTasks(data); setLoadingTasks(false) })
  }, [weekOffset])

  useEffect(() => {
    getTodos().then((data) => { setTodos(data); setLoadingTodos(false) })
  }, [])

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = CELL_HEIGHT * 1
  }, [])

  // ── Créer une tâche (avec répétition) ─────────────────────────────────────
  const handleAddTask = useCallback(async () => {
    if (!newTask.title.trim()) return
    try {
      // Jours à créer : le jour sélectionné + les jours répétés
      const daysToCreate = newTask.repeat && newTask.repeatDays.length > 0
        ? Array.from(new Set([newTask.day, ...newTask.repeatDays]))
        : [newTask.day]

      const created: PlannerTask[] = []
      for (const day of daysToCreate) {
        const task = await createPlannerTask({
          title:      newTask.title,
          category:   newTask.category,
          day,
          start_hour: newTask.startHour,
          duration:   newTask.duration,
          completed:  false,
          week_start: weekStart,
        })
        if (task) created.push(task)
      }
      setTasks((prev) => [...prev, ...created])
      setNewTask(DEFAULT_TASK)
      setShowAddTask(false)
    } catch (err) {
      console.error("Erreur création tâche:", err)
    }
  }, [newTask, weekStart])

  const handleUpdateTask = useCallback(async () => {
    if (!editingTask) return
    await updatePlannerTask(editingTask.id, editingTask)
    setTasks((prev) => prev.map((t) => t.id === editingTask.id ? editingTask : t))
    setEditingTask(null)
  }, [editingTask])

  const handleToggleTask = useCallback(async (task: PlannerTask) => {
    const updated = { ...task, completed: !task.completed }
    await updatePlannerTask(task.id, { completed: updated.completed })
    setTasks((prev) => prev.map((t) => t.id === task.id ? updated : t))
  }, [])

  const handleDeleteTask = useCallback(async (id: string) => {
    await deletePlannerTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleAddTodo = useCallback(async () => {
    if (!newTodo.title.trim()) return
    const todo = await createTodo({ ...newTodo, completed: false, xp_reward: 25 })
    if (todo) setTodos((prev) => [todo, ...prev])
    setNewTodo({ title: "", category: "work", priority: "medium", due_date: new Date().toISOString().split("T")[0] })
    setShowAddTodo(false)
  }, [newTodo])

  const handleUpdateTodo = useCallback(async () => {
    if (!editingTodo) return
    await updateTodo(editingTodo.id, editingTodo)
    setTodos((prev) => prev.map((t) => t.id === editingTodo.id ? editingTodo : t))
    setEditingTodo(null)
  }, [editingTodo])

  const handleToggleTodo = useCallback(async (todo: Todo) => {
    const updated = { ...todo, completed: !todo.completed }
    await updateTodo(todo.id, { completed: updated.completed })
    setTodos((prev) => prev.map((t) => t.id === todo.id ? updated : t))
  }, [])

  const handleDeleteTodo = useCallback(async (id: string) => {
    await deleteTodo(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const filteredTodos  = todos.filter((t) =>
    todoFilter === "all" ? true : todoFilter === "active" ? !t.completed : t.completed
  )
  const completedCount = todos.filter((t) => t.completed).length
  const progressPct    = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  return (
    <div className="flex flex-col gap-5 h-full relative z-0">

      {/* En-tête */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Planificateur
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Votre semaine, parfaitement organisée</p>
        </div>

        {/* Note planification */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl px-5 py-4 flex items-start gap-4"
          style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.05))", border:"1px solid rgba(139,92,246,0.15)" }}>
          <div className="text-2xl flex-shrink-0">📋</div>
          <div>
            <div className="text-sm font-bold text-white/90 mb-1">💡 Planifie ta journée du lendemain</div>
            <p className="text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.45)" }}>
              Note <span className="text-violet-400 font-semibold">3 à 5 choses</span> à accomplir demain — par exemple : lire 10 pages d'un livre, terminer ce chapitre de physique-chimie. Planifier la veille te donne une longueur d'avance dès le réveil.
            </p>
          </div>
        </motion.div>

        <div className="flex gap-2">
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/40 transition-all">
            <Calendar className="h-4 w-4"/> Ajouter un événement
          </motion.button>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowAddTodo(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-all">
            <Plus className="h-4 w-4"/> Ajouter une tâche
          </motion.button>
        </div>
      </motion.div>

      {/* Navigation semaine */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
        <motion.button whileHover={{ scale:1.1, x:-2 }} whileTap={{ scale:0.9 }}
          onClick={() => setWeekOffset((o) => o-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
          <ChevronLeft className="h-5 w-5"/>
        </motion.button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-white">{formatWeekRange(weekStart, weekOffset)}</span>
          <span className="text-xs text-white/40 mt-0.5">
            {weekDates[0]?.toLocaleDateString("fr-FR",{month:"short",day:"numeric"})} –{" "}
            {weekDates[6]?.toLocaleDateString("fr-FR",{month:"short",day:"numeric",year:"numeric"})}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {weekOffset !== 0 && (
            <motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
              onClick={() => setWeekOffset(0)}
              className="text-xs px-2.5 py-1 rounded-lg text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all">
              Aujourd'hui
            </motion.button>
          )}
          <motion.button whileHover={{ scale:1.1, x:2 }} whileTap={{ scale:0.9 }}
            onClick={() => setWeekOffset((o) => o+1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
            <ChevronRight className="h-5 w-5"/>
          </motion.button>
        </div>
      </motion.div>

      {/* Grille */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <div className="grid border-b border-white/[0.06]" style={{ gridTemplateColumns:"52px repeat(7,1fr)" }}>
          <div className="border-r border-white/[0.06]"/>
          {DAYS_SHORT.map((day,i) => {
            const date = weekDates[i]
            const today = isToday(date)
            return (
              <div key={day} className={cn("flex flex-col items-center py-3 border-r border-white/[0.04] last:border-r-0", today && "bg-violet-500/[0.08]")}>
                <span className={cn("text-[10px] font-medium uppercase tracking-wider", today?"text-violet-400":"text-white/40")}>{day}</span>
                <span className={cn("text-sm font-bold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full",
                  today?"bg-violet-500 text-white shadow-lg shadow-violet-500/40":"text-white/70")}>
                  {date?.getDate()}
                </span>
              </div>
            )
          })}
        </div>
        <div ref={gridRef} className="overflow-y-auto" style={{ maxHeight:"420px" }}>
          {loadingTasks ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400"/>
            </div>
          ) : (
            <div className="relative">
              {HOURS.map((hour) => (
                <div key={hour} className="grid border-b border-white/[0.04] last:border-b-0"
                  style={{ gridTemplateColumns:"52px repeat(7,1fr)", height:`${CELL_HEIGHT}px` }}>
                  <div className="flex items-start justify-end pr-3 pt-1.5 border-r border-white/[0.06]">
                    <span className="text-[10px] font-medium text-white/25 tabular-nums">{formatHour(hour)}</span>
                  </div>
                  {DAYS.map((_,dayIndex) => {
                    const cellTasks = tasks.filter((t) => t.day===dayIndex && Math.floor(t.start_hour)===hour)
                    const today = isToday(weekDates[dayIndex])
                    return (
                      <div key={dayIndex}
                        onClick={() => {
                          setNewTask((p) => ({ ...p, day:dayIndex, startHour:hour }))
                          setShowAddTask(true)
                        }}
                        className={cn("relative border-r border-white/[0.04] last:border-r-0 cursor-pointer group transition-colors",
                          today?"bg-violet-500/[0.04]":"hover:bg-white/[0.02]")}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Plus className="h-3 w-3 text-white/20"/>
                        </div>
                        {cellTasks.map((task) => (
                          <EventCard key={task.id} task={task} cellHeight={CELL_HEIGHT}
                            onEdit={(e) => { e.stopPropagation(); setEditingTask(task) }}
                            onToggle={(e) => { e.stopPropagation(); handleToggleTask(task) }}
                            onDelete={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Liste tâches */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Liste de tâches</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-28 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  initial={{ width:0 }} animate={{ width:`${progressPct}%` }} transition={{ duration:0.8 }}/>
              </div>
              <span className="text-xs text-white/40">{completedCount}/{todos.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
              {(["all","active","done"] as const).map((f) => (
                <button key={f} onClick={() => setTodoFilter(f)}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                    todoFilter===f?"bg-white/[0.12] text-white":"text-white/40 hover:text-white/70")}>
                  {f==="all"?"Tous":f==="active"?"Actifs":"Terminés"}
                </button>
              ))}
            </div>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => setShowAddTodo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-md shadow-cyan-900/30 transition-all">
              <Plus className="h-3.5 w-3.5"/> Ajouter
            </motion.button>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {loadingTodos ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-violet-400"/>
            </div>
          ) : filteredTodos.length===0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-white/30 text-sm gap-2">
              <Sparkles className="h-6 w-6 opacity-40"/>
              <p className="text-xs">{todoFilter==="done"?"Aucune tâche terminée":"Aucune tâche — ajoutez-en une !"}</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredTodos.map((todo) => (
                <TodoRow key={todo.id} todo={todo}
                  onToggle={() => handleToggleTodo(todo)}
                  onEdit={() => setEditingTodo(todo)}
                  onDelete={() => handleDeleteTodo(todo.id)}/>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showAddTask && (
          <Modal title="Nouvel événement" icon={<Calendar className="h-4 w-4 text-violet-400"/>} onClose={() => { setShowAddTask(false); setNewTask(DEFAULT_TASK) }}>
            <TaskForm values={newTask} onChange={setNewTask} onSubmit={handleAddTask} onCancel={() => { setShowAddTask(false); setNewTask(DEFAULT_TASK) }} label="Créer l'événement"/>
          </Modal>
        )}
        {editingTask && (
          <Modal title="Modifier l'événement" icon={<Edit3 className="h-4 w-4 text-violet-400"/>} onClose={() => setEditingTask(null)}>
            <TaskForm values={{ ...editingTask, startHour:editingTask.start_hour, repeat:false, repeatDays:[] }}
              onChange={(v) => setEditingTask({ ...editingTask, title:v.title, category:v.category, day:v.day, start_hour:v.startHour, duration:v.duration })}
              onSubmit={handleUpdateTask} onCancel={() => setEditingTask(null)} label="Enregistrer"/>
          </Modal>
        )}
        {showAddTodo && (
          <Modal title="Nouvelle tâche" icon={<CheckCircle2 className="h-4 w-4 text-cyan-400"/>} onClose={() => setShowAddTodo(false)}>
            <TodoForm values={newTodo} onChange={setNewTodo} onSubmit={handleAddTodo} onCancel={() => setShowAddTodo(false)} label="Créer la tâche"/>
          </Modal>
        )}
        {editingTodo && (
          <Modal title="Modifier la tâche" icon={<Edit3 className="h-4 w-4 text-cyan-400"/>} onClose={() => setEditingTodo(null)}>
            <TodoForm values={editingTodo} onChange={(v) => setEditingTodo({ ...editingTodo, ...v })} onSubmit={handleUpdateTodo} onCancel={() => setEditingTodo(null)} label="Enregistrer"/>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── EventCard ─────────────────────────────────────────────────────────────────
function EventCard({ task, onEdit, onToggle, onDelete, cellHeight }: {
  task: PlannerTask; onEdit:(e:React.MouseEvent)=>void; onToggle:(e:React.MouseEvent)=>void; onDelete:(e:React.MouseEvent)=>void; cellHeight:number
}) {
  const color = getCategoryColor(task.category)
  return (
    <motion.div layout initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.88 }}
      whileHover={{ scale:1.02, zIndex:10 }} onClick={onEdit}
      className="absolute inset-x-0.5 top-0.5 rounded-lg overflow-hidden cursor-pointer group z-10"
      style={{ minHeight:`${Math.max(task.duration*cellHeight-4,24)}px`, backgroundColor:color+"1a", borderLeft:`3px solid ${color}`, boxShadow:`0 2px 12px ${color}20` }}>
      <div className="px-2 py-1.5 h-full flex flex-col justify-between">
        <p className={cn("text-[10px] font-semibold leading-tight line-clamp-2 text-white/90", task.completed && "line-through opacity-40")}>
          {task.title}
        </p>
        {task.duration >= 1.5 && (
          <div className="flex items-center gap-0.5 mt-1">
            <AlarmClock className="h-2.5 w-2.5 opacity-40" style={{ color }}/>
            <span className="text-[9px] opacity-40" style={{ color }}>{formatHour(task.start_hour)} · {task.duration}h</span>
          </div>
        )}
      </div>
      <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
        <button onClick={onToggle} className="w-4 h-4 flex items-center justify-center rounded text-[9px] text-white/60 hover:text-green-400 hover:bg-white/10 transition-all">✓</button>
        <button onClick={onDelete} className="w-4 h-4 flex items-center justify-center rounded text-[9px] text-white/60 hover:text-red-400 hover:bg-white/10 transition-all">✕</button>
      </div>
    </motion.div>
  )
}

// ── TodoRow ───────────────────────────────────────────────────────────────────
function TodoRow({ todo, onToggle, onEdit, onDelete }: { todo:Todo; onToggle:()=>void; onEdit:()=>void; onDelete:()=>void }) {
  const catColor = getCategoryColor(todo.category)
  const priColor = getPriorityColor(todo.priority)
  return (
    <motion.div layout initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}
      className={cn("flex items-center gap-3 px-5 py-3.5 group transition-colors hover:bg-white/[0.02]", todo.completed && "opacity-50")}>
      <button onClick={onToggle} className="flex-shrink-0 transition-transform hover:scale-110">
        {todo.completed
          ? <CheckCircle2 className="text-green-400" style={{ width:18, height:18 }}/>
          : <Circle className="text-white/25 hover:text-white/50" style={{ width:18, height:18 }}/>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium text-white/90 truncate", todo.completed && "line-through text-white/40")}>{todo.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-medium"
            style={{ backgroundColor:catColor+"22", color:catColor }}>
            <Tag className="h-2.5 w-2.5"/>{todo.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color:priColor }}>
            <Flag className="h-2.5 w-2.5"/>{todo.priority}
          </span>
          {todo.due_date && (
            <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
              <Clock className="h-2.5 w-2.5"/>
              {new Date(todo.due_date).toLocaleDateString("fr-FR",{month:"short",day:"numeric"})}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-yellow-400/80 flex items-center gap-0.5 font-medium">
          <Zap className="h-3 w-3"/>+{todo.xp_reward}
        </span>
        <button onClick={onEdit} className="w-6 h-6 flex items-center justify-center rounded-lg text-white/30 hover:text-white/80 hover:bg-white/[0.08] transition-all">
          <Edit3 className="h-3.5 w-3.5"/>
        </button>
        <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <Trash2 className="h-3.5 w-3.5"/>
        </button>
      </div>
    </motion.div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, icon, children, onClose }: { title:string; icon?:React.ReactNode; children:React.ReactNode; onClose:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
      onClick={(e) => { if (e.target===e.currentTarget) onClose() }}>
      <motion.div initial={{ scale:0.94, y:16, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }}
        exit={{ scale:0.94, y:8, opacity:0 }} transition={{ type:"spring", stiffness:400, damping:30 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden"
        style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))", backdropFilter:"blur(24px)", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">{icon}<h3 className="text-sm font-semibold text-white">{title}</h3></div>
          <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }} onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors">
            <X className="h-4 w-4"/>
          </motion.button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

// ── TaskForm avec option RÉPÉTER ──────────────────────────────────────────────
type TaskFormValues = {
  title: string; category: string; day: number
  startHour: number; duration: number
  repeat: boolean; repeatDays: number[]
}

function TaskForm({ values, onChange, onSubmit, onCancel, label }: {
  values: TaskFormValues; onChange:(v:TaskFormValues)=>void
  onSubmit:()=>void; onCancel:()=>void; label:string
}) {
  const toggleRepeatDay = (d: number) => {
    const days = values.repeatDays.includes(d)
      ? values.repeatDays.filter(x => x !== d)
      : [...values.repeatDays, d]
    onChange({ ...values, repeatDays: days })
  }

  // Jours qui seront créés
  const activeDays = values.repeat && values.repeatDays.length > 0
    ? Array.from(new Set([values.day, ...values.repeatDays])).sort()
    : [values.day]

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Titre de l'événement</label>
        <Input value={values.title} onChange={e => onChange({ ...values, title:e.target.value })}
          placeholder="Que se passe-t-il ?" autoFocus onKeyDown={e => e.key==="Enter" && onSubmit()}
          className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"/>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Jour principal</label>
          <select value={String(values.day)} onChange={e => onChange({ ...values, day:+e.target.value })}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 appearance-none">
            {DAYS.map((d,i) => <option key={i} value={i} className="bg-zinc-900">{d}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Catégorie</label>
          <select value={values.category} onChange={e => onChange({ ...values, category:e.target.value })}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 appearance-none">
            {taskCategories.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Heure de début</label>
          <Input type="number" min={7} max={21} value={values.startHour}
            onChange={e => onChange({ ...values, startHour:+e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"/>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Durée (heures)</label>
          <Input type="number" min={0.5} max={8} step={0.5} value={values.duration}
            onChange={e => onChange({ ...values, duration:+e.target.value })}
            className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"/>
        </div>
      </div>

      {/* ── OPTION RÉPÉTER ── */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background:"rgba(139,92,246,0.05)", border:"1px solid rgba(139,92,246,0.15)" }}>
        <button onClick={() => onChange({ ...values, repeat:!values.repeat, repeatDays:[] })}
          className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Repeat size={14} className="text-violet-400"/>
            <span className="text-sm font-semibold text-white">Répéter sur d'autres jours</span>
          </div>
          {/* Toggle switch */}
          <div className={cn("w-10 h-5 rounded-full transition-all relative flex-shrink-0",
            values.repeat ? "bg-violet-500" : "bg-white/[0.12]")}>
            <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: values.repeat ? "22px" : "2px" }} transition={{ type:"spring", stiffness:500, damping:30 }}/>
          </div>
        </button>

        <AnimatePresence>
          {values.repeat && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}>
              <p className="text-xs text-white/40 mb-2">Sélectionne les jours supplémentaires :</p>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS_SHORT.map((d,i) => {
                  const isMain     = i === values.day
                  const isSelected = values.repeatDays.includes(i)
                  return (
                    <button key={i} onClick={() => !isMain && toggleRepeatDay(i)} disabled={isMain}
                      className={cn("w-9 h-9 rounded-xl text-xs font-bold transition-all",
                        isMain ? "cursor-not-allowed opacity-60" : "hover:scale-105")}
                      style={isMain ? {
                        background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff"
                      } : isSelected ? {
                        background:"rgba(139,92,246,0.3)", color:"#c4b5fd", border:"1px solid rgba(139,92,246,0.5)"
                      } : {
                        background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)"
                      }}>
                      {d}
                    </button>
                  )
                })}
              </div>

              {/* Récap */}
              {activeDays.length > 1 && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="mt-3 rounded-lg px-3 py-2 text-xs"
                  style={{ background:"rgba(139,92,246,0.08)", color:"rgba(167,139,250,0.8)" }}>
                  ✓ Créé sur : {activeDays.map(d => DAYS_SHORT[d]).join(", ")}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-2">
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={onSubmit}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/40 transition-all">
          {label}{values.repeat && values.repeatDays.length > 0 ? ` (${activeDays.length} jours)` : ""}
        </motion.button>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80 transition-all">
          Annuler
        </motion.button>
      </div>
    </div>
  )
}

// ── TodoForm ──────────────────────────────────────────────────────────────────
function TodoForm({ values, onChange, onSubmit, onCancel, label }: {
  values:{ title:string; category:string; priority:string; due_date:string }
  onChange:(v:typeof values)=>void; onSubmit:()=>void; onCancel:()=>void; label:string
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Titre de la tâche</label>
        <Input value={values.title} onChange={e => onChange({ ...values, title:e.target.value })}
          placeholder="Qu'est-ce qui doit être fait ?" autoFocus onKeyDown={e => e.key==="Enter" && onSubmit()}
          className="bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/50 rounded-xl"/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Catégorie</label>
          <select value={values.category} onChange={e => onChange({ ...values, category:e.target.value })}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none">
            {taskCategories.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Priorité</label>
          <select value={values.priority} onChange={e => onChange({ ...values, priority:e.target.value })}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none">
            {priorities.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Date d'échéance</label>
        <Input type="date" value={values.due_date} onChange={e => onChange({ ...values, due_date:e.target.value })}
          className="bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/50 rounded-xl"/>
      </div>
      <div className="flex gap-3 pt-2">
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={onSubmit}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-900/40 transition-all">
          {label}
        </motion.button>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80 transition-all">
          Annuler
        </motion.button>
      </div>
    </div>
  )
}
