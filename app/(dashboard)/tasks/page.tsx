"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, CheckCircle2, Circle, Trash2, Edit3, Clock,
  X, Loader2, Zap, Flag, Tag, Sparkles, Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  getTodos, createTodo, updateTodo, deleteTodo,
  taskCategories, priorities, type Todo,
} from "@/lib/db"
import { cn } from "@/lib/utils"

const TASK_SUGGESTIONS = [
  { title:"Réviser les cours du jour", category:"study",    priority:"high"   as const, emoji:"📚" },
  { title:"Faire 30 min de sport",     category:"fitness",  priority:"medium" as const, emoji:"🏃" },
  { title:"Lire 10 pages d'un livre",  category:"personal", priority:"low"    as const, emoji:"📖" },
  { title:"Méditer 10 minutes",        category:"personal", priority:"low"    as const, emoji:"🧘" },
  { title:"Boire 2L d'eau",           category:"personal", priority:"medium" as const, emoji:"💧" },
  { title:"Préparer le cours de demain", category:"study", priority:"high"   as const, emoji:"✏️" },
]

function getCategoryColor(id: string) {
  return taskCategories.find(c => c.id===id)?.color ?? "#8b5cf6"
}
function getPriorityColor(id: string) {
  return priorities.find(p => p.id===id)?.color ?? "#f59e0b"
}

export default function TasksPage() {
  const [todos, setTodos]           = useState<Todo[]>([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo|null>(null)
  const [search, setSearch]         = useState("")
  const [filterStatus, setFilterStatus]     = useState<"tous"|"actifs"|"termines">("tous")
  const [filterPriority, setFilterPriority] = useState<string>("tous")
  const [filterCategory, setFilterCategory] = useState<string>("tous")
  const [newTodo, setNewTodo]       = useState({
    title:"", category:"work", priority:"medium" as const,
    due_date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    getTodos().then(data => { setTodos(data); setLoading(false) })
  }, [])

  const handleAdd = useCallback(async (override?: Partial<typeof newTodo>) => {
    const payload = { ...newTodo, ...override }
    if (!payload.title.trim()) return
    const todo = await createTodo({ ...payload, completed:false, xp_reward:25 })
    if (todo) setTodos(prev => [todo,...prev])
    setNewTodo({ title:"", category:"work", priority:"medium", due_date:new Date().toISOString().split("T")[0] })
    setShowAdd(false)
  }, [newTodo])

  const handleUpdate = useCallback(async () => {
    if (!editingTodo) return
    await updateTodo(editingTodo.id, editingTodo)
    setTodos(prev => prev.map(t => t.id===editingTodo.id ? editingTodo : t))
    setEditingTodo(null)
  }, [editingTodo])

  const handleToggle = useCallback(async (todo: Todo) => {
    const updated = { ...todo, completed:!todo.completed }
    await updateTodo(todo.id, { completed:updated.completed })
    setTodos(prev => prev.map(t => t.id===todo.id ? updated : t))
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    await deleteTodo(id)
    setTodos(prev => prev.filter(t => t.id!==id))
  }, [])

  const filtered = todos.filter(t => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus   = filterStatus==="tous" ? true : filterStatus==="actifs" ? !t.completed : t.completed
    const matchPriority = filterPriority==="tous" ? true : t.priority===filterPriority
    const matchCategory = filterCategory==="tous" ? true : t.category===filterCategory
    return matchSearch && matchStatus && matchPriority && matchCategory
  })

  const completedCount = todos.filter(t => t.completed).length
  const progressPct    = todos.length > 0 ? Math.round((completedCount/todos.length)*100) : 0

  // Message motivation selon progression
  const getProgressMsg = () => {
    if (todos.length===0) return null
    if (progressPct===100) return { msg:"🎉 Toutes les tâches terminées ! Tu es incroyable.", color:"#4ade80" }
    if (progressPct>=75)   return { msg:"⚡ Presque fini — encore un effort !", color:"#a78bfa" }
    if (progressPct>=50)   return { msg:"🔥 À mi-chemin — continue sur ta lancée !", color:"#f59e0b" }
    if (progressPct>=25)   return { msg:"🌱 Bon début — chaque tâche compte.", color:"#06b6d4" }
    return                        { msg:"💪 Lance-toi — la première tâche est la plus difficile.", color:"rgba(255,255,255,0.3)" }
  }
  const progressMsg = getProgressMsg()

  return (
    <div className="flex flex-col gap-5">

      {/* ── EN-TÊTE ── */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Tâches
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Gérez vos tâches et restez productif</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/40 transition-all">
          <Plus className="h-4 w-4"/> Nouvelle tâche
        </motion.button>
      </motion.div>

      {/* ── ÉTAT VIDE ENGAGEANT ── */}
      {!loading && todos.length===0 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl p-8 text-center"
          style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.08)" }}>
          <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity }}>
            <span style={{ fontSize:52 }}>🎯</span>
          </motion.div>
          <h3 className="mt-4 text-lg font-bold text-white">Aucune tâche pour l'instant</h3>
          <p className="mt-2 text-sm text-white/40 max-w-sm mx-auto">
            Ajoute tes intentions du jour. Chaque tâche complétée te rapporte des XP et renforce ta discipline.
          </p>

          {/* Suggestions */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Suggestions pour aujourd'hui</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {TASK_SUGGESTIONS.map((s,i) => (
                <motion.button key={i}
                  initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15+i*0.05 }}
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => handleAdd({ title:s.title, category:s.category, priority:s.priority })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", color:"rgba(255,255,255,0.7)" }}>
                  <span>{s.emoji}</span> {s.title}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowAdd(true)}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white mx-auto bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-900/40">
            <Plus className="h-4 w-4"/> Créer une tâche personnalisée
          </motion.button>
        </motion.div>
      )}

      {/* ── BARRE PROGRESSION ── */}
      {todos.length > 0 && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">{completedCount} / {todos.length} tâches terminées</span>
            <span className="text-sm font-bold text-violet-400">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              initial={{ width:0 }} animate={{ width:`${progressPct}%` }} transition={{ duration:0.8, ease:"easeOut" }}/>
          </div>
          {progressMsg && (
            <p className="mt-2 text-xs font-medium" style={{ color:progressMsg.color }}>{progressMsg.msg}</p>
          )}
        </motion.div>
      )}

      {/* ── FILTRES ── */}
      {todos.length > 0 && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md px-5 py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30"/>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une tâche…"
              className="pl-9 bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"/>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
              {(["tous","actifs","termines"] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all capitalize",
                    filterStatus===f ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70")}>
                  {f==="tous"?"Tous":f==="actifs"?"Actifs":"Terminés"}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
              <button onClick={() => setFilterPriority("tous")}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                  filterPriority==="tous" ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70")}>
                Priorité
              </button>
              {priorities.map(p => (
                <button key={p.id} onClick={() => setFilterPriority(filterPriority===p.id?"tous":p.id)}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                    filterPriority===p.id ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70")}
                  style={{ color:filterPriority===p.id ? p.color : undefined }}>
                  {p.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
              <button onClick={() => setFilterCategory("tous")}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                  filterCategory==="tous" ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70")}>
                Catégorie
              </button>
              {taskCategories.map(c => (
                <button key={c.id} onClick={() => setFilterCategory(filterCategory===c.id?"tous":c.id)}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                    filterCategory===c.id ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70")}
                  style={{ color:filterCategory===c.id ? c.color : undefined }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── LISTE DES TÂCHES ── */}
      {todos.length > 0 && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md overflow-hidden">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400"/>
            </div>
          ) : filtered.length===0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-white/30 gap-2">
              <Sparkles className="h-6 w-6 opacity-40"/>
              <p className="text-xs">Aucune tâche trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              <AnimatePresence initial={false}>
                {filtered.map(todo => {
                  const catColor = getCategoryColor(todo.category)
                  const priColor = getPriorityColor(todo.priority)
                  return (
                    <motion.div key={todo.id} layout
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}
                      className={cn("flex items-center gap-3 px-5 py-4 group transition-colors hover:bg-white/[0.02]",
                        todo.completed && "opacity-50")}>
                      <button onClick={() => handleToggle(todo)} className="flex-shrink-0 transition-transform hover:scale-110">
                        {todo.completed
                          ? <CheckCircle2 style={{ width:20, height:20 }} className="text-green-400"/>
                          : <Circle style={{ width:20, height:20 }} className="text-white/25 hover:text-white/50"/>
                        }
                      </button>
                      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor:catColor }}/>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium text-white/90 truncate", todo.completed && "line-through text-white/40")}>
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-medium"
                            style={{ backgroundColor:catColor+"22", color:catColor }}>
                            <Tag className="h-2.5 w-2.5"/>
                            {taskCategories.find(c => c.id===todo.category)?.name ?? todo.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color:priColor }}>
                            <Flag className="h-2.5 w-2.5"/>
                            {priorities.find(p => p.id===todo.priority)?.name ?? todo.priority}
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
                        <button onClick={() => setEditingTodo(todo)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/80 hover:bg-white/[0.08] transition-all">
                          <Edit3 className="h-3.5 w-3.5"/>
                        </button>
                        <button onClick={() => handleDelete(todo.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* ── MODALS ── */}
      <AnimatePresence>
        {showAdd && (
          <Modal title="Nouvelle tâche" onClose={() => setShowAdd(false)}>
            <TodoForm values={newTodo} onChange={setNewTodo}
              onSubmit={() => handleAdd()} onCancel={() => setShowAdd(false)} label="Créer la tâche"/>
          </Modal>
        )}
        {editingTodo && (
          <Modal title="Modifier la tâche" onClose={() => setEditingTodo(null)}>
            <TodoForm values={editingTodo} onChange={v => setEditingTodo({...editingTodo,...v})}
              onSubmit={handleUpdate} onCancel={() => setEditingTodo(null)} label="Enregistrer"/>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ title, children, onClose }: { title:string; children:React.ReactNode; onClose:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
      onClick={e => { if (e.target===e.currentTarget) onClose() }}>
      <motion.div initial={{ scale:0.94, y:16, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }}
        exit={{ scale:0.94, y:8, opacity:0 }} transition={{ type:"spring", stiffness:400, damping:30 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden"
        style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))", backdropFilter:"blur(24px)", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors">
            <X className="h-4 w-4"/>
          </motion.button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

function TodoForm({ values, onChange, onSubmit, onCancel, label }: {
  values: { title:string; category:string; priority:string; due_date:string }
  onChange: (v: typeof values) => void
  onSubmit: () => void
  onCancel: () => void
  label: string
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Titre de la tâche</label>
        <Input value={values.title} onChange={e => onChange({...values,title:e.target.value})}
          placeholder="Qu'est-ce qui doit être fait ?"
          className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"
          autoFocus onKeyDown={e => e.key==="Enter" && onSubmit()}/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Catégorie</label>
          <select value={values.category} onChange={e => onChange({...values,category:e.target.value})}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors appearance-none cursor-pointer">
            {taskCategories.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Priorité</label>
          <select value={values.priority} onChange={e => onChange({...values,priority:e.target.value})}
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors appearance-none cursor-pointer">
            {priorities.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Date d'échéance</label>
        <Input type="date" value={values.due_date} onChange={e => onChange({...values,due_date:e.target.value})}
          className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"/>
      </div>
      <div className="flex gap-3 pt-2">
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={onSubmit}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg transition-all">
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
