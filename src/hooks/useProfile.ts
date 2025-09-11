'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'cleaner' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface UseProfileReturn {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  isCleaner: boolean
  isCustomer: boolean
  refreshProfile: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowser()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setError(userError.message)
        return
      }

      setUser(user)

      if (!user) {
        setProfile(null)
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError(profileError.message)
        return
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = profile?.role === 'admin'
  const isCleaner = profile?.role === 'cleaner'
  const isCustomer = profile?.role === 'customer'

  return {
    user,
    profile,
    loading,
    error,
    isAdmin,
    isCleaner,
    isCustomer,
    refreshProfile: fetchProfile
  }
}
