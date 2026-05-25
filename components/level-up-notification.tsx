"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Trophy, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type LevelUpEvent = {
  oldLevel: number
  newLevel: number
}

function Confetti() {
  const colors = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#ef4444", "#ffffff"]
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: p.rotation * 3 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  )
}

export function LevelUpNotification() {
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const prevLevelRef = useRef<number | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("level")
        .eq("id", user.id)
        .single()

      if (data) prevLevelRef.current = data.level

      // Écoute les changements en temps réel
      const channel = supabase
        .channel("profile-level")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const newLevel = payload.new.level
            const oldLevel = prevLevelRef.current

            if (oldLevel !== null && newLevel > oldLevel) {
              setLevelUp({ oldLevel, newLevel })
              setShowConfetti(true)
              prevLevelRef.current = newLevel

              setTimeout(() => setShowConfetti(false), 4000)
              setTimeout(() => setLevelUp(null), 5000)
            } else {
              prevLevelRef.current = newLevel
            }
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    init()
  }, [])

  return (
    <>
      {showConfetti && <Confetti />}
      <AnimatePresence>
        {levelUp && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[99] pointer-events-none"
          >
            <div
              className="flex items-center gap-4 px-8 py-5 rounded-2xl border border-yellow-400/30 shadow-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(139,92,246,0.15) 100%)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 40px rgba(234,179,8,0.3), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Icône animée */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/40"
              >
                <Trophy className="h-7 w-7 text-white" />
              </motion.div>

              {/* Texte */}
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-medium text-yellow-400/80 uppercase tracking-widest mb-0.5"
                >
                  Niveau supérieur !
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-black text-white"
                >
                  Niveau {levelUp.newLevel} atteint 🎉
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-white/50"
                >
                  Continuez comme ça, vous êtes en feu !
                </motion.p>
              </div>

              {/* Étoiles décoratives */}
              <div className="flex flex-col gap-1 ml-2">
                {[...Array(levelUp.newLevel > 5 ? 5 : levelUp.newLevel)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
