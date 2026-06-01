import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return { supabaseKey, supabaseUrl }
}

function getSupabasePublishableConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return { supabaseKey, supabaseUrl }
}

export function createSupabaseServerClient() {
  const { supabaseKey, supabaseUrl } = getSupabaseConfig()

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function createSupabaseAuthServerClient() {
  const { supabaseKey, supabaseUrl } = getSupabasePublishableConfig()

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server components can read auth cookies but cannot always write them.
        }
      },
    },
  })
}
