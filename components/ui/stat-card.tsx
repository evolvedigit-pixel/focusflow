"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: "violet" | "cyan" | "amber" | "green" | "pink";
  delay?: number;
  sublabel?: string;
}

const accentMap = {
  violet: "from-violet-500/20 to-violet-500/0 text-violet-300",
  cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-300",
  amber: "from-amber-500/20 to-amber-500/0 text-amber-300",
  green: "from-green-500/20 to-green-500/0 text-green-300",
  pink: "from-pink-500/20 to-pink-500/0 text-pink-300",
};

export function StatCard({ label, value, icon, accent = "violet", delay = 0, sublabel }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-xl"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-60 transition-opacity group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white/90 tabular-nums">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-white/40">{sublabel}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ${accentMap[accent].split(" ").pop()}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}