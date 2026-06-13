import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "FocusFlow — Productivité gamifiée",
  description: "Sessions focus chronométrées, tâches prioritisées, XP gagné à chaque effort. La productivité qui ressemble à un jeu.",
  metadataBase: new URL("https://focusflow-omega-roan.vercel.app"),
  openGraph: {
    title: "FocusFlow — Productivité gamifiée",
    description: "Travaillez mieux. Progressez chaque jour.",
    type: "website",
  },
  themeColor: "#060912",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.variable} style={{ background: "#060912", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
