"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, CheckCircle2, Flame, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Toast = {
  id: string
  type: "xp" | "session" | "task" | "streak"
  message: string
  value?: number
}

export function XPToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Écoute les nouvelles sessions focus
      const sessionChannel = supabase
        .channel("focus-sessions-toast")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "focus_sessions", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const xp = payload.new.xp_earned
            const duration = payload.new.duration
            addToast({
              type: "session",
              message: `Session de ${duration} min terminée !`,
              value: xp,
            })
          }
        )
        .subscribe()

      // Écoute les tâches complétées
      const todoChannel = supabase
        .channel("todos-toast")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "todos", filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.new.completed && !payload.old.completed) {
              addToast({
                type: "task",
                message: `Tâche accomplie !`,
                value: payload.new.xp_reward,
              })
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(sessionChannel)
        supabase.removeChannel(todoChannel)
      }
    }

    init()
  }, [])

  const icons = {
    xp: <Zap className="h-4 w-4 text-yellow-400" />,
    session: <Flame className="h-4 w-4 text-orange-400" />,
    task: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    streak: <Trophy className="h-4 w-4 text-purple-400" />,
  }

  const colors = {
    xp: "border-yellow-500/30 from-yellow-500/10",
    session: "border-orange-500/30 from-orange-500/10",
    task: "border-green-500/30 from-green-500/10",
    streak: "border-purple-500/30 from-purple-500/10",
  }

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${colors[toast.type]} to-transparent backdrop-blur-md shadow-xl`}
            style={{ minWidth: "220px" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] flex-shrink-0">
              {icons[toast.type]}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{toast.message}</p>
              {toast.value && (
                <p className="text-xs text-yellow-400 font-bold">+{toast.value} XP</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
