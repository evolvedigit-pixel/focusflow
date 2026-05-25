"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Sparkles, Zap, Target, Clock, Trophy, CheckCircle2,
  ArrowRight, Star, Users, TrendingUp, BookOpen, Activity,
} from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Sessions Focus",
    description: "Timer Pomodoro premium avec suivi automatique de vos heures de travail et gains d'XP.",
    color: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.3)",
  },
  {
    icon: Target,
    title: "Gestion des Tâches",
    description: "Organisez vos tâches par priorité et catégorie. Suivez votre progression en temps réel.",
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.3)",
  },
  {
    icon: Activity,
    title: "Suivi des Habitudes",
    description: "Construisez des habitudes solides grâce à un tableau de suivi hebdomadaire visuel.",
    color: "from-green-500 to-emerald-600",
    glow: "rgba(34,197,94,0.3)",
  },
  {
    icon: BookOpen,
    title: "Journal de Bord",
    description: "Notez vos réflexions quotidiennes sous forme de post-its colorés. Gardez une trace de votre évolution.",
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.3)",
  },
  {
    icon: TrendingUp,
    title: "Planificateur",
    description: "Organisez votre semaine avec un planificateur visuel élégant, du lundi au dimanche.",
    color: "from-pink-500 to-rose-600",
    glow: "rgba(236,72,153,0.3)",
  },
  {
    icon: Trophy,
    title: "Classement",
    description: "Comparez vos performances avec d'autres utilisateurs et grimpez dans le classement XP.",
    color: "from-yellow-500 to-amber-600",
    glow: "rgba(234,179,8,0.3)",
  },
]

const stats = [
  { value: "10x", label: "Plus productif" },
  { value: "1 XP", label: "Par minute de focus" },
  { value: "100%", label: "Données privées" },
  { value: "Gratuit", label: "Pour commencer" },
]

const testimonials = [
  { name: "Marie L.", role: "Étudiante", text: "FocusFlow a complètement transformé ma façon de travailler. Je suis 3x plus productive !", avatar: "ML" },
  { name: "Thomas R.", role: "Entrepreneur", text: "Le système d'XP m'a rendu accro à la productivité. J'adore monter de niveau !", avatar: "TR" },
  { name: "Sarah K.", role: "Développeuse", text: "Le planificateur et le suivi des habitudes sont exactement ce dont j'avais besoin.", avatar: "SK" },
]

const pricingPlans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Parfait pour commencer",
    features: [
      "Timer Focus & Pomodoro",
      "Liste de tâches illimitée",
      "Planificateur hebdomadaire",
      "Journal de bord",
      "Suivi des habitudes",
      "Système XP & niveaux",
      "Classement global",
    ],
    cta: "Commencer gratuitement",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "9,99€",
    period: "par mois",
    description: "Pour les vrais performers",
    features: [
      "Tout du plan gratuit",
      "Statistiques avancées",
      "Rapports hebdomadaires",
      "Sessions illimitées",
      "Badge Premium exclusif",
      "Support prioritaire",
      "Accès anticipé aux nouveautés",
    ],
    cta: "Essayer 14 jours gratuit",
    href: "/login",
    highlighted: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">

      {/* Fond animé */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(147,51,234,0.5)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">FocusFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
          <a href="#avis" className="hover:text-white transition-colors">Avis</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
            Connexion
          </Link>
          <Link href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-900/40 transition-all"
          >
            Commencer <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            La productivité gamifiée
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Travaillez mieux.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Progressez chaque jour.
            </span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            FocusFlow transforme votre productivité en jeu. Gagnez de l&apos;XP, montez de niveau, 
            construisez des habitudes solides et surpassez vos objectifs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-xl shadow-violet-900/40 transition-all hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Commencer gratuitement
            </Link>
            <a href="#fonctionnalites"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/70 border border-white/[0.1] hover:bg-white/[0.05] hover:text-white transition-all"
            >
              Voir les fonctionnalités
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <p className="text-3xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Tout ce qu&apos;il vous faut
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">pour performer</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Un écosystème complet pour gérer votre temps, vos habitudes et votre progression.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm group transition-all"
              style={{ boxShadow: `0 0 0 0 ${feature.glow}` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="avis" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Ils adorent
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> FocusFlow</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Simple et
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> transparent</span>
          </h2>
          <p className="text-white/50 text-lg">Commencez gratuitement, passez premium quand vous êtes prêt.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "border-2 border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-cyan-500/10"
                  : "border border-white/[0.07] bg-white/[0.03]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 text-xs font-bold shadow-lg">
                  ⭐ Le plus populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-white/40 text-sm">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-900/40 hover:scale-105"
                    : "border border-white/[0.1] text-white/70 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 p-16 backdrop-blur-sm"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Prêt à transformer
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">votre productivité ?</span>
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez des milliers d&apos;utilisateurs qui ont déjà transformé leur façon de travailler.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-xl shadow-violet-900/40 transition-all hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            Commencer gratuitement
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">FocusFlow</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 FocusFlow. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
