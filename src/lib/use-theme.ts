"use client"
import { useEffect, useState } from "react"

export function useTheme() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("67_theme")
    const isDark = saved ? saved === "dark" : true  // default: dark
    setDark(isDark)
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
    localStorage.setItem("67_theme", next ? "dark" : "light")
  }

  return { dark, toggle }
}
