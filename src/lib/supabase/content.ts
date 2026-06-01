import type { FlashDesign } from "@/data/flash-designs"
import type { Tattoo } from "@/data/tattoos"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminContentStats = {
  portfolioCount: number
  flashCount: number
  contactRequestCount: number
  isConnected: boolean
}

export type TattooStyleOption = {
  id: number
  name: string
}

export type SiteSettings = {
  brandName?: string
  footerTagline?: string
  instagramUrl?: string
  whatsappUrl?: string
  studioAddress?: string
  studioHours?: string
  artistName?: string
  artistYears?: string
}

function normalizeFlashStatus(status: string): FlashDesign["status"] {
  const normalizedStatus = status.trim().toLowerCase()

  if (normalizedStatus === "reservado") {
    return "Reservado"
  }

  if (normalizedStatus === "reclamado") {
    return "Reclamado"
  }

  return "Disponible"
}

async function countTable(tableName: "portfolio_items" | "flash_designs" | "contact_requests") {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return null
  }

  const { count, error } = await supabase.from(tableName).select("*", {
    count: "exact",
    head: true,
  })

  if (error) {
    console.error(`Supabase count failed for ${tableName}:`, error.message)
    return null
  }

  return count ?? 0
}

export async function getTattooStyles(): Promise<TattooStyleOption[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("tattoo_styles")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Supabase tattoo styles fetch failed:", error.message)
    return []
  }

  return data ?? []
}

export async function getAdminContentStats(): Promise<AdminContentStats> {
  const [portfolioCount, flashCount, contactRequestCount] = await Promise.all([
    countTable("portfolio_items"),
    countTable("flash_designs"),
    countTable("contact_requests"),
  ])

  const isConnected = portfolioCount !== null || flashCount !== null || contactRequestCount !== null

  return {
    portfolioCount: portfolioCount ?? 0,
    flashCount: flashCount ?? 0,
    contactRequestCount: contactRequestCount ?? 0,
    isConnected,
  }
}

export async function getPortfolioItems(): Promise<Tattoo[]> {
  return getPortfolioItemsByVisibility(true)
}

export async function getAdminPortfolioItems(): Promise<Tattoo[]> {
  return getPortfolioItemsByVisibility(false)
}

async function getPortfolioItemsByVisibility(onlyActive: boolean): Promise<Tattoo[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  let query = supabase
    .from("portfolio_items")
    .select("id, title, style, image_url, description, is_featured, is_active, display_order")
    .order("display_order", { ascending: true })

  if (onlyActive) {
    query = query.eq("is_active", true)
  }

  let { data, error } = await query

  if (error?.message.includes("is_active")) {
    const fallback = await supabase
      .from("portfolio_items")
      .select("id, title, style, image_url, description, is_featured, display_order")
      .order("display_order", { ascending: true })

    data = fallback.data?.map((item) => ({ ...item, is_active: true })) ?? null
    error = fallback.error
  }

  if (error) {
    console.error("Supabase portfolio fetch failed:", error.message)
    return []
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    style: item.style,
    image: item.image_url,
    description: item.description ?? undefined,
    displayOrder: item.display_order,
    isActive: item.is_active,
    isFeatured: item.is_featured,
  }))
}

export async function getFeaturedPortfolioItems(): Promise<Tattoo[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  let { data, error } = await supabase
    .from("portfolio_items")
    .select("id, title, style, image_url, description, is_featured, is_active, display_order")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(4)

  if (error?.message.includes("is_active")) {
    const fallback = await supabase
      .from("portfolio_items")
      .select("id, title, style, image_url, description, is_featured, display_order")
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(4)

    data = fallback.data?.map((item) => ({ ...item, is_active: true })) ?? null
    error = fallback.error
  }

  if (error) {
    console.error("Supabase featured portfolio fetch failed:", error.message)
    return []
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    style: item.style,
    image: item.image_url,
    description: item.description ?? undefined,
    displayOrder: item.display_order,
    isActive: item.is_active,
    isFeatured: item.is_featured,
  }))
}

export async function getFlashDesigns(): Promise<FlashDesign[]> {
  return getFlashDesignsByVisibility(true)
}

export async function getAdminFlashDesigns(): Promise<FlashDesign[]> {
  return getFlashDesignsByVisibility(false)
}

async function getFlashDesignsByVisibility(onlyActive: boolean): Promise<FlashDesign[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  let query = supabase
    .from("flash_designs")
    .select("id, name, price, image_url, status, style, placement, size, is_active, display_order")
    .order("display_order", { ascending: true })

  if (onlyActive) {
    query = query.eq("is_active", true)
  }

  let { data, error } = await query

  if (error?.message.includes("is_active")) {
    const fallback = await supabase
      .from("flash_designs")
      .select("id, name, price, image_url, status, style, placement, size, display_order")
      .order("display_order", { ascending: true })

    data = fallback.data?.map((design) => ({ ...design, is_active: true })) ?? null
    error = fallback.error
  }

  if (error) {
    console.error("Supabase flash fetch failed:", error.message)
    return []
  }

  return (data ?? []).map((design) => ({
    id: design.id,
    name: design.name,
    price: design.price,
    image: design.image_url,
    status: normalizeFlashStatus(design.status),
    style: design.style,
    placement: design.placement,
    size: design.size,
    displayOrder: design.display_order,
    isActive: design.is_active,
  }))
}

export async function getFeaturedFlashDesigns(): Promise<FlashDesign[]> {
  const designs = await getFlashDesigns()

  return designs.slice(0, 6)
}

export async function getAdminDashboardContent() {
  const [stats, portfolioItems, flashItems, tattooStyles, settings] = await Promise.all([
    getAdminContentStats(),
    getAdminPortfolioItems(),
    getAdminFlashDesigns(),
    getTattooStyles(),
    getSiteSettings(),
  ])

  return {
    stats,
    portfolioItems,
    flashItems,
    tattooStyles,
    settings,
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return {}
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("brand_name, footer_tagline, instagram_url, whatsapp_url, studio_address, studio_hours, artist_name, artist_years")
    .eq("id", 1)
    .maybeSingle()

  if (error) {
    console.error("Supabase site settings fetch failed:", error.message)
    return {}
  }

  if (!data) {
    return {}
  }

  return {
    brandName: data.brand_name ?? undefined,
    footerTagline: data.footer_tagline ?? undefined,
    instagramUrl: data.instagram_url ?? undefined,
    whatsappUrl: data.whatsapp_url ?? undefined,
    studioAddress: data.studio_address ?? undefined,
    studioHours: data.studio_hours ?? undefined,
    artistName: data.artist_name ?? undefined,
    artistYears: data.artist_years ?? undefined,
  }
}
