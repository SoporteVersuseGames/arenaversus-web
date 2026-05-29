'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-av-gradient flex items-center justify-center font-black text-white text-lg mx-auto mb-4">AV</div>
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-gray-400 text-sm mt-2">Accede a tu cuenta de Arena Versus</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1c1c1c] border border-white/7 rounded-xl p-6 space-y-4">
          {error && <div className="bg-[#ea3935]/10 border border-[#ea3935]/30 rounded-lg p-3 text-[#ea3935] text-sm">{error}</div>}
          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ea3935]/50 transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-av-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#ea3935] hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
