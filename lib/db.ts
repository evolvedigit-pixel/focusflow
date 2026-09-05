import { createClient } from '@/lib/supabase/client'
 
// ─── Types ───────────────────────────────────────────────────────────────────
export type Profile = {
  id: string
  name: string | null
  full_name: string | null
  avatar_url: string | null
  level: number
  xp: number
  xp_to_next_level: number
  streak: number
  total_focus_hours: number
  sessions_completed: number
  productivity_score: number
  joined_date: string
}
 
export type Todo = {
  id: string
  user_id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  completed: boolean
  xp_reward: number
  created_at: string
}
 
export type PlannerTask = {
  id: string
  user_id: string
  title: string
  category: string
  day: number
  start_hour: number
  duration: number
  completed: boolean
  week_start: string
}
 
export type FocusSession = {
  id: string
  user_id: string
  session_type: string
  duration: number
  xp_earned: number
  completed_at: string
}
 
// ─── Système XP ──────────────────────────────────────────────────────────────
export const XP_RULES = {
  FOCUS_PER_MINUTE: 1,
  TASK_LOW: 10,
  TASK_MEDIUM: 25,
  TASK_HIGH: 50,
  HABIT: 15,
  JOURNAL: 10,
  STREAK_BONUS_PER_DAY: 5,
}
 
export function xpForLevel(level: number): number {
  return level * 100
}
 
// ─── Config statique ─────────────────────────────────────────────────────────
export const taskCategories = [
  { id: 'study',    name: 'Études',    color: '#8b5cf6', label: 'Études'    },
  { id: 'work',     name: 'Travail',   color: '#06b6d4', label: 'Travail'   },
  { id: 'fitness',  name: 'Sport',     color: '#22c55e', label: 'Sport'     },
  { id: 'personal', name: 'Personnel', color: '#f59e0b', label: 'Personnel' },
  { id: 'meeting',  name: 'Réunion',   color: '#ec4899', label: 'Réunion'   },
  { id: 'creative', name: 'Créatif',   color: '#ef4444', label: 'Créatif'   },
]
 
export const priorities = [
  { id: 'low',    name: 'Faible', color: '#22c55e' },
  { id: 'medium', name: 'Moyen',  color: '#f59e0b' },
  { id: 'high',   name: 'Élevé',  color: '#ef4444' },
]
 
export const sessionTypes = [
  { id: 'deep-work', name: 'Travail profond', duration: 45, color: 'from-purple-500 to-blue-500'  },
  { id: 'pomodoro',  name: 'Pomodoro',        duration: 25, color: 'from-cyan-500 to-teal-500'    },
  { id: 'study',     name: 'Études',          duration: 50, color: 'from-pink-500 to-rose-500'    },
  { id: 'creative',  name: 'Créatif',         duration: 60, color: 'from-amber-500 to-orange-500' },
]
 
export function getSessionName(type: string): string {
  return sessionTypes.find(s => s.id === type)?.name ?? type
}
 
export function getTaskXP(priority: string): number {
  if (priority === 'high')   return XP_RULES.TASK_HIGH
  if (priority === 'medium') return XP_RULES.TASK_MEDIUM
  return XP_RULES.TASK_LOW
}
 
// ─── Utilitaire dates ────────────────────────────────────────────────────────
function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}
 
function todayKey(): string {
  return toDateKey(new Date())
}
 
function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateKey(d)
}
 
// ─── Calcul du nouveau streak ─────────────────────────────────────────────────
// lastSessionDate : date (YYYY-MM-DD) de la dernière session AVANT celle qu'on crée
// currentStreak   : valeur actuelle du streak dans le profil
function calcNewStreak(lastSessionDate: string | null, currentStreak: number): number {
  if (!lastSessionDate) return 1           // première session ever
 
  const today     = todayKey()
  const yesterday = yesterdayKey()
 
  if (lastSessionDate === today)     return currentStreak  // déjà focusé aujourd'hui
  if (lastSessionDate === yesterday) return currentStreak + 1 // hier → on continue
  return 1                                                 // trop vieux → on repart à 1
}
 
// ─── Profile ─────────────────────────────────────────────────────────────────
function normalizeProfile(data: any): Profile | null {
  if (!data) return null
  const level = data.level ?? 1
  return {
    id:                data.id,
    name:              data.name ?? data.full_name ?? null,
    full_name:         data.full_name ?? data.name ?? null,
    avatar_url:        data.avatar_url ?? null,
    level,
    xp:                data.xp ?? 0,
    xp_to_next_level:  xpForLevel(level),
    streak:            data.streak ?? 0,
    total_focus_hours: data.total_focus_hours ?? 0,
    sessions_completed:data.sessions_completed ?? 0,
    productivity_score:data.productivity_score ?? 0,
    joined_date:       data.joined_date ?? data.created_at ?? new Date().toISOString(),
  }
}
 
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return normalizeProfile(data)
}
 
export async function updateProfile(updates: Partial<Profile>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
  if (error) throw error
}
 
// ─── Ajout XP centralisé ─────────────────────────────────────────────────────
export async function addXP(amount: number): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
 
  const { data: profile } = await supabase
    .from('profiles').select('xp, level').eq('id', user.id).single()
  if (!profile) return
 
  let newXP    = (profile.xp ?? 0) + amount
  let newLevel = profile.level ?? 1
 
  while (newXP >= xpForLevel(newLevel)) {
    newXP -= xpForLevel(newLevel)
    newLevel++
  }
 
  await supabase.from('profiles').update({
    xp: newXP,
    level: newLevel,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)
}
 
// ─── Todos ────────────────────────────────────────────────────────────────────
export async function getTodos(): Promise<Todo[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('todos').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return (data ?? []).map(t => ({ ...t, xp_reward: getTaskXP(t.priority) }))
}
 
export async function createTodo(
  todo: Omit<Todo, 'id' | 'user_id' | 'created_at'>
): Promise<Todo | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const xp_reward = getTaskXP(todo.priority)
  const { data, error } = await supabase
    .from('todos')
    .insert({ ...todo, xp_reward, user_id: user.id })
    .select().single()
  if (error) throw error
  return data
}
 
export async function updateTodo(id: string, updates: Partial<Todo>) {
  const supabase = createClient()
 
  if (updates.completed === true) {
    const { data: todo } = await supabase
      .from('todos').select('priority, completed').eq('id', id).single()
    if (todo && !todo.completed) {
      const xp = getTaskXP(todo.priority)
      await addXP(xp)
    }
  }
 
  const { error } = await supabase
    .from('todos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
 
export async function deleteTodo(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('todos').delete().eq('id', id)
  if (error) throw error
}
 
// ─── Planner ──────────────────────────────────────────────────────────────────
export function getWeekStart(offsetWeeks = 0): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + offsetWeeks * 7)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
 
export async function getPlannerTasks(weekStart: string): Promise<PlannerTask[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('planner_tasks').select('*').eq('user_id', user.id).eq('week_start', weekStart)
    .order('start_hour', { ascending: true })
  return data ?? []
}
 
export async function createPlannerTask(
  task: Omit<PlannerTask, 'id' | 'user_id'>
): Promise<PlannerTask | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('planner_tasks').insert({ ...task, user_id: user.id }).select().single()
  if (error) throw error
  return data
}
 
export async function updatePlannerTask(id: string, updates: Partial<PlannerTask>) {
  const supabase = createClient()
  const { error } = await supabase
    .from('planner_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
 
export async function deletePlannerTask(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('planner_tasks').delete().eq('id', id)
  if (error) throw error
}
 
// ─── Focus Sessions ───────────────────────────────────────────────────────────
export async function getRecentSessions(limit = 10): Promise<FocusSession[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('focus_sessions').select('*').eq('user_id', user.id)
    .order('completed_at', { ascending: false }).limit(limit)
  return data ?? []
}
 
export async function createFocusSession(session: {
  session_type: string
  duration: number
  xp_earned?: number
}): Promise<FocusSession | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
 
  // Charger le profil complet
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('xp, level, sessions_completed, total_focus_hours, streak, last_session_date')
    .eq('id', user.id).single()
 
  const currentStreak    = currentProfile?.streak ?? 0
  const lastSessionDate  = currentProfile?.last_session_date ?? null
 
  // ── CALCUL STREAK ──────────────────────────────────────────────────────────
  const newStreak = calcNewStreak(lastSessionDate, currentStreak)
 
  // XP = 1 par minute + bonus streak
  const streakBonus = newStreak * XP_RULES.STREAK_BONUS_PER_DAY
  const xp_earned   = (session.duration * XP_RULES.FOCUS_PER_MINUTE) + streakBonus
 
  // Insérer la session
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({ ...session, xp_earned, user_id: user.id })
    .select().single()
  if (error) throw error
 
  // Mise à jour profil avec streak + last_session_date
  const hoursToAdd = session.duration / 60
  let newXP    = (currentProfile?.xp ?? 0) + xp_earned
  let newLevel = currentProfile?.level ?? 1
  while (newXP >= xpForLevel(newLevel)) {
    newXP -= xpForLevel(newLevel)
    newLevel++
  }
 
  await supabase.from('profiles').update({
    xp:                 newXP,
    level:              newLevel,
    sessions_completed: (currentProfile?.sessions_completed ?? 0) + 1,
    total_focus_hours:  (currentProfile?.total_focus_hours ?? 0) + hoursToAdd,
    streak:             newStreak,
    last_session_date:  todayKey(),   // ← enregistre la date de la session
    updated_at:         new Date().toISOString(),
  }).eq('id', user.id)
 
  return data
}
 
export async function getWeeklyActivity(): Promise<
  { day: string; hours: number; sessions: number }[]
> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
 
  const weekStart = getWeekStart()
  const weekEnd   = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
 
  const { data } = await supabase
    .from('focus_sessions').select('duration, completed_at').eq('user_id', user.id)
    .gte('completed_at', weekStart)
    .lt('completed_at', weekEnd.toISOString().split('T')[0])
 
  const days   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
  const result = days.map(day => ({ day, hours: 0, sessions: 0 }))
 
  for (const session of data ?? []) {
    const date     = new Date(session.completed_at)
    const dayIndex = (date.getDay() + 6) % 7
    result[dayIndex].hours    += session.duration / 60
    result[dayIndex].sessions += 1
  }
 
  return result
}
 
// ─── Habitudes — XP ───────────────────────────────────────────────────────────
export async function addHabitXP(): Promise<void> {
  await addXP(XP_RULES.HABIT)
}
 
// ─── Journal — XP ─────────────────────────────────────────────────────────────
export async function addJournalXP(): Promise<void> {
  await addXP(XP_RULES.JOURNAL)
}
 