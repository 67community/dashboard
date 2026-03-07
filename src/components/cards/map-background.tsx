"use client"
import { useEffect, useRef } from "react"

export function MapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let t = 0

    function resize() {
      if (!canvas) return
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Simple dot-grid world map coordinates (lon/lat → x/y)
    const dots: [number, number][] = []
    for (let lon = -170; lon <= 170; lon += 6) {
      for (let lat = -80; lat <= 80; lat += 5) {
        dots.push([lon, lat])
      }
    }

    function project(lon: number, lat: number, w: number, h: number, offsetX: number) {
      const x = ((lon + 180 + offsetX) % 360) / 360 * w
      const y = (90 - lat) / 180 * h
      return [x, y]
    }

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const scroll = (t * 0.015) % 360

      for (const [lon, lat] of dots) {
        const [x, y] = project(lon, lat, w, h, scroll)
        const pulse = 0.3 + 0.15 * Math.sin(t * 0.04 + lon * 0.05 + lat * 0.07)
        ctx.beginPath()
        ctx.arc(x, y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,166,35,${pulse})`
        ctx.fill()
      }

      // Glowing nodes
      const nodes = [[-74,40],[2,48],[139,35],[28,41],[-43,-22],[151,-33],[37,55],[103,1]]
      for (const [lon, lat] of nodes) {
        const [x, y] = project(lon, lat, w, h, scroll)
        const glow = 0.6 + 0.4 * Math.sin(t * 0.08 + lon)
        const r = 3 + 2 * Math.sin(t * 0.06 + lat)
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
        grad.addColorStop(0, `rgba(245,166,35,${glow})`)
        grad.addColorStop(1, "rgba(245,166,35,0)")
        ctx.beginPath()
        ctx.arc(x, y, r * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,200,80,${glow})`
        ctx.fill()
      }

      t++
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width:"100%", height:"100%", position:"absolute", inset:0, display:"block" }}
    />
  )
}
