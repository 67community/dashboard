"use client"

import { useCallback, useEffect, useRef } from "react"
import { useAppData } from "@/lib/data-context"
import Map, { Source, Layer } from "react-map-gl"
import type { LayerProps } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"

const TOKEN = "pk.eyJ1IjoiaGFua2M5NyIsImEiOiJjbHp1ZWVlZjkydnIwMmpxN3U1M2Q1Mnk4In0.HK2HeTQ9FBpN1jvOcJbcdg"
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
    <div style={{ borderRadius: 0, overflow: "hidden", width: "100%", height: "100%", minHeight: 200, position: "relative" }}>
      {/* Hide Mapbox logo + attribution */}
      <style>{`.mapboxgl-ctrl-logo,.mapboxgl-ctrl-attrib{display:none!important}`}</style>
      <Map
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: -96.9658554808913, latitude: 32.565216899136544, zoom: 2 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        projection={{ name: "globe" } as any}
        attributionControl={false}
        logoPosition="bottom-right"
        onLoad={onMapLoad}
      >
        <Source id="chonkys" type="geojson" data={features} cluster clusterMaxZoom={14} clusterRadius={50}>
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredLayer} />
        </Source>
      </Map>
    </div>
  )
}
