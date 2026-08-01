'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ResetPasswordFormProps {
  code: string | null
}

export default function ResetPasswordForm({ code }: ResetPasswordFormProps) {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(code ? '' : 'El enlace de recuperación es inválido o ha expirado.')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!code) {
      setError('El enlace de recuperación es inválido o ha expirado.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      setError('El enlace es inválido o ha expirado. Solicitá uno nuevo.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-av-gradient flex items-center justify-center font-black text-white text-lg mx-auto mb-4">
            AV
          </div>
          <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-gray-400 text-sm mt-2">
            Elegí una contraseña segura para tu cuenta
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

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
              Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              disabled={success}
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3D00]/50 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1.5">Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="Repetí la contraseña"
              disabled={success}
              className="w-full bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3D00]/50 transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success || !code}
            className="w-full py-3 rounded-lg bg-av-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : success ? 'Actualizado' : 'Guardar nueva contraseña'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿No recibiste el enlace?{' '}
          <Link href="/forgot-password" className="text-[#FF3D00] hover:underline">
            Solicitarlo de nuevo
          </Link>
        </p>
      </div>
    </div>
  )
}
