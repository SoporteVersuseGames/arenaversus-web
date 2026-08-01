'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendPasswordReset } from './actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSent(false)
    setLoading(true)

    const result = await sendPasswordReset(email)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-av-gradient flex items-center justify-center font-black text-white text-lg mx-auto mb-4">
            AV
          </div>
          <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
          <p className="text-gray-400 text-sm mt-2">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#141414] border border-white/7 rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-lg p-3 text-[#FF3D00] text-sm">
              {error}
            </div>
          )}

          {sent && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
              Si el correo está registrado, recibirás un enlace de recuperación en tu bandeja de entrada.
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3D00]/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || sent}
            className="w-full py-3 rounded-lg bg-av-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Enviando...' : sent ? 'Enviado' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="text-[#FF3D00] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
