import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession()

  console.log(`Middleware: ${req.nextUrl.pathname} - Session:`, session?.user?.email || 'No session', error ? `Error: ${error.message}` : '')

  // Protected admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Protected user routes
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/billing') ||
      req.nextUrl.pathname.startsWith('/profile')) {
    if (!session) {
      console.log(`Middleware: Redirecting ${req.nextUrl.pathname} to login - no session`)
      return NextResponse.redirect(new URL('/auth/login', req.url))
    } else {
      console.log(`Middleware: Allowing access to ${req.nextUrl.pathname} - user: ${session.user.email}`)
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (
    req.nextUrl.pathname.startsWith('/auth/login') ||
    req.nextUrl.pathname.startsWith('/auth/signup') ||
    req.nextUrl.pathname === '/'
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    // Temporarily disable middleware for debugging
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}