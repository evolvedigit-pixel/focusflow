"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hover
          ? {
              y: -6,
              transition: {
                duration: 0.25,
              },
            }
          : undefined
      }
      className={cn(
        "group relative overflow-hidden rounded-[30px]",

        /* Base */
        "border border-white/[0.08]",
        "bg-[rgba(12,15,25,0.72)]",
        "backdrop-blur-[30px]",

        /* Shadow */
        "shadow-[0_20px_60px_rgba(0,0,0,0.35)]",

        /* Smooth transitions */
        "transition-all duration-300",

        hover &&
          "hover:border-white/[0.12] hover:bg-[rgba(15,18,28,0.82)]",

        glow === "purple" &&
          "hover:shadow-[0_25px_80px_rgba(139,92,246,0.18)]",

        glow === "cyan" &&
          "hover:shadow-[0_25px_80px_rgba(56,189,248,0.18)]",

        className
      )}
      {...props}
    >
      {/* Top reflection */}
      <div
        className="
          pointer-events-none absolute inset-0 rounded-[30px]
          bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%)]
        "
      />

      {/* Purple glow */}
      {glow === "purple" && (
        <div
          className="
            pointer-events-none absolute -top-28 -right-24
            h-52 w-52 rounded-full blur-3xl
            bg-violet-500/10
            opacity-70
            transition-opacity duration-500
            group-hover:opacity-100
          "
        />
      )}

      {/* Cyan glow */}
      {glow === "cyan" && (
        <div
          className="
            pointer-events-none absolute -bottom-24 -left-20
            h-52 w-52 rounded-full blur-3xl
            bg-cyan-400/10
            opacity-70
            transition-opacity duration-500
            group-hover:opacity-100
          "
        />
      )}

      {/* Internal highlight */}
      <div
        className="
          pointer-events-none absolute inset-[1px]
          rounded-[29px]
          border border-white/[0.04]
        "
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}