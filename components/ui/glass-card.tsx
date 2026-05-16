"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  glow?: "purple" | "cyan" | "none"
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = "none",
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl",
        "transition-all duration-300",
        hover && "hover:bg-white/[0.06] hover:border-white/[0.12]",
        glow === "purple" && "shadow-[0_0_60px_rgba(147,51,234,0.15)]",
        glow === "cyan" && "shadow-[0_0_60px_rgba(34,211,238,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
