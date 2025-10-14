import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    console.log('New user signup:', record)

    // Create profile for the new user
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: record.id,
        email: record.email,
        full_name: record.raw_user_meta_data?.full_name || record.email?.split('@')[0] || 'Unknown User',
        avatar_url: record.raw_user_meta_data?.avatar_url || null,
        is_admin: false,
        created_at: record.created_at,
        updated_at: record.updated_at || record.created_at
      })

    if (error) {
      console.error('Error creating profile:', error)
      throw error
    }

    console.log('Profile created successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})