'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdmin(session.user.id)
        loadUsername(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdmin(session.user.id)
        loadUsername(session.user.id)
      } else {
        setIsAdmin(false)
        setUsername(null)
      }
    })

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  async function checkAdmin(userId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()
    setIsAdmin(!!data?.is_admin)
  }

  async function loadUsername(userId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('username').eq('id', userId).single()
    setUsername(data?.username ?? null)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#111111]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-av-gradient flex items-center justify-center font-black text-white text-sm">
            AV
          </div>
          <span className="font-bold text-white hidden sm:block">Arena Versus</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {([['Torneos', '/torneos'], ['Clasificación', '/clasificacion'], ['Juegos', '/#juegos'], ['Nosotros', '/#nosotros']] as const).map(([label, href]) => (
            <Link key={href} href={href} className="text-gray-300 hover:text-white transition-colors">{label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">⚙ Admin</Link>}
              {username && (
                <Link href={`/players/${username}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                  👤 Mi Perfil
                </Link>
              )}
              <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-[#1c1c1c] border border-white/10 text-white text-sm hover:border-[#ea3935]/50 transition-all">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition-colors">Salir</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">Iniciar sesión</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-av-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#111111] border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {([['Torneos', '/torneos'], ['Clasificación', '/clasificacion']] as const).map(([label, href]) => (
            <Link key={href} href={href} className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          {user ? (
            <>
              {username && (
                <Link href={`/players/${username}`} className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>👤 Mi Perfil</Link>
              )}
              <Link href="/dashboard" className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-[#ea3935] py-2 text-sm">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 py-2 text-sm" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
              <Link href="/register" className="py-2.5 rounded-lg bg-av-gradient text-white text-sm font-semibold text-center" onClick={() => setMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
