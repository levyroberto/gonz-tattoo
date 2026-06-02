import type { FlashDesign } from "@/data/flash-designs"
import { footerSectionFallback } from "@/data/global-sections"
import type { FooterSection } from "@/data/global-sections"
import { getEnabledHomeSections, getHomeSectionFallback, getHomeSectionsFallback, getHomeSectionTemplate } from "@/data/home-sections"
import type { HomeSection } from "@/data/home-sections"
import { getPageSectionFallback, getPageSectionsFallback, type EditablePageKey, type PageSection } from "@/data/page-sections"
import type { Tattoo } from "@/data/tattoos"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Database, Json } from "@/lib/supabase/database.types"

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
  instagramUrl?: string
  whatsappUrl?: string
  studioAddress?: string
  studioHours?: string
  artistName?: string
  artistYears?: string
}

type SiteSectionRow = Database["public"]["Tables"]["site_sections"]["Row"]
type PortfolioItemRow = {
  id: number
  title: string
  style: string
  image_url: string
  description: string | null
  is_featured: boolean
  is_active?: boolean
  display_order: number
  published_date?: string
  tags?: string[]
}

type FlashDesignRow = {
  id: number
  name: string
  price: number
  image_url: string
  status: string
  style: string
  size: string
  is_active?: boolean
  display_order: number
  tags?: string[]
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
    .select("id, title, style, image_url, description, is_featured, is_active, display_order, published_date, tags")
    .order("display_order", { ascending: true })

  if (onlyActive) {
    query = query.eq("is_active", true)
  }

  let { data, error }: { data: PortfolioItemRow[] | null; error: { message: string } | null } = await query

  if (error) {
    const fallback = await supabase
      .from("portfolio_items")
      .select("id, title, style, image_url, description, is_featured, is_active, display_order")
      .order("display_order", { ascending: true })

    if (!fallback.error) {
      data = fallback.data ?? null
      error = null
    } else if (fallback.error.message.includes("is_active")) {
      const legacyFallback = await supabase
        .from("portfolio_items")
        .select("id, title, style, image_url, description, is_featured, display_order")
        .order("display_order", { ascending: true })

      data = legacyFallback.data?.map((item) => ({ ...item, is_active: true })) ?? null
      error = legacyFallback.error
    } else {
      error = fallback.error
    }
  }

  if (onlyActive) {
    data = data?.filter((item) => item.is_active ?? true) ?? null
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
    publishedDate: "published_date" in item ? item.published_date : undefined,
    tags: "tags" in item ? item.tags ?? [] : [],
  }))
}

export async function getFeaturedPortfolioItems(): Promise<Tattoo[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  let { data, error }: { data: PortfolioItemRow[] | null; error: { message: string } | null } = await supabase
    .from("portfolio_items")
    .select("id, title, style, image_url, description, is_featured, is_active, display_order, published_date, tags")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("published_date", { ascending: false })
    .order("display_order", { ascending: true })
    .limit(4)

  if (error) {
    const fallback = await supabase
      .from("portfolio_items")
      .select("id, title, style, image_url, description, is_featured, is_active, display_order")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(4)

    if (!fallback.error) {
      data = fallback.data ?? null
      error = null
    } else if (fallback.error.message.includes("is_active")) {
      const legacyFallback = await supabase
        .from("portfolio_items")
        .select("id, title, style, image_url, description, is_featured, display_order")
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(4)

      data = legacyFallback.data?.map((item) => ({ ...item, is_active: true })) ?? null
      error = legacyFallback.error
    } else {
      error = fallback.error
    }
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
    publishedDate: "published_date" in item ? item.published_date : undefined,
    tags: "tags" in item ? item.tags ?? [] : [],
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
    .select("id, name, price, image_url, status, style, size, is_active, display_order, tags")
    .order("display_order", { ascending: true })

  if (onlyActive) {
    query = query.eq("is_active", true)
  }

  let { data, error }: { data: FlashDesignRow[] | null; error: { message: string } | null } = await query

  if (error) {
    let fallbackQuery = supabase
      .from("flash_designs")
      .select("id, name, price, image_url, status, style, size, is_active, display_order")
      .order("display_order", { ascending: true })

    if (onlyActive) {
      fallbackQuery = fallbackQuery.eq("is_active", true)
    }

    const fallback = await fallbackQuery

    if (!fallback.error) {
      data = fallback.data ?? null
      error = null
    } else if (fallback.error.message.includes("is_active")) {
      const legacyFallback = await supabase
        .from("flash_designs")
        .select("id, name, price, image_url, status, style, size, display_order")
        .order("display_order", { ascending: true })

      data = legacyFallback.data?.map((design) => ({ ...design, is_active: true })) ?? null
      error = legacyFallback.error
    } else {
      error = fallback.error
    }
  }

  if (onlyActive) {
    data = data?.filter((design) => design.is_active ?? true) ?? null
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
    size: design.size,
    displayOrder: design.display_order,
    isActive: design.is_active,
    tags: "tags" in design ? design.tags ?? [] : [],
  }))
}

export async function getFeaturedFlashDesigns(): Promise<FlashDesign[]> {
  const designs = await getFlashDesigns()

  return designs.slice(0, 6)
}

export async function getAdminDashboardContent() {
  const [stats, portfolioItems, flashItems, tattooStyles, settings, homeSections, pageSections, footer] = await Promise.all([
    getAdminContentStats(),
    getAdminPortfolioItems(),
    getAdminFlashDesigns(),
    getTattooStyles(),
    getSiteSettings(),
    getAdminHomeSections(),
    getAdminPageSections(),
    getGlobalFooterSection(),
  ])

  return {
    stats,
    portfolioItems,
    flashItems,
    tattooStyles,
    settings,
    homeSections,
    pageSections,
    footer,
  }
}

function isJsonRecord(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeHomeSection(row: SiteSectionRow): HomeSection | null {
  const fallback = getHomeSectionFallback(row.section_key) ?? getHomeSectionTemplate(row.type as HomeSection["type"])

  if (!fallback || row.type !== fallback.type) {
    return null
  }

  return {
    ...fallback,
    id: row.section_key,
    enabled: row.enabled,
    order: row.display_order,
    content: isJsonRecord(row.content) ? { ...fallback.content, ...row.content } : fallback.content,
    layout: isJsonRecord(row.layout) ? { ...fallback.layout, ...row.layout } : fallback.layout,
    style: isJsonRecord(row.style) ? { ...fallback.style, ...row.style } : fallback.style,
  } as HomeSection
}

function normalizeFooterSection(row: SiteSectionRow): FooterSection | null {
  if (row.section_key !== footerSectionFallback.id || row.type !== footerSectionFallback.type) {
    return null
  }

  return {
    ...footerSectionFallback,
    enabled: row.enabled,
    order: row.display_order,
    content: isJsonRecord(row.content) ? { ...footerSectionFallback.content, ...row.content } : footerSectionFallback.content,
    layout: isJsonRecord(row.layout) ? { ...footerSectionFallback.layout, ...row.layout } : footerSectionFallback.layout,
    style: isJsonRecord(row.style) ? { ...footerSectionFallback.style, ...row.style } : footerSectionFallback.style,
  } as FooterSection
}

function isBlankAboutPageContent(content: PageSection["content"]) {
  if (!("paragraphs" in content)) {
    return false
  }

  return !content.title.trim() && content.paragraphs.length === 0 && !content.quote.trim()
}

function normalizePageSection(pageKey: EditablePageKey, row: SiteSectionRow): PageSection | null {
  const fallback = getPageSectionFallback(pageKey)

  if (row.section_key !== fallback.id || row.type !== fallback.type) {
    return null
  }

  const content = isJsonRecord(row.content) ? { ...fallback.content, ...row.content } : fallback.content
  const style = isJsonRecord(row.style) ? { ...fallback.style, ...row.style } : fallback.style
  const shouldUseAboutFallback = pageKey === "about" && isBlankAboutPageContent(content as PageSection["content"])

  return {
    ...fallback,
    enabled: row.enabled,
    order: row.display_order,
    content: shouldUseAboutFallback ? fallback.content : content,
    layout: isJsonRecord(row.layout) ? { ...fallback.layout, ...row.layout } : fallback.layout,
    style: shouldUseAboutFallback ? fallback.style : style,
  } as PageSection
}

export async function getPageSection(pageKey: EditablePageKey): Promise<PageSection> {
  const fallback = getPageSectionFallback(pageKey)
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return fallback
  }

  const { data, error } = await supabase
    .from("site_sections")
    .select("id, page_key, section_key, type, enabled, display_order, content, layout, style, created_at, updated_at")
    .eq("page_key", pageKey)
    .eq("section_key", fallback.id)
    .maybeSingle()

  if (error) {
    console.error(`Supabase ${pageKey} section fetch failed:`, error.message)
    return fallback
  }

  if (!data) {
    return fallback
  }

  return normalizePageSection(pageKey, data) ?? fallback
}

export async function getAdminPageSections(): Promise<Array<{ pageKey: EditablePageKey; section: PageSection }>> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return getPageSectionsFallback()
  }

  const { data, error } = await supabase
    .from("site_sections")
    .select("id, page_key, section_key, type, enabled, display_order, content, layout, style, created_at, updated_at")
    .in("page_key", ["portfolio", "flash", "about", "contact"])
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Supabase admin page sections fetch failed:", error.message)
    return getPageSectionsFallback()
  }

  return getPageSectionsFallback().map(({ pageKey, section }) => {
    const row = data?.find((item) => item.page_key === pageKey && item.section_key === section.id)

    return {
      pageKey,
      section: row ? normalizePageSection(pageKey, row) ?? section : section,
    }
  })
}

export async function getHomeSections(): Promise<HomeSection[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return getEnabledHomeSections()
  }

  const { data, error } = await supabase
    .from("site_sections")
    .select("id, page_key, section_key, type, enabled, display_order, content, layout, style, created_at, updated_at")
    .eq("page_key", "home")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Supabase home sections fetch failed:", error.message)
    return getEnabledHomeSections()
  }

  if (!data || data.length === 0) {
    return getEnabledHomeSections()
  }

  const sections = data
    .map(normalizeHomeSection)
    .filter((section): section is HomeSection => section !== null)

  if (sections.length === 0) {
    return getEnabledHomeSections()
  }

  return getEnabledHomeSections(sections)
}

export async function getAdminHomeSections(): Promise<HomeSection[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return getHomeSectionsFallback()
  }

  const { data, error } = await supabase
    .from("site_sections")
    .select("id, page_key, section_key, type, enabled, display_order, content, layout, style, created_at, updated_at")
    .eq("page_key", "home")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Supabase admin home sections fetch failed:", error.message)
    return getHomeSectionsFallback()
  }

  if (!data || data.length === 0) {
    return getHomeSectionsFallback()
  }

  const sections = data
    .map(normalizeHomeSection)
    .filter((section): section is HomeSection => section !== null)

  return sections.length > 0
    ? sections.toSorted((firstSection, secondSection) => firstSection.order - secondSection.order)
    : getHomeSectionsFallback()
}

export async function getGlobalFooterSection(): Promise<FooterSection> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return footerSectionFallback
  }

  const { data, error } = await supabase
    .from("site_sections")
    .select("id, page_key, section_key, type, enabled, display_order, content, layout, style, created_at, updated_at")
    .eq("page_key", "global")
    .eq("section_key", "site-footer")
    .maybeSingle()

  if (error) {
    console.error("Supabase footer section fetch failed:", error.message)
    return footerSectionFallback
  }

  if (!data) {
    return footerSectionFallback
  }

  return normalizeFooterSection(data) ?? footerSectionFallback
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return {}
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("brand_name, instagram_url, whatsapp_url, studio_address, studio_hours, artist_name, artist_years")
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
    instagramUrl: data.instagram_url ?? undefined,
    whatsappUrl: data.whatsapp_url ?? undefined,
    studioAddress: data.studio_address ?? undefined,
    studioHours: data.studio_hours ?? undefined,
    artistName: data.artist_name ?? undefined,
    artistYears: data.artist_years ?? undefined,
  }
}
