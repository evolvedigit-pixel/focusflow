import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────
export type Profile = {
  id: string
  name: string | null
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
  priority: 'Faible' | 'Moyen' | 'Eleve'
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
  type: string
  duration: number
  xp_earned: number
  completed_at: string
}

// ─── Static config (no longer from mock-data) ────────────
export const taskCategories = [
  { id: 'study', name: 'Etudes', color: '#8b5cf6' },
  { id: 'work', name: 'Travail', color: '#06b6d4' },
  { id: 'Sport', name: 'Sport', color: '#22c55e' },
  { id: 'Personnel', name: 'Personnel', color: '#f59e0b' },
  { id: 'Reunion', name: 'Reunion', color: '#ec4899' },
  { id: 'creative', name: 'Creatif', color: '#ef4444' },
]

export const priorities = [
  { id: 'Faible', name: 'Faible', color: '#22c55e' },
  { id: 'Moyen', name: 'Moyen', color: '#f59e0b' },
  { id: 'Eleve', name: 'Eleve', color: '#ef4444' },
]

export const sessionTypes = [
  { id: 'deep-work', name: 'Travail profond', duration: 45, color: 'from-purple-500 to-blue-500' },
  { id: 'pomodoro', name: 'Pomodoro', duration: 25, color: 'from-cyan-500 to-teal-500' },
  { id: 'study', name: 'Etudes', duration: 50, color: 'from-pink-500 to-rose-500' },
  { id: 'creative', name: 'Creatif', duration: 60, color: 'from-amber-500 to-orange-500' },
]

// ─── Profile ──────────────────────────────────────────────
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
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

// ─── Todos ────────────────────────────────────────────────
export async function getTodos(): Promise<Todo[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createTodo(todo: Omit<Todo, 'id' | 'user_id' | 'created_at'>): Promise<Todo | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('todos')
    .insert({ ...todo, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTodo(id: string, updates: Partial<Todo>) {
  const supabase = createClient()
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

// ─── Planner Tasks ────────────────────────────────────────
export function getWeekStart(offsetWeeks = 0): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday
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
    .from('planner_tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .order('start_hour', { ascending: true })
  return data ?? []
}

export async function createPlannerTask(task: Omit<PlannerTask, 'id' | 'user_id'>): Promise<PlannerTask | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({ ...task, user_id: user.id })
    .select()
    .single()
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

// ─── Focus Sessions ───────────────────────────────────────
export async function getRecentSessions(limit = 10): Promise<FocusSession[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function createFocusSession(session: Omit<FocusSession, 'id' | 'user_id' | 'completed_at'>): Promise<FocusSession | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({ ...session, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  // Also update profile stats
  const profile = await getProfile()
  if (profile) {
    const newXP = profile.xp + session.xp_earned
    const newHours = profile.total_focus_hours + session.duration / 60
    await updateProfile({
      xp: newXP,
      sessions_completed: profile.sessions_completed + 1,
      total_focus_hours: newHours,
    })
  }
  return data
}

export async function getWeeklyActivity(): Promise<{ day: string; hours: number; sessions: number }[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const { data } = await supabase
    .from('focus_sessions')
    .select('duration, completed_at')
    .eq('user_id', user.id)
    .gte('completed_at', weekStart)
    .lt('completed_at', weekEnd.toISOString().split('T')[0])

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const result = days.map((day) => ({ day, hours: 0, sessions: 0 }))

  for (const session of data ?? []) {
    const date = new Date(session.completed_at)
    const dayIndex = (date.getDay() + 6) % 7 // Mon=0
    result[dayIndex].hours += session.duration / 60
    result[dayIndex].sessions += 1
  }

  return result
}
