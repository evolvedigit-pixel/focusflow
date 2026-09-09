// ── 1. COMPOSANT LEVEL UP POPUP ──────────────────────────────────────────────
// Fichier : components/level-up-popup.tsx

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { xpForLevel } from "@/lib/db"

interface LevelUpPopupProps {
  newLevel: number
  onClose: () => void
}

export function LevelUpPopup({ newLevel, onClose }: LevelUpPopupProps) {
  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 500,
      y: -(Math.random() * 400 + 100),
      color: ["#a855f7","#06b6d4","#22c55e","#f59e0b","#ec4899","#ffffff","#fbbf24"][Math.floor(Math.random()*7)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.4,
    }))
  )

  // Fermeture auto après 6s
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}>

        {/* Particules */}
        {particles.map(p => (
          <motion.div key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{ width: p.size, height: p.size, background: p.color, left: "50%", top: "50%" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: p.delay }}/>
        ))}

        {/* Carte */}
        <motion.div
          initial={{ scale: 0.4, y: 60, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: -30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.1 }}
          onClick={e => e.stopPropagation()}
          className="relative rounded-3xl px-12 py-10 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg,rgba(12,12,22,0.99),rgba(8,8,16,0.99))",
            border: "1px solid rgba(168,85,247,0.5)",
            boxShadow: "0 0 80px rgba(168,85,247,0.35), 0 40px 100px rgba(0,0,0,0.9)",
            minWidth: 340,
          }}>

          {/* Halo rotatif */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 opacity-15"
              style={{ background: "conic-gradient(from 0deg,transparent 0%,#a855f7 25%,transparent 50%,#06b6d4 75%,transparent 100%)" }}/>
          </div>

          {/* Étoiles décoratives */}
          {["✨","⭐","💫"].map((s, i) => (
            <motion.div key={i}
              className="absolute text-xl pointer-events-none"
              style={{
                top:  i === 1 ? "auto" : i === 0 ? 16 : 20,
                bottom: i === 1 ? 16 : "auto",
                left:  i === 0 ? 20 : i === 2 ? "auto" : "50%",
                right: i === 2 ? 20 : "auto",
              }}
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}>
              {s}
            </motion.div>
          ))}

          {/* Trophée */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 text-7xl mb-5 select-none">
            🏆
          </motion.div>

          {/* Texte */}
          <div className="relative z-10 space-y-2 mb-6">
            <div className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: "rgba(168,85,247,0.7)" }}>
              Level Up !
            </div>
            <motion.div
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
              className="text-5xl font-black text-white"
              style={{ fontFamily: "'Sora',sans-serif", letterSpacing: "-2px",
                textShadow: "0 0 40px rgba(168,85,247,0.6)" }}>
              Niveau {newLevel}
            </motion.div>
            <div className="text-white/50 text-sm">
              Félicitations, tu passes au niveau {newLevel} ! 🎉
            </div>
          </div>

          {/* XP prochain niveau */}
          <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-6"
            style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", color: "#c4b5fd" }}>
            ⚡ Prochain niveau dans {xpForLevel(newLevel)} XP
          </div>

          {/* Bouton */}
          <div className="relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
              Continuer 🚀
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
