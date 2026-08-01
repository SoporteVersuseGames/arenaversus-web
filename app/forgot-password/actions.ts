'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function sendPasswordReset(email: string) {
  const headersList = await headers()
  const origin = headersList.get('origin') ?? 'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
