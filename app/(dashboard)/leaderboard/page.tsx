"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Trophy, Flame, Clock, Crown, Medal, Award, Loader2, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type LeaderUser = {
  id: string
  name: string | null
  full_name: string | null
  level: number
  xp: number
  streak: number
  total_focus_hours: number
  sessions_completed: number
}

function getJungleRank(h: number) {
  if (h < 5)   return { rank:"Novice des Racines",      emoji:"🌱", color:"#6b7280" }
  if (h < 15)  return { rank:"Protecteur des Feuilles", emoji:"🍃", color:"#22c55e" }
  if (h < 40)  return { rank:"Gardien de la Canopée",   emoji:"🌳", color:"#06b6d4" }
  if (h < 80)  return { rank:"Sage Tropical",           emoji:"🦋", color:"#8b5cf6" }
  if (h < 150) return { rank:"Maître des Brumes",       emoji:"🌫️",  color:"#a855f7" }
  if (h < 300) return { rank:"Esprit de la Jungle",     emoji:"✨", color:"#f59e0b" }
  return              { rank:"Souverain de l'Équilibre", emoji:"👑", color:"#ef4444" }
}

function getRankStyle(rank: number) {
  if (rank === 1) return { gradient:"from-yellow-400 to-amber-500",  icon:Crown,  shadow:"rgba(251,191,36,0.4)" }
  if (rank === 2) return { gradient:"from-gray-300 to-gray-400",     icon:Medal,  shadow:"rgba(209,213,219,0.3)" }
  if (rank === 3) return { gradient:"from-amber-600 to-orange-600",  icon:Award,  shadow:"rgba(217,119,6,0.3)"  }
  return null
}

export default function LeaderboardPage() {
  const [users, setUsers]             = useState<LeaderUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string|null>(null)
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState<"xp"|"heures"|"streak">("xp")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
      const { data } = await supabase
        .from("profiles")
        .select("id, name, full_name, level, xp, streak, total_focus_hours, sessions_completed")
        .order("xp", { ascending:false })
        .limit(20)
      setUsers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const sorted = [...users].sort((a,b) => {
    if (tab==="xp")     return b.xp - a.xp
    if (tab==="heures") return b.total_focus_hours - a.total_focus_hours
    return b.streak - a.streak
  })

  const myRank    = sorted.findIndex(u => u.id===currentUserId) + 1
  const me        = users.find(u => u.id===currentUserId)
  const myJungle  = getJungleRank(me?.total_focus_hours ?? 0)

  // Stats globales
  const totalXP    = users.reduce((a,u) => a+u.xp, 0)
  const totalHours = Math.round(users.reduce((a,u) => a+u.total_focus_hours, 0))
  const topStreak  = Math.max(...users.map(u => u.streak), 0)

  return (
    <div className="space-y-5">

      {/* ── EN-TÊTE ── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-2xl font-bold sm:text-3xl">Classement</h1>
        <p className="text-muted-foreground mt-1">Meilleurs joueurs par XP · Focus · Série</p>
      </motion.div>

      {/* ── STATS GLOBALES ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="grid grid-cols-3 gap-3">
        {[
          { label:"XP total communauté", value:totalXP.toLocaleString(), emoji:"💎", color:"#a855f7" },
          { label:"Heures de focus",     value:`${totalHours}h`,         emoji:"⏱️",  color:"#06b6d4" },
          { label:"Meilleure série",     value:`${topStreak}j`,          emoji:"🔥", color:"#f97316" },
        ].map((s,i) => (
          <motion.div key={i} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.08+i*0.04 }}>
            <GlassCard className="p-4 text-center">
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="font-black text-lg" style={{ color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ── MON RANG ── */}
      {myRank > 0 && me && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <GlassCard className="p-5 relative overflow-hidden" glow="purple">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"/>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-black text-white"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 20px rgba(124,58,237,0.4)" }}>
                  #{myRank}
                </div>
                <div>
                  <div className="font-bold text-white">{me.name ?? me.full_name ?? "Toi"}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span style={{ fontSize:14 }}>{myJungle.emoji}</span>
                    <span className="text-xs font-medium" style={{ color:myJungle.color }}>{myJungle.rank}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-auto flex-wrap">
                {[
                  { label:"XP",      value:me.xp.toLocaleString(),            icon:Zap,          color:"#a855f7" },
                  { label:"Heures",  value:`${Math.round(me.total_focus_hours)}h`, icon:Clock,   color:"#06b6d4" },
                  { label:"Série",   value:`${me.streak}j`,                   icon:Flame,        color:"#f97316" },
                ].map((s,i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-0.5">
                      <s.icon size={12} style={{ color:s.color }}/>
                      <span className="text-xs text-white/40">{s.label}</span>
                    </div>
                    <div className="font-bold text-white text-sm">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progression vers le prochain rang */}
            {myRank > 1 && sorted[myRank-2] && (
              <div className="mt-4 rounded-xl px-3 py-2.5"
                style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.15)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/40">Vers le rang #{myRank-1}</span>
                  <span className="text-xs font-semibold" style={{ color:"#a855f7" }}>
                    {tab==="xp"
                      ? `${(sorted[myRank-2].xp - (me?.xp??0)).toLocaleString()} XP manquants`
                      : tab==="heures"
                      ? `${Math.round(sorted[myRank-2].total_focus_hours - (me?.total_focus_hours??0))}h manquantes`
                      : `${sorted[myRank-2].streak - (me?.streak??0)}j manquants`
                    }
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(139,92,246,0.1)" }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background:"linear-gradient(90deg,#7c3aed,#a855f7)" }}
                    initial={{ width:0 }}
                    animate={{ width:`${Math.min(
                      tab==="xp" ? ((me?.xp??0)/sorted[myRank-2].xp)*100
                      : tab==="heures" ? ((me?.total_focus_hours??0)/sorted[myRank-2].total_focus_hours)*100
                      : ((me?.streak??0)/sorted[myRank-2].streak)*100
                    ,100)}%` }}
                    transition={{ duration:1 }}/>
                </div>
              </div>
            )}
            {myRank===1 && (
              <div className="mt-3 text-center text-sm font-semibold" style={{ color:"#fbbf24" }}>
                👑 Tu es en tête du classement !
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* ── ONGLETS ── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}
        className="flex gap-2">
        {[
          { id:"xp",     label:"XP",          icon:Zap   },
          { id:"heures", label:"Heures focus", icon:Clock },
          { id:"streak", label:"Série",        icon:Flame },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              tab===t.id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40"
                : "bg-white/[0.03] text-white/40 border border-white/[0.07] hover:text-white hover:bg-white/[0.06]")}>
            <t.icon className="h-3.5 w-3.5"/>
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* ── TOP 3 ── */}
      {!loading && sorted.length >= 3 && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
          className="grid grid-cols-3 gap-3">
          {[sorted[1], sorted[0], sorted[2]].map((user, i) => {
            const realRank = i===0 ? 2 : i===1 ? 1 : 3
            const rankStyle = getRankStyle(realRank)!
            const isMe = user.id===currentUserId
            const jungle = getJungleRank(user.total_focus_hours)
            const userName = user.name ?? user.full_name ?? "Anonyme"
            return (
              <motion.div key={user.id}
                initial={{ opacity:0, y:realRank===1?-10:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.2+i*0.05 }}
                className={cn("rounded-2xl p-4 text-center relative overflow-hidden",
                  isMe && "ring-2 ring-violet-500/50")}
                style={{ background:`rgba(255,255,255,0.02)`, border:`1px solid rgba(255,255,255,0.07)`,
                  marginTop: realRank===1 ? 0 : 16 }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background:`radial-gradient(ellipse at 50% 0%,${rankStyle.shadow}15,transparent 70%)` }}/>
                <div className={cn("mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br", rankStyle.gradient)}
                  style={{ boxShadow:`0 4px 16px ${rankStyle.shadow}` }}>
                  <rankStyle.icon className="h-5 w-5 text-white"/>
                </div>
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white"
                    style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(99,102,241,0.2))", border:"1px solid rgba(139,92,246,0.2)" }}>
                    {userName.slice(0,2).toUpperCase()}
                  </div>
                </div>
                <div className="font-bold text-white text-sm truncate">{userName}</div>
                {isMe && <div className="text-[10px] text-violet-400 font-semibold">Vous</div>}
                <div className="text-[10px] mt-0.5 mb-2" style={{ color:jungle.color }}>{jungle.emoji} {jungle.rank}</div>
                <div className="font-black text-white" style={{ fontFamily:"'Sora',sans-serif", fontSize:18 }}>
                  {tab==="xp" ? `${user.xp.toLocaleString()} XP`
                   : tab==="heures" ? `${Math.round(user.total_focus_hours)}h`
                   : `${user.streak}j`}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* ── LISTE COMPLÈTE ── */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <GlassCard className="p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400"/>
            </div>
          ) : sorted.length===0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
              Aucun utilisateur. Soyez le premier à gagner des XP !
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((user, index) => {
                const rank      = index + 1
                const isMe      = user.id===currentUserId
                const rankStyle = getRankStyle(rank)
                const jungle    = getJungleRank(user.total_focus_hours)
                const userName  = user.name ?? user.full_name ?? "Anonyme"
                return (
                  <motion.div key={user.id}
                    initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:index*0.03 }}
                    className={cn("flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all",
                      isMe ? "border border-purple-500/20" : "hover:bg-white/[0.03]")}
                    style={isMe ? { background:"linear-gradient(90deg,rgba(139,92,246,0.08),rgba(99,102,241,0.05))" } : { background:"rgba(255,255,255,0.01)" }}>

                    {/* Rang */}
                    {rankStyle ? (
                      <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br", rankStyle.gradient)}
                        style={{ boxShadow:`0 4px 12px ${rankStyle.shadow}` }}>
                        <rankStyle.icon className="h-4 w-4 text-white"/>
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white/50"
                        style={{ background:"rgba(255,255,255,0.05)" }}>
                        {rank}
                      </div>
                    )}

                    {/* Avatar */}
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(99,102,241,0.2))", border:"1px solid rgba(139,92,246,0.15)" }}>
                      {userName.slice(0,2).toUpperCase()}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate text-sm text-white/90">{userName}</p>
                        {isMe && <span className="text-[10px] text-purple-400 font-semibold flex-shrink-0">Vous</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span style={{ fontSize:11 }}>{jungle.emoji}</span>
                        <span className="text-[10px]" style={{ color:jungle.color }}>{jungle.rank}</span>
                        <span className="text-[10px] text-white/20">· Niv. {user.level}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-white/30">
                      <div className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-400"/>
                        <span>{user.streak}j</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-cyan-400"/>
                        <span>{Math.round(user.total_focus_hours)}h</span>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm text-white">
                        {tab==="xp" ? user.xp.toLocaleString()
                         : tab==="heures" ? `${Math.round(user.total_focus_hours)}h`
                         : `${user.streak}j`}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {tab==="xp"?"XP":tab==="heures"?"focus":"série"}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}
