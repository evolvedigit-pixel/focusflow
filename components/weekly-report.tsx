"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, Flame, Clock, CheckSquare, BookOpen, Zap, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getSessionName } from "@/lib/db"

type WeekReport = {
  focusHours:      number
  sessionsCount:   number
  tasksCompleted:  number
  habitsCompleted: number
  journalEntries:  number
  xpEarned:        number
  streak:          number
  bestSession:     string
  level:           number
  progressPct:     number
}

function getWeekReportKey() {
  const now = new Date()
  const day = now.getDay() // 1 = lundi
  // Clé de la semaine (lundi courant)
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return `focusflow_weekly_${monday.toISOString().split("T")[0]}`
}

function getMotivationMessage(report: WeekReport): string {
  if (report.focusHours >= 10) return "Semaine exceptionnelle ! Tu es dans le top niveau. 🏆"
  if (report.focusHours >= 5)  return "Très belle semaine de travail. Continue sur cette lancée ! 💪"
  if (report.focusHours >= 2)  return "Bonne semaine. La régularité fait la différence. 📈"
  return "Chaque minute de focus compte. La semaine prochaine sera meilleure. 🌱"
}

export function WeeklyReport() {
  const [visible, setVisible]   = useState(false)
  const [report, setReport]     = useState<WeekReport | null>(null)
  const [loading, setLoading]   = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const now = new Date()
    const day = now.getDay()
    // Afficher le lundi (day===1) entre 9h et 12h, ou si jamais vu cette semaine (debug: toujours visible)
    const isMonday = day === 1
    const key = getWeekReportKey()
    if (localStorage.getItem(key)) return
    if (!isMonday) return

    async function loadReport() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles").select("name, full_name, xp, level, xp_to_next_level, streak").eq("id", user.id).single()
      setUserName((profile?.name ?? profile?.full_name ?? "").split(" ")[0])

      // Semaine passée (lun→dim)
      const lastMonday = new Date()
      lastMonday.setDate(lastMonday.getDate() - 7)
      lastMonday.setHours(0,0,0,0)
      const lastSunday = new Date(lastMonday)
      lastSunday.setDate(lastMonday.getDate() + 6)
      lastSunday.setHours(23,59,59,999)

      const [sessionsRes, todosRes, habitsRes, journalRes] = await Promise.all([
        supabase.from("focus_sessions").select("duration, xp_earned, session_type, completed_at")
          .eq("user_id", user.id)
          .gte("completed_at", lastMonday.toISOString())
          .lte("completed_at", lastSunday.toISOString()),
        supabase.from("todos").select("completed").eq("user_id", user.id),
        supabase.from("habit_entries").select("habit_id")
          .eq("user_id", user.id).eq("completed", true)
          .gte("date", lastMonday.toISOString().split("T")[0])
          .lte("date", lastSunday.toISOString().split("T")[0]),
        supabase.from("journal_entries").select("id")
          .eq("user_id", user.id)
          .gte("created_at", lastMonday.toISOString())
          .lte("created_at", lastSunday.toISOString()),
      ])

      const sessions = sessionsRes.data ?? []
      const focusMin = sessions.reduce((a,s) => a+(s.duration||0), 0)
      const xpEarned = sessions.reduce((a,s) => a+(s.xp_earned||0), 0)
      const bestSession = sessions.sort((a,b) => (b.duration||0)-(a.duration||0))[0]

      const xp      = profile?.xp ?? 0
      const xpToNext = profile?.xp_to_next_level ?? 100

      setReport({
        focusHours:      Math.round(focusMin/60*10)/10,
        sessionsCount:   sessions.length,
        tasksCompleted:  (todosRes.data??[]).filter((t:any) => t.completed).length,
        habitsCompleted: new Set((habitsRes.data??[]).map((l:any) => l.habit_id)).size,
        journalEntries:  journalRes.data?.length ?? 0,
        xpEarned,
        streak:          profile?.streak ?? 0,
        bestSession:     bestSession ? getSessionName(bestSession.session_type) : "—",
        level:           profile?.level ?? 1,
        progressPct:     xpToNext > 0 ? Math.min((xp/xpToNext)*100, 100) : 0,
      })
      setLoading(false)
      setTimeout(() => setVisible(true), 2000)
    }
    loadReport()
  }, [])

  function handleClose() {
    localStorage.setItem(getWeekReportKey(), "seen")
    setVisible(false)
  }

  if (!report && !loading) return null

  return (
    <AnimatePresence>
      {visible && report && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)" }}>

          <motion.div
            initial={{ scale:0.88, y:24, opacity:0 }}
            animate={{ scale:1, y:0, opacity:1 }}
            exit={{ scale:0.9, opacity:0 }}
            transition={{ type:"spring", stiffness:380, damping:28 }}
            className="w-full max-w-lg rounded-2xl relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(24px)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>

            {/* Halos */}
            <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%)", filter:"blur(24px)" }}/>
            <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)", filter:"blur(24px)" }}/>

            <button onClick={handleClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.08] transition-all z-10">
              <X className="h-4 w-4"/>
            </button>

            <div className="p-8">
              {/* En-tête */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 20px rgba(124,58,237,0.4)" }}>
                  <Trophy className="h-6 w-6 text-white"/>
                </div>
                <div>
                  <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Bilan hebdomadaire</div>
                  <div className="font-black text-white text-lg" style={{ fontFamily:"'Sora',sans-serif" }}>
                    {userName ? `Bravo ${userName} !` : "Ta semaine en chiffres"}
                  </div>
                </div>
              </div>

              {/* Message motivation */}
              <div className="rounded-xl px-4 py-3 mb-6 text-sm text-white/70 italic"
                style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.15)" }}>
                {getMotivationMessage(report)}
              </div>

              {/* Stats grille */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon:Clock,        label:"Heures de focus",   value:`${report.focusHours}h`,          color:"#a855f7", bg:"rgba(168,85,247,0.1)"  },
                  { icon:TrendingUp,   label:"Sessions focus",    value:report.sessionsCount,              color:"#06b6d4", bg:"rgba(6,182,212,0.1)"   },
                  { icon:CheckSquare,  label:"Tâches complétées", value:report.tasksCompleted,             color:"#22c55e", bg:"rgba(34,197,94,0.1)"   },
                  { icon:Flame,        label:"Habitudes tenues",  value:report.habitsCompleted,            color:"#f97316", bg:"rgba(249,115,22,0.1)"  },
                  { icon:BookOpen,     label:"Notes journal",     value:report.journalEntries,             color:"#ec4899", bg:"rgba(236,72,153,0.1)"  },
                  { icon:Zap,          label:"XP gagnés",         value:`+${report.xpEarned}`,            color:"#fbbf24", bg:"rgba(251,191,36,0.1)"  },
                ].map((s,i) => (
                  <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05+i*0.05 }}
                    className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background:s.bg, border:`1px solid ${s.color}25` }}>
                    <s.icon size={16} style={{ color:s.color, flexShrink:0 }}/>
                    <div>
                      <div className="font-black text-white text-lg" style={{ fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{s.value}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Streak + niveau */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl px-4 py-3 text-center"
                  style={{ background:"rgba(249,115,22,0.08)", border:"1px solid rgba(249,115,22,0.2)" }}>
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>{report.streak} jours</div>
                  <div className="text-[10px] text-white/30">Série actuelle</div>
                </div>
                <div className="rounded-xl px-4 py-3 text-center"
                  style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)" }}>
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>Niveau {report.level}</div>
                  <div className="h-1.5 w-full rounded-full mt-1.5 overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background:"linear-gradient(90deg,#7c3aed,#a855f7)" }}
                      initial={{ width:0 }} animate={{ width:`${report.progressPct}%` }} transition={{ duration:1 }}/>
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">{Math.round(report.progressPct)}% vers le niveau {report.level+1}</div>
                </div>
              </div>

              {/* Bouton fermer */}
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleClose}
                className="w-full h-12 rounded-xl text-sm font-bold text-white"
                style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 8px 24px rgba(124,58,237,0.3)" }}>
                Attaquer la semaine 💪
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
