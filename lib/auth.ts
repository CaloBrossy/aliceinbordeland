import { createClient } from '@/lib/supabase/server'

export async function ensureAnonymousAuth() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Error signing in anonymously:', error)
      throw error
    }
    return data.session
  }

  return session
}

