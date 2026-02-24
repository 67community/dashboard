"use client"

import { createContext, useContext, ReactNode } from "react"
import { useData, useLivePrice, DashboardData } from "./use-data"

interface DataContextType {
  data: DashboardData | null
  loading: boolean
  error: string | null
  lastFetched: Date | null
  refresh: () => void
  livePrice: number | null
  liveChange24h: number | null
  liveMcap: number | null
}

const DataContext = createContext<DataContextType>({
  data: null, loading: true, error: null, lastFetched: null,
  refresh: () => {}, livePrice: null, liveChange24h: null, liveMcap: null,
})

export function DataProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, lastFetched, refresh } = useData(120_000)
  const { price: livePrice, change24h: liveChange24h, mcap: liveMcap } = useLivePrice()

  return (
    <DataContext.Provider value={{ data, loading, error, lastFetched, refresh, livePrice, liveChange24h, liveMcap }}>
      {children}
    </DataContext.Provider>
  )
}

export const useAppData = () => useContext(DataContext)
