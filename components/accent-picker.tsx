"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useTheme, ACCENT_THEMES } from "@/components/theme-context"
import { Palette } from "lucide-react"

export function AccentPicker() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen]     = useState(false)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale:1.05 }}
        whileTap={{ scale:0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
        style={{
          background: `linear-gradient(135deg,${theme.primary}22,${theme.secondary}11)`,
          border:     `1px solid ${theme.primary}30`,
          color:      theme.primary,
        }}
        title="Changer la couleur d'accent">
        <div className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background:`linear-gradient(135deg,${theme.primary},${theme.secondary})` }}/>
        <span className="hidden sm:block">{theme.label}</span>
        <Palette size={12}/>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay invisible pour fermer */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>

            <motion.div
              initial={{ opacity:0, y:8, scale:0.95 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:8, scale:0.95 }}
              transition={{ type:"spring", stiffness:400, damping:28 }}
              className="absolute right-0 top-12 z-50 rounded-2xl p-4 w-56"
              style={{
                background:    "rgba(10,10,18,0.98)",
                border:        "1px solid rgba(255,255,255,0.08)",
                backdropFilter:"blur(24px)",
                boxShadow:     "0 16px 48px rgba(0,0,0,0.6)",
              }}>

              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Couleur d'accent
              </p>

              <div className="grid grid-cols-3 gap-2">
                {ACCENT_THEMES.map(t => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale:1.06 }}
                    whileTap={{ scale:0.94 }}
                    onClick={() => { setTheme(t); setOpen(false) }}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
                    style={{
                      background: theme.id===t.id
                        ? `linear-gradient(135deg,${t.primary}25,${t.secondary}15)`
                        : "rgba(255,255,255,0.03)",
                      border: theme.id===t.id
                        ? `1px solid ${t.primary}50`
                        : "1px solid rgba(255,255,255,0.06)",
                    }}>
                    {/* Cercle couleur */}
                    <div className="w-8 h-8 rounded-full relative"
                      style={{
                        background:`linear-gradient(135deg,${t.primary},${t.secondary})`,
                        boxShadow: theme.id===t.id ? `0 0 12px ${t.glow}` : "none",
                      }}>
                      {theme.id===t.id && (
                        <motion.div
                          initial={{ scale:0 }} animate={{ scale:1 }}
                          className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </motion.div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium"
                      style={{ color: theme.id===t.id ? t.primary : "rgba(255,255,255,0.4)" }}>
                      {t.emoji} {t.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Préview */}
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full w-3/5"
                    style={{ background:`linear-gradient(90deg,${theme.primary},${theme.secondary})` }}
                    layoutId="accent-preview-bar"/>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-lg"
                    style={{ background:`linear-gradient(135deg,${theme.primary},${theme.secondary})` }}/>
                  <div className="flex-1 h-2 rounded-full" style={{ background:"rgba(255,255,255,0.04)" }}/>
                  <div className="w-12 h-2 rounded-full"
                    style={{ background:`linear-gradient(90deg,${theme.primary},${theme.secondary})` }}/>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
