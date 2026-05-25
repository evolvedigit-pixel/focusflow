"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Search, X, Loader2, BookOpen, Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "apprentissage", label: "Ce que j'ai appris", color: "#8b5cf6", emoji: "🧠" },
  { id: "fierté", label: "Ce dont je suis fier", color: "#06b6d4", emoji: "💪" },
  { id: "amélioration", label: "Ce que j'améliore", color: "#22c55e", emoji: "📈" },
  { id: "blocage", label: "Ce qui m'a bloqué", color: "#f59e0b", emoji: "🚧" },
  { id: "gratitude", label: "Gratitude", color: "#ec4899", emoji: "🙏" },
  { id: "libre", label: "Note libre", color: "#6b7280", emoji: "✏️" },
]

const MOODS = [
  { id: "excellent", label: "Excellent", emoji: "🤩", color: "#22c55e" },
  { id: "bien", label: "Bien", emoji: "😊", color: "#06b6d4" },
  { id: "moyen", label: "Moyen", emoji: "😐", color: "#f59e0b" },
  { id: "difficile", label: "Difficile", emoji: "😔", color: "#ef4444" },
  { id: "épuisé", label: "Épuisé", emoji: "😴", color: "#8b5cf6" },
]

// Couleurs pastel pour les post-its
const POSTIT_COLORS = [
  "#fef08a", // jaune
  "#bbf7d0", // vert
  "#bfdbfe", // bleu
  "#fecaca", // rouge
  "#e9d5ff", // violet
  "#fed7aa", // orange
  "#f5d0fe", // rose
  "#a7f3d0", // turquoise
]

type JournalEntry = {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  mood: string
  color: string
  created_at: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateFull(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState<string>("tout")
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("libre")
  const [mood, setMood] = useState("bien")

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  const loadEntries = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const randomColor = POSTIT_COLORS[Math.floor(Math.random() * POSTIT_COLORS.length)]
    const { data } = await supabase.from("journal_entries")
      .insert({
        title: title.trim() || formatDate(new Date().toISOString()),
        content: content.trim(),
        category,
        mood,
        color: randomColor,
        user_id: user.id
      })
      .select().single()
    if (data) setEntries(prev => [data, ...prev])
    setTitle(""); setContent(""); setCategory("libre"); setMood("bien")
    setShowNew(false)
    setSaving(false)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const supabase = createClient()
    await supabase.from("journal_entries").delete().eq("id", id)
    setEntries(prev => prev.filter(e => e.id !== id))
    if (selectedEntry?.id === id) setSelectedEntry(null)
  }

  const filtered = entries.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === "tout" || e.category === filterCat
    return matchSearch && matchCat
  })

  const getCat = (id: string) => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[5]
  const getMood = (id: string) => MOODS.find(m => m.id === id) ?? MOODS[1]

  return (
    <div className="flex flex-col gap-5">

      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Journal de bord
          </h1>
          <p className="text-sm text-white/40 mt-0.5 capitalize">{today}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white
            bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
            shadow-lg shadow-violet-900/40 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nouvelle note
        </motion.button>
      </motion.div>

      {/* Recherche + filtres */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md px-4 py-4 space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans le journal…"
            className="pl-9 bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat("tout")}
            className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all",
              filterCat === "tout" ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70 bg-white/[0.03]"
            )}
          >
            Tout
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.id ? "tout" : cat.id)}
              className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                filterCat === cat.id ? "bg-white/[0.12] text-white" : "text-white/40 hover:text-white/70 bg-white/[0.03]"
              )}
              style={{ color: filterCat === cat.id ? cat.color : undefined }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grille de post-its */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/30">
          <BookOpen className="h-8 w-8 opacity-40" />
          <p className="text-sm">Aucune note — cliquez sur "Nouvelle note" !</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence initial={false}>
            {filtered.map((entry, i) => {
              const cat = getCat(entry.category)
              const moodObj = getMood(entry.mood)
              const bgColor = entry.color ?? POSTIT_COLORS[i % POSTIT_COLORS.length]
              const rotate = (i % 3 === 0 ? -1.5 : i % 3 === 1 ? 1.2 : -0.8)

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  whileHover={{ scale: 1.04, rotate: 0, zIndex: 10, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.04 }}
                  onClick={() => setSelectedEntry(entry)}
                  className="relative cursor-pointer"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                >
                  {/* Post-it */}
                  <div
                    className="rounded-sm pt-8 pb-5 px-4 min-h-[180px] flex flex-col relative"
                    style={{
                      backgroundColor: bgColor,
                      backgroundImage: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
                    }}
                  >
                    {/* Punaise */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-5 h-5 rounded-full shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: "#dc2626" }}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-300" />
                      </div>
                      <div className="w-1 h-3 bg-gray-600 mx-auto rounded-b-full" style={{ marginTop: "-2px" }} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">{cat.emoji}</span>
                        <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider truncate">{cat.label}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{entry.title}</h3>
                      <p className="text-gray-700 text-xs leading-relaxed line-clamp-5">{entry.content}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/[0.08]">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{moodObj.emoji}</span>
                        <span className="text-[10px] text-gray-500">{formatDate(entry.created_at)}</span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(entry.id, e)}
                        className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal détail note */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-sm pt-12 pb-8 px-8 min-h-[300px]"
              style={{
                backgroundColor: selectedEntry.color ?? "#fef08a",
                filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.5))",
              }}
            >
              {/* Punaise grande */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-7 h-7 rounded-full shadow-lg flex items-center justify-center" style={{ backgroundColor: "#dc2626" }}>
                  <div className="w-3 h-3 rounded-full bg-red-300" />
                </div>
                <div className="w-1.5 h-4 bg-gray-600 mx-auto rounded-b-full" style={{ marginTop: "-2px" }} />
              </div>

              {/* Bouton fermer */}
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-black/[0.08] transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{getCat(selectedEntry.category).emoji}</span>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">{getCat(selectedEntry.category).label}</span>
                <span className="ml-auto text-lg">{getMood(selectedEntry.mood).emoji}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-3">{selectedEntry.title}</h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>

              <div className="mt-6 pt-3 border-t border-black/[0.08]">
                <p className="text-xs text-gray-500 capitalize">{formatDateFull(selectedEntry.created_at)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal nouvelle note */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowNew(false) }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg rounded-2xl border border-white/[0.1] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
                <h3 className="text-sm font-semibold text-white">Nouvelle note</h3>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNew(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Titre (optionnel)</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de votre note..."
                    className="bg-white/[0.04] border-white/[0.08] focus:border-violet-500/50 rounded-xl"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                          category === cat.id ? "text-white" : "text-white/40 hover:text-white/70 bg-white/[0.03] border-white/[0.06]"
                        )}
                        style={category === cat.id ? { backgroundColor: cat.color + "33", color: cat.color, borderColor: cat.color + "50" } : {}}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Humeur du jour</label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMood(m.id)}
                        title={m.label}
                        className={cn(
                          "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xl transition-all",
                          mood === m.id ? "bg-white/[0.1] scale-110" : "hover:bg-white/[0.05] opacity-50 hover:opacity-80"
                        )}
                      >
                        {m.emoji}
                        <span className="text-[9px] text-white/40">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Votre note</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Écrivez librement..."
                    rows={5}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving || !content.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNew(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80 transition-all"
                  >
                    Annuler
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
