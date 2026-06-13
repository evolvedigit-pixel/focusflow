"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { Flame, Trophy, Brain, BarChart3, Calendar, CheckSquare, Timer, Sparkles, ArrowRight, Star, Check, X } from "lucide-react"

// ─── Composant étoiles canvas ───────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016
      stars.forEach((s) => {
        const alpha = 0.08 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(148,163,184,${alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// ─── Dashboard card 3D interactive ──────────────────────────────────────────
function Dashboard3DCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const bars = [40, 68, 52, 94, 63, 28, 18]
  const days = ["L", "M", "M", "J", "V", "S", "D"]

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-[600px] mx-auto cursor-default"
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 40, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 12 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Glow derrière */}
        <div
          className="absolute -inset-1 rounded-2xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.5), transparent 70%)", zIndex: -1 }}
        />

        {/* Card body */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{
            background: "#0D1424",
            borderColor: "rgba(99,102,241,0.3)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7), inset 0 0.5px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Barre de titre mac-style */}
          <div className="h-8 flex items-center px-4 gap-2" style={{ background: "#080D1A", borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-3 text-[10px]" style={{ color: "#374151" }}>focusflow.app/dashboard</span>
          </div>

          {/* Contenu dashboard */}
          <div className="grid" style={{ gridTemplateColumns: "140px 1fr" }}>
            {/* Sidebar mini */}
            <div className="p-3 border-r" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
              <div className="text-[10px] font-bold mb-3" style={{ color: "#818CF8", fontFamily: "'Sora', sans-serif" }}>FocusFlow</div>
              {[
                { icon: "⊞", label: "Dashboard", active: true },
                { icon: "▷", label: "Focus" },
                { icon: "📅", label: "Planner" },
                { icon: "✓", label: "Tâches" },
                { icon: "🏆", label: "Classement" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[9px] mb-0.5"
                  style={{
                    background: item.active ? "rgba(99,102,241,0.12)" : "transparent",
                    color: item.active ? "#A5B4FC" : "#374151",
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
              {/* XP bar mini */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex justify-between text-[8px] mb-1" style={{ color: "#374151" }}>
                  <span>XP</span><span>6 200/10k</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: "rgba(99,102,241,0.15)" }}>
                  <div className="h-full rounded-full" style={{ width: "62%", background: "#6366F1" }} />
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="p-3">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { val: "47h", label: "Focus" },
                  { val: "183", label: "Sessions" },
                  { val: "94%", label: "Réussite", green: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-md p-2" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.05)" }}>
                    <div className="text-sm font-bold" style={{ fontFamily: "'Sora',sans-serif", color: s.green ? "#10B981" : "#F8FAFC" }}>{s.val}</div>
                    <div className="text-[8px] mt-0.5" style={{ color: "#374151" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Graphique barres */}
              <div className="rounded-lg p-2 mb-2" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.04)" }}>
                <div className="text-[8px] mb-2" style={{ color: "#374151" }}>Activité / semaine</div>
                <div className="flex items-end gap-1" style={{ height: 52 }}>
                  {bars.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ background: i === 3 ? "#6366F1" : `rgba(99,102,241,${0.15 + h * 0.003})` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ))}
                </div>
                <div className="flex gap-1 mt-1">
                  {days.map((d) => (
                    <div key={d} className="flex-1 text-center text-[7px]" style={{ color: "#374151" }}>{d}</div>
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="rounded-lg p-2 flex items-center gap-2" style={{ background: "rgba(99,102,241,0.08)", border: "0.5px solid rgba(99,102,241,0.2)" }}>
                <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                  <motion.circle
                    cx="18" cy="18" r="14" fill="none" stroke="#6366F1" strokeWidth="2.5"
                    strokeDasharray="88" strokeLinecap="round"
                    initial={{ strokeDashoffset: 88 }}
                    animate={{ strokeDashoffset: 22 }}
                    transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div>
                  <div className="text-sm font-bold" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>18:32</div>
                  <div className="text-[8px]" style={{ color: "#6366F1" }}>Bloc 3/4 · Pomodoro</div>
                </div>
                <div className="ml-auto rounded px-2 py-1 text-[8px] font-semibold text-white" style={{ background: "#6366F1" }}>Pause</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Carte flottante ─────────────────────────────────────────────────────────
function FloatCard({
  children, delay = 0, className = "", style = {}
}: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`absolute rounded-xl px-3 py-2.5 text-sm ${className}`}
      style={{
        background: "#0D1424",
        border: "0.5px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── Compteur animé ───────────────────────────────────────────────────────────
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const dur = 2000
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    const t = setTimeout(() => requestAnimationFrame(tick), 400)
    return () => clearTimeout(t)
  }, [to])
  const display = val >= 1000 ? (val / 1000).toFixed(1) + "k" : val.toString()
  return <span>{display}{suffix}</span>
}

// ─── Section feature bento ────────────────────────────────────────────────────
function BentoCard({
  icon: Icon, title, desc, pro = false, wide = false, children,
  iconBg = "rgba(99,102,241,0.1)", iconColor = "#818CF8",
}: {
  icon: React.ElementType; title: string; desc: string; pro?: boolean
  wide?: boolean; children?: React.ReactNode
  iconBg?: string; iconColor?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
      className={`rounded-2xl p-6 ${wide ? "col-span-2" : ""}`}
      style={{ background: "#0D1424", border: "0.5px solid rgba(255,255,255,0.07)", transition: "border-color 0.3s" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: iconBg }}>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div className="text-[15px] font-bold mb-1.5" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>{title}</div>
      <div className="text-[13px] leading-relaxed" style={{ color: "#475569" }}>{desc}</div>
      {pro && (
        <span className="inline-block mt-3 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "0.5px solid rgba(99,102,241,0.25)" }}>
          Premium
        </span>
      )}
      {children}
    </motion.div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const bars = [38, 62, 48, 88, 71, 55, 30]
  const days = ["L", "M", "M", "J", "V", "S", "D"]

  return (
    <div style={{ background: "#060912", color: "#F8FAFC", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-8 py-4 relative z-20" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div className="text-xl font-black tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
          Focus<span style={{ color: "#6366F1" }}>Flow</span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {["Fonctionnalités", "Tarifs", "Avis"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm transition-colors" style={{ color: "#64748B" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F8FAFC")}
              onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}>{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login">
            <button className="px-4 py-2 text-sm rounded-lg transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "#CBD5E1", border: "0.5px solid rgba(255,255,255,0.1)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
              Connexion
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-4 py-2 text-sm font-semibold rounded-lg transition-all" style={{ background: "#6366F1", color: "#fff", border: "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#4F46E5")}
              onMouseLeave={e => (e.currentTarget.style.background = "#6366F1")}>
              Commencer — gratuit
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[620px] flex flex-col items-center justify-center text-center px-6 pt-16 pb-8 overflow-hidden">
        <StarField />

        {/* Glow central */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12), transparent 70%)", zIndex: 1 }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ position: "relative", zIndex: 2 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium"
            style={{ background: "rgba(99,102,241,0.1)", border: "0.5px solid rgba(99,102,241,0.4)", color: "#A5B4FC" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Bêta publique · 2 400+ utilisateurs actifs
          </div>

          {/* H1 */}
          <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tight mb-5"
            style={{ fontFamily: "'Sora',sans-serif" }}>
            Travaillez avec{" "}
            <span style={{ background: "linear-gradient(135deg,#818CF8,#6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              focus.
            </span>
            <br />
            Progressez{" "}
            <span style={{ background: "linear-gradient(135deg,#34D399,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              chaque jour.
            </span>
          </h1>

          <p className="text-base max-w-md mx-auto mb-10 leading-relaxed" style={{ color: "#64748B" }}>
            Sessions chronométrées, tâches prioritisées, XP gagné à chaque effort. La productivité qui ressemble à un jeu.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap mb-14">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.04, background: "#4F46E5" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white"
                style={{ background: "#6366F1", border: "none" }}
              >
                Créer mon compte gratuit
                <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link href="#fonctionnalités">
              <motion.button
                whileHover={{ background: "rgba(255,255,255,0.08)" }}
                className="px-6 py-4 text-base font-medium rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", color: "#94A3B8", border: "0.5px solid rgba(255,255,255,0.12)" }}
              >
                Voir les fonctionnalités →
              </motion.button>
            </Link>
          </div>

          {/* Proof stats */}
          <div className="flex items-center justify-center gap-10 flex-wrap pb-6" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
            {[
              { to: 2400, suffix: "+", label: "utilisateurs actifs" },
              { to: 184000, suffix: "", label: "heures de focus" },
              { to: 940000, suffix: "", label: "tâches complétées" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>
                  <Counter to={s.to} suffix={s.suffix} />
                </div>
                <div className="text-xs mt-1" style={{ color: "#475569" }}>{s.label}</div>
              </div>
            ))}
            <div className="text-center">
              <div className="text-2xl font-black" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>4.9 ★</div>
              <div className="text-xs mt-1" style={{ color: "#475569" }}>note moyenne</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── DASHBOARD 3D ── */}
      <section className="px-6 pb-20 relative">
        <div className="relative max-w-3xl mx-auto">
          {/* Float card : niveau */}
          <FloatCard delay={1.2} style={{ left: "-2%", top: "15%", zIndex: 10 }}>
            <div className="text-[9px] mb-1" style={{ color: "#475569" }}>Niveau actuel</div>
            <div className="text-base font-black" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>Niv. 7</div>
            <div className="mt-1.5 h-1 w-20 rounded-full" style={{ background: "rgba(99,102,241,0.15)" }}>
              <div className="h-full rounded-full" style={{ width: "62%", background: "#6366F1" }} />
            </div>
            <div className="text-[9px] mt-1" style={{ color: "#10B981" }}>6 200 / 10 000 XP</div>
          </FloatCard>

          {/* Float card : streak */}
          <FloatCard delay={1.5} style={{ right: "-2%", top: "20%", zIndex: 10 }}>
            <div className="text-[9px] mb-1" style={{ color: "#475569" }}>Streak actuel</div>
            <div className="flex items-center gap-1.5">
              <Flame size={16} style={{ color: "#F59E0B" }} />
              <span className="text-base font-black" style={{ fontFamily: "'Sora',sans-serif", color: "#F59E0B" }}>12 jours</span>
            </div>
            <div className="text-[9px] mt-1" style={{ color: "#475569" }}>Record: 18 jours</div>
          </FloatCard>

          {/* Float card : XP mensuel */}
          <FloatCard delay={1.8} style={{ left: "5%", bottom: "10%", zIndex: 10 }}>
            <div className="text-[9px] mb-1" style={{ color: "#475569" }}>Ce mois</div>
            <div className="text-base font-black" style={{ fontFamily: "'Sora',sans-serif", color: "#10B981" }}>+2 380 XP</div>
            <div className="text-[9px] mt-1" style={{ color: "#6366F1" }}>Top 5% des utilisateurs</div>
          </FloatCard>

          <Dashboard3DCard />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" className="px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#6366F1" }}>Fonctionnalités</div>
          <h2 className="text-4xl font-black tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>Tout pour performer.</h2>
          <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed" style={{ color: "#475569" }}>
            Un écosystème conçu pour les personnes qui prennent leur temps au sérieux.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
          <BentoCard icon={Timer} title="Sessions focus" desc="Timer Pomodoro avec suivi automatique, gains d'XP et historique complet de vos sessions.">
            {/* Mini pomodoro */}
            <div className="mt-4 flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                <motion.circle cx="20" cy="20" r="16" fill="none" stroke="#6366F1" strokeWidth="2.5"
                  strokeDasharray="100.5" strokeLinecap="round"
                  initial={{ strokeDashoffset: 100.5 }}
                  animate={{ strokeDashoffset: 25 }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }} />
              </svg>
              <div>
                <div className="text-sm font-bold" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>18:32</div>
                <div className="flex gap-1 mt-1">
                  {[true, true, true, false].map((done, i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: done ? "#6366F1" : "rgba(99,102,241,0.2)" }} />
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard icon={CheckSquare} title="Gestion des tâches" desc="Priorisez, catégorisez, complétez. Chaque tâche terminée vous rapproche du prochain niveau."
            iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />

          <BentoCard icon={Trophy} title="Classement global" desc="Comparez vos performances avec d'autres utilisateurs et grimpez dans le top mondial."
            iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />

          {/* Wide card analytics */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
              className="rounded-2xl p-6 h-full"
              style={{ background: "#0D1424", border: "0.5px solid rgba(255,255,255,0.07)", transition: "border-color 0.3s" }}
            >
              <div className="flex gap-6 items-start">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(99,102,241,0.1)" }}>
                    <BarChart3 size={18} style={{ color: "#818CF8" }} />
                  </div>
                  <div className="text-[15px] font-bold mb-1.5" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>Analytics avancés</div>
                  <div className="text-[13px] leading-relaxed" style={{ color: "#475569" }}>Rapports hebdomadaires, tendances 30 jours, score de productivité personnalisé basé sur vos vraies données.</div>
                  <span className="inline-block mt-3 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "0.5px solid rgba(99,102,241,0.25)" }}>Premium</span>
                </div>
                <div className="flex-1 pt-1 hidden md:block">
                  <div className="flex items-end gap-1.5" style={{ height: 56 }}>
                    {bars.map((h, i) => (
                      <motion.div key={i} className="flex-1 rounded-sm"
                        style={{ background: i === 3 ? "#6366F1" : `rgba(99,102,241,${0.15 + h * 0.004})` }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.07 }} />
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {days.map((d) => (
                      <div key={d} className="flex-1 text-center text-[8px]" style={{ color: "#374151" }}>{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <BentoCard icon={Brain} title="Coach IA" desc="Recommandations personnalisées basées sur vos patterns de productivité réels." pro
            iconBg="rgba(99,102,241,0.1)" iconColor="#818CF8" />

          <BentoCard icon={Calendar} title="Planificateur" desc="Visualisez et bloquez votre semaine du lundi au dimanche."
            iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />

          <BentoCard icon={Sparkles} title="Système XP & niveaux" desc="Montez de niveau, débloquez des badges, et rendez l'effort visible."
            iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" className="px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#6366F1" }}>Tarifs</div>
          <h2 className="text-4xl font-black tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>Simple et transparent.</h2>
          <p className="mt-3 max-w-sm mx-auto text-sm" style={{ color: "#475569" }}>Commencez gratuitement. Passez premium quand vous êtes prêt.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
          {/* Free */}
          <motion.div whileHover={{ y: -4 }} className="rounded-2xl p-7"
            style={{ background: "#0D1424", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: "#64748B" }}>Gratuit</div>
            <div className="text-xs mb-4" style={{ color: "#475569" }}>Pour commencer sans risque</div>
            <div className="text-4xl font-black mb-1" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>
              0€
            </div>
            <div className="text-xs mb-5" style={{ color: "#374151" }}>pour toujours</div>
            <div className="h-px mb-5" style={{ background: "rgba(255,255,255,0.06)" }} />
            <ul className="space-y-2.5 mb-6">
              {["Timer focus & Pomodoro", "Tâches illimitées", "Planificateur hebdo", "Système XP & niveaux", "Classement global"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-xs" style={{ color: "#94A3B8" }}>
                  <Check size={13} style={{ color: "#10B981", flexShrink: 0 }} /> {f}
                </li>
              ))}
              {["Analytics avancés", "Coach IA"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-xs" style={{ color: "#374151" }}>
                  <X size={13} style={{ color: "#1F2937", flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <motion.button whileHover={{ background: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                Commencer gratuitement
              </motion.button>
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div whileHover={{ y: -4 }} className="rounded-2xl p-7 relative overflow-hidden"
            style={{ background: "#0D1424", border: "0.5px solid rgba(99,102,241,0.4)" }}>
            {/* Trait animé top */}
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, transparent, #6366F1, #818CF8, #6366F1, transparent)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }} />
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "rgba(99,102,241,0.06)", transform: "translate(30%, -30%)" }} />

            <span className="inline-block text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full mb-3"
              style={{ background: "rgba(99,102,241,0.15)", color: "#A5B4FC", border: "0.5px solid rgba(99,102,241,0.3)" }}>
              LE PLUS POPULAIRE
            </span>
            <div className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: "#818CF8" }}>Premium</div>
            <div className="text-xs mb-4" style={{ color: "#475569" }}>Pour les vrais performers</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black" style={{ fontFamily: "'Sora',sans-serif", color: "#F8FAFC" }}>9,99€</span>
              <span className="text-sm mb-1" style={{ color: "#64748B" }}>/mois</span>
            </div>
            <div className="text-xs mb-5" style={{ color: "#6366F1" }}>14 jours gratuits · sans CB</div>
            <div className="h-px mb-5" style={{ background: "rgba(255,255,255,0.06)" }} />
            <ul className="space-y-2.5 mb-6">
              {[
                "Tout du plan gratuit",
                "Analytics & rapports hebdo",
                "Coach IA personnalisé",
                "Export CSV & PDF",
                "Badge Premium exclusif",
                "Support prioritaire 24h",
                "Accès anticipé nouveautés",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-xs" style={{ color: "#94A3B8" }}>
                  <Check size={13} style={{ color: "#10B981", flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <motion.button whileHover={{ background: "#4F46E5" }} whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "#6366F1", border: "none" }}>
                Essayer 14 jours gratuit
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="avis" className="px-6 pb-20">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#6366F1" }}>Témoignages</div>
          <h2 className="text-4xl font-black tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>Ce qu'ils en pensent.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
          {[
            { initials: "ML", name: "Marie L.", role: "Étudiante en droit", color: "rgba(99,102,241,0.15)", textColor: "#818CF8", quote: "FocusFlow a transformé mes révisions. Je suis 3× plus régulière et mes notes ont vraiment suivi." },
            { initials: "TR", name: "Thomas R.", role: "Entrepreneur", color: "rgba(245,158,11,0.12)", textColor: "#F59E0B", quote: "Le système d'XP m'a rendu accro à ma propre productivité. Bizarre à dire, mais c'est vrai." },
            { initials: "SK", name: "Sarah K.", role: "Développeuse", color: "rgba(16,185,129,0.12)", textColor: "#10B981", quote: "Le Coach IA Premium vaut vraiment son prix. Il a identifié mes patterns de procrastination exactement." },
          ].map((t) => (
            <motion.div key={t.name} whileHover={{ y: -3, borderColor: "rgba(99,102,241,0.25)" }}
              className="rounded-2xl p-5" style={{ background: "#0D1424", border: "0.5px solid rgba(255,255,255,0.06)", transition: "border-color 0.3s" }}>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} style={{ color: "#F59E0B", fill: "#F59E0B" }} />)}
              </div>
              <p className="text-xs leading-relaxed mb-4 italic" style={{ color: "#64748B" }}>"{t.quote}"</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: t.color, color: t.textColor }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: "#CBD5E1" }}>{t.name}</div>
                  <div className="text-[10px]" style={{ color: "#374151" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-6 pb-20">
        <div className="relative max-w-4xl mx-auto rounded-2xl px-8 py-16 text-center overflow-hidden"
          style={{ background: "#0D1424", border: "0.5px solid rgba(99,102,241,0.2)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 80% at 50% 0%, rgba(99,102,241,0.08), transparent)" }} />
          <h2 className="text-3xl font-black tracking-tight mb-3 relative" style={{ fontFamily: "'Sora',sans-serif" }}>
            Prêt à reprendre le contrôle ?
          </h2>
          <p className="text-sm mb-8 relative" style={{ color: "#475569" }}>
            Rejoignez 2 400+ utilisateurs. Gratuit pour toujours, premium quand vous décidez.
          </p>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.04, background: "#4F46E5" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl text-white relative"
              style={{ background: "#6366F1", border: "none" }}
            >
              Créer mon compte gratuit
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-6 flex items-center justify-between flex-wrap gap-4" style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
        <div className="text-base font-black" style={{ fontFamily: "'Sora',sans-serif" }}>
          Focus<span style={{ color: "#6366F1" }}>Flow</span>
        </div>
        <div className="flex gap-5">
          {["Confidentialité", "Conditions", "Contact"].map((l) => (
            <a key={l} href="#" className="text-xs" style={{ color: "#374151", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <p className="text-xs" style={{ color: "#1F2937" }}>© 2026 FocusFlow</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
