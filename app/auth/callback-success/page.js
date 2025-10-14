'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../../lib/auth'

export default function CallbackSuccess() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...')

        // Wait a bit for the URL hash to be processed by Supabase
        await new Promise(resolve => setTimeout(resolve, 500))

        const session = await auth.getCurrentSession()
        console.log('Session check result:', session?.user?.email || 'No session')

        if (session?.user) {
          console.log('Authentication successful, redirecting to dashboard')
          router.push('/dashboard')
        } else {
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        router.push('/auth/login')
      }
    }

    // Small delay to ensure URL fragment is processed
    const timer = setTimeout(handleAuthCallback, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="spinner spinner-lg text-primary-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Completing sign in...</p>
      </div>
    </div>
  )
}