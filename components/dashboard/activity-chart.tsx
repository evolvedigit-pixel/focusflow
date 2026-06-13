"use client";

import { motion } from "framer-motion";

interface ActivityChartProps {
  data: { day: string; minutes: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const max = Math.max(...data.map((d) => d.minutes), 60);

  return (
    <div className="flex h-44 items-end justify-between gap-2">
      {data.map((d, i) => {
        const height = (d.minutes / max) * 100;
        return (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full overflow-hidden rounded-lg bg-gradient-to-t from-violet-500 to-cyan-400"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              </motion.div>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}