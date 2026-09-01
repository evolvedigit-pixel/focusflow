"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Sparkles, ArrowRight, Timer, Trophy, BarChart3,
  Zap, Target, Flame, BookOpen, CheckSquare, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"

const features = [
  { icon:Timer,       title:"Focus Timer",          description:"Timer Pomodoro avec grand écran aesthetic et ambiances sonores. Change les couleurs selon ton humeur.", color:"from-purple-500 to-blue-500"   },
  { icon:Zap,         title:"Système XP",            description:"Gagne de l'XP à chaque session, tâche complétée et habitude cochée. Monte en niveau et progresse.", color:"from-yellow-500 to-amber-500"   },
  { icon:Flame,       title:"Chaîne de discipline",  description:"Ne brise jamais ta chaîne. Visualise tes jours actifs comme GitHub et maintiens ta régularité.",    color:"from-orange-500 to-red-500"     },
  { icon:CheckSquare, title:"Tâches intelligentes",  description:"Organise tes intentions du jour par priorité. Chaque tâche complétée te rapporte des XP.",          color:"from-green-500 to-emerald-500"  },
  { icon:Calendar,    title:"Planificateur",          description:"Planifie ta semaine visuellement. Note 3 à 5 choses à accomplir chaque jour pour rester focalisé.",  color:"from-cyan-500 to-teal-500"      },
  { icon:BookOpen,    title:"Journal de bord",        description:"Écris tes apprentissages quotidiens. Des prompts guidés t'aident à réfléchir et progresser.",       color:"from-pink-500 to-rose-500"      },
  { icon:Trophy,      title:"Classement",             description:"Compare ta progression avec d'autres utilisateurs. Grimpe dans le classement semaine après semaine.", color:"from-amber-500 to-yellow-500"   },
  { icon:BarChart3,   title:"Analytics",              description:"Suis tes habitudes avec des graphiques clairs. Identifie tes meilleurs jours et optimise ta routine.", color:"from-indigo-500 to-purple-500"  },
  { icon:Target,      title:"Objectifs",              description:"Fixe des objectifs quotidiens, hebdomadaires et mensuels. Reste accountable envers toi-même.",      color:"from-violet-500 to-purple-500"  },
]

const testimonials = [
  { name:"Alexandre M.", role:"Étudiant en médecine",    text:"FocusFlow m'a aidé à tenir 4h de révision par jour. La chaîne de discipline est addictive — je ne veux pas la briser !", emoji:"🎓" },
  { name:"Sarah K.",     role:"Développeuse web",        text:"Le grand écran aesthetic change tout. Je me mets en mode focus violet et je ne lève plus les yeux pendant 90 min.", emoji:"💻" },
  { name:"Lucas D.",     role:"Entrepreneur",            text:"Niveau 12 en 3 mois. Le système XP m'a redonné l'envie de travailler. C'est comme un jeu mais avec de vrais résultats.", emoji:"🚀" },
]

const steps = [
  { num:"01", title:"Crée ton compte", desc:"Inscription gratuite en 30 secondes. Aucune carte bancaire requise.", emoji:"✨" },
  { num:"02", title:"Lance ta première session", desc:"Démarre un timer focus et commence à accumuler des XP dès la première minute.", emoji:"⏱️" },
  { num:"03", title:"Construis tes habitudes", desc:"Ajoute tes habitudes quotidiennes et ne brise jamais ta chaîne de discipline.", emoji:"🔥" },
  { num:"04", title:"Monte en niveau", desc:"Complète des tâches, écris dans ton journal et grimpe dans le classement.", emoji:"🏆" },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background:"#09090b" }}>

      {/* Halos fond */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/15 blur-[130px]"/>
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]"/>
        <div className="absolute top-1/2 left-0 h-[300px] w-[300px] rounded-full bg-violet-500/08 blur-[100px]"/>
      </div>

      {/* ── NAVBAR ── */}
      <motion.nav initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 0 20px rgba(124,58,237,0.4)" }}>
              <Sparkles className="h-4 w-4 text-white"/>
            </div>
            <div>
              <span className="text-lg font-bold text-white" style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>FocusFlow</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm text-white/40 hover:text-white transition-colors sm:block">
              Se connecter
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:opacity-90 shadow-lg">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.05 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/60 backdrop-blur-sm">
              <Flame className="h-4 w-4 text-orange-400"/>
              <span>Transforme ta productivité en jeu de progression</span>
            </motion.div>

            <h1 className="mb-6 font-black tracking-tight text-balance"
              style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(38px,6vw,76px)", lineHeight:1.1, letterSpacing:"-1.5px" }}>
              Maîtrise ta{" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                concentration.
              </span>
              <br/>Construis ta{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                discipline.
              </span>
            </h1>

            <p className="mb-10 text-lg text-white/50 text-pretty sm:text-xl max-w-2xl mx-auto" style={{ lineHeight:1.7 }}>
              FocusFlow transforme tes sessions de travail en expérience RPG. Gagne des XP, monte en niveau,
              maintiens ta chaîne de jours et deviens la meilleure version de toi-même.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/login">
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="flex items-center gap-2 h-14 px-8 rounded-xl text-white font-bold text-base transition-all"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 8px 32px rgba(124,58,237,0.4)" }}>
                  Commencer gratuitement
                  <ArrowRight className="h-5 w-5"/>
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  className="flex items-center gap-2 h-14 px-8 rounded-xl text-white/60 font-medium text-base transition-all border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] hover:text-white">
                  Voir le classement
                </motion.button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              {[
                { value:"100%", label:"Gratuit" },
                { value:"∞",    label:"Sessions illimitées" },
                { value:"0",    label:"Carte bancaire" },
              ].map((s,i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>{s.value}</div>
                  <div className="text-xs text-white/30 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── APERÇU PRODUIT ── */}
          <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.6 }}
            className="mt-20">
            <GlassCard className="mx-auto max-w-5xl overflow-hidden p-3" glow="purple">
              <div className="rounded-xl p-6 sm:p-8"
                style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.08),rgba(99,102,241,0.05))" }}>
                <div className="grid gap-4 sm:grid-cols-3">

                  {/* Timer */}
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] p-6">
                    <div className="relative mb-4 flex h-32 w-32 items-center justify-center">
                      <svg className="absolute h-full w-full -rotate-90">
                        <circle cx="64" cy="64" r="55" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                        <circle cx="64" cy="64" r="55" fill="none" stroke="url(#grad)" strokeWidth="8"
                          strokeLinecap="round" strokeDasharray={`${0.72*345.4} 345.4`}/>
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7c3aed"/>
                            <stop offset="100%" stopColor="#22d3ee"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="text-3xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>32:18</span>
                    </div>
                    <p className="text-sm text-white/40">Session Focus</p>
                    <div className="mt-3 flex items-center gap-1.5 rounded-full px-3 py-1"
                      style={{ background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.2)" }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                      <span className="text-xs text-green-400 font-medium">En cours</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col gap-3">
                    {[
                      { label:"Aujourd'hui",     value:"3h 45m", sub:"Focus total",      color:"#a855f7" },
                      { label:"Série actuelle",  value:"12 jours", sub:"Continue !",     color:"#f97316" },
                      { label:"XP cette semaine",value:"+840",    sub:"Niveau 8 → 9",    color:"#fbbf24" },
                    ].map((s,i) => (
                      <div key={i} className="rounded-2xl bg-white/[0.03] px-4 py-3">
                        <p className="text-xs text-white/30">{s.label}</p>
                        <p className="text-xl font-black" style={{ fontFamily:"'Sora',sans-serif", color:s.color }}>{s.value}</p>
                        <p className="text-[10px] text-white/20 mt-0.5">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Classement */}
                  <div className="rounded-2xl bg-white/[0.03] p-4">
                    <p className="mb-3 text-sm font-semibold text-white/70">🏆 Top joueurs</p>
                    <div className="space-y-2.5">
                      {[
                        { name:"Alexandre", xp:"2 840 XP", w:"85%" },
                        { name:"Sarah",     xp:"2 210 XP", w:"65%" },
                        { name:"Lucas",     xp:"1 950 XP", w:"55%" },
                      ].map((u,i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                            style={{ background:i===0?"linear-gradient(135deg,#fbbf24,#f59e0b)":i===1?"linear-gradient(135deg,#9ca3af,#6b7280)":"linear-gradient(135deg,#d97706,#b45309)" }}>
                            {i+1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[10px] text-white/60">{u.name}</span>
                              <span className="text-[10px] text-white/40">{u.xp}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:u.w, background:"linear-gradient(90deg,#7c3aed,#a855f7)" }}/>
                            </div>
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

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="mb-16 text-center">
            <h2 className="text-3xl font-black sm:text-4xl text-white mb-4"
              style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.5px" }}>
              Commence en{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                4 étapes simples
              </span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">Pas besoin de configuration complexe. Lance-toi maintenant.</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step,i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1 }}>
                <div className="relative rounded-2xl p-6 h-full"
                  style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-4xl mb-4">{step.emoji}</div>
                  <div className="text-xs font-bold text-white/20 mb-2 tracking-widest">{step.num}</div>
                  <h3 className="font-bold text-white text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                  {i < steps.length-1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-white/20 z-10">
                      <ArrowRight size={20}/>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="mb-16 text-center">
            <h2 className="text-3xl font-black sm:text-4xl text-white mb-4"
              style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.5px" }}>
              Tout ce qu'il te faut pour{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                rester focalisé
              </span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Des fonctionnalités puissantes pour construire de meilleures habitudes et atteindre tes objectifs.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature,i) => (
              <motion.div key={feature.title} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.06 }}>
                <GlassCard className="h-full p-6 group hover:border-white/[0.12] transition-all">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <feature.icon className="h-6 w-6 text-white"/>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="mb-16 text-center">
            <h2 className="text-3xl font-black sm:text-4xl text-white mb-4"
              style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.5px" }}>
              Ils ont transformé leur{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                productivité
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {testimonials.map((t,i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1 }}>
                <GlassCard className="p-6 h-full">
                  <div className="text-3xl mb-4">{t.emoji}</div>
                  <p className="text-sm text-white/60 leading-relaxed mb-4 italic">« {t.text} »</p>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-white/30">{t.role}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <GlassCard className="p-12" glow="purple">
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background:"radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.15),transparent 70%)" }}/>
              <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl relative"
                style={{ fontFamily:"'Sora',sans-serif", letterSpacing:"-0.5px" }}>
                Prêt à transformer ta productivité ?
              </h2>
              <p className="mb-8 text-white/40 relative max-w-lg mx-auto leading-relaxed">
                Rejoins des milliers d'utilisateurs qui ont déjà amélioré leur concentration et atteint leurs objectifs avec FocusFlow.
              </p>
              <Link href="/login">
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="relative flex items-center gap-2 h-14 px-10 rounded-xl text-white font-bold text-base mx-auto"
                  style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow:"0 8px 32px rgba(124,58,237,0.5)" }}>
                  Commencer gratuitement aujourd'hui
                  <ArrowRight className="h-5 w-5"/>
                </motion.button>
              </Link>
              <p className="mt-4 text-xs text-white/20 relative">Aucune carte bancaire · Aucun engagement · 100% gratuit</p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              <Sparkles className="h-4 w-4 text-white"/>
            </div>
            <span className="font-bold text-white" style={{ fontFamily:"'Sora',sans-serif" }}>FocusFlow</span>
          </div>
          <p className="text-sm text-white/20">Conçu pour les esprits focalisés. Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  )
}
