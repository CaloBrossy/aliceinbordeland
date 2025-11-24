'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) {
        // Provide a more helpful error message
        if (error.message?.includes('anonymous_provider_disabled') || error.code === 'anonymous_provider_disabled') {
          const helpfulError = {
            ...error,
            message: 'La autenticación anónima está deshabilitada. Por favor, habilítala en Supabase Dashboard > Authentication > Providers > Anonymous',
          }
          return { data: null, error: helpfulError }
        }
        throw error
      }
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  return {
    user,
    loading,
    signInAnonymously,
    signOut,
  }
}

