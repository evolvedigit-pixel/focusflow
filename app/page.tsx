"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Timer, Trophy, BarChart3, Zap, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"

const features = [
  {
    icon: Timer,
    title: "Focus Sessions",
    description: "Powerful Pomodoro timer with customizable sessions and ambient sounds.",
  },
  {
    icon: Zap,
    title: "XP System",
    description: "Earn experience points for every focused minute. Level up and unlock rewards.",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Compete with friends and the community. Climb the ranks weekly.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track your productivity patterns with beautiful charts and insights.",
  },
  {
    icon: Target,
    title: "Goals",
    description: "Set daily, weekly, and monthly goals. Stay accountable to yourself.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Join focus rooms and work alongside others for accountability.",
  },
]

const stats = [
  { label: "Active Users", value: "50K+" },
  { label: "Focus Hours", value: "2M+" },
  { label: "XP Earned", value: "100M+" },
  { label: "Streaks Maintained", value: "500K+" },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-background/50 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold">FocusFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground hover:text-white transition-colors sm:block"
            >
              Dashboard
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
              <Zap className="h-4 w-4 text-purple-400" />
              <span>Now with AI-powered focus insights</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              Master your focus.{" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Level up your life.
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground text-pretty sm:text-xl">
              Transform your productivity with gamified focus sessions. Track progress, earn XP, compete on leaderboards, and achieve your goals.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90 shadow-[0_0_30px_rgba(147,51,234,0.3)]"
                >
                  Start Focusing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="outline" size="lg" className="h-12 px-8 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 sm:mt-20"
          >
            <GlassCard className="mx-auto max-w-5xl overflow-hidden p-2" glow="purple">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Timer Preview */}
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] p-6 backdrop-blur-sm">
                    <div className="relative mb-4 flex h-32 w-32 items-center justify-center">
                      <svg className="absolute h-full w-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${0.75 * 364.42} 364.42`}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#22d3ee" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="text-3xl font-bold">25:00</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Focus Session</p>
                  </div>

                  {/* Stats Preview */}
                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl bg-white/[0.03] p-4 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground">Today&apos;s Focus</p>
                      <p className="text-2xl font-bold">4h 32m</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.03] p-4 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold">14 days</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.03] p-4 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground">XP Earned</p>
                      <p className="text-2xl font-bold">+450</p>
                    </div>
                  </div>

                  {/* Leaderboard Preview */}
                  <div className="rounded-2xl bg-white/[0.03] p-4 backdrop-blur-sm">
                    <p className="mb-3 text-sm font-medium">Top Performers</p>
                    <div className="space-y-3">
                      {[1, 2, 3].map((rank) => (
                        <div key={rank} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-sm font-bold">
                            {rank}
                          </div>
                          <div className="h-2 flex-1 rounded-full bg-white/[0.1]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                              style={{ width: `${100 - rank * 20}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                stay focused
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features designed to help you build better habits and achieve your goals.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                    <feature.icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="p-8 sm:p-12" glow="cyan">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to transform your productivity?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of users who have already improved their focus and achieved their goals.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90 shadow-[0_0_30px_rgba(147,51,234,0.3)]"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">FocusFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for focused minds. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
