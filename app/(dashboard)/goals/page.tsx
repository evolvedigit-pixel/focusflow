"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import {
  Plus, Check, Trash2, Edit3, X, Loader2, ChevronDown,
  ChevronUp, Target, Calendar, Flag, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Goal = {
  id: string
  user_id: string
  title: string
  description: string | null
  emoji: string
  color: string
  target_date: string | null
  completed: boolean
  created_at: string
  steps?: GoalStep[]
}

type GoalStep = {
  id: string
  goal_id: string
  user_id: string
  title: string
  completed: boolean
  order_index: number
}

const GOAL_COLORS = [
  "#8b5cf6","#06b6d4","#22c55e","#f59e0b","#ec4899","#ef4444","#f97316","#6366f1",
]

const GOAL_EMOJIS = [
  "🎯","📚","🏃","💼","🎓","🌍","💪","🎨","🏆","❤️","🚀","🌱","💡","🎵","✈️","🏠",
]

const GOAL_SUGGESTIONS = [
  { title:"Obtenir mon diplôme",     emoji:"🎓", color:"#8b5cf6" },
  { title:"Lire 12 livres cette année", emoji:"📚", color:"#06b6d4" },
  { title:"Courir un 10km",          emoji:"🏃", color:"#22c55e" },
  { title:"Apprendre une langue",    emoji:"🌍", color:"#f59e0b" },
  { title:"Lancer un projet",        emoji:"🚀", color:"#ec4899" },
  { title:"Économiser 1000€",        emoji:"💰", color:"#6366f1" },
]

// ── Carte objectif ────────────────────────────────────────────────────────────
function GoalCard({
  goal, onToggleStep, onDeleteStep, onAddStep, onDelete, onToggleGoal,
}: {
  goal: Goal
  onToggleStep: (stepId: string, completed: boolean) => void
  onDeleteStep: (stepId: string) => void
  onAddStep: (goalId: string, title: string) => void
  onDelete: (goalId: string) => void
  onToggleGoal: (goalId: string, completed: boolean) => void
}) {
  const [expanded, setExpanded]     = useState(true)
  const [newStep, setNewStep]       = useState("")
  const [addingStep, setAddingStep] = useState(false)

  const steps      = goal.steps ?? []
  const doneSteps  = steps.filter(s => s.completed).length
  const totalSteps = steps.length
  const progress   = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0

  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000)
    : null

  async function handleAddStep() {
    if (!newStep.trim()) return
    await onAddStep(goal.id, newStep.trim())
    setNewStep("")
    setAddingStep(false)
  }

  return (
    <motion.div layout initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.3 }}
      className={cn("rounded-2xl overflow-hidden transition-all", goal.completed && "opacity-60")}
      style={{ border:`1px solid ${goal.color}30`, background:`rgba(255,255,255,0.02)` }}>

      {/* Barre de couleur top */}
      <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${goal.color},${goal.color}60)` }}/>

      {/* En-tête */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          {/* Emoji + checkbox */}
          <button onClick={() => onToggleGoal(goal.id, !goal.completed)}
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-110"
            style={{ background:`${goal.color}15`, border:`1px solid ${goal.color}30` }}>
            {goal.completed ? "✅" : goal.emoji}
          </button>

          {/* Titre + infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn("font-bold text-white text-base", goal.completed && "line-through text-white/50")}>
                {goal.title}
              </h3>
            </div>
            {goal.description && (
              <p className="text-xs text-white/40 mt-0.5 truncate">{goal.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {daysLeft !== null && (
                <div className="flex items-center gap-1 text-[10px] font-medium"
                  style={{ color: daysLeft < 0 ? "#ef4444" : daysLeft < 7 ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>
                  <Calendar size={10}/>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}j de retard` : daysLeft === 0 ? "Aujourd'hui !" : `${daysLeft}j restants`}
                </div>
              )}
              <div className="text-[10px] text-white/30">
                {doneSteps}/{totalSteps} étapes
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onDelete(goal.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 size={13}/>
            </button>
            <button onClick={() => setExpanded(!expanded)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
              {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/30">Progression</span>
            <span className="text-xs font-bold" style={{ color: progress === 100 ? "#22c55e" : goal.color }}>
              {progress}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: progress === 100
                ? "linear-gradient(90deg,#22c55e,#4ade80)"
                : `linear-gradient(90deg,${goal.color}80,${goal.color})` }}
              initial={{ width:0 }} animate={{ width:`${progress}%` }}
              transition={{ duration:0.8, ease:"easeOut" }}/>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}
            className="border-t overflow-hidden" style={{ borderColor:`${goal.color}15` }}>
            <div className="px-5 py-3 space-y-1">
              <AnimatePresence initial={false}>
                {steps.map((step, i) => (
                  <motion.div key={step.id} layout
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, x:8 }} transition={{ delay:i*0.03 }}
                    className="flex items-center gap-3 py-2 group rounded-xl px-2 hover:bg-white/[0.02] transition-colors">
                    <button onClick={() => onToggleStep(step.id, !step.completed)}
                      className="flex-shrink-0 transition-transform hover:scale-110">
                      {step.completed ? (
                        <motion.div initial={{ scale:0.5 }} animate={{ scale:1 }}
                          transition={{ type:"spring", stiffness:500 }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background:goal.color }}>
                            <Check size={11} className="text-white"/>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 transition-colors"
                          style={{ borderColor:`${goal.color}50` }}/>
                      )}
                    </button>
                    <span className={cn("text-sm flex-1", step.completed ? "line-through text-white/30" : "text-white/70")}>
                      {step.title}
                    </span>
                    <button onClick={() => onDeleteStep(step.id)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-red-400 transition-all">
                      <X size={11}/>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Ajouter une étape */}
              {addingStep ? (
                <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                  className="flex items-center gap-2 py-1">
                  <div className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor:`${goal.color}30` }}/>
                  <Input value={newStep} onChange={e => setNewStep(e.target.value)}
                    placeholder="Nouvelle étape..."
                    className="flex-1 h-8 text-sm bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-lg"
                    autoFocus onKeyDown={e => { if (e.key==="Enter") handleAddStep(); if (e.key==="Escape") setAddingStep(false) }}/>
                  <button onClick={handleAddStep}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white flex-shrink-0"
                    style={{ background:goal.color }}>
                    <Check size={13}/>
                  </button>
                  <button onClick={() => setAddingStep(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] flex-shrink-0">
                    <X size={13}/>
                  </button>
                </motion.div>
              ) : (
                <button onClick={() => setAddingStep(true)}
                  className="flex items-center gap-2 py-2 px-2 w-full text-xs text-white/25 hover:text-white/50 transition-colors rounded-xl hover:bg-white/[0.02]">
                  <Plus size={13}/> Ajouter une étape
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function GoalsPage() {
  const [goals, setGoals]       = useState<Goal[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [filter, setFilter]     = useState<"tous"|"actifs"|"termines">("actifs")

  // Formulaire
  const [newTitle, setNewTitle]       = useState("")
  const [newDesc, setNewDesc]         = useState("")
  const [newEmoji, setNewEmoji]       = useState("🎯")
  const [newColor, setNewColor]       = useState(GOAL_COLORS[0])
  const [newDate, setNewDate]         = useState("")
  const [saving, setSaving]           = useState(false)

  const supabase = createClient()

  useEffect(() => { loadGoals() }, [])

  async function loadGoals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: goalsData } = await supabase.from("goals")
      .select("*").eq("user_id", user.id).order("created_at", { ascending:false })
    const { data: stepsData } = await supabase.from("goal_steps")
      .select("*").eq("user_id", user.id).order("order_index")

    const goalsWithSteps = (goalsData ?? []).map(g => ({
      ...g,
      steps: (stepsData ?? []).filter(s => s.goal_id === g.id),
    }))
    setGoals(goalsWithSteps)
    setLoading(false)
  }

  async function handleAddGoal(override?: { title:string; emoji:string; color:string }) {
    const title = override?.title ?? newTitle.trim()
    const emoji = override?.emoji ?? newEmoji
    const color = override?.color ?? newColor
    if (!title) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { data } = await supabase.from("goals")
      .insert({ title, description:newDesc||null, emoji, color,
        target_date:newDate||null, user_id:user.id })
      .select().single()
    if (data) setGoals(prev => [{ ...data, steps:[] }, ...prev])
    setNewTitle(""); setNewDesc(""); setNewEmoji("🎯")
    setNewColor(GOAL_COLORS[0]); setNewDate("")
    setShowAdd(false); setSaving(false)
  }

  const handleToggleStep = useCallback(async (stepId: string, completed: boolean) => {
    await supabase.from("goal_steps").update({ completed }).eq("id", stepId)
    setGoals(prev => prev.map(g => ({
      ...g,
      steps: g.steps?.map(s => s.id===stepId ? { ...s, completed } : s),
    })))
  }, [])

  const handleDeleteStep = useCallback(async (stepId: string) => {
    await supabase.from("goal_steps").delete().eq("id", stepId)
    setGoals(prev => prev.map(g => ({
      ...g,
      steps: g.steps?.filter(s => s.id!==stepId),
    })))
  }, [])

  const handleAddStep = useCallback(async (goalId: string, title: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const goal    = goals.find(g => g.id===goalId)
    const maxIdx  = Math.max(-1, ...(goal?.steps?.map(s => s.order_index) ?? []))
    const { data } = await supabase.from("goal_steps")
      .insert({ goal_id:goalId, user_id:user.id, title, order_index:maxIdx+1 })
      .select().single()
    if (data) setGoals(prev => prev.map(g =>
      g.id===goalId ? { ...g, steps:[...(g.steps??[]), data] } : g
    ))
  }, [goals])

  const handleDeleteGoal = useCallback(async (goalId: string) => {
    await supabase.from("goal_steps").delete().eq("goal_id", goalId)
    await supabase.from("goals").delete().eq("id", goalId)
    setGoals(prev => prev.filter(g => g.id!==goalId))
  }, [])

  const handleToggleGoal = useCallback(async (goalId: string, completed: boolean) => {
    await supabase.from("goals").update({ completed }).eq("id", goalId)
    setGoals(prev => prev.map(g => g.id===goalId ? { ...g, completed } : g))
  }, [])

  const filtered = goals.filter(g =>
    filter==="tous" ? true : filter==="actifs" ? !g.completed : g.completed
  )

  const activeCount    = goals.filter(g => !g.completed).length
  const completedCount = goals.filter(g => g.completed).length
  const totalSteps     = goals.reduce((a,g) => a+(g.steps?.length??0), 0)
  const doneSteps      = goals.reduce((a,g) => a+(g.steps?.filter(s=>s.completed).length??0), 0)

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">

      {/* En-tête */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Objectifs
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Tes grandes ambitions, étape par étape</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/40 transition-all">
          <Plus className="h-4 w-4"/> Nouvel objectif
        </motion.button>
      </motion.div>

      {/* Stats rapides */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:"En cours",          value:activeCount,    color:"#8b5cf6" },
            { label:"Terminés",          value:completedCount, color:"#22c55e" },
            { label:"Étapes complétées", value:`${doneSteps}/${totalSteps}`, color:"#06b6d4" },
          ].map((s,i) => (
            <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
              <div className="rounded-2xl px-4 py-3 text-center"
                style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-xl font-black" style={{ color:s.color, fontFamily:"'Sora',sans-serif" }}>
                  {s.value}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filtres */}
      {goals.length > 0 && (
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-0.5 w-fit">
          {(["actifs","tous","termines"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter===f ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70")}>
              {f==="actifs"?"En cours":f==="tous"?"Tous":"Terminés"}
            </button>
          ))}
        </div>
      )}

      {/* État vide */}
      {!loading && goals.length === 0 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="rounded-2xl p-8 text-center"
          style={{ background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.08)" }}>
          <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity }}>
            <span style={{ fontSize:52 }}>🎯</span>
          </motion.div>
          <h3 className="mt-4 text-lg font-bold text-white">Aucun objectif pour l'instant</h3>
          <p className="mt-2 text-sm text-white/40 max-w-sm mx-auto">
            Définis tes grandes ambitions et découpe-les en étapes concrètes.
          </p>
          <div className="mt-6">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Suggestions</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {GOAL_SUGGESTIONS.map((s,i) => (
                <motion.button key={i}
                  initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:0.15+i*0.05 }}
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => handleAddGoal({ title:s.title, emoji:s.emoji, color:s.color })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background:`${s.color}15`, border:`1px solid ${s.color}30`, color:"rgba(255,255,255,0.7)" }}>
                  <span>{s.emoji}</span> {s.title}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Liste des objectifs */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400"/>
        </div>
      ) : (
        <AnimatePresence>
          {filtered.map(goal => (
            <GoalCard key={goal.id} goal={goal}
              onToggleStep={handleToggleStep}
              onDeleteStep={handleDeleteStep}
              onAddStep={handleAddStep}
              onDelete={handleDeleteGoal}
              onToggleGoal={handleToggleGoal}
            />
          ))}
        </AnimatePresence>
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
                <h3 className="font-semibold text-white">Nouvel objectif</h3>
                <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
                  onClick={() => setShowAdd(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08]">
                  <X className="h-4 w-4"/>
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                {/* Emoji picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Emoji</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GOAL_EMOJIS.map(e => (
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
                    placeholder="Mon grand objectif..."
                    className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"
                    autoFocus onKeyDown={e => e.key==="Enter" && handleAddGoal()}/>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Description (optionnel)</label>
                  <Input value={newDesc} onChange={e => setNewDesc(e.target.value)}
                    placeholder="Décris ton objectif..."
                    className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"/>
                </div>

                {/* Date cible */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Date cible (optionnel)</label>
                  <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"/>
                </div>

                {/* Couleur */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Couleur</label>
                  <div className="flex gap-2 flex-wrap">
                    {GOAL_COLORS.map(color => (
                      <button key={color} onClick={() => setNewColor(color)}
                        className={cn("w-8 h-8 rounded-full transition-all",
                          newColor===color ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "hover:scale-105")}
                        style={{ backgroundColor:color }}/>
                    ))}
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-2">
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => handleAddGoal()} disabled={saving || !newTitle.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg transition-all disabled:opacity-50">
                    {saving ? "Création..." : "Créer l'objectif"}
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
