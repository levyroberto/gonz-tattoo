import type { TattooArtwork, SaleableArtwork, ArtworkStatus } from "@/data/artworks"
import { footerSectionFallback } from "@/data/global-sections"
import type { FooterSection } from "@/data/global-sections"
import { getEnabledHomeSections, getHomeSectionFallback, getHomeSectionsFallback, getHomeSectionTemplate } from "@/data/home-sections"
import type { HomeSection } from "@/data/home-sections"
import { getPageSectionFallback, getPageSectionsFallback, type EditablePageKey, type PageSection } from "@/data/page-sections"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Database, Json } from "@/lib/supabase/database.types"

// Backward-compat aliases so page.tsx and other callers keep working
type Tattoo = TattooArtwork
type FlashDesign = SaleableArtwork

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

type ArtworkRow = {
  id: number
  type: string
  title: string
  image_url: string
  tags: string[]
  is_active: boolean
  display_order: number
  // tattoo-only
  description?: string | null
  style?: string | null
  published_date?: string | null
  is_featured?: boolean | null
  // saleable-only
  price?: number | null
  status?: string | null
  dimensions?: string | null
  material?: string | null
}

function normalizeArtworkStatus(status: string | null | undefined): ArtworkStatus {
  const s = (status ?? "").trim().toLowerCase()

  if (s === "reservado") return "Reservado"
  if (s === "reclamado") return "Reclamado"

  return "Disponible"
}

function mapArtworkRowToTattoo(row: ArtworkRow): Tattoo {
  return {
    id: row.id,
    type: "tattoo",
    title: row.title,
    image: row.image_url,
    tags: row.tags ?? [],
    isActive: row.is_active,
    isFeatured: row.is_featured ?? false,
    displayOrder: row.display_order,
    style: row.style ?? undefined,
    description: row.description ?? undefined,
    publishedDate: row.published_date ?? undefined,
  }
}

function mapArtworkRowToSaleable(row: ArtworkRow): FlashDesign {
  const type = row.type as FlashDesign["type"]

  return {
    id: row.id,
    type,
    title: row.title,
    image: row.image_url,
    tags: row.tags ?? [],
    isActive: row.is_active,
    displayOrder: row.display_order,
    price: row.price ?? 0,
    status: normalizeArtworkStatus(row.status),
    style: row.style ?? undefined,
    dimensions: row.dimensions ?? undefined,
    material: row.material ?? undefined,
  }
}

async function countArtworksByType(type: "tattoo" | "flash") {
  const supabase = createSupabaseServerClient()

  if (!supabase) return null

  const { count, error } = await supabase
    .from("artworks")
    .select("*", { count: "exact", head: true })
    .eq("type", type)

  if (error) {
    console.error(`Supabase count failed for artworks/${type}:`, error.message)
    return null
  }

  return count ?? 0
}

async function countContactRequests() {
  const supabase = createSupabaseServerClient()

  if (!supabase) return null

  const { count, error } = await supabase
    .from("contact_requests")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Supabase count failed for contact_requests:", error.message)
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
    countArtworksByType("tattoo"),
    countArtworksByType("flash"),
    countContactRequests(),
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
  const rows = await fetchArtworkRows("tattoo", true)

  return (rows ?? []).map(mapArtworkRowToTattoo)
}

export async function getAdminPortfolioItems(): Promise<Tattoo[]> {
  const rows = await fetchArtworkRows("tattoo", false)

  return (rows ?? []).map(mapArtworkRowToTattoo)
}

async function fetchArtworkRows(type: "tattoo" | "flash" | "sculpture" | "painting", onlyActive: boolean) {
  const supabase = createSupabaseServerClient()

  if (!supabase) return null

  let query = supabase
    .from("artworks")
    .select("id, type, title, image_url, tags, is_active, display_order, description, style, published_date, is_featured, price, status, dimensions, material")
    .eq("type", type)
    .order("display_order", { ascending: true })

  if (onlyActive) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Supabase artworks fetch failed (${type}):`, error.message)
    return null
  }

  return (data ?? []) as unknown as ArtworkRow[]
}

export async function getFeaturedPortfolioItems(): Promise<Tattoo[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from("artworks")
    .select("id, type, title, image_url, tags, is_active, display_order, description, style, published_date, is_featured, price, status, dimensions, material")
    .eq("type", "tattoo")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("published_date", { ascending: false })
    .order("display_order", { ascending: true })
    .limit(4)

  if (error) {
    console.error("Supabase featured portfolio fetch failed:", error.message)
    return []
  }

  return (data ?? []).map((row) => mapArtworkRowToTattoo(row as unknown as ArtworkRow))
}

export async function getFlashDesigns(): Promise<FlashDesign[]> {
  const rows = await fetchArtworkRows("flash", true)

  return (rows ?? []).map(mapArtworkRowToSaleable)
}

export async function getAdminFlashDesigns(): Promise<FlashDesign[]> {
  const rows = await fetchArtworkRows("flash", false)

  return (rows ?? []).map(mapArtworkRowToSaleable)
}

export async function getFeaturedFlashDesigns(): Promise<FlashDesign[]> {
  const designs = await getFlashDesigns()

  return designs.slice(0, 6)
}

export async function getSaleableArtworks(types?: Array<"flash" | "sculpture" | "painting">): Promise<FlashDesign[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  const targetTypes = types ?? ["flash", "sculpture", "painting"]
  const { data, error } = await supabase
    .from("artworks")
    .select("id, type, title, image_url, tags, is_active, display_order, price, status, style, dimensions, material")
    .in("type", targetTypes)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Supabase saleable artworks fetch failed:", error.message)
    return []
  }

  return (data ?? []).map((row) => mapArtworkRowToSaleable(row as unknown as ArtworkRow))
}

export async function getAdminSaleableArtworks(types?: Array<"flash" | "sculpture" | "painting">): Promise<FlashDesign[]> {
  const supabase = createSupabaseServerClient()

  if (!supabase) {
    return []
  }

  const targetTypes = types ?? ["flash", "sculpture", "painting"]
  const { data, error } = await supabase
    .from("artworks")
    .select("id, type, title, image_url, tags, is_active, display_order, price, status, style, dimensions, material")
    .in("type", targetTypes)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Supabase admin saleable artworks fetch failed:", error.message)
    return []
  }

  return (data ?? []).map((row) => mapArtworkRowToSaleable(row as unknown as ArtworkRow))
}

export async function getAdminDashboardContent() {
  const [stats, portfolioItems, flashItems, tattooStyles, settings, homeSections, pageSections, footer] = await Promise.all([
    getAdminContentStats(),
    getAdminPortfolioItems(),
    getAdminSaleableArtworks(),
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

/**
 * Devuelve la URL de la imagen usada en la sección "Sobre mí" de la home.
 * La imagen vive actualmente en site_sections (page_key="contact", section_key="contact-main").
 * Si en el futuro se migra al about home section, actualizar solo esta función.
 */
export async function getAboutImage(): Promise<string> {
  const contactSection = await getPageSection("contact")

  return contactSection.type === "contactPage" ? contactSection.style.image : ""
}
