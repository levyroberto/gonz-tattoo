"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createSupabaseAuthServerClient } from "@/lib/supabase/server"
import { resolveImageUrl } from "@/lib/supabase/storage"

type PortfolioActionRow = {
  id: number
  title: string
  style: string
  image_url: string
  description: string | null
  display_order?: number | null
  is_active?: boolean | null
  is_featured?: boolean | null
  published_date?: string
  tags?: string[]
}

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

function getPublishedDate(value: FormDataEntryValue | null) {
  const rawDate = String(value ?? "").trim()

  return /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : new Date().toISOString().slice(0, 10)
}

function isMissingPortfolioMetadataError(error: { message: string } | null) {
  return Boolean(error?.message.includes("published_date") || error?.message.includes("tags"))
}

function mapPortfolioItem(data: PortfolioActionRow, fallback?: { publishedDate?: string; tags?: string[] }) {
  return {
    id: data.id,
    title: data.title,
    style: data.style,
    image: data.image_url,
    description: data.description ?? undefined,
    displayOrder: data.display_order ?? undefined,
    isActive: data.is_active ?? true,
    isFeatured: data.is_featured ?? false,
    publishedDate: data.published_date ?? fallback?.publishedDate,
    tags: data.tags ?? fallback?.tags ?? [],
  }
}

export async function createPortfolioItem(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const image = await resolveImageUrl(supabase, formData, "portfolio")

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "portfolio-create: falta imagen" }
  }

  const { error: shiftError } = await supabase.rpc("shift_portfolio_display_order")

  if (shiftError) {
    console.error("Portfolio order shift failed:", shiftError.message)
    const { data: orderedItems, error: orderFetchError } = await supabase
      .from("portfolio_items")
      .select("id, display_order")
      .order("display_order", { ascending: false })
      .order("id", { ascending: false })

    if (orderFetchError) {
      console.error("Portfolio order fallback fetch failed:", orderFetchError.message)
      return { ok: false, error: "portfolio-create: no se pudo ordenar" }
    }

    const orderUpdates = await Promise.all(
      (orderedItems ?? []).map((item) =>
        supabase
          .from("portfolio_items")
          .update({ display_order: Number(item.display_order ?? 0) + 1 })
          .eq("id", item.id)
      )
    )
    const orderUpdateError = orderUpdates.find((result) => result.error)?.error

    if (orderUpdateError) {
      console.error("Portfolio order fallback update failed:", orderUpdateError.message)
      return { ok: false, error: "portfolio-create: no se pudo ordenar" }
    }
  }

  const publishedDate = getPublishedDate(formData.get("published_date"))
  const tags = parseTags(formData.get("tags"))
  const portfolioPayload = {
    title: String(formData.get("title") ?? ""),
    style: String(formData.get("style") ?? ""),
    image_url: image.imageUrl,
    description: String(formData.get("description") ?? "") || null,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
    display_order: 1,
  }

  const portfolioInsert = await supabase
    .from("portfolio_items")
    .insert({ ...portfolioPayload, published_date: publishedDate, tags })
    .select("id,title,style,image_url,description,display_order,is_active,is_featured,published_date,tags")
    .single()
  let data: PortfolioActionRow | null = portfolioInsert.data
  let error = portfolioInsert.error

  if (isMissingPortfolioMetadataError(error)) {
    const legacyInsert = await supabase
      .from("portfolio_items")
      .insert(portfolioPayload)
      .select("id,title,style,image_url,description,display_order,is_active,is_featured")
      .single()

    data = legacyInsert.data
    error = legacyInsert.error
  }

  if (error) {
    console.error("Portfolio create failed:", error.message)
    return { ok: false, error: "portfolio-create" }
  }

  if (!data) {
    return { ok: false, error: "portfolio-create: sin datos" }
  }

  revalidatePublicContent()
  return { ok: true, item: mapPortfolioItem(data, { publishedDate, tags }) }
}

export async function updatePortfolioItem(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) {
    return { ok: false, error: "portfolio-update" }
  }

  const image = await resolveImageUrl(supabase, formData, "portfolio")

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "portfolio-update: falta imagen" }
  }

  const publishedDate = getPublishedDate(formData.get("published_date"))
  const tags = parseTags(formData.get("tags"))
  const portfolioPayload = {
    title: String(formData.get("title") ?? ""),
    style: String(formData.get("style") ?? ""),
    image_url: image.imageUrl,
    description: String(formData.get("description") ?? "") || null,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  }

  const portfolioUpdate = await supabase
    .from("portfolio_items")
    .update({ ...portfolioPayload, published_date: publishedDate, tags })
    .eq("id", id)
    .select("id,title,style,image_url,description,display_order,is_active,is_featured,published_date,tags")
    .single()
  let data: PortfolioActionRow | null = portfolioUpdate.data
  let error = portfolioUpdate.error

  if (isMissingPortfolioMetadataError(error)) {
    const legacyUpdate = await supabase
      .from("portfolio_items")
      .update(portfolioPayload)
      .eq("id", id)
      .select("id,title,style,image_url,description,display_order,is_active,is_featured")
      .single()

    data = legacyUpdate.data
    error = legacyUpdate.error
  }

  if (error) {
    console.error("Portfolio update failed:", error.message)
    return { ok: false, error: `portfolio-update: ${error.message}` }
  }

  if (!data) {
    return { ok: false, error: "portfolio-update: sin datos" }
  }

  revalidatePublicContent()
  return { ok: true, item: mapPortfolioItem(data, { publishedDate, tags }) }
}

export async function deletePortfolioItem(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const id = Number(formData.get("id"))

  if (!supabase || !id) {
    return { ok: false, error: "portfolio-delete" }
  }

  const { error } = await supabase.from("portfolio_items").delete().eq("id", id)

  if (error) {
    console.error("Portfolio delete failed:", error.message)
    return { ok: false, error: "portfolio-delete" }
  }

  revalidatePublicContent()
  return { ok: true }
}

export async function reorderPortfolioItems(itemIds: number[]) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return { ok: false, error: "portfolio-reorder" }
  }

  const updates = await Promise.all(
    itemIds.map((id, index) =>
      supabase.from("portfolio_items").update({ display_order: index + 1 }).eq("id", id)
    )
  )
  const error = updates.find((result) => result.error)?.error

  if (error) {
    console.error("Portfolio reorder failed:", error.message)
    return { ok: false, error: "portfolio-reorder" }
  }

  revalidatePublicContent()
  return { ok: true }
}
