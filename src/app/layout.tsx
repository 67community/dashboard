import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TopBar } from "@/components/layout/top-bar"
import { DataProvider } from "@/lib/data-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "67 Mission Control",
  description: "The Official 67 Coin — Team Operations Dashboard",
}

const TWITTER_SCRIPT = `
(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};
if(d.getElementById(id))return t;js=d.createElement(s);js.id=id;
js.src="https://platform.twitter.com/widgets.js";
fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f);};
return t;}(document,"script","twitter-wjs"));
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TWITTER_SCRIPT }} />
      </head>
      <body>
        {/* Ambient blobs — frosted glass backdrop */}
        <div aria-hidden style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-10%", left:"-5%",  width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)", filter:"blur(40px)" }} />
          <div style={{ position:"absolute", top:"30%",  right:"-8%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",  filter:"blur(40px)" }} />
          <div style={{ position:"absolute", bottom:"5%",left:"20%",  width:700, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)", filter:"blur(50px)" }} />
        </div>
        <DataProvider>
          <TopBar />
          <main className="page-main">
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  )
}
