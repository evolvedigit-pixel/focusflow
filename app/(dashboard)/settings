"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Mail, Lock, Trash2, Check, X, Loader2, Eye, EyeOff,
  Shield, AlertTriangle, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2"
      style={{
        background: type==="success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
        border: `1px solid ${type==="success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        backdropFilter: "blur(12px)",
      }}>
      {type==="success" ? <Check size={14} className="text-green-400"/> : <X size={14} className="text-red-400"/>}
      {msg}
    </motion.div>
  )
}

export default function SettingsPage() {
  const router = useRouter()

  // Email
  const [newEmail, setNewEmail]         = useState("")
  const [savingEmail, setSavingEmail]   = useState(false)

  // Mot de passe
  const [currentPwd, setCurrentPwd]     = useState("")
  const [newPwd, setNewPwd]             = useState("")
  const [confirmPwd, setConfirmPwd]     = useState("")
  const [savingPwd, setSavingPwd]       = useState(false)
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  // Suppression compte
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput]   = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Toast
  const [toast, setToast]               = useState<{ msg:string; type:"success"|"error" } | null>(null)

  function flash(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Changer l'email ────────────────────────────────────────────────────────
  async function handleChangeEmail() {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      flash("Adresse email invalide", "error"); return
    }
    setSavingEmail(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setSavingEmail(false)
    if (error) {
      flash(error.message, "error")
    } else {
      flash("Email mis à jour ! Vérifie ta boîte mail pour confirmer.")
      setNewEmail("")
    }
  }

  // ── Changer le mot de passe ────────────────────────────────────────────────
  async function handleChangePassword() {
    if (!newPwd) { flash("Saisis un nouveau mot de passe", "error"); return }
    if (newPwd.length < 6) { flash("Minimum 6 caractères", "error"); return }
    if (newPwd !== confirmPwd) { flash("Les mots de passe ne correspondent pas", "error"); return }

    setSavingPwd(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) {
      flash(error.message, "error")
    } else {
      flash("Mot de passe mis à jour !")
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
    }
  }

  // ── Supprimer le compte ────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (deleteInput !== "SUPPRIMER") {
      flash("Tape exactement SUPPRIMER pour confirmer", "error"); return
    }
    setDeletingAccount(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Supprimer les données utilisateur
      await Promise.all([
        supabase.from("todos").delete().eq("user_id", user.id),
        supabase.from("habits").delete().eq("user_id", user.id),
        supabase.from("habit_entries").delete().eq("user_id", user.id),
        supabase.from("focus_sessions").delete().eq("user_id", user.id),
        supabase.from("journal_entries").delete().eq("user_id", user.id),
        supabase.from("planner_tasks").delete().eq("user_id", user.id),
      ])
      await supabase.from("profiles").delete().eq("id", user.id)
      await supabase.auth.signOut()
    }
    router.push("/login")
  }

  // Force du mot de passe
  function passwordStrength(pwd: string) {
    if (!pwd) return null
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { label:"Faible", color:"#ef4444", width:"25%" }
    if (score === 2) return { label:"Moyen",  color:"#f59e0b", width:"50%" }
    if (score === 3) return { label:"Bon",    color:"#06b6d4", width:"75%" }
    return              { label:"Fort",    color:"#22c55e", width:"100%" }
  }
  const pwdStrength = passwordStrength(newPwd)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type}/>}
      </AnimatePresence>

      {/* En-tête */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-2xl font-bold sm:text-3xl">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez votre compte et votre sécurité</p>
      </motion.div>

      {/* ── CHANGER L'EMAIL ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.25)" }}>
              <Mail className="h-5 w-5 text-violet-400"/>
            </div>
            <div>
              <h2 className="font-semibold text-white">Adresse email</h2>
              <p className="text-xs text-white/40">Un email de confirmation sera envoyé</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Nouvel email</label>
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)}
                placeholder="nouveau@email.com" type="email"
                className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"
                onKeyDown={e => e.key==="Enter" && handleChangeEmail()}/>
            </div>
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              onClick={handleChangeEmail} disabled={savingEmail || !newEmail}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 4px 16px rgba(124,58,237,0.3)" }}>
              {savingEmail ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
              {savingEmail ? "Envoi..." : "Mettre à jour l'email"}
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── CHANGER LE MOT DE PASSE ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background:"rgba(6,182,212,0.15)", border:"1px solid rgba(6,182,212,0.25)" }}>
              <Lock className="h-5 w-5 text-cyan-400"/>
            </div>
            <div>
              <h2 className="font-semibold text-white">Mot de passe</h2>
              <p className="text-xs text-white/40">Minimum 6 caractères</p>
            </div>
          </div>
          <div className="space-y-3">
            {/* Nouveau mot de passe */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Nouveau mot de passe</label>
              <div className="relative">
                <Input value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  placeholder="••••••••" type={showNew ? "text" : "password"}
                  className="bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/50 rounded-xl pr-10"/>
                <button onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {/* Barre de force */}
              {pwdStrength && (
                <div className="space-y-1">
                  <div className="h-1 rounded-full overflow-hidden bg-white/[0.06]">
                    <motion.div className="h-full rounded-full"
                      style={{ background:pwdStrength.color }}
                      animate={{ width:pwdStrength.width }} transition={{ duration:0.3 }}/>
                  </div>
                  <div className="text-[10px] font-medium" style={{ color:pwdStrength.color }}>
                    Force : {pwdStrength.label}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmer */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Confirmer le mot de passe</label>
              <div className="relative">
                <Input value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="••••••••" type={showConfirm ? "text" : "password"}
                  className={cn("bg-white/[0.04] border-white/[0.08] rounded-xl pr-10",
                    confirmPwd && confirmPwd !== newPwd ? "border-red-500/50" : confirmPwd && confirmPwd === newPwd ? "border-green-500/50" : "focus:border-cyan-500/50")}
                  onKeyDown={e => e.key==="Enter" && handleChangePassword()}/>
                <button onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="text-[10px] text-red-400">Les mots de passe ne correspondent pas</p>
              )}
              {confirmPwd && confirmPwd === newPwd && (
                <p className="text-[10px] text-green-400">✓ Les mots de passe correspondent</p>
              )}
            </div>

            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              onClick={handleChangePassword} disabled={savingPwd || !newPwd || !confirmPwd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background:"linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow:"0 4px 16px rgba(6,182,212,0.3)" }}>
              {savingPwd ? <Loader2 size={14} className="animate-spin"/> : <Shield size={14}/>}
              {savingPwd ? "Mise à jour..." : "Changer le mot de passe"}
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── ZONE DANGER ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
        <div className="rounded-2xl overflow-hidden"
          style={{ border:"1px solid rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.03)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-3"
            style={{ borderColor:"rgba(239,68,68,0.15)" }}>
            <AlertTriangle className="h-5 w-5 text-red-400"/>
            <h2 className="font-semibold text-red-400">Zone de danger</h2>
          </div>

          <div className="p-6">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Supprimer mon compte</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Cette action est irréversible. Toutes vos données seront supprimées.
                  </p>
                </div>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 transition-all"
                  style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)" }}>
                  <Trash2 size={14}/> Supprimer
                </motion.button>
              </div>
            ) : (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                <div className="rounded-xl p-4"
                  style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-sm font-semibold text-red-400 mb-1">⚠️ Action irréversible</p>
                  <p className="text-xs text-white/50">
                    Toutes vos tâches, habitudes, sessions focus, notes de journal et votre progression seront définitivement supprimées.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                    Tape <span className="text-red-400 font-bold">SUPPRIMER</span> pour confirmer
                  </label>
                  <Input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                    placeholder="SUPPRIMER"
                    className="bg-white/[0.04] border-red-500/30 focus:border-red-500/60 rounded-xl"/>
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || deleteInput !== "SUPPRIMER"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
                    style={{ background:"linear-gradient(135deg,#dc2626,#ef4444)", boxShadow:"0 4px 16px rgba(239,68,68,0.3)" }}>
                    {deletingAccount ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                    {deletingAccount ? "Suppression..." : "Supprimer définitivement"}
                  </motion.button>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput("") }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                    Annuler
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

    </div>
  )
}
