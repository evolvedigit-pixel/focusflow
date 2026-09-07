"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/animated-counter"
import { getProfile, type Profile } from "@/lib/db"
import { Trophy, Flame, Clock, Zap, Target, Loader2, Edit3, Check, X, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"

function getHeatmapColor(count: number) {
  if (count === 0) return "rgba(139,92,246,0.06)"
  if (count === 1) return "rgba(139,92,246,0.25)"
  if (count === 2) return "rgba(139,92,246,0.5)"
  if (count === 3) return "rgba(139,92,246,0.7)"
  return "#8b5cf6"
}

function getPlantStage(h: number) {
  if (h < 3)   return { name:"Graine silencieuse",    emoji:"🪴", level:1, next:3  }
  if (h < 10)  return { name:"Jeune pousse",          emoji:"🌱", level:2, next:10 }
  if (h < 25)  return { name:"Plantule disciplinée",  emoji:"🌿", level:3, next:25 }
  if (h < 50)  return { name:"Arbre du calme",        emoji:"🌲", level:4, next:50 }
  if (h < 100) return { name:"Gardien de la Canopée", emoji:"🌳", level:5, next:100 }
  if (h < 200) return { name:"Maître des Saisons",    emoji:"🎋", level:6, next:200 }
  return              { name:"Souverain de l'Équilibre", emoji:"🐉", level:7, next:300 }
}

function getJungleRank(h: number) {
  if (h < 5)   return { rank:"Novice des Racines",      color:"#6b7280" }
  if (h < 15)  return { rank:"Protecteur des Feuilles", color:"#22c55e" }
  if (h < 40)  return { rank:"Gardien de la Canopée",   color:"#06b6d4" }
  if (h < 80)  return { rank:"Sage Tropical",           color:"#8b5cf6" }
  if (h < 150) return { rank:"Maître des Brumes",       color:"#a855f7" }
  if (h < 300) return { rank:"Esprit de la Jungle",     color:"#f59e0b" }
  return              { rank:"Souverain de l'Équilibre", color:"#ef4444" }
}

function getBadges(p: Profile | null, totalSessions: number) {
  const badges = []
  if (totalSessions >= 1)  badges.push({ emoji:"🎯", name:"Premier pas",    desc:"1ère session focus" })
  if (totalSessions >= 10) badges.push({ emoji:"🔥", name:"En feu",         desc:"10 sessions complétées" })
  if (totalSessions >= 50) badges.push({ emoji:"⚡", name:"Électrique",     desc:"50 sessions complétées" })
  if ((p?.total_focus_hours??0) >= 10)  badges.push({ emoji:"⏱️",  name:"Concentré",    desc:"10h de focus total" })
  if ((p?.total_focus_hours??0) >= 50)  badges.push({ emoji:"🏆", name:"Champion",      desc:"50h de focus total" })
  if ((p?.streak??0) >= 3)  badges.push({ emoji:"📅", name:"Régulier",      desc:"3 jours de suite" })
  if ((p?.streak??0) >= 7)  badges.push({ emoji:"👑", name:"Invincible",    desc:"7 jours de suite" })
  if ((p?.xp??0) >= 500)   badges.push({ emoji:"💎", name:"Précieux",       desc:"500 XP gagnés" })
  if ((p?.xp??0) >= 1000)  badges.push({ emoji:"🌟", name:"Étoile",         desc:"1000 XP gagnés" })
  return badges
}

export default function ProfilePage() {
  const [profile, setProfile]         = useState<Profile|null>(null)
  const [monthlyData, setMonthlyData] = useState<{month:string;xp:number;hours:number}[]>([])
  const [heatmap, setHeatmap]         = useState<{date:string;count:number}[]>([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [loading, setLoading]         = useState(true)

  // Champs éditables
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio]                 = useState("")
  const [avatarUrl, setAvatarUrl]     = useState<string|null>(null)

  // États édition
  const [editingName, setEditingName] = useState(false)
  const [editingBio, setEditingBio]   = useState(false)
  const [tempName, setTempName]       = useState("")
  const [tempBio, setTempBio]         = useState("")
  const [savingName, setSavingName]   = useState(false)
  const [savingBio, setSavingBio]     = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saveMsg, setSaveMsg]         = useState("")

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const p = await getProfile()
      setProfile(p)

      // Charger les extras depuis la DB
      const { data: extras } = await supabase
        .from("profiles")
        .select("bio, display_name, avatar_url, name, full_name")
        .eq("id", user.id).single()

      const name = extras?.display_name || extras?.name || extras?.full_name ||
        user.email?.split("@")[0] || "Utilisateur"
      setDisplayName(name)
      setBio(extras?.bio ?? "")
      setAvatarUrl(extras?.avatar_url ?? null)

      if (p) {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        const { data: sessions } = await supabase
          .from("focus_sessions").select("duration, xp_earned, completed_at")
          .eq("user_id", user.id).gte("completed_at", sixMonthsAgo.toISOString())

        setTotalSessions(sessions?.length ?? 0)

        const months = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]
        const monthMap: Record<string,{xp:number;hours:number}> = {}
        for (let i=5; i>=0; i--) {
          const d = new Date(); d.setMonth(d.getMonth()-i)
          monthMap[months[d.getMonth()]] = {xp:0,hours:0}
        }
        for (const s of sessions??[]) {
          const m = months[new Date(s.completed_at).getMonth()]
          if (monthMap[m]) { monthMap[m].xp += s.xp_earned; monthMap[m].hours += s.duration/60 }
        }
        setMonthlyData(Object.entries(monthMap).map(([month,v]) => ({month,...v})))

        const { data: heatSessions } = await supabase
          .from("focus_sessions").select("completed_at").eq("user_id", user.id)
          .gte("completed_at", new Date(Date.now()-84*86400000).toISOString())

        const countMap: Record<string,number> = {}
        for (const s of heatSessions??[]) {
          const d = s.completed_at.split("T")[0]
          countMap[d] = (countMap[d]??0)+1
        }
        const heatmapArr = []
        for (let i=83; i>=0; i--) {
          const d = new Date(); d.setDate(d.getDate()-i)
          const key = d.toISOString().split("T")[0]
          heatmapArr.push({date:key, count:countMap[key]??0})
        }
        setHeatmap(heatmapArr)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Sauvegarder le nom ──────────────────────────────────────────────────
  async function saveName() {
    if (!tempName.trim()) return
    setSavingName(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").update({
        display_name: tempName.trim(),
        name:         tempName.trim(),
      }).eq("id", user.id)
      setDisplayName(tempName.trim())
    }
    setSavingName(false)
    setEditingName(false)
    flash("Nom enregistré ✓")
  }

  // ── Sauvegarder la bio ──────────────────────────────────────────────────
  async function saveBio() {
    setSavingBio(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").update({ bio: tempBio.trim() }).eq("id", user.id)
      setBio(tempBio.trim())
    }
    setSavingBio(false)
    setEditingBio(false)
    flash("Bio enregistrée ✓")
  }

  // ── Upload photo ─────────────────────────────────────────────────────────
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return }
    setUploadingPhoto(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingPhoto(false); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      await supabase.from("profiles").update({ avatar_url: base64 }).eq("id", user.id)
      setAvatarUrl(base64)
      setUploadingPhoto(false)
      flash("Photo mise à jour ✓")
    }
    reader.readAsDataURL(file)
  }

  function flash(msg: string) {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(""), 3000)
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-400"/>
    </div>
  )

  const p          = profile
  const xpProgress = p ? (p.xp/p.xp_to_next_level)*100 : 0
  const totalHours = p?.total_focus_hours ?? 0
  const plant      = getPlantStage(totalHours)
  const jungleRank = getJungleRank(totalHours)
  const badges     = getBadges(p, totalSessions)
  const initials   = displayName.slice(0,2).toUpperCase()
  const plantProgress = Math.min((totalHours/plant.next)*100, 100)

  const stats = [
    { label:"Sessions totales", value:totalSessions,          icon:Target, color:"from-purple-500 to-purple-600" },
    { label:"Heures de focus",  value:Math.round(totalHours), icon:Clock,  color:"from-cyan-500 to-cyan-600"    },
    { label:"Série en cours",   value:p?.streak??0, suffix:" j", icon:Flame, color:"from-orange-500 to-red-500"  },
    { label:"Productivité",     value:p?.productivity_score??0, suffix:"%", icon:Trophy, color:"from-yellow-500 to-amber-500" },
  ]

  return (
    <div className="space-y-5 relative">

      {/* Toast */}
      {saveMsg && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background:"rgba(34,197,94,0.2)", border:"1px solid rgba(34,197,94,0.4)" }}>
          {saveMsg}
        </motion.div>
      )}

      {/* ── CARTE PROFIL ── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <GlassCard className="p-6 sm:p-8 relative overflow-hidden" glow="purple">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"/>
          <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-cyan-400/8 blur-3xl pointer-events-none"/>

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex items-start gap-5">

              {/* ── AVATAR + UPLOAD ── */}
              <div className="relative flex-shrink-0" style={{ width:96, height:96 }}>
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.4)]"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">{initials}</div>
                  )}
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-white"/>
                  </div>
                )}
                {/* Bouton photo — toujours visible */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute flex items-center justify-center rounded-full text-white shadow-xl"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", border:"2.5px solid #09090b",
                    width:32, height:32, bottom:-4, right:-4, zIndex:30 }}
                  title="Changer la photo">
                  <Camera size={14}/>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                {/* Badge niveau */}
                <div className="absolute flex items-center justify-center rounded-full font-bold text-white text-sm"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", border:"2px solid #09090b",
                    width:28, height:28, top:-4, left:-4, zIndex:30, fontSize:11 }}>
                  {p?.level??1}
                </div>
              </div>

              <div className="flex-1">
                {/* ── NOM ÉDITABLE ── */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input value={tempName} onChange={e => setTempName(e.target.value)}
                        className="text-xl font-bold rounded-lg px-3 py-1 outline-none"
                        style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(139,92,246,0.5)", color:"#fff", maxWidth:200 }}
                        autoFocus onKeyDown={e => e.key==="Enter" && saveName()}
                        placeholder="Ton prénom ou pseudo"/>
                      <button onClick={saveName} disabled={savingName}
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background:"rgba(34,197,94,0.2)", color:"#4ade80" }}>
                        {savingName ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                      </button>
                      <button onClick={() => setEditingName(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)" }}>
                        <X size={14}/>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setTempName(displayName); setEditingName(true) }}
                      className="flex items-center gap-2 group text-left">
                      <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                      <Edit3 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30"/>
                    </button>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background:`${jungleRank.color}20`, color:jungleRank.color, border:`1px solid ${jungleRank.color}40` }}>
                    {jungleRank.rank}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm mb-3">
                  Membre depuis{" "}
                  {p?.joined_date
                    ? new Date(p.joined_date).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})
                    : "—"}
                </p>

                {/* ── BIO ÉDITABLE ── */}
                {editingBio ? (
                  <div className="flex items-center gap-2">
                    <input value={tempBio} onChange={e => setTempBio(e.target.value)}
                      className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none"
                      style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(139,92,246,0.4)", color:"#fff" }}
                      placeholder="Décris-toi en une phrase..."
                      autoFocus onKeyDown={e => e.key==="Enter" && saveBio()}/>
                    <button onClick={saveBio} disabled={savingBio}
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:"rgba(34,197,94,0.2)", color:"#4ade80" }}>
                      {savingBio ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                    </button>
                    <button onClick={() => setEditingBio(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)" }}>
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => { setTempBio(bio); setEditingBio(true) }}>
                    <p className="text-sm" style={{ color:"rgba(255,255,255,0.4)" }}>
                      {bio || "Clique pour ajouter une bio..."}
                    </p>
                    <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:"rgba(255,255,255,0.3)" }}/>
                  </div>
                )}
              </div>
            </div>

            {/* XP + plante */}
            <div className="sm:ml-auto flex flex-col items-end gap-3 min-w-52">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 w-full"
                style={{ background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.12)" }}>
                <motion.span animate={{ y:[0,-3,0] }} transition={{ duration:2, repeat:Infinity }}>
                  {plant.emoji}
                </motion.span>
                <div className="flex-1">
                  <div className="text-xs font-semibold" style={{ color:"#d1fae5" }}>{plant.name}</div>
                  <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background:"rgba(74,222,128,0.1)" }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background:"linear-gradient(90deg,#16a34a,#4ade80)" }}
                      initial={{ width:0 }} animate={{ width:`${plantProgress}%` }} transition={{ duration:1 }}/>
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color:"rgba(74,222,128,0.4)" }}>
                    {Math.round(totalHours)}h / {plant.next}h
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Niveau {p?.level??1} → {(p?.level??1)+1}</span>
                  <span className="text-xs font-medium">{p?.xp?.toLocaleString()} / {p?.xp_to_next_level?.toLocaleString()} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2"/>
                <p className="mt-1 text-xs text-muted-foreground text-right">{Math.round(xpProgress)}% vers le niveau {(p?.level??1)+1}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat,i) => (
          <motion.div key={stat.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.05 }}>
            <GlassCard className="p-5 text-center">
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} opacity-80`}>
                <stat.icon className="h-5 w-5 text-white"/>
              </div>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={stat.value}/>{(stat as any).suffix??''}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏅</span>
            <h2 className="font-semibold">Badges débloqués</h2>
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{ background:"rgba(139,92,246,0.1)", color:"#a855f7", border:"1px solid rgba(139,92,246,0.2)" }}>
              {badges.length} / 9
            </span>
          </div>
          {badges.length === 0 ? (
            <div className="flex h-20 items-center justify-center text-muted-foreground text-sm">
              Complète des sessions pour débloquer des badges 🎯
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {badges.map((badge,i) => (
                <motion.div key={i}
                  initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.25+i*0.05 }}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}
                  title={badge.desc}>
                  <span style={{ fontSize:28 }}>{badge.emoji}</span>
                  <span className="text-[10px] font-semibold text-white/70">{badge.name}</span>
                  <span className="text-[9px] text-white/30">{badge.desc}</span>
                </motion.div>
              ))}
              {Array.from({ length: Math.max(0, 9-badges.length) }).map((_,i) => (
                <div key={`locked-${i}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
                  style={{ background:"rgba(255,255,255,0.01)", border:"1px dashed rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize:28, filter:"grayscale(1)", opacity:0.2 }}>🔒</span>
                  <span className="text-[9px] text-white/15">Verrouillé</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Progression mensuelle */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-400"/>
            <h2 className="font-semibold">Progression mensuelle</h2>
          </div>
          {monthlyData.every(d => d.xp===0) ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              Complétez des sessions focus pour voir vos progrès.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12}/>
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12}/>
                <Tooltip contentStyle={{ background:"rgba(0,0,0,0.8)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px" }}/>
                <Bar dataKey="xp" fill="url(#barGrad)" radius={[4,4,0,0]} name="XP"/>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7"/>
                    <stop offset="100%" stopColor="#22d3ee"/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </motion.div>

      {/* Heatmap */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-cyan-400"/>
            <h2 className="font-semibold">Carte d'activité — 84 jours</h2>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns:"repeat(12,1fr)" }}>
            {heatmap.map(item => (
              <div key={item.date}
                className="aspect-square rounded-sm cursor-default transition-all hover:scale-110"
                style={{ background:getHeatmapColor(item.count), border:"1px solid rgba(255,255,255,0.04)" }}
                title={`${item.date} : ${item.count} session${item.count!==1?"s":""}`}/>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Moins</span>
            {[0,1,2,3,4].map(n => (
              <div key={n} className="h-3 w-3 rounded-sm" style={{ background:getHeatmapColor(n) }}/>
            ))}
            <span className="text-xs text-muted-foreground">Plus</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
