"use client"
import { useEffect, useRef } from "react"

const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFua2M5NyIsImEiOiJjbHp1ZWVlZjkydnIwMmpxN3U1M2Q1Mnk4In0.HK2HeTQ9FBpN1jvOcJbcdg"

export function MapBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: any
    async function init() {
      const mapboxgl = (await import("mapbox-gl")).default
      if (!ref.current) return
      mapboxgl.accessToken = MAPBOX_TOKEN
      map = new mapboxgl.Map({
        container: ref.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20],
        zoom: 1.5,
        interactive: false,
        attributionControl: false,
      })
      map.on("load", () => {
        map.addSource("bg-pins", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        })
        map.addLayer({ id: "bg-clusters", type: "circle", source: "bg-pins",
          filter: ["has", "point_count"],
          paint: { "circle-color": "#F5A623", "circle-radius": 18, "circle-opacity": 0.85 } })
        map.addLayer({ id: "bg-chonkys", type: "circle", source: "bg-pins",
          filter: ["!", ["has", "point_count"]],
          paint: { "circle-color": "#F5A623", "circle-radius": 8, "circle-opacity": 0.9 } })
        map.addLayer({ id: "bg-cluster-count", type: "symbol", source: "bg-pins",
          filter: ["has", "point_count"],
          layout: { "text-field": "{point_count_abbreviated}", "text-size": 12 },
          paint: { "text-color": "#000" } })
        map.addLayer({ id: "bg-unclustered-point", type: "circle", source: "bg-pins",
          filter: ["!", ["has", "point_count"]],
          paint: { "circle-color": "#F5A623", "circle-radius": 5 } })
      })
    }
    init()
    return () => { map?.remove() }
  }, [])

  return <div ref={ref} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
}
