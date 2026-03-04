import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/lib/data-context"
import { ConditionalShell } from "@/components/layout/conditional-shell"

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
    <html lang="en" className={inter.variable} data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: TWITTER_SCRIPT }} />
      </head>
      <body>
        <DataProvider>
          <ConditionalShell>{children}</ConditionalShell>
        </DataProvider>
      </body>
    </html>
  )
}
