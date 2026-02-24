"use client"

import { useState, ReactNode } from "react"
import { X, Maximize2 } from "lucide-react"

interface DashboardCardProps {
  title: string
  icon: ReactNode
  accentColor?: string
  collapsed: ReactNode
  expanded: ReactNode
  className?: string
}

export function DashboardCard({
  title,
  icon,
  accentColor = "#F5A623",
  collapsed,
  expanded,
  className = "",
}: DashboardCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Grid card */}
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm card-hover cursor-pointer overflow-hidden ${className}`}
        onClick={() => setIsOpen(true)}
      >
        {/* Card top accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

        {/* Card header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <span style={{ color: accentColor }}>{icon}</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">{title}</span>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-gray-300" />
        </div>

        {/* Collapsed content */}
        <div className="px-5 pb-5">{collapsed}</div>
      </div>

      {/* Expanded modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full sm:max-w-3xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal header */}
            <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}18` }}
                >
                  <span style={{ color: accentColor }}>{icon}</span>
                </div>
                <h2 className="text-base font-bold text-gray-900">{title}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal content */}
            <div className="overflow-y-auto flex-1 p-6">{expanded}</div>
          </div>
        </div>
      )}
    </>
  )
}
