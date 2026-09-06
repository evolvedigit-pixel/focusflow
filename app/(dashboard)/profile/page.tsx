"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { getProfile, type Profile } from "@/lib/db"
import {
  Camera, Edit3, Check, X, Loader2, Zap, Clock,
  Target, Flame, Trophy, Lock, Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

const JUNGLE_RANKS = [
  { name:"Novice des Racines",      emoji:"🌱", color:"#6b7280", minHours:0   },
  { name:"Protecteur des Feuilles", emoji:"🍃", color:"#22c55e", minHours:5   },
  { name:"Gardien de la Canopée",   emoji:"🌳", color:"#06b6d4", minHours:15  },
  { name:"Sage Tropical",           emoji:"🦋", color:"#8b5cf6", minHours:40  },
  { name:"Maître des Brumes",       emoji:"🌫️",  color:"#a855f7", minHours:80  },
  { name:"Esprit de la Jungle",     emoji:"✨", color:"#f59e0b", minHours:150 },
  { name:"Souverain de l'Équilibre",emoji:"👑", color:"#ef4444", minHours:300 },
]

const CUSTOM_TITLES = [
  { id:"disciplined",  label:"Discipliné",       emoji:"⚡", unlockHours:0   },
  { id:"focused",      label:"Focalisé",          emoji:"🎯", unlockHours:5   },
  { id:"consistent",   label:"Régulier",          emoji:"🔥", unlockHours:10  },
  { id:"scholar",      label:"Érudit",            emoji:"📚", unlockHours:20  },
  { id:"warrior",      label:"Guerrier",          emoji:"⚔️",  unlockHours:40  },
  { id:"master",       label:"Maître",            emoji:"🧠", unlockHours:80  },
  { id:"legend",       label:"Légende",           emoji:"👑", unlockHours:150 },
  { id:"unstoppable",  label:"Inarrêtable",       emoji:"🚀", unlockHours:300 },
]

const BADGES = [
  { id:"first_session",  label:"Premier pas",       emoji:"🎯", desc:"1ère session focus",    check:(p:Profile)=>(p.sessions_completed??0)>=1   },
  { id:"ten_sessions",   label:"En feu",            emoji:"🔥", desc:"10 sessions complétées",(check:(p:Profile)=>(p.sessions_completed??0)>=10  },
  { id:"xp500",          label:"Précieux",          emoji:"💎", desc:"500 XP gagnés",          check:(p:Profile)=>((p.xp??0)+(p.level-1)*100)>=500},
  { id:"xp1000",         label:"Étoile",            emoji:"⭐", desc:"1000 XP gagnés",         check:(p:Profile)=>((p.xp??0)+(p.level-1)*100)>=1000},
  { id:"streak7",        label:"Semaine parfaite",  emoji:"📅", desc:"7 jours de streak",      check:(p:Profile)=>(p.streak??0)>=7              },
  { id:"streak30",       label:"Ironman",           emoji:"🦾", desc:"30 jours de streak",     check:(p:Profile)=>(p.streak??0)>=30             },
  { id:"focus10h",       label:"Marathonien",       emoji:"⏱️",  desc:"10h de focus total",     check:(p:Profile)=>(p.total_focus_hours??0)>=10  },
  { id:"focus50h",       label:"Sage du temps",     emoji:"🌟", desc:"50h de focus total",     check:(p:Profile)=>(p.total_focus_hours??0)>=50  },
  { id:"level5",         label:"Ascendant",         emoji:"🔮", desc:"Atteindre le niveau 5",  check:(p:Profile)=>(p.level??1)>=5               },
]

function getJungleRank(hours: number) {
  return [...JUNGLE_RANKS].reverse().find(r => hours >= r.minHours) ?? JUNGLE_RANKS[0]
}

function getPlantStage(hours: number) {
  if (hours < 3)   return { emoji:"🪴", name:"Graine",       next:3,   color:"#6b7280" }
  if (hours < 10)  return { emoji:"🌱", name:"Jeune pousse", next:10,  color:"#22c55e" }
  if (hours < 25)  return { emoji:"🌿", name:"Plantule",     next:25,  color:"#16a34a" }
  if (hours < 50)  return { emoji:"🌲", name:"Arbre",        next:50,  color:"#06b6d4" }
  if (hours < 100) return { emoji:"🌳", name:"Gardien",      next:100, color:"#8b5cf6" }
  return                  { emoji:"🐉", name:"Souverain",    next:999, color:"#f59e0b" }
}

export default function ProfilePage() {
  const [profile, setProfile]         = useState<Profile|null>(null)
  const [loading, setLoading]         = useState(true)
  const [editingBio, setEditingBio]   = useState(false)
  const [bio, setBio]                 = useState("")
  const [customTitle, setCustomTitle] = useState<string>("")
  const [showTitlePicker, setShowTitlePicker] = useState(false)
  const [avatarUrl, setAvatarUrl]     = useState<string|null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const p = await getProfile()
      if (!p) return
      setProfile(p)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles")
        .select("bio, custom_title, avatar_url").eq("id", user.id).single()
      setBio(data?.bio ?? "")
      setCustomTitle(data?.custom_title ?? "")
      setAvatarUrl(data?.avatar_url ?? p.avatar_url ?? null)
      setLoading(false)
    }
    load()
  }, [])

  // ── Upload photo ──────────────────────────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (file.size > 2 * 1024 * 1024) { alert("Image max 2MB"); return }

    setUploadingAvatar(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext  = file.name.split(".").pop()
    const path = `avatars/${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars").upload(path, file, { upsert:true })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      await supabase.from("profiles").update({ avatar_url:publicUrl }).eq("id", user.id)
      setAvatarUrl(publicUrl + "?t=" + Date.now())
    }
    setUploadingAvatar(false)
  }

  // ── Sauvegarder bio ───────────────────────────────────────────────────────
  async function saveBio() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("profiles").update({ bio }).eq("id", user.id)
    setEditingBio(false)
  }

  // ── Sauvegarder titre ─────────────────────────────────────────────────────
  async function saveTitle(titleId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("profiles").update({ custom_title:titleId }).eq("id", user.id)
    setCustomTitle(titleId)
    setShowTitlePicker(false)
  }

  if (loading || !profile) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-400"/>
    </div>
  )

  const hours   = profile.total_focus_hours ?? 0
  const rank    = getJungleRank(hours)
  const plant   = getPlantStage(hours)
  const xp      = profile.xp ?? 0
  const xpToNext = profile.xp_to_next_level ?? 100
  const xpPct   = Math.min((xp/xpToNext)*100, 100)
  const displayName = profile.name ?? profile.full_name ?? "Explorateur"
  const initials    = displayName.slice(0,2).toUpperCase()

  const selectedTitle = CUSTOM_TITLES.find(t => t.id===customTitle)
  const unlockedTitles = CUSTOM_TITLES.filter(t => hours >= t.unlockHours)

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* ── CARTE PROFIL PRINCIPALE ── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <GlassCard className="p-6 relative overflow-hidden" glow="purple">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background:`radial-gradient(circle,${rank.color}15,transparent 70%)`, filter:"blur(20px)" }}/>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">

            {/* ── AVATAR avec upload ── */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden relative"
                style={{ boxShadow:`0 0 24px ${rank.color}40` }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                    style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                    {initials}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white"/>
                  </div>
                )}
              </div>

              {/* Bouton upload */}
              <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}
                title="Changer la photo">
                <Camera className="h-3.5 w-3.5"/>
              </motion.button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={handleAvatarUpload}/>

              {/* Badge niveau */}
              <div className="absolute -top-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
                style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", border:"2px solid #0d0d1a", fontSize:11 }}>
                {profile.level}
              </div>
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                  {displayName}
                </h1>
                {/* Badge rang jungle */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background:`${rank.color}20`, border:`1px solid ${rank.color}40`, color:rank.color }}>
                  {rank.emoji} {rank.name}
                </div>
              </div>

              {/* Titre personnalisé */}
              <div className="flex items-center gap-2 mb-3">
                {selectedTitle ? (
                  <div className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color:"rgba(255,255,255,0.6)" }}>
                    <span>{selectedTitle.emoji}</span>
                    <span>{selectedTitle.label}</span>
                  </div>
                ) : (
                  <span className="text-sm text-white/30 italic">Aucun titre sélectionné</span>
                )}
                <button onClick={() => setShowTitlePicker(true)}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all">
                  <Edit3 size={9}/> Changer
                </button>
              </div>

              {/* Bio éditable */}
              <div className="mb-3">
                {editingBio ? (
                  <div className="flex items-start gap-2">
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} autoFocus
                      className="flex-1 rounded-xl bg-white/[0.04] border border-violet-500/40 px-3 py-2 text-sm text-white resize-none focus:outline-none"
                      placeholder="Décris-toi en quelques mots..."/>
                    <div className="flex flex-col gap-1">
                      <button onClick={saveBio}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30">
                        <Check size={14}/>
                      </button>
                      <button onClick={() => setEditingBio(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] text-white/40 hover:bg-white/[0.1]">
                        <X size={14}/>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setEditingBio(true)}
                    className="text-left text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-2 group">
                    <span>{bio || "Clique pour ajouter une bio..."}</span>
                    <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"/>
                  </button>
                )}
              </div>

              <div className="text-xs text-white/25">
                Membre depuis {new Date(profile.joined_date).toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}
              </div>
            </div>

            {/* XP + plante */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="text-center px-4 py-3 rounded-2xl"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <motion.div animate={{ y:[0,-4,0] }} transition={{ duration:2.5, repeat:Infinity }}
                  className="text-3xl mb-1">{plant.emoji}</motion.div>
                <div className="text-xs text-white/40">{plant.name}</div>
                <div className="mt-2 text-xs font-bold" style={{ color:rank.color }}>
                  Niveau {profile.level}
                </div>
                <div className="h-1.5 w-24 rounded-full mt-1 overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background:`linear-gradient(90deg,${rank.color},#a855f7)` }}
                    initial={{ width:0 }} animate={{ width:`${xpPct}%` }} transition={{ duration:1 }}/>
                </div>
                <div className="text-[9px] text-white/25 mt-1">{xp}/{xpToNext} XP</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── TITRE PICKER ── */}
      <AnimatePresence>
        {showTitlePicker && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
            onClick={e => { if (e.target===e.currentTarget) setShowTitlePicker(false) }}>
            <motion.div initial={{ scale:0.94, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.94 }}
              transition={{ type:"spring", stiffness:400, damping:30 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background:"rgba(10,10,18,0.98)", border:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 24px 80px rgba(0,0,0,0.8)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h3 className="font-semibold text-white">Choisir un titre</h3>
                <button onClick={() => setShowTitlePicker(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08]">
                  <X size={16}/>
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {/* Aucun titre */}
                <button onClick={() => saveTitle("")}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                    customTitle==="" ? "bg-white/[0.08] border border-white/[0.15]" : "hover:bg-white/[0.04] border border-transparent")}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background:"rgba(255,255,255,0.05)" }}>🚫</div>
                  <div>
                    <div className="text-sm font-medium text-white/60">Aucun titre</div>
                    <div className="text-[10px] text-white/25">Afficher uniquement le rang</div>
                  </div>
                  {customTitle==="" && <Check size={14} className="ml-auto text-green-400"/>}
                </button>

                {CUSTOM_TITLES.map(title => {
                  const unlocked = hours >= title.unlockHours
                  const selected = customTitle===title.id
                  return (
                    <button key={title.id}
                      onClick={() => unlocked && saveTitle(title.id)}
                      disabled={!unlocked}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                        !unlocked && "opacity-40 cursor-not-allowed",
                        selected ? "border border-violet-500/40" : "hover:bg-white/[0.04] border border-transparent")}
                      style={selected ? { background:"rgba(139,92,246,0.1)" } : {}}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{ background:unlocked ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)" }}>
                        {unlocked ? title.emoji : "🔒"}
                      </div>
                      <div className="flex-1">
                        <div className={cn("text-sm font-medium", unlocked ? "text-white" : "text-white/40")}>
                          {title.emoji} {title.label}
                        </div>
                        <div className="text-[10px] text-white/25">
                          {unlocked ? "Débloqué ✓" : `Débloquer à ${title.unlockHours}h de focus`}
                        </div>
                      </div>
                      {selected && <Check size={14} className="ml-auto text-green-400 flex-shrink-0"/>}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STATS ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon:Target, label:"Sessions totales",  value:profile.sessions_completed??0, color:"from-purple-500 to-purple-600" },
          { icon:Clock,  label:"Heures de focus",   value:`${Math.round(hours)}h`,        color:"from-cyan-500 to-cyan-600"   },
          { icon:Flame,  label:"Série en cours",    value:`${profile.streak??0}j`,        color:"from-orange-500 to-red-500"  },
          { icon:Zap,    label:"Productivité",      value:`${profile.productivity_score??0}%`, color:"from-yellow-500 to-amber-500"},
        ].map((s,i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.05 }}>
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} opacity-80`}>
                  <s.icon className="h-5 w-5 text-white"/>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ── BADGES ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              🏅 Badges débloqués
            </h2>
            <span className="text-xs text-white/30">
              {BADGES.filter(b => b.check(profile)).length}/{BADGES.length}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {BADGES.map((badge,i) => {
              const unlocked = badge.check(profile)
              return (
                <motion.div key={badge.id}
                  initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:0.05*i }}
                  title={`${badge.label} — ${badge.desc}`}
                  className={cn("flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                    unlocked ? "cursor-default" : "opacity-30")}
                  style={{
                    background: unlocked ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
                    border:     unlocked ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  }}>
                  <div className="text-3xl">{unlocked ? badge.emoji : "🔒"}</div>
                  <div className={cn("text-[10px] text-center font-medium leading-tight",
                    unlocked ? "text-white/70" : "text-white/25")}>
                    {badge.label}
                  </div>
                  {unlocked && <div className="text-[9px] text-white/30 text-center">{badge.desc}</div>}
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>

    </div>
  )
}
