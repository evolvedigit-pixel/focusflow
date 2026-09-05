"use client"

import { createContext, useContext, useState, useEffect } from "react"

export type AccentTheme = {
  id:      string
  label:   string
  emoji:   string
  primary: string   // couleur principale
  secondary: string // couleur secondaire (gradient)
  glow:    string   // rgba pour les halos
  soft:    string   // rgba très léger pour les fonds
}

export const ACCENT_THEMES: AccentTheme[] = [
  {
    id:        "violet",
    label:     "Violet",
    emoji:     "💜",
    primary:   "#7c3aed",
    secondary: "#6366f1",
    glow:      "rgba(124,58,237,0.35)",
    soft:      "rgba(139,92,246,0.08)",
  },
  {
    id:        "cyan",
    label:     "Cyan",
    emoji:     "🩵",
    primary:   "#0891b2",
    secondary: "#06b6d4",
    glow:      "rgba(8,145,178,0.35)",
    soft:      "rgba(6,182,212,0.08)",
  },
  {
    id:        "rose",
    label:     "Rose",
    emoji:     "🌸",
    primary:   "#e11d48",
    secondary: "#f43f5e",
    glow:      "rgba(225,29,72,0.35)",
    soft:      "rgba(244,63,94,0.08)",
  },
  {
    id:        "orange",
    label:     "Orange",
    emoji:     "🔥",
    primary:   "#ea580c",
    secondary: "#f97316",
    glow:      "rgba(234,88,12,0.35)",
    soft:      "rgba(249,115,22,0.08)",
  },
  {
    id:        "green",
    label:     "Vert",
    emoji:     "🍀",
    primary:   "#16a34a",
    secondary: "#22c55e",
    glow:      "rgba(22,163,74,0.35)",
    soft:      "rgba(34,197,94,0.08)",
  },
  {
    id:        "gold",
    label:     "Or",
    emoji:     "✨",
    primary:   "#d97706",
    secondary: "#f59e0b",
    glow:      "rgba(217,119,6,0.35)",
    soft:      "rgba(245,158,11,0.08)",
  },
]

type ThemeCtx = {
  theme:    AccentTheme
  setTheme: (t: AccentTheme) => void
}

const ThemeContext = createContext<ThemeCtx>({
  theme:    ACCENT_THEMES[0],
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AccentTheme>(ACCENT_THEMES[0])

  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("focusflow_accent")
    if (saved) {
      const found = ACCENT_THEMES.find(t => t.id === saved)
      if (found) setThemeState(found)
    }
  }, [])

  // Appliquer les variables CSS sur :root
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--accent-primary",   theme.primary)
    root.style.setProperty("--accent-secondary", theme.secondary)
    root.style.setProperty("--accent-glow",      theme.glow)
    root.style.setProperty("--accent-soft",      theme.soft)
  }, [theme])

  function setTheme(t: AccentTheme) {
    setThemeState(t)
    localStorage.setItem("focusflow_accent", t.id)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
