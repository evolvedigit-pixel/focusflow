"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Zap, Clock, CheckSquare, BookOpen, Flame, Trophy, Target } from "lucide-react"

type Challenge = {
  id:       string
  label:    string
  icon:     any
  color:    string
  xpReward: number
  target:   number
  current:  number
  unit:     string
  done:     boolean
}

function getWeekStart() {
  const now  = new Date()
  const day  = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon  = new Date(now)
  mon.setDate(now.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return mon.toISOString()
}

export function WeeklyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [earnedXP, setEarnedXP]     = useState(0)
  const [totalXP, setTotalXP]       = useState(0)
  const [ready, setReady]           = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const weekStart    = getWeekStart()
      const weekStartDate = weekStart.split("T")[0]

      const [sessRes, todosRes, habitsRes, journalRes] = await Promise.all([
        supabase.from("focus_sessions")
          .select("duration, completed_at").eq("user_id", user.id)
          .gte("completed_at", weekStart),
        supabase.from("todos")
          .select("completed").eq("user_id", user.id).eq("completed", true),
        supabase.from("habit_entries")
          .select("habit_id, date").eq("user_id", user.id)
          .eq("completed", true).gte("date", weekStartDate),
        supabase.from("journal_entries")
          .select("id").eq("user_id", user.id).gte("created_at", weekStart),
      ])

      const focusMin   = (sessRes.data??[]).reduce((a:number,s:any) => a+(s.duration||0), 0)
      const focusHours = Math.round(focusMin / 60 * 10) / 10
      const sessions   = (sessRes.data??[]).length
      const tasks      = (todosRes.data??[]).length
      const habits     = new Set((habitsRes.data??[]).map((h:any) => h.habit_id+h.date)).size
      const journal    = (journalRes.data??[]).length

      const defs: Challenge[] = [
        { id:"focus5h",   label:"Focus 5h cette semaine",  icon:Clock,       color:"#8b5cf6", xpReward:100, target:5,  current:focusHours, unit:"h",       done:focusHours>=5  },
        { id:"focus10h",  label:"Marathon focus (10h)",    icon:Clock,       color:"#a855f7", xpReward:250, target:10, current:focusHours, unit:"h",       done:focusHours>=10 },
        { id:"tasks5",    label:"Compléter 5 tâches",      icon:CheckSquare, color:"#22c55e", xpReward:75,  target:5,  current:tasks,      unit:"tâches",  done:tasks>=5       },
        { id:"tasks10",   label:"Compléter 10 tâches",     icon:Target,      color:"#06b6d4", xpReward:150, target:10, current:tasks,      unit:"tâches",  done:tasks>=10      },
        { id:"sessions5", label:"5 sessions focus",        icon:Trophy,      color:"#fbbf24", xpReward:80,  target:5,  current:sessions,   unit:"sessions",done:sessions>=5    },
        { id:"habits14",  label:"14 entrées d'habitudes",  icon:Flame,       color:"#f97316", xpReward:120, target:14, current:habits,     unit:"entrées", done:habits>=14     },
        { id:"journal3",  label:"3 notes dans le journal", icon:BookOpen,    color:"#ec4899", xpReward:60,  target:3,  current:journal,    unit:"notes",   done:journal>=3     },
      ]

      const total  = defs.reduce((a,c) => a+c.xpReward, 0)
      const earned = defs.filter(c => c.done).reduce((a,c) => a+c.xpReward, 0)

      setChallenges(defs)
      setTotalXP(total)
      setEarnedXP(earned)
      setReady(true)
    }
    load()
  }, [])

  // Ne pas afficher tant que pas prêt
  if (!ready) return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
      <div className="text-sm text-white/30">Chargement des défis...</div>
    </div>
  )

  const done = challenges.filter(c => c.done).length

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400"/>
          <h2 className="font-semibold text-white">Défis de la semaine</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">{done}/{challenges.length} accomplis</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.2)", color:"#fbbf24" }}>
            <Zap className="h-3 w-3"/>+{earnedXP} / {totalXP} XP
          </div>
        </div>
      </div>

      {/* Barre globale */}
      <div className="px-5 pt-3 pb-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
          <motion.div className="h-full rounded-full"
            style={{ background:"linear-gradient(90deg,#7c3aed,#fbbf24)" }}
            initial={{ width:0 }}
            animate={{ width:`${totalXP>0?(earnedXP/totalXP)*100:0}%` }}
            transition={{ duration:1, ease:"easeOut" }}/>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {challenges.map((c, i) => {
          const pct = Math.min((c.current / c.target) * 100, 100)
          return (
            <motion.div key={c.id}
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: c.done ? `rgba(${hexToRgb(c.color)},0.08)` : "rgba(255,255,255,0.02)",
                border:`1px solid ${c.done ? c.color+"30" : "rgba(255,255,255,0.05)"}`,
              }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:`${c.color}15`, border:`1px solid ${c.color}25` }}>
                <c.icon size={16} style={{ color:c.color }}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${c.done ? "text-white/50 line-through" : "text-white/80"}`}>
                    {c.label}
                  </span>
                  <span className="text-[10px] font-bold ml-2 flex-shrink-0"
                    style={{ color:c.done ? c.color : "rgba(251,191,36,0.6)" }}>
                    +{c.xpReward} XP
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background:c.done ? c.color : `linear-gradient(90deg,${c.color}80,${c.color})` }}
                      initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }}/>
                  </div>
                  <span className="text-[10px] text-white/30 flex-shrink-0">
                    {c.unit==="h" ? `${c.current}h/${c.target}h` : `${c.current}/${c.target}`}
                  </span>
                </div>
              </div>
              {c.done && (
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:"spring", stiffness:500 }}
                  className="text-lg flex-shrink-0">✅</motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
