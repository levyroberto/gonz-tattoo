"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { ArtworkType, TattooArtwork, SaleableArtwork } from "@/data/artworks"
import { createSupabaseAuthServerClient } from "@/lib/supabase/server"
import { resolveImageUrl } from "@/lib/supabase/storage"

function revalidatePublicContent() {
  revalidatePath("/")
  revalidatePath("/trabajos")
  revalidatePath("/portfolio")
  revalidatePath("/flash")
  revalidatePath("/disenos")
}

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

function parsePrice(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim()
  const parsed = Number(raw)

  return !raw || !Number.isInteger(parsed) || parsed < 0 ? null : parsed
}

function getPublishedDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim()

  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10)
}

function normalizeStatus(value: FormDataEntryValue | null) {
  const s = String(value ?? "Disponible").trim().toLowerCase()

  if (s === "reservado") return "Reservado"
  if (s === "reclamado") return "Reclamado"

  return "Disponible"
}

function mapTattoo(row: Record<string, unknown>): TattooArtwork {
  return {
    id: Number(row.id),
    type: "tattoo",
    title: String(row.title ?? ""),
    image: String(row.image_url ?? ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    isActive: Boolean(row.is_active ?? true),
    isFeatured: Boolean(row.is_featured ?? false),
    displayOrder: row.display_order != null ? Number(row.display_order) : undefined,
    style: row.style ? String(row.style) : undefined,
    description: row.description ? String(row.description) : undefined,
    publishedDate: row.published_date ? String(row.published_date) : undefined,
  }
}

function mapSaleable(row: Record<string, unknown>): SaleableArtwork {
  const type = String(row.type ?? "flash") as SaleableArtwork["type"]
  const status = String(row.status ?? "Disponible") as SaleableArtwork["status"]

  return {
    id: Number(row.id),
    type,
    title: String(row.title ?? ""),
    image: String(row.image_url ?? ""),
    tags: Array.isArray(row.tags) ? row.tags : [],
    isActive: Boolean(row.is_active ?? true),
    displayOrder: row.display_order != null ? Number(row.display_order) : undefined,
    price: Number(row.price ?? 0),
    status,
    style: row.style ? String(row.style) : undefined,
    dimensions: row.dimensions ? String(row.dimensions) : undefined,
    material: row.material ? String(row.material) : undefined,
  }
}

async function shiftDisplayOrder(supabase: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>, type: ArtworkType) {
  if (!supabase) return

  const { error } = await supabase.rpc("shift_artworks_display_order", { artwork_type: type })

  if (error) {
    console.error("Artworks order shift failed:", error.message)
    const { data: items, error: fetchError } = await supabase
      .from("artworks")
      .select("id, display_order")
      .eq("type", type)
      .order("display_order", { ascending: false })

    if (fetchError) return

    await Promise.all(
      (items ?? []).map((item) =>
        supabase.from("artworks").update({ display_order: Number(item.display_order ?? 0) + 1 }).eq("id", item.id)
      )
    )
  }
}

export async function createTattoo(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const image = await resolveImageUrl(supabase, formData, "portfolio")

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "tattoo-create: falta imagen" }
  }

  await shiftDisplayOrder(supabase, "tattoo")

  const { data, error } = await supabase
    .from("artworks")
    .insert({
      type: "tattoo",
      title: String(formData.get("title") ?? ""),
      image_url: image.imageUrl,
      tags: parseTags(formData.get("tags")),
      is_active: formData.get("is_active") === "on",
      is_featured: formData.get("is_featured") === "on",
      display_order: 1,
      style: String(formData.get("style") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      published_date: getPublishedDate(formData.get("published_date")),
    })
    .select("id,type,title,image_url,tags,is_active,is_featured,display_order,style,description,published_date")
    .single()

  if (error) {
    console.error("Tattoo create failed:", error.message)
    return { ok: false, error: "tattoo-create" }
  }

  revalidatePublicContent()
  return { ok: true, item: mapTattoo(data as Record<string, unknown>) }
}

export async function updateTattoo(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) return { ok: false, error: "tattoo-update" }

  const image = await resolveImageUrl(supabase, formData, "portfolio")

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "tattoo-update: falta imagen" }
  }

  const { data, error } = await supabase
    .from("artworks")
    .update({
      title: String(formData.get("title") ?? ""),
      image_url: image.imageUrl,
      tags: parseTags(formData.get("tags")),
      is_active: formData.get("is_active") === "on",
      is_featured: formData.get("is_featured") === "on",
      style: String(formData.get("style") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      published_date: getPublishedDate(formData.get("published_date")),
    })
    .eq("id", id)
    .eq("type", "tattoo")
    .select("id,type,title,image_url,tags,is_active,is_featured,display_order,style,description,published_date")
    .single()

  if (error) {
    console.error("Tattoo update failed:", error.message)
    return { ok: false, error: `tattoo-update: ${error.message}` }
  }

  revalidatePublicContent()
  return { ok: true, item: mapTattoo(data as Record<string, unknown>) }
}

export async function deleteTattoo(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) return { ok: false, error: "tattoo-delete" }

  const { error } = await supabase.from("artworks").delete().eq("id", id).eq("type", "tattoo")

  if (error) {
    console.error("Tattoo delete failed:", error.message)
    return { ok: false, error: "tattoo-delete" }
  }

  revalidatePublicContent()
  return { ok: true }
}

export async function reorderTattoos(itemIds: number[]) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) return { ok: false, error: "tattoo-reorder" }

  const updates = await Promise.all(
    itemIds.map((id, index) =>
      supabase.from("artworks").update({ display_order: index + 1 }).eq("id", id).eq("type", "tattoo")
    )
  )
  const error = updates.find((r) => r.error)?.error

  if (error) {
    console.error("Tattoo reorder failed:", error.message)
    return { ok: false, error: "tattoo-reorder" }
  }

  revalidatePublicContent()
  return { ok: true }
}

export async function createSaleableArtwork(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const type = String(formData.get("type") ?? "flash") as ArtworkType

  if (type === "tattoo") {
    return { ok: false, error: "artwork-create: tipo inválido" }
  }

  const image = await resolveImageUrl(supabase, formData, "flash")

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "artwork-create: falta imagen" }
  }

  await shiftDisplayOrder(supabase, type)

  const { data, error } = await supabase
    .from("artworks")
    .insert({
      type,
      title: String(formData.get("title") ?? ""),
      image_url: image.imageUrl,
      tags: parseTags(formData.get("tags")),
      is_active: formData.get("is_active") === "on",
      display_order: 1,
      price: parsePrice(formData.get("price")) ?? 0,
      status: normalizeStatus(formData.get("status")),
      style: String(formData.get("style") ?? "") || null,
      dimensions: String(formData.get("dimensions") ?? "") || null,
      material: String(formData.get("material") ?? "") || null,
    })
    .select("id,type,title,image_url,tags,is_active,display_order,price,status,style,dimensions,material")
    .single()

  if (error) {
    console.error("Saleable artwork create failed:", error.message)
    return { ok: false, error: "artwork-create" }
  }

  revalidatePublicContent()
  return { ok: true, item: mapSaleable(data as Record<string, unknown>) }
}

export async function updateSaleableArtwork(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) return { ok: false, error: "artwork-update" }

  const image = await resolveImageUrl(supabase, formData, "flash")

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "artwork-update: falta imagen" }
  }

  const { data, error } = await supabase
    .from("artworks")
    .update({
      title: String(formData.get("title") ?? ""),
      image_url: image.imageUrl,
      tags: parseTags(formData.get("tags")),
      is_active: formData.get("is_active") === "on",
      price: parsePrice(formData.get("price")) ?? 0,
      status: normalizeStatus(formData.get("status")),
      style: String(formData.get("style") ?? "") || null,
      dimensions: String(formData.get("dimensions") ?? "") || null,
      material: String(formData.get("material") ?? "") || null,
    })
    .eq("id", id)
    .not("type", "eq", "tattoo")
    .select("id,type,title,image_url,tags,is_active,display_order,price,status,style,dimensions,material")
    .single()

  if (error) {
    console.error("Saleable artwork update failed:", error.message)
    return { ok: false, error: `artwork-update: ${error.message}` }
  }

  revalidatePublicContent()
  return { ok: true, item: mapSaleable(data as Record<string, unknown>) }
}

export async function deleteSaleableArtwork(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) return { ok: false, error: "artwork-delete" }

  const { error } = await supabase.from("artworks").delete().eq("id", id).not("type", "eq", "tattoo")

  if (error) {
    console.error("Saleable artwork delete failed:", error.message)
    return { ok: false, error: "artwork-delete" }
  }

  revalidatePublicContent()
  return { ok: true }
}

export async function reorderSaleableArtworks(itemIds: number[]) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) return { ok: false, error: "artwork-reorder" }

  const updates = await Promise.all(
    itemIds.map((id, index) =>
      supabase.from("artworks").update({ display_order: index + 1 }).eq("id", id)
    )
  )
  const error = updates.find((r) => r.error)?.error

  if (error) {
    console.error("Saleable artwork reorder failed:", error.message)
    return { ok: false, error: "artwork-reorder" }
  }

  revalidatePublicContent()
  return { ok: true }
}
