"use client"
import { useEffect, useRef } from "react"

// Rough land mass dot coordinates [lon, lat]
const LAND_DOTS: [number,number][] = []
;(function generateLand() {
  // North America
  for(let lo=-125;lo<=-60;lo+=3)for(let la=25;la<=70;la+=2.5)LAND_DOTS.push([lo,la])
  // South America
  for(let lo=-80;lo<=-35;lo+=3)for(let la=-55;la<=12;la+=2.5)LAND_DOTS.push([lo,la])
  // Europe
  for(let lo=-10;lo<=40;lo+=3)for(let la=35;la<=70;la+=2.5)LAND_DOTS.push([lo,la])
  // Africa
  for(let lo=-18;lo<=50;lo+=3)for(let la=-35;la<=37;la+=2.5)LAND_DOTS.push([lo,la])
  // Asia
  for(let lo=40;lo<=145;lo+=3)for(let la=0;la<=75;la+=2.5)LAND_DOTS.push([lo,la])
  // Australia
  for(let lo=113;lo<=153;lo+=3)for(let la=-40;la<=-10;la+=2.5)LAND_DOTS.push([lo,la])
})()

export function MapBackground() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if(!canvas) return
    const ctx = canvas.getContext("2d"); if(!ctx) return
    let animId: number, phi = 0

    function resize() {
      canvas!.width  = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    function draw() {
      const W = canvas!.width, H = canvas!.height
      ctx.clearRect(0,0,W,H)
      const cx = W/2, cy = H/2
      const R  = Math.min(W,H) * 0.42

      // Globe circle
      const grd = ctx.createRadialGradient(cx-R*.25,cy-R*.25,R*.05,cx,cy,R)
      grd.addColorStop(0,"rgba(30,18,0,0.5)")
      grd.addColorStop(1,"rgba(10,6,0,0.7)")
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2)
      ctx.fillStyle=grd; ctx.fill()

      // Clip to globe
      ctx.save()
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip()

      // Lat/lon grid lines
      ctx.strokeStyle="rgba(245,166,35,0.06)"; ctx.lineWidth=0.5
      for(let lat=-60;lat<=60;lat+=30){
        const ry = Math.cos(lat*Math.PI/180)*R
        const yp = cy + Math.sin(lat*Math.PI/180)*R
        ctx.beginPath(); ctx.ellipse(cx,yp,ry,ry*0.18,0,0,Math.PI*2); ctx.stroke()
      }
      for(let lon=0;lon<360;lon+=30){
        const a = (lon+phi)*Math.PI/180
        ctx.beginPath()
        for(let lat=-90;lat<=90;lat+=5){
          const latr=lat*Math.PI/180
          const x=cx+R*Math.cos(latr)*Math.sin(a)
          const y=cy-R*Math.sin(latr)
          lat===-90?ctx.moveTo(x,y):ctx.lineTo(x,y)
        }
        ctx.stroke()
      }

      // Land dots
      for(const [lon,lat] of LAND_DOTS){
        const lonr=(lon+phi)*Math.PI/180
        const latr=lat*Math.PI/180
        const sinLon=Math.sin(lonr)
        if(sinLon<0) continue  // back side
        const x=cx+R*Math.cos(latr)*sinLon
        const y=cy-R*Math.sin(latr)
        const brightness=0.3+0.5*sinLon
        ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2)
        ctx.fillStyle=`rgba(245,166,35,${brightness})`; ctx.fill()
      }

      // Glow nodes (cities)
      const cities:([number,number])[] = [[-74,40],[2,48],[139,35],[28,41],[-43,-22],[151,-33],[37,55],[103,1],[77,28],[116,39]]
      for(const [lon,lat] of cities){
        const lonr=(lon+phi)*Math.PI/180
        const latr=lat*Math.PI/180
        const sinLon=Math.sin(lonr)
        if(sinLon<0.1) continue
        const x=cx+R*Math.cos(latr)*sinLon
        const y=cy-R*Math.sin(latr)
        const pulse=0.7+0.3*Math.sin(Date.now()*0.002+lon)
        const gr=ctx.createRadialGradient(x,y,0,x,y,10)
        gr.addColorStop(0,`rgba(255,180,40,${pulse*0.9})`)
        gr.addColorStop(1,"rgba(245,166,35,0)")
        ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2)
        ctx.fillStyle=gr; ctx.fill()
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,220,100,${pulse})`; ctx.fill()
      }

      ctx.restore()

      // Globe rim glow
      const rim=ctx.createRadialGradient(cx,cy,R*0.88,cx,cy,R)
      rim.addColorStop(0,"rgba(245,166,35,0)")
      rim.addColorStop(0.7,"rgba(245,166,35,0.06)")
      rim.addColorStop(1,"rgba(245,166,35,0.2)")
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2)
      ctx.fillStyle=rim; ctx.fill()

      phi += 0.12
      animId=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(animId); window.removeEventListener("resize",resize) }
  },[])

  return <canvas ref={ref} style={{width:"100%",height:"100%",position:"absolute",inset:0,display:"block"}} />
}
