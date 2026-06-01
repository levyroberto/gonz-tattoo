import type { FlashDesign } from "@/data/flash-designs"
import type { HomeSection } from "@/data/home-sections"
import type { Tattoo } from "@/data/tattoos"
import type { SiteSettings } from "@/lib/supabase/content"

import { AboutSection } from "./about-section"
import { ContactCTA } from "./contact-cta"
import { FeaturedTattoos } from "./featured-tattoos"
import { FlashDesignsPreview } from "./flash-designs-preview"
import { HeroSection } from "./hero-section"

type HomeSectionRendererProps = {
  section: HomeSection
  flashDesigns: FlashDesign[]
  portfolioItems: Tattoo[]
  settings: SiteSettings
}

function parseFilterTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

function matchesTags(itemTags: string[] | undefined, filterTags: string) {
  const selectedTags = parseFilterTags(filterTags)

  if (selectedTags.length === 0) {
    return true
  }

  const normalizedTags = (itemTags ?? []).map((tag) => tag.toLowerCase())

  return selectedTags.some((tag) => normalizedTags.includes(tag))
}

function filterPortfolioItems(items: Tattoo[], section: Extract<HomeSection, { type: "featuredPortfolio" }>) {
  return items
    .filter((item) => !section.content.featuredOnly || item.isFeatured)
    .filter((item) => !section.content.filterStyle || item.style.toLowerCase() === section.content.filterStyle.toLowerCase())
    .filter((item) => matchesTags(item.tags, section.content.filterTags))
    .filter((item) => !section.content.dateFrom || (item.publishedDate ?? "") >= section.content.dateFrom)
    .filter((item) => !section.content.dateTo || (item.publishedDate ?? "") <= section.content.dateTo)
    .toSorted((firstItem, secondItem) => {
      const dateCompare = (secondItem.publishedDate ?? "").localeCompare(firstItem.publishedDate ?? "")

      return dateCompare || (firstItem.displayOrder ?? 0) - (secondItem.displayOrder ?? 0)
    })
    .slice(0, section.content.limit)
}

function filterFlashDesigns(items: FlashDesign[], section: Extract<HomeSection, { type: "flashPreview" }>) {
  return items
    .filter((item) => !section.content.filterStyle || item.style.toLowerCase() === section.content.filterStyle.toLowerCase())
    .filter((item) => matchesTags(item.tags, section.content.filterTags))
    .slice(0, section.content.limit)
}

export function HomeSectionRenderer({
  section,
  flashDesigns,
  portfolioItems,
  settings,
}: HomeSectionRendererProps) {
  switch (section.type) {
    case "hero":
      return <HeroSection content={section.content} layout={section.layout} style={section.style} />
    case "featuredPortfolio":
      return <FeaturedTattoos tattoos={filterPortfolioItems(portfolioItems, section)} content={section.content} layout={section.layout} style={section.style} />
    case "flashPreview":
      return <FlashDesignsPreview designs={filterFlashDesigns(flashDesigns, section)} content={section.content} layout={section.layout} style={section.style} />
    case "about":
      return <AboutSection settings={settings} content={section.content} layout={section.layout} style={section.style} />
    case "contactCta":
      return <ContactCTA settings={settings} content={section.content} layout={section.layout} style={section.style} />
    default:
      return null
  }
}
