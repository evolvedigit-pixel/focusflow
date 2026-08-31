"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { getProfile, getSessionName, type Profile } from "@/lib/db"
import { Download, Share2, Loader2, Copy, Check } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import Link from "next/link"

function getJungleRank(h: number) {
  if (h < 5)   return "Novice des Racines"
  if (h < 15)  return "Protecteur des Feuilles"
  if (h < 40)  return "Gardien de la Canopée"
  if (h < 80)  return "Sage Tropical"
  if (h < 150) return "Maître des Brumes"
  if (h < 300) return "Esprit de la Jungle"
  return "Souverain de l'Équilibre"
}

function getPlantEmoji(h: number) {
  if (h < 3)   return "🪴"
  if (h < 10)  return "🌱"
  if (h < 25)  return "🌿"
  if (h < 50)  return "🌲"
  if (h < 100) return "🌳"
  return "🐉"
}

type WeekStats = {
  focusHours: number
  sessionsCount: number
  tasksCompleted: number
  habitsCompleted: number
  streak: number
  topDay: string
}

export default function ShareProgressPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null)
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)
  const [generated, setGenerated] = useState(false)

  const DAYS_FR = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"]

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const p = await getProfile()
      setProfile(p)

      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 6)
      weekStart.setHours(0,0,0,0)

      const [sessionsRes, todosRes, habitsRes, logsRes] = await Promise.all([
        supabase.from("focus_sessions").select("duration, completed_at, session_type")
          .eq("user_id", user.id).gte("completed_at", weekStart.toISOString()),
        supabase.from("todos").select("completed").eq("user_id", user.id),
        supabase.from("habits").select("id").eq("user_id", user.id),
        supabase.from("habit_entries").select("habit_id, date")
          .eq("user_id", user.id).eq("completed", true)
          .gte("date", weekStart.toISOString().split("T")[0]),
      ])

      const sessions = sessionsRes.data ?? []
      const todos    = todosRes.data ?? []

      const focusMin = sessions.reduce((a,s) => a + (s.duration||0), 0)

      // Jour avec le plus de focus
      const dayMap: Record<string,number> = {}
      for (const s of sessions) {
        const d = DAYS_FR[new Date(s.completed_at).getDay()]
        dayMap[d] = (dayMap[d]??0) + (s.duration||0)
      }
      const topDay = Object.entries(dayMap).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "—"

      setWeekStats({
        focusHours:      Math.round(focusMin / 60 * 10) / 10,
        sessionsCount:   sessions.length,
        tasksCompleted:  todos.filter(t => t.completed).length,
        habitsCompleted: new Set((logsRes.data??[]).map((l:any) => l.habit_id+l.date)).size,
        streak:          p?.streak ?? 0,
        topDay,
      })
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!loading && profile && weekStats) {
      setTimeout(() => generateCanvas(), 300)
    }
  }, [loading, profile, weekStats])

  function generateCanvas() {
    const canvas = canvasRef.current
    if (!canvas || !profile || !weekStats) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = 1080, H = 1080
    canvas.width = W; canvas.height = H

    // ── Fond dégradé ──
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0,   "#0d0d1a")
    bg.addColorStop(0.5, "#0f0a1e")
    bg.addColorStop(1,   "#0a0a14")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // ── Halos ──
    const halo1 = ctx.createRadialGradient(200, 200, 0, 200, 200, 400)
    halo1.addColorStop(0, "rgba(124,58,237,0.18)")
    halo1.addColorStop(1, "transparent")
    ctx.fillStyle = halo1; ctx.fillRect(0, 0, W, H)

    const halo2 = ctx.createRadialGradient(880, 880, 0, 880, 880, 350)
    halo2.addColorStop(0, "rgba(99,102,241,0.12)")
    halo2.addColorStop(1, "transparent")
    ctx.fillStyle = halo2; ctx.fillRect(0, 0, W, H)

    // ── Bordure arrondie simulée ──
    ctx.strokeStyle = "rgba(139,92,246,0.25)"
    ctx.lineWidth = 2
    roundRect(ctx, 40, 40, W-80, H-80, 32)
    ctx.stroke()

    // ── Logo + titre ──
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 42px 'Arial'"
    ctx.textAlign = "center"
    ctx.fillText("FocusFlow", W/2, 130)

    ctx.fillStyle = "rgba(139,92,246,0.7)"
    ctx.font = "18px 'Arial'"
    ctx.fillText("Ma progression de la semaine", W/2, 170)

    // ── Séparateur ──
    const sep = ctx.createLinearGradient(W*0.2, 0, W*0.8, 0)
    sep.addColorStop(0, "transparent")
    sep.addColorStop(0.5, "rgba(139,92,246,0.4)")
    sep.addColorStop(1, "transparent")
    ctx.strokeStyle = sep; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W*0.2, 195); ctx.lineTo(W*0.8, 195); ctx.stroke()

    // ── Nom + rang ──
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 56px 'Arial'"
    ctx.textAlign = "center"
    const name = profile.name ?? profile.full_name ?? "Explorateur"
    ctx.fillText(name, W/2, 280)

    ctx.fillStyle = "rgba(167,139,250,0.8)"
    ctx.font = "22px 'Arial'"
    ctx.fillText(getJungleRank(profile.total_focus_hours??0), W/2, 320)

    // ── Grande stat centrale — heures de focus ──
    const focusGrad = ctx.createLinearGradient(W/2-100, 0, W/2+100, 0)
    focusGrad.addColorStop(0, "#7c3aed")
    focusGrad.addColorStop(1, "#a855f7")
    ctx.fillStyle = focusGrad
    ctx.font = "bold 140px 'Arial'"
    ctx.textAlign = "center"
    ctx.fillText(`${weekStats.focusHours}h`, W/2, 480)

    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.font = "26px 'Arial'"
    ctx.fillText("de focus cette semaine", W/2, 520)

    // ── 4 stats ──
    const stats = [
      { label:"Sessions",   value:`${weekStats.sessionsCount}`,   emoji:"⏱" },
      { label:"Tâches",     value:`${weekStats.tasksCompleted}`,  emoji:"✅" },
      { label:"Habitudes",  value:`${weekStats.habitsCompleted}`, emoji:"🌱" },
      { label:"Série",      value:`${weekStats.streak}j`,         emoji:"🔥" },
    ]

    const statW = 220, statH = 140, gap = 30
    const totalW = stats.length * statW + (stats.length-1) * gap
    const startX = (W - totalW) / 2

    stats.forEach((s, i) => {
      const x = startX + i * (statW + gap)
      const y = 580

      // Carte
      ctx.fillStyle = "rgba(255,255,255,0.04)"
      roundRect(ctx, x, y, statW, statH, 16)
      ctx.fill()
      ctx.strokeStyle = "rgba(139,92,246,0.15)"
      ctx.lineWidth = 1
      roundRect(ctx, x, y, statW, statH, 16)
      ctx.stroke()

      // Emoji
      ctx.font = "36px 'Arial'"
      ctx.textAlign = "center"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(s.emoji, x + statW/2, y + 52)

      // Valeur
      ctx.font = "bold 38px 'Arial'"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(s.value, x + statW/2, y + 95)

      // Label
      ctx.font = "16px 'Arial'"
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.fillText(s.label, x + statW/2, y + 125)
    })

    // ── XP + Niveau ──
    ctx.fillStyle = "rgba(255,255,255,0.06)"
    roundRect(ctx, W/2-200, 760, 400, 90, 20)
    ctx.fill()
    ctx.strokeStyle = "rgba(139,92,246,0.2)"
    ctx.lineWidth = 1
    roundRect(ctx, W/2-200, 760, 400, 90, 20)
    ctx.stroke()

    ctx.fillStyle = "#a855f7"
    ctx.font = "bold 36px 'Arial'"
    ctx.textAlign = "center"
    ctx.fillText(`Niveau ${profile.level} · ${profile.xp} XP`, W/2, 810)

    ctx.fillStyle = "rgba(255,255,255,0.35)"
    ctx.font = "18px 'Arial'"
    ctx.fillText(`${getPlantEmoji(profile.total_focus_hours??0)} ${getJungleRank(profile.total_focus_hours??0)}`, W/2, 840)

    // ── Barre XP ──
    const xpPct = Math.min((profile.xp / (profile.xp_to_next_level||100)), 1)
    ctx.fillStyle = "rgba(255,255,255,0.06)"
    roundRect(ctx, W/2-200, 870, 400, 10, 5)
    ctx.fill()
    const xpGrad = ctx.createLinearGradient(W/2-200, 0, W/2+200, 0)
    xpGrad.addColorStop(0, "#7c3aed")
    xpGrad.addColorStop(1, "#a855f7")
    ctx.fillStyle = xpGrad
    roundRect(ctx, W/2-200, 870, 400*xpPct, 10, 5)
    ctx.fill()

    // ── Footer ──
    ctx.fillStyle = "rgba(255,255,255,0.2)"
    ctx.font = "20px 'Arial'"
    ctx.textAlign = "center"
    ctx.fillText("focusflow-omega-roan.vercel.app", W/2, 970)

    ctx.fillStyle = "rgba(139,92,246,0.5)"
    ctx.font = "16px 'Arial'"
    ctx.fillText("#FocusFlow #Productivité #Discipline", W/2, 1005)

    setGenerated(true)
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `focusflow-progression-${new Date().toISOString().split("T")[0]}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  async function handleCopy() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        handleDownload()
      }
    })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Partager ma progression</h1>
            <p className="text-muted-foreground mt-1">Image stylée pour Instagram, Twitter ou Discord</p>
          </div>
          <Link href="/dashboard">
            <button className="text-sm text-white/40 hover:text-white transition-colors">← Retour</button>
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400"/>
        </div>
      ) : (
        <>
          {/* Aperçu canvas */}
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
            className="rounded-2xl overflow-hidden border border-white/[0.08]">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ aspectRatio:"1/1" }}/>
          </motion.div>

          {/* Stats de la semaine */}
          {weekStats && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
              <GlassCard className="p-5">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Résumé de la semaine</div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {[
                    { label:"Focus",     value:`${weekStats.focusHours}h`, color:"#a855f7" },
                    { label:"Sessions",  value:weekStats.sessionsCount,    color:"#06b6d4" },
                    { label:"Tâches",    value:weekStats.tasksCompleted,   color:"#22c55e" },
                    { label:"Habitudes", value:weekStats.habitsCompleted,  color:"#f59e0b" },
                    { label:"Série",     value:`${weekStats.streak}j`,     color:"#f97316" },
                    { label:"Top jour",  value:weekStats.topDay,           color:"#ec4899" },
                  ].map((s,i) => (
                    <div key={i} className="text-center rounded-xl p-3"
                      style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                      <div className="font-bold text-lg" style={{ color:s.color }}>{s.value}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Boutons */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="flex gap-3 flex-wrap">
            <button onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 4px 20px rgba(124,58,237,0.4)" }}>
              <Download size={16}/> Télécharger l'image
            </button>
            <button onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)" }}>
              {copied ? <><Check size={16} className="text-green-400"/> Copié !</> : <><Copy size={16}/> Copier</>}
            </button>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
            className="text-center text-xs text-white/20">
            💡 Sur Instagram : télécharge l'image et partage-la en story ou en post carré
          </motion.div>
        </>
      )}
    </div>
  )
}
