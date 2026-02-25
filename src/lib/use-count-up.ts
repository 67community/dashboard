"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Apple-style number count-up animation.
 * When `target` changes from 0 → value, smoothly animates up.
 */
export function useCountUp(target: number, duration = 900): number {
  const [display, setDisplay] = useState(0)
  const frame = useRef<number | null>(null)
  const startTs = useRef<number | null>(null)
  const startVal = useRef(0)

  useEffect(() => {
    if (target === 0) { setDisplay(0); return }

    const from = startVal.current
    startTs.current = null

    const tick = (ts: number) => {
      if (!startTs.current) startTs.current = ts
      const progress = Math.min((ts - startTs.current) / duration, 1)
      // Apple-style easing: ease-out-quart
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplay(from + (target - from) * eased)
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        setDisplay(target)
        startVal.current = target
      }
    }

    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(tick)
    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [target, duration])

  return display
}
