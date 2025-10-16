import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = 'https://mopgxvxiiuxhwmhwvkmb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcGd4dnhpaXV4aHdtaHd2a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjIxNTAsImV4cCI6MjA3NjE5ODE1MH0.j2he26S2IHeBBaWVS-CiR1c__cR6sJcMuT9IYZfPfAM';

export async function handle({ event, resolve }) {
  try {
    event.locals.supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' });
          });
        }
      }
    });

    event.locals.getSession = async () => {
      try {
        const { data: { session } } = await event.locals.supabase.auth.getSession();
        return session;
      } catch (error) {
        console.warn('Session check failed:', error);
        return null;
      }
    };
  } catch (error) {
    console.warn('Supabase initialization failed:', error);
    event.locals.supabase = null;
    event.locals.getSession = async () => null;
  }

  return resolve(event);
}
