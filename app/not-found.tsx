"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background:"#09090b" }}>

      {/* Halos */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/12 blur-[120px]"/>
        <div className="absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/08 blur-[100px]"/>
      </div>

      {/* Grille déco */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{ backgroundImage:"linear-gradient(rgba(139,92,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,1) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>

      <div className="relative z-10 text-center max-w-lg mx-auto">

        {/* Logo */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          className="flex items-center justify-center gap-2.5 mb-12">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-all group-hover:scale-105"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 20px rgba(124,58,237,0.4)" }}>
              <Sparkles className="h-4 w-4 text-white"/>
            </div>
            <span className="text-lg font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>FocusFlow</span>
          </Link>
        </motion.div>

        {/* 404 géant */}
        <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
          transition={{ type:"spring", stiffness:300, damping:24 }}
          className="relative mb-6">
          <div className="font-black text-center select-none"
            style={{ fontSize:"clamp(100px,20vw,180px)", lineHeight:1, fontFamily:"'Sora',sans-serif",
              background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(99,102,241,0.1))",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              filter:"drop-shadow(0 0 40px rgba(139,92,246,0.2))" }}>
            404
          </div>
          {/* Astronaute flottant */}
          <motion.div
            animate={{ y:[0,-12,0], rotate:[-3,3,-3] }}
            transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none select-none"
            style={{ filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}>
            🧑‍🚀
          </motion.div>
        </motion.div>

        {/* Texte */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
          <h1 className="text-2xl font-black text-white mb-3" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            Page introuvable
          </h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Cette page semble avoir dérivé dans l'espace. Elle n'existe pas ou a été déplacée.
          </p>
        </motion.div>

        {/* Boutons */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard">
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 8px 24px rgba(124,58,237,0.35)" }}>
              <Home className="h-4 w-4"/> Retour au dashboard
            </motion.button>
          </Link>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => window.history.back()}
            className="flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-medium text-white/50 transition-all hover:text-white/80"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft className="h-4 w-4"/> Page précédente
          </motion.button>
        </motion.div>

        {/* Citation du bas */}
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="mt-12 text-xs text-white/15 italic">
          « Même les explorateurs se perdent parfois. »
        </motion.p>
      </div>
    </div>
  )
}
