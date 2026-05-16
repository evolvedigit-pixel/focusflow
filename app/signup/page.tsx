"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/glass-card"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
        </div>
        <GlassCard className="p-10 max-w-md w-full text-center" glow="cyan">
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Check your email!</h2>
          <p className="text-muted-foreground mb-6">
            We sent a confirmation link to <span className="text-white font-medium">{email}</span>. Click it to activate your account and start focusing.
          </p>
          <Link href="/login">
            <Button variant="outline" className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]">
              Back to login
            </Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">FocusFlow</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create account</h1>
          <p className="text-muted-foreground">Start your focus journey today — it&apos;s free</p>
        </div>

        <GlassCard className="p-8" glow="purple">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-white/[0.03] border-white/[0.1] focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/[0.03] border-white/[0.1] focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/[0.03] border-white/[0.1] focus:border-purple-500/50"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
