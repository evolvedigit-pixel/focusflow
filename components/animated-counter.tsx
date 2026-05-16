"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const incrementTime = duration / end
    const timer = setInterval(() => {
      start += Math.ceil(end / 50)
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  )
}
