"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { sessionTypes, createFocusSession } from "@/lib/db"
import {
  Play, Pause, RotateCcw, Maximize2, Minimize2,
  Volume2, VolumeX, Zap, Clock, Target, Edit3, Palette, Bell, BellOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BG_THEMES = [
  { id:"pink",   label:"Rose",   style:{ background:"radial-gradient(ellipse at center, #f9a8d4 0%, #fce7f3 50%, #fbcfe8 100%)" } },
  { id:"black",  label:"Noir",   style:{ background:"radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 60%, #000000 100%)" } },
  { id:"gray",   label:"Gris",   style:{ background:"radial-gradient(ellipse at center, #374151 0%, #1f2937 60%, #111827 100%)" } },
  { id:"green",  label:"Vert",   style:{ background:"radial-gradient(ellipse at center, #064e3b 0%, #022c22 60%, #011a15 100%)" } },
  { id:"blue",   label:"Bleu",   style:{ background:"radial-gradient(ellipse at center, #1e3a5f 0%, #0c1f3d 60%, #050e20 100%)" } },
  { id:"violet", label:"Violet", style:{ background:"radial-gradient(ellipse at center, #3b0764 0%, #1e0438 60%, #0d0019 100%)" } },
]

// ── Son de fin de session (Web Audio API) ────────────────────────────────────
function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

    const notes = [523.25, 659.25, 783.99, 1046.50] // Do Mi Sol Do (accord majeur)
    const times = [0, 0.18, 0.36, 0.54]

    notes.forEach((freq, i) => {
      const osc   = ctx.createOscillator()
      const gain  = ctx.createGain()
      const start = ctx.currentTime + times[i]

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type      = "sine"
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.22, start + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7)

      osc.start(start)
      osc.stop(start + 0.75)
    })

    // Petit ding final après l'accord
    const ding  = ctx.createOscillator()
    const dGain = ctx.createGain()
    ding.connect(dGain)
    dGain.connect(ctx.destination)
    ding.type = "sine"
    ding.frequency.setValueAtTime(1318.5, ctx.currentTime + 1.1)
    dGain.gain.setValueAtTime(0, ctx.currentTime + 1.1)
    dGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.14)
    dGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2)
    ding.start(ctx.currentTime + 1.1)
    ding.stop(ctx.currentTime + 2.3)
  } catch (e) {
    console.warn("Audio non disponible", e)
  }
}

// ── Son de tick (toutes les heures, optionnel) ───────────────────────────────
function playTickSound() {
  try {
    const ctx  = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch {}
}

export default function FocusPage() {
  const [selected, setSelected]         = useState(sessionTypes[0])
  const [customDuration, setCustomDuration] = useState(60)
  const [timeLeft, setTimeLeft]         = useState(sessionTypes[0].duration * 60)
  const [isRunning, setIsRunning]       = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalXpEarned, setTotalXpEarned] = useState(0)
  const [bgTheme, setBgTheme]           = useState(BG_THEMES[0])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showModeChoice, setShowModeChoice]   = useState(false)
  const [justFinished, setJustFinished]       = useState(false)
  const modeChoiceTimeout = useRef<NodeJS.Timeout>()

  const isCreative     = selected.id === "creative"
  const activeDuration = isCreative ? customDuration : selected.duration
  const totalTime      = activeDuration * 60
  const progress       = ((totalTime - timeLeft) / totalTime) * 100
  const circumference  = 2 * Math.PI * 140

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setTimeLeft((isCreative ? customDuration : selected.duration) * 60)
    setJustFinished(false)
  }, [selected.duration, isCreative, customDuration])

  const handleSelectSession = (s: typeof sessionTypes[0]) => {
    setSelected(s)
    setTimeLeft((s.id==="creative" ? customDuration : s.duration) * 60)
    setIsRunning(false)
    setShowModeChoice(false)
    setJustFinished(false)
  }

  const startHere = () => {
    setShowModeChoice(false)
    setIsRunning(true)
  }

  const startFullscreen = () => {
    setShowModeChoice(false)
    setIsRunning(true)
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
  }

  const handlePlayClick = () => {
    if (isRunning) { setIsRunning(false); return }
    clearTimeout(modeChoiceTimeout.current)
    setShowModeChoice(true)
    modeChoiceTimeout.current = setTimeout(() => setShowModeChoice(false), 4000)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
  }

  useEffect(() => {
    let id: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      id = setInterval(() => setTimeLeft(p => p - 1), 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      setJustFinished(true)

      // ── Son de fin ──
      if (notifEnabled) playCompletionSound()

      // ── Notification navigateur ──
      if (notifEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification("🎉 Session terminée !", {
          body: `Tu as complété ${activeDuration} minutes de focus. +${activeDuration * 1} XP !`,
          icon: "/favicon.ico",
        })
      }

      setSessionsCompleted(p => p + 1)
      const xp = activeDuration * 1
      setTotalXpEarned(p => p + xp)
      createFocusSession({ session_type:selected.id, duration:activeDuration, xp_earned:xp }).catch(console.error)
      setTimeout(() => { handleReset(); setJustFinished(false) }, 3000)
    }
    return () => clearInterval(id)
  }, [isRunning, timeLeft, activeDuration, selected.id, notifEnabled, handleReset])

  // Demande permission notifications au premier lancement
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // ── MODE PLEIN ÉCRAN ─────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-700"
        style={bgTheme.style}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length:5 }).map((_,i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ width:180+i*90, height:180+i*90, left:"50%", top:"50%", x:"-50%", y:"-50%", border:"1px solid rgba(255,255,255,0.04)" }}
              animate={{ rotate:360 }} transition={{ duration:20+i*5, repeat:Infinity, ease:"linear" }}/>
          ))}
          {Array.from({ length:20 }).map((_,i) => (
            <motion.div key={`p-${i}`} className="absolute w-1 h-1 rounded-full bg-white"
              style={{ left:`${5+i*4.5}%`, top:`${10+(i%6)*15}%`, opacity:0.15 }}
              animate={{ opacity:[0.05,0.35,0.05], scale:[1,1.5,1] }}
              transition={{ duration:2+Math.random()*3, repeat:Infinity, delay:Math.random()*2 }}/>
          ))}
        </div>

        {/* Message de fin en plein écran */}
        <AnimatePresence>
          {justFinished && (
            <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20"
              style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }}>
              <motion.div animate={{ scale:[1,1.15,1] }} transition={{ duration:0.6, repeat:2 }}
                className="text-8xl mb-4">🎉</motion.div>
              <div className="text-4xl font-black text-white mb-2" style={{ fontFamily:"'Sora',sans-serif" }}>Session terminée !</div>
              <div className="text-white/60 text-lg">+{activeDuration} XP gagnés</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex flex-col items-center gap-8 z-10">
          <div className="relative flex items-center justify-center" style={{ width:340, height:340 }}>
            <svg width="340" height="340" style={{ transform:"rotate(-90deg)", position:"absolute" }}>
              <circle cx="170" cy="170" r="155" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
              <motion.circle cx="170" cy="170" r="155" fill="none"
                stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={2*Math.PI*155}
                animate={{ strokeDashoffset: 2*Math.PI*155*(1-progress/100) }}
                transition={{ duration:0.5 }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div key={timeLeft} initial={{ scale:1.02 }} animate={{ scale:1 }}
                className="font-black text-white tracking-tight select-none"
                style={{ fontSize:88, fontFamily:"'Sora',sans-serif", lineHeight:1, textShadow:"0 0 60px rgba(255,255,255,0.3)" }}>
                {fmt(timeLeft)}
              </motion.div>
              <div className="mt-3 text-sm font-medium uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.4)" }}>
                Session {selected.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleReset}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.7)" }}>
              <RotateCcw size={20}/>
            </button>
            <motion.button onClick={() => setIsRunning(p => !p)}
              whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }}
              className="w-24 h-24 rounded-full flex items-center justify-center text-white"
              style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", boxShadow:"0 0 60px rgba(255,255,255,0.2)" }}>
              {isRunning ? <Pause size={36}/> : <Play size={36} style={{ marginLeft:4 }}/>}
            </motion.button>
            <button onClick={toggleFullscreen}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.7)" }}>
              <Minimize2 size={20}/>
            </button>
          </div>

          {/* Notification toggle en plein écran */}
          <button onClick={() => setNotifEnabled(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all"
            style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.6)" }}>
            {notifEnabled ? <Bell size={12}/> : <BellOff size={12}/>}
            {notifEnabled ? "Son activé" : "Son désactivé"}
          </button>

          <div className="flex items-center gap-3">
            {BG_THEMES.map(theme => (
              <button key={theme.id} onClick={() => setBgTheme(theme)}
                className="w-7 h-7 rounded-full transition-all hover:scale-125"
                style={{ ...theme.style,
                  border: bgTheme.id===theme.id ? "2.5px solid rgba(255,255,255,0.9)" : "1px solid rgba(255,255,255,0.2)",
                  transform: bgTheme.id===theme.id ? "scale(1.25)" : "scale(1)" }}/>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── VUE NORMALE ──────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <AnimatePresence>
        {isRunning && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="pointer-events-none fixed inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[150px]"/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Session Focus</h1>
          <p className="text-muted-foreground">Restez concentré et gagnez des XP</p>
        </div>
        <div className="flex items-center gap-2">

          {/* Son ambiance */}
          <Button variant="outline" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
            title={soundEnabled ? "Désactiver son" : "Activer son"}>
            {soundEnabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}
          </Button>

          {/* Notification fin de session */}
          <Button variant="outline" size="icon"
            onClick={() => setNotifEnabled(!notifEnabled)}
            className={cn("border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]",
              notifEnabled && "border-violet-500/30 text-violet-400")}
            title={notifEnabled ? "Son fin de session activé" : "Son fin de session désactivé"}>
            {notifEnabled ? <Bell className="h-4 w-4"/> : <BellOff className="h-4 w-4"/>}
          </Button>

          {/* Palette */}
          <div className="relative">
            <Button variant="outline" size="icon" onClick={() => setShowColorPicker(!showColorPicker)}
              className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
              <Palette className="h-4 w-4"/>
            </Button>
            <AnimatePresence>
              {showColorPicker && (
                <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, y:8, scale:0.95 }}
                  className="absolute right-0 top-12 z-50 rounded-2xl p-3 flex flex-col gap-2"
                  style={{ background:"rgba(15,15,25,0.95)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(20px)", minWidth:150 }}>
                  <div className="text-xs font-semibold text-white/50 mb-1">Couleur du fond</div>
                  {BG_THEMES.map(theme => (
                    <button key={theme.id} onClick={() => { setBgTheme(theme); setShowColorPicker(false) }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]">
                      <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ ...theme.style,
                        border: bgTheme.id===theme.id ? "2px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.2)" }}/>
                      <span className="text-xs text-white/70">{theme.label}</span>
                      {bgTheme.id===theme.id && <span className="text-xs text-purple-400 ml-auto">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fullscreen avec pulse */}
          <div className="relative">
            {isRunning && (
              <motion.div className="absolute inset-0 rounded-lg"
                animate={{ boxShadow:["0 0 0px rgba(139,92,246,0)","0 0 16px rgba(139,92,246,0.7)","0 0 0px rgba(139,92,246,0)"] }}
                transition={{ duration:2, repeat:Infinity }}/>
            )}
            <Button variant="outline" size="icon" onClick={toggleFullscreen}
              className={cn("border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] relative",
                isRunning && "border-purple-500/40")}
              title="Grand écran aesthetic">
              {isFullscreen ? <Minimize2 className="h-4 w-4"/> : <Maximize2 className="h-4 w-4"/>}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Types session */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="mb-4 flex flex-wrap gap-3">
        {sessionTypes.map(s => (
          <button key={s.id} onClick={() => handleSelectSession(s)}
            className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              selected.id===s.id ? `bg-gradient-to-r ${s.color} text-white shadow-lg` : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-white")}>
            <Clock className="h-4 w-4"/>
            {s.name}
            <span className="text-xs opacity-75">
              {s.id==="creative" ? `${customDuration} min` : `${s.duration} min`}
            </span>
            {s.id==="creative" && <Edit3 className="h-3 w-3 opacity-70"/>}
          </button>
        ))}
      </motion.div>

      {/* Durée créatif */}
      <AnimatePresence>
        {isCreative && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="mb-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] w-fit">
              <span className="text-sm text-white/50">Durée :</span>
              <input type="number" min={1} max={480} value={customDuration}
                onChange={e => setCustomDuration(Number(e.target.value))} disabled={isRunning}
                className="w-20 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none disabled:opacity-40"/>
              <span className="text-sm text-white/50">min</span>
              <button onClick={() => { setTimeLeft(customDuration*60); setIsRunning(false) }} disabled={isRunning}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-40">
                Appliquer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:gap-12">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2 }}>
          <GlassCard className="p-8 sm:p-12 relative" glow={isRunning ? "purple" : "none"}>

            {/* Message fin de session */}
            <AnimatePresence>
              {justFinished && (
                <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                  className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-20"
                  style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)" }}>
                  <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5, repeat:2 }}
                    className="text-5xl mb-3">🎉</motion.div>
                  <div className="text-xl font-black text-white mb-1" style={{ fontFamily:"'Sora',sans-serif" }}>
                    Session terminée !
                  </div>
                  <div className="text-sm text-yellow-400 font-semibold">+{activeDuration} XP gagnés</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center justify-center">
              <svg className="h-72 w-72 sm:h-80 sm:w-80 -rotate-90">
                <circle cx="50%" cy="50%" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
                <motion.circle cx="50%" cy="50%" r="140" fill="none"
                  stroke="url(#timerGradient)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference-(progress/100)*circumference}
                  transition={{ duration:0.5 }}/>
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7"/>
                    <stop offset="100%" stopColor="#22d3ee"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span key={timeLeft} initial={{ scale:1.05, opacity:0.8 }} animate={{ scale:1, opacity:1 }}
                  className="text-5xl font-bold tracking-tight sm:text-6xl">
                  {fmt(timeLeft)}
                </motion.span>
                <p className="mt-2 text-sm text-muted-foreground">Session {selected.name}</p>
                {notifEnabled && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-white/25">
                    <Bell size={10}/> Son activé
                  </div>
                )}
              </div>
            </div>

            {/* Contrôles */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" onClick={handleReset}
                className="h-12 w-12 rounded-full border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
                <RotateCcw className="h-5 w-5"/>
              </Button>

              {/* Bouton Play avec choix mode */}
              <div className="relative">
                <motion.button onClick={handlePlayClick}
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  className={cn("h-16 w-16 rounded-full text-white border-0 shadow-lg transition-all flex items-center justify-center",
                    isRunning ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90")}>
                  {isRunning ? <Pause className="h-6 w-6"/> : <Play className="h-6 w-6 ml-1"/>}
                </motion.button>

                <AnimatePresence>
                  {showModeChoice && (
                    <motion.div initial={{ opacity:0, y:10, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:10, scale:0.9 }}
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-52"
                      style={{ filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
                        style={{ background:"rgba(15,15,25,0.95)", borderRight:"1px solid rgba(255,255,255,0.1)", borderBottom:"1px solid rgba(255,255,255,0.1)" }}/>
                      <div className="rounded-2xl overflow-hidden"
                        style={{ background:"rgba(15,15,25,0.95)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(20px)" }}>
                        <div className="px-4 py-2 border-b border-white/[0.06]">
                          <p className="text-xs text-white/40 text-center">Comment veux-tu démarrer ?</p>
                        </div>
                        <button onClick={startHere}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-all text-left">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.2)" }}>
                            <Play size={14} className="text-purple-400 ml-0.5"/>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">Démarrer ici</div>
                            <div className="text-[10px] text-white/30">Mode normal</div>
                          </div>
                        </button>
                        <button onClick={startFullscreen}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-all text-left border-t border-white/[0.06]">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(99,102,241,0.2))", border:"1px solid rgba(139,92,246,0.3)" }}>
                            <Maximize2 size={14} className="text-purple-300"/>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">Grand écran ✨</div>
                            <div className="text-[10px] text-white/30">Mode aesthetic</div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button variant="outline" size="icon" onClick={toggleFullscreen}
                className="h-12 w-12 rounded-full border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
                <Maximize2 className="h-5 w-5"/>
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Sidebar */}
        <div className="w-full max-w-sm space-y-4">
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }}>
            <GlassCard className="p-5">
              <h3 className="mb-4 font-semibold">Progrès du jour</h3>
              <div className="space-y-4">
                {[
                  { icon:Target, color:"bg-purple-500/20", iconColor:"text-purple-400", label:"Sessions",    value:sessionsCompleted },
                  { icon:Zap,    color:"bg-cyan-500/20",   iconColor:"text-cyan-400",   label:"XP gagnés",  value:`+${totalXpEarned}`, green:true },
                  { icon:Clock,  color:"bg-amber-500/20",  iconColor:"text-amber-400",  label:"Temps focus", value:`${Math.floor(sessionsCompleted*activeDuration/60)}h ${sessionsCompleted*activeDuration%60}min` },
                ].map((s,i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                        <s.icon className={`h-5 w-5 ${s.iconColor}`}/>
                      </div>
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                    </div>
                    <span className={cn("text-xl font-bold", s.green && "text-emerald-400")}>{s.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4 }}>
            <GlassCard className="p-5">
              <h3 className="mb-4 font-semibold">Sons d'ambiance</h3>
              <div className="grid grid-cols-2 gap-2">
                {["🌧️ Pluie","☕ Café","🌲 Forêt","🌊 Océan"].map(sound => (
                  <button key={sound}
                    className="rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-white">
                    {sound}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5 }}>
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-violet-400"/>
                <h3 className="font-semibold">Son de fin</h3>
                <button onClick={() => setNotifEnabled(!notifEnabled)}
                  className={cn("ml-auto w-9 h-5 rounded-full transition-all relative flex-shrink-0",
                    notifEnabled ? "bg-violet-500" : "bg-white/[0.12]")}>
                  <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                    animate={{ left: notifEnabled ? "18px" : "2px" }} transition={{ type:"spring", stiffness:500, damping:30 }}/>
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                {notifEnabled
                  ? "Un accord musical joue à la fin de chaque session."
                  : "Le son de fin est désactivé."}
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
