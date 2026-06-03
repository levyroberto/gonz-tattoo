"use server"

import { redirect } from "next/navigation"

import { createSupabaseAuthServerClient } from "@/lib/supabase/server"

export async function loginAdmin(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect("/admin/login?error=invalid")
  }

  redirect("/admin")
}

export async function logoutAdmin() {
  const supabase = await createSupabaseAuthServerClient()

  await supabase?.auth.signOut()
  redirect("/admin/login")
}
