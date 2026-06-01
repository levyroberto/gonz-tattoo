import type { FlashDesign } from "@/data/flash-designs"
import type { HomeSection } from "@/data/home-sections"
import type { Tattoo } from "@/data/tattoos"

function parseFilterTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

export function matchesTags(itemTags: string[] | undefined, filterTags: string) {
  const selectedTags = parseFilterTags(filterTags)

  if (selectedTags.length === 0) {
    return true
  }

  const normalizedTags = (itemTags ?? []).map((tag) => tag.toLowerCase())

  return selectedTags.some((tag) => normalizedTags.includes(tag))
}

export function filterPortfolioItems(items: Tattoo[], section: Extract<HomeSection, { type: "featuredPortfolio" }>) {
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

export function filterFlashDesigns(items: FlashDesign[], section: Extract<HomeSection, { type: "flashPreview" }>) {
  return items
    .filter((item) => !section.content.filterStyle || item.style.toLowerCase() === section.content.filterStyle.toLowerCase())
    .filter((item) => matchesTags(item.tags, section.content.filterTags))
    .slice(0, section.content.limit)
}
