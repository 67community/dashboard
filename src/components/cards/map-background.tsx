"use client"
import { useCallback, useEffect, useRef } from "react"
import Map from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

export function MapBackground() {
  const mapRef = useRef<any>(null)
  const rafRef = useRef<number>()

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    function spin() {
      map.easeTo({ center: [map.getCenter().lng + 0.3, map.getCenter().lat], duration: 60, easing: (t: number) => t })
      rafRef.current = requestAnimationFrame(spin)
    }
    spin()
  }, [])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  return (
    <>
      <style>{`.mapboxgl-ctrl-logo,.mapboxgl-ctrl-attrib{display:none!important}`}</style>
      <Map
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        projection={{ name: "globe" } as any}
        attributionControl={false}
        interactive={false}
        onLoad={onMapLoad}
      />
    </>
  )
}
