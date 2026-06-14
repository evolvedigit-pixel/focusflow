"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Flame,
  Target,
  Trophy,
  Calendar,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Timer,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high" | null;
  due_date: string | null;
  category: string | null;
};

type FocusSession = {
  id: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
};

type Profile = { id: string; full_name: string | null; xp: number; level: number };

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [weekSessions, setWeekSessions] = useState<FocusSession[]>([]);
  const [habitsDone, setHabitsDone] = useState(0);
  const [habitsTotal, setHabitsTotal] = useState(0);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const [profileRes, tasksRes, sessionsRes, weekRes, habitsRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, xp, level").eq("id", user.id).single(),
        supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
        supabase.from("focus_sessions").select("*").eq("user_id", user.id).gte("started_at", todayStart.toISOString()),
        supabase.from("focus_sessions").select("*").eq("user_id", user.id).gte("started_at", weekStart.toISOString()),
        supabase.from("habits").select("id").eq("user_id", user.id),
        supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).gte("completed_at", todayStart.toISOString()),
      ]);

      if (cancelled) return;
      setProfile(profileRes.data as Profile);
      setTasks((tasksRes.data ?? []) as Task[]);
      setSessions((sessionsRes.data ?? []) as FocusSession[]);
      setWeekSessions((weekRes.data ?? []) as FocusSession[]);
      setHabitsTotal(habitsRes.data?.length ?? 0);
      setHabitsDone(new Set((logsRes.data ?? []).map((l: any) => l.habit_id)).size);
      setActiveSession(((sessionsRes.data ?? []) as FocusSession[]).find((s) => !s.ended_at) ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "focus_sessions" }, (payload) => {
        const row = payload.new as FocusSession;
        if (payload.eventType === "INSERT") {
          setSessions((prev) => [...prev, row]);
          if (!row.ended_at) setActiveSession(row);
        } else if (payload.eventType === "UPDATE") {
          setSessions((prev) => prev.map((s) => (s.id === row.id ? row : s)));
          setActiveSession(row.ended_at ? null : row);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        if (payload.eventType === "INSERT") setTasks((p) => [payload.new as Task, ...p].slice(0, 8));
        if (payload.eventType === "UPDATE") setTasks((p) => p.map((t) => (t.id === (payload.new as Task).id ? (payload.new as Task) : t)));
        if (payload.eventType === "DELETE") setTasks((p) => p.filter((t) => t.id !== (payload.old as Task).id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const focusMinutesToday = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskRatio = tasks.length ? completedTasks / tasks.length : 0;
  const focusRatio = Math.min(focusMinutesToday / 120, 1);
  const habitRatio = habitsTotal ? habitsDone / habitsTotal : 0;
  const productivityScore = Math.round((taskRatio * 0.4 + focusRatio * 0.4 + habitRatio * 0.2) * 100);

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForNext = level * 100;
  const xpProgress = Math.min((xp % xpForNext) / xpForNext, 1) * 100;

  const weeklyData = DAYS_FR.map((day, idx) => {
    const target = new Date();
    target.setDate(target.getDate() - (6 - idx));
    target.setHours(0, 0, 0, 0);
    const next = new Date(target);
    next.setDate(next.getDate() + 1);
    const minutes = weekSessions
      .filter((s) => {
        const t = new Date(s.started_at).getTime();
        return t >= target.getTime() && t < next.getTime();
      })
      .reduce((a, s) => a + (s.duration_minutes || 0), 0);
    return { day, minutes };
  });

  const hours = Math.floor(focusMinutesToday / 60);
  const minutes = focusMinutesToday % 60;
  const todayTasks = tasks.filter((t) => !t.completed).slice(0, 5);
  const p = profile;

  return (
    <div className="min-h-screen bg-[#050508] p-4 md:p-8 space-y-6">

      {/* ── 1) HERO ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative overflow-hidden rounded-[36px] border border-white/[0.07] bg-white/[0.03] p-8 lg:p-10 backdrop-blur-xl">
          {/* Halos */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_280px]">
            <div>
              <span className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.25em] text-white/60 uppercase">
                Daily Focus
              </span>

              <h1 className="mt-2 text-4xl font-bold leading-tight lg:text-5xl">
                {greeting()}, {p?.full_name?.split(" ")[0] ?? "Champion"} 👋
              </h1>

              <p className="mt-4 max-w-xl text-lg text-white/50">
                "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus."
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/focus">
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_15px_50px_rgba(139,92,246,0.35)] hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(139,92,246,0.45)] transition-all">
                    <Timer className="h-5 w-5" />
                    Commencer une session
                  </button>
                </Link>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white/70">
                  🔥 Série actuelle : <span className="ml-1 font-bold text-white">0 jours</span>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white/70">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                  Niveau {level}
                  <div className="ml-2 h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                    />
                  </div>
                  <span className="text-xs text-white/40">{xp % xpForNext}/{xpForNext} XP</span>
                </div>

                <LiveIndicator active={!!activeSession} />
              </div>
            </div>

            {/* Avatar */}
            <div className="flex items-center justify-center">
              <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="text-[90px] select-none">🧘‍♂️</div>
                <div className="absolute -right-2 top-8 text-2xl select-none">✨</div>
                <div className="absolute left-2 bottom-8 text-xl select-none">🌙</div>
                <div className="absolute right-10 bottom-2 text-lg select-none">⭐</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2) STAT CARDS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Score d'attention", value: `${productivityScore}%`, icon: Target, accent: "violet", sublabel: "aujourd'hui" },
          { label: "Temps focus", value: hours > 0 ? `${hours}h${String(minutes).padStart(2, "0")}` : `${minutes}m`, icon: Clock, accent: "cyan", sublabel: `${sessions.length} sessions` },
          { label: "Tâches", value: `${completedTasks}/${tasks.length}`, icon: CheckCircle2, accent: "green", sublabel: "complétées" },
          { label: "Habitudes", value: `${habitsDone}/${habitsTotal}`, icon: Flame, accent: "amber", sublabel: "aujourd'hui" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <StatCard
              label={card.label}
              value={card.value}
              icon={<card.icon className="h-6 w-6" />}
              accent={card.accent as any}
              delay={0.1 + i * 0.05}
              sublabel={card.sublabel}
              className="rounded-[28px] p-6 min-h-[150px]"
            />
          </motion.div>
        ))}
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Plan du jour */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-2"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-300" />
              <h2 className="text-lg font-semibold text-white/90">Plan du jour</h2>
            </div>
            <span className="text-xs text-white/40">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-2xl bg-white/[0.03]" />
              ))}
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
                <Sparkles className="h-5 w-5 text-violet-300" />
              </div>
              <p className="text-sm text-white/60">Aucune tâche en attente. Profitez du calme.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((task, i) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-xl hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-300"
                >
                  <div className={`h-2 w-2 rounded-full ${
                    task.priority === "high" ? "bg-pink-400" :
                    task.priority === "medium" ? "bg-amber-400" : "bg-cyan-400"
                  }`} />
                  <span className="flex-1 text-sm text-white/80">{task.title}</span>
                  {task.category && (
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                      {task.category}
                    </span>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-violet-500/10 via-white/[0.03] to-cyan-500/10 p-6 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white/90">Temps de travail</h2>
              </div>
              <LiveIndicator active={!!activeSession} />
            </div>

            <div className="mt-6 text-center">
              <motion.div
                key={focusMinutesToday}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold tracking-tight text-white/90 tabular-nums"
              >
                {hours > 0 ? `${hours}h${String(minutes).padStart(2, "0")}` : `${minutes}min`}
              </motion.div>
              <p className="mt-2 text-xs uppercase tracking-wider text-white/40">objectif 2h00</p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${focusRatio * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                />
              </div>
            </div>

            <Link
              href="/focus"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(139,92,246,0.25)] hover:scale-[1.02] hover:shadow-[0_15px_50px_rgba(139,92,246,0.35)] transition-all"
            >
              <Timer className="h-4 w-4" />
              {activeSession ? "Reprendre la session" : "Démarrer une session"}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── 3) ACTIVITÉ ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.03] p-7 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-semibold text-white/90">Activité des 7 derniers jours</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Trophy className="h-4 w-4 text-amber-300" />
            Total : {Math.round(weekSessions.reduce((a, s) => a + (s.duration_minutes || 0), 0) / 60)}h
          </div>
        </div>
        <div className="relative">
          <ActivityChart data={weeklyData} />
        </div>
      </motion.div>

    </div>
  );
}
