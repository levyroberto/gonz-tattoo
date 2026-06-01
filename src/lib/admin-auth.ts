import { redirect } from "next/navigation"

import { createSupabaseAuthServerClient } from "@/lib/supabase/server"

export async function isAdminAuthenticated() {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return false
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return Boolean(user)
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login")
  }
}
