"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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

async function getNextPortfolioDisplayOrder() {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return 1
  }

  const { data } = await supabase
    .from("portfolio_items")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  return Number(data?.display_order ?? 0) + 1
}

async function getNextFlashDisplayOrder() {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    return 1
  }

  const { data } = await supabase
    .from("flash_designs")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  return Number(data?.display_order ?? 0) + 1
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
  revalidatePath("/sobre-mi")
  revalidatePath("/admin")

  return { ok: true }
}

export async function createPortfolioItem(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const displayOrder = await getNextPortfolioDisplayOrder()
  const image = await resolveImageUrl(supabase, formData, "portfolio")

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "portfolio-create: falta imagen" }
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      title: String(formData.get("title") ?? ""),
      style: String(formData.get("style") ?? ""),
      image_url: image.imageUrl,
      description: String(formData.get("description") ?? "") || null,
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
      display_order: displayOrder,
    })
    .select("id,title,style,image_url,description,display_order,is_active,is_featured")
    .single()

  if (error) {
    console.error("Portfolio create failed:", error.message)
    return { ok: false, error: "portfolio-create" }
  }

  revalidatePublicContent()
  return {
    ok: true,
    item: {
      id: data.id,
      title: data.title,
      style: data.style,
      image: data.image_url,
      description: data.description ?? undefined,
      displayOrder: data.display_order ?? undefined,
      isActive: data.is_active ?? true,
      isFeatured: data.is_featured ?? false,
    },
  }
}

export async function createFlashDesign(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()

  if (!supabase) {
    redirect("/admin/login?error=config")
  }

  const displayOrder = await getNextFlashDisplayOrder()
  const image = await resolveImageUrl(supabase, formData, "flash")
  const price = parsePrice(formData.get("price"))

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "flash-create: falta imagen" }
  }

  if (price === null) {
    return { ok: false, error: "flash-create: precio inválido" }
  }

  const { data, error } = await supabase
    .from("flash_designs")
    .insert({
      name: String(formData.get("name") ?? ""),
      price,
      image_url: image.imageUrl,
      status: normalizeFlashStatus(formData.get("status")),
      style: String(formData.get("style") ?? ""),
      placement: String(formData.get("placement") ?? ""),
      size: String(formData.get("size") ?? ""),
      is_active: formData.get("is_active") === "on",
      display_order: displayOrder,
    })
    .select("id,name,price,image_url,status,style,placement,size,display_order,is_active")
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
      placement: data.placement,
      size: data.size,
      displayOrder: data.display_order ?? undefined,
      isActive: data.is_active ?? true,
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

  const { data, error } = await supabase
    .from("portfolio_items")
    .update({
      title: String(formData.get("title") ?? ""),
      style: String(formData.get("style") ?? ""),
      image_url: image.imageUrl,
      description: String(formData.get("description") ?? "") || null,
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id)
    .select("id,title,style,image_url,description,display_order,is_active,is_featured")
    .single()

  if (error) {
    console.error("Portfolio update failed:", error.message)
    return { ok: false, error: `portfolio-update: ${error.message}` }
  }

  revalidatePublicContent()
  return {
    ok: true,
    item: {
      id: data.id,
      title: data.title,
      style: data.style,
      image: data.image_url,
      description: data.description ?? undefined,
      displayOrder: data.display_order ?? undefined,
      isActive: data.is_active ?? true,
      isFeatured: data.is_featured ?? false,
    },
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

  revalidatePath("/")
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

function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function parseParagraphs(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function getHomeSectionContentFromForm(formData: FormData) {
  const sectionType = String(formData.get("type") ?? "")

  switch (sectionType) {
    case "hero":
      return {
        eyebrow: getRequiredString(formData, "eyebrow"),
        brandPrimary: getRequiredString(formData, "brand_primary"),
        brandAccent: getRequiredString(formData, "brand_accent"),
        description: getRequiredString(formData, "description"),
        primaryButtonLabel: getRequiredString(formData, "primary_button_label"),
        primaryButtonHref: getRequiredString(formData, "primary_button_href"),
        secondaryButtonLabel: getRequiredString(formData, "secondary_button_label"),
        secondaryButtonHref: getRequiredString(formData, "secondary_button_href"),
      }
    case "featuredPortfolio":
      return {
        eyebrow: getRequiredString(formData, "eyebrow"),
        title: getRequiredString(formData, "title"),
        highlightedTitle: getRequiredString(formData, "highlighted_title"),
        buttonLabel: getRequiredString(formData, "button_label"),
        buttonHref: getRequiredString(formData, "button_href"),
      }
    case "flashPreview":
      return {
        eyebrow: getRequiredString(formData, "eyebrow"),
        highlightedTitle: getRequiredString(formData, "highlighted_title"),
        description: getRequiredString(formData, "description"),
        buttonLabel: getRequiredString(formData, "button_label"),
        buttonHref: getRequiredString(formData, "button_href"),
      }
    case "about":
      return {
        title: getRequiredString(formData, "title"),
        paragraphs: parseParagraphs(formData.get("paragraphs")),
        quote: getRequiredString(formData, "quote"),
        stats: [0, 1, 2].map((index) => ({
          value: getRequiredString(formData, `stat_value_${index}`),
          label: getRequiredString(formData, `stat_label_${index}`),
          tone: getRequiredString(formData, `stat_tone_${index}`),
        })),
      }
    case "contactCta":
      return {
        eyebrow: getRequiredString(formData, "eyebrow"),
        title: getRequiredString(formData, "title"),
        highlightedTitle: getRequiredString(formData, "highlighted_title"),
        description: getRequiredString(formData, "description"),
        whatsappLabel: getRequiredString(formData, "whatsapp_label"),
        instagramLabel: getRequiredString(formData, "instagram_label"),
        hoursLabel: getRequiredString(formData, "hours_label"),
      }
    default:
      return null
  }
}

export async function updateHomeSectionContent(formData: FormData) {
  const supabase = await createSupabaseAuthServerClient()
  const sectionKey = String(formData.get("section_key") ?? "")
  const sectionType = String(formData.get("type") ?? "")
  const content = getHomeSectionContentFromForm(formData)

  if (!supabase || !sectionKey || !content) {
    return { ok: false, error: "home-section-content" }
  }

  const style = sectionType === "hero" ? await resolveImageUrl(supabase, formData, "hero") : null

  if (style && !style.ok) {
    return { ok: false, error: style.error }
  }

  if (sectionType === "hero" && !style?.imageUrl) {
    return { ok: false, error: "home-section-content: falta imagen de fondo" }
  }

  const { error } = await supabase
    .from("site_sections")
    .update({
      content,
      ...(sectionType === "hero" && style?.imageUrl
        ? {
            style: {
              backgroundImage: style.imageUrl,
              overlay: "dark",
            },
          }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("page_key", "home")
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
      ...(sectionType === "hero" && style?.imageUrl
        ? {
            style: {
              backgroundImage: style.imageUrl,
              overlay: "dark",
            },
          }
        : {}),
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
  revalidatePath("/sobre-mi")
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
  const price = parsePrice(formData.get("price"))

  if (!image.ok) {
    return { ok: false, error: image.error }
  }

  if (!image.imageUrl) {
    return { ok: false, error: "flash-update: falta imagen" }
  }

  if (price === null) {
    return { ok: false, error: "flash-update: precio inválido" }
  }

  const updatePayload = {
    name: String(formData.get("name") ?? ""),
    price,
    image_url: image.imageUrl,
    status: normalizeFlashStatus(formData.get("status")),
    style: String(formData.get("style") ?? ""),
    placement: String(formData.get("placement") ?? ""),
    size: String(formData.get("size") ?? ""),
  }

  const { data, error } = await supabase
    .from("flash_designs")
    .update({
      ...updatePayload,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id)
    .select("id,name,price,image_url,status,style,placement,size,display_order,is_active")
    .single()

  if (error) {
    if (error.message.includes("is_active")) {
      const retry = await supabase
        .from("flash_designs")
        .update(updatePayload)
        .eq("id", id)
        .select("id,name,price,image_url,status,style,placement,size,display_order")
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
            placement: retry.data.placement,
            size: retry.data.size,
            displayOrder: retry.data.display_order ?? undefined,
            isActive: true,
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
      placement: data.placement,
      size: data.size,
      displayOrder: data.display_order ?? undefined,
      isActive: data.is_active ?? true,
    },
  }
}
