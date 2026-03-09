"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAppData } from "@/lib/data-context"
import Map, { Source, Layer } from "react-map-gl"
import type { LayerProps } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"

const TOKEN = "***REMOVED_MAPBOX_TOKEN***"
const COMMUNITY_IMG = "https://www.67coin.com/page-logo/community.png"

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "symbol",
  source: "chonkys",
  filter: ["has", "point_count"],
  layout: {
    "icon-image": ["step", ["get", "point_count"], "small-cluster", 100, "medium-cluster", 750, "large-cluster"],
    "icon-size": 0.08,
    "icon-allow-overlap": true,
  },
}

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "chonkys",
  filter: ["has", "point_count"],
  paint: {
    "text-halo-color": "#ffffff",
    "text-halo-width": 2,
    "text-halo-blur": 1,
  },
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 14,
    "text-anchor": "top-left",
    "text-offset": [0.8, 0.8],
    "text-allow-overlap": true,
  },
}

const unclusteredLayer: LayerProps = {
  id: "unclustered-point",
  type: "symbol",
  source: "chonkys",
  filter: ["!", ["has", "point_count"]],
  layout: {
    "icon-image": "chonky-point",
    "icon-size": 0.08,
    "icon-allow-overlap": true,
  },
}

export function MapWidgetCard() {
  const { data } = useAppData()
  const features = (data as any)?.map_features ?? { type: "FeatureCollection", features: [] }
  const mapRef = useRef<any>(null)
  const rafRef = useRef<number>()

  const onMapLoad = useCallback(async () => {
    const map = mapRef.current?.getMap()
    if (!map) return

    try {
      const res = await fetch(COMMUNITY_IMG)
      const blob = await res.blob()
      const img = await createImageBitmap(blob)
      map.addImage("small-cluster", img)
      map.addImage("medium-cluster", img)
      map.addImage("large-cluster", img)
      map.addImage("chonky-point", img)
    } catch (e) {
      console.error("Failed to load community icon:", e)
    }

    // Auto-rotate
    let rotating = true
    const canvas = map.getCanvas()
    canvas.addEventListener("mousedown", () => { rotating = false })
    canvas.addEventListener("mouseup",   () => { setTimeout(() => { rotating = true; spin() }, 3000) })

    function spin() {
      if (!rotating) return
      map.easeTo({ center: [map.getCenter().lng + 0.3, map.getCenter().lat], duration: 60, easing: (t: number) => t })
      rafRef.current = requestAnimationFrame(spin)
    }
    spin()
  }, [])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "var(--card-bg, #111)" }}>
      {/* Pin Admin only */}
      <MapAdminPanel />
    </div>
  )
}
interface MapSub { id: string; title: string; location: string; description: string; credit: string; time: string; image: string | null; media_count: number }

function MapAdminPanel() {
  const [items, setItems] = useState<MapSub[]>([])
  const [approved, setApproved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("map_approved") || "[]")) } catch { return new Set() }
  })
  const [rejected, setRejected] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("map_rejected") || "[]")) } catch { return new Set() }
  })
  const [filter, setFilter] = useState<"all"|"pending"|"approved">("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/map-admin").then(r => r.json()).then(d => {
      const items = d.items ?? []
      // Auto-approve items older than 7 days
      const cutoff = Date.now() - 24 * 60 * 60 * 1000
      const autoApproved = items
        .filter((s: any) => new Date(s.time).getTime() < cutoff)
        .map((s: any) => s.id)
      if (autoApproved.length > 0) {
        setApproved(prev => {
          const next = new Set([...prev, ...autoApproved])
          localStorage.setItem("map_approved", JSON.stringify([...next]))
          return next
        })
      }
      setItems(items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = items.filter(s => {
    if (filter === "pending"  && approved.has(s.id)) return false
    if (filter === "pending"  && rejected.has(s.id)) return false
    if (filter === "approved" && !approved.has(s.id)) return false
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.credit.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getStatus = (id: string) => approved.has(id) ? "approved" : rejected.has(id) ? "rejected" : "pending"

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "var(--card-bg, #111)", maxHeight: 420, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>📍 Pin Admin</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{items.length} submissions</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          {(["all","pending","approved"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "3px 10px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
              background: filter === f ? "#F5A623" : "rgba(255,255,255,0.08)", color: filter === f ? "#000" : "rgba(255,255,255,0.6)" }}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or credit…"
          style={{ width: "100%", padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11, boxSizing: "border-box" as any }} />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>No submissions</div>
      ) : (
        filtered.map(sub => {
          const st = getStatus(sub.id)
          return (
            <div key={sub.id} style={{ display: "flex", gap: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" }}>
              {/* Image */}
              <div style={{ width: 48, height: 48, borderRadius: 8, background: "rgba(255,255,255,0.06)", flexShrink: 0, overflow: "hidden" }}>
                {sub.image ? <img src={sub.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 18 }}>📍</span>}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.title || "Untitled"}</p>
                {sub.location && <p style={{ margin: "0 0 1px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>📍 {sub.location}</p>}
                {sub.credit && <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>by {sub.credit}</p>}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                  background: st === "approved" ? "rgba(34,197,94,0.15)" : st === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,166,35,0.15)",
                  color: st === "approved" ? "#22C55E" : st === "rejected" ? "#EF4444" : "#F5A623" }}>
                  {st.toUpperCase()}
                </span>
              </div>
              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                <button onClick={() => setApproved(p => { const n = new Set(p); n.add(sub.id); localStorage.setItem("map_approved", JSON.stringify([...n])); return n })} disabled={st === "approved"}
                  style={{ padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
                    background: st === "approved" ? "rgba(34,197,94,0.2)" : "#22C55E", color: st === "approved" ? "#22C55E" : "#fff", opacity: st === "rejected" ? 0.4 : 1 }}>
                  ✓ Approve
                </button>
                <button onClick={() => setRejected(p => { const n = new Set(p); n.add(sub.id); localStorage.setItem("map_rejected", JSON.stringify([...n])); return n })} disabled={st === "rejected"}
                  style={{ padding: "3px 8px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700,
                    background: "transparent", border: "1px solid #EF4444", color: "#EF4444", opacity: st === "approved" ? 0.4 : 1 }}>
                  ✕ Reject
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
