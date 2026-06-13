"use client";

import { motion } from "framer-motion";

export function LiveIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="h-1.5 w-1.5 rounded-full bg-green-400"
      />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-green-300">En direct</span>
    </div>
  );
}