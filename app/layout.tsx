import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GamingBg from '@/components/ui/GamingBg'

const interTight = Inter_Tight({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arena Versus — Torneos Esports LATAM',
  description: 'La plataforma oficial de torneos esports profesionales en LATAM.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={interTight.className}>
      <body className="bg-[#0a0a0a] text-white antialiased">
        {/* Global particle background — fixed, appears on every page */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <GamingBg />
        </div>
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
