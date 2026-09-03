"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Email ou mot de passe incorrect.")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  async function handleOAuth() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard` },
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background:"#09090b" }}>

      {/* Halos fond */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[130px]"/>
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[130px]"/>
        <div className="absolute top-1/2 left-0 h-[200px] w-[200px] rounded-full bg-violet-500/08 blur-[80px]"/>
      </div>

      {/* Grille décorative */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{ backgroundImage:"linear-gradient(rgba(139,92,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,1) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="w-full max-w-md relative z-10">

        {/* Logo + titre */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-7 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl transition-all group-hover:scale-105"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 24px rgba(124,58,237,0.45)" }}>
              <Sparkles className="h-5 w-5 text-white"/>
            </div>
            <span className="text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.4px" }}>
              FocusFlow
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.5px" }}>
            Bon retour 👋
          </h1>
          <p className="text-white/40 text-sm">Connecte-toi pour continuer ta progression</p>
        </div>

        {/* Carte */}
        <div className="rounded-2xl p-8 relative overflow-hidden"
          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(20px)", boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>

          {/* Halo intérieur */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
            style={{ background:"radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)", filter:"blur(20px)" }}/>

          {/* Bouton Google en premier */}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handleOAuth} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-semibold text-white transition-all mb-6"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}>
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </>
            )}
          </motion.button>

          {/* Séparateur */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]"/>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-white/25" style={{ background:"rgba(255,255,255,0.03)" }}>
                ou avec ton email
              </span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-4">

            {error && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                className="rounded-xl px-4 py-3 text-sm text-red-400"
                style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
                ⚠️ {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25"/>
                <Input type="email" placeholder="toi@exemple.com" value={email}
                  onChange={e => setEmail(e.target.value)} required
                  className="pl-10 h-12 bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl text-white placeholder:text-white/20"/>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25"/>
                <Input type={showPassword?"text":"password"} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="pl-10 pr-10 h-12 bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl text-white placeholder:text-white/20"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>

            {/* Bouton connexion */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all mt-2"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 8px 24px rgba(124,58,237,0.35)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <>Se connecter <ArrowRight className="h-4 w-4"/></>}
            </motion.button>
          </form>

          {/* Lien inscription */}
          <p className="mt-6 text-center text-sm text-white/30">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Créer un compte gratuit
            </Link>
          </p>
        </div>

        {/* Retour landing */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>

      </motion.div>
    </div>
  )
}
