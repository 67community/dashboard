"use client"
import { useEffect } from "react"

export function useTheme() {
  useEffect(() => {
    // Always dark — clear any saved light preference
    localStorage.removeItem("67_theme")
    document.documentElement.setAttribute("data-theme", "dark")
  }, [])

  return { dark: true, toggle: () => {} }
}
