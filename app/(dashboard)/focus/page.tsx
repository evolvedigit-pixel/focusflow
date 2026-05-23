"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { sessionTypes, createFocusSession } from "@/lib/db"
import {
  Play, Pause, RotateCcw, Maximize2, Minimize2,
  Volume2, VolumeX, Zap, Clock, Target, Edit3,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function FocusPage() {
  const [selectedSession, setSelectedSession] = useState(sessionTypes[0])
  const [customDuration, setCustomDuration] = useState(60)
  const [editingDuration, setEditingDuration] = useState(false)
  const [timeLeft, setTimeLeft] = useState(selectedSession.duration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalXpEarned, setTotalXpEarned] = useState(0)

  const isCreative = selectedSession.id === "creative"
  const activeDuration = isCreative ? customDuration : selectedSession.duration
  const totalTime = activeDuration * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const circumference = 2 * Math.PI * 140

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)

  const handleReset = useCallback(() => {
    setIsRunning(false)
    const dur = selectedSession.id === "creative" ? customDuration : selectedSession.duration
    setTimeLeft(dur * 60)
  }, [selectedSession.id, selectedSession.duration, customDuration])

  const handleSessionSelect = (session: typeof sessionTypes[0]) => {
    setSelectedSession(session)
    const dur = session.id === "creative" ? customDuration : session.duration
    setTimeLeft(dur * 60)
    setIsRunning(false)
    setEditingDuration(false)
  }

  const handleApplyCustomDuration = () => {
    if (customDuration < 1) setCustomDuration(1)
    if (customDuration > 480) setCustomDuration(480)
    setTimeLeft(customDuration * 60)
    setIsRunning(false)
    setEditingDuration(false)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      setSessionsCompleted((prev) => prev + 1)
      const xpEarned = Math.round(activeDuration * 2.5)
      setTotalXpEarned((prev) => prev + xpEarned)
      createFocusSession({
        session_type: selectedSession.id,
        duration: activeDuration,
        xp_earned: xpEarned,
      }).catch(console.error)
      handleReset()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, activeDuration, selectedSession.id, handleReset])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[150px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Session Focus</h1>
          <p className="text-muted-foreground">Restez concentré et gagnez des XP</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      {/* Sélecteur de type de session */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 flex flex-wrap gap-3"
      >
        {sessionTypes.map((session) => (
          <button
            key={session.id}
            onClick={() => handleSessionSelect(session)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              selectedSession.id === session.id
                ? `bg-gradient-to-r ${session.color} text-white shadow-lg`
                : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-white"
            )}
          >
            <Clock className="h-4 w-4" />
            {session.name}
            <span className="text-xs opacity-75">
              {session.id === "creative" ? `${customDuration} min` : `${session.duration} min`}
            </span>
            {session.id === "creative" && (
              <Edit3 className="h-3 w-3 opacity-70" />
            )}
          </button>
        ))}
      </motion.div>

      {/* Champ durée personnalisée pour Créatif */}
      <AnimatePresence>
        {isCreative && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] w-fit">
              <span className="text-sm text-white/50">Durée personnalisée :</span>
              <input
                type="number"
                min={1}
                max={480}
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                disabled={isRunning}
                className="w-20 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:border-amber-500/50 disabled:opacity-40"
              />
              <span className="text-sm text-white/50">min</span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleApplyCustomDuration}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 transition-all"
              >
                Appliquer
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minuteur principal */}
      <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:gap-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <GlassCard className="p-8 sm:p-12" glow={isRunning ? "purple" : "none"}>
            <div className="relative flex items-center justify-center">
              <svg className="h-72 w-72 sm:h-80 sm:w-80 -rotate-90">
                <circle
                  cx="50%" cy="50%" r="140"
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"
                />
                <motion.circle
                  cx="50%" cy="50%" r="140"
                  fill="none" stroke="url(#timerGradient)" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (progress / 100) * circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={timeLeft}
                  initial={{ scale: 1.05, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold tracking-tight sm:text-6xl"
                >
                  {formatTime(timeLeft)}
                </motion.span>
                <p className="mt-2 text-sm text-muted-foreground">
                  Session {selectedSession.name}
                  {isCreative && <span className="ml-1 text-amber-400">· {customDuration} min</span>}
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="h-12 w-12 rounded-full border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                onClick={isRunning ? handlePause : handleStart}
                className={cn(
                  "h-16 w-16 rounded-full text-white border-0 shadow-lg transition-all",
                  isRunning
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90"
                )}
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>

              <div className="h-12 w-12" />
            </div>
          </GlassCard>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-5">
              <h3 className="mb-4 font-semibold">Progrès du jour</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                      <Target className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Sessions</span>
                  </div>
                  <span className="text-xl font-bold">{sessionsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
                      <Zap className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">XP gagnés</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">+{totalXpEarned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-sm text-muted-foreground">Temps de focus</span>
                  </div>
                  <span className="text-xl font-bold">
                    {Math.floor((sessionsCompleted * activeDuration) / 60)}h{" "}
                    {(sessionsCompleted * activeDuration) % 60} min
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard className="p-5">
              <h3 className="mb-4 font-semibold">Sons d&apos;ambiance</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Pluie", "Café", "Forêt", "Océan"].map((sound) => (
                  <button
                    key={sound}
                    className="rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-white"
                  >
                    {sound}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard className="p-5">
              <h3 className="mb-2 font-semibold">Conseil focus</h3>
              <p className="text-sm text-muted-foreground">
                Désactivez les notifications et fermez les onglets inutiles pour minimiser les distractions pendant votre session.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
