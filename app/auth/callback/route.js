import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Auth callback route called with code:', !!code)

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      console.log('Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log('Authentication successful, user:', data.user?.email)
        console.log('Redirecting to dashboard...')
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }

      console.log('No session in response, redirecting to callback-success')
      return NextResponse.redirect(`${requestUrl.origin}/auth/callback-success`)
    } catch (err) {
      console.error('Auth callback exception:', err)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`)
    }
  }

  console.log('No code provided, redirecting to callback-success')
  return NextResponse.redirect(`${requestUrl.origin}/auth/callback-success`)
}