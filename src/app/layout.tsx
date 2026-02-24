import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TopBar } from "@/components/layout/top-bar"
import { DataProvider } from "@/lib/data-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "67 Mission Control",
  description: "The Official 67 Coin — Team Dashboard",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  },
}

// Twitter widgets script — loaded async, harmless if blocked
const TWITTER_WIDGET_SCRIPT = `
window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s); js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);
  t._e = []; t.ready = function(f) { t._e.push(f); };
  return t;
}(document, "script", "twitter-wjs"));
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: TWITTER_WIDGET_SCRIPT }} />
        <DataProvider>
          <TopBar />
          <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  )
}
