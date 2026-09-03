"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const INTENTIONS = [
  "Terminer mon chapitre de révision",
  "Faire 30 minutes de sport",
  "Lire 10 pages de mon livre",
  "Finir le projet en cours",
  "Préparer mes cours de demain",
  "Méditer 10 minutes",
]

const GREETINGS = [
  "Bonne matinée ☀️",
  "Bonjour ! ✨",
  "C'est parti 🚀",
  "Nouvelle journée 🌅",
]

function getTodayKey() {
  return `focusflow_morning_${new Date().toISOString().split("T")[0]}`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
  return "Bon après-midi 🌤️"
}

export function MorningPopup() {
  const [visible, setVisible]         = useState(false)
  const [intention, setIntention]     = useState("")
  const [saved, setSaved]             = useState(false)
  const [userName, setUserName]       = useState("")
  const [step, setStep]               = useState<"question"|"done">("question")

  useEffect(() => {
    // N'afficher qu'une fois par jour
    const key = getTodayKey()
    if (localStorage.getItem(key)) return

    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("profiles").select("name, full_name").eq("id", user.id).single()
      const name = profile?.name ?? profile?.full_name ?? ""
      setUserName(name.split(" ")[0])
      // Afficher après 1.5s
      setTimeout(() => setVisible(true), 1500)
    }
    check()
  }, [])

  async function handleSave() {
    if (!intention.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Sauvegarder comme note dans journal
    await supabase.from("journal_entries").insert({
      user_id:  user.id,
      title:    `Intention du ${new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}`,
      content:  intention,
      category: "apprentissage",
      mood:     "bien",
      color:    "#fef08a",
    })

    localStorage.setItem(getTodayKey(), "done")
    setSaved(true)
    setStep("done")
    setTimeout(() => setVisible(false), 2500)
  }

  function handleSkip() {
    localStorage.setItem(getTodayKey(), "skipped")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}>

          <motion.div
            initial={{ scale:0.85, y:30, opacity:0 }}
            animate={{ scale:1, y:0, opacity:1 }}
            exit={{ scale:0.9, y:20, opacity:0 }}
            transition={{ type:"spring", stiffness:400, damping:28 }}
            className="w-full max-w-md rounded-2xl relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(24px)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>

            {/* Halo */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle,rgba(124,58,237,0.2),transparent 70%)", filter:"blur(20px)" }}/>

            {/* Bouton fermer */}
            <button onClick={handleSkip}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.08] transition-all z-10">
              <X className="h-4 w-4"/>
            </button>

            <AnimatePresence mode="wait">
              {step === "question" ? (
                <motion.div key="question" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="p-8">
                  {/* Icône + salutation */}
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div animate={{ rotate:[0,10,-10,0] }} transition={{ duration:1, delay:0.5 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 20px rgba(124,58,237,0.4)" }}>
                      <Sparkles className="h-6 w-6 text-white"/>
                    </motion.div>
                    <div>
                      <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{getGreeting()}</div>
                      <div className="font-black text-white text-lg" style={{ fontFamily:"'Sora',sans-serif" }}>
                        {userName ? `${userName} !` : "Bonjour !"}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
                    Quelle est ton intention principale aujourd'hui ?
                  </h2>
                  <p className="text-sm text-white/40 mb-6 leading-relaxed">
                    Une seule chose. Celle qui compte vraiment. Si tu ne fais que ça aujourd'hui, la journée est réussie.
                  </p>

                  {/* Input */}
                  <div className="relative mb-4">
                    <textarea value={intention} onChange={e => setIntention(e.target.value)}
                      placeholder="Ex : Terminer le chapitre 3 de maths..."
                      rows={3} autoFocus
                      onKeyDown={e => { if (e.key==="Enter" && e.metaKey) handleSave() }}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none transition-colors"
                      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(139,92,246,0.3)" }}/>
                    <div className="absolute bottom-2 right-3 text-[10px] text-white/20">⌘↵ pour valider</div>
                  </div>

                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {INTENTIONS.map((s,i) => (
                      <button key={i} onClick={() => setIntention(s)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                        style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.15)", color:"rgba(167,139,250,0.8)" }}>
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                      onClick={handleSave} disabled={!intention.trim()}
                      className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                      style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 8px 24px rgba(124,58,237,0.35)" }}>
                      Commencer la journée <ArrowRight className="h-4 w-4"/>
                    </motion.button>
                    <button onClick={handleSkip}
                      className="px-4 h-12 rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors">
                      Passer
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="done" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                  className="p-8 text-center">
                  <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5 }}
                    className="text-5xl mb-4">🔥</motion.div>
                  <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily:"'Sora',sans-serif" }}>
                    Intention enregistrée !
                  </h3>
                  <p className="text-sm text-white/50">Bonne journée. Tu peux le faire.</p>
                  <div className="mt-4 px-4 py-3 rounded-xl text-sm font-medium text-violet-300 italic"
                    style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)" }}>
                    « {intention} »
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
