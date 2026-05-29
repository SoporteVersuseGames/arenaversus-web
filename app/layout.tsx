import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const interTight = Inter_Tight({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arena Versus — Torneos Esports LATAM',
  description: 'La plataforma oficial de torneos esports profesionales en LATAM.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={interTight.className}>
      <body className="bg-[#111111] text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
