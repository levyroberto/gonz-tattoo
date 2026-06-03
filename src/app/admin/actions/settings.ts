"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createSupabaseAuthServerClient } from "@/lib/supabase/server"

function normalizeInstagramUrl(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim().replace(/^@/, "")

  if (!rawValue) {
    return null
  }

  try {
    const url = new URL(rawValue)
    const handle = url.pathname.split("/").filter(Boolean)[0]

    return handle ? `https://www.instagram.com/${handle}` : null
  } catch {
    return `https://www.instagram.com/${rawValue.split("/").filter(Boolean)[0]}`
  }
}

function normalizeWhatsappUrl(value: FormDataEntryValue | null) {
  const localPhone = String(value ?? "").replace(/\D/g, "")
  const phone = localPhone ? `549${localPhone.replace(/^549/, "")}` : ""

  return phone ? `https://wa.me/${phone}` : null
}

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: 1,
        instagram_url: normalizeInstagramUrl(formData.get("instagram_handle")),
        whatsapp_url: normalizeWhatsappUrl(formData.get("whatsapp_phone")),
        studio_address: String(formData.get("studio_address") ?? "").trim() || null,
        studio_hours: String(formData.get("studio_hours") ?? "").trim() || null,
        artist_name: String(formData.get("artist_name") ?? "").trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

  if (error) {
    console.error("Site settings update failed:", error.message)
    return { ok: false, error: `site-settings-update: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/trabajos")
  revalidatePath("/portfolio")
  revalidatePath("/flash")
  revalidatePath("/disenos")
  revalidatePath("/contact")
  revalidatePath("/admin")

  return { ok: true }
}
