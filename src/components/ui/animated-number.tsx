"use client"

import { useCountUp } from "@/lib/use-count-up"

interface Props {
  value: number
  format: (n: number) => string
  duration?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders a number that counts up from 0 → value when first mounted.
 * Apple-style ease-out-quart curve.
 */
export function AnimatedNumber({ value, format, duration = 900, className, style }: Props) {
  const current = useCountUp(value, duration)
  return (
    <span className={className} style={style}>
      {format(current)}
    </span>
  )
}
