"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { xpForLevel } from "@/lib/db"

// Stocke le niveau précédent pour détecter un level up
let prevLevel: number | null = null

export function LevelUpNotification() {
  const [show, setShow]       = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const [particles, setParticles] = useState<{id:number;x:number;y:number;color:string}[]>([])

  useEffect(() => {
    const supabase = createClient()

    // Vérifier le niveau toutes les 10s
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("profiles").select("level").eq("id", user.id).single()
      if (!profile) return

      const currentLevel = profile.level ?? 1

      if (prevLevel !== null && currentLevel > prevLevel) {
        // LEVEL UP !
        setNewLevel(currentLevel)
        setParticles(Array.from({ length:20 }, (_, i) => ({
          id: i,
          x: Math.random() * 400 - 200,
          y: Math.random() * -300 - 50,
          color: ["#a855f7","#06b6d4","#22c55e","#f59e0b","#ec4899","#ffffff"][Math.floor(Math.random()*6)],
        })))
        setShow(true)
        setTimeout(() => setShow(false), 5000)
      }

      prevLevel = currentLevel
    }, 10000)

    // Init
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from("profiles").select("level").eq("id", user.id).single()
        .then(({ data }) => { prevLevel = data?.level ?? 1 })
    })

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          exit={{ opacity:0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">

          {/* Fond flash */}
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:[0, 0.15, 0] }}
            transition={{ duration:1 }}
            className="absolute inset-0"
            style={{ background:"radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}/>

          {/* Particules */}
          {particles.map(p => (
            <motion.div key={p.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor:p.color, left:"50%", top:"50%" }}
              initial={{ x:0, y:0, scale:1, opacity:1 }}
              animate={{ x:p.x, y:p.y, scale:0, opacity:0 }}
              transition={{ duration:1.5, ease:"easeOut", delay:Math.random()*0.3 }}/>
          ))}

          {/* Carte level up */}
          <motion.div
            initial={{ scale:0.5, y:40, opacity:0 }}
            animate={{ scale:1, y:0, opacity:1 }}
            exit={{ scale:0.9, y:-20, opacity:0 }}
            transition={{ type:"spring", stiffness:400, damping:25, delay:0.1 }}
            className="relative rounded-2xl px-10 py-8 text-center pointer-events-auto"
            style={{
              background:"linear-gradient(135deg,rgba(15,15,25,0.98),rgba(10,10,18,0.98))",
              border:"1px solid rgba(168,85,247,0.4)",
              boxShadow:"0 0 60px rgba(168,85,247,0.3), 0 32px 80px rgba(0,0,0,0.8)",
              backdropFilter:"blur(24px)",
            }}>

            {/* Halo */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <motion.div
                animate={{ rotate:360 }}
                transition={{ duration:8, repeat:Infinity, ease:"linear" }}
                className="absolute -inset-4 rounded-full opacity-20"
                style={{ background:"conic-gradient(from 0deg,transparent,#a855f7,transparent,#06b6d4,transparent)" }}/>
            </div>

            {/* Étoiles décoratives */}
            {["✨","⭐","💫"].map((star,i) => (
              <motion.div key={i}
                className="absolute text-2xl"
                style={{ top:i===0?"-12px":i===1?"auto":"-8px", bottom:i===1?"-12px":"auto",
                  left:i===0?"-12px":i===2?"auto":"auto", right:i===2?"-12px":"auto" }}
                animate={{ rotate:[0,20,-20,0], scale:[1,1.2,1] }}
                transition={{ duration:2, repeat:Infinity, delay:i*0.3 }}>
                {star}
              </motion.div>
            ))}

            <motion.div
              animate={{ y:[0,-8,0] }}
              transition={{ duration:1.5, repeat:Infinity }}
              className="text-7xl mb-4 relative z-10">
              🏆
            </motion.div>

            <div className="relative z-10">
              <div className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color:"rgba(168,85,247,0.7)" }}>
                Level Up !
              </div>
              <div className="text-4xl font-black text-white mb-1"
                style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-1px",
                  textShadow:"0 0 30px rgba(168,85,247,0.5)" }}>
                Niveau {newLevel}
              </div>
              <div className="text-sm text-white/50 mb-4">
                Tu es passé au niveau {newLevel} ! Bravo 🎉
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background:"linear-gradient(135deg,rgba(168,85,247,0.2),rgba(99,102,241,0.1))",
                  border:"1px solid rgba(168,85,247,0.3)", color:"#c4b5fd" }}>
                Prochain niveau dans {xpForLevel(newLevel)} XP
              </div>
            </div>

            <motion.button
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => setShow(false)}
              className="mt-5 px-6 py-2.5 rounded-xl text-sm font-bold text-white relative z-10"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 4px 16px rgba(124,58,237,0.4)" }}>
              Continuer 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
