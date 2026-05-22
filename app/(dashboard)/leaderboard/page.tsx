"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Trophy, Flame, Clock, Crown, Medal, Award, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type LeaderUser = {
  id: string
  name: string | null
  level: number
  xp: number
  streak: number
  total_focus_hours: number
  sessions_completed: number
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)

      const { data } = await supabase
        .from("profiles")
        .select("id, name, level, xp, streak, total_focus_hours, sessions_completed")
        .order("xp", { ascending: false })
        .limit(20)
      setUsers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const myRank = users.findIndex((u) => u.id === currentUserId) + 1

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold sm:text-3xl">Classement</h1>
        <p className="text-muted-foreground mt-1">Meilleurs joueurs par XP</p>
      </motion.div>

      {myRank > 0 && (
        <GlassCard className="p-4">
          <p className="text-sm text-muted-foreground">Votre classement</p>
          <p className="text-2xl font-bold text-purple-400">#{myRank}</p>
        </GlassCard>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
              Aucun utilisateur pour l&apos;instant. Soyez le premier à gagner des XP !
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => {
                const rank = index + 1
                const isMe = user.id === currentUserId
                const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : null
                const rankGradient =
                  rank === 1 ? "from-yellow-400 to-amber-500"
                    : rank === 2 ? "from-gray-300 to-gray-400"
                      : rank === 3 ? "from-amber-600 to-orange-600"
                        : null

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={cn(
                      "flex items-center gap-4 rounded-xl px-4 py-4 transition-all",
                      isMe
                        ? "bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20"
                        : "bg-white/[0.02] hover:bg-white/[0.05]"
                    )}
                  >
                    {/* Rang */}
                    <div className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                      rankGradient ? `bg-gradient-to-br ${rankGradient}` : "bg-white/[0.08]"
                    )}>
                      {RankIcon
                        ? <RankIcon className="h-5 w-5 text-white" />
                        : <span className="text-sm font-bold">{rank}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 text-sm font-bold">
                      {(user.name ?? "U").slice(0, 2).toUpperCase()}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.name ?? "Anonyme"}</p>
                        {isMe && <span className="text-xs text-purple-400 font-medium">Vous</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">Niveau {user.level}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span>{user.streak}j</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-cyan-400" />
                        <span>{Math.round(user.total_focus_hours)}h</span>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <p className="font-bold text-sm">{user.xp.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
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
