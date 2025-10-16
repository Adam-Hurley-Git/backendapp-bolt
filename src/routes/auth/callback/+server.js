import { redirect } from '@sveltejs/kit'

export async function GET({ url, locals }) {
  const code = url.searchParams.get('code')

  console.log('Auth callback route called with code:', !!code)

  if (code) {
    const supabase = locals.supabase

    try {
      console.log('Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        throw redirect(303, `/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log('Authentication successful, user:', data.user?.email)
        console.log('Redirecting to dashboard...')
        throw redirect(303, '/dashboard')
      }

      console.log('No session in response, redirecting to callback-success')
      throw redirect(303, '/auth/callback-success')
    } catch (err) {
      // If it's already a redirect, re-throw it
      if (err.status === 303) {
        throw err
      }

      console.error('Auth callback exception:', err)
      throw redirect(303, `/auth/error?message=${encodeURIComponent('Authentication failed')}`)
    }
  }

  console.log('No code provided, redirecting to callback-success')
  throw redirect(303, '/auth/callback-success')
}
