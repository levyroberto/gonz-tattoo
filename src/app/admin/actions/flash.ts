"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createSupabaseAuthServerClient } from "@/lib/supabase/server"
import { resolveImageUrl } from "@/app/admin/actions/image-upload"

function revalidatePublicContent() {
  revalidatePath("/")
  revalidatePath("/trabajos")
  revalidatePath("/portfolio")
  revalidatePath("/flash")
  revalidatePath("/disenos")
}

function normalizeFlashStatus(status: FormDataEntryValue | null) {
  const normalizedStatus = String(status ?? "Disponible").trim().toLowerCase()

  if (normalizedStatus === "reservado") return "Reservado"
  if (normalizedStatus === "reclamado") return "Reclamado"

  return "Disponible"
}

function parsePrice(price: FormDataEntryValue | null) {
  const rawPrice = String(price ?? "").trim()
  const parsedPrice = Number(rawPrice)

  if (!rawPrice || !Number.isInteger(parsedPrice) || parsedPrice < 0) {
    return null
  }

  return parsedPrice
}

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

export async function createFlashDesign(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const image = await resolveImageUrl(supabase, formData, "flash")
  const price = parsePrice(formData.get("price")) ?? 0

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "flash-create: falta imagen" }
  }

  const { error: shiftError } = await supabase.rpc("shift_flash_display_order")

  if (shiftError) {
    console.error("Flash order shift failed:", shiftError.message)
    const { data: orderedItems, error: orderFetchError } = await supabase
      .from("flash_designs")
      .select("id, display_order")
      .order("display_order", { ascending: false })
      .order("id", { ascending: false })

    if (orderFetchError) {
      console.error("Flash order fallback fetch failed:", orderFetchError.message)
      return { ok: false, error: "flash-create: no se pudo ordenar" }
    }

    const orderUpdates = await Promise.all(
      (orderedItems ?? []).map((item) =>
        supabase
          .from("flash_designs")
          .update({ display_order: Number(item.display_order ?? 0) + 1 })
          .eq("id", item.id)
      )
    )
    const orderUpdateError = orderUpdates.find((result) => result.error)?.error

    if (orderUpdateError) {
      console.error("Flash order fallback update failed:", orderUpdateError.message)
      return { ok: false, error: "flash-create: no se pudo ordenar" }
    }
  }

  const { data, error } = await supabase
    .from("flash_designs")
    .insert({
      name: String(formData.get("name") ?? ""),
      price,
      image_url: image.imageUrl,
      status: normalizeFlashStatus(formData.get("status")),
      style: String(formData.get("style") ?? ""),
      size: String(formData.get("size") ?? ""),
      is_active: formData.get("is_active") === "on",
      display_order: 1,
      tags: parseTags(formData.get("tags")),
    })
    .select("id,name,price,image_url,status,style,size,display_order,is_active,tags")
    .single()

  if (error) {
    console.error("Flash create failed:", error.message)
    return { ok: false, error: "flash-create" }
  }

  revalidatePublicContent()
  return {
    ok: true,
    item: {
      id: data.id,
      name: data.name,
      price: data.price,
      image: data.image_url,
      status: data.status,
      style: data.style,
      size: data.size,
      displayOrder: data.display_order ?? undefined,
      isActive: data.is_active ?? true,
      tags: data.tags ?? [],
    },
  }
}

export async function updateFlashDesign(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) {
    return { ok: false, error: "flash-update" }
  }

  const image = await resolveImageUrl(supabase, formData, "flash")
  const price = parsePrice(formData.get("price")) ?? 0

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "flash-update: falta imagen" }
  }

  const updatePayload = {
    name: String(formData.get("name") ?? ""),
    price,
    image_url: image.imageUrl,
    status: normalizeFlashStatus(formData.get("status")),
    style: String(formData.get("style") ?? ""),
    size: String(formData.get("size") ?? ""),
    tags: parseTags(formData.get("tags")),
  }

  const { data, error } = await supabase
    .from("flash_designs")
    .update({ ...updatePayload, is_active: formData.get("is_active") === "on" })
    .eq("id", id)
    .select("id,name,price,image_url,status,style,size,display_order,is_active,tags")
    .single()

  if (error) {
    if (error.message.includes("is_active")) {
      const retry = await supabase
        .from("flash_designs")
        .update(updatePayload)
        .eq("id", id)
        .select("id,name,price,image_url,status,style,size,display_order,tags")
        .single()

      if (!retry.error) {
        revalidatePublicContent()
        return {
          ok: true,
          item: {
            id: retry.data.id,
            name: retry.data.name,
            price: retry.data.price,
            image: retry.data.image_url,
            status: retry.data.status,
            style: retry.data.style,
            size: retry.data.size,
            displayOrder: retry.data.display_order ?? undefined,
            isActive: true,
            tags: retry.data.tags ?? [],
          },
        }
      }
    }

    console.error("Flash update failed:", error.message)
    return { ok: false, error: `flash-update: ${error.message}` }
  }

  revalidatePublicContent()
  return {
    ok: true,
    item: {
      id: data.id,
      name: data.name,
      price: data.price,
      image: data.image_url,
      status: data.status,
      style: data.style,
      size: data.size,
      displayOrder: data.display_order ?? undefined,
      isActive: data.is_active ?? true,
      tags: data.tags ?? [],
    },
  }
}

export async function deleteFlashDesign(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) {
    return { ok: false, error: "flash-delete" }
  }

  const { error } = await supabase.from("flash_designs").delete().eq("id", id)

  if (error) {
    console.error("Flash delete failed:", error.message)
    return { ok: false, error: "flash-delete" }
  }

  revalidatePublicContent()
  return { ok: true }
}

export async function reorderFlashDesigns(itemIds: number[]) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return { ok: false, error: "flash-reorder" }
  }

  const updates = await Promise.all(
    itemIds.map((id, index) =>
      supabase.from("flash_designs").update({ display_order: index + 1 }).eq("id", id)
    )
  )
  const error = updates.find((result) => result.error)?.error

  if (error) {
    console.error("Flash reorder failed:", error.message)
    return { ok: false, error: "flash-reorder" }
  }

  revalidatePublicContent()
  return { ok: true }
}
