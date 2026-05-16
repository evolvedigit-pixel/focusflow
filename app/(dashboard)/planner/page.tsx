"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus, CheckCircle2, Circle, Trash2, Edit3, Clock,
  ChevronLeft, ChevronRight, X, Loader2, Zap,
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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7AM–8PM

function getCategoryColor(id: string) {
  return taskCategories.find((c) => c.id === id)?.color ?? "#8b5cf6"
}

function getPriorityColor(id: string) {
  return priorities.find((p) => p.id === id)?.color ?? "#f59e0b"
}

function formatWeekRange(weekStart: string, offset: number) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (offset === 0) return `This Week · ${fmt(start)} – ${fmt(end)}`
  if (offset === -1) return `Last Week · ${fmt(start)} – ${fmt(end)}`
  if (offset === 1) return `Next Week · ${fmt(start)} – ${fmt(end)}`
  return `${fmt(start)} – ${fmt(end)}`
}

export default function PlannerPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekStart, setWeekStart] = useState(() => getWeekStart(0))
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [loadingTodos, setLoadingTodos] = useState(true)

  // Modals
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const [newTask, setNewTask] = useState({ title: "", category: "work", day: 0, startHour: 9, duration: 1 })
  const [newTodo, setNewTodo] = useState({ title: "", category: "work", priority: "medium" as const, due_date: new Date().toISOString().split("T")[0] })

  // Load tasks when week changes
  useEffect(() => {
    const ws = getWeekStart(weekOffset)
    setWeekStart(ws)
    setLoadingTasks(true)
    getPlannerTasks(ws).then((data) => { setTasks(data); setLoadingTasks(false) })
  }, [weekOffset])

  // Load todos once
  useEffect(() => {
    getTodos().then((data) => { setTodos(data); setLoadingTodos(false) })
  }, [])

  // ─── Planner Task Actions ────────────────────────────────
  const handleAddTask = useCallback(async () => {
    if (!newTask.title.trim()) return
    const task = await createPlannerTask({ ...newTask, completed: false, week_start: weekStart })
    if (task) setTasks((prev) => [...prev, task])
    setNewTask({ title: "", category: "work", day: 0, startHour: 9, duration: 1 })
    setShowAddTask(false)
  }, [newTask, weekStart])

  const handleUpdateTask = useCallback(async () => {
    if (!editingTask) return
    await updatePlannerTask(editingTask.id, editingTask)
    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? editingTask : t)))
    setEditingTask(null)
  }, [editingTask])

  const handleToggleTask = useCallback(async (task: PlannerTask) => {
    const updated = { ...task, completed: !task.completed }
    await updatePlannerTask(task.id, { completed: updated.completed })
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  }, [])

  const handleDeleteTask = useCallback(async (id: string) => {
    await deletePlannerTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ─── Todo Actions ─────────────────────────────────────────
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
    setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? editingTodo : t)))
    setEditingTodo(null)
  }, [editingTodo])

  const handleToggleTodo = useCallback(async (todo: Todo) => {
    const updated = { ...todo, completed: !todo.completed }
    await updateTodo(todo.id, { completed: updated.completed })
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)))
  }, [])

  const handleDeleteTodo = useCallback(async (id: string) => {
    await deleteTodo(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const completedTodos = todos.filter((t) => t.completed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Planner</h1>
            <p className="text-muted-foreground mt-1">Weekly schedule & todo list</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddTask(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
            <Button
              onClick={() => setShowAddTodo(true)}
              variant="outline"
              className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Week Navigation */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium text-sm sm:text-base">{formatWeekRange(weekStart, weekOffset)}</span>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>

      {/* Weekly Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-4 overflow-x-auto">
          {loadingTasks ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-2">
                <div />
                {days.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Time rows */}
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-1">
                  <div className="text-xs text-muted-foreground pt-1 text-right pr-3">
                    {hour === 12 ? "12pm" : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
                  </div>
                  {days.map((_, dayIndex) => {
                    const cellTasks = tasks.filter(
                      (t) => t.day === dayIndex && Math.floor(t.start_hour) === hour
                    )
                    return (
                      <div
                        key={dayIndex}
                        className="min-h-[36px] rounded-lg border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative"
                      >
                        {cellTasks.map((task) => (
                          <div
                            key={task.id}
                            className="absolute inset-x-0 top-0 rounded-lg px-1.5 py-1 cursor-pointer group"
                            style={{
                              backgroundColor: getCategoryColor(task.category) + "33",
                              borderLeft: `3px solid ${getCategoryColor(task.category)}`,
                              minHeight: `${task.duration * 36}px`,
                            }}
                            onClick={() => setEditingTask(task)}
                          >
                            <p className={cn("text-[10px] font-medium leading-tight line-clamp-2", task.completed && "line-through opacity-50")}>
                              {task.title}
                            </p>
                            <div className="hidden group-hover:flex gap-1 mt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleTask(task) }}
                                className="text-[10px] opacity-70 hover:opacity-100"
                              >
                                {task.completed ? "↩" : "✓"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }}
                                className="text-[10px] text-red-400 opacity-70 hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Todo List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Todo List</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedTodos} / {todos.length} completed
              </p>
            </div>
            <Button
              onClick={() => setShowAddTodo(true)}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0 hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {loadingTodos ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground text-sm gap-2">
              <CheckCircle2 className="h-8 w-8 opacity-20" />
              <p>No tasks yet. Add one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                    "bg-white/[0.03] hover:bg-white/[0.05]",
                    todo.completed && "opacity-60"
                  )}
                >
                  <button onClick={() => handleToggleTodo(todo)} className="flex-shrink-0">
                    {todo.completed
                      ? <CheckCircle2 className="h-5 w-5 text-green-400" />
                      : <Circle className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium text-sm truncate", todo.completed && "line-through")}>
                      {todo.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: getCategoryColor(todo.category) + "33", color: getCategoryColor(todo.category) }}>
                        {todo.category}
                      </span>
                      <span className="text-xs" style={{ color: getPriorityColor(todo.priority) }}>
                        {todo.priority}
                      </span>
                      {todo.due_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(todo.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                      <Zap className="h-3 w-3" />+{todo.xp_reward}
                    </span>
                    <button onClick={() => setEditingTodo(todo)} className="text-muted-foreground hover:text-white transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteTodo(todo.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ─── Add Task Modal ─── */}
      <AnimatePresence>
        {showAddTask && (
          <Modal title="Add Event" onClose={() => setShowAddTask(false)}>
            <TaskForm
              values={newTask}
              onChange={setNewTask}
              onSubmit={handleAddTask}
              onCancel={() => setShowAddTask(false)}
              label="Add Event"
            />
          </Modal>
        )}

        {editingTask && (
          <Modal title="Edit Event" onClose={() => setEditingTask(null)}>
            <TaskForm
              values={editingTask}
              onChange={(v) => setEditingTask({ ...editingTask, ...v })}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
              label="Save"
            />
          </Modal>
        )}

        {showAddTodo && (
          <Modal title="Add Task" onClose={() => setShowAddTodo(false)}>
            <TodoForm
              values={newTodo}
              onChange={setNewTodo}
              onSubmit={handleAddTodo}
              onCancel={() => setShowAddTodo(false)}
              label="Add Task"
            />
          </Modal>
        )}

        {editingTodo && (
          <Modal title="Edit Task" onClose={() => setEditingTodo(null)}>
            <TodoForm
              values={editingTodo}
              onChange={(v) => setEditingTodo({ ...editingTodo, ...v })}
              onSubmit={handleUpdateTodo}
              onCancel={() => setEditingTodo(null)}
              label="Save"
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

function TaskForm({
  values, onChange, onSubmit, onCancel, label,
}: {
  values: { title: string; category: string; day: number; startHour: number; duration: number }
  onChange: (v: typeof values) => void
  onSubmit: () => void
  onCancel: () => void
  label: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Title</label>
        <Input
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          placeholder="Event title"
          className="bg-white/[0.03] border-white/[0.1]"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Day</label>
          <select
            value={values.day}
            onChange={(e) => onChange({ ...values, day: +e.target.value })}
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, i) => (
              <option key={d} value={i} className="bg-zinc-900">{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Category</label>
          <select
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            {taskCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Start (hour)</label>
          <Input
            type="number"
            min={7} max={20}
            value={values.startHour}
            onChange={(e) => onChange({ ...values, startHour: +e.target.value })}
            className="bg-white/[0.03] border-white/[0.1]"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Duration (h)</label>
          <Input
            type="number"
            min={0.5} max={8} step={0.5}
            value={values.duration}
            onChange={(e) => onChange({ ...values, duration: +e.target.value })}
            className="bg-white/[0.03] border-white/[0.1]"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={onSubmit} className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90">
          {label}
        </Button>
        <Button variant="outline" onClick={onCancel} className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
          Cancel
        </Button>
      </div>
    </div>
  )
}

function TodoForm({
  values, onChange, onSubmit, onCancel, label,
}: {
  values: { title: string; category: string; priority: string; due_date: string }
  onChange: (v: typeof values) => void
  onSubmit: () => void
  onCancel: () => void
  label: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Task</label>
        <Input
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          placeholder="What needs to be done?"
          className="bg-white/[0.03] border-white/[0.1]"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Category</label>
          <select
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            {taskCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
          <select
            value={values.priority}
            onChange={(e) => onChange({ ...values, priority: e.target.value })}
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.1] px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            {priorities.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Due Date</label>
        <Input
          type="date"
          value={values.due_date}
          onChange={(e) => onChange({ ...values, due_date: e.target.value })}
          className="bg-white/[0.03] border-white/[0.1]"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={onSubmit} className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90">
          {label}
        </Button>
        <Button variant="outline" onClick={onCancel} className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
          Cancel
        </Button>
      </div>
    </div>
  )
}
