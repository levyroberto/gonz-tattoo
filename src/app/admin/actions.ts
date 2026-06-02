"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getSectionDefinition, getSectionImageField, parseSectionContentFromForm, parseSectionLayoutFromForm } from "@/data/home-section-schema"
import { createSupabaseAuthServerClient } from "@/lib/supabase/server"

const IMAGE_BUCKET = "site-images"
const MAX_IMAGE_SIZE = 8 * 1024 * 1024

type ImageUploadResult =
  | {
      ok: true
      imageUrl: string
    }
  | {
      ok: false
      error: string
    }

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

function normalizeFlashStatus(status: FormDataEntryValue | null) {
  const normalizedStatus = String(status ?? "Disponible").trim().toLowerCase()

  if (normalizedStatus === "reservado") {
    return "Reservado"
  }

  if (normalizedStatus === "reclamado") {
    return "Reclamado"
  }

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

function getImageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase()

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension
  }

  return file.type.split("/").pop() || "jpg"
}

async function resolveImageUrl(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseAuthServerClient>>>,
  formData: FormData,
  folder: "flash" | "hero" | "portfolio"
): Promise<ImageUploadResult> {
  const imageFile = formData.get("image_file")
  const imageUrl = String(formData.get("image_url") ?? "").trim()

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { ok: true, imageUrl }
  }

  if (!imageFile.type.startsWith("image/")) {
    return { ok: false, error: "La imagen debe ser un archivo de imagen." }
  }

  if (imageFile.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "La imagen no puede superar los 8 MB." }
  }

  const extension = getImageExtension(imageFile)
  const path = `${folder}/${randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, imageFile, {
    contentType: imageFile.type,
    upsert: false,
  })

  if (error) {
    console.error("Supabase image upload failed:", error.message)
    return { ok: false, error: `image-upload: ${error.message}` }
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)

  return { ok: true, imageUrl: data.publicUrl }
}

export async function loginAdmin(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

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

  revalidatePublicContent()
  revalidatePath("/contact")
  revalidatePath("/admin")

  return { ok: true }
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
    .insert({
      ...portfolioPayload,
      published_date: publishedDate,
      tags,
    })
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
  return {
    ok: true,
    item: mapPortfolioItem(data, { publishedDate, tags }),
  }
}

async function getNextHomeSectionDisplayOrder() {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return 10
  }

  const { data } = await supabase
    .from("site_sections")
    .select("display_order")
    .eq("page_key", "home")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  return Number(data?.display_order ?? 0) + 10
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
    .update({
      ...portfolioPayload,
      published_date: publishedDate,
      tags,
    })
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
  return {
    ok: true,
    item: mapPortfolioItem(data, { publishedDate, tags }),
  }
}

export async function reorderPortfolioItems(itemIds: number[]) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return { ok: false, error: "portfolio-reorder" }
  }

  const updates = await Promise.all(
    itemIds.map((id, index) =>
      supabase
        .from("portfolio_items")
        .update({ display_order: index + 1 })
        .eq("id", id)
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
      supabase
        .from("flash_designs")
        .update({ display_order: index + 1 })
        .eq("id", id)
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

export async function updateHomeSectionEnabled(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const sectionKey = String(formData.get("section_key") ?? "")

  if (!supabase || !sectionKey) {
    return { ok: false, error: "home-section-toggle" }
  }

  const { error } = await supabase
    .from("site_sections")
    .update({
      enabled: formData.get("enabled") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("page_key", "home")
    .eq("section_key", sectionKey)

  if (error) {
    console.error("Home section visibility update failed:", error.message)
    return { ok: false, error: `home-section-toggle: ${error.message}` }
  }

  revalidatePublicContent()
  revalidatePath("/admin")

  return { ok: true }
}

export async function reorderHomeSections(sectionKeys: string[]) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return { ok: false, error: "home-section-reorder" }
  }

  const updates = await Promise.all(
    sectionKeys.map((sectionKey, index) =>
      supabase
        .from("site_sections")
        .update({
          display_order: (index + 1) * 10,
          updated_at: new Date().toISOString(),
        })
        .eq("page_key", "home")
        .eq("section_key", sectionKey)
    )
  )
  const error = updates.find((result) => result.error)?.error

  if (error) {
    console.error("Home section reorder failed:", error.message)
    return { ok: false, error: `home-section-reorder: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

export async function createHomeSection(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)

  if (!supabase || !definition || !definition.creatable) {
    return { ok: false, error: "home-section-create" }
  }

  const title = getRequiredString(formData, "title")
  const titleFieldKey = definition.titleFields[0]
  const defaults = {
    ...definition.defaults,
    content: {
      ...definition.defaults.content,
      ...(titleFieldKey && title ? { [titleFieldKey]: title } : {}),
    },
  }

  const displayOrder = await getNextHomeSectionDisplayOrder()
  const sectionKey = `home-${sectionType}-${randomUUID()}`

  const { error } = await supabase.from("site_sections").insert({
    page_key: "home",
    section_key: sectionKey,
    type: sectionType,
    enabled: false,
    display_order: displayOrder,
    content: defaults.content,
    layout: defaults.layout,
    style: defaults.style,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Home section create failed:", error.message)
    return { ok: false, error: `home-section-create: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return {
    ok: true,
    item: {
      id: sectionKey,
      type: sectionType,
      enabled: false,
      order: displayOrder,
      ...defaults,
    },
  }
}

export async function deleteHomeSection(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const sectionKey = String(formData.get("section_key") ?? "")

  if (!supabase || !sectionKey) {
    return { ok: false, error: "home-section-delete" }
  }

  const { error } = await supabase
    .from("site_sections")
    .delete()
    .eq("page_key", "home")
    .eq("section_key", sectionKey)

  if (error) {
    console.error("Home section delete failed:", error.message)
    return { ok: false, error: `home-section-delete: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return { ok: true }
}

function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getHomeSectionContentFromForm(formData: FormData) {
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)

  if (!definition) {
    return null
  }

  return parseSectionContentFromForm(formData, definition)
}

function getHomeSectionLayoutFromForm(formData: FormData) {
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)

  if (!definition) {
    return null
  }

  return parseSectionLayoutFromForm(formData, definition)
}

export async function updateHomeSectionContent(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const pageKey = String(formData.get("page_key") ?? "home").trim() || "home"
  const sectionKey = String(formData.get("section_key") ?? "")
  const sectionType = String(formData.get("type") ?? "")
  const definition = getSectionDefinition(sectionType)
  const content = getHomeSectionContentFromForm(formData)
  const layout = getHomeSectionLayoutFromForm(formData)

  if (!supabase || !sectionKey || !definition || !content || !layout) {
    return { ok: false, error: "home-section-content" }
  }

  const imageField = getSectionImageField(definition)
  let stylePayload: Record<string, unknown> | null = null

  if (imageField) {
    const image = await resolveImageUrl(supabase, formData, imageField.imageFolder ?? "hero")

    if (!image.ok) {
      return { ok: false, error: image.error }
    }

    if (!image.imageUrl && imageField.required !== false) {
      return { ok: false, error: "home-section-content: falta imagen de fondo" }
    }

    stylePayload = { ...definition.defaults.style, [imageField.key]: image.imageUrl }
  }

  const { error } = await supabase
    .from("site_sections")
    .update({
      content,
      layout,
      ...(stylePayload ? { style: stylePayload } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)

  if (error) {
    console.error("Home section content update failed:", error.message)
    return { ok: false, error: `home-section-content: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/admin")

  return {
    ok: true,
    item: {
      sectionKey,
      content,
      layout,
      ...(stylePayload ? { style: stylePayload } : {}),
    },
  }
}

export async function updateFooterSectionContent(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return { ok: false, error: "footer-section-content" }
  }

  const content = {
    tagline: getRequiredString(formData, "tagline"),
    legalText: getRequiredString(formData, "legal_text"),
  }

  const { error } = await supabase
    .from("site_sections")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("page_key", "global")
    .eq("section_key", "site-footer")

  if (error) {
    console.error("Footer section content update failed:", error.message)
    return { ok: false, error: `footer-section-content: ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/trabajos")
  revalidatePath("/disenos")
  revalidatePath("/contact")
  revalidatePath("/admin")

  return {
    ok: true,
    item: {
      content,
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
    .update({
      ...updatePayload,
      is_active: formData.get("is_active") === "on",
    })
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
